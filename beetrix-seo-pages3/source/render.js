const SITE="https://www.beetrix360.com",TEL="+1 (424) 441-6042";
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const T=(s,p)=>s.replace(/\{s\}/g,p.short).replace(/\{k\}/g,p.kw);
const LOGO=c=>`<svg class="${c||""}" viewBox="0 0 100 100" aria-hidden="true"><path class="pz p1" d="M12,18 C12,13.5 15.5,10 20,10 L46,10 L46,23 C51,21 56,25 56,30 C56,35 51,39 46,37 L46,48 L35,48 C35,42 29,39 25,42 C21,45 23,48 23,48 L12,48 Z"/><path class="pz p2" d="M52,10 L78,10 C82.5,10 86,13.5 86,18 L86,44 L73,44 C73,50 64,50 64,44 L52,44 L52,35 C58,35 58,25 52,25 Z"/><path class="pz p3" d="M50,52 L64,52 C64,58 73,58 73,52 L86,52 L86,80 C86,84.5 82.5,88 78,88 L50,88 L50,75 C44,75 44,65 50,65 Z"/><path class="pz p4" d="M12,52 L24,52 C24,46 33,46 33,52 L46,52 L46,65 C40,65 40,75 46,75 L46,88 L20,88 C15.5,88 12,84.5 12,80 Z"/></svg>`;
const ARROW=`<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
const cta=(label,cls,goal)=>`<a class="btn ${cls||"pri"}" href="#start"${goal?` data-goal="${esc(goal)}"`:""}><span>${esc(label)}</span>${ARROW}</a>`;
const head=(eye,h,sub)=>`<header class="sh"><p class="eye">${esc(eye)}</p><h2>${h}</h2>${sub?`<p class="sub">${sub}</p>`:""}</header>`;

/* IMAGES: add real files here, then run build. Key "page-id:slot" for one page, or "slot" for all pages. */
const IMAGES={};
let SLOTN=0;
function img(p,slot,w,h,what,alt,tag){tag=tag||"figure";const src=IMAGES[p.id+":"+slot]||IMAGES[slot],n=SLOTN++%4;
if(src)return `<${tag} class="imgs has" style="--ar:${w}/${h}"><img src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy"></${tag}>`;
return `<${tag} class="imgs v${n}" style="--ar:${w}/${h}" data-slot="${esc(slot)}" data-alt="${esc(alt)}"><span class="il1">${esc(what)}</span><span class="il2">${w} × ${h}</span></${tag}>`}
const EXP=[["Our Results","/results"],["Case Studies","/case-studies"],["Our AI Search Approach","/about/our-approach/ai-search"]];
const TOP=[["Paid Media","/paid-media"],["Brand & Social","/digital-marketing"],["AI Content","/ai-content"],["Web & Conversion","/web-design"],["AI & Automation","/ai"],["Company","/about"]];
const lk=(x,cur)=>`<a href="${x.path}" data-page="${x.id}"${x.id===cur?' aria-current="page"':""}>${esc(x.name)}</a>`;
function siteHeader(p){const c=k=>PAGES.filter(x=>x.col===k).map(x=>lk(x,p.id)).join("");
return `<a class="skip" href="#main">Skip to content</a><div class="top"><div class="wrap topin"><a class="brand" href="/" aria-label="Beetrix360 home">${LOGO("mark")}<span>Beetrix<b>360</b></span></a>
<button class="burger" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><i></i><i></i><i></i></button>
<nav id="nav" class="nav" aria-label="Main"><div class="ni has"><button class="nb on" aria-expanded="false" aria-controls="mega">AI Search &amp; SEO<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5l4 4 4-4"/></svg></button>
<div class="mega" id="mega"><div class="mcol"><a class="mh" href="/seo" data-page="seo">Search Engine Optimization ›</a>${c("seo")}</div><div class="mcol"><p class="mh">AI Search Visibility</p>${c("ai")}</div><div class="mcol"><p class="mh">Strategy &amp; Enterprise</p>${c("str")}</div><div class="mcol"><p class="mh">Expertise</p>${EXP.map(e=>`<a href="${e[1]}">${e[0]}</a>`).join("")}</div>
<a class="mpromo" href="/case-studies"><strong>+586%</strong><span>traffic from AI sources</span><em>Read the case study ${ARROW}</em></a></div></div>
${TOP.map(t=>`<div class="ni"><a class="nb" href="${t[1]}">${esc(t[0])}</a></div>`).join("")}<a class="btn pri sm" href="#start"><span>Get a Proposal</span>${ARROW}</a></nav></div><div class="bar" aria-hidden="true"><i></i></div></div>`}

const ENG=[["google","Google"],["overview","AI Overview"],["chatgpt","ChatGPT"],["perplexity","Perplexity"]];
function stage(p,t){const q=p.q[0],you="YourBrand.com";
if(t==="google")return `<ol class="serp"><li class="win"><small>${you} › services</small><b>${esc(p.short)} that drives pipeline</b><span>Rank 1 for a buying-intent search</span></li><li><small>rival-one.com</small><b>A competitor's page</b></li><li><small>rival-two.com</small><b>Another competitor's page</b></li></ol>`;
if(t==="overview")return `<div class="ans"><p class="tag">AI Overview</p><p>${esc(p.answer.split(". ")[0])}. <mark>${you}</mark> is listed among the providers.</p><p class="cite">Source: ${you}</p></div>`;
if(t==="chatgpt")return `<div class="ans chat"><p class="me">${esc(q)}</p><p>Top recommendation: <mark>${you}</mark>, for its specialist work in ${esc(p.short)} and published proof.</p></div>`;
return `<div class="ans"><p>Several providers fit. <mark>${you}</mark><sup>1</sup> stands out for clear pricing and documented results.<sup>2</sup></p><p class="cite">1. ${you}  ·  2. Trusted review site</p></div>`}
function hero(p){const pr=p.id==="seo"?"":`<li><a href="/seo">AI Search &amp; SEO</a></li>`;
return `<section class="hero" id="top"><div class="wrap hg"><div class="hl"><ol class="crumb"><li><a href="/">Home</a></li>${pr}<li aria-current="page">${esc(p.short)}</li></ol>
<h1>${esc(p.h1[0])} <em>${esc(p.h1[1])}</em> ${esc(p.h1[2])}</h1><p class="lead">${esc(p.lead)}</p>
<form class="dom" data-dom><label for="dom-in">Your website</label><input id="dom-in" name="domain" type="text" inputmode="url" autocomplete="url" placeholder="yourdomain.com"><button class="btn pri" type="submit"><span>Run my free AI audit</span>${ARROW}</button></form>
<p class="tiny">Free. A strategist reviews it personally. Or call <a href="tel:+14244416042">${TEL}</a></p></div>
<div class="hr"><div class="stage" data-stage><div class="sbar"><span class="dot"></span><span class="typed" data-typed>${esc(p.q[0])}</span><i class="caret"></i></div>
<div class="tabs" role="tablist" aria-label="Search engines">${ENG.map((e,i)=>`<button role="tab" aria-selected="${i===0}" data-eng="${e[0]}">${e[1]}</button>`).join("")}</div>
<div class="sres" data-res>${stage(p,"google")}</div><p class="ill">Illustration of the goal. Not a live search result.</p></div>${img(p,"hero",1000,420,"Client dashboard or team at work",`${p.short} results dashboard from Beetrix360`)}</div></div></section>
<div class="proof" aria-label="Headline results"><div class="track">${Array(2).fill(["$10B+ pipeline generated","24.8M leads processed","55+ industries","+586% traffic from AI sources","+116% share of voice vs. top rival","Tesla Solar +40%","Microsoft +30%","Subway +25%"].map(x=>`<span>${x}</span>`).join("")).join("")}</div></div><div class="logos wrap" aria-label="Client logos">${["Tesla Solar","Microsoft","Subway","Damac"].map((n,i)=>img(p,"logo-"+(i+1),240,80,n+" logo",n+" logo")).join("")}</div>`}

function guide(p){return `<section class="sec" id="guide"><div class="wrap gd"><aside class="toc" aria-label="On this page"><p class="eye">On this page</p>${[["guide","What it is"],["fixes","Problems we fix"],["included","What's included"],["score","Check your score"],["rollout","90-day rollout"],["work","Past work"],["faq","FAQs"]].map(x=>`<a href="#${x[0]}">${x[1]}</a>`).join("")}${cta("Book a 30-minute call","ghost sm")}</aside>
<div class="prose"><h2>What is ${esc(p.short==="SEO Services"?"SEO":p.short)}?</h2><p class="snip" data-answer>${esc(p.answer)}</p>${img(p,"explainer",1200,630,`Diagram: how ${p.short} works`,`Diagram showing how ${p.short} works`)}
${p.para.map(x=>`<p>${esc(x)}</p>`).join("")}${p.deep.map((d,i)=>`<h3>${esc(d[0])}</h3><p>${esc(d[1])}</p>${img(p,"guide-"+(i+1),1000,520,"Screenshot or chart: "+d[0],d[0])}`).join("")}
<h3>Related topics we cover</h3><p class="hint">Tap the topics you care about. We'll add them to your brief.</p><div class="chips">${p.kws.map(k=>`<button class="chip" aria-pressed="false" data-chip>${esc(k)}</button>`).join("")}</div>
<div class="tray" data-tray hidden><span data-traytext></span>${cta("Send this to a strategist","pri sm")}</div></div></div></section>`}

function fixes(p){return `<section class="sec tint" id="fixes"><div class="wrap">${head("Sound familiar?",`Four signs your ${esc(p.short)} is leaking revenue`,"Hover or tap a card to see the fix.")}
<div class="flips">${p.pains.map((x,i)=>`<button class="flip c${i}" aria-expanded="false"><span class="f"><i>Symptom</i><b>${esc(x[0])}</b></span><span class="b"><i>The fix</i><b>${esc(x[1])}</b></span></button>`).join("")}</div>
<div class="pair">${img(p,"before",800,500,"Before: the problem in your data",`Before ${p.short} work`)}${img(p,"after",800,500,"After: the result of the fix",`After ${p.short} work`)}</div><div class="band"><p>Recognize one of these? Each one is quietly costing you deals.</p>${cta("Diagnose my site for free","pri")}</div></div></section>`}

function included(p){return `<section class="sec dark" id="included"><div class="wrap">${head("What's included",`Everything in our ${esc(p.kw)}`,`Six parts, one system. Move across a card to light it up, or tap to lock it in.`)}
<div class="bento">${p.items.map((x,i)=>`<button class="tile t${i}" aria-pressed="false">${img(p,"item-"+(i+1),640,300,x[0],x[0]+" for "+p.short,"span")}<b>${esc(x[0])}</b><span>${esc(x[1])}</span></button>`).join("")}</div>
<div class="band inv"><p><span data-lock>0</span> of 6 selected for your plan</p>${cta(`Build my ${p.short} plan`,"pri")}</div></div></section>`}

function score(p){return `<section class="sec" id="score"><div class="wrap sg"><div>${head("Self-check",`How ready is your ${esc(p.short)}?`,"Switch on what you already have in place. The first two are examples, so change them to match your site.")}
<div class="tog">${p.items.map((x,i)=>`<label class="sw"><input id="sw-${i}" type="checkbox"${i<2?" checked":""}><i></i><span>${esc(x[0])}</span></label>`).join("")}</div>${img(p,"report",1000,440,"Sample audit report",`Sample ${p.short} audit report`)}</div>
<div class="gauge"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="gt"/><circle cx="60" cy="60" r="52" class="gv" data-gv/></svg><p class="gn"><span data-gn>33</span><small>/100</small></p><p class="gm" data-gm></p>${cta("Close my gaps","pri")}<p class="tiny">A quick self-check, not a formal audit.</p></div></div></section>`}

const PH=[["Audit","Days 1–14"],["Build","Days 15–30"],["Activate","Days 31–60"],["Scale","Days 61–90+"]];
function rollout(p){return `<section class="sec tint" id="rollout"><div class="wrap">${head("Rollout",`Your ${esc(p.short)} live in 90 days`,"A fixed, four-phase plan. You see progress every week. Click a phase.")}
<div class="line" data-line style="--st:0"><div class="rail"><i></i></div><ol>${p.steps.map((s,i)=>`<li><button class="ph${i===0?" on":""}" data-ph="${i}">${img(p,"phase-"+(i+1),560,300,PH[i][0]+" phase visual",`${PH[i][0]} phase of ${p.short}`,"span")}<small>${PH[i][1]}</small><b>${PH[i][0]}</b><span>${esc(s)}</span></button></li>`).join("")}</ol></div>
<ul class="safe"><li>Your data never trains public AI</li><li>Self-hosted LLM option</li><li>Privacy-compliant</li></ul>
<div class="band"><p>Your 90 days can start this month. Kickoff call, audit plan and timeline in one 30-minute session.</p>${cta("Start my day 1 audit","pri")}</div></div></section>`}

const CMP=[["Goal","Clicks and impressions","Closed revenue"],["Stack","15 disconnected tools","One unified data layer"],["Search","Keyword blog posts","SEO, GEO and AI citations"],["Reporting","Rankings in a monthly PDF","Attribution synced to your CRM"],["Handoff","CSV uploads, slow follow-up","Instant routing and booking"]];
function compare(p){return `<section class="sec" id="compare"><div class="wrap">${head("The difference",`Typical agency vs. Beetrix360 for ${esc(p.short)}`)}
<div class="cw"><div class="cmp" data-cmp="us"><div class="sw2" role="group" aria-label="Choose a side"><button data-side="them" aria-pressed="false">Typical agency</button><button data-side="us" aria-pressed="true">Beetrix360</button></div>
<dl>${CMP.map(r=>`<div class="row"><dt>${r[0]}</dt><dd class="them">${r[1]}</dd><dd class="us">${r[2]}</dd></div>`).join("")}</dl></div>${img(p,"compare",640,620,"Your unified dashboard",`Unified ${p.short} reporting dashboard`)}</div>
<div class="band"><p>Ready to switch sides?</p>${cta("Move me to the right side","pri")}</div></div></section>`}

const WORK=[["Tesla Solar","Clean energy","+40%","pre-orders vs. target","ent","Campaign work for a clean energy launch, measured against pre-order targets."],["Microsoft","Enterprise SaaS","+30%","enterprise engagement","ent","Enterprise marketing work measured on engagement."],["Subway","Global QSR","+25%","in-store footfall","ent","Local campaign work measured on in-store visits."],
["West & Post","Oakville","","Real estate launch","ca","Launch marketing for a residential project in Oakville, Canada."],["Bravo","Vaughan","","Real estate launch","ca","Launch marketing for a residential project in Vaughan, Canada."],["River & Sky","Woodstock","","Real estate launch","ca","Launch marketing for a residential project in Woodstock, Canada."],["Pickering City Centre","Pickering","","Real estate launch","ca","Launch marketing for a development in Pickering, Canada."],
["Elo 3 by Damac","Dubai","","Real estate launch","ae","Launch marketing for a residential project in Dubai."],["IVY Gardens 2","Dubai","","Real estate launch","ae","Launch marketing for a residential project in Dubai."],["Bay Square","Dubai","","Real estate launch","ae","Launch marketing for a project in Dubai."]];
function work(p){return `<section class="sec dark" id="work"><div class="wrap">${head("Previous work","Proof, not promises","Brands and launches we've worked on. Filter the wall, then tap any card for more.")}
<div class="filters" role="group" aria-label="Filter work">${[["all","All work"],["ent","Enterprise"],["ca","Canada real estate"],["ae","Dubai real estate"]].map((f,i)=>`<button data-f="${f[0]}" aria-pressed="${i===0}">${f[1]}</button>`).join("")}</div>
<div class="wall">${WORK.map((w,i)=>`<button class="card k${i%4}" data-k="${w[4]}" aria-expanded="false" >${img(p,"work-"+(i+1),800,900,w[0]+" project image",w[0]+" project by Beetrix360","span")}<span class="m">${w[2]||w[1]}</span><b>${esc(w[0])}</b><span class="l">${w[2]?esc(w[1])+" · ":""}${esc(w[3])}</span><span class="more">${esc(w[5])}</span></button>`).join("")}</div>
<div class="band inv"><p>Want the next card on this wall to be yours?</p>${cta("Put my brand on this wall","pri")}</div></div></section>`}

const IND=[["Heavy equipment & manufacturing","Long sales cycles and technical buyers need {s} that reaches engineers, procurement teams and dealers with specific, factual content."],["Enterprise B2B SaaS","Software buyers compare vendors in search and AI assistants well before a demo, so {s} has to support every stage of the shortlist."],["Financial services","Trust and compliance shape every page. {s} for finance needs expert authorship, careful claims and clear review steps."],["Tier-1 real estate","Project launches depend on timing and location. {s} helps developers capture demand from local and international buyers."]];
function industries(p){return `<section class="sec" id="industries"><div class="wrap">${head("Who we do it for",`${esc(p.short)} by industry`)}
<div class="ind" data-ind><div class="il" role="tablist" aria-label="Industries">${IND.map((x,i)=>`<button role="tab" aria-selected="${i===0}" data-i="${i}">${esc(x[0])}</button>`).join("")}</div><div class="ip">${IND.map((x,i)=>`<div data-ip="${i}" class="pane${i===0?" on":""}">${img(p,"industry-"+(i+1),1000,480,x[0]+" photo",`${p.short} for ${x[0]}`)}<p><b>${esc(x[0])}.</b> ${esc(T(x[1],p))}</p></div>`).join("")}${cta("See my industry playbook","ghost")}</div></div></div></section>`}

function allFaq(p){const pr=p.id==="geo"||p.id==="enterprise-geo"?"/pricing/geo-cost":p.id==="local-seo"?"/pricing/local-seo-pricing":"/pricing/seo-cost";
const has=p.faq.some(x=>/cost/i.test(x[0]));return {list:p.faq.concat([[`How much does ${p.short} cost?`,`The cost depends on your site, market and goals. Our pricing guide explains what affects the price, and we provide a fixed scope after the audit.`],[`Do you guarantee results for ${p.short}?`,`No ethical agency can guarantee a position in Google or an AI answer. We commit to a clear plan, weekly progress and reporting tied to revenue.`],[`How do I get started with Beetrix360?`,`Request the free AI-search and automation audit. We'll review your site, then walk you through a 90-day plan on a 30-minute call.`]].filter((x,i)=>!(has&&i===0))),pr}}
function faq(p){const f=allFaq(p);return `<section class="sec tint" id="faq"><div class="wrap fq"><div class="fs">${head("FAQs",`${esc(p.short)} questions, answered`,"Direct answers first, with detail when you need it.")}<label class="srch" for="faq-q"><span>Search the FAQs</span><input id="faq-q" type="search" placeholder="Try “cost” or “how long”"></label><p class="tiny" data-faqn>${f.list.length} questions</p>${cta("Ask a strategist instead","ghost")}${img(p,"strategist",640,420,"Photo of your strategist",`Beetrix360 ${p.short} strategist`)}</div>
<div class="fl">${f.list.map((x,i)=>`<details data-q${i===0?" open":""}><summary><h3>${esc(x[0])}</h3><i></i></summary><p>${esc(x[1])}${/cost/i.test(x[0])?` <a href="${f.pr}">Read the pricing guide</a>.`:""}</p></details>`).join("")}<p class="none" data-none hidden>No match yet. Send us the question and a strategist will answer it.</p></div></div></section>`}

function related(p){const o=PAGES.filter(x=>x.id!==p.id&&x.col===p.col).concat(PAGES.filter(x=>x.col!==p.col&&x.col!=="hub")).slice(0,6);return `<section class="sec" id="related"><div class="wrap">${head("Keep exploring","Services that work well with this one")}
<div class="rel">${o.map(x=>`<a href="${x.path}" data-page="${x.id}">${img(p,"rel-"+x.id,560,260,x.short,x.short,"span")}<b>${esc(x.short)}</b><span>${esc(x.lead.split(". ")[0].slice(0,100))}</span>${ARROW}</a>`).join("")}</div><div class="band"><p>Not sure which service you need first?</p>${cta("Pick the right one for me","pri")}</div></div></section>`}

function start(p){return `<section class="sec final" id="start"><div class="wrap fg"><div><p class="eye">Free 90-day blueprint</p><h2>Let's build your ${esc(p.short)} revenue engine.</h2><p class="sub">Get an AI-search audit, automation map and ROI model. We reply within 1 business day.</p><p class="tel">${TEL}</p>${img(p,"team",900,520,"Your team photo","The Beetrix360 team")}</div>
<form class="lead-f" data-lead novalidate><div class="two"><label for="f-n">Name<input id="f-n" name="name" required autocomplete="name"></label><label for="f-e">Work email<input id="f-e" name="email" type="email" required autocomplete="email"></label></div>
<label for="f-w">Website<input id="f-w" name="website" required autocomplete="url"></label>
<label for="f-g">Main goal<select id="f-g" name="goal"><option>${esc(p.short)}</option><option>AI search</option><option>Automation</option><option>AI agents</option><option>New website</option></select></label>
<label for="f-b">Monthly budget<select id="f-b" name="budget"><option>$5k – $10k</option><option>$10k – $25k</option><option>$25k – $50k</option><option>$50k+</option></select></label>
<label for="f-m">Anything we should know?<textarea id="f-m" name="notes" rows="3"></textarea></label>
<button class="btn pri" type="submit"><span>Get my blueprint</span>${ARROW}</button><p class="fmsg" data-msg role="status"></p></form></div></section>`}

function foot(){return `<footer class="foot"><div class="wrap ft"><div><a class="brand inv" href="/">${LOGO("mark")}<span>Beetrix<b>360</b></span></a><p>Revenue architects since 2016, started as Bee Social.</p></div><nav aria-label="Footer"><a href="/seo">AI Search &amp; SEO</a><a href="/paid-media">Paid Media &amp; Marketplaces</a><a href="/digital-marketing">Brand, Content &amp; Social</a><a href="/ai-content">AI Content</a><a href="/web-design">Web &amp; Conversion</a><a href="/ai">AI &amp; Automation</a><a href="/about">Company</a></nav><nav aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms</a><a href="/cookie-policy">Cookie Policy</a></nav></div><p class="wrap copy">© 2016–2026 Beetrix360®. All rights reserved.</p></footer>
<div class="dock"><a class="btn pri sm" href="#start"><span>Free AI audit</span>${ARROW}</a></div>
<div class="spine" aria-hidden="true">${LOGO("mark")}</div>`}

function page(p){SLOTN=0;return siteHeader(p)+`<main id="main">`+hero(p)+guide(p)+fixes(p)+included(p)+score(p)+rollout(p)+compare(p)+work(p)+industries(p)+faq(p)+related(p)+start(p)+`</main>`+foot()}
function schema(p){const url=SITE+p.path,org={"@type":"Organization","@id":SITE+"/#organization",name:"Beetrix360",alternateName:"Bee Social",url:SITE,logo:SITE+"/logo.svg",foundingDate:"2016",telephone:"+14244416042"};
const crumbs=[["Home",SITE+"/"]];if(p.id!=="seo")crumbs.push(["AI Search & SEO",SITE+"/seo"]);crumbs.push([p.short,url]);
return {"@context":"https://schema.org","@graph":[org,{"@type":"Service","@id":url+"#service",name:p.name,serviceType:p.kw,description:p.desc,url,provider:{"@id":SITE+"/#organization"}},{"@type":"BreadcrumbList",itemListElement:crumbs.map((c,i)=>({"@type":"ListItem",position:i+1,name:c[0],item:c[1]}))},{"@type":"FAQPage",mainEntity:allFaq(p).list.map(x=>({"@type":"Question",name:x[0],acceptedAnswer:{"@type":"Answer",text:x[1]}}))}]}}
