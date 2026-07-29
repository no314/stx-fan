// node_modules/@noble/secp256k1/index.js
var B256 = 2n ** 256n;
var P = B256 - 0x1000003d1n;
var N = B256 - 0x14551231950b75fc4402da1732fc9bebfn;
var Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
var Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;
var CURVE = { p: P, n: N, a: 0n, b: 7n, Gx, Gy };
var fLen = 32;
var crv = (x) => mod(mod(x * x) * x + CURVE.b);
var err = (m = "") => {
  throw new Error(m);
};
var big = (n) => typeof n === "bigint";
var str = (s) => typeof s === "string";
var fe = (n) => big(n) && 0n < n && n < P;
var ge = (n) => big(n) && 0n < n && n < N;
var isu8 = (a) => a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
var au8 = (a, l) => (
  // assert is Uint8Array (of specific length)
  !isu8(a) || typeof l === "number" && l > 0 && a.length !== l ? err("Uint8Array expected") : a
);
var u8n = (data) => new Uint8Array(data);
var toU8 = (a, len) => au8(str(a) ? h2b(a) : u8n(au8(a)), len);
var mod = (a, b = P) => {
  let r = a % b;
  return r >= 0n ? r : b + r;
};
var isPoint = (p) => p instanceof Point ? p : err("Point expected");
var Point = class _Point {
  constructor(px, py, pz) {
    this.px = px;
    this.py = py;
    this.pz = pz;
  }
  //3d=less inversions
  static fromAffine(p) {
    return p.x === 0n && p.y === 0n ? _Point.ZERO : new _Point(p.x, p.y, 1n);
  }
  static fromHex(hex) {
    hex = toU8(hex);
    let p = void 0;
    const head = hex[0], tail = hex.subarray(1);
    const x = slcNum(tail, 0, fLen), len = hex.length;
    if (len === 33 && [2, 3].includes(head)) {
      if (!fe(x))
        err("Point hex invalid: x not FE");
      let y = sqrt(crv(x));
      const isYOdd = (y & 1n) === 1n;
      const headOdd = (head & 1) === 1;
      if (headOdd !== isYOdd)
        y = mod(-y);
      p = new _Point(x, y, 1n);
    }
    if (len === 65 && head === 4)
      p = new _Point(x, slcNum(tail, fLen, 2 * fLen), 1n);
    return p ? p.ok() : err("Point is not on curve");
  }
  static fromPrivateKey(k) {
    return G.mul(toPriv(k));
  }
  // Create point from a private key.
  get x() {
    return this.aff().x;
  }
  // .x, .y will call expensive toAffine:
  get y() {
    return this.aff().y;
  }
  // should be used with care.
  equals(other) {
    const { px: X1, py: Y1, pz: Z1 } = this;
    const { px: X2, py: Y2, pz: Z2 } = isPoint(other);
    const X1Z2 = mod(X1 * Z2), X2Z1 = mod(X2 * Z1);
    const Y1Z2 = mod(Y1 * Z2), Y2Z1 = mod(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  negate() {
    return new _Point(this.px, mod(-this.py), this.pz);
  }
  // Flip point over y coord
  double() {
    return this.add(this);
  }
  // Point doubling: P+P, complete formula.
  add(other) {
    const { px: X1, py: Y1, pz: Z1 } = this;
    const { px: X2, py: Y2, pz: Z2 } = isPoint(other);
    const { a, b } = CURVE;
    let X3 = 0n, Y3 = 0n, Z3 = 0n;
    const b3 = mod(b * 3n);
    let t0 = mod(X1 * X2), t1 = mod(Y1 * Y2), t2 = mod(Z1 * Z2), t3 = mod(X1 + Y1);
    let t4 = mod(X2 + Y2);
    t3 = mod(t3 * t4);
    t4 = mod(t0 + t1);
    t3 = mod(t3 - t4);
    t4 = mod(X1 + Z1);
    let t5 = mod(X2 + Z2);
    t4 = mod(t4 * t5);
    t5 = mod(t0 + t2);
    t4 = mod(t4 - t5);
    t5 = mod(Y1 + Z1);
    X3 = mod(Y2 + Z2);
    t5 = mod(t5 * X3);
    X3 = mod(t1 + t2);
    t5 = mod(t5 - X3);
    Z3 = mod(a * t4);
    X3 = mod(b3 * t2);
    Z3 = mod(X3 + Z3);
    X3 = mod(t1 - Z3);
    Z3 = mod(t1 + Z3);
    Y3 = mod(X3 * Z3);
    t1 = mod(t0 + t0);
    t1 = mod(t1 + t0);
    t2 = mod(a * t2);
    t4 = mod(b3 * t4);
    t1 = mod(t1 + t2);
    t2 = mod(t0 - t2);
    t2 = mod(a * t2);
    t4 = mod(t4 + t2);
    t0 = mod(t1 * t4);
    Y3 = mod(Y3 + t0);
    t0 = mod(t5 * t4);
    X3 = mod(t3 * X3);
    X3 = mod(X3 - t0);
    t0 = mod(t3 * t1);
    Z3 = mod(t5 * Z3);
    Z3 = mod(Z3 + t0);
    return new _Point(X3, Y3, Z3);
  }
  mul(n, safe = true) {
    if (!safe && n === 0n)
      return I;
    if (!ge(n))
      err("invalid scalar");
    if (this.equals(G))
      return wNAF(n).p;
    let p = I, f = G;
    for (let d = this; n > 0n; d = d.double(), n >>= 1n) {
      if (n & 1n)
        p = p.add(d);
      else if (safe)
        f = f.add(d);
    }
    return p;
  }
  mulAddQUns(R, u1, u2) {
    return this.mul(u1, false).add(R.mul(u2, false)).ok();
  }
  // to private keys. Doesn't use Shamir trick
  toAffine() {
    const { px: x, py: y, pz: z } = this;
    if (this.equals(I))
      return { x: 0n, y: 0n };
    if (z === 1n)
      return { x, y };
    const iz = inv(z);
    if (mod(z * iz) !== 1n)
      err("invalid inverse");
    return { x: mod(x * iz), y: mod(y * iz) };
  }
  assertValidity() {
    const { x, y } = this.aff();
    if (!fe(x) || !fe(y))
      err("Point invalid: x or y");
    return mod(y * y) === crv(x) ? (
      // y² = x³ + ax + b, must be equal
      this
    ) : err("Point invalid: not on curve");
  }
  multiply(n) {
    return this.mul(n);
  }
  // Aliases to compress code
  aff() {
    return this.toAffine();
  }
  ok() {
    return this.assertValidity();
  }
  toHex(isCompressed = true) {
    const { x, y } = this.aff();
    const head = isCompressed ? (y & 1n) === 0n ? "02" : "03" : "04";
    return head + n2h(x) + (isCompressed ? "" : n2h(y));
  }
  toRawBytes(isCompressed = true) {
    return h2b(this.toHex(isCompressed));
  }
};
Point.BASE = new Point(Gx, Gy, 1n);
Point.ZERO = new Point(0n, 1n, 0n);
var { BASE: G, ZERO: I } = Point;
var padh = (n, pad) => n.toString(16).padStart(pad, "0");
var b2h = (b) => Array.from(b).map((e) => padh(e, 2)).join("");
var h2b = (hex) => {
  const l = hex.length;
  if (!str(hex) || l % 2)
    err("hex invalid 1");
  const arr = u8n(l / 2);
  for (let i = 0; i < arr.length; i++) {
    const j = i * 2;
    const h = hex.slice(j, j + 2);
    const b = Number.parseInt(h, 16);
    if (Number.isNaN(b) || b < 0)
      err("hex invalid 2");
    arr[i] = b;
  }
  return arr;
};
var b2n = (b) => BigInt("0x" + (b2h(b) || "0"));
var slcNum = (b, from, to) => b2n(b.slice(from, to));
var n2b = (num) => {
  return big(num) && num >= 0n && num < B256 ? h2b(padh(num, 2 * fLen)) : err("bigint expected");
};
var n2h = (num) => b2h(n2b(num));
var concatB = (...arrs) => {
  const r = u8n(arrs.reduce((sum, a) => sum + au8(a).length, 0));
  let pad = 0;
  arrs.forEach((a) => {
    r.set(a, pad);
    pad += a.length;
  });
  return r;
};
var inv = (num, md = P) => {
  if (num === 0n || md <= 0n)
    err("no inverse n=" + num + " mod=" + md);
  let a = mod(num, md), b = md, x = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {
    const q = b / a, r = b % a;
    const m = x - u * q, n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  return b === 1n ? mod(x, md) : err("no inverse");
};
var sqrt = (n) => {
  let r = 1n;
  for (let num = n, e = (P + 1n) / 4n; e > 0n; e >>= 1n) {
    if (e & 1n)
      r = r * num % P;
    num = num * num % P;
  }
  return mod(r * r) === n ? r : err("sqrt invalid");
};
var toPriv = (p) => {
  if (!big(p))
    p = b2n(toU8(p, fLen));
  return ge(p) ? p : err("private key out of range");
};
var moreThanHalfN = (n) => n > N >> 1n;
var getPublicKey = (privKey, isCompressed = true) => {
  return Point.fromPrivateKey(privKey).toRawBytes(isCompressed);
};
var Signature = class _Signature {
  constructor(r, s, recovery) {
    this.r = r;
    this.s = s;
    this.recovery = recovery;
    this.assertValidity();
  }
  // constructed outside.
  static fromCompact(hex) {
    hex = toU8(hex, 64);
    return new _Signature(slcNum(hex, 0, fLen), slcNum(hex, fLen, 2 * fLen));
  }
  assertValidity() {
    return ge(this.r) && ge(this.s) ? this : err();
  }
  // 0 < r or s < CURVE.n
  addRecoveryBit(rec) {
    return new _Signature(this.r, this.s, rec);
  }
  hasHighS() {
    return moreThanHalfN(this.s);
  }
  normalizeS() {
    return this.hasHighS() ? new _Signature(this.r, mod(this.s, N), this.recovery) : this;
  }
  recoverPublicKey(msgh) {
    const { r, s, recovery: rec } = this;
    if (![0, 1, 2, 3].includes(rec))
      err("recovery id invalid");
    const h = bits2int_modN(toU8(msgh, fLen));
    const radj = rec === 2 || rec === 3 ? r + N : r;
    if (radj >= P)
      err("q.x invalid");
    const head = (rec & 1) === 0 ? "02" : "03";
    const R = Point.fromHex(head + n2h(radj));
    const ir = inv(radj, N);
    const u1 = mod(-h * ir, N);
    const u2 = mod(s * ir, N);
    return G.mulAddQUns(R, u1, u2);
  }
  toCompactRawBytes() {
    return h2b(this.toCompactHex());
  }
  // Uint8Array 64b compact repr
  toCompactHex() {
    return n2h(this.r) + n2h(this.s);
  }
  // hex 64b compact repr
};
var bits2int = (bytes) => {
  const delta = bytes.length * 8 - 256;
  const num = b2n(bytes);
  return delta > 0 ? num >> BigInt(delta) : num;
};
var bits2int_modN = (bytes) => {
  return mod(bits2int(bytes), N);
};
var i2o = (num) => n2b(num);
var cr = () => (
  // We support: 1) browsers 2) node.js 19+ 3) deno, other envs with crypto
  typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0
);
var _hmacSync;
var optS = { lowS: true };
var optV = { lowS: true };
var prepSig = (msgh, priv, opts = optS) => {
  if (["der", "recovered", "canonical"].some((k) => k in opts))
    err("sign() legacy options not supported");
  let { lowS } = opts;
  if (lowS == null)
    lowS = true;
  const h1i = bits2int_modN(toU8(msgh));
  const h1o = i2o(h1i);
  const d = toPriv(priv);
  const seed = [i2o(d), h1o];
  let ent = opts.extraEntropy;
  if (ent) {
    if (ent === true)
      ent = etc.randomBytes(fLen);
    const e = toU8(ent);
    if (e.length !== fLen)
      err();
    seed.push(e);
  }
  const m = h1i;
  const k2sig = (kBytes) => {
    const k = bits2int(kBytes);
    if (!ge(k))
      return;
    const ik = inv(k, N);
    const q = G.mul(k).aff();
    const r = mod(q.x, N);
    if (r === 0n)
      return;
    const s = mod(ik * mod(m + mod(d * r, N), N), N);
    if (s === 0n)
      return;
    let normS = s;
    let rec = (q.x === r ? 0 : 2) | Number(q.y & 1n);
    if (lowS && moreThanHalfN(s)) {
      normS = mod(-s, N);
      rec ^= 1;
    }
    return new Signature(r, normS, rec);
  };
  return { seed: concatB(...seed), k2sig };
};
function hmacDrbg(asynchronous) {
  let v = u8n(fLen);
  let k = u8n(fLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const _e = "drbg: tried 1000 values";
  if (asynchronous) {
    const h = (...b) => etc.hmacSha256Async(k, v, ...b);
    const reseed = async (seed = u8n()) => {
      k = await h(u8n([0]), seed);
      v = await h();
      if (seed.length === 0)
        return;
      k = await h(u8n([1]), seed);
      v = await h();
    };
    const gen = async () => {
      if (i++ >= 1e3)
        err(_e);
      v = await h();
      return v;
    };
    return async (seed, pred) => {
      reset();
      await reseed(seed);
      let res = void 0;
      while (!(res = pred(await gen())))
        await reseed();
      reset();
      return res;
    };
  } else {
    const h = (...b) => {
      const f = _hmacSync;
      if (!f)
        err("etc.hmacSha256Sync not set");
      return f(k, v, ...b);
    };
    const reseed = (seed = u8n()) => {
      k = h(u8n([0]), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8n([1]), seed);
      v = h();
    };
    const gen = () => {
      if (i++ >= 1e3)
        err(_e);
      v = h();
      return v;
    };
    return (seed, pred) => {
      reset();
      reseed(seed);
      let res = void 0;
      while (!(res = pred(gen())))
        reseed();
      reset();
      return res;
    };
  }
}
var signAsync = async (msgh, priv, opts = optS) => {
  const { seed, k2sig } = prepSig(msgh, priv, opts);
  return hmacDrbg(true)(seed, k2sig);
};
var sign = (msgh, priv, opts = optS) => {
  const { seed, k2sig } = prepSig(msgh, priv, opts);
  return hmacDrbg(false)(seed, k2sig);
};
var verify = (sig, msgh, pub, opts = optV) => {
  let { lowS } = opts;
  if (lowS == null)
    lowS = true;
  if ("strict" in opts)
    err("verify() legacy options not supported");
  let sig_, h, P2;
  const rs = sig && typeof sig === "object" && "r" in sig;
  if (!rs && toU8(sig).length !== 2 * fLen)
    err("signature must be 64 bytes");
  try {
    sig_ = rs ? new Signature(sig.r, sig.s).assertValidity() : Signature.fromCompact(sig);
    h = bits2int_modN(toU8(msgh));
    P2 = pub instanceof Point ? pub.ok() : Point.fromHex(pub);
  } catch (e) {
    return false;
  }
  if (!sig_)
    return false;
  const { r, s } = sig_;
  if (lowS && moreThanHalfN(s))
    return false;
  let R;
  try {
    const is = inv(s, N);
    const u1 = mod(h * is, N);
    const u2 = mod(r * is, N);
    R = G.mulAddQUns(P2, u1, u2).aff();
  } catch (error) {
    return false;
  }
  if (!R)
    return false;
  const v = mod(R.x, N);
  return v === r;
};
var getSharedSecret = (privA, pubB, isCompressed = true) => {
  return Point.fromHex(pubB).mul(toPriv(privA)).toRawBytes(isCompressed);
};
var hashToPrivateKey = (hash) => {
  hash = toU8(hash);
  const minLen = fLen + 8;
  if (hash.length < minLen || hash.length > 1024)
    err("expected proper params");
  const num = mod(b2n(hash), N - 1n) + 1n;
  return n2b(num);
};
var etc = {
  hexToBytes: h2b,
  bytesToHex: b2h,
  // share API with noble-curves.
  concatBytes: concatB,
  bytesToNumberBE: b2n,
  numberToBytesBE: n2b,
  mod,
  invert: inv,
  // math utilities
  hmacSha256Async: async (key, ...msgs) => {
    const c = cr();
    const s = c && c.subtle;
    if (!s)
      return err("etc.hmacSha256Async not set");
    const k = await s.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    return u8n(await s.sign("HMAC", k, concatB(...msgs)));
  },
  hmacSha256Sync: _hmacSync,
  // For TypeScript. Actual logic is below
  hashToPrivateKey,
  randomBytes: (len = 32) => {
    const crypto = cr();
    if (!crypto || !crypto.getRandomValues)
      err("crypto.getRandomValues must be defined");
    return crypto.getRandomValues(u8n(len));
  }
};
var utils = {
  normPrivateKeyToScalar: toPriv,
  isValidPrivateKey: (key) => {
    try {
      return !!toPriv(key);
    } catch (e) {
      return false;
    }
  },
  randomPrivateKey: () => hashToPrivateKey(etc.randomBytes(fLen + 16)),
  // FIPS 186 B.4.1.
  precompute(w = 8, p = G) {
    p.multiply(3n);
    w;
    return p;
  }
  // no-op
};
Object.defineProperties(etc, { hmacSha256Sync: {
  configurable: false,
  get() {
    return _hmacSync;
  },
  set(f) {
    if (!_hmacSync)
      _hmacSync = f;
  }
} });
var W = 8;
var precompute = () => {
  const points = [];
  const windows = 256 / W + 1;
  let p = G, b = p;
  for (let w = 0; w < windows; w++) {
    b = p;
    points.push(b);
    for (let i = 1; i < 2 ** (W - 1); i++) {
      b = b.add(p);
      points.push(b);
    }
    p = b.double();
  }
  return points;
};
var Gpows = void 0;
var wNAF = (n) => {
  const comp = Gpows || (Gpows = precompute());
  const neg = (cnd, p2) => {
    let n2 = p2.negate();
    return cnd ? n2 : p2;
  };
  let p = I, f = G;
  const windows = 1 + 256 / W;
  const wsize = 2 ** (W - 1);
  const mask = BigInt(2 ** W - 1);
  const maxNum = 2 ** W;
  const shiftBy = BigInt(W);
  for (let w = 0; w < windows; w++) {
    const off = w * wsize;
    let wbits = Number(n & mask);
    n >>= shiftBy;
    if (wbits > wsize) {
      wbits -= maxNum;
      n += 1n;
    }
    const off1 = off, off2 = off + Math.abs(wbits) - 1;
    const cnd1 = w % 2 !== 0, cnd2 = wbits < 0;
    if (wbits === 0) {
      f = f.add(neg(cnd1, comp[off1]));
    } else {
      p = p.add(neg(cnd2, comp[off2]));
    }
  }
  return { p, f };
};
export {
  CURVE,
  Point as ProjectivePoint,
  Signature,
  etc,
  getPublicKey,
  getSharedSecret,
  sign,
  signAsync,
  utils,
  verify
};
/*! Bundled license information:

@noble/secp256k1/index.js:
  (*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/
