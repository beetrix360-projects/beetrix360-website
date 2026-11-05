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
function boot(){gauge();typing();prog();slots()}
function prog(){const h=document.documentElement,x=Math.min(1,scrollY/Math.max(1,h.scrollHeight-innerHeight));const b=$(".bar i");if(b)b.style.transform="scaleX("+x+")";$$(".spine .pz").forEach((e,i)=>e.classList.toggle("lit",x>=i*.25+.02))}
addEventListener("scroll",prog,{passive:true});
document.addEventListener("pointermove",e=>{const t=e.target.closest&&e.target.closest(".tile,.hero");if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty("--x",e.clientX-r.left+"px");t.style.setProperty("--y",e.clientY-r.top+"px")},{passive:true});
document.addEventListener("input",e=>{if(e.target.id==="faq-q"){const q=e.target.value.toLowerCase().trim();let n=0;$$("[data-q]").forEach(d=>{const m=!q||d.textContent.toLowerCase().includes(q);d.hidden=!m;if(m){n++;if(q)d.open=true}});$("[data-none]").hidden=n>0;$("[data-faqn]").textContent=n+(n===1?" question":" questions")}});
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
