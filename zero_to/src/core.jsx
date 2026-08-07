// Networks, contract options, state model, persistence, chain reads, UI atoms, step rail.
// Ported from the approved prototype (app-core.jsx); rendered DOM structure, class names,
// state transitions, and copy are preserved.
import React, { useState, useEffect, useRef } from "react";

export const NETWORKS = {
  mainnet:{ key:"mainnet", label:"Mainnet", api:"https://api.hiro.so", stxPrefix:/^S[PM]/, connectValue:"mainnet", chainParam:"mainnet" },
  testnet:{ key:"testnet", label:"Testnet", api:"https://api.testnet-pox5.hiro.so", stxPrefix:/^S[TN]/, connectValue:"pox5-testnet", chainParam:"testnet" },
};

// Expected structure hashes — hardcoded literals, compared against the value computed from the editor contents.
export const EXPECTED_HASHES = {
  pinned:  "10fa8f7bfc6e41213b82682310aa0c7479214a87fd92d378892a74ffbe2b4357",
  max500:  "ce374c861cca311f06822a053c8cd675c515ac6f40044b3495d73ae10a349f32",
  testnet: "75c4f191cdce1372b0869cb4b068232c740288f769edf9b60a2416059ada9183",
};

export function contractOptions(netKey){
  if(netKey==="mainnet") return [
    { id:"pinned", label:"Pinned example", contract:"SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.signer-manager-stillearly", feeCap:"99.99%", guard:"no", intendedFor:"flexibility", source:()=>window.ZTS_CONTRACTS.pinned, expected:EXPECTED_HASHES.pinned },
    { id:"max500", label:"max500", contract:"SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager", feeCap:"5%", guard:"yes", intendedFor:"public pools", source:()=>window.ZTS_CONTRACTS.max500, expected:EXPECTED_HASHES.max500 },
    { id:"byo", label:"Bring your own", contract:null, feeCap:"unknown", guard:"unknown", intendedFor:"—", source:()=>"", expected:null },
  ];
  return [
    { id:"testnet", label:"signer-manager", contract:null, sourceLabel:"bundled testnet variant", intendedFor:"testing", source:()=>window.ZTS_CONTRACTS.testnet, expected:EXPECTED_HASHES.testnet },
    { id:"byo", label:"Bring your own", contract:null, sourceLabel:"user-pasted", intendedFor:"—", source:()=>"", expected:null },
  ];
}

export const STEPS = [
  { n:0, short:"Prerequisites", name:"Prerequisites" },
  { n:1, short:"Deploy", name:"Deploy signer-manager" },
  { n:2, short:"Grant", name:"Generate Signer Signature Grant" },
  { n:3, short:"Register", name:"Register-self" },
  { n:4, short:"Admin", name:"Admin rotation" },
  { n:5, short:"Stake", name:"Stake" },
];

export const MIN_STX = 50000;

export function freshFlow(netKey){
  return { network:netKey, contractAddress:null, contractName:null, contractOption:null, contractSource:null,
    structureHash:null, deployTxid:null, authId:null, grantJson:null, registerTxid:null, registered:false,
    adminAccounts:[], adminRotationSkipped:false, stakeTxids:[],
    stepStatus:{0:"active",1:"locked",2:"locked",3:"locked",4:"locked",5:"locked"}, updatedAt:null };
}
export function furthestStep(flow){
  let f=0; for(let i=0;i<=5;i++){ const s=flow.stepStatus[i]; if(s==="active") return i; if(s==="complete"||s==="skipped") f=i; }
  return Math.min(f+1,5);
}
export const recId=f=>`${f.contractAddress}.${f.contractName}`;
export const recKey=f=>`zts:${f.network}:${recId(f)}`;
export function saveRecord(flow){ const f={...flow,updatedAt:new Date().toISOString()}; localStorage.setItem(recKey(f),JSON.stringify(f)); return f; }
export function listRecords(netKey){
  const out=[]; const prefix=`zts:${netKey}:`;
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(prefix)){ try{ out.push(JSON.parse(localStorage.getItem(k))); }catch(e){} } }
  return out.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
export function loadRecord(netKey,id){ try{ const raw=localStorage.getItem(`zts:${netKey}:${id}`); return raw?JSON.parse(raw):null; }catch(e){ return null; } }

// --- chain reads ---
export async function fetchTx(api,txid){ const r=await fetch(`${api}/extended/v1/tx/0x${String(txid).replace(/^0x/i,"")}`); if(!r.ok) throw new Error("tx lookup "+r.status); return r.json(); }
export async function fetchPox(api){ const r=await fetch(`${api}/v2/pox`); if(!r.ok) throw new Error("pox "+r.status); return r.json(); }
export async function nameTaken(api,addr,name){ const r=await fetch(`${api}/v2/contracts/source/${addr}/${name}?proof=0`); return r.ok; }
export async function fetchUnlockedBalance(api,addr){
  const r=await fetch(`${api}/extended/v1/address/${addr}/balances`); if(!r.ok) throw new Error("balances "+r.status);
  const j=await r.json(); const total=BigInt(j?.stx?.balance??"0"), locked=BigInt(j?.stx?.locked??"0");
  const u=total-locked; return u<0n?0n:u;
}
// Registration check, taken from the old sidekick app: pox get-signer-info(manager) returns (some buff) when registered.
export async function checkRegistered(api,manager){
  const L=window.ZTSLib;
  const pox=await fetchPox(api);
  const info=await L.callReadOnly(api,pox.contract_id,"get-signer-info",manager,[L.cvToHex(L.principalCV(manager))]);
  return info.type===L.ClarityType.OptionalSome;
}

export const fmtStx=u=>(Number(BigInt(u))/1e6).toLocaleString(undefined,{maximumFractionDigits:6})+" STX";
export const fmtUstx=u=>BigInt(u).toLocaleString()+" µSTX";
export function stxToU(s){ s=String(s).trim(); if(!/^\d+(\.\d{1,6})?$/.test(s)) return null; const [a,b=""]=s.split("."); return BigInt(a)*1000000n + BigInt((b+"000000").slice(0,6)); }
export const shortAddr=a=>a?a.slice(0,5)+"…"+a.slice(-4):"";
export const reMgr=m=>/^S[A-Z0-9]+\.[a-zA-Z][a-zA-Z0-9\-_]*$/.test(m);
export const rePrincipal=a=>/^S[A-Z0-9]{20,50}$/.test(a);
export function genAuthId(){ const d=()=>Math.floor(Math.random()*9)+1; return `${d()}${d()}${d()}`; }
export function explorerTx(netKey,t){ t=String(t).replace(/^0x/i,"").toLowerCase(); const n=NETWORKS[netKey]; return n.key==="mainnet"?`https://explorer.hiro.so/txid/0x${t}?chain=mainnet`:`https://explorer.hiro.so/txid/0x${t}?chain=testnet&api=${n.api}`; }
export function walletErrMsg(e){ const c=e&&typeof e==="object"&&"code"in e?Number(e.code):null; return (c===4001||c===-31001)?"Transaction rejected in wallet.":null; }
export function fmtElapsed(s){ const m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s`; }

// Grant shape validation (shape only), field formats from the old sidekick app.
export function validateGrant(text,authIdField){
  let g; try{ g=JSON.parse(text); }catch(e){ return {ok:false,checks:[["bad","Not valid JSON."]]}; }
  const checks=[]; let ok=true;
  const shape = g&&typeof g==="object"
    && typeof g.signerKey==="string"&&/^(02|03)[0-9a-f]{64}$/.test(g.signerKey)
    && typeof g.signerSignature==="string"&&/^[0-9a-f]{130}$/.test(g.signerSignature)
    && (g.authId===undefined||/^(0|[1-9][0-9]*)$/.test(String(g.authId)))
    && (g.signerManager===undefined||typeof g.signerManager==="string");
  if(!shape){ return {ok:false,checks:[["bad","Malformed Grant JSON. It needs signerKey (02/03 + 64 hex) and signerSignature (130 hex)."]]}; }
  checks.push(["ok","Grant JSON has the expected fields."]);
  if(g.authId!==undefined){
    if(String(g.authId)===String(authIdField)) checks.push(["ok",`auth-id matches (${authIdField}).`]);
    else { ok=false; checks.push(["bad",`Grant auth-id ${g.authId} does not match the entered ${authIdField}.`]); }
  }
  return {ok,checks,grant:g};
}

// --- UI atoms ---
export function Btn({kind="secondary",lg,children,...rest}){ return <button className={`btn btn-${kind}${lg?" btn-lg":""}`} {...rest}>{children}</button>; }
export function Field({label,children}){ return <div className="field"><label>{label}</label>{children}</div>; }
export function Badge({k,children}){ return <span className={`badge b-${k}`}>{children}</span>; }
export function KV({label,children,mono=true}){ return <div className="kv"><span>{label}</span><span className={mono?"v":""}>{children}</span></div>; }
export function StatusLine({kind,children}){ return children?<div className={`status ${kind}`}>{children}</div>:null; }
export function CopyBtn({text,title="Copy"}){
  const [done,setDone]=useState(false);
  return <button className="copybtn" title={title} onClick={()=>{ navigator.clipboard.writeText(text).then(()=>{ setDone(true); setTimeout(()=>setDone(false),1500); }); }}>
    <i className={`ph ${done?"ph-check":"ph-copy"}`}></i></button>;
}
export function CheckRow({k,children}){
  const icon=k==="ok"?"ph-check-circle":k==="bad"?"ph-x-circle":"ph-warning-circle";
  const color=k==="ok"?"var(--green-600)":k==="bad"?"var(--red-500)":"var(--yellow-700)";
  return <div className="check-row"><i className={`ph ${icon}`} style={{color}}></i><span>{children}</span></div>;
}
export function ExtLink({href,children}){ return <a href={href} target="_blank" rel="noopener">{children} <i className="ph ph-arrow-square-out" style={{fontSize:"0.85em"}}></i></a>; }
export function useInterval(fn,ms,active){
  const ref=useRef(fn); ref.current=fn;
  useEffect(()=>{ if(!active||ms==null) return; const id=setInterval(()=>ref.current(),ms); return ()=>clearInterval(id); },[ms,active]);
}
export function useElapsed(active){
  const [t,setT]=useState(0);
  useEffect(()=>{ if(!active){ setT(0); return; } const start=Date.now(); const id=setInterval(()=>setT(Math.floor((Date.now()-start)/1000)),1000); return ()=>clearInterval(id); },[active]);
  return t;
}

export function Rail({flow,viewStep,onView}){
  return <div className="rail" role="tablist" aria-label="Steps">
    {STEPS.map(s=>{
      const st=flow.stepStatus[s.n];
      if(s.n===viewStep){
        return <div key={s.n} className="rail-tab" role="tab" aria-selected="true">
          <span className="num">{s.n}</span><span className="name">{s.name}</span>
          {st==="complete"&&s.n<4?<span className="ro">read-only</span>:null}
          {st==="skipped"?<span className="ro">skipped</span>:null}
        </div>;
      }
      const clickable=st!=="locked";
      return <button key={s.n} role="tab" aria-selected="false" disabled={!clickable}
        className={`rail-item ${st}${clickable?" clickable":""}`}
        onClick={()=>clickable&&onView(s.n)}>
        <span className="rail-num">{st==="complete"?<i className="ph ph-check" style={{fontSize:14}}></i>:null}{s.n}</span>
        <span className="rail-lbl">{st==="skipped"?"skipped":s.short}</span>
      </button>;
    })}
  </div>;
}
