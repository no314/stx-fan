#!/usr/bin/env python3
"""Structure hash for Clarity source, ported from stx.fan/signer/03-deploy-manager.html (structureCanonical).

Tokenises the source and drops all whitespace, comments (;; to end of line) and commas.
( ) { } : are single tokens; string literals are kept whole. Tokens joined with "\n", then SHA-256.
Also prints sourceSha256 (raw) and canonicalSha256 (canonicalizeClaritySource) for completeness.
"""
import hashlib, sys

def structure_canonical(source: str) -> str:
    t, a = [], ""
    def flush():
        nonlocal a
        if a:
            t.append(a); a = ""
    i, n = 0, len(source)
    while i < n:
        c = source[i]
        if c == ";" and i + 1 < n and source[i+1] == ";":
            flush(); i += 2
            while i < n and source[i] != "\n": i += 1
            continue
        if c == '"':
            flush(); s = c; i += 1
            while i < n:
                d = source[i]; s += d
                if d == "\\":
                    i += 1; s += source[i] if i < n else ""; i += 1; continue
                if d == '"': break
                i += 1
            t.append(s); i += 1; continue
        if c.isspace() or c == ",":
            flush(); i += 1; continue
        if c in "(){}:":
            flush(); t.append(c); i += 1; continue
        a += c; i += 1
    flush()
    return "\n".join(t)

def canonicalize(source: str) -> str:
    result, in_str, esc, pending = "", False, False, False
    i, n = 0, len(source)
    while i < n:
        c = source[i]
        if in_str:
            result += c
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == '"': in_str = False
            i += 1; continue
        if c == '"':
            if pending and result: result += " "
            pending = False; in_str = True; result += c; i += 1; continue
        if c == ";" and i + 1 < n and source[i+1] == ";":
            i += 2
            while i < n and source[i] != "\n": i += 1
            pending = True; continue
        if c.isspace():
            pending = True; i += 1; continue
        if pending and result: result += " "
        pending = False; result += c; i += 1
    return result.strip()

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

if __name__ == "__main__":
    for path in sys.argv[1:]:
        src = open(path, encoding="utf-8").read()
        print(path)
        print("  sourceSha256    ", sha256(src))
        print("  canonicalSha256 ", sha256(canonicalize(src)))
        print("  structureSha256 ", sha256(structure_canonical(src)))
