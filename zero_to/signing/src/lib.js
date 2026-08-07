// Wallet + transaction bridge. Uses the vendored, pinned known-good bundles in src/vendor/
// (they serialize the pox-5 `staking-postcondition` type and speak SIP-030 JSON-RPC).
import { connect, request, disconnect } from "./vendor/connect.js";
import { principalCV, uintCV, bufferCV, trueCV, falseCV, noneCV, cvToHex, hexToCV, ClarityType, postConditionToHex } from "./vendor/transactions.js";

const hexToBytes=h=>{h=String(h).replace(/^0x/i,"");const a=new Uint8Array(h.length/2);for(let i=0;i<a.length;i++)a[i]=parseInt(h.substr(i*2,2),16);return a;};

async function callReadOnly(api,contractId,fn,sender,args){
  const [addr,name]=contractId.split(".");
  const r=await fetch(`${api}/v2/contracts/call-read/${addr}/${name}/${fn}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sender,arguments:args})});
  const j=await r.json(); if(!j.okay) throw new Error(fn+": "+(j.cause||"read failed")); return hexToCV(j.result);
}

// Wallet BNS name (mainnet only), reused from the old sidekick apps: Hiro on-chain reads against
// BNS-V2 (strict primary name, then first owned name), bnsv2.com API as fallback.
const BNSV2_ID="SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2";
async function resolveBnsName(addr,api){
  if(!addr) return null;
  const [BNS,C]=BNSV2_ID.split(".");
  const dec=h=>{ h=String(h).replace(/^0x/,""); let s=""; for(let i=0;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.substr(i,2),16)); return s; };
  const nameFromTuple=tupleCv=>{ const t=tupleCv.value; const nm=dec(t.name.value), ns=dec(t.namespace.value); return (nm&&ns)?`${nm}.${ns}`:null; };
  async function callRO(fn,args){ const r=await fetch(`${api}/v2/contracts/call-read/${BNS}/${C}/${fn}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sender:addr,arguments:args})}); if(!r.ok) throw new Error("hiro "+r.status); const j=await r.json(); if(!j.okay) throw new Error("read failed"); return hexToCV(j.result); }
  try{
    const p=await callRO("get-primary",[cvToHex(principalCV(addr))]);
    if(p.type===ClarityType.ResponseOk&&p.value.type===ClarityType.OptionalSome){ return nameFromTuple(p.value.value); }
    const asset=encodeURIComponent(`${BNSV2_ID}::${C}`);
    const r=await fetch(`${api}/extended/v1/tokens/nft/holdings?principal=${addr}&asset_identifiers=${asset}&limit=1`); if(!r.ok) throw new Error("hiro "+r.status);
    const hr=await r.json(); const repr=hr&&hr.results&&hr.results[0]&&hr.results[0].value&&hr.results[0].value.repr;
    const id=repr?String(repr).replace(/^u/,""):null;
    if(id&&/^\d+$/.test(id)){ const b=await callRO("get-bns-from-id",[cvToHex(uintCV(BigInt(id)))]); if(b.type===ClarityType.OptionalSome) return nameFromTuple(b.value); }
    return null;
  }catch(e){
    try{
      const j=await fetch(`https://api.bnsv2.com/names/address/${addr}/valid`).then(r=>r.json());
      const first=j&&j.names&&j.names[0];
      return first&&(first.full_name||(first.name_string&&first.namespace_string?`${first.name_string}.${first.namespace_string}`:null))||null;
    }catch(e2){ return null; }
  }
}

window.ZTSLib = { connect, request, disconnect, principalCV, uintCV, bufferCV, trueCV, falseCV, noneCV, cvToHex, hexToCV, ClarityType, postConditionToHex, hexToBytes, callReadOnly, resolveBnsName };
