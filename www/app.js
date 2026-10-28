/* ===================== APP ===================== */
const E=ENGINE();
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const geneInfo=c=>'GYHWX'.includes(c)?t('gene_'+c):t('unreadable');
const SEED=['YHHWWH','WHHYWW','XGYXYH','XYHYGX','GHGXGH','WGYHGH','WGYWGH','GWGXXY','WGGWHX','YYGXGX','XGGHGH','HGGXGH','GGGXHW','HHGGHH'];
const PRESETS=[{G:4,Y:2,H:0},{G:3,Y:3,H:0},{G:5,Y:1,H:0},{G:2,Y:4,H:0},{G:4,Y:1,H:1},{G:3,Y:2,H:1}];
const LS='rust-clone-lab.v1';
const uid6=()=>Math.random().toString(36).slice(2,8);
const geneCls=c=>'WX'.includes(c)?'r':c==='?'?'q':'';

function geneHTML(s,cls=''){return '<span class="genes">'+Array.from(s).map(c=>`<span class="gene ${cls} ${geneCls(c)}" title="${esc(geneInfo(c))}">${esc(c)}</span>`).join('')+'</span>'}
const tgtStr=t=>'G'.repeat(t.G)+'Y'.repeat(t.Y)+'H'.repeat(t.H);
const fmtScore=s=>(Math.round(s*10)/10).toString();
const pct=p=>p>=0.9995?'100%':p<0.01?'<1%':Math.round(p*100)+'%';

/* ---------- state + persistence ---------- */
function seedState(){
  return {v:1,updatedAt:0,active:'l1',target:{G:4,Y:2,H:0},K:4,gen2:true,sort:'new',
    lists:[{id:'l1',name:t('example_list'),example:true,next:SEED.length+1,clones:SEED.map((g,i)=>({id:'c'+(i+1),n:i+1,g,on:true,t:i}))}]};
}
function normalize(s){
  if(!s||!Array.isArray(s.lists)||!s.lists.length)return seedState();
  s.target=s.target||{G:4,Y:2,H:0};s.K=s.K||4;if(s.gen2===undefined)s.gen2=true;s.sort=s.sort||'new';
  for(const l of s.lists){if(l.example&&l.id==='l1')l.name=t('example_list');l.clones=l.clones||[];l.next=l.next||(l.clones.reduce((m,c)=>Math.max(m,c.n),0)+1);}
  if(!s.lists.find(l=>l.id===s.active))s.active=s.lists[0].id;
  return s;
}
let S;
try{S=normalize(JSON.parse(localStorage.getItem(LS)));}catch(e){S=seedState();}
const L=()=>S.lists.find(l=>l.id===S.active);

function save(){
  S.updatedAt=Date.now();
  try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){toast(t('save_fail'));}
}

/* ---------- toast + sheets ---------- */
let toastT;
function toast(msg,undo){
  clearTimeout(toastT);const h=$('#toastHost');
  h.innerHTML=`<div class="toast" role="status"><span>${msg}</span>${undo?`<button id="undoBtn">${t('undo')}</button>`:''}</div>`;
  if(undo)$('#undoBtn').onclick=()=>{undo();h.innerHTML='';};
  toastT=setTimeout(()=>h.innerHTML='',undo?6000:3200);
}
function sheet(html){$('#overlay').innerHTML=`<div class="sheet" id="sheetBg"><div role="dialog" aria-modal="true">${html}</div></div>`;
  $('#sheetBg').addEventListener('click',e=>{if(e.target.id==='sheetBg')closeSheet();});}
function closeSheet(){$('#overlay').innerHTML='';}
const inputStyle='flex:1;min-width:0;padding:10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg);font:inherit';

/* ---------- lists ---------- */
function renderLists(){
  const sel=$('#listSel');sel.innerHTML=S.lists.map(l=>`<option value="${l.id}" ${l.id===S.active?'selected':''}>${esc(l.example?t('example_list'):l.name)} (${l.clones.length})</option>`).join('');
}
$('#listSel').onchange=e=>{S.active=e.target.value;save();renderAll();};
$('#listMenuBtn').onclick=()=>{
  const l=L();
  sheet(`<h2>${t('manage_title')}</h2>
  <div style="display:grid;gap:6px"><label for="renameIn" class="label">${t('list_name')}</label>
  <div class="row"><input id="renameIn" value="${esc(l.name)}" style="${inputStyle}"><button class="btn" id="renameBtn">${t('rename')}</button></div></div>
  <div style="display:grid;gap:6px"><label for="newIn" class="label">${t('new_list_lbl')}</label>
  <div class="row"><input id="newIn" placeholder="${esc(t('new_list_ph'))}" style="${inputStyle}"><button class="btn primary" id="newBtn">${t('create')}</button></div></div>
  <div style="display:grid;gap:6px;border-top:1px solid var(--line);padding-top:12px"><span class="label">${t('backup')}</span>
  <p class="small muted">${t('backup_help')}</p>
  <div class="row"><button class="btn" id="copyBk">${t('copy_backup')}</button><button class="btn ghost" id="showRestore">${t('restore')}</button></div>
  <div id="restoreBox" hidden style="display:grid;gap:6px"><textarea id="restoreIn" placeholder="${esc(t('restore_ph'))}"></textarea><button class="btn primary" id="restoreBtn">${t('restore_btn')}</button></div></div>
  <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:12px">
    <button class="btn danger" id="clearBtn">${t('remove_all')}</button>
    <button class="btn danger" id="delListBtn" ${S.lists.length<2?'disabled':''}>${t('delete_list')}</button></div>
  <button class="btn ghost" id="closeS">${t('done')}</button>`);
  $('#closeS').onclick=closeSheet;
  $('#copyBk').onclick=async()=>{const txt=JSON.stringify(S);try{await navigator.clipboard.writeText(txt);toast(t('backup_copied'));}catch(e){$('#restoreBox').hidden=false;$('#restoreIn').value=txt;$('#restoreIn').select();toast(t('backup_select'));}};
  $('#showRestore').onclick=()=>{$('#restoreBox').hidden=false;$('#restoreIn').value='';$('#restoreIn').focus();};
  armConfirm($('#restoreBtn'),t('confirm_replace'),()=>{let d;try{d=JSON.parse($('#restoreIn').value);}catch(e){toast(t('not_backup_full'));return;}
    if(!d||!Array.isArray(d.lists)){toast(t('not_backup'));return;}const old=S;S=normalize(d);save();closeSheet();renderAll();toast(t('restored'),()=>{S=old;save();renderAll();});});
  $('#renameBtn').onclick=()=>{const v=$('#renameIn').value.trim();if(v){l.name=v;delete l.example;save();renderAll();toast(t('renamed'));}};
  $('#newBtn').onclick=()=>{const v=$('#newIn').value.trim()||t('new_list_default');const nl={id:'l'+uid6(),name:v,next:1,clones:[]};S.lists.push(nl);S.active=nl.id;save();closeSheet();renderAll();toast(t('created',{name:esc(v)}));};
  armConfirm($('#clearBtn'),t('confirm_remove',{n:l.clones.length}),()=>{const old=l.clones;l.clones=[];delete l.example;save();closeSheet();renderAll();toast(t('cleared'),()=>{l.clones=old;save();renderAll();});});
  armConfirm($('#delListBtn'),t('confirm_delete'),()=>{const idx=S.lists.indexOf(l);S.lists.splice(idx,1);S.active=S.lists[0].id;save();closeSheet();renderAll();toast(t('list_deleted'),()=>{S.lists.splice(idx,0,l);S.active=l.id;save();renderAll();});});
};
function armConfirm(btn,label,fn){if(!btn)return;let armed=false;const orig=btn.textContent;btn.onclick=()=>{if(btn.disabled)return;if(armed){fn();return;}armed=true;btn.textContent=label;setTimeout(()=>{armed=false;btn.textContent=orig;},3500);};}

/* ---------- clones ---------- */
let flashId=null;
function addClones(arr){
  const l=L();const have=new Map(l.clones.map(c=>[c.g,c]));let added=0,dups=[];const now=Date.now();
  for(const g of arr){
    if(have.has(g)){dups.push(have.get(g).n);continue;}
    const c={id:'c'+uid6(),n:l.next++,g,on:true,t:now+added};l.clones.push(c);have.set(g,c);added++;flashId=c.id;
  }
  if(added){delete l.example;save();}
  renderAll();
  return {added,dups};
}
function renderClones(){
  const l=L();const list=l.clones.slice();
  const srt=S.sort;
  if(srt==='num')list.sort((a,b)=>a.n-b.n);else if(srt==='score')list.sort((a,b)=>E.score(b.g)-E.score(a.g)||a.n-b.n);else list.sort((a,b)=>(b.t||0)-(a.t||0)||b.n-a.n);
  $('#sortSel').value=srt;
  const on=l.clones.filter(c=>c.on).length;
  $('#countLbl').textContent=l.clones.length?t('count_lbl',{n:l.clones.length,on}):'';
  $('#navCount').textContent=t('nav_count',{n:l.clones.length});
  $('#exampleNotice').innerHTML=l.example?`<div class="notice"><p>${t('example_notice')}</p></div>`:'';
  if(!list.length){$('#clist').innerHTML=`<div class="empty-state">${t('empty_list')}</div>`;return;}
  $('#clist').innerHTML=list.map(c=>`<div class="citem ${c.on?'':'off'} ${c.id===flashId?'flash':''}" data-id="${c.id}">
    <span class="num">#${c.n}</span><button class="editg" data-act="edit" aria-label="${esc(t('edit_aria',{n:c.n}))}">${geneHTML(c.g)}</button><span class="sc" title="${esc(t('score'))}">${fmtScore(E.score(c.g))}</span>
    <button class="tog" data-act="tog" aria-pressed="${c.on}">${c.on?t('in_use'):t('skipped')}</button>
    <button class="del" data-act="del" aria-label="${esc(t('delete_clone',{n:c.n}))}">×</button></div>`).join('');
  flashId=null;
}
$('#sortSel').onchange=e=>{S.sort=e.target.value;save();renderClones();};
$('#clist').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const row=b.closest('.citem');const l=L();const c=l.clones.find(x=>x.id===row.dataset.id);if(!c)return;
  if(b.dataset.act==='tog'){c.on=!c.on;save();renderAll();}
  if(b.dataset.act==='edit'){editClone(c);}
  if(b.dataset.act==='del'){const i=l.clones.indexOf(c);l.clones.splice(i,1);save();renderAll();toast(t('deleted',{n:c.n}),()=>{l.clones.splice(i,0,c);save();renderAll();});}
};

/* edit a saved clone */
function editClone(c){
  let g=c.g,typed='';
  const keys='GYHWX';
  const draw=()=>{
    sheet(`<h2>${t('edit_title',{n:c.n})}</h2><p class="muted small">${t('edit_help')}</p>
      <div class="slots" id="edSlots">${Array.from(g).map((ch,j)=>`<button class="gene ${geneCls(ch)}" data-j="${j}" aria-label="${esc(t('gene_aria',{j:j+1,c:ch}))}">${ch}</button>`).join('')}</div>
      <div class="keypad" id="edPad">${Array.from(keys).map(k=>`<button class="k ${'WX'.includes(k)?'r':''}" data-k="${k}">${k}<span>${t('k_'+k)}</span></button>`).join('')}</div>
      <p class="small" id="edMsg" style="color:var(--warn);min-height:1.2em"></p>
      <div class="row"><button class="btn primary" id="edSave" style="flex:1">${t('save')}</button><button class="btn ghost" id="closeS">${t('cancel')}</button></div>`);
    $('#closeS').onclick=closeSheet;
    $('#edSlots').onclick=e=>{const b=e.target.closest('[data-j]');if(!b)return;const j=+b.dataset.j;g=g.slice(0,j)+keys[(keys.indexOf(g[j])+1)%5]+g.slice(j+1);typed='';draw();};
    $('#edPad').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;typed+=b.dataset.k;g=(typed+g.slice(typed.length)).slice(0,6);if(typed.length>=6)typed='';draw();
      const sl=$('#edSlots').children;for(let j=0;j<sl.length;j++)sl[j].style.outline=j===typed.length&&typed.length?'2px solid var(--accent)':'';};
    $('#edSave').onclick=()=>{
      const dup=L().clones.find(x=>x.g===g&&x!==c);
      if(dup){$('#edMsg').textContent=t('dup_of',{n:dup.n});return;}
      if(g!==c.g){c.g=g;flashId=c.id;save();renderAll();toast(t('edited',{n:c.n}));}
      closeSheet();
    };
  };
  draw();
}

/* keypad */
let draft='';
function renderSlots(){$('#slots').innerHTML=Array.from({length:6},(_,i)=>draft[i]?`<span class="gene ${geneCls(draft[i])}">${draft[i]}</span>`:`<span class="gene empty"></span>`).join('');}
$('#keypad').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;if(draft.length<6)draft+=b.dataset.k;renderSlots();
  if(draft.length===6){const g=draft;setTimeout(()=>{const r=addClones([g]);draft='';renderSlots();toast(r.added?t('added_as',{g,n:L().next-1}):t('already',{g,n:r.dups[0]}));},180);}};
$('#kBack').onclick=()=>{draft=draft.slice(0,-1);renderSlots();};
$('#kClear').onclick=()=>{draft='';renderSlots();};
document.addEventListener('keydown',e=>{if($('#tab-clones').hidden||$('#overlay').innerHTML||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const k=e.key.toUpperCase();
  if('GYHWX'.includes(k)&&k.length===1){$(`#keypad [data-k="${k}"]`).click();}else if(e.key==='Backspace'){$('#kBack').click();}});
$('#pasteBtn').onclick=()=>{const found=($('#pasteBox').value.toUpperCase().match(/[GYHWX]{6}/g)||[]);
  if(!found.length){toast(t('no_codes'));return;}
  const r=addClones(found);$('#pasteBox').value='';toast(t('added_n',{n:r.added})+(r.dups.length?t('dups_in_list',{n:r.dups.length}):''));};

/* ---------- scan review ---------- */
function reviewScan(found){
  const l=L();const have=new Map(l.clones.map(c=>[c.g,c.n]));
  if(!found.length){sheet(`<h2>${t('no_genes')}</h2><p>${t('no_genes_help')}</p><button class="btn" id="closeS">${t('ok')}</button>`);$('#closeS').onclick=closeSheet;return;}
  const rows=found.map((f,i)=>({...f,keep:!have.has(f.g),i}));
  const draw=()=>{
    const ok=rows.filter(r=>r.keep&&!r.g.includes('?')).length;
    sheet(`<h2>${t('check_read')}</h2><p class="muted small">${t('check_help')}</p>
    <div>${rows.map(r=>{const dup=have.get(r.g);return `<div class="scanrow" data-i="${r.i}">
      ${r.img?`<img src="${r.img}" alt="${esc(t('photo',{n:r.i+1}))}">`:'<span></span>'}
      <div style="display:grid;gap:4px;min-width:0"><span class="genes">${Array.from(r.g).map((c,j)=>`<button class="gene ${geneCls(c)}" data-j="${j}" aria-label="${esc(t('gene_aria',{j:j+1,c}))}">${c}</button>`).join('')}</span>
      <span class="small muted">${r.low?t('low_conf'):''}${dup?` <span class="dup">${t('already_saved_as',{n:dup})}</span>`:''}</span></div>
      <label class="switch small"><input type="checkbox" ${r.keep?'checked':''} data-keep> ${t('add')}</label></div>`}).join('')}</div>
    <div class="row"><button class="btn primary" id="addScan" style="flex:1" ${ok?'':'disabled'}>${t('add_n_btn',{n:ok})}</button><button class="btn ghost" id="closeS">${t('cancel')}</button></div>`);
    $('#closeS').onclick=closeSheet;
    document.querySelectorAll('.scanrow').forEach(el=>{const r=rows[el.dataset.i];
      el.querySelectorAll('button.gene').forEach(b=>b.onclick=()=>{const j=+b.dataset.j;const cyc='GYHWX';const cur=r.g[j];const nx=cur==='?'?'G':cyc[(cyc.indexOf(cur)+1)%5];r.g=r.g.slice(0,j)+nx+r.g.slice(j+1);draw();});
      el.querySelector('[data-keep]').onchange=e=>{r.keep=e.target.checked;draw();};});
    $('#addScan').onclick=()=>{const gs=rows.filter(r=>r.keep&&!r.g.includes('?')).map(r=>r.g);const res=addClones(gs);closeSheet();toast(t('added_n',{n:res.added})+(res.dups.length?t('dups_saved',{n:res.dups.length}):''));};
  };
  draw();
}

/* ---------- breed tab ---------- */
function renderTarget(){
  const tg=S.target;
  $('#target').innerHTML=['G','Y','H'].map(k=>`<div class="step"><span class="gene">${k}</span><div class="ctl"><button data-d="-1" data-g="${k}" aria-label="${esc(t('fewer',{k}))}">−</button><span class="v">${tg[k]}</span><button data-d="1" data-g="${k}" aria-label="${esc(t('more',{k}))}">+</button></div><span class="label">${t('t_'+k)}</span></div>`).join('');
  $('#presets').innerHTML=PRESETS.map((p,i)=>`<button class="preset ${p.G===tg.G&&p.Y===tg.Y&&p.H===tg.H?'on':''}" data-p="${i}">${tgtStr(p)}</button>`).join('');
  const sum=tg.G+tg.Y+tg.H;
  $('#targetMsg').innerHTML=sum===6?t('target_msg',tg):`<span style="color:var(--warn)">${t('target_bad',{s:sum})}</span>`;
  $('#calcBtn').disabled=sum!==6||running;
  $('#kRange').value=S.K;$('#kVal').textContent=S.K;$('#gen2Chk').checked=S.gen2;
}
$('#target').onclick=e=>{const b=e.target.closest('button[data-g]');if(!b)return;const tg=S.target,k=b.dataset.g,d=+b.dataset.d;tg[k]=Math.max(0,Math.min(6,tg[k]+d));
  if(tg.G+tg.Y+tg.H>6){for(const o of['H','Y','G'])if(o!==k&&tg[o]>0&&tg.G+tg.Y+tg.H>6)tg[o]--;}save();renderTarget();};
$('#presets').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;S.target={...PRESETS[+b.dataset.p]};save();renderTarget();runCalc();};
$('#kRange').oninput=e=>{S.K=+e.target.value;$('#kVal').textContent=S.K;};
$('#kRange').onchange=()=>{save();};
$('#gen2Chk').onchange=e=>{S.gen2=e.target.checked;save();};
$('#calcBtn').onclick=()=>runCalc();

let worker=null,jobId=0;const jobs=new Map();
function getWorker(){
  if(worker)return worker;
  try{
    const src='const E=('+ENGINE.toString()+')();\nself.onmessage='+WORKER_MAIN.toString()+';';
    worker=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    worker.onmessage=e=>{const j=jobs.get(e.data.id);if(!j)return;if(e.data.progress!=null)j.prog(e.data.progress);else{jobs.delete(e.data.id);e.data.error?j.rej(e.data.error):j.res(e.data.res);}};
  }catch(e){worker=false;}
  return worker;
}
function job(type,args,prog){
  const w=getWorker();
  if(!w)return new Promise(r=>setTimeout(()=>r(type==='search'?E.searchAll(args,prog):E.need(args,prog)),30));
  return new Promise((res,rej)=>{const id=++jobId;jobs.set(id,{res,rej,prog});w.postMessage({id,type,args});});
}
function combosCount(n,k){let s=0;for(let z=2;z<=k;z++){let c=1;for(let i=0;i<z;i++)c=c*(n+z-1-i)/(i+1);s+=c;}return s;}

let lastSig='',lastRes=null,running=false;
const pool=()=>L().clones.filter(c=>c.on).map(c=>({n:c.n,g:c.g}));
function sig(){return JSON.stringify([S.active,pool().map(p=>p.g),S.K,S.gen2,S.target]);}
async function runCalc(){
  if(running)return;
  const tg=S.target;if(tg.G+tg.Y+tg.H!==6)return;
  const P=pool();const out=$('#results');
  if(P.length<2){lastRes=null;out.innerHTML=`<div class="panel"><p>${t('need_two')}</p></div>`;return;}
  let K=S.K;let note=null;
  while(K>2&&combosCount(P.length,K)>4e6){K--;}
  if(K<S.K)note={n:P.length,want:S.K,got:K};
  running=true;$('#calcBtn').disabled=true;$('#calcBtn').textContent=t('calcing');
  const bar=$('#prog');bar.hidden=false;const fill=bar.firstElementChild;fill.style.width='2%';
  const s0=sig();
  try{
    const res=await job('search',{pool:P,K,gen2:S.gen2,target:tg},p=>fill.style.width=Math.round(p*70)+'%');
    let need=null;
    if(!res.gen1.find(r=>E.hits(r.child,tg))){fill.style.width='75%';need=await job('need',{pool:P,K,target:tg},p=>fill.style.width=Math.round(75+p*25)+'%');}
    lastRes={...res,need,pool:P,target:{...tg},K,note};lastSig=s0;
    renderResults();
  }catch(e){out.innerHTML=`<div class="panel"><p>${t('calc_fail',{e:esc(e)})}</p></div>`;}
  running=false;$('#calcBtn').disabled=false;$('#calcBtn').textContent=t('calc');bar.hidden=true;
}

/* recipes */
function labelFor(i,res){return i<res.N?'#'+res.pool[i].n:t('step1_clone');}
function genesFor(i,res){return i<res.N?res.pool[i].g:res.virt[i-res.N].child;}
function physicalOrder(r){ // distinct planting order (with copies) for a record
  const d=[],m=[];for(const i of r.combo){if(d.length&&d[d.length-1]===i)m[m.length-1]++;else{d.push(i);m.push(1);}}
  const ord=r.order||d;const phys=[];for(const i of ord){const k=m[d.indexOf(i)];for(let j=0;j<k;j++)phys.push(i);}
  return {d:ord,m:ord.map(i=>m[d.indexOf(i)]),phys};
}
function orderPrefix(r,res){
  const {d,m}=physicalOrder(r);if(!r.order)return 0;
  const expand=arr=>{const out=[];arr.forEach(i=>{const k=m[d.indexOf(i)];for(let j=0;j<k;j++)out.push(genesFor(i,res));});return out;};
  for(let Lp=0;Lp<=d.length;Lp++){
    let same=true;const head=d.slice(0,Lp);
    E.permute(d.slice(Lp),tail=>{if(same&&E.breed(expand(head.concat(tail))).child!==r.child)same=false;});
    if(same)return Lp;
  }
  return d.length;
}
const CELLS=[1,3,5,7,0,2,6,8];
function planterHTML(phys,res){
  const cells=Array(9).fill(null);phys.forEach((i,k)=>{if(k<8)cells[CELLS[k]]={i,k};});
  return `<div class="planter" aria-label="${esc(t('planter_aria'))}">${cells.map((c,idx)=>idx===4?`<div class="cell c"><b>C</b>${t('center_cell')}</div>`:c?`<div class="cell n"><b>${c.k+1}</b>${esc(labelFor(c.i,res))}</div>`:`<div class="cell"></div>`).join('')}</div>`;
}
function stepsHTML(r,res){
  const {d,m}=physicalOrder(r);const Lp=orderPrefix(r,res);
  const items=[];
  const desc=i=>`<b>${esc(labelFor(i,res))}</b> ${geneHTML(genesFor(i,res),'sm')}`;
  const x=k=>m[k]>1?` ×${m[k]}`:'';
  const copies=d.filter((_,k)=>m[k]>1);
  if(copies.length)items.push(t('steps_copies',{list:copies.map(i=>`<b>${esc(labelFor(i,res))}</b> ×${m[d.indexOf(i)]}`).join(t('and'))}));
  items.push(t('steps_center_first',{what:t('clone_word')}));
  items.push(t('steps_wait'));
  if(Lp===0){items.push(t('steps_any',{list:d.map((i,k)=>desc(i)+x(k)).join(', ')}));}
  else{
    d.slice(0,Lp).forEach((i,k)=>items.push(t('steps_nth',{d:desc(i)+x(k),ord:t('ords')[k]||`#${k+1}`})));
    if(Lp<d.length)items.push(t('steps_then',{list:d.slice(Lp).map((i,k)=>desc(i)+x(Lp+k)).join(', ')}));
  }
  items.push(t('steps_done'));
  return `<ol class="steps">${items.map(s=>`<li>${s}</li>`).join('')}</ol>`;
}
function whyHTML(physGenes,labels){
  const {child,slots}=E.breed(physGenes);
  const fmt=v=>v.toFixed(1);
  const head=`<thead><tr><th>${t('th_planted')}</th>${[1,2,3,4,5,6].map(i=>`<th>${t('th_slot',{i})}</th>`).join('')}</tr></thead>`;
  const rows=physGenes.map((g,k)=>`<tr><td><span class="mono">${k+1}.</span> ${esc(labels[k])}</td>${Array.from(g).map(c=>`<td>${geneHTML(c,'sm')}</td>`).join('')}</tr>`).join('');
  const tally=`<tr class="tally"><td>${t('weight')}</td>${slots.map(sl=>{const parts=E.G.split('').map((c,i)=>({c,v:sl.tally[i]})).filter(z=>z.v>0).sort((a,b)=>b.v-a.v);
    return `<td class="${sl.top.length>1?'tie':''}">${parts.map(p=>sl.top.includes(p.c)?`<b>${p.c} ${fmt(p.v)}</b>`:`${p.c} ${fmt(p.v)}`).join('<br>')}</td>`}).join('')}</tr>`;
  const res=`<tr class="res"><td><b>${t('result')}</b></td>${Array.from(child).map(c=>`<td>${geneHTML(c)}</td>`).join('')}</tr>`;
  const notes=[];
  slots.forEach((sl,s)=>{
    if(sl.top.length>1)notes.push(t('note_tie',{s:s+1,genes:sl.top.join(t('and')),v:fmt(sl.tally[E.G.indexOf(sl.top[0])]),who:esc(labels[sl.decidedBy]),pos:sl.decidedBy+1,w:sl.win}));
    else{const w=sl.win;const red=sl.tally[3]+sl.tally[4];
      if('GYH'.includes(w)&&red>0)notes.push(t('note_green',{s:s+1,w,v:fmt(sl.tally[E.G.indexOf(w)]),r:fmt(Math.max(sl.tally[3],sl.tally[4]))}));
      else if('WX'.includes(w))notes.push(t('note_red',{s:s+1,w}));}
  });
  return `<div class="tablewrap"><table class="why">${head}<tbody>${rows}${tally}${res}</tbody></table></div>${notes.length?`<div class="why-notes">${notes.map(n=>`<p>${n}</p>`).join('')}</div>`:''}`;
}
function cardHTML(r,res,idx,open){
  const hit=E.hits(r.child,res.target);
  const {phys,d,m}=physicalOrder(r);
  const needsOrder=r.chance<0.9995;
  const plants=d.map((i,k)=>esc(labelFor(i,res))+(m[k]>1?'×'+m[k]:'')).join(', ');
  return `<div class="card" data-idx="${idx}"><button class="head" aria-expanded="${!!open}">
    ${geneHTML(r.child)}
    <div class="meta"><span class="pill gen${r.gen}">${t('gen_pill',{n:r.gen})}</span>${hit?`<span class="pill tgt">${t('target_pill')}</span>`:''}<span>${t('score')} <b>${fmtScore(E.score(r.child))}</b></span>
    ${needsOrder?`<span class="order">${t('guar_order')}</span><span>${t('random_order')} <b>${pct(r.chance)}</b></span>`:`<span class="sure">${t('guaranteed')}</span>`}
    <span>${t('plants_n',{n:phys.length,list:plants})}</span></div></button>
    ${open?`<div class="body">${bodyHTML(r,res)}</div>`:''}</div>`;
}
function bodyHTML(r,res){
  const {phys}=physicalOrder(r);
  let pre='';
  if(r.gen===2){
    const vIdx=[...new Set(r.combo.filter(i=>i>=res.N))];
    pre=vIdx.map(vi=>{const v=res.virt[vi-res.N];const vp=physicalOrder(v).phys;
      return `<div style="display:grid;gap:10px"><h3>${t('step1_h')} ${geneHTML(v.child,'sm')}</h3>
      <div class="plan">${planterHTML(vp,res)}${stepsHTML(v,res)}</div>
      <details><summary>${t('why_makes',{g:v.child})}</summary><div style="margin-top:10px">${whyHTML(vp.map(i=>genesFor(i,res)),vp.map(i=>labelFor(i,res)))}</div></details></div>`}).join('')
      +`<h3>${t('step2_h')} ${geneHTML(r.child,'sm')}</h3>`;
  }
  return pre+`<div class="plan">${planterHTML(phys,res)}${stepsHTML(r,res)}</div>
  <div style="display:grid;gap:8px"><span class="label">${t('why_label')}</span>${whyHTML(phys.map(i=>genesFor(i,res)),phys.map(i=>labelFor(i,res)))}</div>`;
}
let shown=12,openIdx=0;
function renderResults(){
  const out=$('#results');const res=lastRes;if(!res){return;}
  const tg=res.target;
  const all=res.gen1.concat(res.gen2).sort(E.rankFn(tg)).filter((r,i,a)=>a.findIndex(z=>z.child===r.child)===i);
  const hit=all.find(r=>E.hits(r.child,tg));
  const best=all[0];
  let head='';
  if(hit){head=`<div class="verdict hit"><span class="label">${t('can_breed')}</span><div class="big">${geneHTML(hit.child)}</div><p>${hit.gen===1?t('one_planting'):t('two_plantings')} ${hit.chance<0.9995?t('order_decides'):t('order_free')}</p></div>`;}
  else if(best){
    head=`<div class="verdict"><span class="label">${t('not_yet')}</span><p>${t('closest',{g:geneHTML(best.child,'sm'),s:fmtScore(E.score(best.child)),c:E.closeness(best.child,tg)})}</p></div>`;
    head+=needHTML(res);
  }
  out.innerHTML=(res.note?`<p class="small" style="color:var(--warn)">${t('k_note',res.note)}</p>`:'')+head+
    `<div class="row" style="justify-content:space-between"><h3>${t('all_results')}</h3><span class="label">${t('n_possible',{n:all.length})}</span></div>`+
    all.slice(0,shown).map((r,i)=>cardHTML(r,res,i,i===openIdx)).join('')+
    (all.length>shown?`<button class="btn" id="moreBtn">${t('show_more')}</button>`:'');
  out.querySelectorAll('.card>.head').forEach(b=>b.onclick=()=>{const i=+b.parentElement.dataset.idx;openIdx=openIdx===i?-1:i;renderResults();});
  const mb=$('#moreBtn');if(mb)mb.onclick=()=>{shown+=15;renderResults();};
}
function needHTML(res){
  const tg=res.target,ts=tgtStr(tg);
  if(!res.need||!res.need.length)return `<div class="panel"><h3>${t('what_need')}</h3><p>${t('no_single',{ts,g:tg.G>=tg.Y?'G':'Y'})}</p></div>`;
  return `<div class="panel need"><div><h3>${t('look_next')}</h3><p class="small muted">${t('look_help',{g:geneHTML(ts,'sm')})}</p></div>`+
  res.need.map(n=>{
    const odds=n.prob>=0.999?t('any_fits'):t('odds',{n:Math.max(2,Math.round(1/n.prob))});
    const slots=n.masks.map(mk=>{const gs=E.G.split('').filter((_,i)=>mk>>i&1);return gs.length===5?`<div class="pslot"><span class="gene sm any">?</span><small>${t('any')}</small></div>`:`<div class="pslot">${geneHTML(gs.join(''),'sm')}<small>${gs.length>1?t('one_of'):t('need')}</small></div>`;}).join('');
    const d=[...new Set(n.E)];const m=d.map(i=>n.E.filter(z=>z===i).length);
    const ord=n.perm.map(i=>`<b>#${res.pool[i].n}</b> ${geneHTML(res.pool[i].g,'sm')}${m[d.indexOf(i)]>1?' ×'+m[d.indexOf(i)]:''}`);
    const newTxt=`<b>${t('new_clone')}</b>${n.c>1?' ×'+n.c:''}`;
    const seq=n.pos===0?[newTxt,...ord]:[...ord,newTxt];
    return `<div class="needcard"><div class="pat">${slots}</div>
      <p class="small">${t('plant_order',{seq:seq.map((s,i)=>`${i+1}. ${s}`).join(' &nbsp; ')})} ${geneHTML(n.outs,'sm')}</p>
      <p class="small muted">${odds}${n.c>1?t('clone_twice'):''}</p></div>`;}).join('')+`</div>`;
}

/* ---------- guide ---------- */
function renderGuide(){
  const cp=t('copy');
  const ex=['YHHWWH','YYGXGX','HGYYGH','HGYYGH'];const exL=['#1','#9','#17',`#17 (${cp})`];
  const exFlip=['HGYYGH','YHHWWH','YYGXGX','HGYYGH'];const exFlipL=['#17','#1','#9',`#17 (${cp})`];
  const table=`<div class="gtable">${'GYHWX'.split('').map(g=>`${geneHTML(g)}<span class="w">${'WX'.includes(g)?'1.0':'0.6'}</span><span>${geneInfo(g)}</span>`).join('')}</div>`;
  $('#guide').innerHTML=t('guide',{why1:whyHTML(ex,exL),why2:whyHTML(exFlip,exFlipL),table});
}

/* ---------- language ---------- */
function setLang(l){
  if(l!==LANG){LANG=l;try{localStorage.setItem('rcl-lang',l);}catch(e){}}
  applyStatic();
  $('#calcBtn').textContent=running?t('calcing'):t('calc');
  renderAll();renderGuide();renderResults();
  if(cam)applyStatic($('#cam'));
}
document.querySelector('.lang').onclick=e=>{const b=e.target.closest('[data-lang]');if(b)setLang(b.dataset.lang);};

/* ---------- tabs + boot ---------- */
document.querySelector('nav.tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;showTab(b.dataset.tab);};
function showTab(tb){
  document.querySelectorAll('nav.tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tb));
  ['clones','breed','guide'].forEach(z=>$('#tab-'+z).hidden=z!==tb);
  try{sessionStorage.setItem('rcl-tab',tb);}catch(e){}
  window.scrollTo(0,0);
  if(tb==='breed'&&sig()!==lastSig&&!running){openIdx=0;shown=12;runCalc();}
}
function renderAll(){renderLists();renderClones();renderTarget();if(lastRes&&sig()!==lastSig&&!$('#tab-breed').hidden){runCalc();}}
applyStatic();renderSlots();renderAll();renderGuide();
try{const tb=sessionStorage.getItem('rcl-tab');if(tb)showTab(tb);}catch(e){}

/* ---------- screenshots: read on the phone ---------- */
$('#picBtn').onclick=()=>$('#picInput').click();
$('#picInput').onchange=async e=>{
  const files=[...e.target.files];e.target.value='';if(!files.length)return;
  sheet(`<h2>${t('reading')}</h2><p class="muted" id="scanStat">${t('reading_n',{n:files.length})}</p><div class="progress"><i style="width:5%"></i></div>`);
  const found=[];
  for(let i=0;i<files.length;i++){
    const st=$('#scanStat');if(st)st.textContent=t('reading_i',{i:i+1,n:files.length});
    try{const rows=await Scanner.readImageFile(files[i]);const thumb=URL.createObjectURL(files[i]);for(const r of rows)found.push({g:r.genes,low:r.conf<0.15,img:thumb});}catch(err){}
    const bar=document.querySelector('.sheet .progress i');if(bar)bar.style.width=Math.round((i+1)/files.length*100)+'%';
  }
  reviewScan(found);
};

/* ---------- live camera scan ---------- */
let cam=null;
function camHTML(){return `<div class="cam" id="cam" role="dialog" data-i18n-aria="cam_aria" aria-label="${esc(t('cam_aria'))}">
  <div class="cam-top"><b data-i18n="cam_title">${t('cam_title')}</b><button class="btn" id="camClose" data-i18n="done">${t('done')}</button></div>
  <div class="cam-stage" id="camStage"><video id="camVid" playsinline muted autoplay></video><canvas id="camOv"></canvas>
    <div class="cam-band" id="camBand"></div><div class="cam-hint" id="camHint" data-i18n="cam_hint">${t('cam_hint')}</div></div>
  <div class="cam-bot">
    <div class="cam-read" id="camRead"><span>${t('cam_start')}</span></div>
    <div class="tiles-dbg" id="camDbg" hidden></div>
    <div class="row" id="zoomRow" hidden><span class="small" data-i18n="zoom">${t('zoom')}</span><input type="range" id="camZoom" class="cam-zoom"></div>
    <div class="row"><label class="switch small"><input type="checkbox" id="camAuto" ${S.autoAdd!==false?'checked':''}> <span data-i18n="auto_add">${t('auto_add')}</span></label><button class="btn primary" id="camAdd" disabled data-i18n="add">${t('add')}</button></div>
    <div class="row"><span class="small" id="camCount"></span><label class="switch small"><input type="checkbox" id="camDbgChk"> <span data-i18n="show_sees">${t('show_sees')}</span></label></div>
  </div></div>`;}
async function openCamera(){
  $('#camHost').innerHTML=camHTML();
  cam={stream:null,timer:null,reads:[],lastSeen:0,candidate:null,work:document.createElement('canvas'),added:0};
  $('#camClose').onclick=closeCamera;
  $('#camAuto').onchange=e=>{S.autoAdd=e.target.checked;save();};
  $('#camDbgChk').onchange=e=>{$('#camDbg').hidden=!e.target.checked;};
  $('#camAdd').onclick=()=>{if(cam&&cam.candidate)commitScan(cam.candidate);};
  await Scanner.init();
  let stream;
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  }catch(e){
    if(cam)$('#camRead').innerHTML=`<span>${t('cam_fail')}</span>`;return;
  }
  if(!cam){stream.getTracks().forEach(tr=>tr.stop());return;}   // closed while the permission prompt was up
  cam.stream=stream;
  const v=$('#camVid');v.srcObject=cam.stream;try{await v.play();}catch(e){}
  const track=cam.stream.getVideoTracks()[0];
  try{const caps=track.getCapabilities&&track.getCapabilities();if(caps&&caps.zoom){const z=$('#camZoom');z.min=caps.zoom.min;z.max=caps.zoom.max;z.step=caps.zoom.step||0.1;z.value=track.getSettings().zoom||caps.zoom.min;$('#zoomRow').hidden=false;
    z.oninput=()=>track.applyConstraints({advanced:[{zoom:+z.value}]}).catch(()=>{});}}catch(e){}
  layoutBand();window.addEventListener('resize',layoutBand);
  $('#camRead').innerHTML=`<span>${t('looking')}</span>`;
  cam.timer=setInterval(scanFrame,140);
}
function layoutBand(){
  const st=$('#camStage');if(!st)return;const W=st.clientWidth,H=st.clientHeight;
  const bw=W*0.92,bh=Math.min(H*0.5,bw*0.24),top=(H-bh)/2;
  const b=$('#camBand');b.style.top=top+'px';b.style.height=bh+'px';
  $('#camHint').style.top=(top+bh+12)+'px';
  const ov=$('#camOv');ov.width=W;ov.height=H;
  if(cam)cam.band={x:W*0.04,y:top,w:bw,h:bh,W,H};
}
function scanFrame(){
  if(!cam||!cam.band)return;const v=$('#camVid');if(!v||!v.videoWidth)return;
  const {x,y,w,h,W,H}=cam.band;
  const sc=Math.max(W/v.videoWidth,H/v.videoHeight),ox=(W-v.videoWidth*sc)/2,oy=(H-v.videoHeight*sc)/2;
  const vx=(x-ox)/sc,vy=(y-oy)/sc,vw=w/sc,vh=h/sc;
  const outW=Math.min(640,Math.round(vw)),k=outW/vw,outH=Math.round(vh*k);
  const c=cam.work;c.width=outW;c.height=outH;const cx=c.getContext('2d',{willReadFrequently:true});
  cx.drawImage(v,vx,vy,vw,vh,0,0,outW,outH);
  let rows=[];try{rows=Scanner.detect(cx.getImageData(0,0,outW,outH));}catch(e){}
  const ov=$('#camOv'),o=ov.getContext('2d');o.clearRect(0,0,ov.width,ov.height);
  const now=Date.now();
  if(!rows.length){
    if(now-cam.lastSeen>1500){cam.reads=[];if(!cam.candidate)$('#camRead').innerHTML=`<span>${t('looking')}</span>`;}
    return;
  }
  cam.lastSeen=now;
  const row=rows.sort((a,b)=>b.conf-a.conf)[0];
  o.lineWidth=2;o.strokeStyle='#8fd14f';
  for(const bx of row.boxes)o.strokeRect(x+bx.x*(w/outW),y+bx.y*(h/outH),bx.w*(w/outW),bx.h*(h/outH));
  if(!$('#camDbg').hidden){$('#camDbg').innerHTML='';row.grids.forEach(g=>{const cv=document.createElement('canvas');Scanner.gridToCanvas(g,cv);$('#camDbg').appendChild(cv);});}
  cam.reads.push(row.genes);if(cam.reads.length>4)cam.reads.shift();
  const same=cam.reads.filter(r=>r===row.genes).length;
  if(same>=3){
    $('#camBand').classList.add('lock');
    if(cam.candidate!==row.genes){cam.candidate=row.genes;onLock(row.genes);}
  }else{
    $('#camBand').classList.remove('lock');
    if(!cam.candidate)$('#camRead').innerHTML=`${geneHTML(row.genes)}<span class="small">${t('hold')}</span>`;
  }
}
function onLock(g){
  const ex=L().clones.find(c=>c.g===g);
  if(ex){$('#camRead').innerHTML=`${geneHTML(g)}<span class="small">${t('already_saved_as',{n:ex.n})}</span>`;$('#camAdd').disabled=true;return;}
  if($('#camAuto').checked)commitScan(g);
  else{$('#camRead').innerHTML=`${geneHTML(g)}<span class="small">${t('tap_add')}</span>`;$('#camAdd').disabled=false;}
}
function commitScan(g){
  if(!cam)return;
  const r=addClones([g]);if(!r.added)return;
  const n=L().next-1;cam.added++;
  try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}
  $('#camRead').innerHTML=`${geneHTML(g)}<span class="small" style="color:#8fd14f">${t('added_as_short',{n})}</span>`;
  $('#camAdd').disabled=true;
  $('#camCount').textContent=t('session_n',{n:cam.added});
  toast(t('added_as',{g,n}),()=>{const l=L();const i=l.clones.findIndex(c=>c.g===g);if(i>=0){l.clones.splice(i,1);save();renderAll();}if(cam){cam.added--;cam.candidate=null;cam.reads=[];$('#camCount').textContent=t('session_n',{n:cam.added});}});
  setTimeout(()=>{if(cam&&cam.candidate===g){cam.reads=[];}},400);
}
function closeCamera(){
  if(!cam)return;clearInterval(cam.timer);
  if(cam.stream)cam.stream.getTracks().forEach(tr=>tr.stop());
  window.removeEventListener('resize',layoutBand);
  const n=cam.added;cam=null;$('#camHost').innerHTML='';
  if(n)toast(t('added_n',{n}));
}
$('#camBtn').onclick=openCamera;
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeCamera();});

/* ---------- Android back button ---------- */
(function initNative(){
  const App=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(!App)return;
  App.addListener('backButton',()=>{
    if(cam){closeCamera();return;}
    if($('#overlay').innerHTML){closeSheet();return;}
    if($('#tab-clones').hidden){showTab('clones');return;}
    App.minimizeApp();
  });
})();
