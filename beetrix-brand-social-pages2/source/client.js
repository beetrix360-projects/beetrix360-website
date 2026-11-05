(function(){const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;let cur=null,timer=null;
const curPage=()=>PAGES.find(x=>x.id===cur)||PAGES[0];
function closeNav(){$("#mega")?.classList.remove("open");$(".nb.on")?.setAttribute("aria-expanded","false");$("#nav")?.classList.remove("open");$(".burger")?.setAttribute("aria-expanded","false")}
function setMeta(p){document.title=p.title;let l=$("#bx-ld");if(l)l.textContent=JSON.stringify(schema(p));}
function goTo(id,sc){const p=PAGES.find(x=>x.id===id);if(!p)return;cur=id;$("#app").innerHTML=page(p);setMeta(p);boot();if(sc)scrollTo(0,0)}
function typing(){clearInterval(timer);const el=$("[data-typed]");if(!el||reduce)return;const qs=curPage().q;let q=0,i=qs[0].length,del=false,hold=26;
timer=setInterval(()=>{if(hold>0){hold--;return}const s=qs[q];if(del){i--;if(i<=0){del=false;q=(q+1)%qs.length}}else{i++;if(i>=qs[q].length){del=true;hold=30}}el.textContent=(del||i>0?qs[q]:s).slice(0,i)},45)}
function gauge(){const on=$$(".sw input:checked").length,t=$$(".sw input").length||6,v=Math.round(on/t*100),gv=$("[data-gv]");if(!gv)return;gv.style.strokeDashoffset=327*(1-v/100);$("[data-gn]").textContent=v;
$("[data-gm]").textContent=v<40?"Big gaps, big upside. Start with the foundations.":v<80?"Solid base. A few missing pieces are holding you back.":"Strong setup. Let's find the next gain."}
function brief(){const c=$$("[data-chip][aria-pressed=true]").map(x=>x.textContent),tr=$("[data-tray]");if(!tr)return;tr.hidden=!c.length;$("[data-traytext]").textContent=c.length+(c.length===1?" topic":" topics")+" added to your brief";$("#f-m").value=c.length?"Topics: "+c.join(", "):""}
function pick(f){const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>{const u=i.files[0]&&URL.createObjectURL(i.files[0]);if(!u)return;const m=new Image();m.src=u;m.alt=f.dataset.alt;f.classList.add("has");f.replaceChildren(m)};i.click()}
function slots(){if(!window.BX_PREVIEW)return;$$("figure.imgs[data-slot]").forEach(f=>{f.tabIndex=0;f.setAttribute("role","button");f.setAttribute("aria-label","Preview an image here: "+f.dataset.slot);const l=document.createElement("span");l.className="il3";l.textContent="Click to try an image";f.append(l)})}
window.BX_LOGO=window.BX_LOGO||{};
function paint(){$$("[data-brand]").forEach(e=>{const u=BX_LOGO[e.dataset.brand];if(u)e.innerHTML=`<img src="${u}" alt="${BN[e.dataset.brand]} logo">`})}
let io=null,si=0;
function watch(){if(io)io.disconnect();if(!("IntersectionObserver" in window))return;io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;en.target.querySelectorAll(".stk").forEach(s=>{s.classList.remove("in");void s.offsetWidth;s.classList.add("in")});const sp=$("[data-spine]");if(sp&&en.target.id){const bs=brandsOf(curPage());sp.innerHTML=mark(bs[si++%bs.length]);paint();sp.classList.remove("in");void sp.offsetWidth;sp.classList.add("in")}}),{threshold:.2});$$(".sec").forEach(s=>io.observe(s))}
function tray(){if(!window.BX_PREVIEW||!$(".onp"))return;const bs=brandsOf(curPage()),d=document.createElement("span");d.className="lgt";d.innerHTML=bs.map(b=>`<button data-up="${b}">Try ${BN[b]} logo file</button>`).join("");$(".onp").append(d)}
const MX={"111":["The Challenger","Loud ideas, sharp edges, no apologies.",["#E0225B","#EBB22D","#070913"]],"110":["The Showman","Big color with a classic grin.",["#EBB22D","#E0225B","#FFFFFF"]],"101":["The Disruptor","Serious work with a bold new look.",["#39C5EF","#070913","#E0225B"]],"100":["The Authority","Heavy, confident and built to last.",["#070913","#EBB22D","#FFFFFF"]],"011":["The Friend","Warm, light and easy to talk to.",["#2FB77E","#EBB22D","#FFFFFF"]],"010":["The Storyteller","Gentle charm with a timeless feel.",["#EBB22D","#2FB77E","#070913"]],"001":["The Specialist","Quiet precision and clean lines.",["#39C5EF","#FFFFFF","#070913"]],"000":["The Trusted Advisor","Calm, steady and proven.",["#2FB77E","#070913","#FFFFFF"]]};
function mix(){const g=i=>{const e=$("#x-"+i);return e?+e.value:50},b=$("[data-mix]");if(!b)return;const k=(g("e")>50?"1":"0")+(g("t")>50?"1":"0")+(g("a")>50?"1":"0"),m=MX[k];$("[data-mn]").textContent=m[0];$("[data-mt]").textContent=m[1];$("[data-ms]").innerHTML=m[2].map(c=>`<i style="background:${c}"></i><small>${c}</small>`).join("");b.style.setProperty("--mc",m[2][0]);b.style.setProperty("--mw",400+g("e")*4);b.style.setProperty("--mr",(g("t")/100*32)+"px");b.style.setProperty("--mf",g("a")>50?"var(--disp)":"var(--ser)")}
const BT="h1,.lead,.dom,.stage,.hr>.imgs,.onp,.logos .imgs,.sh h2,.sub,.prose>*,.band,.flip,.tile,.sw,.gauge,.mixc,.rg,.ph,.safe,.row,.card,.il button,.ip,details,.srch,.rel a,.lead-f,.final h2,.pair .imgs,.cw>.imgs,.fs>.imgs";
const SW={c:[],q:[],sels:[],io:null,intro:false,hov:null,mx:-999,my:-999,on:false};
function mkc(i){const cols=["#e0225b","#39c5ef","#2fb77e","#ebb22d","#070913"],col=cols[i%5],roles=ROLES[curPage().col]||ROLES.brand,e=document.createElement("div");e.className="cur";e.innerHTML=`<svg viewBox="0 0 16 16"><path d="M1 1l5.2 14 2.2-5.8L14.5 7z" fill="${col}" stroke="#fff" stroke-width=".9"/></svg>${i<4?`<span style="background:${col}" data-role="${i}">${roles[i]}</span>`:""}`;$("#swarm").append(e);const a=Math.random()*6.28,R=Math.max(innerWidth,innerHeight);return{e,x:innerWidth/2+Math.cos(a)*R,y:innerHeight/2+Math.sin(a)*R,vx:0,vy:0,lock:null,ox:0,oy:0,ph:Math.random()*6.28,sp:.5+Math.random(),hx:Math.random(),hy:Math.random()}}
const ROLES={brand:["Strategist","Designer","Copywriter","Art director"],social:["Social lead","Creator","Editor","Community"],content:["Writer","Editor","Designer","Motion"]};
function swarmInit(){if(reduce||$("#swarm"))return;const w=document.createElement("div");w.id="swarm";w.setAttribute("aria-hidden","true");w.innerHTML=`<div class="core">${LOGO("mark")}</div>`;document.body.append(w);const n=innerWidth<760?12:26;for(let i=0;i<n;i++)SW.c.push(mkc(i));SW.on=true;requestAnimationFrame(tick);setInterval(pump,70);
addEventListener("pointermove",e=>{SW.mx=e.clientX;SW.my=e.clientY;const m=$("[data-rm]");if(m)m.style.transform=`translateX(${e.clientX}px)`;const t=$("[data-xy]");if(t)t.textContent=`x ${Math.round(e.clientX)}  y ${Math.round(e.clientY+scrollY)}`},{passive:true})}
function tick(ts){const t=ts/1000,W=innerWidth,H=innerHeight;SW.c.forEach(c=>{let tx,ty,k=.018;if(SW.intro){const a=t*2*c.sp+c.ph,r=70+30*Math.sin(t*3+c.ph);tx=W/2+Math.cos(a)*r*1.5;ty=H/2+Math.sin(a)*r;k=.04}else if(c.lock&&c.lock.isConnected){const r=c.lock.getBoundingClientRect();tx=r.left+r.width*c.ox;ty=r.top+r.height*c.oy;k=.05}else{const edge=c.hx<.5?c.hx*.24:1-(1-c.hx)*.24;tx=W*edge+Math.sin(t*c.sp+c.ph)*50;ty=H*(.12+c.hy*.8)+Math.cos(t*c.sp*.8+c.ph)*50;const d=Math.hypot(SW.mx-c.x,SW.my-c.y);if(d<260){tx=SW.mx+Math.cos(c.ph+t)*70;ty=SW.my+Math.sin(c.ph+t)*70;k=.03}}
c.vx=(c.vx+(tx-c.x)*k)*.84;c.vy=(c.vy+(ty-c.y)*k)*.84;c.x+=c.vx;c.y+=c.vy;c.e.style.transform=`translate3d(${c.x}px,${c.y}px,0) rotate(${Math.max(-40,Math.min(40,c.vx*2))}deg)`;c.e.style.opacity=c.lock||SW.intro?1:.55});
SW.sels.forEach(placeSel);requestAnimationFrame(tick)}
function placeSel(s){if(!s.el.isConnected)return;const r=s.el.getBoundingClientRect(),b=s.b;b.style.transform=`translate3d(${r.left-3}px,${r.top-3}px,0)`;b.style.width=r.width+6+"px";b.style.height=r.height+6+"px";s.l.textContent=`${Math.round(r.width)} × ${Math.round(r.height)}`}
function sel(el,g){const b=document.createElement("div");b.className="sel";b.innerHTML='<i></i><i></i><i></i><i></i><span></span>';$("#swarm").append(b);const s={el,b,l:b.querySelector("span")};placeSel(s);SW.sels.push(s);if(g){const r=el.getBoundingClientRect(),v=document.createElement("div");v.className="gl";v.style.left=r.left+"px";$("#swarm").append(v);setTimeout(()=>v.remove(),900)}return s}
function unsel(s){s.b.remove();SW.sels=SW.sels.filter(x=>x!==s)}
function grab(el,n){const free=SW.c.filter(c=>!c.lock).sort(()=>Math.random()-.5).slice(0,n);free.forEach((c,i)=>{c.lock=el;c.ox=[0,1,1,0,.5][i%5];c.oy=[0,0,1,1,.5][i%5]});return free}
function job(el){const cs=grab(el,3);setTimeout(()=>{el.classList.remove("pend");el.classList.add("wipe");const s=sel(el,/^H[12]$/.test(el.tagName));setTimeout(()=>{unsel(s);cs.forEach(c=>c.lock=null);el.classList.remove("wipe")},560)},190)}
function pump(){if(SW.intro)return;let n=SW.q.length>14?4:SW.q.length>6?2:1;while(n--&&SW.q.length)job(SW.q.shift())}
function pend(intro){if(reduce||!("IntersectionObserver" in window))return;if(SW.io)SW.io.disconnect();SW.q=[];SW.sels.forEach(s=>s.b.remove());SW.sels=[];SW.c.forEach(c=>c.lock=null);SW.io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){SW.io.unobserve(e.target);if(e.target.classList.contains("pend"))SW.q.push(e.target)}}),{threshold:.12});$$(BT).forEach(e=>{e.classList.add("pend");SW.io.observe(e)});const co=$(".core");if(intro&&co){SW.intro=true;co.classList.add("in");setTimeout(()=>{SW.intro=false;co.classList.remove("in")},1250)}}
function flush(){$$(".pend").forEach(e=>e.classList.remove("pend"));SW.q=[]}
function boot(){gauge();typing();prog();slots();mix();tray();paint();watch();if(!reduce){const first=!$("#swarm");swarmInit();const r=ROLES[curPage().col]||ROLES.brand;$$("[data-role]").forEach(e=>e.textContent=r[+e.dataset.role]);pend(first)}}
function prog(){const h=document.documentElement,x=Math.min(1,scrollY/Math.max(1,h.scrollHeight-innerHeight));const b=$(".bar i");if(b)b.style.transform="scaleX("+x+")";$$(".spine .pz").forEach((e,i)=>e.classList.toggle("lit",x>=i*.25+.02))}
addEventListener("scroll",prog,{passive:true});
const HV=".tile,.card,.flip,.ph,details,.imgs,.rel a,.gauge,.mixc,.row";
document.addEventListener("pointerover",e=>{if(e.pointerType!=="mouse"||reduce||!e.target.closest)return;const n=e.target.closest(HV);if(!n||n===SW.hov||n.classList.contains("pend"))return;if(SW.hs){unsel(SW.hs.s);SW.hs.cs.forEach(k=>k.lock=null)}SW.hov=n;SW.hs={s:sel(n),cs:grab(n,2)}});
document.addEventListener("pointerout",e=>{if(!SW.hs||!e.target.closest)return;const n=e.target.closest(HV);if(n&&n===SW.hov&&!n.contains(e.relatedTarget)){unsel(SW.hs.s);SW.hs.cs.forEach(k=>k.lock=null);SW.hs=null;SW.hov=null}});
document.addEventListener("pointermove",e=>{const t=e.target.closest&&e.target.closest(".tile,.hero");if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty("--x",e.clientX-r.left+"px");t.style.setProperty("--y",e.clientY-r.top+"px")},{passive:true});
document.addEventListener("input",e=>{if(e.target.matches("[data-x]")){mix();return}if(e.target.id==="faq-q"){const q=e.target.value.toLowerCase().trim();let n=0;$$("[data-q]").forEach(d=>{const m=!q||d.textContent.toLowerCase().includes(q);d.hidden=!m;if(m){n++;if(q)d.open=true}});$("[data-none]").hidden=n>0;$("[data-faqn]").textContent=n+(n===1?" question":" questions")}});
document.addEventListener("change",e=>{if(e.target.closest(".sw"))gauge()});
document.addEventListener("submit",e=>{e.preventDefault();const f=e.target;
if(f.matches("[data-dom]")){$("#f-w").value=f.domain.value;$("#start").scrollIntoView({behavior:reduce?"auto":"smooth"});$("#f-n").focus({preventScroll:true});return}
if(f.matches("[data-lead]")){const m=$("[data-msg]");if(!f.checkValidity()){const bad=f.querySelector(":invalid");m.textContent="Please complete "+(bad.labels[0].firstChild.textContent)+".";bad.focus();return}
const ep=window.BX_FORM_ENDPOINT;if(!ep){m.textContent="Preview only: connect BX_FORM_ENDPOINT to receive this lead. Nothing was sent.";return}
fetch(ep,{method:"POST",body:new FormData(f)}).then(r=>{if(!r.ok)throw 0;f.reset();m.textContent="You're in. We'll send your blueprint within 1 business day."}).catch(()=>{m.textContent="That didn't send. Please call "+TEL+"."})}});
document.addEventListener("click",e=>{const t=e.target,c=s=>t.closest(s);let n;
if(n=c(".burger")){const o=$("#nav").classList.toggle("open");n.setAttribute("aria-expanded",o);return}
if(n=c(".nb.on")){const o=$("#mega").classList.toggle("open");n.setAttribute("aria-expanded",o);return}
if(window.BX_PREVIEW&&(n=c("figure.imgs[data-slot]"))){pick(n);return}
if(n=c("[data-up]")){const b=n.dataset.up,i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>{if(i.files[0]){BX_LOGO[b]=URL.createObjectURL(i.files[0]);paint()}};i.click();return}
if(n=c("[data-rebuild]")){scrollTo(0,0);setTimeout(()=>pend(true),60);return}
if(n=c("[data-skip]")){flush();return}
if(SW.on&&(n=c(".btn.pri"))){SW.c.forEach((k,i)=>{k.lock=n;k.ox=Math.random();k.oy=Math.random()});setTimeout(()=>SW.c.forEach(k=>{if(k.lock===n)k.lock=null}),750)}
if(n=c("[data-page]")){if(window.BX_PREVIEW){e.preventDefault();location.hash=n.dataset.page}closeNav();return}
if(n=c("[data-eng]")){$$("[data-eng]").forEach(b=>b.setAttribute("aria-selected",b===n));const r=$("[data-res]");r.innerHTML=stage(curPage(),n.dataset.eng);r.classList.remove("pop");void r.offsetWidth;r.classList.add("pop");return}
if(n=c(".flip")){n.classList.toggle("on");n.setAttribute("aria-expanded",n.classList.contains("on"));return}
if(n=c(".tile")){const o=n.getAttribute("aria-pressed")!=="true";n.setAttribute("aria-pressed",o);$("[data-lock]").textContent=$$(".tile[aria-pressed=true]").length;return}
if(n=c("[data-chip]")){n.setAttribute("aria-pressed",n.getAttribute("aria-pressed")!=="true");brief();return}
if(n=c("[data-ph]")){$$("[data-ph]").forEach(b=>b.classList.toggle("on",b===n));$("[data-line]").style.setProperty("--st",n.dataset.ph);return}
if(n=c("[data-side]")){$("[data-cmp]").dataset.cmp=n.dataset.side;$$("[data-side]").forEach(b=>b.setAttribute("aria-pressed",b===n));return}
if(n=c("[data-f]")){$$("[data-f]").forEach(b=>b.setAttribute("aria-pressed",b===n));const f=n.dataset.f;$$(".card").forEach(k=>{k.hidden=!(f==="all"||k.dataset.k===f)});return}
if(n=c(".card")){const o=!n.classList.contains("open");$$(".card.open").forEach(k=>{k.classList.remove("open");k.setAttribute("aria-expanded","false")});if(o){n.classList.add("open");n.setAttribute("aria-expanded","true")}return}
if(n=c("[data-i]")){$$("[data-i]").forEach(b=>b.setAttribute("aria-selected",b===n));$$("[data-ip]").forEach(p=>p.classList.toggle("on",p.dataset.ip===n.dataset.i));return}
if(n=c("[data-goal]")){return}
if(!c("#nav"))closeNav();
if(n=c('a[href^="#"]')){const id=n.getAttribute("href").slice(1),el=document.getElementById(id);if(el){e.preventDefault();el.scrollIntoView({behavior:reduce?"auto":"smooth"});if(id==="start"){$("#f-n")?.focus({preventScroll:true})}}return}
if(window.BX_PREVIEW&&(n=c("a[href^='/']"))){e.preventDefault()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeNav();const f=e.target.closest&&e.target.closest("figure.imgs[data-slot]");if(f&&e.key==="Enter")pick(f)});
const route=()=>{const id=location.hash.slice(1);if(PAGES.some(x=>x.id===id)&&id!==cur)goTo(id,true)};
addEventListener("hashchange",route);
cur=window.BX_PAGE||PAGES[0].id;const h=location.hash.slice(1);if(window.BX_PREVIEW&&PAGES.some(x=>x.id===h))goTo(h);else boot();
})();
