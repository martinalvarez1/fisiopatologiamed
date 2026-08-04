const STORE_KEY='fisiopato_progress_v1';
function loadProg(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{}}catch(e){return {}}}
function saveProg(p){try{localStorage.setItem(STORE_KEY,JSON.stringify(p))}catch(e){}}
let PROG=loadProg();
function markAnswered(sol,topic,idx,correct){
  PROG[sol]=PROG[sol]||{}; PROG[sol][topic]=PROG[sol][topic]||{};
  PROG[sol][topic][idx]={c:correct}; saveProg(PROG);
}
function topicScore(sol,topic){
  const t=(PROG[sol]||{})[topic]||{}; const keys=Object.keys(t);
  const correct=keys.filter(k=>t[k].c).length; return {done:keys.length,correct};
}
function solDone(sol){
  let done=0,total=0;
  DATA[sol].topics.forEach(t=>{total+=t.questions.length;done+=Object.keys((PROG[sol]||{})[t.id]||{}).length});
  return {done,total};
}

/* Tema oscuro persistente */
try{if(localStorage.getItem('fp_theme')==='dark')document.body.setAttribute('data-theme','dark');}catch(e){}
/* El tema vive SOLO en <html>. Antes tambien se escribia en <body>, que ademas
   traia data-theme="light" fijo en el HTML: al cargar en oscuro ambos quedaban
   en desacuerdo y el primer toque no hacia nada visible. */
function currentTheme(){return document.documentElement.getAttribute('data-theme')==='dark'?'dark':'light';}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  document.body.removeAttribute('data-theme');
  const b=document.getElementById('themeBtn');
  if(b)b.innerHTML=(t==='dark'?'☀️':'🌙')+'<span class="tbl"> Tema</span>';
}
/* Menu de acciones secundarias: descongestiona la barra en pantallas chicas. */
function toggleMore(e){
  if(e&&e.stopPropagation)e.stopPropagation();
  const m=document.getElementById('tbMenu'),b=document.getElementById('moreBtn');
  if(!m)return;
  const open=m.hidden;
  m.hidden=!open;
  if(b)b.setAttribute('aria-expanded',String(open));
}
function closeMore(){
  const m=document.getElementById('tbMenu'),b=document.getElementById('moreBtn');
  if(m)m.hidden=true;
  if(b)b.setAttribute('aria-expanded','false');
}
document.addEventListener('click',function(e){
  const m=document.getElementById('tbMenu');
  if(m&&!m.hidden&&!m.contains(e.target)&&e.target.id!=='moreBtn')closeMore();
});
window.addEventListener('keydown',function(e){if(e.key==='Escape')closeMore();});

function toggleTheme(){
  const next=currentTheme()==='dark'?'light':'dark';
  applyTheme(next);
  try{localStorage.setItem('fp_theme',next)}catch(e){}
}
applyTheme(currentTheme());

function resetProgress(){
  if(confirm('¿Borrar TODO tu progreso? Esto incluye preguntas respondidas, temas leidos, flashcards y cadenas.')){
    PROG={};saveProg(PROG);
    READ={};try{localStorage.removeItem(READ_KEY);}catch(e){}
    SRS={};try{localStorage.removeItem(SRS_KEY);}catch(e){}
    CH={};try{localStorage.removeItem(CHAIN_KEY);}catch(e){}
    route();
  }
}


/* ============================================================
   ICONS + SECTIONS
   ============================================================ */
const IC={
 notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5C10.5 4.5 8 4 6 4c-.9 0-1.6.1-2 .3v14c.4-.2 1.1-.3 2-.3 2 0 4.5.5 6 1.5"/><path d="M12 5.5C13.5 4.5 16 4 18 4c.9 0 1.6.1 2 .3v14c-.4-.2-1.1-.3-2-.3-2 0-4.5.5-6 1.5"/><path d="M12 5.5v14"/></svg>',
 bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.7 2.1-2.7 3.6"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/></svg>',
 cases:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4h6v2H9z"/><path d="M7.5 13h1.8l1-2 1.6 3.5 1.1-2h1.5"/></svg>',
 flash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="2.2"/><path d="M7 8V6.5A1.5 1.5 0 0 1 8.5 5h9A1.5 1.5 0 0 1 19 6.5V16"/></svg>',
 refs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 5v14"/></svg>',
 upd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3h5M10.5 3v6l-4.6 8.2A2 2 0 0 0 7.7 20h8.6a2 2 0 0 0 1.8-2.8L13.5 9V3"/><path d="M8.3 14.5h7.4"/></svg>',
 mnem:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1 .9 1.6V16h5.4v-.6c0-.6.3-1.1.9-1.6A6 6 0 0 0 12 3Z"/></svg>',
 glos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h9"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>',
 exam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
 chain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="12" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8.1 7.2 15.9 11M15.9 13.1 8.1 16.9"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 arrowL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
};
const SECTIONS=[
 {k:'chain',n:'Cadenas',d:'Reconstruye el mecanismo paso a paso'},
 {k:'notes',n:'Resumenes',d:'Los temas de la solemne, explicados y ordenados'},
 {k:'bank', n:'Banco de preguntas',d:'~10 preguntas por tema, con correccion al instante'},
 {k:'cases',n:'Casos clinicos',d:'Pacientes con su analisis fisiopatologico'},
 {k:'flash',n:'Flashcards',d:'Tarjetas para memorizar de un vistazo'},
 {k:'refs', n:'Datos clave',d:'Valores normales y tablas de referencia'},
 {k:'upd',  n:'Al dia',d:'Evidencia reciente conectada con la materia'},
 {k:'mnem', n:'Mnemotecnias',d:'Reglas para que no se te olvide'},
 {k:'glos', n:'Glosario',d:'Terminos clave, buscables'},
 {k:'exam', n:'Modo examen',d:'Simulacro mezclado con puntaje final'}
];
function secDef(k){return SECTIONS.find(s=>s.k===k);}
function secMeta(s,k){
 const d=DATA[s];
 if(k==='notes'){var rc=readCount(s);return rc?rc+' / '+d.topics.length+' leídos':d.topics.length+' temas';}
 if(k==='bank'){const p=solDone(s);return p.done+' / '+p.total+' respondidas';}
 if(k==='cases')return d.cases.length+' casos';
 if(k==='chain'){var tot=chAll(s).length;if(!tot)return 'proximamente';
  var cd=Math.min(chDue(s).length,CH_MAX);return cd?cd+' hoy (~'+(cd*3)+' min)':tot+' cadenas · al día';}
 if(k==='flash'){var due=fcDue(s).length;return due?due+' pendientes hoy':(FLASH[s]||[]).length+' tarjetas · al día';}
 if(k==='refs')return (REFS[s]||[]).length+' tablas';
 if(k==='upd')return (UPDATES[s]||[]).length+' avances';
 if(k==='mnem')return (MNEM[s]||[]).length+' reglas';
 if(k==='glos')return (GLOSSARY[s]||[]).length+' terminos';
 if(k==='exam')return 'simulacro';
 return '';
}

/* ============================================================
   ROUTER
   ============================================================ */
let VIEW={screen:'home',sol:null,section:null,quizTopic:null};
const app=document.getElementById('app');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var READ_KEY='fisiopato_read_v1';
function loadRead(){try{return JSON.parse(localStorage.getItem(READ_KEY))||{};}catch(e){return {};}}
var READ=loadRead();
function markRead(s,t){READ[s]=READ[s]||{};READ[s][t]=1;try{localStorage.setItem(READ_KEY,JSON.stringify(READ));}catch(e){}}
function isRead(s,t){return !!((READ[s]||{})[t]);}
function readCount(s){return Object.keys(READ[s]||{}).length;}
function openNote(tid){VIEW.noteTopic=tid;markRead(VIEW.sol,tid);route();}
function notesIndex(){VIEW.noteTopic=null;route();}
function practiceTopic(tid){VIEW.section='bank';VIEW.quizTopic=tid;VIEW.noteTopic=null;route();}
function goHome(){VIEW={screen:'home',sol:null,section:null,quizTopic:null};route();}
function openSol(s){VIEW={screen:'hub',sol:s,section:null,quizTopic:DATA[s].topics[0].id};route();}
function openSection(k){VIEW.screen='section';VIEW.section=k;if(k==='notes')VIEW.noteTopic=null;route();}
function backToHub(){VIEW.screen='hub';VIEW.section=null;route();}
function route(){window.scrollTo(0,0);
 chStopTimer();   /* el router reemplaza #app entero: sin esto el intervalo del volcado queda huerfano */
 if(VIEW.screen==='home')return renderHome();
 if(VIEW.screen==='hub')return renderHub();
 return renderSection();
}

/* ---------- HOME ---------- */
function ring(pct){var r=20,ci=2*Math.PI*r,o=ci*(1-pct/100);
 return '<svg class="ring" viewBox="0 0 46 46" aria-hidden="true"><circle class="trk" cx="23" cy="23" r="'+r+'" fill="none" stroke-width="3"/><circle class="val" cx="23" cy="23" r="'+r+'" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="'+ci+'" stroke-dashoffset="'+o+'" style="--ci:'+ci+';--off:'+o+'" transform="rotate(-90 23 23)"/><text class="ringt" x="23" y="23" text-anchor="middle" dominant-baseline="central" data-to="'+pct+'">'+pct+'</text></svg>';}
/* Cuenta animada 0->objetivo para numeros con [data-to]. Respeta reduce-motion. */
function animateCounts(root){
 var reduce=false;try{reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){}
 var nums=(root||document).querySelectorAll('[data-to]');
 Array.prototype.forEach.call(nums,function(el){
  var to=parseInt(el.getAttribute('data-to'),10)||0;
  if(reduce||to<=0){el.textContent=to;return;}
  var start=null,dur=900;
  el.textContent='0';
  function step(now){
   if(start===null)start=now;
   var t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3);
   el.textContent=Math.round(to*e);
   if(t<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
 });
}
function renderHome(){
 var sols=['s1','s2','s3'],totDone=0,totAll=0;
 var rows=sols.map(function(s){
  var d=DATA[s],pr=solDone(s),pct=pr.total?Math.round(pr.done/pr.total*100):0;totDone+=pr.done;totAll+=pr.total;
  var scale=s==='s1'?'Escala celular':s==='s2'?'Escala sist\u00e9mica':'Escala de \u00f3rgano';
  var temas=d.topics.map(function(t){return esc(t.name);}).join(' \u00b7 ');
  return '<button class="solrow" style="--c:'+d.color+'" onclick="openSol(\''+s+'\')">'
   +'<span class="sr-chip">'+d.code.slice(1)+'</span>'
   +'<span class="sr-mid"><span class="sr-scale">'+scale+'</span>'
   +'<h2>'+esc(d.title)+'</h2><span class="sr-topics">'+temas+'</span></span>'
   +'<span class="sr-end">'+ring(pct)+'<span class="sr-go">'+IC.arrow+'</span></span></button>';
 }).join('');
 var opct=totAll?Math.round(totDone/totAll*100):0;
 // trazado ECG: 3 latidos (P, QRS, T) a lo ancho
 var beat=function(o){return [o+0,22, o+52,22, o+64,15, o+76,22, o+140,22, o+148,27, o+156,5, o+164,34, o+172,22,
   o+214,22, o+234,13, o+254,22, o+400,22];};
 var pts=[];[0,400,800].forEach(function(o){var b=beat(o);for(var i=0;i<b.length;i+=2)pts.push(b[i]+','+b[i+1]);});
 app.innerHTML='<div class="wrap"><header class="hero">'
  +'<p class="eyebrow">Fisiopatolog\u00eda \u00b7 Solemnes 1 a 3</p>'
  +'<h1>De la injuria celular al <em>signo</em> que ves en el paciente.</h1>'
  +'<p class="lede">Cada tema explicado por su mecanismo, no por memoria suelta. Resumen, preguntas, casos y glosario, una solemne a la vez.</p>'
  +'<div class="chain"><span>Agente</span><i></i><span>Mecanismo</span><i></i><span>Lesi\u00f3n</span><i></i><span>Manifestaci\u00f3n</span></div>'
  +'<div class="herostat">'+ring(opct)+'<p class="hs-tx"><b><span class="num" data-to="'+totDone+'">'+totDone+'</span> de '+totAll+'</b> preguntas respondidas</p></div>'
  +'<div class="ecgline"><svg viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">'
  +'<defs><linearGradient id="ecggrad" x1="0" y1="0" x2="1" y2="0">'
  +'<stop offset="0" stop-color="#6a51d8"/><stop offset=".5" stop-color="#c8294a"/><stop offset="1" stop-color="#0f8f83"/>'
  +'</linearGradient></defs><polyline points="'+pts.join(' ')+'"/></svg></div>'
  +'</header>'
  +'<div class="picklabel"><h2>Elige una solemne</h2><i></i><span>9 secciones cada una</span></div>'
  +'<div class="sollist">'+rows+'</div></div>';
 animateCounts(app);
}

/* ---------- HUB ---------- */
function renderHub(){
 const s=VIEW.sol,d=DATA[s],c=d.color,pr=solDone(s),pct=pr.total?Math.round(pr.done/pr.total*100):0;
 const cards=SECTIONS.map(sec=>
  '<button class="hubcard" style="--c:'+c+'" onclick="openSection(\''+sec.k+'\')">'
  +'<span class="arrow">'+IC.arrow+'</span>'
  +'<span class="ic">'+IC[sec.k]+'</span>'
  +'<h3>'+esc(sec.n)+'</h3><div class="hd">'+esc(sec.d)+'</div>'
  +'<div class="hm">'+esc(secMeta(s,sec.k))+'</div></button>'
 ).join('');
 app.innerHTML='<div class="wrap" style="--c:'+c+'">'
  +'<div class="crumb"><button onclick="goHome()">Inicio</button><span class="sep">/</span><span>Solemne '+d.code.slice(1)+'</span></div>'
  +'<div class="idhead"><div class="glyph" style="background:'+c+'">'+d.code+'</div>'
  +'<div style="flex:1;min-width:220px"><h1>'+esc(d.title)+'</h1><p>'+esc(d.subtitle)+'</p></div>'
  +'<div class="idprog"><div class="lbl"><span>Preguntas respondidas</span><b>'+pr.done+' de '+pr.total+'</b></div>'
  +'<div class="track"><i style="width:'+pct+'%;background:'+c+'"></i></div></div></div>'
  +'<div class="hub">'+cards+'</div></div>';
}

/* ---------- SECTION shell ---------- */
function renderSection(){
 var s=VIEW.sol,k=VIEW.section,d=DATA[s],c=d.color,sec=secDef(k);
 var readingNote=(k==='notes'&&VIEW.noteTopic);
 var body='';
 if(k==='chain')body=renderChain(s);
 else if(k==='notes')body=renderNotes(s);
 else if(k==='bank')body=renderBank(s);
 else if(k==='cases')body=renderCases(s);
 else if(k==='flash')body=renderFlash(s);
 else if(k==='refs')body=renderRefs(s);
 else if(k==='upd')body=renderUpd(s);
 else if(k==='mnem')body=renderMnem(s);
 else if(k==='glos')body=renderGlos(s);
 else if(k==='exam')body=renderExamStart(s);
 var crumb='<div class="crumb"><button onclick="goHome()">Inicio</button><span class="sep">/</span>'
  +'<button onclick="backToHub()">Solemne '+d.code.slice(1)+'</button><span class="sep">/</span>';
 if(readingNote){var tn=d.topics.find(function(t){return t.id===VIEW.noteTopic;});
  crumb+='<button onclick="notesIndex()">Res\u00famenes</button><span class="sep">/</span><span>'+esc(tn.name)+'</span></div>';
 }else{crumb+='<span>'+esc(sec.n)+'</span></div>';}
 var head=readingNote?'':('<button class="backbtn" onclick="backToHub()">'+IC.arrowL+' Todas las secciones</button>'
  +'<div class="sechead"><span class="ic">'+IC[k]+'</span><div><h2>'+esc(sec.n)+'</h2><p>'+esc(sec.d)+'</p></div></div>');
 app.innerHTML='<div class="wrap" style="--c:'+c+'">'+crumb+head+'<div id="secbody">'+body+'</div></div>';
 if(k==='bank'){if(!VIEW.quizTopic)VIEW.quizTopic=DATA[s].topics[0].id;bank={sol:s,topic:VIEW.quizTopic,i:0,answered:false,sel:null};drawQuiz();}
 if(k==='flash')initFlash(s);
 if(k==='chain'&&chAll(s).length)initChain(s);
 if(k==='glos')glosFilter();
}

/* ---------- NOTES ---------- */
function renderNotes(s){
 if(VIEW.noteTopic)return renderReading(s,VIEW.noteTopic);
 var d=DATA[s],c=d.color;
 var rows=d.topics.map(function(t,i){
  var read=isRead(s,t.id);
  var tick=read?'<span class="tick">'+IC.check+'</span>':'';
  return '<button class="trow'+(read?' read':'')+'" style="--c:'+c+'" onclick="openNote(\''+t.id+'\')">'
   +'<span class="tn">'+String(i+1).padStart(2,'0')+'</span>'
   +'<span class="ti"><h4>'+esc(t.name)+'</h4><span class="tmeta">'+t.notes.length+' apartados'+(read?' \u00b7 le\u00eddo':'')+'</span></span>'
   +'<span class="chev">'+tick+IC.arrow+'</span></button>';
 }).join('');
 return '<p class="secintro">Elige un tema para leer su resumen. De a uno, sin saturarte.</p><div class="tindex">'+rows+'</div>';
}
function renderReading(s,tid){
 var d=DATA[s],c=d.color,idx=d.topics.findIndex(function(t){return t.id===tid;}),t=d.topics[idx];
 var prev=d.topics[idx-1],next=d.topics[idx+1];
 var pts=t.notes.map(function(n){return '<section class="kp"><h4>'+esc(n.h)+'</h4><ul>'+n.b.map(function(b){return '<li>'+b+'</li>';}).join('')+'</ul></section>';}).join('');
 var pctw=Math.round((idx+1)/d.topics.length*100);
 var nav='';
 nav+=prev?'<button class="rn-btn" onclick="openNote(\''+prev.id+'\')">'+IC.arrowL+'<span><small>Anterior</small>'+esc(prev.name)+'</span></button>':'<span class="rn-sp"></span>';
 nav+=next?'<button class="rn-btn next" onclick="openNote(\''+next.id+'\')"><span><small>Siguiente</small>'+esc(next.name)+'</span>'+IC.arrow+'</button>':'<span class="rn-sp"></span>';
 return '<div class="readbar"><button class="btn-mini" onclick="notesIndex()">'+IC.arrowL+' \u00cdndice de temas</button>'
  +'<span class="rpos">Tema '+(idx+1)+' / '+d.topics.length+'</span></div>'
  +'<div class="bar"><i style="width:'+pctw+'%;background:'+c+'"></i></div>'
  +'<article class="reading" style="--c:'+c+'"><span class="rkicker">Solemne '+d.code.slice(1)+' \u00b7 Resumen</span>'
  +'<h1 class="rtitle">'+esc(t.name)+'</h1><div class="rrule"></div><div class="keypoints">'+pts+'</div>'
  +'<div class="readcta"><button class="btn primary" style="background:'+c+'" onclick="practiceTopic(\''+tid+'\')">Practicar este tema con preguntas &rarr;</button></div></article>'
  +'<div class="readnav">'+nav+'</div>';
}

/* ---------- REFS ---------- */
function renderRefs(s){
 const r=REFS[s]||[],c=DATA[s].color;
 if(!r.length)return '<div class="empty">Sin tablas de referencia para esta solemne.</div>';
 return r.map(tb=>'<div class="reftable" style="--c:'+c+'"><h3>'+esc(tb.title)+'</h3><table><thead><tr>'
  +tb.cols.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'
  +tb.rows.map(row=>'<tr>'+row.map((cell,i)=>'<td class="'+(i>0?'val':'')+'">'+esc(cell)+'</td>').join('')+'</tr>').join('')
  +'</tbody></table></div>').join('');
}

/* ---------- UPDATES ---------- */
function renderUpd(s){
 const c=DATA[s].color;
 return '<p style="color:var(--muted);margin:0 0 18px;font-size:14px">Complementos con base cientifica reciente (2023-2026) conectados con tu materia. Fuentes al pie de cada tarjeta.</p>'
  +(UPDATES[s]||[]).map(u=>'<div class="updcard" style="--c:'+c+'"><div class="top"><h3>'+esc(u.t)+'</h3><span class="yr">'+esc(u.y)+'</span></div>'
   +'<div>'+u.d+'</div>'+(u.u?'<div class="link">Fuente: <a href="'+u.u+'" target="_blank" rel="noopener">'+esc(u.u)+'</a></div>':'')+'</div>').join('');
}

/* ---------- MNEMONICS ---------- */
function renderMnem(s){
 const c=DATA[s].color;
 return (MNEM[s]||[]).map(x=>'<div class="mnem" style="--c:'+c+'"><div class="word">'+esc(x.word)+'</div><div class="expl">'+esc(x.expl)+'</div>'
  +'<ul>'+x.items.map(it=>'<li><b>'+esc(it[0])+'</b><span>'+esc(it[1])+'</span></li>').join('')+'</ul></div>').join('');
}

/* ---------- GLOSSARY ---------- */
function renderGlos(s){
 return '<input class="gsearch" id="gsearch" type="search" placeholder="Buscar un termino..." oninput="glosFilter()" autocomplete="off">'
  +'<div id="glist"></div>';
}
function glosFilter(){
 const s=VIEW.sol,c=DATA[s].color,inp=document.getElementById('gsearch');
 const q=((inp&&inp.value)||'').trim().toLowerCase();
 const items=(GLOSSARY[s]||[]).filter(g=>!q||g[0].toLowerCase().includes(q)||g[1].toLowerCase().includes(q));
 const box=document.getElementById('glist');if(!box)return;
 box.innerHTML=items.length?items.map(g=>'<div class="gitem" style="--c:'+c+'"><b>'+esc(g[0])+'</b><p>'+esc(g[1])+'</p></div>').join('')
  :'<div class="empty">Sin resultados para tu busqueda.</div>';
}

/* ---------- CASES ---------- */
function renderCases(s){
 const d=DATA[s],c=d.color;
 return d.cases.map(cs=>'<div class="case" style="--c:'+c+'"><span class="ctag" style="background:'+c+'">'+esc(cs.tag)+'</span>'
  +'<h3>'+esc(cs.title)+'</h3><div class="vitals">'+cs.vitals.map(v=>'<span class="vital">'+esc(v)+'</span>').join('')+'</div>'
  +'<p>'+esc(cs.story)+'</p><div class="q">'+esc(cs.q)+'</div>'
  +'<details class="reveal"><summary>&#9656; Ver analisis fisiopatologico</summary><div class="rc">'+cs.ans+'</div></details></div>').join('');
}

/* ---------- FLASHCARDS ---------- */
/* Repeticion espaciada tipo Leitner: 5 cajas, intervalos crecientes.
   Cada tarjeta guarda su caja y su fecha de proxima revision en localStorage. */
const SRS_KEY='fisiopato_srs_v1';
function loadSRS(){try{return JSON.parse(localStorage.getItem(SRS_KEY))||{}}catch(e){return {}}}
function saveSRS(){try{localStorage.setItem(SRS_KEY,JSON.stringify(SRS))}catch(e){}}
let SRS=loadSRS();
const SRS_DAYS={1:0,2:1,3:3,4:7,5:16};
const DAY_MS=86400000;
function fcKey(s,front){return s+'::'+front;}
function fcDue(s){
 const now=Date.now();
 return (FLASH[s]||[]).map(function(card){return {card:card,key:fcKey(s,card[0])};})
  .filter(function(o){var st=SRS[o.key];return !st||st.due<=now;});
}
let fcState={sol:null,deck:[],i:0,flipped:false,reviewed:0,ahead:false};
function renderFlash(s){
 const c=DATA[s].color;
 return '<div class="fcwrap" style="--c:'+c+'">'
  +'<div class="qmeta"><span class="prog" id="fcCount"></span><span class="fcbox" id="fcBox"></span></div>'
  +'<div class="fcbar"><i id="fcBarFill" style="background:'+c+'"></i></div>'
  +'<div class="flash" id="flash" onclick="fcFlip()"><div class="flash-in">'
  +'<div class="face"><span class="lab">Concepto - toca para girar</span><div class="txt" id="fcFront"></div></div>'
  +'<div class="face back"><span class="lab">Respuesta</span><div class="txt" id="fcBack"></div></div></div></div>'
  +'<div class="fcbtns" id="fcActions"></div>'
  +'<p class="fchint" id="fcHint"></p></div>';
}
function initFlash(s){fcState={sol:s,deck:fcDue(s),i:0,flipped:false,reviewed:0,ahead:false};fcRender();}
function initFlashAhead(s){
 fcState={sol:s,deck:(FLASH[s]||[]).map(function(card){return {card:card,key:fcKey(s,card[0])};}),i:0,flipped:false,reviewed:0,ahead:true};
 fcRender();
}
function fcRender(){
 const wrap=document.querySelector('.fcwrap');if(!wrap)return;
 const flash=document.getElementById('flash'),front=document.getElementById('fcFront'),back=document.getElementById('fcBack'),
   count=document.getElementById('fcCount'),box=document.getElementById('fcBox'),actions=document.getElementById('fcActions'),
   bar=document.getElementById('fcBarFill'),hint=document.getElementById('fcHint'),
   c=DATA[fcState.sol].color;
 if(fcState.i>=fcState.deck.length){
  flash.style.display='none';box.textContent='';
  if(bar)bar.style.width=(fcState.reviewed>0?'100%':'0%');
  if(hint)hint.textContent='';
  if(fcState.reviewed===0&&!fcState.ahead){
   count.textContent='Todo al dia';
   actions.innerHTML='<p class="fcdone">No tienes tarjetas pendientes para hoy. Vuelve manana o repasa igual.</p>'
    +'<button class="btn" onclick="initFlashAhead(\''+fcState.sol+'\')">Repasar todas de todos modos</button>';
  }else{
   count.textContent='Sesion completa';
   actions.innerHTML='<p class="fcdone">Repasaste '+fcState.reviewed+' '+(fcState.reviewed===1?'tarjeta':'tarjetas')+'.'
    +(fcState.ahead?'':' Las volveras a ver segun tu avance.')+'</p>'
    +'<button class="btn" onclick="initFlash(\''+fcState.sol+'\')">Reiniciar pendientes</button>'
    +'<button class="btn" onclick="initFlashAhead(\''+fcState.sol+'\')">Repasar todas</button>';
  }
  return;
 }
 flash.style.display='';
 const o=fcState.deck[fcState.i],st=SRS[o.key]||{box:1};
 front.textContent=o.card[0];back.textContent=o.card[1];
 count.textContent='Tarjeta '+(fcState.i+1)+' / '+fcState.deck.length+(fcState.ahead?' - repaso libre':' - pendientes hoy');
 box.textContent='Nivel '+(st.box||1)+'/5';
 if(bar){var total=fcState.reviewed+(fcState.deck.length-fcState.i);bar.style.width=(total?Math.round(fcState.reviewed/total*100):0)+'%';}
 flash.classList.toggle('flipped',fcState.flipped);
 if(fcState.flipped){
  actions.innerHTML='<button class="btn fcbad" onclick="fcGrade(false)">No lo supe</button>'
   +'<button class="btn fcgood" onclick="fcGrade(true)">Lo supe</button>';
  if(hint)hint.innerHTML='<kbd>&larr;</kbd> no lo supe &nbsp; <kbd>&rarr;</kbd> / <kbd>espacio</kbd> lo supe';
 }else{
  actions.innerHTML='<button class="btn primary" style="background:'+c+'" onclick="fcFlip()">Mostrar respuesta</button>';
  if(hint)hint.innerHTML='<kbd>espacio</kbd> mostrar respuesta';
 }
}
function fcFlip(){fcState.flipped=!fcState.flipped;fcRender();}
function fcGrade(known){
 const o=fcState.deck[fcState.i];if(!o)return;
 const st=SRS[o.key]||{box:1};
 st.box=known?Math.min(5,(st.box||1)+1):1;
 st.due=Date.now()+(SRS_DAYS[st.box]||0)*DAY_MS;
 SRS[o.key]=st;saveSRS();
 fcState.reviewed++;
 if(!known)fcState.deck.push(o);
 fcState.i++;fcState.flipped=false;
 fcRender();
}
/* Atajos de teclado para estudiar flashcards (estilo Anki): espacio gira/aprueba,
   flechas califican. Solo actua en la seccion de flashcards, con el buscador cerrado. */
window.addEventListener('keydown',function(e){
 if(VIEW.screen!=='section'||VIEW.section!=='flash')return;
 var ov=document.getElementById('searchOverlay');if(ov&&!ov.hidden)return;
 var tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT'||tag==='TEXTAREA')return;
 if(fcState.i>=fcState.deck.length)return;
 var k=e.key;
 if(k===' '||k==='Enter'){e.preventDefault();if(!fcState.flipped)fcFlip();else fcGrade(true);return;}
 if(!fcState.flipped){
  if(k==='ArrowRight'||k==='ArrowLeft'||k==='1'||k==='2'){e.preventDefault();fcFlip();}
  return;
 }
 if(k==='ArrowRight'||k==='2'){e.preventDefault();fcGrade(true);}
 else if(k==='ArrowLeft'||k==='1'){e.preventDefault();fcGrade(false);}
});

/* ---------- QUESTION BANK ---------- */
let bank={sol:null,topic:null,i:0,answered:false,sel:null};
function renderBank(s){
 const d=DATA[s],c=d.color;
 const chips=d.topics.map(t=>{const sc=topicScore(s,t.id);
  return '<button class="tp '+(VIEW.quizTopic===t.id?'active':'')+'" style="'+(VIEW.quizTopic===t.id?'background:'+c:'')+'" onclick="pickTopic(\''+t.id+'\')">'+esc(t.name)+'<span class="badge2">'+sc.done+'/'+t.questions.length+'</span></button>';
 }).join('');
 return '<div class="topicpick">'+chips+'</div><div id="quizArea"></div>';
}
function pickTopic(tid){VIEW.quizTopic=tid;renderSection();}
function drawQuiz(){
 const s=bank.sol,c=DATA[s].color,topic=DATA[s].topics.find(t=>t.id===bank.topic);
 const qs=topic.questions,i=bank.i,q=qs[i],area=document.getElementById('quizArea');if(!area)return;
 const pct=Math.round((i/qs.length)*100);
 const opts=q.o.map((o,oi)=>{let cls='opt';if(bank.answered){if(oi===q.a)cls+=' correct';else if(oi===bank.sel)cls+=' wrong';}
  return '<button class="'+cls+'" '+(bank.answered?'disabled':'')+' onclick="answer('+oi+')"><span class="lt">'+String.fromCharCode(65+oi)+'</span><span>'+esc(o)+'</span></button>';}).join('');
 let explain='';
 if(bank.answered){const ok=bank.sel===q.a;explain='<div class="explain '+(ok?'ok':'no')+'"><b>'+(ok?'Correcto.':'Incorrecto.')+'</b> '+q.e+'</div>';}
 area.innerHTML='<div class="qmeta"><span class="prog">Pregunta '+(i+1)+' de '+qs.length+'</span><span class="prog">'+esc(topic.name)+'</span></div>'
  +'<div class="bar"><i style="width:'+pct+'%;background:'+c+'"></i></div><div style="height:14px"></div>'
  +'<div class="qcard"><div class="qn">Item '+String(i+1).padStart(2,'0')+'</div><div class="qtext">'+esc(q.q)+'</div>'+opts+explain
  +'<div class="qnav"><button class="btn" onclick="prevQ()" '+(i===0?'disabled':'')+'>Anterior</button>'
  +(i<qs.length-1?'<button class="btn primary" style="background:'+c+'" onclick="nextQ()" '+(bank.answered?'':'disabled')+'>Siguiente</button>'
   :'<button class="btn primary" style="background:'+c+'" onclick="finishQuiz()" '+(bank.answered?'':'disabled')+'>Ver resultado</button>')
  +'</div></div>';
}
function answer(oi){if(bank.answered)return;const topic=DATA[bank.sol].topics.find(t=>t.id===bank.topic);const q=topic.questions[bank.i];
 bank.answered=true;bank.sel=oi;markAnswered(bank.sol,bank.topic,bank.i,oi===q.a);drawQuiz();}
function nextQ(){bank.i++;bank.answered=false;bank.sel=null;drawQuiz();}
function prevQ(){if(bank.i>0){bank.i--;bank.answered=false;bank.sel=null;drawQuiz();}}
function finishQuiz(){
 const s=bank.sol,c=DATA[s].color,topic=DATA[s].topics.find(t=>t.id===bank.topic);
 const sc=topicScore(s,bank.topic),total=topic.questions.length,pct=Math.round(sc.correct/total*100);
 const circ=2*Math.PI*54,off=circ*(1-pct/100),area=document.getElementById('quizArea');
 area.innerHTML='<div class="qcard result"><svg class="donut" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--soft)" stroke-width="11"/>'
  +'<circle class="dval" cx="60" cy="60" r="54" fill="none" stroke="'+c+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" style="--ci:'+circ+';--off:'+off+'"/></svg>'
  +'<div class="big" style="color:'+c+'">'+pct+'%</div><div class="lbl">'+sc.correct+' de '+total+' correctas &middot; '+esc(topic.name)+'</div>'
  +'<div class="qnav" style="justify-content:center;margin-top:22px"><button class="btn" onclick="pickTopic(\''+bank.topic+'\')">Repetir tema</button>'
  +'<button class="btn primary" style="background:'+c+'" onclick="openSection(\'bank\')">Otro tema</button></div></div>';
}

/* ---------- EXAM ---------- */
let exam={pool:[],i:0,answered:false,correct:0,sel:null,sol:null};
function renderExamStart(s){
 const d=DATA[s],c=d.color,totalQ=d.topics.reduce((a,t)=>a+t.questions.length,0);
 return '<div class="qcard" style="text-align:center;padding:34px"><div class="qn">Modo examen</div>'
  +'<h2 class="display" style="margin:8px 0 6px;font-size:24px">Simulacro de '+esc(d.title)+'</h2>'
  +'<p style="color:var(--muted);max-width:460px;margin:0 auto 18px">Preguntas mezcladas de todos los temas de la solemne, en orden aleatorio. Al final ves tu puntaje.</p>'
  +'<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
  +'<button class="btn primary" style="background:'+c+'" onclick="startExam(\''+s+'\',20)">Examen rapido (20)</button>'
  +'<button class="btn" onclick="startExam(\''+s+'\','+totalQ+')">Examen completo ('+totalQ+')</button></div></div>';
}
function startExam(s,n){let pool=[];DATA[s].topics.forEach(t=>t.questions.forEach(q=>pool.push({q:q,topic:t.name})));
 pool=pool.sort(function(){return Math.random()-.5;});if(n>0)pool=pool.slice(0,n);
 exam={pool:pool,i:0,answered:false,correct:0,sel:null,sol:s};drawExam();}
function drawExam(){
 const s=exam.sol,c=DATA[s].color,item=exam.pool[exam.i],q=item.q,pct=Math.round(exam.i/exam.pool.length*100);
 const opts=q.o.map((o,oi)=>{let cls='opt';if(exam.answered){if(oi===q.a)cls+=' correct';else if(oi===exam.sel)cls+=' wrong';}
  return '<button class="'+cls+'" '+(exam.answered?'disabled':'')+' onclick="examAnswer('+oi+')"><span class="lt">'+String.fromCharCode(65+oi)+'</span><span>'+esc(o)+'</span></button>';}).join('');
 let explain=exam.answered?'<div class="explain '+(exam.sel===q.a?'ok':'no')+'"><b>'+(exam.sel===q.a?'Correcto.':'Incorrecto.')+'</b> '+q.e+'</div>':'';
 document.getElementById('secbody').innerHTML='<div class="qmeta"><span class="prog">Pregunta '+(exam.i+1)+' / '+exam.pool.length+'</span><span class="prog">Aciertos: '+exam.correct+'</span></div>'
  +'<div class="bar"><i style="width:'+pct+'%;background:'+c+'"></i></div><div style="height:14px"></div>'
  +'<div class="qcard"><div class="qn">'+esc(item.topic)+'</div><div class="qtext">'+esc(q.q)+'</div>'+opts+explain
  +'<div class="qnav"><span></span>'
  +(exam.i<exam.pool.length-1?'<button class="btn primary" style="background:'+c+'" onclick="examNext()" '+(exam.answered?'':'disabled')+'>Siguiente</button>'
   :'<button class="btn primary" style="background:'+c+'" onclick="examFinish()" '+(exam.answered?'':'disabled')+'>Terminar</button>')+'</div></div>';
}
function examAnswer(oi){if(exam.answered)return;exam.answered=true;exam.sel=oi;if(oi===exam.pool[exam.i].q.a)exam.correct++;drawExam();}
function examNext(){exam.i++;exam.answered=false;exam.sel=null;drawExam();}
function examFinish(){
 const s=exam.sol,c=DATA[s].color,pct=Math.round(exam.correct/exam.pool.length*100);
 const circ=2*Math.PI*54,off=circ*(1-pct/100);
 const msg=pct>=80?'Excelente dominio.':pct>=60?'Vas bien, repasa los temas fallados.':'A reforzar: vuelve a los resumenes y al banco.';
 document.getElementById('secbody').innerHTML='<div class="qcard result"><svg class="donut" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--soft)" stroke-width="11"/>'
  +'<circle class="dval" cx="60" cy="60" r="54" fill="none" stroke="'+c+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" style="--ci:'+circ+';--off:'+off+'"/></svg>'
  +'<div class="big" style="color:'+c+'">'+pct+'%</div><div class="lbl">'+exam.correct+' de '+exam.pool.length+' correctas</div>'
  +'<p style="color:var(--muted);margin-top:8px">'+msg+'</p>'
  +'<div class="qnav" style="justify-content:center;margin-top:20px"><button class="btn" onclick="openSection(\'exam\')">Nuevo examen</button>'
  +'<button class="btn primary" style="background:'+c+'" onclick="openSection(\'notes\')">Repasar resumenes</button></div></div>';
}

/* ============================================================
   BUSCADOR GLOBAL — indexa resumenes, preguntas, casos, glosario,
   flashcards, mnemotecnias y "Al dia" de los 3 solemnes.
   ============================================================ */
let SEARCH_IDX=null,SEARCH_HITS=[];
/* Solo quita etiquetas HTML reales (<b>, </u>, <span ...>). Un "<" suelto seguido de
   espacio o numero -como "dura < 2 semanas"- NO es una etiqueta y debe conservarse:
   con el regex antiguo se comia el texto hasta el siguiente ">" y la busqueda fallaba. */
function stripHtml(h){return String(h).replace(/<\/?[a-zA-Z][^>]*>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();}
function goSection(s,k){VIEW={screen:'section',sol:s,section:k,quizTopic:DATA[s].topics[0].id,noteTopic:null};route();}
function buildSearchIndex(){
 const idx=[];
 ['s1','s2','s3'].forEach(function(s){
  const d=DATA[s];if(!d)return;
  d.topics.forEach(function(t){
   const body=t.notes.map(function(n){return n.h+' '+n.b.join(' ');}).join(' ');
   idx.push({s:s,type:'Resumen',label:t.name,text:stripHtml(t.name+' '+body),go:function(){goSection(s,'notes');openNote(t.id);}});
   t.questions.forEach(function(q){
    idx.push({s:s,type:'Pregunta',label:q.q,text:stripHtml(q.q+' '+q.e),go:function(){VIEW={screen:'section',sol:s,section:'bank',quizTopic:t.id,noteTopic:null};route();}});
   });
  });
  (d.cases||[]).forEach(function(cs){idx.push({s:s,type:'Caso',label:cs.title,text:stripHtml(cs.title+' '+cs.story+' '+cs.q+' '+cs.ans),go:function(){goSection(s,'cases');}});});
  (GLOSSARY[s]||[]).forEach(function(g){idx.push({s:s,type:'Glosario',label:g[0],text:stripHtml(g[0]+' '+g[1]),go:function(){goSection(s,'glos');}});});
  (FLASH[s]||[]).forEach(function(f){idx.push({s:s,type:'Flashcard',label:f[0],text:stripHtml(f[0]+' '+f[1]),go:function(){goSection(s,'flash');}});});
  (MNEM[s]||[]).forEach(function(m){idx.push({s:s,type:'Mnemotecnia',label:m.word,text:stripHtml(m.word+' '+m.expl),go:function(){goSection(s,'mnem');}});});
  (UPDATES[s]||[]).forEach(function(u){idx.push({s:s,type:'Al día',label:u.t,text:stripHtml(u.t+' '+u.d),go:function(){goSection(s,'upd');}});});
 });
 return idx;
}
function openSearch(){
 const ov=document.getElementById('searchOverlay');if(!ov)return;
 ov.hidden=false;
 if(!SEARCH_IDX)SEARCH_IDX=buildSearchIndex();
 const inp=document.getElementById('searchInput');inp.value='';
 document.getElementById('searchResults').innerHTML='<p class="se-hint">Escribe al menos 2 letras para buscar en todo el material.</p>';
 inp.focus();
}
function closeSearch(){const ov=document.getElementById('searchOverlay');if(ov)ov.hidden=true;}
function snippet(text,term){
 const low=text.toLowerCase(),p=low.indexOf(term),start=Math.max(0,p-40);
 if(p<0)return text.slice(0,120)+(text.length>120?'…':'');
 return (start>0?'…':'')+text.slice(start,start+120)+(text.length>start+120?'…':'');
}
function runSearch(){
 const q=document.getElementById('searchInput').value.trim().toLowerCase(),box=document.getElementById('searchResults');
 if(q.length<2){box.innerHTML='<p class="se-hint">Escribe al menos 2 letras para buscar en todo el material.</p>';return;}
 const terms=q.split(/\s+/);
 SEARCH_HITS=SEARCH_IDX.filter(function(e){var hay=e.text.toLowerCase();return terms.every(function(t){return hay.indexOf(t)>=0;});}).slice(0,40);
 if(!SEARCH_HITS.length){box.innerHTML='<p class="se-hint">Sin resultados para "'+esc(q)+'".</p>';return;}
 box.innerHTML=SEARCH_HITS.map(function(e,i){
  var col=DATA[e.s].color,lab=e.label.length>96?e.label.slice(0,96)+'…':e.label;
  return '<button class="se-item" data-i="'+i+'" style="--c:'+col+'">'
   +'<span class="se-type" style="background:'+col+'">'+esc(e.type)+' · S'+e.s.slice(1)+'</span>'
   +'<span class="se-label">'+esc(lab)+'</span>'
   +'<span class="se-snip">'+esc(snippet(e.text,terms[0]))+'</span></button>';
 }).join('');
 Array.prototype.forEach.call(box.querySelectorAll('.se-item'),function(btn){
  btn.onclick=function(){var i=+btn.getAttribute('data-i');closeSearch();SEARCH_HITS[i].go();};
 });
}
window.addEventListener('keydown',function(e){
 var ov=document.getElementById('searchOverlay'),open=ov&&!ov.hidden;
 if(e.key==='Escape'&&open){closeSearch();return;}
 var tag=(e.target&&e.target.tagName)||'';
 if(e.key==='/'&&!open&&tag!=='INPUT'&&tag!=='TEXTAREA'){e.preventDefault();openSearch();}
});
/* Cerrar al clicar el fondo SOLO si el gesto empezo en el fondo. Asi el mismo
   clic que abre el buscador (el fondo aparece bajo el cursor) no lo cierra. */
(function(){
 var ov=document.getElementById('searchOverlay');if(!ov)return;
 var downOnBackdrop=false;
 ov.addEventListener('mousedown',function(e){downOnBackdrop=(e.target===ov);});
 ov.addEventListener('click',function(e){if(downOnBackdrop&&e.target===ov)closeSearch();downOnBackdrop=false;});
})();

/* ============================================================
   EXPORTAR / IMPORTAR PROGRESO — respaldo en un archivo JSON.
   ============================================================ */
function exportProgress(){
 const data={v:2,exported:new Date().toISOString(),progress:PROG,read:READ,srs:SRS,chains:CH,theme:(localStorage.getItem('fp_theme')||'light')};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='fisiopato-progreso-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function importProgress(input){
 const file=input.files&&input.files[0];if(!file)return;
 const rd=new FileReader();
 rd.onload=function(){
  try{
   const d=JSON.parse(rd.result);
   if(d.progress){PROG=d.progress;saveProg(PROG);}
   if(d.read){READ=d.read;try{localStorage.setItem(READ_KEY,JSON.stringify(READ));}catch(e){}}
   if(d.srs){SRS=d.srs;saveSRS();}
   if(d.chains){CH=d.chains;saveCH();}
   if(d.theme){try{localStorage.setItem('fp_theme',d.theme);}catch(e){}applyTheme(d.theme==='dark'?'dark':'light');}
   alert('Progreso importado correctamente.');
   route();
  }catch(err){alert('No se pudo leer el archivo. ¿Es un export válido de esta app?');}
 };
 rd.readAsText(file);input.value='';
}

/* ============================================================
   CADENAS — reconstruye el mecanismo.
   Modo interactivo basado en evidencia: practica de recuperacion con
   feedback (el feedback casi duplica el efecto), efecto de generacion,
   prepreguntas dirigidas al nucleo causal y autoexplicacion de aristas.
   El NIVEL de cada cadena elige los pasos de la sesion, asi que el mismo
   contenido produce sesiones cualitativamente distintas.
   ============================================================ */
const CHAIN_KEY='fisiopato_chains_v1';
let CH=(function(){try{return JSON.parse(localStorage.getItem(CHAIN_KEY))||{}}catch(e){return {}}})();
function saveCH(){try{localStorage.setItem(CHAIN_KEY,JSON.stringify(CH))}catch(e){}}
const CH_DAYS={1:0,2:1,3:3,4:7,5:16,6:35};
const CH_MAX=4;   /* tope diario: una cola sin tope es la razon tipica de abandono */

function chAll(sol){return (typeof CHAINS!=='undefined'&&CHAINS[sol])||[];}
function chFind(id){
 for(var k in CHAINS){var a=CHAINS[k]||[];for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];}
 return null;
}
function chSt(id){if(!CH[id])CH[id]={lvl:1,box:1,due:0,nb:0,hist:[],notes:{}};return CH[id];}
function chLvl(id){return (CH[id]&&CH[id].lvl)||1;}
function chSteps(l){return ({1:['pre','expo','order'],2:['order','link'],3:['link','why'],4:['dump']})[l]||['order'];}
function chDue(sol){var n=Date.now();return chAll(sol).filter(function(c){var st=CH[c.id];return !st||(st.due||0)<=n;});}

/* barajado determinista por cadena+dia: recargar a mitad de sesion no re-baraja */
function chHash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h*16777619)>>>0;}return h>>>0;}
function chShuffle(arr,seedStr){
 var a=arr.slice(),seed=chHash(seedStr+new Date().toISOString().slice(0,10))||1;
 function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}
 return a;
}

let chSess=null,chTimer=null;
function renderChain(s){
 if(!chAll(s).length)return '<div class="empty">Aun no hay cadenas para esta solemne.</div>';
 return '<div id="chBody"></div>';
}
function initChain(s){
 var due=chDue(s).slice(0,CH_MAX);
 chSess={sol:s,queue:due.map(function(c){return c.id;}),qi:0,chain:null,steps:[],si:0,st:{},selfs:[],free:false};
 chStart();
}
function chStart(){
 if(!chSess)return;
 if(chSess.qi>=chSess.queue.length)return chRenderQueueDone();
 var c=chFind(chSess.queue[chSess.qi]);
 if(!c){chSess.qi++;return chStart();}
 chSess.chain=c;chSess.steps=chSteps(chLvl(c.id));chSess.si=0;chSess.st={};chSess.selfs=[];
 chStep();
}
function chStep(){
 if(!chSess||!document.getElementById('chBody'))return;
 var k=chSess.steps[chSess.si];
 if(k==='pre')chRenderPre();else if(k==='expo')chRenderExpo();
 else if(k==='order')chRenderOrder();else if(k==='link')chRenderLink();
 else if(k==='why')chRenderWhy();else if(k==='dump')chRenderDump();
 else chNextStep();
}
function chNextStep(){chStopTimer();chSess.si++;chSess.st={};if(chSess.si>=chSess.steps.length)return chFinishChain();chStep();}

function chHead(prompt){
 var c=chSess.chain,lvl=chLvl(c.id);
 return '<div class="chhead"><div class="chhl"><span class="chq">Cadena '+(chSess.qi+1)+' de '+chSess.queue.length+'</span>'
  +'<h3>'+esc(c.title)+'</h3></div><span class="chlvl">Nivel '+lvl+'/4</span></div>'
  +'<div class="chstepbar">'+chSess.steps.map(function(x,i){
     return '<i class="'+(i<chSess.si?'done':(i===chSess.si?'now':''))+'"></i>';}).join('')+'</div>'
  +'<p class="chprompt">'+esc(prompt)+'</p>';
}
function chSelfScore(fn){
 return '<div class="chscore"><span class="chsl">¿Como te fue?</span><div class="sgrid">'
  +'<button class="sbtn s0" onclick="'+fn+'(0)">No</button>'
  +'<button class="sbtn s1" onclick="'+fn+'(1)">A medias</button>'
  +'<button class="sbtn s2" onclick="'+fn+'(2)">Lo tenia</button></div></div>';
}
function chLog(ok){var c=chSess&&chSess.chain;if(!c)return;var st=chSt(c.id);
 st.hist=(st.hist||[]).concat([{t:Date.now(),ok:!!ok}]).slice(-60);saveCH();}
function chNav(html){return '<div class="chnav">'+html+'</div>';}
function chBtn(label,fn){return '<button class="btn primary" style="background:'+DATA[chSess.sol].color+'" onclick="'+fn+'">'+label+'</button>';}

/* ---------- 1. Prediccion comprometida (prepregunta) ---------- */
function chRenderPre(){
 var c=chSess.chain,list=c.pre||[],i=chSess.st.pi||0;
 if(i>=list.length)return chNextStep();
 var p=list[i];
 document.getElementById('chBody').innerHTML=chHead('Predice antes de ver el mecanismo. Adivina: casi todos fallan la primera.')
  +'<div class="chcard"><p class="chq2">'+esc(p.q)+'</p>'
  +'<div class="pgrid">'+p.opts.map(function(o,oi){return '<button class="pbtn" onclick="chPre('+oi+')">'+esc(o)+'</button>';}).join('')+'</div>'
  +'<div id="chPreRes"></div></div>';
}
function chPre(oi){
 var list=chSess.chain.pre,p=list[chSess.st.pi||0],ok=(oi===p.a);
 chLog(ok);
 Array.prototype.forEach.call(document.querySelectorAll('#chBody .pbtn'),function(b,bi){
  b.disabled=true;if(bi===p.a)b.classList.add('good');else if(bi===oi)b.classList.add('bad');});
 document.getElementById('chPreRes').innerHTML='<div class="chreveal '+(ok?'ok':'no')+'"><b>'+(ok?'Correcto. ':'No. ')+'</b>'+p.model+'</div>'
  +chNav(chBtn('Continuar','chPreNext()'));
}
function chPreNext(){chSess.st.pi=(chSess.st.pi||0)+1;chRenderPre();}

/* ---------- 2. Exposicion segmentada (unico paso de lectura) ---------- */
function chRenderExpo(){
 var c=chSess.chain,n=chSess.st.n||1;
 document.getElementById('chBody').innerHTML=chHead('Lee el mecanismo paso a paso.')
  +'<ol class="chlist">'+c.nodes.slice(0,n).map(function(t,i){
     return '<li class="chnode'+(i===n-1?' active':'')+'"><span class="chnum">'+(i+1)+'</span><span>'+esc(t)+'</span></li>';}).join('')+'</ol>'
  +chNav(n<c.nodes.length?chBtn('Siguiente paso','chExpo()'):chBtn('Ahora reconstruyela','chNextStep()'));
}
function chExpo(){chSess.st.n=(chSess.st.n||1)+1;chRenderExpo();}

/* ---------- 3. Reconstruccion con 2 intrusos ---------- */
function chRenderOrder(){
 var c=chSess.chain;
 if(!chSess.st.bank){
  var pieces=c.nodes.map(function(t,i){return {t:t,i:i};}).concat((c.intruders||[]).map(function(t){return {t:t,i:-1};}));
  chSess.st.bank=chShuffle(pieces,c.id);chSess.st.placed=[];chSess.st.tries=0;chSess.st.locked=0;chSess.st.badAt=-1;
 }
 var bank=chSess.st.bank,pl=chSess.st.placed,lock=chSess.st.locked||0;
 document.getElementById('chBody').innerHTML=chHead('Arma la cadena en orden. Ojo: sobran 2 piezas que no pertenecen.')
  +(chSess.st.msg?'<div class="chreveal no">'+esc(chSess.st.msg)+'</div>':'')
  +'<h4 class="chsub">Tu cadena</h4><ol class="chdrop">'
  +(pl.length?pl.map(function(p,pi){
     return '<li class="chp'+(pi<lock?' lockd':'')+(chSess.st.badAt===pi?' badat':'')+'">'
      +'<span class="chnum">'+(pi+1)+'</span>'
      +'<button class="chpb" onclick="chUnplace('+pi+')"'+(pi<lock?' disabled':'')+'>'+esc(p.t)+'</button>'
      +(pi<lock?'':'<span class="chmv"><button onclick="chMove('+pi+',-1)" aria-label="subir">&#9650;</button><button onclick="chMove('+pi+',1)" aria-label="bajar">&#9660;</button></span>')
      +'</li>';}).join('')
    :'<li class="chempty">Toca una pieza para empezar</li>')
  +'</ol><h4 class="chsub">Piezas</h4><ul class="chbank">'
  +(bank.length?bank.map(function(p,bi){return '<li><button class="chpb" onclick="chPlace('+bi+')">'+esc(p.t)+'</button></li>';}).join('')
    :'<li class="chempty">Ya colocaste todas</li>')
  +'</ul>'
  +chNav('<button class="btn primary" style="background:'+DATA[chSess.sol].color+'" onclick="chCheck()"'+(pl.length?'':' disabled')+'>Comprobar</button>');
}
function chPlace(bi){chSess.st.placed.push(chSess.st.bank.splice(bi,1)[0]);chSess.st.badAt=-1;chSess.st.msg='';chRenderOrder();}
function chUnplace(pi){if(pi<(chSess.st.locked||0))return;chSess.st.bank.push(chSess.st.placed.splice(pi,1)[0]);chSess.st.badAt=-1;chSess.st.msg='';chRenderOrder();}
function chMove(pi,d){var pl=chSess.st.placed,nj=pi+d,lock=chSess.st.locked||0;
 if(nj<lock||nj>=pl.length)return;var t=pl[pi];pl[pi]=pl[nj];pl[nj]=t;chSess.st.badAt=-1;chSess.st.msg='';chRenderOrder();}
function chCheck(){
 var c=chSess.chain,pl=chSess.st.placed;
 var run=0;while(run<pl.length&&pl[run].i===run)run++;
 var intruder=pl.some(function(p){return p.i===-1;});
 var complete=(pl.length===c.nodes.length&&run===c.nodes.length);
 chSess.st.tries=(chSess.st.tries||0)+1;
 chSess.st.locked=run;                      /* fija el tramo correcto desde el inicio */
 if(complete)return chOrderDone(true);
 if(chSess.st.tries>=3)return chOrderDone(false);
 chSess.st.badAt=run;                       /* señala SOLO el primer error */
 chSess.st.msg=(intruder?'Sobra una pieza que no pertenece a esta cadena. ':'')+'Hasta ahi vas bien; revisa el paso marcado. Intento '+chSess.st.tries+' de 3.';
 chRenderOrder();
}
function chOrderDone(ok){
 chLog(ok);chSess.selfs.push(ok?2:0);
 var c=chSess.chain;
 document.getElementById('chBody').innerHTML=chHead(ok?'Cadena correcta.':'Esta es la cadena completa.')
  +'<ol class="chlist">'+c.nodes.map(function(t,i){return '<li class="chnode done"><span class="chnum">'+(i+1)+'</span><span>'+esc(t)+'</span></li>';}).join('')+'</ol>'
  +'<div class="chreveal '+(ok?'ok':'no')+'"><b>'+(ok?'Bien. ':'Revisala. ')+'</b>'
  +(ok?'La reconstruiste en '+chSess.st.tries+' intento'+(chSess.st.tries>1?'s':'')+'.':'La proxima sesion vuelve a este nivel.')+'</div>'
  +chNav(chBtn('Continuar','chNextStep()'));
}

/* ---------- 4. El eslabon que falta ---------- */
function chPickBlank(c){
 var cx=(c.crux&&c.crux.length)?c.crux:[Math.floor(c.nodes.length/2)];
 var valid=cx.filter(function(i){return i>=0&&i<c.nodes.length;});
 if(!valid.length)valid=[Math.floor(c.nodes.length/2)];
 return valid[(chSt(c.id).nb||0)%valid.length];
}
function chRenderLink(){
 var c=chSess.chain;
 if(chSess.st.bi===undefined)chSess.st.bi=chPickBlank(c);
 var bi=chSess.st.bi;
 document.getElementById('chBody').innerHTML=chHead('Falta un eslabon. Escribelo con tus palabras.')
  +'<ol class="chlist">'+c.nodes.map(function(t,i){
     if(i===bi)return '<li class="chnode blank"><span class="chnum">'+(i+1)+'</span><span class="chblank">?</span></li>';
     return '<li class="chnode"><span class="chnum">'+(i+1)+'</span><span>'+esc(t)+'</span></li>';}).join('')+'</ol>'
  +'<textarea id="chIn" class="chta" rows="3" placeholder="Escribe el paso que falta..."></textarea>'
  +'<div id="chLinkRes"></div>'
  +chNav(chBtn('Comprobar','chLinkCommit()'));
}
function chLinkCommit(){
 var ta=document.getElementById('chIn');if(!ta)return;
 var txt=(ta.value||'').trim();
 if(txt.length<3){ta.focus();return;}
 ta.readOnly=true;ta.classList.add('locked');
 var c=chSess.chain,bi=chSess.st.bi;
 var a=(c.alts||[]).filter(function(x){return x.i===bi;}),alts=a.length?(a[0].texts||[]):[];
 document.getElementById('chLinkRes').innerHTML=
  '<div class="chmodel"><span class="chml">Respuesta del curso</span><p>'+esc(c.nodes[bi])+'</p>'
  +(alts.length?'<p class="chalt">Tambien vale: '+alts.map(esc).join(' · ')+'</p>':'')+'</div>'
  +chSelfScore('chLinkScore');
 var nav=document.querySelector('#chBody .chnav');if(nav)nav.innerHTML='';
}
function chLinkScore(v){chSess.selfs.push(v);chLog(v===2);chNextStep();}

/* ---------- 5. ¿Por que esta flecha? (etiqueta + autoexplicacion) ---------- */
function chRenderWhy(){
 var c=chSess.chain,list=c.why||[];
 if(!list.length)return chNextStep();
 var w=list[(chSt(c.id).nb||0)%list.length];
 if(w.after==null||w.after<0||w.after+1>=c.nodes.length)return chNextStep();
 chSess.st.w=w;
 var opts=chShuffle([w.tag].concat(w.lureTags||[]),c.id+'why');
 chSess.st.opts=opts;
 document.getElementById('chBody').innerHTML=chHead('¿Por que esta flecha? Aqui vive el razonamiento causal.')
  +'<div class="chedge"><div class="chnode small"><span class="chnum">'+(w.after+1)+'</span><span>'+esc(c.nodes[w.after])+'</span></div>'
  +'<div class="charrow">&#8595;</div>'
  +'<div class="chnode small"><span class="chnum">'+(w.after+2)+'</span><span>'+esc(c.nodes[w.after+1])+'</span></div></div>'
  +'<label class="chlab" for="chTag">Tipo de enlace</label>'
  +'<select id="chTag" class="chsel" onchange="chWhyCheck()"><option value="-1">Elige...</option>'
  +opts.map(function(t){return '<option value="'+t+'">'+esc(EDGE_TAGS[t]||'?')+'</option>';}).join('')+'</select>'
  +'<label class="chlab" for="chIn">'+esc(w.q)+'</label>'
  +'<textarea id="chIn" class="chta" rows="3" placeholder="Explica el mecanismo (minimo 15 caracteres)..." oninput="chWhyCheck()"></textarea>'
  +'<div id="chWhyRes"></div>'
  +chNav('<button class="btn primary" id="chWhyBtn" style="background:'+DATA[chSess.sol].color+'" onclick="chWhyCommit()" disabled>Comprobar</button>');
}
function chWhyCheck(){
 var ta=document.getElementById('chIn'),sel=document.getElementById('chTag'),b=document.getElementById('chWhyBtn');
 if(!ta||!sel||!b)return;
 b.disabled=!((ta.value||'').trim().length>=15&&sel.value!=='-1');
}
function chWhyCommit(){
 var ta=document.getElementById('chIn'),sel=document.getElementById('chTag');
 if(!ta||!sel)return;
 var txt=(ta.value||'').trim(),pick=parseInt(sel.value,10),w=chSess.st.w,ok=(pick===w.tag);
 ta.readOnly=true;ta.classList.add('locked');sel.disabled=true;
 var norm=function(x){return String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');};
 var hit=(w.keys||[]).filter(function(k){return norm(txt).indexOf(norm(k))>=0;});
 document.getElementById('chWhyRes').innerHTML=
  '<div class="chreveal '+(ok?'ok':'no')+'"><b>Tipo de enlace: </b>'+esc(EDGE_TAGS[w.tag]||'?')
  +(ok?' — correcto.':' — tu elegiste "'+esc(EDGE_TAGS[pick]||'?')+'".')+'</div>'
  +'<div class="chcmp"><div class="chcol"><span class="chml">Lo que escribiste</span><p id="chYou"></p></div>'
  +'<div class="chcol"><span class="chml">Respuesta del curso</span><p>'+w.model+'</p></div></div>'
  +(hit.length?'<p class="chchips">Ideas que mencionaste: '+hit.map(function(k){return '<span class="chip">'+esc(k)+'</span>';}).join('')+'</p>':'')
  +chSelfScore('chWhyScore');
 document.getElementById('chYou').textContent=txt;   /* texto del alumno: NUNCA innerHTML */
 chSaveNote(chSess.chain.id,w.after,txt);
 var nav=document.querySelector('#chBody .chnav');if(nav)nav.innerHTML='';
}
function chWhyScore(v){chSess.selfs.push(v);chLog(v===2);chNextStep();}
function chSaveNote(id,idx,txt){
 var st=chSt(id);st.notes=st.notes||{};
 st.notes[idx]=(st.notes[idx]||[]).concat([{t:Date.now(),txt:String(txt).slice(0,600)}]).slice(-3);
 saveCH();
}

/* ---------- 6. Volcado (recuerdo libre contra checklist) ---------- */
function chRenderDump(){
 var c=chSess.chain;
 document.getElementById('chBody').innerHTML=chHead('Volcado: escribe TODO el mecanismo, del agente a la manifestacion.')
  +'<div class="chtimer" id="chTw"><span id="chT">90</span>s <button class="btn-mini" onclick="chStopTimer()">sin tiempo</button></div>'
  +'<textarea id="chIn" class="chta" rows="8" placeholder="Escribe el mecanismo completo, paso a paso..."></textarea>'
  +'<div id="chDumpRes"></div>'
  +chNav(chBtn('Listo','chDumpCommit()'));
 chStartTimer();
}
function chStartTimer(){
 chStopTimer();var left=90;
 chTimer=setInterval(function(){
  left--;var el=document.getElementById('chT');
  if(!el){chStopTimer();return;}
  el.textContent=left<0?0:left;
  if(left<=0){var w=document.getElementById('chTw');if(w)w.classList.add('over');chStopTimer();}
 },1000);
}
function chStopTimer(){if(chTimer){clearInterval(chTimer);chTimer=null;}}
function chDumpCommit(){
 chStopTimer();
 var ta=document.getElementById('chIn');if(!ta)return;
 ta.readOnly=true;ta.classList.add('locked');
 var c=chSess.chain;
 document.getElementById('chDumpRes').innerHTML=
  '<p class="chlab">Marca los pasos que SI escribiste:</p><ul class="chchk">'
  +c.nodes.map(function(t){return '<li><label><input type="checkbox" class="dumpChk"><span>'+esc(t)+'</span></label></li>';}).join('')
  +'</ul>'+chNav(chBtn('Ver cobertura','chDumpScore()'));
 var nav=document.querySelector('#chBody > .chnav');if(nav)nav.innerHTML='';
}
function chDumpScore(){
 var c=chSess.chain,n=document.querySelectorAll('#chBody .dumpChk:checked').length;
 var tot=c.nodes.length,pct=Math.round(n/tot*100);
 chLog(pct>=70);chSess.selfs.push(pct>=70?2:(pct>=40?1:0));
 document.getElementById('chDumpRes').innerHTML='<div class="chreveal '+(pct>=70?'ok':'no')+'"><b>Cobertura '+n+' de '+tot+'</b> ('+pct+'%). '
  +(pct>=70?'Solido: puedes PRODUCIR el mecanismo, no solo reconocerlo.'
           :'Lo lees con fluidez pero aun no lo produces. Esa brecha es justo lo que mide este ejercicio.')+'</div>'
  +chNav(chBtn('Continuar','chNextStep()'));
}

/* ---------- cierre de cadena: nivel + programacion ---------- */
function chFinishChain(){
 chStopTimer();
 var c=chSess.chain,st=chSt(c.id),selfs=chSess.selfs||[];
 var worst=selfs.length?Math.min.apply(null,selfs):2;
 var lvl=st.lvl||1;
 if(worst===0){lvl=Math.max(1,lvl-1);st.box=1;}
 else{lvl=Math.min(4,lvl+1);st.box=Math.min(6,(st.box||1)+1);}
 st.lvl=lvl;st.nb=(st.nb||0)+1;
 st.due=Date.now()+(CH_DAYS[st.box]||0)*DAY_MS;
 saveCH();
 var days=Math.round((st.due-Date.now())/DAY_MS),last=(chSess.qi+1>=chSess.queue.length);
 document.getElementById('chBody').innerHTML='<div class="chdone">'
  +'<div class="chladder">'+[1,2,3,4].map(function(l){return '<i class="'+(l<=lvl?'on':'')+'"></i>';}).join('')+'</div>'
  +'<h3>Nivel '+lvl+' de 4</h3><p class="chdt">'+esc(c.title)+'</p>'
  +'<p class="chnext">'+(days<=0?'La vuelves a ver en la proxima sesion.':'La vuelves a ver en '+days+' dia'+(days===1?'':'s')+'.')+'</p>'
  +chNav(chBtn(last?'Terminar':'Siguiente cadena','chNextChain()'))+'</div>';
}
function chNextChain(){chSess.qi++;chStart();}
function chRenderQueueDone(){
 var done=chSess.qi>0;
 document.getElementById('chBody').innerHTML='<div class="chdone"><h3>'+(done?'Sesion completa':'Todo al dia')+'</h3>'
  +'<p class="chdt">'+(done?'Terminaste las cadenas de hoy.':'No tienes cadenas pendientes para hoy.')+'</p>'
  +chNav('<button class="btn" onclick="chFree()">Repasar igual</button>')+'</div>';
}
function chFree(){
 var all=chAll(chSess.sol);
 chSess={sol:chSess.sol,queue:all.map(function(c){return c.id;}).slice(0,CH_MAX),qi:0,chain:null,steps:[],si:0,st:{},selfs:[],free:true};
 if(!chSess.queue.length)return chRenderQueueDone();
 chStart();
}

route();

/* Arranque: la portada se re-dibuja en el momento exacto en que se levanta el velo,
   para que la secuencia de entrada se vea completa y no por la mitad. */
(function(){
 var b=document.getElementById('boot');
 if(!b)return;
 var quiet=false;
 try{quiet=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){}
 if(quiet){b.style.display='none';return;}
 var seen=false;
 try{seen=!!sessionStorage.getItem('fp_booted');sessionStorage.setItem('fp_booted','1');}catch(e){}
 if(seen)b.classList.add('skip');
 var delay=seen?200:1050;
 var lifted=false;
 function lift(){
  if(lifted)return;lifted=true;
  if(VIEW.screen==='home')route();
  setTimeout(function(){b.style.display='none';},700);
 }
 var timer=setTimeout(lift,delay);
 function skip(){
  if(lifted)return;
  clearTimeout(timer);b.classList.add('skip');lift();
 }
 b.addEventListener('click',skip);
 window.addEventListener('keydown',skip,{once:true});
 /* Red de seguridad: pase lo que pase, el velo se va. */
 setTimeout(function(){b.style.display='none';},3000);
})();
