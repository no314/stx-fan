import json,sys
f,out=sys.argv[1],sys.argv[2]
arr=json.load(open(f))
for a in arr:
    t=a["text"]; i=t.find("{")
    if "source" in t and i>=0:
        s=t[i:]
        for end in range(len(s),0,-1):
            if s[end-1]=="}":
                try: d=json.loads(s[:end]); break
                except Exception: continue
        open(out,"w").write(d["source"]); print(out,"len",d["len"],"height",d["publish_height"]); break
