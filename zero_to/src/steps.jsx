// The six step panels + per-step info copy. Ported from the approved prototype
// (app-steps.jsx); all shipped UI copy is kept verbatim.
import React, { useState, useEffect } from "react";
import {
  contractOptions, recId, explorerTx, fetchTx, fetchPox, fetchUnlockedBalance, nameTaken,
  checkRegistered, genAuthId, validateGrant, stxToU, fmtStx, fmtUstx, fmtElapsed,
  shortAddr, reMgr, rePrincipal, walletErrMsg,
  Btn, Field, Badge, KV, StatusLine, CopyBtn, CheckRow, ExtLink, useInterval, useElapsed,
} from "./core.jsx";

export function PanelFoot({onBack,children}){
  return <div className="foot">{onBack?<Btn kind="tertiary" onClick={onBack}><i className="ph ph-arrow-left"></i>Back</Btn>:null}<span className="spacer"></span>{children}</div>;
}
export function GatedBtn({account,onConnect,disabled,onClick,children}){
  if(!account) return <Btn kind="primary" lg onClick={onConnect}>Connect wallet</Btn>;
  return <Btn kind="primary" lg disabled={disabled} onClick={onClick}>{children}</Btn>;
}

// ---------- Step 0 ----------
export function Step0({account,onConnect,onDone}){
  const [ack,setAck]=useState(false);
  const items=[
    "signer key, on the node and nowhere else",
    "deployer account with 0.1 STX to cover fees (software or hardware; may be rotated out later)",
    "admin account with 0.1 STX to cover fees",
    "an account holding enough STX to reach the signing minimum (50,000 STX + 0.1 for fees), or someone willing to stake to your manager contract",
  ];
  return <div className="body-wrap">
    <div className="body">
      <p className="step-sub">Before starting, you should have:</p>
      <div className="prereq">{items.map((t,i)=><div className="item" key={i}><i className="ph ph-circle-dashed"></i><span>{t}</span></div>)}</div>
      <label className="ack"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/><span>I have these in place.</span></label>
    </div>
    <PanelFoot>
      <Btn kind="primary" lg disabled={!ack} onClick={onDone}>Continue<i className="ph ph-arrow-right"></i></Btn>
    </PanelFoot>
  </div>;
}

// ---------- Step 1 ----------
export function Step1({net,account,onConnect,onBack,onDeployed,readOnly,flow}){
  const opts=contractOptions(net.key);
  const [optId,setOptId]=useState(opts[0].id);
  const [source,setSource]=useState(()=>opts[0].source());
  const [suffix,setSuffix]=useState("");
  const [hash,setHash]=useState(null);
  const [phase,setPhase]=useState("edit"); // edit | deploying | polling
  const [txid,setTxid]=useState(null);
  const [err,setErr]=useState(null);
  const elapsed=useElapsed(phase==="polling");
  const opt=opts.find(o=>o.id===optId);

  useEffect(()=>{ if(readOnly) return; let live=true; setHash(null);
    if(!source.trim()){ return; }
    const t=setTimeout(()=>{ window.ZTSHash.structureHash(source).then(h=>{ if(live) setHash(h); }); },250);
    return ()=>{ live=false; clearTimeout(t); };
  },[source,readOnly]);

  if(readOnly){
    return <div className="body-wrap"><div className="body">
      <div className="kvs">
        <KV label="Contract">{recId(flow)}</KV>
        <KV label="Option" mono={false}>{flow.contractOption}</KV>
        <KV label="Structure hash">{flow.structureHash}</KV>
        <KV label="Deploy transaction"><a href={explorerTx(net.key,flow.deployTxid)} target="_blank" rel="noopener">0x{String(flow.deployTxid).replace(/^0x/,"").slice(0,16)}…</a></KV>
      </div>
    </div><PanelFoot onBack={onBack}></PanelFoot></div>;
  }

  const pickOpt=id=>{ setOptId(id); const o=opts.find(x=>x.id===id); setSource(o.source()); setErr(null); };
  const hashMatch = opt.expected ? hash===opt.expected : null;
  const suffixValid = suffix===""||/^[a-zA-Z0-9_-]{1,24}$/.test(suffix);
  const fullName = suffix?`signer-manager-${suffix}`:"signer-manager";
  const nameValid = suffixValid&&fullName.length<=40;
  const canDeploy = !!source.trim()&&nameValid&&(opt.expected?hashMatch===true:true)&&phase==="edit"&&hash!==null;

  async function pollTx(t){
    setPhase("polling");
    const tick=async()=>{
      try{
        const tx=await fetchTx(net.api,t);
        if(tx.tx_status==="success"){
          onDeployed({ contractAddress:account, contractName:fullName, contractOption:opt.expected?optId:"byo",
            contractSource:optId==="byo"?source:null, structureHash:hash, deployTxid:t });
          return true;
        }
        if(/^abort|^dropped/.test(tx.tx_status)){ setErr(<span>Transaction failed on chain ({tx.tx_status}). <a href={explorerTx(net.key,t)} target="_blank" rel="noopener">View transaction</a></span>); setPhase("edit"); return true; }
      }catch(e){}
      return false;
    };
    if(await tick()) return;
    const id=setInterval(async()=>{ if(await tick()) clearInterval(id); },10000);
  }

  async function deploy(){
    setErr(null);
    try{
      if(await nameTaken(net.api,account,fullName)){ setErr(`Contract name ${fullName} is already deployed by ${shortAddr(account)}. Choose a different suffix.`); return; }
    }catch(e){}
    setPhase("deploying");
    try{
      const res=await window.ZTSLib.request("stx_deployContract",{ name:fullName, clarityCode:source, network:net.connectValue, address:account, sponsored:false, postConditionMode:"deny", postConditions:[] });
      const t=(res?.txid||"").replace(/^0x/i,"");
      if(!/^[0-9a-f]{64}$/i.test(t)){ setErr("The wallet returned no usable txid. Check wallet activity before retrying."); setPhase("edit"); return; }
      setTxid(t); pollTx(t);
    }catch(e){ setErr(walletErrMsg(e)||("Deploy request failed: "+(e?.message||e))); setPhase("edit"); }
  }

  const mainnetRows=[["contract",o=>o.contract?<span className="mono">{o.contract}</span>:"user-pasted"],["fee cap",o=>o.feeCap],["last-admin guard",o=>o.guard],["intended for",o=>o.intendedFor]];
  const testnetRows=[["source",o=>o.sourceLabel],["intended for",o=>o.intendedFor]];
  const rows=net.key==="mainnet"?mainnetRows:testnetRows;

  return <div className="body-wrap"><div className="body">
    <p className="step-sub">Pick a contract to deploy under your own name, or paste your own. Nothing is saved until this deploy confirms; reloading before confirmation starts over at step 0.</p>
    <table className="opt-table"><thead><tr><th></th>
      {opts.map(o=><th key={o.id} className={o.id===optId?"selcol":""}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="radio" name="copt" checked={o.id===optId} onChange={()=>pickOpt(o.id)} style={{accentColor:"var(--accent)"}}/>{o.label}
        </label></th>)}
    </tr></thead><tbody>
      {rows.map(([lbl,fn])=><tr key={lbl}><td>{lbl}</td>{opts.map(o=><td key={o.id} className={o.id===optId?"selcol":""}>{fn(o)}</td>)}</tr>)}
    </tbody></table>
    <Field label={optId==="byo"?"Clarity source (paste your contract)":"Clarity source"}>
      <textarea className="in code" spellCheck="false" value={source} onChange={e=>setSource(e.target.value)} placeholder=";; paste the signer-manager source"></textarea>
    </Field>
    <div className="hashline">
      <span style={{color:"var(--text-secondary)"}}>Structure hash</span>
      <span className="h">{source.trim()?(hash||"computing…"):"—"}</span>
      {opt.expected&&hash?(hashMatch?<Badge k="ok">matches expected hash</Badge>:<Badge k="bad">source was edited — deploy blocked</Badge>):null}
      {!opt.expected&&hash?<Badge k="idle">no expected value for bring your own</Badge>:null}
    </div>
    {opt.expected&&hash&&!hashMatch?<StatusLine kind="err">The editor contents do not match the expected hash {opt.expected}. Restore the bundled source or switch to bring your own.</StatusLine>:null}
    <div className="two" style={{marginTop:20,alignItems:"end"}}>
      <Field label="Contract name (optional suffix)">
        <div className="suffix-row"><span className="prefix">signer-manager-</span>
          <input className="in mono" value={suffix} spellCheck="false" placeholder="your brand or handle" onChange={e=>setSuffix(e.target.value.trim())}/></div>
      </Field>
      <div className="kvs"><KV label="Deploys as">{account?`${account}.${fullName}`:`your-address.${fullName}`}</KV></div>
    </div>
    {!suffixValid?<StatusLine kind="err">Suffix must be 1–24 characters: letters, digits, _ or -.</StatusLine>:null}
    {phase==="polling"?<StatusLine kind="info"><span className="spin" style={{marginRight:8,verticalAlign:-1}}></span>Waiting for confirmation — <a href={explorerTx(net.key,txid)} target="_blank" rel="noopener">0x{txid.slice(0,12)}…</a> <span className="elapsed">{fmtElapsed(elapsed)}</span></StatusLine>:null}
    <StatusLine kind="err">{err}</StatusLine>
  </div>
  <PanelFoot onBack={onBack}>
    <GatedBtn account={account} onConnect={onConnect} disabled={!canDeploy} onClick={deploy}>
      {phase==="polling"?"Confirming…":"Sign & deploy"}</GatedBtn>
  </PanelFoot></div>;
}

// ---------- Step 2 ----------
export function Step2({flow,onBack,onGrant,readOnly}){
  const manager=recId(flow);
  const [authId,setAuthId]=useState(()=>flow.authId||genAuthId());
  const [config,setConfig]=useState("/etc/stacks-signer/config.toml");
  const [grantText,setGrantText]=useState(flow.grantJson||"");
  const cmd=`stacks-signer generate-staking-signature --config ${config} --signer-manager ${manager} --auth-id ${authId} --json`;
  const v=grantText.trim()?validateGrant(grantText,authId):null;

  if(readOnly){
    return <div className="body-wrap"><div className="body">
      <div className="kvs"><KV label="auth-id">{flow.authId}</KV></div>
      <Field label="Grant"><textarea className="in" readOnly value={flow.grantJson||""}></textarea></Field>
    </div><PanelFoot onBack={onBack}></PanelFoot></div>;
  }
  return <div className="body-wrap"><div className="body">
    <p className="step-sub">This step runs on your signer node, not in this app, because it requires the signer key, which must never leave the node. Run the command below, then paste the JSON it prints.</p>
    <div className="two">
      <Field label="Config path (adjust to your setup)">
        <input className="in mono" value={config} spellCheck="false" onChange={e=>setConfig(e.target.value)}/>
      </Field>
      <Field label="auth-id">
        <div style={{display:"flex",gap:8}}>
          <input className="in mono" value={authId} spellCheck="false" onChange={e=>{ const x=e.target.value.replace(/[^0-9]/g,""); setAuthId(x); }}/>
          <Btn kind="secondary" title="Regenerate" onClick={()=>setAuthId(genAuthId())}><i className="ph ph-arrows-clockwise"></i></Btn>
        </div>
      </Field>
    </div>
    <Field label="Run on the signer host">
      <div className="cmd">{cmd}<span className="ph-copy-btn"><CopyBtn text={cmd} title="Copy command"/></span></div>
    </Field>
    <p className="step-sub" style={{marginBottom:12}}>An auth-id may only be used once for a given signer key; regenerate before retrying a failed registration.</p>
    <Field label="Paste the Grant JSON">
      <textarea className="in" spellCheck="false" value={grantText} onChange={e=>setGrantText(e.target.value)} placeholder='{"signerKey":"03…","signerSignature":"…","authId":"...","signerManager":"S….signer-manager"}'></textarea>
    </Field>
    {v?<div>{v.checks.map(([k,t],i)=><CheckRow key={i} k={k}>{t}</CheckRow>)}</div>:null}
  </div>
  <PanelFoot onBack={onBack}>
    <Btn kind="primary" lg disabled={!(v&&v.ok&&/^[0-9]+$/.test(authId))} onClick={()=>onGrant(authId,grantText.trim())}>Continue<i className="ph ph-arrow-right"></i></Btn>
  </PanelFoot></div>;
}

// ---------- Step 3 ----------
export function Step3({net,flow,account,onConnect,onBack,onSubmitted,onRegistered,readOnly}){
  const [manager,setManager]=useState(recId(flow));
  const [err,setErr]=useState(null);
  const [polling,setPolling]=useState(!!flow.registerTxid&&!flow.registered);
  const [checkNote,setCheckNote]=useState(null);
  const elapsed=useElapsed(polling);
  const txid=flow.registerTxid;

  async function checkOnce(){
    try{
      if(txid){
        const tx=await fetchTx(net.api,txid);
        if(/^abort|^dropped/.test(tx.tx_status)){
          setPolling(false);
          setErr(<span>Transaction failed on chain ({tx.tx_status}). <a href={explorerTx(net.key,txid)} target="_blank" rel="noopener">View transaction</a>. If the grant was already used, return to step 2, regenerate the auth-id and issue a new Grant.</span>);
          return;
        }
      }
      const reg=await checkRegistered(net.api,manager);
      if(reg){ setPolling(false); onRegistered(); }
      else setCheckNote("Not registered yet.");
    }catch(e){ setCheckNote("Could not check registration: "+(e?.message||e)); }
  }
  useInterval(checkOnce,10000,polling);
  useEffect(()=>{ if(polling) checkOnce(); },[]);

  if(readOnly){
    return <div className="body-wrap"><div className="body">
      <div className="kvs">
        <KV label="Signer-manager">{manager}</KV>
        <KV label="register-self transaction">{txid?<a href={explorerTx(net.key,txid)} target="_blank" rel="noopener">0x{String(txid).slice(0,16)}…</a>:"—"}</KV>
        <KV label="Registered" mono={false}><Badge k="ok">registered</Badge></KV>
      </div>
    </div><PanelFoot onBack={onBack}></PanelFoot></div>;
  }

  async function submit(){
    setErr(null);
    if(!reMgr(manager)){ setErr("Enter a valid signer-manager principal like SP….signer-manager."); return; }
    const L=window.ZTSLib;
    let g; try{ g=JSON.parse(flow.grantJson); }catch(e){ setErr("The stored Grant is not valid JSON. Return to step 2."); return; }
    try{
      const args=[ L.cvToHex(L.principalCV(manager)), L.cvToHex(L.bufferCV(L.hexToBytes(g.signerKey))), L.cvToHex(L.uintCV(BigInt(flow.authId))), L.cvToHex(L.bufferCV(L.hexToBytes(g.signerSignature))) ];
      const res=await L.request("stx_callContract",{ contract:manager, functionName:"register-self", functionArgs:args, network:net.connectValue, address:account, sponsored:false, postConditionMode:"deny", postConditions:[] });
      const t=(res?.txid||"").replace(/^0x/i,"");
      if(!/^[0-9a-f]{64}$/i.test(t)){ setErr("The wallet returned no usable txid. Check wallet activity."); return; }
      onSubmitted(t); setPolling(true);
    }catch(e){ setErr(walletErrMsg(e)||("register-self failed: "+(e?.message||e))); }
  }

  const wrongAccount=account&&flow.contractAddress&&account!==flow.contractAddress;
  return <div className="body-wrap"><div className="body">
    <p className="step-sub">register-self submits the Grant on-chain from the signer-manager admin account, in one transaction. It moves no assets.</p>
    <Field label="Signer-manager contract">
      <input className="in mono" value={manager} spellCheck="false" onChange={e=>setManager(e.target.value.trim())}/>
    </Field>
    <div className="two">
      <Field label="auth-id (from step 2)"><input className="in mono" readOnly value={flow.authId||""}/></Field>
      <div className="field"><label>Grant (from step 2)</label>
        <textarea className="in" readOnly style={{minHeight:76}} value={flow.grantJson||""}></textarea>
        <div style={{fontSize:"var(--fs-xs)",color:"var(--text-tertiary)",marginTop:4}}>To change either, return to step 2.</div>
      </div>
    </div>
    {wrongAccount?<StatusLine kind="err">Connected account {shortAddr(account)} is not the deployer {shortAddr(flow.contractAddress)} of this signer-manager. Reconnect with the deployer (admin) account.</StatusLine>:null}
    {polling?<StatusLine kind="info"><span className="spin" style={{marginRight:8,verticalAlign:-1}}></span>
      Checking registration every 10s — <span className="elapsed">{fmtElapsed(elapsed)}</span>{checkNote?` · ${checkNote}`:""}
      <a href="#" onClick={e=>{e.preventDefault();checkOnce();}}>Refresh now</a>
      {txid?<span> · <a href={explorerTx(net.key,txid)} target="_blank" rel="noopener">view transaction</a></span>:null}
    </StatusLine>:null}
    <StatusLine kind="err">{err}</StatusLine>
  </div>
  <PanelFoot onBack={onBack}>
    <GatedBtn account={account} onConnect={onConnect} disabled={polling} onClick={submit}>{polling?"Waiting for registration…":"Sign register-self"}</GatedBtn>
  </PanelFoot></div>;
}

// ---------- Step 4 ----------
export function Step4({net,flow,account,onConnect,onBack,onAdminTx,onSkip,onComplete}){
  const [newAdmin,setNewAdmin]=useState("");
  const [oldAdmin,setOldAdmin]=useState(flow.contractAddress||"");
  const [errAdd,setErrAdd]=useState(null); const [errRm,setErrRm]=useState(null);
  const [txAdd,setTxAdd]=useState(null); const [txRm,setTxRm]=useState(null);
  const manager=recId(flow);
  const admins=[flow.contractAddress,...flow.adminAccounts.filter(a=>a.action==="add").map(a=>a.principal)]
    .filter(p=>!flow.adminAccounts.some(a=>a.action==="remove"&&a.principal===p));
  const wrongAccount=account&&!admins.includes(account);

  async function updateAdmin(principal,enabled,setE,setT){
    setE(null);
    if(!rePrincipal(principal)){ setE("Enter a valid standard principal (SP… or ST…)."); return; }
    const L=window.ZTSLib;
    try{
      const res=await L.request("stx_callContract",{ contract:manager, functionName:"update-admin",
        functionArgs:[L.cvToHex(L.principalCV(principal)),L.cvToHex(enabled?L.trueCV():L.falseCV())],
        network:net.connectValue, address:account, sponsored:false, postConditionMode:"deny", postConditions:[] });
      const t=(res?.txid||"").replace(/^0x/i,"");
      if(!/^[0-9a-f]{64}$/i.test(t)){ setE("The wallet returned no usable txid. Check wallet activity."); return; }
      setT(t); onAdminTx({principal,action:enabled?"add":"remove",txid:t});
    }catch(e){ setE(walletErrMsg(e)||("update-admin failed: "+(e?.message||e))); }
  }

  return <div className="body-wrap"><div className="body">
    <p className="step-sub">Rotate away from a deployer key that is not sufficiently hardened — a software wallet or the node key. Complete the sequence in order; skip it if your deployer account is already cold.</p>
    {wrongAccount?<StatusLine kind="err" >Connected account {shortAddr(account)} is not a known admin of this signer-manager. Reconnect with an admin account.</StatusLine>:null}
    <div className="cell">
      <h3><span className="n">1</span>Add the new admin</h3>
      <div style={{display:"flex",gap:8}}>
        <input className="in mono" placeholder="S… principal of the new (cold) admin" spellCheck="false" value={newAdmin} onChange={e=>setNewAdmin(e.target.value.trim())}/>
        <GatedBtn account={account} onConnect={onConnect} disabled={!newAdmin} onClick={()=>updateAdmin(newAdmin,true,setErrAdd,setTxAdd)}>Sign update-admin</GatedBtn>
      </div>
      {txAdd?<div style={{fontSize:"var(--fs-sm)",marginTop:8}}>Submitted: <a href={explorerTx(net.key,txAdd)} target="_blank" rel="noopener" className="mono">0x{txAdd.slice(0,14)}…</a></div>:null}
      <StatusLine kind="err">{errAdd}</StatusLine>
    </div>
    <div className="cell">
      <h3><span className="n">2</span>Reconnect as the new admin</h3>
      <div style={{fontSize:"var(--fs-sm)",color:"var(--text-secondary)"}}>Disconnect the wallet (top right) and reconnect with the new admin account. Currently connected: <span className="mono">{account?shortAddr(account):"not connected"}</span></div>
    </div>
    <div className="cell">
      <h3><span className="n">3</span>Remove the old admin</h3>
      <div style={{display:"flex",gap:8}}>
        <input className="in mono" spellCheck="false" value={oldAdmin} onChange={e=>setOldAdmin(e.target.value.trim())}/>
        <GatedBtn account={account} onConnect={onConnect} disabled={!oldAdmin} onClick={()=>updateAdmin(oldAdmin,false,setErrRm,setTxRm)}>Sign update-admin</GatedBtn>
      </div>
      {txRm?<div style={{fontSize:"var(--fs-sm)",marginTop:8}}>Submitted: <a href={explorerTx(net.key,txRm)} target="_blank" rel="noopener" className="mono">0x{txRm.slice(0,14)}…</a></div>:null}
      <StatusLine kind="err">{errRm}</StatusLine>
    </div>
  </div>
  <PanelFoot onBack={onBack}>
    {flow.stepStatus[4]==="active"?<Btn kind="secondary" lg onClick={onSkip}>Skip — deployer is already cold</Btn>:null}
    <Btn kind="primary" lg onClick={onComplete}>{flow.stepStatus[4]==="complete"?"Continue":"Rotation done — continue"}<i className="ph ph-arrow-right"></i></Btn>
  </PanelFoot></div>;
}

// ---------- Step 5 ----------
export function Step5({net,flow,account,onConnect,onBack,onStakeTx}){
  const [manager,setManager]=useState(recId(flow));
  const [amount,setAmount]=useState("");
  const [cycles,setCycles]=useState("48");
  const [err,setErr]=useState(null);
  const [busy,setBusy]=useState(false);
  const [okMsg,setOkMsg]=useState(null);
  const u=stxToU(amount);
  const nc=Number(cycles);
  const cyclesOk=Number.isInteger(nc)&&nc>=1&&nc<=48;

  async function stake(){
    setErr(null); setOkMsg(null);
    if(!reMgr(manager)){ setErr("Enter a valid signer-manager principal."); return; }
    if(u==null){ setErr("Amount must be a number in STX with up to 6 decimals."); return; }
    if(!cyclesOk){ setErr("Cycles must be a whole number from 1 to 48."); return; }
    setBusy(true);
    const L=window.ZTSLib;
    try{
      const unlocked=await fetchUnlockedBalance(net.api,account).catch(()=>null);
      if(unlocked!=null&&u>unlocked){ setErr(`Insufficient balance: ${fmtStx(unlocked)} unlocked, ${fmtStx(u)} requested.`); setBusy(false); return; }
      const pox=await fetchPox(net.api);
      const args=[ L.cvToHex(L.principalCV(manager)), L.cvToHex(L.uintCV(u)), L.cvToHex(L.uintCV(BigInt(nc))), L.cvToHex(L.uintCV(BigInt(pox.current_burnchain_block_height))), L.cvToHex(L.noneCV()) ];
      const postConditions=[ L.postConditionToHex({ type:"staking-postcondition", address:account, condition:"eq", amount:u.toString() }) ];
      const res=await L.request("stx_callContract",{ contract:pox.contract_id, functionName:"stake", functionArgs:args, network:net.connectValue, address:account, sponsored:false, postConditionMode:"deny", postConditions });
      const t=(res?.txid||"").replace(/^0x/i,"");
      if(!/^[0-9a-f]{64}$/i.test(t)){ setErr("The wallet returned no usable txid. Check wallet activity."); setBusy(false); return; }
      onStakeTx(t);
      setOkMsg(<span>Submitted: <a href={explorerTx(net.key,t)} target="_blank" rel="noopener" className="mono">0x{t.slice(0,14)}…</a> — the lock takes effect the next reward cycle. Staking is repeatable.</span>);
    }catch(e){ setErr(walletErrMsg(e)||("Stake request failed: "+(e?.message||e))); }
    setBusy(false);
  }

  return <div className="body-wrap"><div className="body">
    <p className="step-sub">48 is the maximum consecutive cycles the manager contract may lock; unstaking in any cycle unlocks at the start of the next. Minimum to begin signing: 50,000 STX. This app sets no optional stacking parameters; if the target manager requires them the transaction will fail.</p>
    <Field label="Signer-manager contract">
      <input className="in mono" value={manager} spellCheck="false" onChange={e=>setManager(e.target.value.trim())}/>
    </Field>
    <div className="two">
      <Field label="Amount (STX, max 6 decimals)">
        <input className="in mono" placeholder="50000" spellCheck="false" value={amount} onChange={e=>setAmount(e.target.value)}/>
      </Field>
      <Field label="Cycles (1–48)">
        <input className="in mono" spellCheck="false" value={cycles} onChange={e=>setCycles(e.target.value.trim())}/>
      </Field>
    </div>
    <div className="kvs">
      <KV label="Locks">{u!=null?`${fmtStx(u)} = ${fmtUstx(u)}`:"—"}</KV>
      {flow.stakeTxids.length?<KV label="Previous stake transactions">{flow.stakeTxids.map((t,i)=><span key={t}>{i>0?" · ":""}<a href={explorerTx(net.key,t)} target="_blank" rel="noopener">0x{t.slice(0,8)}…</a></span>)}</KV>:null}
    </div>
    {okMsg?<StatusLine kind="ok">{okMsg}</StatusLine>:null}
    <StatusLine kind="err">{err}</StatusLine>
  </div>
  <PanelFoot onBack={onBack}>
    <GatedBtn account={account} onConnect={onConnect} disabled={busy||u==null||!cyclesOk} onClick={stake}>Sign stake</GatedBtn>
  </PanelFoot></div>;
}

// ---------- Per-step info (below the panel) ----------
export function StepInfo({step,net}){
  const D="https://docs.stacks.co";
  const blocks={
    0:<div><p>The signer stack (bitcoind, stacks-node, stacks-signer) must already be running before this flow starts; this app never touches the signer key.</p>
      <p><ExtLink href={`${D}/operate/run-a-node`}>Run a Node</ExtLink> <ExtLink href={`${D}/operate/run-a-signer`}>Run a Signer</ExtLink></p></div>,
    1:<div><p>The deploying address becomes the first manager's admin. Identity is shown as the structure hash: it tokenises the Clarity code and ignores all formatting, so copying the source out, reformatting it, and pasting it back yields the same hash.</p>
      <p><ExtLink href={`${D}/operate/deploy-a-signer-manager-contract`}>Deploy a Signer Manager Contract</ExtLink></p></div>,
    2:<div><p>The Grant connects your signer node, the signer-manager contract, and pox-5; one grant per manager, submitted once, standing until revoked. Revoking a grant is not part of this flow: use <ExtLink href="https://stx.fan/signer">stx.fan/signer</ExtLink> (app 8), which sends <span className="mono">revoke-signer-grant</span> from the signer key's own address.</p>
      <p><ExtLink href={`${D}/operate/stacking-stx/generate-signer-signature#generate-the-grant`}>Generate a Signer Signature — the grant</ExtLink></p></div>,
    3:<div><p>The reference manager wraps grant recording and signer registration into the single register-self entrypoint, so this is one transaction. Stakers cannot stake toward your manager until it is registered.</p>
      <p><ExtLink href={`${D}/operate/deploy-a-signer-manager-contract`}>Deploy a Signer Manager Contract</ExtLink></p></div>,
    4:<div><p>This step stays writable after completion; the sequence requires re-entering it connected as a different account.</p>
      <p><ExtLink href={`${D}/operate/deploy-a-signer-manager-contract`}>Deploy a Signer Manager Contract</ExtLink></p></div>,
    5:<div><p>Input is in STX and converted to µSTX at submit. Stakes below 50,000 STX still count toward the signer's total; signing begins once the total reaches the minimum.</p>
      <p><ExtLink href={`${D}/operate/stacking-stx/whats-changed-in-pox-5`}>What's Changed in PoX-5</ExtLink></p></div>,
  };
  return <div className="info-sec"><h4>About this step</h4>{blocks[step]}</div>;
}
