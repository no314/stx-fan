// The structure-hash function, imported unmodified from signer-sidekick app 03 (03-deploy-manager.html).
async function sha256hex(str){ const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str)); return Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,"0")).join(""); }
// Structure canonicalization: tokenise the Clarity and drop ALL whitespace, comments, and commas.
// ( ) { } : are each their own token; string literals are kept whole. The result is invariant to
// any reformatting (indentation, spacing around delimiters, clarinet format), so its hash identifies
// the code itself, not its layout. It intentionally ignores comment text.
function structureCanonical(source){
  const t=[]; let a=""; const flush=()=>{ if(a){t.push(a);a="";} };
  for(let i=0;i<source.length;i++){ const c=source[i];
    if(c===";"&&source[i+1]===";"){ flush(); i+=2; while(i<source.length&&source[i]!=="\n")i++; continue; }
    if(c==='"'){ flush(); let s=c; i++; for(;i<source.length;i++){ const d=source[i]; s+=d; if(d==="\\"){ i++; s+=source[i]||""; continue; } if(d==='"') break; } t.push(s); continue; }
    if(/\s/.test(c)){ flush(); continue; }
    if(c===","){ flush(); continue; }
    if(c==="("||c===")"||c==="{"||c==="}"||c===":"){ flush(); t.push(c); continue; }
    a+=c; }
  flush(); return t.join("\n");
}
async function structureHash(source){ return sha256hex(structureCanonical(source)); }
window.ZTSHash = { sha256hex, structureCanonical, structureHash };
