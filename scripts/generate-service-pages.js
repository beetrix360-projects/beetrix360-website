const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.join(process.cwd(), 'Beetrix360-Service-Pages');
const outDir = path.join(process.cwd(), 'src', 'lib', 'service-pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const folders = [
  { id: '01', dir: '01-AI-Search-SEO', scopeClass: 'bx-sp-01' },
  { id: '02', dir: '02-Paid-Media', scopeClass: 'bx-sp-02' },
  { id: '03', dir: '03-Brand-Social', scopeClass: 'bx-sp-03' },
  { id: '04', dir: '04-AI-Content', scopeClass: 'bx-sp-04' },
  { id: '05', dir: '05-Web-Conversion', scopeClass: 'bx-sp-05' },
  { id: '06', dir: '06-AI-Automation', scopeClass: 'bx-sp-06' },
];

function scopeSingleSelector(sel, scopeDot) {
  if (!sel) return sel;
  let s = sel.trim();
  if (s === '*') return `${scopeDot}, ${scopeDot} *, ${scopeDot} *::before, ${scopeDot} *::after`;
  if (s === '*::before') return `${scopeDot}::before, ${scopeDot} *::before`;
  if (s === '*::after') return `${scopeDot}::after, ${scopeDot} *::after`;

  // Replace :root, html, body, #app at start of selector
  s = s.replace(/^(:root|html|body|#app)(?=$|[\s>+~.\[:])/, scopeDot);

  // If selector starts with [data-view=...], .intro, .nogl, or .pv (which client.js puts on documentElement / root)
  if (/^(\[data-view=[^\]]+\]|\.intro|\.nogl|\.pv)(?=$|[\s>+~.\[:])/.test(s)) {
    return `${scopeDot}${s}`;
  }

  if (s.startsWith(scopeDot)) {
    return s;
  }
  return `${scopeDot} ${s}`;
}

function scopeCss(css, scopeClass) {
  const scopeDot = '.' + scopeClass;
  // Remove comments and adjust 73px sticky/viewport offsets to 76px (matching fixed Navbar height)
  let clean = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/73px/g, '76px')
    .replace(/overflow-x:\s*hidden/g, 'overflow-x:clip');

  function processBlock(str) {
    let out = '';
    let i = 0;
    while (i < str.length) {
      while (i < str.length && /\s/.test(str[i])) {
        out += str[i++];
      }
      if (i >= str.length) break;

      if (str.startsWith('@keyframes', i) || str.startsWith('@-webkit-keyframes', i)) {
        const braceStart = str.indexOf('{', i);
        let depth = 0;
        let j = braceStart;
        for (; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}') {
            depth--;
            if (depth === 0) {
              j++;
              break;
            }
          }
        }
        out += str.slice(i, j);
        i = j;
      } else if (str.startsWith('@media', i) || str.startsWith('@supports', i)) {
        const braceStart = str.indexOf('{', i);
        const header = str.slice(i, braceStart + 1);
        let depth = 0;
        let j = braceStart;
        for (; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}') {
            depth--;
            if (depth === 0) {
              break;
            }
          }
        }
        const inner = str.slice(braceStart + 1, j);
        out += header + processBlock(inner) + '}';
        i = j + 1;
      } else {
        const braceStart = str.indexOf('{', i);
        if (braceStart === -1) {
          out += str.slice(i);
          break;
        }
        const selectorPart = str.slice(i, braceStart).trim();
        let depth = 0;
        let j = braceStart;
        for (; j < str.length; j++) {
          if (str[j] === '{') depth++;
          else if (str[j] === '}') {
            depth--;
            if (depth === 0) {
              j++;
              break;
            }
          }
        }
        const bodyPart = str.slice(braceStart, j);
        const selectors = [];
        let cur = '';
        let pDepth = 0;
        for (let k = 0; k < selectorPart.length; k++) {
          const ch = selectorPart[k];
          if (ch === '(') pDepth++;
          else if (ch === ')') pDepth = Math.max(0, pDepth - 1);
          if (ch === ',' && pDepth === 0) {
            selectors.push(cur.trim());
            cur = '';
          } else {
            cur += ch;
          }
        }
        if (cur.trim()) selectors.push(cur.trim());

        const scopedSelectors = selectors.map((s) => scopeSingleSelector(s, scopeDot));
        out += scopedSelectors.join(',') + bodyPart;
        i = j;
      }
    }
    return out;
  }

  const baseRules = `${scopeDot}{padding-top:76px;position:relative;overflow-x:clip;display:block}${scopeDot} .bx-sp-subbar{position:sticky;top:76px;z-index:44;background:var(--paper,#fff)}`;
  return baseRules + processBlock(clean);
}

function extractFontsUrl(buildJs) {
  const m = buildJs.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/);
  return m ? m[0] : '';
}

function transformRenderJs(renderJs, groupId) {
  // Replace siteHeader(p) with just the progress bar (and ruler for group 03)
  const subbarHtml =
    groupId === '03'
      ? '<div class="bx-sp-subbar"><div class="bar" aria-hidden="true"><i id="bar"></i></div><div class="rul" aria-hidden="true"><i data-rm></i><span data-xy>x 0  y 0</span></div></div>'
      : '<div class="bx-sp-subbar"><div class="bar" aria-hidden="true"><i id="bar"></i></div></div>';

  // Find function siteHeader(p){...} and replace it
  const shStart = renderJs.indexOf('function siteHeader(p)');
  if (shStart === -1) throw new Error('siteHeader not found in group ' + groupId);
  const shEndMarker = '<div class="bar" aria-hidden="true"><i></i></div>';
  const markerIdx = renderJs.indexOf(shEndMarker, shStart);
  if (markerIdx === -1) throw new Error('bar marker not found in siteHeader for group ' + groupId);
  const closeIdx = renderJs.indexOf('`}', markerIdx);
  if (closeIdx === -1) throw new Error('close of siteHeader not found for group ' + groupId);

  let modified =
    renderJs.slice(0, shStart) +
    `function siteHeader(p){return \`${subbarHtml}\`}` +
    renderJs.slice(closeIdx + 2);

  // Strip <footer class="foot">...</footer> inside function foot()
  modified = modified.replace(/<footer class="foot">[\s\S]*?<\/footer>/, '');

  return modified;
}

function transformClientJs(clientJs, groupId) {
  // Remove outer (function(){ and trailing })();
  let c = clientJs.trim();
  if (c.startsWith('(function(){')) c = c.slice('(function(){'.length);
  if (c.endsWith('})();')) c = c.slice(0, -'})();'.length);

  if (groupId === '03') {
    c = c.replace('{threshold:.12}', '{threshold:.01}');
    c = c.replace(
      'setTimeout(()=>{SW.intro=false;co.classList.remove("in")},1250)',
      'setTimeout(()=>{SW.intro=false;co.classList.remove("in");$$(BT).forEach(e=>{if(e.classList.contains("pend")&&!SW.q.includes(e)){const r=e.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)SW.q.push(e)}})},1250)'
    );
  }

  if (groupId === '06') {
    c = c.replace('wait.then(()=>{', 'wait.then(()=>{if(__disposed)return;');
  }

  return c;
}

for (const folder of folders) {
  const srcDir = path.join(baseDir, folder.dir, 'source');
  const buildJs = fs.readFileSync(path.join(srcDir, 'build.js'), 'utf8');
  const fontsUrl = extractFontsUrl(buildJs);

  const data1 = fs.readFileSync(path.join(srcDir, 'data1.js'), 'utf8');
  const data2 = fs.existsSync(path.join(srcDir, 'data2.js'))
    ? fs.readFileSync(path.join(srcDir, 'data2.js'), 'utf8')
    : '';
  const seoContent = fs.existsSync(path.join(srcDir, 'seo-content.js'))
    ? fs.readFileSync(path.join(srcDir, 'seo-content.js'), 'utf8')
    : '';
  const textContent = fs.existsSync(path.join(srcDir, 'text-content.js'))
    ? fs.readFileSync(path.join(srcDir, 'text-content.js'), 'utf8')
    : '';
  const rawRender = fs.readFileSync(path.join(srcDir, 'render.js'), 'utf8');
  const renderCode = transformRenderJs(rawRender, folder.id);

  const rawCss = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf8');
  const scopedCss = scopeCss(rawCss, folder.scopeClass);

  const rawClient = fs.readFileSync(path.join(srcDir, 'client.js'), 'utf8');
  const clientCode = transformClientJs(rawClient, folder.id);

  let extraThreeCode = '';
  if (fs.existsSync(path.join(srcDir, 'fox.js'))) {
    const rawFox = fs.readFileSync(path.join(srcDir, 'fox.js'), 'utf8');
    const bodyFox = rawFox.replace(/^(?:import\s+[^;]+;\s*)+/, '');
    extraThreeCode = `
      const __dynImport = new Function("u", "return import(u)");
      Promise.all([
        __dynImport("https://esm.sh/three@0.160.0"),
        __dynImport("https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js"),
        __dynImport("https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js")
      ]).then(([THREE_MOD, GLTF_MOD, ENV_MOD]) => {
        if (__disposed) return;
        const { GLTFLoader } = GLTF_MOD;
        const { RoomEnvironment } = ENV_MOD;
        const THREE = new Proxy(THREE_MOD, {
          get(target, prop) {
            if (prop === "WebGLRenderer") {
              return function(opts) {
                const r = new target.WebGLRenderer(opts);
                __renderers.push(r);
                return r;
              };
            }
            return target[prop];
          }
        });
        ${bodyFox}
      }).catch(() => {});
    `;
  } else if (fs.existsSync(path.join(srcDir, 'brain.js'))) {
    const rawBrain = fs.readFileSync(path.join(srcDir, 'brain.js'), 'utf8');
    const bodyBrain = rawBrain.replace(/^(?:import\s+[^;]+;\s*)+/, '');
    extraThreeCode = `
      const __dynImport = new Function("u", "return import(u)");
      __dynImport("https://esm.sh/three@0.160.0").then((THREE_MOD) => {
        if (__disposed) return;
        const THREE = new Proxy(THREE_MOD, {
          get(target, prop) {
            if (prop === "WebGLRenderer") {
              return function(opts) {
                const r = new target.WebGLRenderer(opts);
                __renderers.push(r);
                return r;
              };
            }
            return target[prop];
          }
        });
        ${bodyBrain}
      }).catch(() => {});
    `;
  }

  // Test executing the server render in VM to verify all pages in this group
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    `${data1}\n${data2}\n${seoContent}\n${textContent}\n${renderCode}\n;globalThis.__PAGES = PAGES; globalThis.__page = page; globalThis.__schema = schema;`,
    sandbox
  );

  for (const p of sandbox.__PAGES) {
    const html = sandbox.__page(p);
    const ld = sandbox.__schema(p);
    if (!html || !ld) throw new Error(`Failed rendering ${p.path}`);
    if (!html.includes('<main id="main">')) throw new Error(`Missing <main id="main"> on ${p.path}`);
    if (html.includes('<div class="wrap topin">')) throw new Error(`Header not stripped on ${p.path}`);
    if (html.includes('<footer class="foot">')) throw new Error(`Footer not stripped on ${p.path}`);
  }
  console.log(`Verified Group ${folder.id} (${folder.dir}): ${sandbox.__PAGES.length} pages rendered cleanly.`);

  // Write TypeScript module for this group
  const tsContent = `// @ts-nocheck
/* eslint-disable */
// Auto-generated from Beetrix360-Service-Pages/${folder.dir}/source — DO NOT EDIT MANUALLY

export const GROUP_ID = ${JSON.stringify(folder.id)};
export const SCOPE_CLASS = ${JSON.stringify(folder.scopeClass)};
export const FONTS_URL = ${JSON.stringify(fontsUrl)};
export const SCOPED_CSS = ${JSON.stringify(scopedCss)};

function createGroupRuntime() {
${data1}
${data2}
${seoContent}
${textContent}
${renderCode}

  function mountClient(root, pageId, navigate) {
    let __disposed = false;
    const __intervals = new Set();
    const __timeouts = new Set();
    const __rafs = new Set();
    const __observers = new Set();
    const __listeners = [];
    const __renderers = [];

    const setInterval = (fn, ms) => {
      if (__disposed) return 0;
      const id = window.setInterval(fn, ms);
      __intervals.add(id);
      return id;
    };
    const clearInterval = (id) => {
      __intervals.delete(id);
      window.clearInterval(id);
    };
    const setTimeout = (fn, ms) => {
      if (__disposed) return 0;
      const id = window.setTimeout(() => {
        __timeouts.delete(id);
        if (!__disposed) fn();
      }, ms);
      __timeouts.add(id);
      return id;
    };
    const clearTimeout = (id) => {
      __timeouts.delete(id);
      window.clearTimeout(id);
    };
    const requestAnimationFrame = (fn) => {
      if (__disposed) return 0;
      const id = window.requestAnimationFrame((ts) => {
        __rafs.delete(id);
        if (!__disposed) fn(ts);
      });
      __rafs.add(id);
      return id;
    };
    const cancelAnimationFrame = (id) => {
      __rafs.delete(id);
      window.cancelAnimationFrame(id);
    };

    const IntersectionObserver =
      typeof window !== "undefined" && "IntersectionObserver" in window
        ? function (cb, opts) {
            const obs = new window.IntersectionObserver((entries, o) => {
              if (!__disposed) cb(entries, o);
            }, opts);
            __observers.add(obs);
            return obs;
          }
        : undefined;

    const addEventListener = (type, fn, opts) => {
      if (type === "hashchange") return;
      window.addEventListener(type, fn, opts);
      __listeners.push([window, type, fn, opts]);
    };

    const docElementProxy = {
      get scrollHeight() {
        return window.document.documentElement.scrollHeight;
      },
      get clientHeight() {
        return window.document.documentElement.clientHeight;
      },
      get clientWidth() {
        return window.document.documentElement.clientWidth;
      },
      get classList() {
        return root.classList;
      },
      get dataset() {
        return root.dataset;
      },
      get animate() {
        return root.animate ? root.animate.bind(root) : undefined;
      },
    };

    const document = {
      querySelector: (s) => root.querySelector(s),
      querySelectorAll: (s) => root.querySelectorAll(s),
      getElementById: (id) => {
        try {
          return root.querySelector('[id="' + CSS.escape(id) + '"]') || window.document.getElementById(id);
        } catch {
          return window.document.getElementById(id);
        }
      },
      createElement: (tag) => window.document.createElement(tag),
      addEventListener: (type, fn, opts) => {
        const target = type === "keydown" ? window : root;
        target.addEventListener(type, fn, opts);
        __listeners.push([target, type, fn, opts]);
      },
      get readyState() {
        return "complete";
      },
      get fonts() {
        return window.document.fonts;
      },
      get title() {
        return window.document.title;
      },
      set title(v) {
        window.document.title = v;
      },
      body: {
        append: (...nodes) => root.append(...nodes),
        appendChild: (node) => root.appendChild(node),
      },
      documentElement: docElementProxy,
    };

    window.BX_PAGE = pageId;
    window.BX_PREVIEW = false;

    // Ensure clean DOM state before booting (handles React Strict Mode & soft navigation remounts)
    root.querySelectorAll("#swarm, .bu").forEach((el) => el.remove());
    root.querySelectorAll(".pend, .wipe").forEach((el) => el.classList.remove("pend", "wipe"));
    root.classList.remove("intro", "nogl", "pv");

    try {
      ${clientCode}
      ${extraThreeCode}
    } catch (err) {
      console.error("[ServicePageClient] Error mounting group ${folder.id}:", err);
    }

    // Intercept internal Next.js links inside root for smooth SPA navigation
    const handleInternalLink = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !root.contains(a)) return;
      if (a.target && a.target !== "_self") return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("/") && !href.startsWith("//")) {
        e.preventDefault();
        navigate(href);
      }
    };
    root.addEventListener("click", handleInternalLink);
    __listeners.push([root, "click", handleInternalLink, undefined]);

    return () => {
      __disposed = true;
      __intervals.forEach((id) => window.clearInterval(id));
      __intervals.clear();
      __timeouts.forEach((id) => window.clearTimeout(id));
      __timeouts.clear();
      __rafs.forEach((id) => window.cancelAnimationFrame(id));
      __rafs.clear();
      __observers.forEach((obs) => {
        try { obs.disconnect(); } catch {}
      });
      __observers.clear();
      __listeners.forEach(([t, type, fn, opts]) => {
        try { t.removeEventListener(type, fn, opts); } catch {}
      });
      __listeners.length = 0;
      __renderers.forEach((r) => {
        try { if (typeof r.setAnimationLoop === "function") r.setAnimationLoop(null); } catch {}
        try { r.dispose(); } catch {}
      });
      __renderers.length = 0;
      root.querySelectorAll("#swarm, .bu").forEach((el) => el.remove());
      root.querySelectorAll(".pend, .wipe").forEach((el) => el.classList.remove("pend", "wipe"));
      root.classList.remove("intro", "nogl", "pv");
    };
  }

  return {
    PAGES,
    renderPage: (pageId) => {
      const p = PAGES.find((x) => x.id === pageId) || PAGES[0];
      return page(p);
    },
    renderSchema: (pageId) => {
      const p = PAGES.find((x) => x.id === pageId) || PAGES[0];
      return schema(p);
    },
    mountClient,
  };
}

export const groupRuntime = createGroupRuntime();
`;

  fs.writeFileSync(path.join(outDir, `group-${folder.id}.ts`), tsContent, 'utf8');
}

console.log('Successfully generated group-01.ts through group-06.ts!');
