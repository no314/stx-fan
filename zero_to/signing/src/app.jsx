// App shell: wallet connect/BNS, network switch, URL/localStorage restore,
// picker + account-switch modals. Ported from the approved prototype (app-main.jsx).
import React, { useState, useEffect, useRef } from "react";
import {
  NETWORKS, STEPS, freshFlow, furthestStep, recId, saveRecord, listRecords, loadRecord,
  shortAddr, Btn, StatusLine, Rail,
} from "./core.jsx";
import { Step0, Step1, Step2, Step3, Step4, Step5, StepInfo } from "./steps.jsx";

function resolveFor(nk,useUrl){
  if(useUrl){
    const p=new URLSearchParams(location.search); const id=p.get("id");
    if(id){ const r=loadRecord(nk,id); return {flow:r||freshFlow(nk)}; }
  }
  const recs=listRecords(nk);
  if(recs.length===1) return {flow:recs[0]};
  if(recs.length>1) return {flow:freshFlow(nk),picker:recs};
  return {flow:freshFlow(nk)};
}
function writeUrl(nk,f){
  const p=new URLSearchParams(location.search); p.set("chain",NETWORKS[nk].chainParam);
  if(f&&f.deployTxid) p.set("id",recId(f)); else p.delete("id");
  history.replaceState(null,"",location.pathname+"?"+p.toString());
}

export function App(){
  const [netKey,setNetKey]=useState(()=>{ const c=new URLSearchParams(location.search).get("chain"); return c==="testnet"?"testnet":"mainnet"; });
  const net=NETWORKS[netKey];
  const [account,setAccount]=useState(null);
  // Last connected account, kept across disconnects so reconnecting as a different
  // account triggers the resume dialog (PRD: "On account switch … ask which step to
  // resume, defaulting to step 4"; step 4's rotation sequence is disconnect → reconnect).
  const lastAccountRef=useRef(null);
  const [walletName,setWalletName]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [connErr,setConnErr]=useState(null);
  const memRef=useRef({});
  const [flow,setFlowRaw]=useState(null);
  const [viewStep,setViewStep]=useState(0);
  const [picker,setPicker]=useState(null);
  const [resumeAsk,setResumeAsk]=useState(false);

  function adopt(res,nk){
    memRef.current[nk]=res.flow; setFlowRaw(res.flow); setViewStep(furthestStep(res.flow));
    setPicker(res.picker||null); writeUrl(nk,res.flow);
  }
  useEffect(()=>{ adopt(resolveFor(netKey,true),netKey); },[]);
  useEffect(()=>{ document.body.classList.toggle("net-testnet",netKey==="testnet"); },[netKey]);
  useEffect(()=>{ const close=()=>setMenuOpen(false); document.addEventListener("click",close); return ()=>document.removeEventListener("click",close); },[]);

  function upd(fn,view){
    setFlowRaw(f=>{ let nf=fn(f); if(nf.deployTxid) nf=saveRecord(nf); memRef.current[netKey]=nf; writeUrl(netKey,nf); return nf; });
    if(view!==undefined) setViewStep(view);
  }
  function switchNet(nk){
    if(nk===netKey) return;
    memRef.current[netKey]=flow;
    setNetKey(nk); setConnErr(null);
    const prev=memRef.current[nk];
    if(prev){ adopt({flow:prev},nk); } else { adopt(resolveFor(nk,false),nk); }
    if(account) resolveName(account,NETWORKS[nk]);
  }
  async function resolveName(addr,n){
    setWalletName(null);
    if(!addr||n.key!=="mainnet") return;
    const nm=await window.ZTSLib.resolveBnsName(addr,n.api).catch(()=>null);
    if(nm) setWalletName(nm);
  }
  async function doConnect(){
    setConnErr(null);
    try{
      const res=await window.ZTSLib.connect({network:net.connectValue,forceWalletSelect:true});
      const e=(res?.addresses||[]).find(a=>/^S/.test(a.address||""));
      if(!e){ setConnErr("The wallet returned no STX address."); return; }
      const addr=e.address.toUpperCase();
      const prev=account||lastAccountRef.current;
      lastAccountRef.current=addr;
      setAccount(addr); resolveName(addr,net);
      if(!net.stxPrefix.test(addr)) setConnErr(`Connected ${addr} is not a ${net.label} address. Switch the wallet network and reconnect.`);
      if(prev&&prev!==addr&&flow&&flow.deployTxid) setResumeAsk(true);
    }catch(e){ setConnErr("Connection failed or was cancelled."); }
  }
  async function doDisconnect(){ setMenuOpen(false); try{ await window.ZTSLib.disconnect(); }catch(e){} setAccount(null); setWalletName(null); }

  if(!flow) return null;
  const stepKey=`${netKey}:${flow.deployTxid?recId(flow):"new"}:${viewStep}`;
  const st=flow.stepStatus[viewStep];
  const readOnly=st==="complete"&&viewStep<4;
  const back=viewStep>0?()=>setViewStep(viewStep-1):null;
  const common={ net, flow, account, onConnect:doConnect, onBack:back, readOnly };

  const stepEl={
    0:<Step0 {...common} onDone={()=>upd(f=>({...f,stepStatus:{...f.stepStatus,0:"complete",1:"active"}}),1)}/>,
    1:<Step1 {...common} onDeployed={p=>upd(f=>({...f,...p,stepStatus:{...f.stepStatus,1:"complete",2:"active"}}),2)}/>,
    2:<Step2 {...common} onGrant={(authId,grantJson)=>upd(f=>({...f,authId,grantJson,stepStatus:{...f.stepStatus,2:"complete",3:"active"}}),3)}/>,
    3:<Step3 {...common} onSubmitted={t=>upd(f=>({...f,registerTxid:t}))}
        onRegistered={()=>upd(f=>({...f,registered:true,stepStatus:{...f.stepStatus,3:"complete",4:f.stepStatus[4]==="locked"?"active":f.stepStatus[4]}}),4)}/>,
    4:<Step4 {...common} onAdminTx={a=>upd(f=>({...f,adminAccounts:[...f.adminAccounts,a]}))}
        onSkip={()=>upd(f=>({...f,adminRotationSkipped:true,stepStatus:{...f.stepStatus,4:"skipped",5:"active"}}),5)}
        onComplete={()=>upd(f=>({...f,adminRotationSkipped:false,stepStatus:{...f.stepStatus,4:"complete",5:f.stepStatus[5]==="locked"?"active":f.stepStatus[5]}}),5)}/>,
    5:<Step5 {...common} onStakeTx={t=>upd(f=>({...f,stakeTxids:[...f.stakeTxids,t],stepStatus:{...f.stepStatus,5:"complete"}}))}/>,
  }[viewStep];

  return <div>
    <header className="hdr"><div className="wrap">
      <h1>Zero to Signing</h1><span className="sub">signer sidekick</span>
      <div className="right">
        <select className="netsel" aria-label="Network" value={netKey} onChange={e=>switchNet(e.target.value)}>
          <option value="mainnet">Mainnet</option><option value="testnet">Testnet</option>
        </select>
        <div className="wallet-menu" onClick={e=>e.stopPropagation()}>
          {account
            ? <Btn kind="secondary" onClick={()=>setMenuOpen(o=>!o)}>{walletName||shortAddr(account)} <i className="ph ph-caret-down"></i></Btn>
            : <Btn kind="primary" onClick={doConnect}>Connect wallet</Btn>}
          {menuOpen?<div className="menu"><button onClick={doDisconnect}>Disconnect</button></div>:null}
        </div>
      </div>
    </div></header>
    <main className="wrap">
      <StatusLine kind="err">{connErr}</StatusLine>
      {!account&&flow.deployTxid?<StatusLine kind="info">No wallet connected — the flow is read-only until a wallet reconnects.</StatusLine>:null}
      <Rail flow={flow} viewStep={viewStep} onView={setViewStep}/>
      <section className="panel" style={viewStep===0?{borderTopLeftRadius:0}:null} key={stepKey}>{stepEl}</section>
      <StepInfo step={viewStep} net={net}/>
    </main>
    {picker?<div className="overlay"><div className="modal">
      <h3>Resume a flow</h3>
      <p>More than one flow exists on {net.label}. Pick one to resume, or start new.</p>
      <div className="pick">
        {picker.map(r=><button key={recId(r)} onClick={()=>{ adopt({flow:r},netKey); }}>
          <span className="id">{recId(r)}</span>
          <span className="meta">{STEPS[furthestStep(r)].short} · {r.updatedAt?r.updatedAt.slice(0,10):""}</span>
        </button>)}
      </div>
      <div className="row"><Btn kind="secondary" onClick={()=>{ adopt({flow:freshFlow(netKey)},netKey); }}>Start new</Btn></div>
    </div></div>:null}
    {resumeAsk?<div className="overlay"><div className="modal">
      <h3>Account switched</h3>
      <p>You connected a different account. Which step do you want to resume? Admin rotation (step 4) requires an intentional account switch.</p>
      <div className="pick">
        {STEPS.filter(s=>flow.stepStatus[s.n]!=="locked").map(s=>
          <button key={s.n} style={s.n===4?{outline:"2px solid var(--accent)"}:null}
            onClick={()=>{ setViewStep(s.n); setResumeAsk(false); }}>
            <span className="id" style={{fontFamily:"var(--font-body)"}}>{s.n} — {s.name}</span>
            {s.n===4?<span className="meta">default</span>:null}
          </button>)}
      </div>
    </div></div>:null}
  </div>;
}
