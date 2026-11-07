const fs=require('fs'),path=require('path');
const src=['data1.js','data2.js','seo-content.js','text-content.js','render.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const css=fs.readFileSync('style.css','utf8'),client=fs.readFileSync('client.js','utf8');
const R=new Function(src+';return{PAGES,page,schema,esc,SITE}')();
const F='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap">';
const INTRO='<script>if(document.documentElement.animate&&window.matchMedia&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro")</script>';
const ld=p=>JSON.stringify(R.schema(p)).replace(/</g,'\\u003c');
const first=R.PAGES.find(x=>x.id==="seo");
const prev=`<div id="app">${R.page(first)}</div><script type="application/ld+json" id="bx-ld">${ld(first)}</script><script>window.BX_PREVIEW=true;window.BX_PAGE="seo";window.BX_FORM_ENDPOINT="";</script><script>${src}</script><script>${client}</script>`;
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/beetrix-seo-template.fragment.html',`<title>Beetrix360 SEO Template</title><meta name="claude:viewport-fit-sides" content="cover">${F}<style>${css}</style>${prev}`);
fs.writeFileSync('dist/beetrix-seo-template.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Beetrix360 SEO Template</title><meta name="robots" content="noindex">${F}<style>${css}</style></head><body>${prev}</body></html>`);
for(const p of R.PAGES){const one=src.replace(/const PAGES=\[[\s\S]*?\n\];/,'const PAGES='+JSON.stringify([{id:p.id,short:p.short,col:p.col}])+';').replace(/const TEXT=\{[\s\S]*?\n\};/,'const TEXT={};');
const url=R.SITE+p.path,e=R.esc;
const h=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(p.title)}</title><meta name="description" content="${e(p.desc)}"><link rel="canonical" href="${url}"><meta property="og:title" content="${e(p.title)}"><meta property="og:description" content="${e(p.desc)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website">${F}<style>${css}</style><script type="application/ld+json">${ld(p)}</script></head><body><div id="app">${R.page(p)}</div><script>window.BX_PAGE="${p.id}";window.BX_FORM_ENDPOINT="";</script><script>${one}</script><script>${client}</script></body></html>`;
const out=path.join('dist/pages',p.path.slice(1),'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,h)}
console.log(R.PAGES.length,'pages');
