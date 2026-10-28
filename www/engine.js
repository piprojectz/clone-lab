/* Breeding engine — shared by the page and its background worker */
function ENGINE(){
  const G='GYHWX';
  const W=[3,3,3,5,5];           // weights x5: green 0.6, red 1.0
  const PTS=[1,1,0.5,0,0];
  const enc=s=>Array.from(s,c=>G.indexOf(c));
  const keyToStr=k=>{let s='';for(let i=0;i<6;i++){s+=G[k%5];k=Math.floor(k/5);}return s};
  const score=s=>{let t=0;for(const c of s)t+=PTS[G.indexOf(c)];return t};
  const counts=s=>{const c={G:0,Y:0,H:0,W:0,X:0};for(const ch of s)c[ch]++;return c};
  const hits=(s,t)=>{const c=counts(s);return c.G===t.G&&c.Y===t.Y&&c.H===t.H};
  const closeness=(s,t)=>{const c=counts(s);return Math.min(c.G,t.G)+Math.min(c.Y,t.Y)+Math.min(c.H,t.H)};

  function permute(arr,fn){
    const a=arr.slice(),n=a.length,c=new Array(n).fill(0);fn(a);let i=0;
    while(i<n){if(c[i]<i){const j=i%2?c[i]:0;const t=a[j];a[j]=a[i];a[i]=t;fn(a);c[i]++;i=0;}else{c[i]=0;i++;}}
  }

  // Deterministic crossbreed for a physical planting order (array of gene strings)
  function breed(order){
    const child=[],slots=[];
    for(let s=0;s<6;s++){
      const tally=[0,0,0,0,0];
      for(const p of order){const g=G.indexOf(p[s]);tally[g]+=W[g];}
      const max=Math.max(...tally);const top=[];
      for(let g=0;g<5;g++) if(max>0&&tally[g]===max) top.push(g);
      let win=top[0],decidedBy=-1;
      if(top.length>1){for(let i=0;i<order.length;i++){const g=G.indexOf(order[i][s]);if(top.includes(g)){win=g;decidedBy=i;break;}}}
      child.push(G[win]);
      slots.push({tally:tally.map(v=>v/5),top:top.map(g=>G[g]),win:G[win],decidedBy});
    }
    return {child:child.join(''),slots};
  }

  // Exhaustive search over plant multisets. restrictFrom: only keep combos containing an index >= it.
  function search(strs,K,restrictFrom,prog){
    const N=strs.length,gs=strs.map(enc),best=new Map(),tally=new Int16Array(30),combo=[];
    const R=restrictFrom==null?-1:restrictFrom;let virt=0;
    function consider(key,chance,order){
      const cur=best.get(key),n=combo.length;
      if(!cur||chance>cur.chance+1e-9||(Math.abs(chance-cur.chance)<1e-9&&n<cur.combo.length))
        best.set(key,{key,chance,combo:combo.slice(),order:order?order.slice():null});
    }
    const win=[0,0,0,0,0,0],mask=[0,0,0,0,0,0];
    function evaluate(){
      let ties=0;
      for(let s=0;s<6;s++){
        let mx=0;for(let g=0;g<5;g++){const v=tally[s*5+g];if(v>mx)mx=v;}
        let m=0,c=0,w=0;for(let g=0;g<5;g++)if(tally[s*5+g]===mx){m|=1<<g;c++;w=g;}
        mask[s]=m;win[s]=w;if(c>1)ties|=1<<s;
      }
      if(!ties){let key=0;for(let s=5;s>=0;s--)key=key*5+win[s];consider(key,1,null);return;}
      const d=[],m=[];for(const i of combo){if(d.length&&d[d.length-1]===i)m[m.length-1]++;else{d.push(i);m.push(1);}}
      const total=combo.length,local=new Map();
      permute(d,perm=>{
        let p=1,rem=total;for(const i of perm){const mi=m[d.indexOf(i)];p*=mi/rem;rem-=mi;}
        let key=0;
        for(let s=5;s>=0;s--){let w=win[s];if(ties>>s&1){for(const i of perm){const g=gs[i][s];if(mask[s]>>g&1){w=g;break;}}}key=key*5+w;}
        const L=local.get(key);if(L)L.p+=p;else local.set(key,{p,perm:perm.slice()});
      });
      for(const [key,v] of local) consider(key,v.p,v.p>0.999999?null:v.perm);
    }
    function rec(start){
      for(let i=start;i<N;i++){
        if(combo.length===0&&prog)prog(i/N);
        combo.push(i);const g=gs[i];for(let s=0;s<6;s++)tally[s*5+g[s]]+=W[g[s]];if(R>=0&&i>=R)virt++;
        if(combo.length>=2&&(R<0||virt>0))evaluate();
        if(combo.length<K)rec(i);
        for(let s=0;s<6;s++)tally[s*5+g[s]]-=W[g[s]];if(R>=0&&i>=R)virt--;combo.pop();
      }
    }
    rec(0);
    return best;
  }

  function rankFn(t){
    return (a,b)=>(hits(b.child,t)-hits(a.child,t))||(closeness(b.child,t)-closeness(a.child,t))||(score(b.child)-score(a.child))||(b.chance-a.chance)||(a.combo.length-b.combo.length);
  }

  function searchAll(args,prog){
    const {pool,K,gen2,target}=args;const strs=pool.map(p=>p.g),N=strs.length;
    const g1=search(strs,K,null,p=>prog&&prog(gen2?p*0.5:p));
    const have=new Set(strs);
    let list1=[...g1.values()].map(r=>({...r,child:keyToStr(r.key),gen:1}));
    list1.sort(rankFn(target));
    let list2=[],virt=[];
    if(gen2&&N>=2){
      virt=list1.filter(r=>!have.has(r.child)).sort((a,b)=>(score(b.child)-score(a.child))||(closeness(b.child,target)-closeness(a.child,target))||(b.chance-a.chance)).slice(0,20);
      const strs2=strs.concat(virt.map(v=>v.child));
      const g2=search(strs2,Math.min(K,4),N,p=>prog&&prog(0.5+p*0.5));
      for(const r of g2.values()){if(!g1.has(r.key)&&!have.has(keyToStr(r.key)))list2.push({...r,child:keyToStr(r.key),gen:2});}
      list2.sort(rankFn(target));
    }
    return {gen1:list1.slice(0,150),gen2:list2.slice(0,60),virt,N};
  }

  // What single new clone (pattern) would complete the target, combined with clones you own?
  function need(args,prog){
    const {pool,K,target}=args;const gs=pool.map(p=>enc(p.g)),N=gs.length;
    const T=[target.G,target.Y,target.H],Kn=Math.min(Math.max(K,2),4);
    const out=new Map(),combo=[],tally=new Int16Array(30);
    const pop=m=>{let c=0;while(m){c+=m&1;m>>=1;}return c};
    function evalE(){
      const d=[];for(const i of combo)if(d[d.length-1]!==i)d.push(i);
      for(let c=1;c<=Math.min(2,Kn-combo.length);c++){
        permute(d,perm=>{
          for(let pos=0;pos<2;pos++){
            const om=[];
            for(let s=0;s<6;s++){
              const r=[0,0,0];
              for(let g=0;g<5;g++){
                const tv=[0,0,0,0,0];for(let h=0;h<5;h++)tv[h]=tally[s*5+h];tv[g]+=c*W[g];
                let mx=0;for(let h=0;h<5;h++)if(tv[h]>mx)mx=tv[h];
                let cnt=0,w=-1,tm=0;for(let h=0;h<5;h++)if(tv[h]===mx){cnt++;w=h;tm|=1<<h;}
                if(cnt>1){w=-1;
                  if(pos===0&&(tm>>g&1))w=g;
                  else{for(const i of perm){const hg=gs[i][s];if(tm>>hg&1){w=hg;break;}}if(w<0&&(tm>>g&1))w=g;}
                }
                if(w>=0&&w<3)r[w]|=1<<g;
              }
              om.push(r);
            }
            // DP over slots: counts of G,Y (H implied) maximizing log-odds
            let dp=new Map([['0,0',{v:0,ch:[]}]]);
            for(let s=0;s<6;s++){
              const nd=new Map();
              for(const [k,st] of dp){
                const [a,b]=k.split(',').map(Number);const h=s-a-b;
                for(let o=0;o<3;o++){
                  if(!om[s][o])continue;
                  const na=a+(o===0),nb=b+(o===1),nh=h+(o===2);
                  if(na>T[0]||nb>T[1]||nh>T[2])continue;
                  const v=st.v+Math.log(pop(om[s][o])/5),kk=na+','+nb;
                  const cur=nd.get(kk);if(!cur||v>cur.v)nd.set(kk,{v,ch:st.ch.concat(o)});
                }
              }
              dp=nd;
            }
            const fin=dp.get(T[0]+','+T[1]);
            if(!fin)continue;
            const masks=fin.ch.map((o,s)=>om[s][o]);
            const key=masks.join(',');
            const rec={masks,outs:fin.ch.map(o=>G[o]).join(''),prob:Math.exp(fin.v),E:combo.slice(),c,pos,perm:perm.slice()};
            const cur=out.get(key);
            if(!cur||(rec.E.length+rec.c)<(cur.E.length+cur.c)){rec.alts=(cur?cur.alts:0)+1;out.set(key,rec);}else cur.alts++;
          }
        });
      }
    }
    function rec(start){
      for(let i=start;i<N;i++){
        if(combo.length===0&&prog)prog(i/N);
        combo.push(i);const g=gs[i];for(let s=0;s<6;s++)tally[s*5+g[s]]+=W[g[s]];
        evalE();
        if(combo.length<Kn-1)rec(i);
        for(let s=0;s<6;s++)tally[s*5+g[s]]-=W[g[s]];combo.pop();
      }
    }
    rec(0);
    let list=[...out.values()].sort((a,b)=>(b.prob-a.prob)||((a.E.length+a.c)-(b.E.length+b.c)));
    const kept=[];
    for(const r of list){
      if(kept.some(k=>k.masks.every((m,i)=>(r.masks[i]&m)===r.masks[i])))continue; // subsumed by a looser pattern
      kept.push(r);if(kept.length>=6)break;
    }
    return kept;
  }
  return {G,W,PTS,enc,keyToStr,score,counts,hits,closeness,permute,breed,search,searchAll,need,rankFn};
}
function WORKER_MAIN(e){
  const {id,type,args}=e.data;
  const prog=p=>self.postMessage({id,progress:p});
  try{const res=type==='search'?E.searchAll(args,prog):E.need(args,prog);self.postMessage({id,done:true,res});}
  catch(err){self.postMessage({id,error:String(err&&err.message||err)});}
}
