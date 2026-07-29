var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod4) => function __require2() {
  try {
    return mod4 || (0, cb[__getOwnPropNames(cb)[0]])((mod4 = { exports: {} }).exports, mod4), mod4.exports;
  } catch (e) {
    throw mod4 = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod4, isNodeMode, target) => (target = mod4 != null ? __create(__getProtoOf(mod4)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod4 || !mod4.__esModule ? __defProp(target, "default", { value: mod4, enumerable: true }) : target,
  mod4
));

// node_modules/@noble/hashes/_assert.js
var require_assert = __commonJS({
  "node_modules/@noble/hashes/_assert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = void 0;
    function number2(n) {
      if (!Number.isSafeInteger(n) || n < 0)
        throw new Error(`Wrong positive integer: ${n}`);
    }
    exports.number = number2;
    function bool2(b) {
      if (typeof b !== "boolean")
        throw new Error(`Expected boolean, not ${b}`);
    }
    exports.bool = bool2;
    function bytes2(b, ...lengths) {
      if (!(b instanceof Uint8Array))
        throw new TypeError("Expected Uint8Array");
      if (lengths.length > 0 && !lengths.includes(b.length))
        throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
    }
    exports.bytes = bytes2;
    function hash2(hash3) {
      if (typeof hash3 !== "function" || typeof hash3.create !== "function")
        throw new Error("Hash should be wrapped by utils.wrapConstructor");
      number2(hash3.outputLen);
      number2(hash3.blockLen);
    }
    exports.hash = hash2;
    function exists2(instance, checkFinished = true) {
      if (instance.destroyed)
        throw new Error("Hash instance has been destroyed");
      if (checkFinished && instance.finished)
        throw new Error("Hash#digest() has already been called");
    }
    exports.exists = exists2;
    function output2(out, instance) {
      bytes2(out);
      const min = instance.outputLen;
      if (out.length < min) {
        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
      }
    }
    exports.output = output2;
    var assert2 = {
      number: number2,
      bool: bool2,
      bytes: bytes2,
      hash: hash2,
      exists: exists2,
      output: output2
    };
    exports.default = assert2;
  }
});

// node_modules/@noble/hashes/cryptoBrowser.js
var require_cryptoBrowser = __commonJS({
  "node_modules/@noble/hashes/cryptoBrowser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.crypto = void 0;
    exports.crypto = {
      node: void 0,
      web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
    };
  }
});

// node_modules/@noble/hashes/utils.js
var require_utils = __commonJS({
  "node_modules/@noble/hashes/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomBytes = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.isLE = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0;
    var crypto_1 = require_cryptoBrowser();
    var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    exports.u8 = u8;
    var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
    exports.u32 = u32;
    var createView2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    exports.createView = createView2;
    var rotr2 = (word, shift) => word << 32 - shift | word >>> shift;
    exports.rotr = rotr2;
    exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
    if (!exports.isLE)
      throw new Error("Non little-endian hardware is not supported");
    var hexes6 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
    function bytesToHex6(uint8a) {
      if (!(uint8a instanceof Uint8Array))
        throw new Error("Uint8Array expected");
      let hex = "";
      for (let i = 0; i < uint8a.length; i++) {
        hex += hexes6[uint8a[i]];
      }
      return hex;
    }
    exports.bytesToHex = bytesToHex6;
    function hexToBytes6(hex) {
      if (typeof hex !== "string") {
        throw new TypeError("hexToBytes: expected string, got " + typeof hex);
      }
      if (hex.length % 2)
        throw new Error("hexToBytes: received invalid unpadded hex");
      const array = new Uint8Array(hex.length / 2);
      for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0)
          throw new Error("Invalid byte sequence");
        array[i] = byte;
      }
      return array;
    }
    exports.hexToBytes = hexToBytes6;
    var nextTick = async () => {
    };
    exports.nextTick = nextTick;
    async function asyncLoop(iters, tick, cb) {
      let ts = Date.now();
      for (let i = 0; i < iters; i++) {
        cb(i);
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
          continue;
        await (0, exports.nextTick)();
        ts += diff;
      }
    }
    exports.asyncLoop = asyncLoop;
    function utf8ToBytes3(str) {
      if (typeof str !== "string") {
        throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
      }
      return new TextEncoder().encode(str);
    }
    exports.utf8ToBytes = utf8ToBytes3;
    function toBytes2(data) {
      if (typeof data === "string")
        data = utf8ToBytes3(data);
      if (!(data instanceof Uint8Array))
        throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
      return data;
    }
    exports.toBytes = toBytes2;
    function concatBytes6(...arrays) {
      if (!arrays.every((a) => a instanceof Uint8Array))
        throw new Error("Uint8Array list expected");
      if (arrays.length === 1)
        return arrays[0];
      const length = arrays.reduce((a, arr) => a + arr.length, 0);
      const result = new Uint8Array(length);
      for (let i = 0, pad = 0; i < arrays.length; i++) {
        const arr = arrays[i];
        result.set(arr, pad);
        pad += arr.length;
      }
      return result;
    }
    exports.concatBytes = concatBytes6;
    var Hash2 = class {
      // Safe version that clones internal state
      clone() {
        return this._cloneInto();
      }
    };
    exports.Hash = Hash2;
    var isPlainObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]" && obj.constructor === Object;
    function checkOpts(defaults, opts) {
      if (opts !== void 0 && (typeof opts !== "object" || !isPlainObject(opts)))
        throw new TypeError("Options should be object or undefined");
      const merged = Object.assign(defaults, opts);
      return merged;
    }
    exports.checkOpts = checkOpts;
    function wrapConstructor2(hashConstructor) {
      const hashC = (message) => hashConstructor().update(toBytes2(message)).digest();
      const tmp = hashConstructor();
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = () => hashConstructor();
      return hashC;
    }
    exports.wrapConstructor = wrapConstructor2;
    function wrapConstructorWithOpts(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      return hashC;
    }
    exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
    function randomBytes2(bytesLength = 32) {
      if (crypto_1.crypto.web) {
        return crypto_1.crypto.web.getRandomValues(new Uint8Array(bytesLength));
      } else if (crypto_1.crypto.node) {
        return new Uint8Array(crypto_1.crypto.node.randomBytes(bytesLength).buffer);
      } else {
        throw new Error("The environment doesn't have randomBytes function");
      }
    }
    exports.randomBytes = randomBytes2;
  }
});

// node_modules/@noble/hashes/hmac.js
var require_hmac = __commonJS({
  "node_modules/@noble/hashes/hmac.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hmac = void 0;
    var _assert_js_1 = require_assert();
    var utils_js_1 = require_utils();
    var HMAC2 = class extends utils_js_1.Hash {
      constructor(hash2, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        _assert_js_1.default.hash(hash2);
        const key = (0, utils_js_1.toBytes)(_key);
        this.iHash = hash2.create();
        if (typeof this.iHash.update !== "function")
          throw new TypeError("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        pad.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54;
        this.iHash.update(pad);
        this.oHash = hash2.create();
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54 ^ 92;
        this.oHash.update(pad);
        pad.fill(0);
      }
      update(buf) {
        _assert_js_1.default.exists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        _assert_js_1.default.exists(this);
        _assert_js_1.default.bytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    var hmac2 = (hash2, key, message) => new HMAC2(hash2, key).update(message).digest();
    exports.hmac = hmac2;
    exports.hmac.create = (hash2, key) => new HMAC2(hash2, key);
  }
});

// node_modules/@noble/hashes/pbkdf2.js
var require_pbkdf2 = __commonJS({
  "node_modules/@noble/hashes/pbkdf2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pbkdf2Async = exports.pbkdf2 = void 0;
    var _assert_js_1 = require_assert();
    var hmac_js_1 = require_hmac();
    var utils_js_1 = require_utils();
    function pbkdf2Init(hash2, _password, _salt, _opts) {
      _assert_js_1.default.hash(hash2);
      const opts = (0, utils_js_1.checkOpts)({ dkLen: 32, asyncTick: 10 }, _opts);
      const { c, dkLen, asyncTick } = opts;
      _assert_js_1.default.number(c);
      _assert_js_1.default.number(dkLen);
      _assert_js_1.default.number(asyncTick);
      if (c < 1)
        throw new Error("PBKDF2: iterations (c) should be >= 1");
      const password = (0, utils_js_1.toBytes)(_password);
      const salt = (0, utils_js_1.toBytes)(_salt);
      const DK = new Uint8Array(dkLen);
      const PRF = hmac_js_1.hmac.create(hash2, password);
      const PRFSalt = PRF._cloneInto().update(salt);
      return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
    }
    function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
      PRF.destroy();
      PRFSalt.destroy();
      if (prfW)
        prfW.destroy();
      u.fill(0);
      return DK;
    }
    function pbkdf2(hash2, password, salt, opts) {
      const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash2, password, salt, opts);
      let prfW;
      const arr = new Uint8Array(4);
      const view = (0, utils_js_1.createView)(arr);
      const u = new Uint8Array(PRF.outputLen);
      for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
        const Ti = DK.subarray(pos, pos + PRF.outputLen);
        view.setInt32(0, ti, false);
        (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
        Ti.set(u.subarray(0, Ti.length));
        for (let ui = 1; ui < c; ui++) {
          PRF._cloneInto(prfW).update(u).digestInto(u);
          for (let i = 0; i < Ti.length; i++)
            Ti[i] ^= u[i];
        }
      }
      return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
    }
    exports.pbkdf2 = pbkdf2;
    async function pbkdf2Async(hash2, password, salt, opts) {
      const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash2, password, salt, opts);
      let prfW;
      const arr = new Uint8Array(4);
      const view = (0, utils_js_1.createView)(arr);
      const u = new Uint8Array(PRF.outputLen);
      for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
        const Ti = DK.subarray(pos, pos + PRF.outputLen);
        view.setInt32(0, ti, false);
        (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
        Ti.set(u.subarray(0, Ti.length));
        await (0, utils_js_1.asyncLoop)(c - 1, asyncTick, (i) => {
          PRF._cloneInto(prfW).update(u).digestInto(u);
          for (let i2 = 0; i2 < Ti.length; i2++)
            Ti[i2] ^= u[i2];
        });
      }
      return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
    }
    exports.pbkdf2Async = pbkdf2Async;
  }
});

// node_modules/@noble/hashes/_sha2.js
var require_sha2 = __commonJS({
  "node_modules/@noble/hashes/_sha2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SHA2 = void 0;
    var _assert_js_1 = require_assert();
    var utils_js_1 = require_utils();
    function setBigUint642(view, byteOffset, value, isLE2) {
      if (typeof view.setBigUint64 === "function")
        return view.setBigUint64(byteOffset, value, isLE2);
      const _32n2 = BigInt(32);
      const _u32_max = BigInt(4294967295);
      const wh = Number(value >> _32n2 & _u32_max);
      const wl = Number(value & _u32_max);
      const h = isLE2 ? 4 : 0;
      const l = isLE2 ? 0 : 4;
      view.setUint32(byteOffset + h, wh, isLE2);
      view.setUint32(byteOffset + l, wl, isLE2);
    }
    var SHA22 = class extends utils_js_1.Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0, utils_js_1.createView)(this.buffer);
      }
      update(data) {
        _assert_js_1.default.exists(this);
        const { view, buffer, blockLen } = this;
        data = (0, utils_js_1.toBytes)(data);
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = (0, utils_js_1.createView)(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        _assert_js_1.default.exists(this);
        _assert_js_1.default.output(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        this.buffer.subarray(pos).fill(0);
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = (0, utils_js_1.createView)(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
    };
    exports.SHA2 = SHA22;
  }
});

// node_modules/@noble/hashes/sha256.js
var require_sha256 = __commonJS({
  "node_modules/@noble/hashes/sha256.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sha224 = exports.sha256 = void 0;
    var _sha2_js_1 = require_sha2();
    var utils_js_1 = require_utils();
    var Chi2 = (a, b, c) => a & b ^ ~a & c;
    var Maj2 = (a, b, c) => a & b ^ a & c ^ b & c;
    var SHA256_K2 = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    var IV2 = new Uint32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    var SHA256_W2 = new Uint32Array(64);
    var SHA2562 = class extends _sha2_js_1.SHA2 {
      constructor() {
        super(64, 32, 8, false);
        this.A = IV2[0] | 0;
        this.B = IV2[1] | 0;
        this.C = IV2[2] | 0;
        this.D = IV2[3] | 0;
        this.E = IV2[4] | 0;
        this.F = IV2[5] | 0;
        this.G = IV2[6] | 0;
        this.H = IV2[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W2[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W2[i - 15];
          const W2 = SHA256_W2[i - 2];
          const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ W15 >>> 3;
          const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ W2 >>> 10;
          SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
          const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
          const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
          const T2 = sigma0 + Maj2(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        SHA256_W2.fill(0);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
      }
    };
    var SHA2242 = class extends SHA2562 {
      constructor() {
        super();
        this.A = 3238371032 | 0;
        this.B = 914150663 | 0;
        this.C = 812702999 | 0;
        this.D = 4144912697 | 0;
        this.E = 4290775857 | 0;
        this.F = 1750603025 | 0;
        this.G = 1694076839 | 0;
        this.H = 3204075428 | 0;
        this.outputLen = 28;
      }
    };
    exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA2562());
    exports.sha224 = (0, utils_js_1.wrapConstructor)(() => new SHA2242());
  }
});

// node_modules/@noble/hashes/_u64.js
var require_u64 = __commonJS({
  "node_modules/@noble/hashes/_u64.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.add = exports.toBig = exports.split = exports.fromBig = void 0;
    var U32_MASK642 = BigInt(2 ** 32 - 1);
    var _32n2 = BigInt(32);
    function fromBig2(n, le = false) {
      if (le)
        return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
      return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
    }
    exports.fromBig = fromBig2;
    function split2(lst, le = false) {
      let Ah = new Uint32Array(lst.length);
      let Al = new Uint32Array(lst.length);
      for (let i = 0; i < lst.length; i++) {
        const { h, l } = fromBig2(lst[i], le);
        [Ah[i], Al[i]] = [h, l];
      }
      return [Ah, Al];
    }
    exports.split = split2;
    var toBig2 = (h, l) => BigInt(h >>> 0) << _32n2 | BigInt(l >>> 0);
    exports.toBig = toBig2;
    var shrSH2 = (h, l, s) => h >>> s;
    var shrSL2 = (h, l, s) => h << 32 - s | l >>> s;
    var rotrSH2 = (h, l, s) => h >>> s | l << 32 - s;
    var rotrSL2 = (h, l, s) => h << 32 - s | l >>> s;
    var rotrBH2 = (h, l, s) => h << 64 - s | l >>> s - 32;
    var rotrBL2 = (h, l, s) => h >>> s - 32 | l << 64 - s;
    var rotr32H2 = (h, l) => l;
    var rotr32L2 = (h, l) => h;
    var rotlSH2 = (h, l, s) => h << s | l >>> 32 - s;
    var rotlSL2 = (h, l, s) => l << s | h >>> 32 - s;
    var rotlBH2 = (h, l, s) => l << s - 32 | h >>> 64 - s;
    var rotlBL2 = (h, l, s) => h << s - 32 | l >>> 64 - s;
    function add2(Ah, Al, Bh, Bl) {
      const l = (Al >>> 0) + (Bl >>> 0);
      return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
    }
    exports.add = add2;
    var add3L2 = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    var add3H2 = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
    var add4L2 = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    var add4H2 = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
    var add5L2 = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    var add5H2 = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
    var u642 = {
      fromBig: fromBig2,
      split: split2,
      toBig: exports.toBig,
      shrSH: shrSH2,
      shrSL: shrSL2,
      rotrSH: rotrSH2,
      rotrSL: rotrSL2,
      rotrBH: rotrBH2,
      rotrBL: rotrBL2,
      rotr32H: rotr32H2,
      rotr32L: rotr32L2,
      rotlSH: rotlSH2,
      rotlSL: rotlSL2,
      rotlBH: rotlBH2,
      rotlBL: rotlBL2,
      add: add2,
      add3L: add3L2,
      add3H: add3H2,
      add4L: add4L2,
      add4H: add4H2,
      add5H: add5H2,
      add5L: add5L2
    };
    exports.default = u642;
  }
});

// node_modules/@noble/hashes/sha512.js
var require_sha512 = __commonJS({
  "node_modules/@noble/hashes/sha512.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sha384 = exports.sha512_256 = exports.sha512_224 = exports.sha512 = exports.SHA512 = void 0;
    var _sha2_js_1 = require_sha2();
    var _u64_js_1 = require_u64();
    var utils_js_1 = require_utils();
    var [SHA512_Kh2, SHA512_Kl2] = _u64_js_1.default.split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n)));
    var SHA512_W_H2 = new Uint32Array(80);
    var SHA512_W_L2 = new Uint32Array(80);
    var SHA5122 = class extends _sha2_js_1.SHA2 {
      constructor() {
        super(128, 64, 16, false);
        this.Ah = 1779033703 | 0;
        this.Al = 4089235720 | 0;
        this.Bh = 3144134277 | 0;
        this.Bl = 2227873595 | 0;
        this.Ch = 1013904242 | 0;
        this.Cl = 4271175723 | 0;
        this.Dh = 2773480762 | 0;
        this.Dl = 1595750129 | 0;
        this.Eh = 1359893119 | 0;
        this.El = 2917565137 | 0;
        this.Fh = 2600822924 | 0;
        this.Fl = 725511199 | 0;
        this.Gh = 528734635 | 0;
        this.Gl = 4215389547 | 0;
        this.Hh = 1541459225 | 0;
        this.Hl = 327033209 | 0;
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H2[i] = view.getUint32(offset);
          SHA512_W_L2[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H2[i - 15] | 0;
          const W15l = SHA512_W_L2[i - 15] | 0;
          const s0h = _u64_js_1.default.rotrSH(W15h, W15l, 1) ^ _u64_js_1.default.rotrSH(W15h, W15l, 8) ^ _u64_js_1.default.shrSH(W15h, W15l, 7);
          const s0l = _u64_js_1.default.rotrSL(W15h, W15l, 1) ^ _u64_js_1.default.rotrSL(W15h, W15l, 8) ^ _u64_js_1.default.shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H2[i - 2] | 0;
          const W2l = SHA512_W_L2[i - 2] | 0;
          const s1h = _u64_js_1.default.rotrSH(W2h, W2l, 19) ^ _u64_js_1.default.rotrBH(W2h, W2l, 61) ^ _u64_js_1.default.shrSH(W2h, W2l, 6);
          const s1l = _u64_js_1.default.rotrSL(W2h, W2l, 19) ^ _u64_js_1.default.rotrBL(W2h, W2l, 61) ^ _u64_js_1.default.shrSL(W2h, W2l, 6);
          const SUMl = _u64_js_1.default.add4L(s0l, s1l, SHA512_W_L2[i - 7], SHA512_W_L2[i - 16]);
          const SUMh = _u64_js_1.default.add4H(SUMl, s0h, s1h, SHA512_W_H2[i - 7], SHA512_W_H2[i - 16]);
          SHA512_W_H2[i] = SUMh | 0;
          SHA512_W_L2[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = _u64_js_1.default.rotrSH(Eh, El, 14) ^ _u64_js_1.default.rotrSH(Eh, El, 18) ^ _u64_js_1.default.rotrBH(Eh, El, 41);
          const sigma1l = _u64_js_1.default.rotrSL(Eh, El, 14) ^ _u64_js_1.default.rotrSL(Eh, El, 18) ^ _u64_js_1.default.rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = _u64_js_1.default.add5L(Hl, sigma1l, CHIl, SHA512_Kl2[i], SHA512_W_L2[i]);
          const T1h = _u64_js_1.default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh2[i], SHA512_W_H2[i]);
          const T1l = T1ll | 0;
          const sigma0h = _u64_js_1.default.rotrSH(Ah, Al, 28) ^ _u64_js_1.default.rotrBH(Ah, Al, 34) ^ _u64_js_1.default.rotrBH(Ah, Al, 39);
          const sigma0l = _u64_js_1.default.rotrSL(Ah, Al, 28) ^ _u64_js_1.default.rotrBL(Ah, Al, 34) ^ _u64_js_1.default.rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = _u64_js_1.default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = _u64_js_1.default.add3L(T1l, sigma0l, MAJl);
          Ah = _u64_js_1.default.add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = _u64_js_1.default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = _u64_js_1.default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = _u64_js_1.default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = _u64_js_1.default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = _u64_js_1.default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = _u64_js_1.default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = _u64_js_1.default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = _u64_js_1.default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        SHA512_W_H2.fill(0);
        SHA512_W_L2.fill(0);
      }
      destroy() {
        this.buffer.fill(0);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    exports.SHA512 = SHA5122;
    var SHA512_2242 = class extends SHA5122 {
      constructor() {
        super();
        this.Ah = 2352822216 | 0;
        this.Al = 424955298 | 0;
        this.Bh = 1944164710 | 0;
        this.Bl = 2312950998 | 0;
        this.Ch = 502970286 | 0;
        this.Cl = 855612546 | 0;
        this.Dh = 1738396948 | 0;
        this.Dl = 1479516111 | 0;
        this.Eh = 258812777 | 0;
        this.El = 2077511080 | 0;
        this.Fh = 2011393907 | 0;
        this.Fl = 79989058 | 0;
        this.Gh = 1067287976 | 0;
        this.Gl = 1780299464 | 0;
        this.Hh = 286451373 | 0;
        this.Hl = 2446758561 | 0;
        this.outputLen = 28;
      }
    };
    var SHA512_2562 = class extends SHA5122 {
      constructor() {
        super();
        this.Ah = 573645204 | 0;
        this.Al = 4230739756 | 0;
        this.Bh = 2673172387 | 0;
        this.Bl = 3360449730 | 0;
        this.Ch = 596883563 | 0;
        this.Cl = 1867755857 | 0;
        this.Dh = 2520282905 | 0;
        this.Dl = 1497426621 | 0;
        this.Eh = 2519219938 | 0;
        this.El = 2827943907 | 0;
        this.Fh = 3193839141 | 0;
        this.Fl = 1401305490 | 0;
        this.Gh = 721525244 | 0;
        this.Gl = 746961066 | 0;
        this.Hh = 246885852 | 0;
        this.Hl = 2177182882 | 0;
        this.outputLen = 32;
      }
    };
    var SHA3842 = class extends SHA5122 {
      constructor() {
        super();
        this.Ah = 3418070365 | 0;
        this.Al = 3238371032 | 0;
        this.Bh = 1654270250 | 0;
        this.Bl = 914150663 | 0;
        this.Ch = 2438529370 | 0;
        this.Cl = 812702999 | 0;
        this.Dh = 355462360 | 0;
        this.Dl = 4144912697 | 0;
        this.Eh = 1731405415 | 0;
        this.El = 4290775857 | 0;
        this.Fh = 2394180231 | 0;
        this.Fl = 1750603025 | 0;
        this.Gh = 3675008525 | 0;
        this.Gl = 1694076839 | 0;
        this.Hh = 1203062813 | 0;
        this.Hl = 3204075428 | 0;
        this.outputLen = 48;
      }
    };
    exports.sha512 = (0, utils_js_1.wrapConstructor)(() => new SHA5122());
    exports.sha512_224 = (0, utils_js_1.wrapConstructor)(() => new SHA512_2242());
    exports.sha512_256 = (0, utils_js_1.wrapConstructor)(() => new SHA512_2562());
    exports.sha384 = (0, utils_js_1.wrapConstructor)(() => new SHA3842());
  }
});

// node_modules/@scure/bip39/node_modules/@scure/base/lib/index.js
var require_lib = __commonJS({
  "node_modules/@scure/bip39/node_modules/@scure/base/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.createBase58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64urlnopad = exports.base64url = exports.base64nopad = exports.base64 = exports.base32crockford = exports.base32hexnopad = exports.base32hex = exports.base32nopad = exports.base32 = exports.base16 = exports.utils = void 0;
    exports.assertNumber = assertNumber2;
    // @__NO_SIDE_EFFECTS__
    function assertNumber2(n) {
      if (!Number.isSafeInteger(n))
        throw new Error(`Wrong integer: ${n}`);
    }
    function isBytes3(a) {
      return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
    }
    // @__NO_SIDE_EFFECTS__
    function chain2(...args) {
      const id = (a) => a;
      const wrap = (a, b) => (c) => a(b(c));
      const encode = args.map((x) => x.encode).reduceRight(wrap, id);
      const decode = args.map((x) => x.decode).reduce(wrap, id);
      return { encode, decode };
    }
    // @__NO_SIDE_EFFECTS__
    function alphabet2(alphabet3) {
      return {
        encode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("alphabet.encode input should be an array of numbers");
          return digits.map((i) => {
            /* @__PURE__ */ assertNumber2(i);
            if (i < 0 || i >= alphabet3.length)
              throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet3.length})`);
            return alphabet3[i];
          });
        },
        decode: (input) => {
          if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
            throw new Error("alphabet.decode input should be array of strings");
          return input.map((letter) => {
            if (typeof letter !== "string")
              throw new Error(`alphabet.decode: not string element=${letter}`);
            const index = alphabet3.indexOf(letter);
            if (index === -1)
              throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet3}`);
            return index;
          });
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function join2(separator = "") {
      if (typeof separator !== "string")
        throw new Error("join separator should be string");
      return {
        encode: (from) => {
          if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
            throw new Error("join.encode input should be array of strings");
          for (let i of from)
            if (typeof i !== "string")
              throw new Error(`join.encode: non-string input=${i}`);
          return from.join(separator);
        },
        decode: (to) => {
          if (typeof to !== "string")
            throw new Error("join.decode input should be string");
          return to.split(separator);
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function padding(bits, chr = "=") {
      /* @__PURE__ */ assertNumber2(bits);
      if (typeof chr !== "string")
        throw new Error("padding chr should be string");
      return {
        encode(data) {
          if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
            throw new Error("padding.encode input should be array of strings");
          for (let i of data)
            if (typeof i !== "string")
              throw new Error(`padding.encode: non-string input=${i}`);
          while (data.length * bits % 8)
            data.push(chr);
          return data;
        },
        decode(input) {
          if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
            throw new Error("padding.encode input should be array of strings");
          for (let i of input)
            if (typeof i !== "string")
              throw new Error(`padding.decode: non-string input=${i}`);
          let end = input.length;
          if (end * bits % 8)
            throw new Error("Invalid padding: string should have whole number of bytes");
          for (; end > 0 && input[end - 1] === chr; end--) {
            if (!((end - 1) * bits % 8))
              throw new Error("Invalid padding: string has too much padding");
          }
          return input.slice(0, end);
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function normalize(fn) {
      if (typeof fn !== "function")
        throw new Error("normalize fn should be function");
      return { encode: (from) => from, decode: (to) => fn(to) };
    }
    // @__NO_SIDE_EFFECTS__
    function convertRadix2(data, from, to) {
      if (from < 2)
        throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
      if (to < 2)
        throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
      if (!Array.isArray(data))
        throw new Error("convertRadix: data should be array");
      if (!data.length)
        return [];
      let pos = 0;
      const res = [];
      const digits = Array.from(data);
      digits.forEach((d) => {
        /* @__PURE__ */ assertNumber2(d);
        if (d < 0 || d >= from)
          throw new Error(`Wrong integer: ${d}`);
      });
      while (true) {
        let carry = 0;
        let done = true;
        for (let i = pos; i < digits.length; i++) {
          const digit = digits[i];
          const digitBase = from * carry + digit;
          if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
            throw new Error("convertRadix: carry overflow");
          }
          carry = digitBase % to;
          const rounded = Math.floor(digitBase / to);
          digits[i] = rounded;
          if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
            throw new Error("convertRadix: carry overflow");
          if (!done)
            continue;
          else if (!rounded)
            pos = i;
          else
            done = false;
        }
        res.push(carry);
        if (done)
          break;
      }
      for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
        res.push(0);
      return res.reverse();
    }
    var gcd = /* @__NO_SIDE_EFFECTS__ */ (a, b) => !b ? a : /* @__PURE__ */ gcd(b, a % b);
    var radix2carry = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - /* @__PURE__ */ gcd(from, to));
    // @__NO_SIDE_EFFECTS__
    function convertRadix22(data, from, to, padding2) {
      if (!Array.isArray(data))
        throw new Error("convertRadix2: data should be array");
      if (from <= 0 || from > 32)
        throw new Error(`convertRadix2: wrong from=${from}`);
      if (to <= 0 || to > 32)
        throw new Error(`convertRadix2: wrong to=${to}`);
      if (/* @__PURE__ */ radix2carry(from, to) > 32) {
        throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry(from, to)}`);
      }
      let carry = 0;
      let pos = 0;
      const mask = 2 ** to - 1;
      const res = [];
      for (const n of data) {
        /* @__PURE__ */ assertNumber2(n);
        if (n >= 2 ** from)
          throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
        carry = carry << from | n;
        if (pos + from > 32)
          throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
        pos += from;
        for (; pos >= to; pos -= to)
          res.push((carry >> pos - to & mask) >>> 0);
        carry &= 2 ** pos - 1;
      }
      carry = carry << to - pos & mask;
      if (!padding2 && pos >= from)
        throw new Error("Excess padding");
      if (!padding2 && carry)
        throw new Error(`Non-zero padding: ${carry}`);
      if (padding2 && pos > 0)
        res.push(carry >>> 0);
      return res;
    }
    // @__NO_SIDE_EFFECTS__
    function radix2(num) {
      /* @__PURE__ */ assertNumber2(num);
      return {
        encode: (bytes2) => {
          if (!isBytes3(bytes2))
            throw new Error("radix.encode input should be Uint8Array");
          return /* @__PURE__ */ convertRadix2(Array.from(bytes2), 2 ** 8, num);
        },
        decode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("radix.decode input should be array of numbers");
          return Uint8Array.from(/* @__PURE__ */ convertRadix2(digits, num, 2 ** 8));
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function radix22(bits, revPadding = false) {
      /* @__PURE__ */ assertNumber2(bits);
      if (bits <= 0 || bits > 32)
        throw new Error("radix2: bits should be in (0..32]");
      if (/* @__PURE__ */ radix2carry(8, bits) > 32 || /* @__PURE__ */ radix2carry(bits, 8) > 32)
        throw new Error("radix2: carry overflow");
      return {
        encode: (bytes2) => {
          if (!isBytes3(bytes2))
            throw new Error("radix2.encode input should be Uint8Array");
          return /* @__PURE__ */ convertRadix22(Array.from(bytes2), 8, bits, !revPadding);
        },
        decode: (digits) => {
          if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
            throw new Error("radix2.decode input should be array of numbers");
          return Uint8Array.from(/* @__PURE__ */ convertRadix22(digits, bits, 8, revPadding));
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function unsafeWrapper(fn) {
      if (typeof fn !== "function")
        throw new Error("unsafeWrapper fn should be function");
      return function(...args) {
        try {
          return fn.apply(null, args);
        } catch (e) {
        }
      };
    }
    // @__NO_SIDE_EFFECTS__
    function checksum2(len, fn) {
      /* @__PURE__ */ assertNumber2(len);
      if (typeof fn !== "function")
        throw new Error("checksum fn should be function");
      return {
        encode(data) {
          if (!isBytes3(data))
            throw new Error("checksum.encode: input should be Uint8Array");
          const checksum3 = fn(data).slice(0, len);
          const res = new Uint8Array(data.length + len);
          res.set(data);
          res.set(checksum3, data.length);
          return res;
        },
        decode(data) {
          if (!isBytes3(data))
            throw new Error("checksum.decode: input should be Uint8Array");
          const payload = data.slice(0, -len);
          const newChecksum = fn(payload).slice(0, len);
          const oldChecksum = data.slice(-len);
          for (let i = 0; i < len; i++)
            if (newChecksum[i] !== oldChecksum[i])
              throw new Error("Invalid checksum");
          return payload;
        }
      };
    }
    exports.utils = {
      alphabet: alphabet2,
      chain: chain2,
      checksum: checksum2,
      convertRadix: convertRadix2,
      convertRadix2: convertRadix22,
      radix: radix2,
      radix2: radix22,
      join: join2,
      padding
    };
    exports.base16 = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(4), /* @__PURE__ */ alphabet2("0123456789ABCDEF"), /* @__PURE__ */ join2(""));
    exports.base32 = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(5), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), /* @__PURE__ */ padding(5), /* @__PURE__ */ join2(""));
    exports.base32nopad = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(5), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), /* @__PURE__ */ join2(""));
    exports.base32hex = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(5), /* @__PURE__ */ alphabet2("0123456789ABCDEFGHIJKLMNOPQRSTUV"), /* @__PURE__ */ padding(5), /* @__PURE__ */ join2(""));
    exports.base32hexnopad = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(5), /* @__PURE__ */ alphabet2("0123456789ABCDEFGHIJKLMNOPQRSTUV"), /* @__PURE__ */ join2(""));
    exports.base32crockford = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(5), /* @__PURE__ */ alphabet2("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), /* @__PURE__ */ join2(""), /* @__PURE__ */ normalize((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
    exports.base64 = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(6), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ padding(6), /* @__PURE__ */ join2(""));
    exports.base64nopad = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(6), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ join2(""));
    exports.base64url = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(6), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), /* @__PURE__ */ padding(6), /* @__PURE__ */ join2(""));
    exports.base64urlnopad = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(6), /* @__PURE__ */ alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), /* @__PURE__ */ join2(""));
    var genBase582 = (abc) => /* @__PURE__ */ chain2(/* @__PURE__ */ radix2(58), /* @__PURE__ */ alphabet2(abc), /* @__PURE__ */ join2(""));
    exports.base58 = genBase582("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    exports.base58flickr = genBase582("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
    exports.base58xrp = genBase582("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
    var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
    exports.base58xmr = {
      encode(data) {
        let res = "";
        for (let i = 0; i < data.length; i += 8) {
          const block = data.subarray(i, i + 8);
          res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
        }
        return res;
      },
      decode(str) {
        let res = [];
        for (let i = 0; i < str.length; i += 11) {
          const slice = str.slice(i, i + 11);
          const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
          const block = exports.base58.decode(slice);
          for (let j = 0; j < block.length - blockLen; j++) {
            if (block[j] !== 0)
              throw new Error("base58xmr: wrong padding");
          }
          res = res.concat(Array.from(block.slice(block.length - blockLen)));
        }
        return Uint8Array.from(res);
      }
    };
    var createBase58check2 = (sha2562) => /* @__PURE__ */ chain2(/* @__PURE__ */ checksum2(4, (data) => sha2562(sha2562(data))), exports.base58);
    exports.createBase58check = createBase58check2;
    exports.base58check = exports.createBase58check;
    var BECH_ALPHABET = /* @__PURE__ */ chain2(/* @__PURE__ */ alphabet2("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ join2(""));
    var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
    // @__NO_SIDE_EFFECTS__
    function bech32Polymod(pre) {
      const b = pre >> 25;
      let chk = (pre & 33554431) << 5;
      for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
        if ((b >> i & 1) === 1)
          chk ^= POLYMOD_GENERATORS[i];
      }
      return chk;
    }
    // @__NO_SIDE_EFFECTS__
    function bechChecksum(prefix, words, encodingConst = 1) {
      const len = prefix.length;
      let chk = 1;
      for (let i = 0; i < len; i++) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126)
          throw new Error(`Invalid prefix (${prefix})`);
        chk = /* @__PURE__ */ bech32Polymod(chk) ^ c >> 5;
      }
      chk = /* @__PURE__ */ bech32Polymod(chk);
      for (let i = 0; i < len; i++)
        chk = /* @__PURE__ */ bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
      for (let v of words)
        chk = /* @__PURE__ */ bech32Polymod(chk) ^ v;
      for (let i = 0; i < 6; i++)
        chk = /* @__PURE__ */ bech32Polymod(chk);
      chk ^= encodingConst;
      return BECH_ALPHABET.encode(/* @__PURE__ */ convertRadix22([chk % 2 ** 30], 30, 5, false));
    }
    // @__NO_SIDE_EFFECTS__
    function genBech32(encoding) {
      const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
      const _words = /* @__PURE__ */ radix22(5);
      const fromWords = _words.decode;
      const toWords = _words.encode;
      const fromWordsUnsafe = /* @__PURE__ */ unsafeWrapper(fromWords);
      function encode(prefix, words, limit = 90) {
        if (typeof prefix !== "string")
          throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
        if (words instanceof Uint8Array)
          words = Array.from(words);
        if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
          throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
        if (prefix.length === 0)
          throw new TypeError(`Invalid prefix length ${prefix.length}`);
        const actualLength = prefix.length + 7 + words.length;
        if (limit !== false && actualLength > limit)
          throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
        const lowered = prefix.toLowerCase();
        const sum = /* @__PURE__ */ bechChecksum(lowered, words, ENCODING_CONST);
        return `${lowered}1${BECH_ALPHABET.encode(words)}${sum}`;
      }
      function decode(str, limit = 90) {
        if (typeof str !== "string")
          throw new Error(`bech32.decode input should be string, not ${typeof str}`);
        if (str.length < 8 || limit !== false && str.length > limit)
          throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
        const lowered = str.toLowerCase();
        if (str !== lowered && str !== str.toUpperCase())
          throw new Error(`String must be lowercase or uppercase`);
        const sepIndex = lowered.lastIndexOf("1");
        if (sepIndex === 0 || sepIndex === -1)
          throw new Error(`Letter "1" must be present between prefix and data only`);
        const prefix = lowered.slice(0, sepIndex);
        const data = lowered.slice(sepIndex + 1);
        if (data.length < 6)
          throw new Error("Data must be at least 6 characters long");
        const words = BECH_ALPHABET.decode(data).slice(0, -6);
        const sum = /* @__PURE__ */ bechChecksum(prefix, words, ENCODING_CONST);
        if (!data.endsWith(sum))
          throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
        return { prefix, words };
      }
      const decodeUnsafe = /* @__PURE__ */ unsafeWrapper(decode);
      function decodeToBytes(str) {
        const { prefix, words } = decode(str, false);
        return { prefix, words, bytes: fromWords(words) };
      }
      function encodeFromBytes(prefix, bytes2) {
        return encode(prefix, toWords(bytes2));
      }
      return {
        encode,
        decode,
        encodeFromBytes,
        decodeToBytes,
        decodeUnsafe,
        fromWords,
        fromWordsUnsafe,
        toWords
      };
    }
    exports.bech32 = /* @__PURE__ */ genBech32("bech32");
    exports.bech32m = /* @__PURE__ */ genBech32("bech32m");
    exports.utf8 = {
      encode: (data) => new TextDecoder().decode(data),
      decode: (str) => new TextEncoder().encode(str)
    };
    exports.hex = /* @__PURE__ */ chain2(/* @__PURE__ */ radix22(4), /* @__PURE__ */ alphabet2("0123456789abcdef"), /* @__PURE__ */ join2(""), /* @__PURE__ */ normalize((s) => {
      if (typeof s !== "string" || s.length % 2)
        throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
      return s.toLowerCase();
    }));
    var CODERS = {
      utf8: exports.utf8,
      hex: exports.hex,
      base16: exports.base16,
      base32: exports.base32,
      base64: exports.base64,
      base64url: exports.base64url,
      base58: exports.base58,
      base58xmr: exports.base58xmr
    };
    var coderTypeError = "Invalid encoding type. Available types: utf8, hex, base16, base32, base64, base64url, base58, base58xmr";
    var bytesToString = (type, bytes2) => {
      if (typeof type !== "string" || !CODERS.hasOwnProperty(type))
        throw new TypeError(coderTypeError);
      if (!isBytes3(bytes2))
        throw new TypeError("bytesToString() expects Uint8Array");
      return CODERS[type].encode(bytes2);
    };
    exports.bytesToString = bytesToString;
    exports.str = exports.bytesToString;
    var stringToBytes = (type, str) => {
      if (!CODERS.hasOwnProperty(type))
        throw new TypeError(coderTypeError);
      if (typeof str !== "string")
        throw new TypeError("stringToBytes() expects string");
      return CODERS[type].decode(str);
    };
    exports.stringToBytes = stringToBytes;
    exports.bytes = exports.stringToBytes;
  }
});

// node_modules/@scure/bip39/index.js
var require_bip39 = __commonJS({
  "node_modules/@scure/bip39/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mnemonicToSeedSync = exports.mnemonicToSeed = exports.validateMnemonic = exports.entropyToMnemonic = exports.mnemonicToEntropy = exports.generateMnemonic = void 0;
    var _assert_1 = require_assert();
    var pbkdf2_1 = require_pbkdf2();
    var sha256_1 = require_sha256();
    var sha512_1 = require_sha512();
    var utils_1 = require_utils();
    var base_1 = require_lib();
    var isJapanese = (wordlist3) => wordlist3[0] === "\u3042\u3044\u3053\u304F\u3057\u3093";
    function nfkd(str) {
      if (typeof str !== "string")
        throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
      return str.normalize("NFKD");
    }
    function normalize(str) {
      const norm = nfkd(str);
      const words = norm.split(" ");
      if (![12, 15, 18, 21, 24].includes(words.length))
        throw new Error("Invalid mnemonic");
      return { nfkd: norm, words };
    }
    function assertEntropy(entropy) {
      _assert_1.default.bytes(entropy, 16, 20, 24, 28, 32);
    }
    function generateMnemonic2(wordlist3, strength = 128) {
      _assert_1.default.number(strength);
      if (strength % 32 !== 0 || strength > 256)
        throw new TypeError("Invalid entropy");
      return entropyToMnemonic2((0, utils_1.randomBytes)(strength / 8), wordlist3);
    }
    exports.generateMnemonic = generateMnemonic2;
    var calcChecksum = (entropy) => {
      const bitsLeft = 8 - entropy.length / 4;
      return new Uint8Array([(0, sha256_1.sha256)(entropy)[0] >> bitsLeft << bitsLeft]);
    };
    function getCoder(wordlist3) {
      if (!Array.isArray(wordlist3) || wordlist3.length !== 2 ** 11 || typeof wordlist3[0] !== "string")
        throw new Error("Worlist: expected array of 2048 strings");
      wordlist3.forEach((i) => {
        if (typeof i !== "string")
          throw new Error(`Wordlist: non-string element: ${i}`);
      });
      return base_1.utils.chain(base_1.utils.checksum(1, calcChecksum), base_1.utils.radix2(11, true), base_1.utils.alphabet(wordlist3));
    }
    function mnemonicToEntropy2(mnemonic, wordlist3) {
      const { words } = normalize(mnemonic);
      const entropy = getCoder(wordlist3).decode(words);
      assertEntropy(entropy);
      return entropy;
    }
    exports.mnemonicToEntropy = mnemonicToEntropy2;
    function entropyToMnemonic2(entropy, wordlist3) {
      assertEntropy(entropy);
      const words = getCoder(wordlist3).encode(entropy);
      return words.join(isJapanese(wordlist3) ? "\u3000" : " ");
    }
    exports.entropyToMnemonic = entropyToMnemonic2;
    function validateMnemonic2(mnemonic, wordlist3) {
      try {
        mnemonicToEntropy2(mnemonic, wordlist3);
      } catch (e) {
        return false;
      }
      return true;
    }
    exports.validateMnemonic = validateMnemonic2;
    var salt = (passphrase) => nfkd(`mnemonic${passphrase}`);
    function mnemonicToSeed2(mnemonic, passphrase = "") {
      return (0, pbkdf2_1.pbkdf2Async)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });
    }
    exports.mnemonicToSeed = mnemonicToSeed2;
    function mnemonicToSeedSync(mnemonic, passphrase = "") {
      return (0, pbkdf2_1.pbkdf2)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });
    }
    exports.mnemonicToSeedSync = mnemonicToSeedSync;
  }
});

// node_modules/@scure/bip39/wordlists/english.js
var require_english = __commonJS({
  "node_modules/@scure/bip39/wordlists/english.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wordlist = void 0;
    exports.wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n");
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray2;
    exports.fromByteArray = fromByteArray3;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray2(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output2 = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output2.push(tripletToBase64(tmp));
      }
      return output2.join("");
    }
    function fromByteArray3(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/@stacks/encryption/node_modules/base-x/src/index.js
var require_src = __commonJS({
  "node_modules/@stacks/encryption/node_modules/base-x/src/index.js"(exports, module) {
    "use strict";
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode(source) {
        if (source instanceof Uint8Array) {
        } else if (ArrayBuffer.isView(source)) {
          source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
          source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
          throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return new Uint8Array();
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (source[psz]) {
          var charCode = source.charCodeAt(psz);
          if (charCode > 255) {
            return;
          }
          var carry = BASE_MAP[charCode];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode,
        decodeUnsafe,
        decode
      };
    }
    module.exports = base;
  }
});

// node_modules/@stacks/encryption/node_modules/bs58/index.js
var require_bs58 = __commonJS({
  "node_modules/@stacks/encryption/node_modules/bs58/index.js"(exports, module) {
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module.exports = basex(ALPHABET);
  }
});

// node_modules/jsontokens/lib/base64Url.js
var require_base64Url = __commonJS({
  "node_modules/jsontokens/lib/base64Url.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decode = exports.encode = exports.unescape = exports.escape = exports.pad = void 0;
    var base64_js_1 = require_base64_js();
    function pad(base64) {
      return `${base64}${"=".repeat(4 - (base64.length % 4 || 4))}`;
    }
    exports.pad = pad;
    function escape(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    exports.escape = escape;
    function unescape(base64Url) {
      return pad(base64Url).replace(/-/g, "+").replace(/_/g, "/");
    }
    exports.unescape = unescape;
    function encode(base64) {
      return escape((0, base64_js_1.fromByteArray)(new TextEncoder().encode(base64)));
    }
    exports.encode = encode;
    function decode(base64Url) {
      return new TextDecoder().decode((0, base64_js_1.toByteArray)(pad(unescape(base64Url))));
    }
    exports.decode = decode;
  }
});

// node_modules/jsontokens/node_modules/@noble/secp256k1/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/jsontokens/node_modules/@noble/secp256k1/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utils = exports.schnorr = exports.verify = exports.signSync = exports.sign = exports.getSharedSecret = exports.recoverPublicKey = exports.getPublicKey = exports.hexToBytes = exports.bytesToHex = exports.Signature = exports.Point = exports.CURVE = void 0;
    var nodeCrypto4 = require_crypto();
    var _0n4 = BigInt(0);
    var _1n4 = BigInt(1);
    var _2n4 = BigInt(2);
    var _3n4 = BigInt(3);
    var _8n4 = BigInt(8);
    var CURVE4 = Object.freeze({
      a: _0n4,
      b: BigInt(7),
      P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
      n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
      h: _1n4,
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee")
    });
    exports.CURVE = CURVE4;
    var divNearest4 = (a, b) => (a + b / _2n4) / b;
    var endo4 = {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      splitScalar(k) {
        const { n } = CURVE4;
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
        const b1 = -_1n4 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
        const b2 = a1;
        const POW_2_128 = BigInt("0x100000000000000000000000000000000");
        const c1 = divNearest4(b2 * k, n);
        const c2 = divNearest4(-b1 * k, n);
        let k1 = mod4(k - c1 * a1 - c2 * a2, n);
        let k2 = mod4(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg)
          k1 = n - k1;
        if (k2neg)
          k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalarEndo: Endomorphism failed, k=" + k);
        }
        return { k1neg, k1, k2neg, k2 };
      }
    };
    var fieldLen4 = 32;
    var groupLen4 = 32;
    var hashLen3 = 32;
    var compressedLen4 = fieldLen4 + 1;
    var uncompressedLen4 = 2 * fieldLen4 + 1;
    function weierstrass4(x) {
      const { a, b } = CURVE4;
      const x2 = mod4(x * x);
      const x3 = mod4(x2 * x);
      return mod4(x3 + a * x + b);
    }
    var USE_ENDOMORPHISM4 = CURVE4.a === _0n4;
    var ShaError4 = class extends Error {
      constructor(message) {
        super(message);
      }
    };
    function assertJacPoint4(other) {
      if (!(other instanceof JacobianPoint4))
        throw new TypeError("JacobianPoint expected");
    }
    var JacobianPoint4 = class _JacobianPoint {
      constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
      static fromAffine(p) {
        if (!(p instanceof Point4)) {
          throw new TypeError("JacobianPoint#fromAffine: expected Point");
        }
        if (p.equals(Point4.ZERO))
          return _JacobianPoint.ZERO;
        return new _JacobianPoint(p.x, p.y, _1n4);
      }
      static toAffineBatch(points) {
        const toInv = invertBatch4(points.map((p) => p.z));
        return points.map((p, i) => p.toAffine(toInv[i]));
      }
      static normalizeZ(points) {
        return _JacobianPoint.toAffineBatch(points).map(_JacobianPoint.fromAffine);
      }
      equals(other) {
        assertJacPoint4(other);
        const { x: X1, y: Y1, z: Z1 } = this;
        const { x: X2, y: Y2, z: Z2 } = other;
        const Z1Z1 = mod4(Z1 * Z1);
        const Z2Z2 = mod4(Z2 * Z2);
        const U1 = mod4(X1 * Z2Z2);
        const U2 = mod4(X2 * Z1Z1);
        const S1 = mod4(mod4(Y1 * Z2) * Z2Z2);
        const S2 = mod4(mod4(Y2 * Z1) * Z1Z1);
        return U1 === U2 && S1 === S2;
      }
      negate() {
        return new _JacobianPoint(this.x, mod4(-this.y), this.z);
      }
      double() {
        const { x: X1, y: Y1, z: Z1 } = this;
        const A = mod4(X1 * X1);
        const B = mod4(Y1 * Y1);
        const C = mod4(B * B);
        const x1b = X1 + B;
        const D = mod4(_2n4 * (mod4(x1b * x1b) - A - C));
        const E = mod4(_3n4 * A);
        const F = mod4(E * E);
        const X3 = mod4(F - _2n4 * D);
        const Y3 = mod4(E * (D - X3) - _8n4 * C);
        const Z3 = mod4(_2n4 * Y1 * Z1);
        return new _JacobianPoint(X3, Y3, Z3);
      }
      add(other) {
        assertJacPoint4(other);
        const { x: X1, y: Y1, z: Z1 } = this;
        const { x: X2, y: Y2, z: Z2 } = other;
        if (X2 === _0n4 || Y2 === _0n4)
          return this;
        if (X1 === _0n4 || Y1 === _0n4)
          return other;
        const Z1Z1 = mod4(Z1 * Z1);
        const Z2Z2 = mod4(Z2 * Z2);
        const U1 = mod4(X1 * Z2Z2);
        const U2 = mod4(X2 * Z1Z1);
        const S1 = mod4(mod4(Y1 * Z2) * Z2Z2);
        const S2 = mod4(mod4(Y2 * Z1) * Z1Z1);
        const H = mod4(U2 - U1);
        const r = mod4(S2 - S1);
        if (H === _0n4) {
          if (r === _0n4) {
            return this.double();
          } else {
            return _JacobianPoint.ZERO;
          }
        }
        const HH = mod4(H * H);
        const HHH = mod4(H * HH);
        const V = mod4(U1 * HH);
        const X3 = mod4(r * r - HHH - _2n4 * V);
        const Y3 = mod4(r * (V - X3) - S1 * HHH);
        const Z3 = mod4(Z1 * Z2 * H);
        return new _JacobianPoint(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      multiplyUnsafe(scalar) {
        const P0 = _JacobianPoint.ZERO;
        if (typeof scalar === "bigint" && scalar === _0n4)
          return P0;
        let n = normalizeScalar4(scalar);
        if (n === _1n4)
          return this;
        if (!USE_ENDOMORPHISM4) {
          let p = P0;
          let d2 = this;
          while (n > _0n4) {
            if (n & _1n4)
              p = p.add(d2);
            d2 = d2.double();
            n >>= _1n4;
          }
          return p;
        }
        let { k1neg, k1, k2neg, k2 } = endo4.splitScalar(n);
        let k1p = P0;
        let k2p = P0;
        let d = this;
        while (k1 > _0n4 || k2 > _0n4) {
          if (k1 & _1n4)
            k1p = k1p.add(d);
          if (k2 & _1n4)
            k2p = k2p.add(d);
          d = d.double();
          k1 >>= _1n4;
          k2 >>= _1n4;
        }
        if (k1neg)
          k1p = k1p.negate();
        if (k2neg)
          k2p = k2p.negate();
        k2p = new _JacobianPoint(mod4(k2p.x * endo4.beta), k2p.y, k2p.z);
        return k1p.add(k2p);
      }
      precomputeWindow(W) {
        const windows = USE_ENDOMORPHISM4 ? 128 / W + 1 : 256 / W + 1;
        const points = [];
        let p = this;
        let base = p;
        for (let window2 = 0; window2 < windows; window2++) {
          base = p;
          points.push(base);
          for (let i = 1; i < 2 ** (W - 1); i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      }
      wNAF(n, affinePoint) {
        if (!affinePoint && this.equals(_JacobianPoint.BASE))
          affinePoint = Point4.BASE;
        const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
        if (256 % W) {
          throw new Error("Point#wNAF: Invalid precomputation window, must be power of 2");
        }
        let precomputes = affinePoint && pointPrecomputes4.get(affinePoint);
        if (!precomputes) {
          precomputes = this.precomputeWindow(W);
          if (affinePoint && W !== 1) {
            precomputes = _JacobianPoint.normalizeZ(precomputes);
            pointPrecomputes4.set(affinePoint, precomputes);
          }
        }
        let p = _JacobianPoint.ZERO;
        let f2 = _JacobianPoint.BASE;
        const windows = 1 + (USE_ENDOMORPHISM4 ? 128 / W : 256 / W);
        const windowSize = 2 ** (W - 1);
        const mask = BigInt(2 ** W - 1);
        const maxNumber = 2 ** W;
        const shiftBy = BigInt(W);
        for (let window2 = 0; window2 < windows; window2++) {
          const offset = window2 * windowSize;
          let wbits = Number(n & mask);
          n >>= shiftBy;
          if (wbits > windowSize) {
            wbits -= maxNumber;
            n += _1n4;
          }
          const offset1 = offset;
          const offset2 = offset + Math.abs(wbits) - 1;
          const cond1 = window2 % 2 !== 0;
          const cond2 = wbits < 0;
          if (wbits === 0) {
            f2 = f2.add(constTimeNegate4(cond1, precomputes[offset1]));
          } else {
            p = p.add(constTimeNegate4(cond2, precomputes[offset2]));
          }
        }
        return { p, f: f2 };
      }
      multiply(scalar, affinePoint) {
        let n = normalizeScalar4(scalar);
        let point;
        let fake;
        if (USE_ENDOMORPHISM4) {
          const { k1neg, k1, k2neg, k2 } = endo4.splitScalar(n);
          let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
          let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
          k1p = constTimeNegate4(k1neg, k1p);
          k2p = constTimeNegate4(k2neg, k2p);
          k2p = new _JacobianPoint(mod4(k2p.x * endo4.beta), k2p.y, k2p.z);
          point = k1p.add(k2p);
          fake = f1p.add(f2p);
        } else {
          const { p, f: f2 } = this.wNAF(n, affinePoint);
          point = p;
          fake = f2;
        }
        return _JacobianPoint.normalizeZ([point, fake])[0];
      }
      toAffine(invZ) {
        const { x, y, z } = this;
        const is0 = this.equals(_JacobianPoint.ZERO);
        if (invZ == null)
          invZ = is0 ? _8n4 : invert4(z);
        const iz1 = invZ;
        const iz2 = mod4(iz1 * iz1);
        const iz3 = mod4(iz2 * iz1);
        const ax = mod4(x * iz2);
        const ay = mod4(y * iz3);
        const zz = mod4(z * iz1);
        if (is0)
          return Point4.ZERO;
        if (zz !== _1n4)
          throw new Error("invZ was invalid");
        return new Point4(ax, ay);
      }
    };
    JacobianPoint4.BASE = new JacobianPoint4(CURVE4.Gx, CURVE4.Gy, _1n4);
    JacobianPoint4.ZERO = new JacobianPoint4(_0n4, _1n4, _0n4);
    function constTimeNegate4(condition, item) {
      const neg = item.negate();
      return condition ? neg : item;
    }
    var pointPrecomputes4 = /* @__PURE__ */ new WeakMap();
    var Point4 = class _Point {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
      _setWindowSize(windowSize) {
        this._WINDOW_SIZE = windowSize;
        pointPrecomputes4.delete(this);
      }
      hasEvenY() {
        return this.y % _2n4 === _0n4;
      }
      static fromCompressedHex(bytes2) {
        const isShort = bytes2.length === 32;
        const x = bytesToNumber5(isShort ? bytes2 : bytes2.subarray(1));
        if (!isValidFieldElement4(x))
          throw new Error("Point is not on curve");
        const y2 = weierstrass4(x);
        let y = sqrtMod4(y2);
        const isYOdd = (y & _1n4) === _1n4;
        if (isShort) {
          if (isYOdd)
            y = mod4(-y);
        } else {
          const isFirstByteOdd = (bytes2[0] & 1) === 1;
          if (isFirstByteOdd !== isYOdd)
            y = mod4(-y);
        }
        const point = new _Point(x, y);
        point.assertValidity();
        return point;
      }
      static fromUncompressedHex(bytes2) {
        const x = bytesToNumber5(bytes2.subarray(1, fieldLen4 + 1));
        const y = bytesToNumber5(bytes2.subarray(fieldLen4 + 1, fieldLen4 * 2 + 1));
        const point = new _Point(x, y);
        point.assertValidity();
        return point;
      }
      static fromHex(hex) {
        const bytes2 = ensureBytes4(hex);
        const len = bytes2.length;
        const header = bytes2[0];
        if (len === fieldLen4)
          return this.fromCompressedHex(bytes2);
        if (len === compressedLen4 && (header === 2 || header === 3)) {
          return this.fromCompressedHex(bytes2);
        }
        if (len === uncompressedLen4 && header === 4)
          return this.fromUncompressedHex(bytes2);
        throw new Error(`Point.fromHex: received invalid point. Expected 32-${compressedLen4} compressed bytes or ${uncompressedLen4} uncompressed bytes, not ${len}`);
      }
      static fromPrivateKey(privateKey) {
        return _Point.BASE.multiply(normalizePrivateKey4(privateKey));
      }
      static fromSignature(msgHash, signature, recovery) {
        const { r, s } = normalizeSignature4(signature);
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("Cannot recover: invalid recovery bit");
        const h = truncateHash4(ensureBytes4(msgHash));
        const { n } = CURVE4;
        const radj = recovery === 2 || recovery === 3 ? r + n : r;
        const rinv = invert4(radj, n);
        const u1 = mod4(-h * rinv, n);
        const u2 = mod4(s * rinv, n);
        const prefix = recovery & 1 ? "03" : "02";
        const R = _Point.fromHex(prefix + numTo32bStr4(radj));
        const Q = _Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
        if (!Q)
          throw new Error("Cannot recover signature: point at infinify");
        Q.assertValidity();
        return Q;
      }
      toRawBytes(isCompressed = false) {
        return hexToBytes6(this.toHex(isCompressed));
      }
      toHex(isCompressed = false) {
        const x = numTo32bStr4(this.x);
        if (isCompressed) {
          const prefix = this.hasEvenY() ? "02" : "03";
          return `${prefix}${x}`;
        } else {
          return `04${x}${numTo32bStr4(this.y)}`;
        }
      }
      toHexX() {
        return this.toHex(true).slice(2);
      }
      toRawX() {
        return this.toRawBytes(true).slice(1);
      }
      assertValidity() {
        const msg = "Point is not on elliptic curve";
        const { x, y } = this;
        if (!isValidFieldElement4(x) || !isValidFieldElement4(y))
          throw new Error(msg);
        const left = mod4(y * y);
        const right = weierstrass4(x);
        if (mod4(left - right) !== _0n4)
          throw new Error(msg);
      }
      equals(other) {
        return this.x === other.x && this.y === other.y;
      }
      negate() {
        return new _Point(this.x, mod4(-this.y));
      }
      double() {
        return JacobianPoint4.fromAffine(this).double().toAffine();
      }
      add(other) {
        return JacobianPoint4.fromAffine(this).add(JacobianPoint4.fromAffine(other)).toAffine();
      }
      subtract(other) {
        return this.add(other.negate());
      }
      multiply(scalar) {
        return JacobianPoint4.fromAffine(this).multiply(scalar, this).toAffine();
      }
      multiplyAndAddUnsafe(Q, a, b) {
        const P = JacobianPoint4.fromAffine(this);
        const aP = a === _0n4 || a === _1n4 || this !== _Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
        const bQ = JacobianPoint4.fromAffine(Q).multiplyUnsafe(b);
        const sum = aP.add(bQ);
        return sum.equals(JacobianPoint4.ZERO) ? void 0 : sum.toAffine();
      }
    };
    exports.Point = Point4;
    Point4.BASE = new Point4(CURVE4.Gx, CURVE4.Gy);
    Point4.ZERO = new Point4(_0n4, _0n4);
    function sliceDER4(s) {
      return Number.parseInt(s[0], 16) >= 8 ? "00" + s : s;
    }
    function parseDERInt4(data) {
      if (data.length < 2 || data[0] !== 2) {
        throw new Error(`Invalid signature integer tag: ${bytesToHex6(data)}`);
      }
      const len = data[1];
      const res = data.subarray(2, len + 2);
      if (!len || res.length !== len) {
        throw new Error(`Invalid signature integer: wrong length`);
      }
      if (res[0] === 0 && res[1] <= 127) {
        throw new Error("Invalid signature integer: trailing length");
      }
      return { data: bytesToNumber5(res), left: data.subarray(len + 2) };
    }
    function parseDERSignature4(data) {
      if (data.length < 2 || data[0] != 48) {
        throw new Error(`Invalid signature tag: ${bytesToHex6(data)}`);
      }
      if (data[1] !== data.length - 2) {
        throw new Error("Invalid signature: incorrect length");
      }
      const { data: r, left: sBytes } = parseDERInt4(data.subarray(2));
      const { data: s, left: rBytesLeft } = parseDERInt4(sBytes);
      if (rBytesLeft.length) {
        throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex6(rBytesLeft)}`);
      }
      return { r, s };
    }
    var Signature4 = class _Signature {
      constructor(r, s) {
        this.r = r;
        this.s = s;
        this.assertValidity();
      }
      static fromCompact(hex) {
        const arr = isBytes3(hex);
        const name = "Signature.fromCompact";
        if (typeof hex !== "string" && !arr)
          throw new TypeError(`${name}: Expected string or Uint8Array`);
        const str = arr ? bytesToHex6(hex) : hex;
        if (str.length !== 128)
          throw new Error(`${name}: Expected 64-byte hex`);
        return new _Signature(hexToNumber4(str.slice(0, 64)), hexToNumber4(str.slice(64, 128)));
      }
      static fromDER(hex) {
        const arr = isBytes3(hex);
        if (typeof hex !== "string" && !arr)
          throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
        const { r, s } = parseDERSignature4(arr ? hex : hexToBytes6(hex));
        return new _Signature(r, s);
      }
      static fromHex(hex) {
        return this.fromDER(hex);
      }
      assertValidity() {
        const { r, s } = this;
        if (!isWithinCurveOrder4(r))
          throw new Error("Invalid Signature: r must be 0 < r < n");
        if (!isWithinCurveOrder4(s))
          throw new Error("Invalid Signature: s must be 0 < s < n");
      }
      hasHighS() {
        const HALF = CURVE4.n >> _1n4;
        return this.s > HALF;
      }
      normalizeS() {
        return this.hasHighS() ? new _Signature(this.r, mod4(-this.s, CURVE4.n)) : this;
      }
      toDERRawBytes() {
        return hexToBytes6(this.toDERHex());
      }
      toDERHex() {
        const sHex = sliceDER4(numberToHexUnpadded4(this.s));
        const rHex = sliceDER4(numberToHexUnpadded4(this.r));
        const sHexL = sHex.length / 2;
        const rHexL = rHex.length / 2;
        const sLen = numberToHexUnpadded4(sHexL);
        const rLen = numberToHexUnpadded4(rHexL);
        const length = numberToHexUnpadded4(rHexL + sHexL + 4);
        return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
      }
      toRawBytes() {
        return this.toDERRawBytes();
      }
      toHex() {
        return this.toDERHex();
      }
      toCompactRawBytes() {
        return hexToBytes6(this.toCompactHex());
      }
      toCompactHex() {
        return numTo32bStr4(this.r) + numTo32bStr4(this.s);
      }
    };
    exports.Signature = Signature4;
    function isBytes3(a) {
      return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
    }
    function abytes2(item) {
      if (!isBytes3(item))
        throw new Error("Uint8Array expected");
    }
    function concatBytes6(...arrays) {
      arrays.every(abytes2);
      if (arrays.length === 1)
        return arrays[0];
      const length = arrays.reduce((a, arr) => a + arr.length, 0);
      const result = new Uint8Array(length);
      for (let i = 0, pad = 0; i < arrays.length; i++) {
        const arr = arrays[i];
        result.set(arr, pad);
        pad += arr.length;
      }
      return result;
    }
    var hexes6 = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    function bytesToHex6(bytes2) {
      abytes2(bytes2);
      let hex = "";
      for (let i = 0; i < bytes2.length; i++) {
        hex += hexes6[bytes2[i]];
      }
      return hex;
    }
    exports.bytesToHex = bytesToHex6;
    var asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    function asciiToBase162(ch) {
      if (ch >= asciis2._0 && ch <= asciis2._9)
        return ch - asciis2._0;
      if (ch >= asciis2.A && ch <= asciis2.F)
        return ch - (asciis2.A - 10);
      if (ch >= asciis2.a && ch <= asciis2.f)
        return ch - (asciis2.a - 10);
      return;
    }
    function hexToBytes6(hex) {
      if (typeof hex !== "string")
        throw new Error("hex string expected, got " + typeof hex);
      const hl = hex.length;
      const al = hl / 2;
      if (hl % 2)
        throw new Error("hex string expected, got unpadded hex of length " + hl);
      const array = new Uint8Array(al);
      for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase162(hex.charCodeAt(hi));
        const n2 = asciiToBase162(hex.charCodeAt(hi + 1));
        if (n1 === void 0 || n2 === void 0) {
          const char = hex[hi] + hex[hi + 1];
          throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2;
      }
      return array;
    }
    exports.hexToBytes = hexToBytes6;
    var POW_2_2564 = BigInt("0x10000000000000000000000000000000000000000000000000000000000000000");
    function numTo32bStr4(num) {
      if (typeof num !== "bigint")
        throw new Error("Expected bigint");
      if (!(_0n4 <= num && num < POW_2_2564))
        throw new Error("Expected number 0 <= n < 2^256");
      return num.toString(16).padStart(64, "0");
    }
    function numTo32b4(num) {
      const b = hexToBytes6(numTo32bStr4(num));
      if (b.length !== 32)
        throw new Error("Error: expected 32 bytes");
      return b;
    }
    function numberToHexUnpadded4(num) {
      const hex = num.toString(16);
      return hex.length & 1 ? `0${hex}` : hex;
    }
    function hexToNumber4(hex) {
      if (typeof hex !== "string") {
        throw new TypeError("hexToNumber: expected string, got " + typeof hex);
      }
      return BigInt(`0x${hex}`);
    }
    function bytesToNumber5(bytes2) {
      return hexToNumber4(bytesToHex6(bytes2));
    }
    function ensureBytes4(hex) {
      return isBytes3(hex) ? Uint8Array.from(hex) : hexToBytes6(hex);
    }
    function normalizeScalar4(num) {
      if (typeof num === "number" && Number.isSafeInteger(num) && num > 0)
        return BigInt(num);
      if (typeof num === "bigint" && isWithinCurveOrder4(num))
        return num;
      throw new TypeError("Expected valid private scalar: 0 < scalar < curve.n");
    }
    function mod4(a, b = CURVE4.P) {
      const result = a % b;
      return result >= _0n4 ? result : b + result;
    }
    function pow24(x, power) {
      const { P } = CURVE4;
      let res = x;
      while (power-- > _0n4) {
        res *= res;
        res %= P;
      }
      return res;
    }
    function sqrtMod4(x) {
      const { P } = CURVE4;
      const _6n = BigInt(6);
      const _11n = BigInt(11);
      const _22n = BigInt(22);
      const _23n = BigInt(23);
      const _44n = BigInt(44);
      const _88n = BigInt(88);
      const b2 = x * x * x % P;
      const b3 = b2 * b2 * x % P;
      const b6 = pow24(b3, _3n4) * b3 % P;
      const b9 = pow24(b6, _3n4) * b3 % P;
      const b11 = pow24(b9, _2n4) * b2 % P;
      const b22 = pow24(b11, _11n) * b11 % P;
      const b44 = pow24(b22, _22n) * b22 % P;
      const b88 = pow24(b44, _44n) * b44 % P;
      const b176 = pow24(b88, _88n) * b88 % P;
      const b220 = pow24(b176, _44n) * b44 % P;
      const b223 = pow24(b220, _3n4) * b3 % P;
      const t1 = pow24(b223, _23n) * b22 % P;
      const t2 = pow24(t1, _6n) * b2 % P;
      const rt = pow24(t2, _2n4);
      const xc = rt * rt % P;
      if (xc !== x)
        throw new Error("Cannot find square root");
      return rt;
    }
    function invert4(number2, modulo = CURVE4.P) {
      if (number2 === _0n4 || modulo <= _0n4) {
        throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
      }
      let a = mod4(number2, modulo);
      let b = modulo;
      let x = _0n4, y = _1n4, u = _1n4, v = _0n4;
      while (a !== _0n4) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        b = a, a = r, x = u, y = v, u = m, v = n;
      }
      const gcd = b;
      if (gcd !== _1n4)
        throw new Error("invert: does not exist");
      return mod4(x, modulo);
    }
    function invertBatch4(nums, p = CURVE4.P) {
      const scratch = new Array(nums.length);
      const lastMultiplied = nums.reduce((acc, num, i) => {
        if (num === _0n4)
          return acc;
        scratch[i] = acc;
        return mod4(acc * num, p);
      }, _1n4);
      const inverted = invert4(lastMultiplied, p);
      nums.reduceRight((acc, num, i) => {
        if (num === _0n4)
          return acc;
        scratch[i] = mod4(acc * scratch[i], p);
        return mod4(acc * num, p);
      }, inverted);
      return scratch;
    }
    function bits2int_24(bytes2) {
      const delta = bytes2.length * 8 - groupLen4 * 8;
      const num = bytesToNumber5(bytes2);
      return delta > 0 ? num >> BigInt(delta) : num;
    }
    function truncateHash4(hash2, truncateOnly = false) {
      const h = bits2int_24(hash2);
      if (truncateOnly)
        return h;
      const { n } = CURVE4;
      return h >= n ? h - n : h;
    }
    var _sha256Sync4;
    var _hmacSha256Sync4;
    var HmacDrbg3 = class {
      constructor(hashLen4, qByteLen) {
        this.hashLen = hashLen4;
        this.qByteLen = qByteLen;
        if (typeof hashLen4 !== "number" || hashLen4 < 2)
          throw new Error("hashLen must be a number");
        if (typeof qByteLen !== "number" || qByteLen < 2)
          throw new Error("qByteLen must be a number");
        this.v = new Uint8Array(hashLen4).fill(1);
        this.k = new Uint8Array(hashLen4).fill(0);
        this.counter = 0;
      }
      hmac(...values) {
        return exports.utils.hmacSha256(this.k, ...values);
      }
      hmacSync(...values) {
        return _hmacSha256Sync4(this.k, ...values);
      }
      checkSync() {
        if (typeof _hmacSha256Sync4 !== "function")
          throw new ShaError4("hmacSha256Sync needs to be set");
      }
      incr() {
        if (this.counter >= 1e3)
          throw new Error("Tried 1,000 k values for sign(), all were invalid");
        this.counter += 1;
      }
      async reseed(seed = new Uint8Array()) {
        this.k = await this.hmac(this.v, Uint8Array.from([0]), seed);
        this.v = await this.hmac(this.v);
        if (seed.length === 0)
          return;
        this.k = await this.hmac(this.v, Uint8Array.from([1]), seed);
        this.v = await this.hmac(this.v);
      }
      reseedSync(seed = new Uint8Array()) {
        this.checkSync();
        this.k = this.hmacSync(this.v, Uint8Array.from([0]), seed);
        this.v = this.hmacSync(this.v);
        if (seed.length === 0)
          return;
        this.k = this.hmacSync(this.v, Uint8Array.from([1]), seed);
        this.v = this.hmacSync(this.v);
      }
      async generate() {
        this.incr();
        let len = 0;
        const out = [];
        while (len < this.qByteLen) {
          this.v = await this.hmac(this.v);
          const sl = this.v.slice();
          out.push(sl);
          len += this.v.length;
        }
        return concatBytes6(...out);
      }
      generateSync() {
        this.checkSync();
        this.incr();
        let len = 0;
        const out = [];
        while (len < this.qByteLen) {
          this.v = this.hmacSync(this.v);
          const sl = this.v.slice();
          out.push(sl);
          len += this.v.length;
        }
        return concatBytes6(...out);
      }
    };
    function isWithinCurveOrder4(num) {
      return _0n4 < num && num < CURVE4.n;
    }
    function isValidFieldElement4(num) {
      return _0n4 < num && num < CURVE4.P;
    }
    function kmdToSig3(kBytes, m, d, lowS = true) {
      const { n } = CURVE4;
      const k = truncateHash4(kBytes, true);
      if (!isWithinCurveOrder4(k))
        return;
      const kinv = invert4(k, n);
      const q = Point4.BASE.multiply(k);
      const r = mod4(q.x, n);
      if (r === _0n4)
        return;
      const s = mod4(kinv * mod4(m + d * r, n), n);
      if (s === _0n4)
        return;
      let sig = new Signature4(r, s);
      let recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n4);
      if (lowS && sig.hasHighS()) {
        sig = sig.normalizeS();
        recovery ^= 1;
      }
      return { sig, recovery };
    }
    function normalizePrivateKey4(key) {
      let num;
      if (typeof key === "bigint") {
        num = key;
      } else if (typeof key === "number" && Number.isSafeInteger(key) && key > 0) {
        num = BigInt(key);
      } else if (typeof key === "string") {
        if (key.length !== 2 * groupLen4)
          throw new Error("Expected 32 bytes of private key");
        num = hexToNumber4(key);
      } else if (isBytes3(key)) {
        if (key.length !== groupLen4)
          throw new Error("Expected 32 bytes of private key");
        num = bytesToNumber5(key);
      } else {
        throw new TypeError("Expected valid private key");
      }
      if (!isWithinCurveOrder4(num))
        throw new Error("Expected private key: 0 < key < n");
      return num;
    }
    function normalizePublicKey3(publicKey) {
      if (publicKey instanceof Point4) {
        publicKey.assertValidity();
        return publicKey;
      } else {
        return Point4.fromHex(publicKey);
      }
    }
    function normalizeSignature4(signature) {
      if (signature instanceof Signature4) {
        signature.assertValidity();
        return signature;
      }
      try {
        return Signature4.fromDER(signature);
      } catch (error) {
        return Signature4.fromCompact(signature);
      }
    }
    function getPublicKey4(privateKey, isCompressed = false) {
      return Point4.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    exports.getPublicKey = getPublicKey4;
    function recoverPublicKey(msgHash, signature, recovery, isCompressed = false) {
      return Point4.fromSignature(msgHash, signature, recovery).toRawBytes(isCompressed);
    }
    exports.recoverPublicKey = recoverPublicKey;
    function isProbPub2(item) {
      const arr = isBytes3(item);
      const str = typeof item === "string";
      const len = (arr || str) && item.length;
      if (arr)
        return len === compressedLen4 || len === uncompressedLen4;
      if (str)
        return len === compressedLen4 * 2 || len === uncompressedLen4 * 2;
      if (item instanceof Point4)
        return true;
      return false;
    }
    function getSharedSecret2(privateA, publicB, isCompressed = false) {
      if (isProbPub2(privateA))
        throw new TypeError("getSharedSecret: first arg must be private key");
      if (!isProbPub2(publicB))
        throw new TypeError("getSharedSecret: second arg must be public key");
      const b = normalizePublicKey3(publicB);
      b.assertValidity();
      return b.multiply(normalizePrivateKey4(privateA)).toRawBytes(isCompressed);
    }
    exports.getSharedSecret = getSharedSecret2;
    function bits2int3(bytes2) {
      const slice = bytes2.length > fieldLen4 ? bytes2.slice(0, fieldLen4) : bytes2;
      return bytesToNumber5(slice);
    }
    function bits2octets3(bytes2) {
      const z1 = bits2int3(bytes2);
      const z2 = mod4(z1, CURVE4.n);
      return int2octets3(z2 < _0n4 ? z1 : z2);
    }
    function int2octets3(num) {
      return numTo32b4(num);
    }
    function initSigArgs3(msgHash, privateKey, extraEntropy) {
      if (msgHash == null)
        throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
      const h1 = ensureBytes4(msgHash);
      const d = normalizePrivateKey4(privateKey);
      const seedArgs = [int2octets3(d), bits2octets3(h1)];
      if (extraEntropy != null) {
        if (extraEntropy === true)
          extraEntropy = exports.utils.randomBytes(fieldLen4);
        const e = ensureBytes4(extraEntropy);
        if (e.length !== fieldLen4)
          throw new Error(`sign: Expected ${fieldLen4} bytes of extra data`);
        seedArgs.push(e);
      }
      const seed = concatBytes6(...seedArgs);
      const m = bits2int3(h1);
      return { seed, m, d };
    }
    function finalizeSig3(recSig, opts) {
      const { sig, recovery } = recSig;
      const { der, recovered } = Object.assign({ canonical: true, der: true }, opts);
      const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
      return recovered ? [hashed, recovery] : hashed;
    }
    async function sign(msgHash, privKey, opts = {}) {
      const { seed, m, d } = initSigArgs3(msgHash, privKey, opts.extraEntropy);
      const drbg = new HmacDrbg3(hashLen3, groupLen4);
      await drbg.reseed(seed);
      let sig;
      while (!(sig = kmdToSig3(await drbg.generate(), m, d, opts.canonical)))
        await drbg.reseed();
      return finalizeSig3(sig, opts);
    }
    exports.sign = sign;
    function signSync4(msgHash, privKey, opts = {}) {
      const { seed, m, d } = initSigArgs3(msgHash, privKey, opts.extraEntropy);
      const drbg = new HmacDrbg3(hashLen3, groupLen4);
      drbg.reseedSync(seed);
      let sig;
      while (!(sig = kmdToSig3(drbg.generateSync(), m, d, opts.canonical)))
        drbg.reseedSync();
      return finalizeSig3(sig, opts);
    }
    exports.signSync = signSync4;
    var vopts2 = { strict: true };
    function verify4(signature, msgHash, publicKey, opts = vopts2) {
      let sig;
      try {
        sig = normalizeSignature4(signature);
        msgHash = ensureBytes4(msgHash);
      } catch (error) {
        return false;
      }
      const { r, s } = sig;
      if (opts.strict && sig.hasHighS())
        return false;
      const h = truncateHash4(msgHash);
      let P;
      try {
        P = normalizePublicKey3(publicKey);
      } catch (error) {
        return false;
      }
      const { n } = CURVE4;
      const sinv = invert4(s, n);
      const u1 = mod4(h * sinv, n);
      const u2 = mod4(r * sinv, n);
      const R = Point4.BASE.multiplyAndAddUnsafe(P, u1, u2);
      if (!R)
        return false;
      const v = mod4(R.x, n);
      return v === r;
    }
    exports.verify = verify4;
    function schnorrChallengeFinalize(ch) {
      return mod4(bytesToNumber5(ch), CURVE4.n);
    }
    var SchnorrSignature = class _SchnorrSignature {
      constructor(r, s) {
        this.r = r;
        this.s = s;
        this.assertValidity();
      }
      static fromHex(hex) {
        const bytes2 = ensureBytes4(hex);
        if (bytes2.length !== 64)
          throw new TypeError(`SchnorrSignature.fromHex: expected 64 bytes, not ${bytes2.length}`);
        const r = bytesToNumber5(bytes2.subarray(0, 32));
        const s = bytesToNumber5(bytes2.subarray(32, 64));
        return new _SchnorrSignature(r, s);
      }
      assertValidity() {
        const { r, s } = this;
        if (!isValidFieldElement4(r) || !isWithinCurveOrder4(s))
          throw new Error("Invalid signature");
      }
      toHex() {
        return numTo32bStr4(this.r) + numTo32bStr4(this.s);
      }
      toRawBytes() {
        return hexToBytes6(this.toHex());
      }
    };
    function schnorrGetPublicKey(privateKey) {
      return Point4.fromPrivateKey(privateKey).toRawX();
    }
    var InternalSchnorrSignature = class {
      constructor(message, privateKey, auxRand = exports.utils.randomBytes()) {
        if (message == null)
          throw new TypeError(`sign: Expected valid message, not "${message}"`);
        this.m = ensureBytes4(message);
        const { x, scalar } = this.getScalar(normalizePrivateKey4(privateKey));
        this.px = x;
        this.d = scalar;
        this.rand = ensureBytes4(auxRand);
        if (this.rand.length !== 32)
          throw new TypeError("sign: Expected 32 bytes of aux randomness");
      }
      getScalar(priv) {
        const point = Point4.fromPrivateKey(priv);
        const scalar = point.hasEvenY() ? priv : CURVE4.n - priv;
        return { point, scalar, x: point.toRawX() };
      }
      initNonce(d, t0h) {
        return numTo32b4(d ^ bytesToNumber5(t0h));
      }
      finalizeNonce(k0h) {
        const k0 = mod4(bytesToNumber5(k0h), CURVE4.n);
        if (k0 === _0n4)
          throw new Error("sign: Creation of signature failed. k is zero");
        const { point: R, x: rx, scalar: k } = this.getScalar(k0);
        return { R, rx, k };
      }
      finalizeSig(R, k, e, d) {
        return new SchnorrSignature(R.x, mod4(k + e * d, CURVE4.n)).toRawBytes();
      }
      error() {
        throw new Error("sign: Invalid signature produced");
      }
      async calc() {
        const { m, d, px, rand } = this;
        const tag = exports.utils.taggedHash;
        const t = this.initNonce(d, await tag(TAGS.aux, rand));
        const { R, rx, k } = this.finalizeNonce(await tag(TAGS.nonce, t, px, m));
        const e = schnorrChallengeFinalize(await tag(TAGS.challenge, rx, px, m));
        const sig = this.finalizeSig(R, k, e, d);
        if (!await schnorrVerify(sig, m, px))
          this.error();
        return sig;
      }
      calcSync() {
        const { m, d, px, rand } = this;
        const tag = exports.utils.taggedHashSync;
        const t = this.initNonce(d, tag(TAGS.aux, rand));
        const { R, rx, k } = this.finalizeNonce(tag(TAGS.nonce, t, px, m));
        const e = schnorrChallengeFinalize(tag(TAGS.challenge, rx, px, m));
        const sig = this.finalizeSig(R, k, e, d);
        if (!schnorrVerifySync(sig, m, px))
          this.error();
        return sig;
      }
    };
    async function schnorrSign(msg, privKey, auxRand) {
      return new InternalSchnorrSignature(msg, privKey, auxRand).calc();
    }
    function schnorrSignSync(msg, privKey, auxRand) {
      return new InternalSchnorrSignature(msg, privKey, auxRand).calcSync();
    }
    function initSchnorrVerify(signature, message, publicKey) {
      const raw = signature instanceof SchnorrSignature;
      const sig = raw ? signature : SchnorrSignature.fromHex(signature);
      if (raw)
        sig.assertValidity();
      return {
        ...sig,
        m: ensureBytes4(message),
        P: normalizePublicKey3(publicKey)
      };
    }
    function finalizeSchnorrVerify(r, P, s, e) {
      const R = Point4.BASE.multiplyAndAddUnsafe(P, normalizePrivateKey4(s), mod4(-e, CURVE4.n));
      if (!R || !R.hasEvenY() || R.x !== r)
        return false;
      return true;
    }
    async function schnorrVerify(signature, message, publicKey) {
      try {
        const { r, s, m, P } = initSchnorrVerify(signature, message, publicKey);
        const e = schnorrChallengeFinalize(await exports.utils.taggedHash(TAGS.challenge, numTo32b4(r), P.toRawX(), m));
        return finalizeSchnorrVerify(r, P, s, e);
      } catch (error) {
        return false;
      }
    }
    function schnorrVerifySync(signature, message, publicKey) {
      try {
        const { r, s, m, P } = initSchnorrVerify(signature, message, publicKey);
        const e = schnorrChallengeFinalize(exports.utils.taggedHashSync(TAGS.challenge, numTo32b4(r), P.toRawX(), m));
        return finalizeSchnorrVerify(r, P, s, e);
      } catch (error) {
        if (error instanceof ShaError4)
          throw error;
        return false;
      }
    }
    exports.schnorr = {
      Signature: SchnorrSignature,
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      signSync: schnorrSignSync,
      verifySync: schnorrVerifySync
    };
    Point4.BASE._setWindowSize(8);
    var crypto6 = {
      node: nodeCrypto4,
      web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
    };
    var TAGS = {
      challenge: "BIP0340/challenge",
      aux: "BIP0340/aux",
      nonce: "BIP0340/nonce"
    };
    var TAGGED_HASH_PREFIXES4 = {};
    exports.utils = {
      bytesToHex: bytesToHex6,
      hexToBytes: hexToBytes6,
      concatBytes: concatBytes6,
      mod: mod4,
      invert: invert4,
      isValidPrivateKey(privateKey) {
        try {
          normalizePrivateKey4(privateKey);
          return true;
        } catch (error) {
          return false;
        }
      },
      _bigintTo32Bytes: numTo32b4,
      _normalizePrivateKey: normalizePrivateKey4,
      hashToPrivateKey: (hash2) => {
        hash2 = ensureBytes4(hash2);
        const minLen = groupLen4 + 8;
        if (hash2.length < minLen || hash2.length > 1024) {
          throw new Error(`Expected valid bytes of private key as per FIPS 186`);
        }
        const num = mod4(bytesToNumber5(hash2), CURVE4.n - _1n4) + _1n4;
        return numTo32b4(num);
      },
      randomBytes: (bytesLength = 32) => {
        if (crypto6.web) {
          return crypto6.web.getRandomValues(new Uint8Array(bytesLength));
        } else if (crypto6.node) {
          const { randomBytes: randomBytes2 } = crypto6.node;
          return Uint8Array.from(randomBytes2(bytesLength));
        } else {
          throw new Error("The environment doesn't have randomBytes function");
        }
      },
      randomPrivateKey: () => exports.utils.hashToPrivateKey(exports.utils.randomBytes(groupLen4 + 8)),
      precompute(windowSize = 8, point = Point4.BASE) {
        const cached = point === Point4.BASE ? point : new Point4(point.x, point.y);
        cached._setWindowSize(windowSize);
        cached.multiply(_3n4);
        return cached;
      },
      sha256: async (...messages) => {
        if (crypto6.web) {
          const buffer = await crypto6.web.subtle.digest("SHA-256", concatBytes6(...messages));
          return new Uint8Array(buffer);
        } else if (crypto6.node) {
          const { createHash } = crypto6.node;
          const hash2 = createHash("sha256");
          messages.forEach((m) => hash2.update(m));
          return Uint8Array.from(hash2.digest());
        } else {
          throw new Error("The environment doesn't have sha256 function");
        }
      },
      hmacSha256: async (key, ...messages) => {
        if (crypto6.web) {
          const ckey = await crypto6.web.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
          const message = concatBytes6(...messages);
          const buffer = await crypto6.web.subtle.sign("HMAC", ckey, message);
          return new Uint8Array(buffer);
        } else if (crypto6.node) {
          const { createHmac } = crypto6.node;
          const hash2 = createHmac("sha256", key);
          messages.forEach((m) => hash2.update(m));
          return Uint8Array.from(hash2.digest());
        } else {
          throw new Error("The environment doesn't have hmac-sha256 function");
        }
      },
      sha256Sync: void 0,
      hmacSha256Sync: void 0,
      taggedHash: async (tag, ...messages) => {
        let tagP = TAGGED_HASH_PREFIXES4[tag];
        if (tagP === void 0) {
          const tagH = await exports.utils.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
          tagP = concatBytes6(tagH, tagH);
          TAGGED_HASH_PREFIXES4[tag] = tagP;
        }
        return exports.utils.sha256(tagP, ...messages);
      },
      taggedHashSync: (tag, ...messages) => {
        if (typeof _sha256Sync4 !== "function")
          throw new ShaError4("sha256Sync is undefined, you need to set it");
        let tagP = TAGGED_HASH_PREFIXES4[tag];
        if (tagP === void 0) {
          const tagH = _sha256Sync4(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
          tagP = concatBytes6(tagH, tagH);
          TAGGED_HASH_PREFIXES4[tag] = tagP;
        }
        return _sha256Sync4(tagP, ...messages);
      },
      _JacobianPoint: JacobianPoint4
    };
    Object.defineProperties(exports.utils, {
      sha256Sync: {
        configurable: false,
        get() {
          return _sha256Sync4;
        },
        set(val) {
          if (!_sha256Sync4)
            _sha256Sync4 = val;
        }
      },
      hmacSha256Sync: {
        configurable: false,
        get() {
          return _hmacSha256Sync4;
        },
        set(val) {
          if (!_hmacSha256Sync4)
            _hmacSha256Sync4 = val;
        }
      }
    });
  }
});

// node_modules/jsontokens/lib/ecdsaSigFormatter.js
var require_ecdsaSigFormatter = __commonJS({
  "node_modules/jsontokens/lib/ecdsaSigFormatter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.joseToDer = exports.derToJose = void 0;
    var base64_js_1 = require_base64_js();
    var base64Url_1 = require_base64Url();
    function getParamSize(keySize) {
      return (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
    }
    var paramBytesForAlg = {
      ES256: getParamSize(256),
      ES384: getParamSize(384),
      ES512: getParamSize(521)
    };
    function getParamBytesForAlg(alg) {
      const paramBytes = paramBytesForAlg[alg];
      if (paramBytes) {
        return paramBytes;
      }
      throw new Error(`Unknown algorithm "${alg}"`);
    }
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function signatureAsBytes(signature) {
      if (signature instanceof Uint8Array) {
        return signature;
      } else if ("string" === typeof signature) {
        return (0, base64_js_1.toByteArray)((0, base64Url_1.pad)(signature));
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Uint8Array");
    }
    function derToJose(signature, alg) {
      const signatureBytes = signatureAsBytes(signature);
      const paramBytes = getParamBytesForAlg(alg);
      const maxEncodedParamLength = paramBytes + 1;
      const inputLength = signatureBytes.length;
      let offset = 0;
      if (signatureBytes[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
      }
      let seqLength = signatureBytes[offset++];
      if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signatureBytes[offset++];
      }
      if (inputLength - offset < seqLength) {
        throw new Error(`"seq" specified length of "${seqLength}", only "${inputLength - offset}" remaining`);
      }
      if (signatureBytes[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
      }
      const rLength = signatureBytes[offset++];
      if (inputLength - offset - 2 < rLength) {
        throw new Error(`"r" specified length of "${rLength}", only "${inputLength - offset - 2}" available`);
      }
      if (maxEncodedParamLength < rLength) {
        throw new Error(`"r" specified length of "${rLength}", max of "${maxEncodedParamLength}" is acceptable`);
      }
      const rOffset = offset;
      offset += rLength;
      if (signatureBytes[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
      }
      const sLength = signatureBytes[offset++];
      if (inputLength - offset !== sLength) {
        throw new Error(`"s" specified length of "${sLength}", expected "${inputLength - offset}"`);
      }
      if (maxEncodedParamLength < sLength) {
        throw new Error(`"s" specified length of "${sLength}", max of "${maxEncodedParamLength}" is acceptable`);
      }
      const sOffset = offset;
      offset += sLength;
      if (offset !== inputLength) {
        throw new Error(`Expected to consume entire array, but "${inputLength - offset}" bytes remain`);
      }
      const rPadding = paramBytes - rLength;
      const sPadding = paramBytes - sLength;
      const dst = new Uint8Array(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      dst.set(signatureBytes.subarray(rOffset + Math.max(-rPadding, 0), rOffset + rLength), offset);
      offset = paramBytes;
      for (const o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      dst.set(signatureBytes.subarray(sOffset + Math.max(-sPadding, 0), sOffset + sLength), offset);
      return (0, base64Url_1.escape)((0, base64_js_1.fromByteArray)(dst));
    }
    exports.derToJose = derToJose;
    function countPadding(buf, start, stop) {
      let padding = 0;
      while (start + padding < stop && buf[start + padding] === 0) {
        ++padding;
      }
      const needsSign = buf[start + padding] >= MAX_OCTET;
      if (needsSign) {
        --padding;
      }
      return padding;
    }
    function joseToDer(signature, alg) {
      signature = signatureAsBytes(signature);
      const paramBytes = getParamBytesForAlg(alg);
      const signatureBytes = signature.length;
      if (signatureBytes !== paramBytes * 2) {
        throw new TypeError(`"${alg}" signatures must be "${paramBytes * 2}" bytes, saw "${signatureBytes}"`);
      }
      const rPadding = countPadding(signature, 0, paramBytes);
      const sPadding = countPadding(signature, paramBytes, signature.length);
      const rLength = paramBytes - rPadding;
      const sLength = paramBytes - sPadding;
      const rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
      const shortLength = rsBytes < MAX_OCTET;
      const dst = new Uint8Array((shortLength ? 2 : 3) + rsBytes);
      let offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = rLength;
      if (rPadding < 0) {
        dst[offset++] = 0;
        dst.set(signature.subarray(0, paramBytes), offset);
        offset += paramBytes;
      } else {
        dst.set(signature.subarray(rPadding, paramBytes), offset);
        offset += paramBytes - rPadding;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = sLength;
      if (sPadding < 0) {
        dst[offset++] = 0;
        dst.set(signature.subarray(paramBytes), offset);
      } else {
        dst.set(signature.subarray(paramBytes + sPadding), offset);
      }
      return dst;
    }
    exports.joseToDer = joseToDer;
  }
});

// node_modules/jsontokens/lib/errors.js
var require_errors = __commonJS({
  "node_modules/jsontokens/lib/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidTokenError = exports.MissingParametersError = void 0;
    var MissingParametersError = class extends Error {
      constructor(message) {
        super();
        this.name = "MissingParametersError";
        this.message = message || "";
      }
    };
    exports.MissingParametersError = MissingParametersError;
    var InvalidTokenError = class extends Error {
      constructor(message) {
        super();
        this.name = "InvalidTokenError";
        this.message = message || "";
      }
    };
    exports.InvalidTokenError = InvalidTokenError;
  }
});

// node_modules/jsontokens/lib/cryptoClients/secp256k1.js
var require_secp256k1 = __commonJS({
  "node_modules/jsontokens/lib/cryptoClients/secp256k1.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SECP256K1Client = void 0;
    var hmac_1 = require_hmac();
    var sha256_1 = require_sha256();
    var secp = require_lib2();
    var ecdsaSigFormatter_1 = require_ecdsaSigFormatter();
    var errors_1 = require_errors();
    var utils_1 = require_utils();
    secp.utils.hmacSha256Sync = (key, ...msgs) => {
      const h = hmac_1.hmac.create(sha256_1.sha256, key);
      msgs.forEach((msg) => h.update(msg));
      return h.digest();
    };
    var SECP256K1Client3 = class {
      static derivePublicKey(privateKey, compressed = true) {
        if (privateKey.length === 66) {
          privateKey = privateKey.slice(0, 64);
        }
        if (privateKey.length < 64) {
          privateKey = privateKey.padStart(64, "0");
        }
        return (0, utils_1.bytesToHex)(secp.getPublicKey(privateKey, compressed));
      }
      static signHash(signingInputHash, privateKey, format = "jose") {
        if (!signingInputHash || !privateKey) {
          throw new errors_1.MissingParametersError("a signing input hash and private key are all required");
        }
        const derSignature = secp.signSync(signingInputHash, privateKey.slice(0, 64), {
          der: true,
          canonical: false
        });
        if (format === "der")
          return (0, utils_1.bytesToHex)(derSignature);
        if (format === "jose")
          return (0, ecdsaSigFormatter_1.derToJose)(derSignature, "ES256");
        throw Error("Invalid signature format");
      }
      static loadSignature(joseSignature) {
        return (0, ecdsaSigFormatter_1.joseToDer)(joseSignature, "ES256");
      }
      static verifyHash(signingInputHash, derSignatureBytes, publicKey) {
        if (!signingInputHash || !derSignatureBytes || !publicKey) {
          throw new errors_1.MissingParametersError("a signing input hash, der signature, and public key are all required");
        }
        return secp.verify(derSignatureBytes, signingInputHash, publicKey, { strict: false });
      }
    };
    exports.SECP256K1Client = SECP256K1Client3;
    SECP256K1Client3.algorithmName = "ES256K";
  }
});

// node_modules/jsontokens/lib/cryptoClients/index.js
var require_cryptoClients = __commonJS({
  "node_modules/jsontokens/lib/cryptoClients/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cryptoClients = exports.SECP256K1Client = void 0;
    var secp256k1_1 = require_secp256k1();
    Object.defineProperty(exports, "SECP256K1Client", { enumerable: true, get: function() {
      return secp256k1_1.SECP256K1Client;
    } });
    var cryptoClients = {
      ES256K: secp256k1_1.SECP256K1Client
    };
    exports.cryptoClients = cryptoClients;
  }
});

// node_modules/jsontokens/lib/cryptoClients/sha256.js
var require_sha2562 = __commonJS({
  "node_modules/jsontokens/lib/cryptoClients/sha256.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hashSha256Async = exports.hashSha256 = void 0;
    var sha256_1 = require_sha256();
    function hashSha256(input) {
      return (0, sha256_1.sha256)(input);
    }
    exports.hashSha256 = hashSha256;
    function hashSha256Async(input) {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const isSubtleCryptoAvailable2 = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
          if (isSubtleCryptoAvailable2) {
            const bytes2 = typeof input === "string" ? new TextEncoder().encode(input) : input;
            const hash2 = yield crypto.subtle.digest("SHA-256", bytes2);
            return new Uint8Array(hash2);
          } else {
            const nodeCrypto4 = require_crypto();
            if (!nodeCrypto4.createHash) {
              throw new Error("`crypto` module does not contain `createHash`");
            }
            return Promise.resolve(nodeCrypto4.createHash("sha256").update(input).digest());
          }
        } catch (error) {
          console.log(error);
          console.log('Crypto lib not found. Neither the global `crypto.subtle` Web Crypto API, nor the or the Node.js `require("crypto").createHash` module is available. Falling back to JS implementation.');
          return Promise.resolve(hashSha256(input));
        }
      });
    }
    exports.hashSha256Async = hashSha256Async;
  }
});

// node_modules/jsontokens/lib/signer.js
var require_signer = __commonJS({
  "node_modules/jsontokens/lib/signer.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenSigner = exports.createUnsecuredToken = void 0;
    var base64url = require_base64Url();
    var cryptoClients_1 = require_cryptoClients();
    var errors_1 = require_errors();
    var sha256_1 = require_sha2562();
    function createSigningInput(payload, header) {
      const tokenParts = [];
      const encodedHeader = base64url.encode(JSON.stringify(header));
      tokenParts.push(encodedHeader);
      const encodedPayload = base64url.encode(JSON.stringify(payload));
      tokenParts.push(encodedPayload);
      const signingInput = tokenParts.join(".");
      return signingInput;
    }
    function createUnsecuredToken(payload) {
      const header = { typ: "JWT", alg: "none" };
      return createSigningInput(payload, header) + ".";
    }
    exports.createUnsecuredToken = createUnsecuredToken;
    var TokenSigner5 = class {
      constructor(signingAlgorithm, rawPrivateKey) {
        if (!(signingAlgorithm && rawPrivateKey)) {
          throw new errors_1.MissingParametersError("a signing algorithm and private key are required");
        }
        if (typeof signingAlgorithm !== "string") {
          throw new Error("signing algorithm parameter must be a string");
        }
        signingAlgorithm = signingAlgorithm.toUpperCase();
        if (!cryptoClients_1.cryptoClients.hasOwnProperty(signingAlgorithm)) {
          throw new Error("invalid signing algorithm");
        }
        this.tokenType = "JWT";
        this.cryptoClient = cryptoClients_1.cryptoClients[signingAlgorithm];
        this.rawPrivateKey = rawPrivateKey;
      }
      header(header = {}) {
        const defaultHeader = { typ: this.tokenType, alg: this.cryptoClient.algorithmName };
        return Object.assign({}, defaultHeader, header);
      }
      sign(payload, expanded = false, customHeader = {}) {
        const header = this.header(customHeader);
        const signingInput = createSigningInput(payload, header);
        const signingInputHash = (0, sha256_1.hashSha256)(signingInput);
        return this.createWithSignedHash(payload, expanded, header, signingInput, signingInputHash);
      }
      signAsync(payload, expanded = false, customHeader = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const header = this.header(customHeader);
          const signingInput = createSigningInput(payload, header);
          const signingInputHash = yield (0, sha256_1.hashSha256Async)(signingInput);
          return this.createWithSignedHash(payload, expanded, header, signingInput, signingInputHash);
        });
      }
      createWithSignedHash(payload, expanded, header, signingInput, signingInputHash) {
        const signature = this.cryptoClient.signHash(signingInputHash, this.rawPrivateKey);
        if (expanded) {
          const signedToken = {
            header: [base64url.encode(JSON.stringify(header))],
            payload: JSON.stringify(payload),
            signature: [signature]
          };
          return signedToken;
        } else {
          return [signingInput, signature].join(".");
        }
      }
    };
    exports.TokenSigner = TokenSigner5;
  }
});

// node_modules/jsontokens/lib/verifier.js
var require_verifier = __commonJS({
  "node_modules/jsontokens/lib/verifier.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenVerifier = void 0;
    var base64url = require_base64Url();
    var cryptoClients_1 = require_cryptoClients();
    var errors_1 = require_errors();
    var sha256_1 = require_sha2562();
    var TokenVerifier2 = class {
      constructor(signingAlgorithm, rawPublicKey) {
        if (!(signingAlgorithm && rawPublicKey)) {
          throw new errors_1.MissingParametersError("a signing algorithm and public key are required");
        }
        if (typeof signingAlgorithm !== "string") {
          throw "signing algorithm parameter must be a string";
        }
        signingAlgorithm = signingAlgorithm.toUpperCase();
        if (!cryptoClients_1.cryptoClients.hasOwnProperty(signingAlgorithm)) {
          throw "invalid signing algorithm";
        }
        this.tokenType = "JWT";
        this.cryptoClient = cryptoClients_1.cryptoClients[signingAlgorithm];
        this.rawPublicKey = rawPublicKey;
      }
      verify(token) {
        if (typeof token === "string") {
          return this.verifyCompact(token, false);
        } else if (typeof token === "object") {
          return this.verifyExpanded(token, false);
        } else {
          return false;
        }
      }
      verifyAsync(token) {
        if (typeof token === "string") {
          return this.verifyCompact(token, true);
        } else if (typeof token === "object") {
          return this.verifyExpanded(token, true);
        } else {
          return Promise.resolve(false);
        }
      }
      verifyCompact(token, async) {
        const tokenParts = token.split(".");
        const signingInput = tokenParts[0] + "." + tokenParts[1];
        const performVerify = (signingInputHash) => {
          const derSignatureBytes = this.cryptoClient.loadSignature(tokenParts[2]);
          return this.cryptoClient.verifyHash(signingInputHash, derSignatureBytes, this.rawPublicKey);
        };
        if (async) {
          return (0, sha256_1.hashSha256Async)(signingInput).then((signingInputHash) => performVerify(signingInputHash));
        } else {
          const signingInputHash = (0, sha256_1.hashSha256)(signingInput);
          return performVerify(signingInputHash);
        }
      }
      verifyExpanded(token, async) {
        const signingInput = [token["header"].join("."), base64url.encode(token["payload"])].join(".");
        let verified = true;
        const performVerify = (signingInputHash) => {
          token["signature"].map((signature) => {
            const derSignatureBytes = this.cryptoClient.loadSignature(signature);
            const signatureVerified = this.cryptoClient.verifyHash(signingInputHash, derSignatureBytes, this.rawPublicKey);
            if (!signatureVerified) {
              verified = false;
            }
          });
          return verified;
        };
        if (async) {
          return (0, sha256_1.hashSha256Async)(signingInput).then((signingInputHash) => performVerify(signingInputHash));
        } else {
          const signingInputHash = (0, sha256_1.hashSha256)(signingInput);
          return performVerify(signingInputHash);
        }
      }
    };
    exports.TokenVerifier = TokenVerifier2;
  }
});

// node_modules/jsontokens/lib/decode.js
var require_decode = __commonJS({
  "node_modules/jsontokens/lib/decode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeToken = void 0;
    var base64url = require_base64Url();
    function decodeToken2(token) {
      if (typeof token === "string") {
        const tokenParts = token.split(".");
        const header = JSON.parse(base64url.decode(tokenParts[0]));
        const payload = JSON.parse(base64url.decode(tokenParts[1]));
        const signature = tokenParts[2];
        return {
          header,
          payload,
          signature
        };
      } else if (typeof token === "object") {
        if (typeof token.payload !== "string") {
          throw new Error("Expected token payload to be a base64 or json string");
        }
        let payload = token.payload;
        if (token.payload[0] !== "{") {
          payload = base64url.decode(payload);
        }
        const allHeaders = [];
        token.header.map((headerValue) => {
          const header = JSON.parse(base64url.decode(headerValue));
          allHeaders.push(header);
        });
        return {
          header: allHeaders,
          payload: JSON.parse(payload),
          signature: token.signature
        };
      }
    }
    exports.decodeToken = decodeToken2;
  }
});

// node_modules/jsontokens/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/jsontokens/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_signer(), exports);
    __exportStar(require_verifier(), exports);
    __exportStar(require_decode(), exports);
    __exportStar(require_errors(), exports);
    __exportStar(require_cryptoClients(), exports);
  }
});

// node_modules/c32check/lib/encoding.js
var require_encoding = __commonJS({
  "node_modules/c32check/lib/encoding.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.c32decode = exports.c32normalize = exports.c32encode = exports.c32 = void 0;
    var utils_1 = require_utils();
    exports.c32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    var hex = "0123456789abcdef";
    function c32encode(inputHex, minLength) {
      if (!inputHex.match(/^[0-9a-fA-F]*$/)) {
        throw new Error("Not a hex-encoded string");
      }
      if (inputHex.length % 2 !== 0) {
        inputHex = `0${inputHex}`;
      }
      inputHex = inputHex.toLowerCase();
      let res = [];
      let carry = 0;
      for (let i = inputHex.length - 1; i >= 0; i--) {
        if (carry < 4) {
          const currentCode = hex.indexOf(inputHex[i]) >> carry;
          let nextCode = 0;
          if (i !== 0) {
            nextCode = hex.indexOf(inputHex[i - 1]);
          }
          const nextBits = 1 + carry;
          const nextLowBits = nextCode % (1 << nextBits) << 5 - nextBits;
          const curC32Digit = exports.c32[currentCode + nextLowBits];
          carry = nextBits;
          res.unshift(curC32Digit);
        } else {
          carry = 0;
        }
      }
      let C32leadingZeros = 0;
      for (let i = 0; i < res.length; i++) {
        if (res[i] !== "0") {
          break;
        } else {
          C32leadingZeros++;
        }
      }
      res = res.slice(C32leadingZeros);
      const zeroPrefix = new TextDecoder().decode((0, utils_1.hexToBytes)(inputHex)).match(/^\u0000*/);
      const numLeadingZeroBytesInHex = zeroPrefix ? zeroPrefix[0].length : 0;
      for (let i = 0; i < numLeadingZeroBytesInHex; i++) {
        res.unshift(exports.c32[0]);
      }
      if (minLength) {
        const count = minLength - res.length;
        for (let i = 0; i < count; i++) {
          res.unshift(exports.c32[0]);
        }
      }
      return res.join("");
    }
    exports.c32encode = c32encode;
    function c32normalize(c32input) {
      return c32input.toUpperCase().replace(/O/g, "0").replace(/L|I/g, "1");
    }
    exports.c32normalize = c32normalize;
    function c32decode(c32input, minLength) {
      c32input = c32normalize(c32input);
      if (!c32input.match(`^[${exports.c32}]*$`)) {
        throw new Error("Not a c32-encoded string");
      }
      const zeroPrefix = c32input.match(`^${exports.c32[0]}*`);
      const numLeadingZeroBytes = zeroPrefix ? zeroPrefix[0].length : 0;
      let res = [];
      let carry = 0;
      let carryBits = 0;
      for (let i = c32input.length - 1; i >= 0; i--) {
        if (carryBits === 4) {
          res.unshift(hex[carry]);
          carryBits = 0;
          carry = 0;
        }
        const currentCode = exports.c32.indexOf(c32input[i]) << carryBits;
        const currentValue = currentCode + carry;
        const currentHexDigit = hex[currentValue % 16];
        carryBits += 1;
        carry = currentValue >> 4;
        if (carry > 1 << carryBits) {
          throw new Error("Panic error in decoding.");
        }
        res.unshift(currentHexDigit);
      }
      res.unshift(hex[carry]);
      if (res.length % 2 === 1) {
        res.unshift("0");
      }
      let hexLeadingZeros = 0;
      for (let i = 0; i < res.length; i++) {
        if (res[i] !== "0") {
          break;
        } else {
          hexLeadingZeros++;
        }
      }
      res = res.slice(hexLeadingZeros - hexLeadingZeros % 2);
      let hexStr = res.join("");
      for (let i = 0; i < numLeadingZeroBytes; i++) {
        hexStr = `00${hexStr}`;
      }
      if (minLength) {
        const count = minLength * 2 - hexStr.length;
        for (let i = 0; i < count; i += 2) {
          hexStr = `00${hexStr}`;
        }
      }
      return hexStr;
    }
    exports.c32decode = c32decode;
  }
});

// node_modules/c32check/lib/checksum.js
var require_checksum = __commonJS({
  "node_modules/c32check/lib/checksum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.c32checkDecode = exports.c32checkEncode = void 0;
    var sha256_1 = require_sha256();
    var utils_1 = require_utils();
    var encoding_1 = require_encoding();
    function c32checksum(dataHex) {
      const dataHash = (0, sha256_1.sha256)((0, sha256_1.sha256)((0, utils_1.hexToBytes)(dataHex)));
      const checksum2 = (0, utils_1.bytesToHex)(dataHash.slice(0, 4));
      return checksum2;
    }
    function c32checkEncode(version, data) {
      if (version < 0 || version >= 32) {
        throw new Error("Invalid version (must be between 0 and 31)");
      }
      if (!data.match(/^[0-9a-fA-F]*$/)) {
        throw new Error("Invalid data (not a hex string)");
      }
      data = data.toLowerCase();
      if (data.length % 2 !== 0) {
        data = `0${data}`;
      }
      let versionHex = version.toString(16);
      if (versionHex.length === 1) {
        versionHex = `0${versionHex}`;
      }
      const checksumHex = c32checksum(`${versionHex}${data}`);
      const c32str = (0, encoding_1.c32encode)(`${data}${checksumHex}`);
      return `${encoding_1.c32[version]}${c32str}`;
    }
    exports.c32checkEncode = c32checkEncode;
    function c32checkDecode(c32data) {
      c32data = (0, encoding_1.c32normalize)(c32data);
      const dataHex = (0, encoding_1.c32decode)(c32data.slice(1));
      const versionChar = c32data[0];
      const version = encoding_1.c32.indexOf(versionChar);
      const checksum2 = dataHex.slice(-8);
      let versionHex = version.toString(16);
      if (versionHex.length === 1) {
        versionHex = `0${versionHex}`;
      }
      if (c32checksum(`${versionHex}${dataHex.substring(0, dataHex.length - 8)}`) !== checksum2) {
        throw new Error("Invalid c32check string: checksum mismatch");
      }
      return [version, dataHex.substring(0, dataHex.length - 8)];
    }
    exports.c32checkDecode = c32checkDecode;
  }
});

// node_modules/c32check/node_modules/base-x/src/index.js
var require_src2 = __commonJS({
  "node_modules/c32check/node_modules/base-x/src/index.js"(exports, module) {
    "use strict";
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode(source) {
        if (source instanceof Uint8Array) {
        } else if (ArrayBuffer.isView(source)) {
          source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
          source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
          throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return new Uint8Array();
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (source[psz]) {
          var charCode = source.charCodeAt(psz);
          if (charCode > 255) {
            return;
          }
          var carry = BASE_MAP[charCode];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode,
        decodeUnsafe,
        decode
      };
    }
    module.exports = base;
  }
});

// node_modules/c32check/lib/base58check.js
var require_base58check = __commonJS({
  "node_modules/c32check/lib/base58check.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decode = exports.encode = void 0;
    var sha256_1 = require_sha256();
    var utils_1 = require_utils();
    var basex = require_src2();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    function encode(data, prefix = "00") {
      const dataBytes = typeof data === "string" ? (0, utils_1.hexToBytes)(data) : data;
      const prefixBytes = typeof prefix === "string" ? (0, utils_1.hexToBytes)(prefix) : data;
      if (!(dataBytes instanceof Uint8Array) || !(prefixBytes instanceof Uint8Array)) {
        throw new TypeError("Argument must be of type Uint8Array or string");
      }
      const checksum2 = (0, sha256_1.sha256)((0, sha256_1.sha256)(new Uint8Array([...prefixBytes, ...dataBytes])));
      return basex(ALPHABET).encode([...prefixBytes, ...dataBytes, ...checksum2.slice(0, 4)]);
    }
    exports.encode = encode;
    function decode(string) {
      const bytes2 = basex(ALPHABET).decode(string);
      const prefixBytes = bytes2.slice(0, 1);
      const dataBytes = bytes2.slice(1, -4);
      const checksum2 = (0, sha256_1.sha256)((0, sha256_1.sha256)(new Uint8Array([...prefixBytes, ...dataBytes])));
      bytes2.slice(-4).forEach((check, index) => {
        if (check !== checksum2[index]) {
          throw new Error("Invalid checksum");
        }
      });
      return { prefix: prefixBytes, data: dataBytes };
    }
    exports.decode = decode;
  }
});

// node_modules/c32check/lib/address.js
var require_address = __commonJS({
  "node_modules/c32check/lib/address.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.c32ToB58 = exports.b58ToC32 = exports.c32addressDecode = exports.c32address = exports.versions = void 0;
    var checksum_1 = require_checksum();
    var base58check3 = require_base58check();
    var utils_1 = require_utils();
    exports.versions = {
      mainnet: {
        p2pkh: 22,
        p2sh: 20
        // 'M'
      },
      testnet: {
        p2pkh: 26,
        p2sh: 21
        // 'N'
      }
    };
    var ADDR_BITCOIN_TO_STACKS = {};
    ADDR_BITCOIN_TO_STACKS[0] = exports.versions.mainnet.p2pkh;
    ADDR_BITCOIN_TO_STACKS[5] = exports.versions.mainnet.p2sh;
    ADDR_BITCOIN_TO_STACKS[111] = exports.versions.testnet.p2pkh;
    ADDR_BITCOIN_TO_STACKS[196] = exports.versions.testnet.p2sh;
    var ADDR_STACKS_TO_BITCOIN = {};
    ADDR_STACKS_TO_BITCOIN[exports.versions.mainnet.p2pkh] = 0;
    ADDR_STACKS_TO_BITCOIN[exports.versions.mainnet.p2sh] = 5;
    ADDR_STACKS_TO_BITCOIN[exports.versions.testnet.p2pkh] = 111;
    ADDR_STACKS_TO_BITCOIN[exports.versions.testnet.p2sh] = 196;
    function c32address3(version, hash160hex) {
      if (!hash160hex.match(/^[0-9a-fA-F]{40}$/)) {
        throw new Error("Invalid argument: not a hash160 hex string");
      }
      const c32string = (0, checksum_1.c32checkEncode)(version, hash160hex);
      return `S${c32string}`;
    }
    exports.c32address = c32address3;
    function c32addressDecode2(c32addr) {
      if (c32addr.length <= 5) {
        throw new Error("Invalid c32 address: invalid length");
      }
      if (c32addr[0] != "S") {
        throw new Error('Invalid c32 address: must start with "S"');
      }
      return (0, checksum_1.c32checkDecode)(c32addr.slice(1));
    }
    exports.c32addressDecode = c32addressDecode2;
    function b58ToC32(b58check, version = -1) {
      const addrInfo = base58check3.decode(b58check);
      const hash160String = (0, utils_1.bytesToHex)(addrInfo.data);
      const addrVersion = parseInt((0, utils_1.bytesToHex)(addrInfo.prefix), 16);
      let stacksVersion;
      if (version < 0) {
        stacksVersion = addrVersion;
        if (ADDR_BITCOIN_TO_STACKS[addrVersion] !== void 0) {
          stacksVersion = ADDR_BITCOIN_TO_STACKS[addrVersion];
        }
      } else {
        stacksVersion = version;
      }
      return c32address3(stacksVersion, hash160String);
    }
    exports.b58ToC32 = b58ToC32;
    function c32ToB58(c32string, version = -1) {
      const addrInfo = c32addressDecode2(c32string);
      const stacksVersion = addrInfo[0];
      const hash160String = addrInfo[1];
      let bitcoinVersion;
      if (version < 0) {
        bitcoinVersion = stacksVersion;
        if (ADDR_STACKS_TO_BITCOIN[stacksVersion] !== void 0) {
          bitcoinVersion = ADDR_STACKS_TO_BITCOIN[stacksVersion];
        }
      } else {
        bitcoinVersion = version;
      }
      let prefix = bitcoinVersion.toString(16);
      if (prefix.length === 1) {
        prefix = `0${prefix}`;
      }
      return base58check3.encode(hash160String, prefix);
    }
    exports.c32ToB58 = c32ToB58;
  }
});

// node_modules/c32check/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/c32check/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.b58ToC32 = exports.c32ToB58 = exports.versions = exports.c32normalize = exports.c32addressDecode = exports.c32address = exports.c32checkDecode = exports.c32checkEncode = exports.c32decode = exports.c32encode = void 0;
    var encoding_1 = require_encoding();
    Object.defineProperty(exports, "c32encode", { enumerable: true, get: function() {
      return encoding_1.c32encode;
    } });
    Object.defineProperty(exports, "c32decode", { enumerable: true, get: function() {
      return encoding_1.c32decode;
    } });
    Object.defineProperty(exports, "c32normalize", { enumerable: true, get: function() {
      return encoding_1.c32normalize;
    } });
    var checksum_1 = require_checksum();
    Object.defineProperty(exports, "c32checkEncode", { enumerable: true, get: function() {
      return checksum_1.c32checkEncode;
    } });
    Object.defineProperty(exports, "c32checkDecode", { enumerable: true, get: function() {
      return checksum_1.c32checkDecode;
    } });
    var address_1 = require_address();
    Object.defineProperty(exports, "c32address", { enumerable: true, get: function() {
      return address_1.c32address;
    } });
    Object.defineProperty(exports, "c32addressDecode", { enumerable: true, get: function() {
      return address_1.c32addressDecode;
    } });
    Object.defineProperty(exports, "c32ToB58", { enumerable: true, get: function() {
      return address_1.c32ToB58;
    } });
    Object.defineProperty(exports, "b58ToC32", { enumerable: true, get: function() {
      return address_1.b58ToC32;
    } });
    Object.defineProperty(exports, "versions", { enumerable: true, get: function() {
      return address_1.versions;
    } });
  }
});

// node_modules/lodash.clonedeep/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.clonedeep/index.js"(exports, module) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reFlags = /\w*$/;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    function addMapEntry(map, pair) {
      map.set(pair[0], pair[1]);
      return map;
    }
    function addSetEntry(set, value) {
      set.add(value);
      return set;
    }
    function arrayEach(array, iteratee) {
      var index = -1, length = array ? array.length : 0;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array ? array.length : 0;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    })();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectCreate = Object.create;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeKeys = overArg(Object.keys, Object);
    var DataView2 = getNative(root, "DataView");
    var Map = getNative(root, "Map");
    var Promise2 = getNative(root, "Promise");
    var Set = getNative(root, "Set");
    var WeakMap2 = getNative(root, "WeakMap");
    var nativeCreate = getNative(Object, "create");
    var dataViewCtorString = toSource(DataView2);
    var mapCtorString = toSource(Map);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set);
    var weakMapCtorString = toSource(WeakMap2);
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function Hash2(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash2.prototype.clear = hashClear;
    Hash2.prototype["delete"] = hashDelete;
    Hash2.prototype.get = hashGet;
    Hash2.prototype.has = hashHas;
    Hash2.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash2(),
        "map": new (Map || ListCache)(),
        "string": new Hash2()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }
    function stackClear() {
      this.__data__ = new ListCache();
    }
    function stackDelete(key) {
      return this.__data__["delete"](key);
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache) {
        var pairs = cache.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          return this;
        }
        cache = this.__data__ = new MapCache(pairs);
      }
      cache.set(key, value);
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
      var length = result.length, skipIndexes = !!length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        object[key] = value;
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
      var result;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          if (isHostObject(value)) {
            return object ? value : {};
          }
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, baseClone, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (!isArr) {
        var props = isFull ? getAllKeys(value) : keys(value);
      }
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, isDeep, isFull, customizer, key2, value, stack));
      });
      return result;
    }
    function baseCreate(proto) {
      return isObject(proto) ? objectCreate(proto) : {};
    }
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    function baseGetTag(value) {
      return objectToString.call(value);
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var result = new buffer.constructor(buffer.length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    function cloneMap(map, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
      return arrayReduce(array, addMapEntry, new map.constructor());
    }
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    function cloneSet(set, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
      return arrayReduce(array, addSetEntry, new set.constructor());
    }
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        assignValue(object, key, newValue === void 0 ? source[key] : newValue);
      }
      return object;
    }
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;
    var getTag = baseGetTag;
    if (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = function(value) {
        var result = objectToString.call(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : void 0;
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    function initCloneArray(array) {
      var length = array.length, result = array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    function initCloneByTag(object, tag, cloneFunc, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return cloneMap(object, isDeep, cloneFunc);
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return cloneSet(object, isDeep, cloneFunc);
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function cloneDeep(value) {
      return baseClone(value, true, true);
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    function isArguments(value) {
      return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function stubArray() {
      return [];
    }
    function stubFalse() {
      return false;
    }
    module.exports = cloneDeep;
  }
});

// node_modules/zone-file/dist/zone-file.cjs.development.js
var require_zone_file_cjs_development = __commonJS({
  "node_modules/zone-file/dist/zone-file.cjs.development.js"(exports) {
    "use strict";
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _createForOfIteratorHelperLoose(o, allowArrayLike) {
      var it;
      if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
          if (it) o = it;
          var i = 0;
          return function() {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      it = o[Symbol.iterator]();
      return it.next.bind(it);
    }
    function getZoneFileTemplate() {
      return "{$origin}\n{$ttl}\n\n; SOA Record\n{name} {ttl}    IN  SOA {mname}{rname}(\n{serial} ;serial\n{refresh} ;refresh\n{retry} ;retry\n{expire} ;expire\n{minimum} ;minimum ttl\n)\n\n; NS Records\n{ns}\n\n; MX Records\n{mx}\n\n; A Records\n{a}\n\n; AAAA Records\n{aaaa}\n\n; CNAME Records\n{cname}\n\n; PTR Records\n{ptr}\n\n; TXT Records\n{txt}\n\n; SRV Records\n{srv}\n\n; SPF Records\n{spf}\n\n; URI Records\n{uri}\n";
    }
    function makeZoneFile(jsonZoneFile, template) {
      if (template === void 0) {
        template = getZoneFileTemplate();
      }
      template = processOrigin(jsonZoneFile["$origin"], template);
      template = processTTL(jsonZoneFile["$ttl"], template);
      template = processSOA(jsonZoneFile["soa"], template);
      template = processNS(jsonZoneFile["ns"], template);
      template = processA(jsonZoneFile["a"], template);
      template = processAAAA(jsonZoneFile["aaaa"], template);
      template = processCNAME(jsonZoneFile["cname"], template);
      template = processMX(jsonZoneFile["mx"], template);
      template = processPTR(jsonZoneFile["ptr"], template);
      template = processTXT(jsonZoneFile["txt"], template);
      template = processSRV(jsonZoneFile["srv"], template);
      template = processSPF(jsonZoneFile["spf"], template);
      template = processURI(jsonZoneFile["uri"], template);
      template = processValues(jsonZoneFile, template);
      return template.replace(/\n{2,}/gim, "\n\n");
    }
    function processOrigin(data, template) {
      var ret = "";
      if (typeof data !== "undefined") {
        ret += "$ORIGIN " + data;
      }
      return template.replace("{$origin}", ret);
    }
    function processTTL(data, template) {
      var ret = "";
      if (typeof data !== "undefined") {
        ret += "$TTL " + data;
      }
      return template.replace("{$ttl}", ret);
    }
    function processSOA(data, template) {
      var ret = template;
      if (typeof data !== "undefined") {
        data.name = data.name || "@";
        data.ttl = data.ttl || "";
        for (var key in data) {
          var value = data[key];
          ret = ret.replace("{" + key + "}", value + "	");
        }
      }
      return ret;
    }
    function processNS(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator = _createForOfIteratorHelperLoose(data), _step; !(_step = _iterator()).done; ) {
          var record = _step.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	NS	" + record.host + "\n";
        }
      }
      return template.replace("{ns}", ret);
    }
    function processA(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator2 = _createForOfIteratorHelperLoose(data), _step2; !(_step2 = _iterator2()).done; ) {
          var record = _step2.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	A	" + record.ip + "\n";
        }
      }
      return template.replace("{a}", ret);
    }
    function processAAAA(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator3 = _createForOfIteratorHelperLoose(data), _step3; !(_step3 = _iterator3()).done; ) {
          var record = _step3.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	AAAA	" + record.ip + "\n";
        }
      }
      return template.replace("{aaaa}", ret);
    }
    function processCNAME(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator4 = _createForOfIteratorHelperLoose(data), _step4; !(_step4 = _iterator4()).done; ) {
          var record = _step4.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	CNAME	" + record.alias + "\n";
        }
      }
      return template.replace("{cname}", ret);
    }
    function processMX(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator5 = _createForOfIteratorHelperLoose(data), _step5; !(_step5 = _iterator5()).done; ) {
          var record = _step5.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	MX	" + record.preference + "	" + record.host + "\n";
        }
      }
      return template.replace("{mx}", ret);
    }
    function processPTR(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator6 = _createForOfIteratorHelperLoose(data), _step6; !(_step6 = _iterator6()).done; ) {
          var record = _step6.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	PTR	" + record.host + "\n";
        }
      }
      return template.replace("{ptr}", ret);
    }
    function processTXT(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator7 = _createForOfIteratorHelperLoose(data), _step7; !(_step7 = _iterator7()).done; ) {
          var record = _step7.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	TXT	";
          var txtData = record.txt;
          if (typeof txtData === "string") {
            ret += '"' + txtData + '"';
          } else if (txtData instanceof Array) {
            ret += txtData.map(function(datum) {
              return '"' + datum + '"';
            }).join(" ");
          }
          ret += "\n";
        }
      }
      return template.replace("{txt}", ret);
    }
    function processSRV(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator8 = _createForOfIteratorHelperLoose(data), _step8; !(_step8 = _iterator8()).done; ) {
          var record = _step8.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	SRV	" + record.priority + "	";
          ret += record.weight + "	";
          ret += record.port + "	";
          ret += record.target + "\n";
        }
      }
      return template.replace("{srv}", ret);
    }
    function processSPF(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator9 = _createForOfIteratorHelperLoose(data), _step9; !(_step9 = _iterator9()).done; ) {
          var record = _step9.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	SPF	" + record.data + "\n";
        }
      }
      return template.replace("{spf}", ret);
    }
    function processURI(data, template) {
      var ret = "";
      if (data) {
        for (var _iterator10 = _createForOfIteratorHelperLoose(data), _step10; !(_step10 = _iterator10()).done; ) {
          var record = _step10.value;
          ret += (record.name || "@") + "	";
          if (record.ttl) ret += record.ttl + "	";
          ret += "IN	URI	" + record.priority + "	";
          ret += record.weight + "	";
          ret += '"' + record.target + '"\n';
        }
      }
      return template.replace("{uri}", ret);
    }
    function processValues(jsonZoneFile, template) {
      template = template.replace("{zone}", jsonZoneFile["$origin"] || (jsonZoneFile["soa"] ? jsonZoneFile["soa"]["name"] : false) || "");
      template = template.replace("{datetime}", (/* @__PURE__ */ new Date()).toISOString());
      var time = Math.round(Date.now() / 1e3);
      return template.replace("{time}", "" + time);
    }
    function parseZoneFile2(text) {
      text = removeComments(text);
      text = flatten(text);
      return parseRRs(text);
    }
    function removeComments(text) {
      var re = /(^|[^\\]);.*/g;
      return text.replace(re, function(_m, g1) {
        return g1 ? g1 : "";
      });
    }
    function flatten(text) {
      var captured = [];
      var re = /\([\s\S]*?\)/gim;
      var match = re.exec(text);
      while (match !== null) {
        var replacement = match[0].replace(/\s+/gm, " ");
        captured.push({
          match,
          replacement
        });
        match = re.exec(text);
      }
      var arrText = text.split("");
      for (var _i = 0, _captured = captured; _i < _captured.length; _i++) {
        var cur = _captured[_i];
        var _match = cur.match, _replacement = cur.replacement;
        arrText.splice(_match.index, _match[0].length, _replacement);
      }
      return arrText.join("").replace(/\(|\)/gim, " ");
    }
    function parseRRs(text) {
      var ret = {};
      var rrs = text.split("\n");
      for (var _iterator = _createForOfIteratorHelperLoose(rrs), _step; !(_step = _iterator()).done; ) {
        var rr = _step.value;
        if (!rr || !rr.trim()) {
          continue;
        }
        var uRR = rr.toUpperCase();
        if (/\s+TXT\s+/.test(uRR)) {
          ret.txt = ret.txt || [];
          ret.txt.push(parseTXT(rr));
        } else if (uRR.indexOf("$ORIGIN") === 0) {
          ret.$origin = rr.split(/\s+/g)[1];
        } else if (uRR.indexOf("$TTL") === 0) {
          ret.$ttl = parseInt(rr.split(/\s+/g)[1], 10);
        } else if (/\s+SOA\s+/.test(uRR)) {
          ret.soa = parseSOA(rr);
        } else if (/\s+NS\s+/.test(uRR)) {
          ret.ns = ret.ns || [];
          ret.ns.push(parseNS(rr));
        } else if (/\s+A\s+/.test(uRR)) {
          ret.a = ret.a || [];
          ret.a.push(parseA(rr, ret.a));
        } else if (/\s+AAAA\s+/.test(uRR)) {
          ret.aaaa = ret.aaaa || [];
          ret.aaaa.push(parseAAAA(rr));
        } else if (/\s+CNAME\s+/.test(uRR)) {
          ret.cname = ret.cname || [];
          ret.cname.push(parseCNAME(rr));
        } else if (/\s+MX\s+/.test(uRR)) {
          ret.mx = ret.mx || [];
          ret.mx.push(parseMX(rr));
        } else if (/\s+PTR\s+/.test(uRR)) {
          ret.ptr = ret.ptr || [];
          ret.ptr.push(parsePTR(rr, ret.ptr, ret.$origin));
        } else if (/\s+SRV\s+/.test(uRR)) {
          ret.srv = ret.srv || [];
          ret.srv.push(parseSRV(rr));
        } else if (/\s+SPF\s+/.test(uRR)) {
          ret.spf = ret.spf || [];
          ret.spf.push(parseSPF(rr));
        } else if (/\s+URI\s+/.test(uRR)) {
          ret.uri = ret.uri || [];
          ret.uri.push(parseURI(rr));
        }
      }
      return ret;
    }
    function parseSOA(rr) {
      var soa = {};
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      soa.name = rrTokens[0];
      soa.minimum = parseInt(rrTokens[l - 1], 10);
      soa.expire = parseInt(rrTokens[l - 2], 10);
      soa.retry = parseInt(rrTokens[l - 3], 10);
      soa.refresh = parseInt(rrTokens[l - 4], 10);
      soa.serial = parseInt(rrTokens[l - 5], 10);
      soa.rname = rrTokens[l - 6];
      soa.mname = rrTokens[l - 7];
      if (!isNaN(rrTokens[1])) soa.ttl = parseInt(rrTokens[1], 10);
      return soa;
    }
    function parseNS(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        host: rrTokens[l - 1]
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseA(rr, recordsSoFar) {
      var rrTokens = rr.trim().split(/\s+/g);
      var urrTokens = rr.trim().toUpperCase().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        ip: rrTokens[l - 1]
      };
      if (urrTokens.lastIndexOf("A") === 0) {
        if (recordsSoFar.length) {
          result.name = recordsSoFar[recordsSoFar.length - 1].name;
        } else {
          result.name = "@";
        }
      }
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseAAAA(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        ip: rrTokens[l - 1]
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseCNAME(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        alias: rrTokens[l - 1]
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseMX(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        preference: parseInt(rrTokens[l - 2], 10),
        host: rrTokens[l - 1]
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseTXT(rr) {
      var rrTokens = rr.trim().match(/[^\s"']+|"[^"]*"|'[^']*'/g);
      if (!rrTokens) throw new Error("Failure to tokenize TXT record");
      var l = rrTokens.length;
      var indexTXT = rrTokens.indexOf("TXT");
      function stripText(txt) {
        if (txt.indexOf('"') > -1) {
          txt = txt.split('"')[1];
        }
        return txt;
      }
      var tokenTxt;
      if (l - indexTXT - 1 > 1) {
        tokenTxt = [].concat(rrTokens.slice(indexTXT + 1).map(stripText));
      } else {
        tokenTxt = stripText(rrTokens[l - 1]);
      }
      var result = {
        name: rrTokens[0],
        txt: tokenTxt
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parsePTR(rr, recordsSoFar, currentOrigin) {
      var rrTokens = rr.trim().split(/\s+/g);
      var urrTokens = rr.trim().toUpperCase().split(/\s+/g);
      if (urrTokens.lastIndexOf("PTR") === 0 && recordsSoFar[recordsSoFar.length - 1]) {
        rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
      }
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        fullname: rrTokens[0] + "." + currentOrigin,
        host: rrTokens[l - 1]
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseSRV(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        target: rrTokens[l - 1],
        priority: parseInt(rrTokens[l - 4], 10),
        weight: parseInt(rrTokens[l - 3], 10),
        port: parseInt(rrTokens[l - 2], 10)
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseSPF(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var result = {
        name: rrTokens[0],
        data: ""
      };
      var l = rrTokens.length;
      while (l-- > 4) {
        result.data = rrTokens[l] + " " + result.data.trim();
      }
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    function parseURI(rr) {
      var rrTokens = rr.trim().split(/\s+/g);
      var l = rrTokens.length;
      var result = {
        name: rrTokens[0],
        target: rrTokens[l - 1].replace(/"/g, ""),
        priority: parseInt(rrTokens[l - 3], 10),
        weight: parseInt(rrTokens[l - 2], 10)
      };
      if (!isNaN(rrTokens[1])) result.ttl = parseInt(rrTokens[1], 10);
      return result;
    }
    var ZoneFile = /* @__PURE__ */ (function() {
      function ZoneFile2(zoneFile) {
        if (typeof zoneFile === "object") {
          this.jsonZoneFile = JSON.parse(JSON.stringify(zoneFile));
        } else if (typeof zoneFile === "string") {
          this.jsonZoneFile = parseZoneFile2(zoneFile);
        } else {
          this.jsonZoneFile = void 0;
        }
      }
      var _proto = ZoneFile2.prototype;
      _proto.toJSON = function toJSON() {
        return this.jsonZoneFile;
      };
      _proto.toString = function toString() {
        return makeZoneFile(this.toJSON());
      };
      return ZoneFile2;
    })();
    exports.ZoneFile = ZoneFile;
    exports.makeZoneFile = makeZoneFile;
    exports.parseZoneFile = parseZoneFile2;
  }
});

// node_modules/zone-file/dist/index.js
var require_dist = __commonJS({
  "node_modules/zone-file/dist/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_zone_file_cjs_development();
    }
  }
});

// node_modules/@stacks/wallet-sdk/dist/esm/generate.js
var import_bip392 = __toESM(require_bip39());
var import_english2 = __toESM(require_english());

// node_modules/@noble/hashes/esm/_assert.js
function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`);
}
function bool(b) {
  if (typeof b !== "boolean")
    throw new Error(`Expected boolean, not ${b}`);
}
function bytes(b, ...lengths) {
  if (!(b instanceof Uint8Array))
    throw new TypeError("Expected Uint8Array");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash(hash2) {
  if (typeof hash2 !== "function" || typeof hash2.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  number(hash2.outputLen);
  number(hash2.blockLen);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}
var assert = {
  number,
  bool,
  bytes,
  hash,
  exists,
  output
};
var assert_default = assert;

// node_modules/@noble/hashes/esm/cryptoBrowser.js
var crypto2 = {
  node: void 0,
  web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
};

// node_modules/@noble/hashes/esm/utils.js
var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr = (word, shift) => word << 32 - shift | word >>> shift;
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
var hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes[uint8a[i]];
  }
  return hex;
}
function hexToBytes(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToBytes: expected string, got " + typeof hex);
  }
  if (hex.length % 2)
    throw new Error("hexToBytes: received invalid unpadded hex");
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string") {
    throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
  }
  return new TextEncoder().encode(str);
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  if (!(data instanceof Uint8Array))
    throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
  return data;
}
function concatBytes(...arrays) {
  if (!arrays.every((a) => a instanceof Uint8Array))
    throw new Error("Uint8Array list expected");
  if (arrays.length === 1)
    return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
var Hash = class {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto();
  }
};
function wrapConstructor(hashConstructor) {
  const hashC = (message) => hashConstructor().update(toBytes(message)).digest();
  const tmp = hashConstructor();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashConstructor();
  return hashC;
}

// node_modules/@noble/hashes/esm/hmac.js
var HMAC = class extends Hash {
  constructor(hash2, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    assert_default.hash(hash2);
    const key = toBytes(_key);
    this.iHash = hash2.create();
    if (typeof this.iHash.update !== "function")
      throw new TypeError("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash2.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    pad.fill(0);
  }
  update(buf) {
    assert_default.exists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    assert_default.exists(this);
    assert_default.bytes(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
hmac.create = (hash2, key) => new HMAC(hash2, key);

// node_modules/@noble/hashes/esm/_sha2.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
var SHA2 = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE2) {
    super();
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    assert_default.exists(this);
    const { view, buffer, blockLen } = this;
    data = toBytes(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    assert_default.exists(this);
    assert_default.output(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
};

// node_modules/@noble/hashes/esm/ripemd160.js
var Rho = new Uint8Array([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]);
var Id = Uint8Array.from({ length: 16 }, (_, i) => i);
var Pi = Id.map((i) => (9 * i + 5) % 16);
var idxL = [Id];
var idxR = [Pi];
for (let i = 0; i < 4; i++)
  for (let j of [idxL, idxR])
    j.push(j[i].map((k) => Rho[k]));
var shifts = [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => new Uint8Array(i));
var shiftsL = idxL.map((idx, i) => idx.map((j) => shifts[i][j]));
var shiftsR = idxR.map((idx, i) => idx.map((j) => shifts[i][j]));
var Kl = new Uint32Array([0, 1518500249, 1859775393, 2400959708, 2840853838]);
var Kr = new Uint32Array([1352829926, 1548603684, 1836072691, 2053994217, 0]);
var rotl = (word, shift) => word << shift | word >>> 32 - shift;
function f(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  else if (group === 1)
    return x & y | ~x & z;
  else if (group === 2)
    return (x | ~y) ^ z;
  else if (group === 3)
    return x & z | y & ~z;
  else
    return x ^ (y | ~z);
}
var BUF = new Uint32Array(16);
var RIPEMD160 = class extends SHA2 {
  constructor() {
    super(64, 20, 8, true);
    this.h0 = 1732584193 | 0;
    this.h1 = 4023233417 | 0;
    this.h2 = 2562383102 | 0;
    this.h3 = 271733878 | 0;
    this.h4 = 3285377520 | 0;
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF[i] = view.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl[group], hbr = Kr[group];
      const rl = idxL[group], rr = idxR[group];
      const sl = shiftsL[group], sr = shiftsR[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl(al + f(group, bl, cl, dl) + BUF[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl(ar + f(rGroup, br, cr, dr) + BUF[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    BUF.fill(0);
  }
  destroy() {
    this.destroyed = true;
    this.buffer.fill(0);
    this.set(0, 0, 0, 0, 0);
  }
};
var ripemd160 = wrapConstructor(() => new RIPEMD160());

// node_modules/@noble/hashes/esm/sha256.js
var Chi = (a, b, c) => a & b ^ ~a & c;
var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
var SHA256_K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var IV = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_W = new Uint32Array(64);
var SHA256 = class extends SHA2 {
  constructor() {
    super(64, 32, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    SHA256_W.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
};
var SHA224 = class extends SHA256 {
  constructor() {
    super();
    this.A = 3238371032 | 0;
    this.B = 914150663 | 0;
    this.C = 812702999 | 0;
    this.D = 4144912697 | 0;
    this.E = 4290775857 | 0;
    this.F = 1750603025 | 0;
    this.G = 1694076839 | 0;
    this.H = 3204075428 | 0;
    this.outputLen = 28;
  }
};
var sha256 = wrapConstructor(() => new SHA256());
var sha224 = wrapConstructor(() => new SHA224());

// node_modules/@noble/hashes/esm/_u64.js
var U32_MASK64 = BigInt(2 ** 32 - 1);
var _32n = BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i = 0; i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
var shrSH = (h, l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
var rotr32H = (h, l) => l;
var rotr32L = (h, l) => h;
var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
var u64 = {
  fromBig,
  split,
  toBig,
  shrSH,
  shrSL,
  rotrSH,
  rotrSL,
  rotrBH,
  rotrBL,
  rotr32H,
  rotr32L,
  rotlSH,
  rotlSL,
  rotlBH,
  rotlBL,
  add,
  add3L,
  add3H,
  add4L,
  add4H,
  add5H,
  add5L
};
var u64_default = u64;

// node_modules/@noble/hashes/esm/sha512.js
var [SHA512_Kh, SHA512_Kl] = u64_default.split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n)));
var SHA512_W_H = new Uint32Array(80);
var SHA512_W_L = new Uint32Array(80);
var SHA512 = class extends SHA2 {
  constructor() {
    super(128, 64, 16, false);
    this.Ah = 1779033703 | 0;
    this.Al = 4089235720 | 0;
    this.Bh = 3144134277 | 0;
    this.Bl = 2227873595 | 0;
    this.Ch = 1013904242 | 0;
    this.Cl = 4271175723 | 0;
    this.Dh = 2773480762 | 0;
    this.Dl = 1595750129 | 0;
    this.Eh = 1359893119 | 0;
    this.El = 2917565137 | 0;
    this.Fh = 2600822924 | 0;
    this.Fl = 725511199 | 0;
    this.Gh = 528734635 | 0;
    this.Gl = 4215389547 | 0;
    this.Hh = 1541459225 | 0;
    this.Hl = 327033209 | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = u64_default.rotrSH(W15h, W15l, 1) ^ u64_default.rotrSH(W15h, W15l, 8) ^ u64_default.shrSH(W15h, W15l, 7);
      const s0l = u64_default.rotrSL(W15h, W15l, 1) ^ u64_default.rotrSL(W15h, W15l, 8) ^ u64_default.shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = u64_default.rotrSH(W2h, W2l, 19) ^ u64_default.rotrBH(W2h, W2l, 61) ^ u64_default.shrSH(W2h, W2l, 6);
      const s1l = u64_default.rotrSL(W2h, W2l, 19) ^ u64_default.rotrBL(W2h, W2l, 61) ^ u64_default.shrSL(W2h, W2l, 6);
      const SUMl = u64_default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = u64_default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = u64_default.rotrSH(Eh, El, 14) ^ u64_default.rotrSH(Eh, El, 18) ^ u64_default.rotrBH(Eh, El, 41);
      const sigma1l = u64_default.rotrSL(Eh, El, 14) ^ u64_default.rotrSL(Eh, El, 18) ^ u64_default.rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = u64_default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = u64_default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = u64_default.rotrSH(Ah, Al, 28) ^ u64_default.rotrBH(Ah, Al, 34) ^ u64_default.rotrBH(Ah, Al, 39);
      const sigma0l = u64_default.rotrSL(Ah, Al, 28) ^ u64_default.rotrBL(Ah, Al, 34) ^ u64_default.rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = u64_default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = u64_default.add3L(T1l, sigma0l, MAJl);
      Ah = u64_default.add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = u64_default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = u64_default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = u64_default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = u64_default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = u64_default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = u64_default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = u64_default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = u64_default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    SHA512_W_H.fill(0);
    SHA512_W_L.fill(0);
  }
  destroy() {
    this.buffer.fill(0);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var SHA512_224 = class extends SHA512 {
  constructor() {
    super();
    this.Ah = 2352822216 | 0;
    this.Al = 424955298 | 0;
    this.Bh = 1944164710 | 0;
    this.Bl = 2312950998 | 0;
    this.Ch = 502970286 | 0;
    this.Cl = 855612546 | 0;
    this.Dh = 1738396948 | 0;
    this.Dl = 1479516111 | 0;
    this.Eh = 258812777 | 0;
    this.El = 2077511080 | 0;
    this.Fh = 2011393907 | 0;
    this.Fl = 79989058 | 0;
    this.Gh = 1067287976 | 0;
    this.Gl = 1780299464 | 0;
    this.Hh = 286451373 | 0;
    this.Hl = 2446758561 | 0;
    this.outputLen = 28;
  }
};
var SHA512_256 = class extends SHA512 {
  constructor() {
    super();
    this.Ah = 573645204 | 0;
    this.Al = 4230739756 | 0;
    this.Bh = 2673172387 | 0;
    this.Bl = 3360449730 | 0;
    this.Ch = 596883563 | 0;
    this.Cl = 1867755857 | 0;
    this.Dh = 2520282905 | 0;
    this.Dl = 1497426621 | 0;
    this.Eh = 2519219938 | 0;
    this.El = 2827943907 | 0;
    this.Fh = 3193839141 | 0;
    this.Fl = 1401305490 | 0;
    this.Gh = 721525244 | 0;
    this.Gl = 746961066 | 0;
    this.Hh = 246885852 | 0;
    this.Hl = 2177182882 | 0;
    this.outputLen = 32;
  }
};
var SHA384 = class extends SHA512 {
  constructor() {
    super();
    this.Ah = 3418070365 | 0;
    this.Al = 3238371032 | 0;
    this.Bh = 1654270250 | 0;
    this.Bl = 914150663 | 0;
    this.Ch = 2438529370 | 0;
    this.Cl = 812702999 | 0;
    this.Dh = 355462360 | 0;
    this.Dl = 4144912697 | 0;
    this.Eh = 1731405415 | 0;
    this.El = 4290775857 | 0;
    this.Fh = 2394180231 | 0;
    this.Fl = 1750603025 | 0;
    this.Gh = 3675008525 | 0;
    this.Gl = 1694076839 | 0;
    this.Hh = 1203062813 | 0;
    this.Hl = 3204075428 | 0;
    this.outputLen = 48;
  }
};
var sha512 = wrapConstructor(() => new SHA512());
var sha512_224 = wrapConstructor(() => new SHA512_224());
var sha512_256 = wrapConstructor(() => new SHA512_256());
var sha384 = wrapConstructor(() => new SHA384());

// node_modules/@scure/bip32/node_modules/@noble/secp256k1/lib/esm/index.js
var nodeCrypto = __toESM(require_crypto(), 1);
var _0n = BigInt(0);
var _1n = BigInt(1);
var _2n = BigInt(2);
var _3n = BigInt(3);
var _8n = BigInt(8);
var CURVE = Object.freeze({
  a: _0n,
  b: BigInt(7),
  P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: _1n,
  Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
  Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee")
});
var divNearest = (a, b) => (a + b / _2n) / b;
var endo = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  splitScalar(k) {
    const { n } = CURVE;
    const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
    const b1 = -_1n * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
    const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
    const b2 = a1;
    const POW_2_128 = BigInt("0x100000000000000000000000000000000");
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    let k1 = mod(k - c1 * a1 - c2 * a2, n);
    let k2 = mod(-c1 * b1 - c2 * b2, n);
    const k1neg = k1 > POW_2_128;
    const k2neg = k2 > POW_2_128;
    if (k1neg)
      k1 = n - k1;
    if (k2neg)
      k2 = n - k2;
    if (k1 > POW_2_128 || k2 > POW_2_128) {
      throw new Error("splitScalarEndo: Endomorphism failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
};
var fieldLen = 32;
var groupLen = 32;
var hashLen = 32;
var compressedLen = fieldLen + 1;
var uncompressedLen = 2 * fieldLen + 1;
function weierstrass(x) {
  const { a, b } = CURVE;
  const x2 = mod(x * x);
  const x3 = mod(x2 * x);
  return mod(x3 + a * x + b);
}
var USE_ENDOMORPHISM = CURVE.a === _0n;
var ShaError = class extends Error {
  constructor(message) {
    super(message);
  }
};
function assertJacPoint(other) {
  if (!(other instanceof JacobianPoint))
    throw new TypeError("JacobianPoint expected");
}
var JacobianPoint = class _JacobianPoint {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static fromAffine(p) {
    if (!(p instanceof Point)) {
      throw new TypeError("JacobianPoint#fromAffine: expected Point");
    }
    if (p.equals(Point.ZERO))
      return _JacobianPoint.ZERO;
    return new _JacobianPoint(p.x, p.y, _1n);
  }
  static toAffineBatch(points) {
    const toInv = invertBatch(points.map((p) => p.z));
    return points.map((p, i) => p.toAffine(toInv[i]));
  }
  static normalizeZ(points) {
    return _JacobianPoint.toAffineBatch(points).map(_JacobianPoint.fromAffine);
  }
  equals(other) {
    assertJacPoint(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    const Z1Z1 = mod(Z1 * Z1);
    const Z2Z2 = mod(Z2 * Z2);
    const U1 = mod(X1 * Z2Z2);
    const U2 = mod(X2 * Z1Z1);
    const S1 = mod(mod(Y1 * Z2) * Z2Z2);
    const S2 = mod(mod(Y2 * Z1) * Z1Z1);
    return U1 === U2 && S1 === S2;
  }
  negate() {
    return new _JacobianPoint(this.x, mod(-this.y), this.z);
  }
  double() {
    const { x: X1, y: Y1, z: Z1 } = this;
    const A = mod(X1 * X1);
    const B = mod(Y1 * Y1);
    const C = mod(B * B);
    const x1b = X1 + B;
    const D = mod(_2n * (mod(x1b * x1b) - A - C));
    const E = mod(_3n * A);
    const F = mod(E * E);
    const X3 = mod(F - _2n * D);
    const Y3 = mod(E * (D - X3) - _8n * C);
    const Z3 = mod(_2n * Y1 * Z1);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  add(other) {
    assertJacPoint(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    if (X2 === _0n || Y2 === _0n)
      return this;
    if (X1 === _0n || Y1 === _0n)
      return other;
    const Z1Z1 = mod(Z1 * Z1);
    const Z2Z2 = mod(Z2 * Z2);
    const U1 = mod(X1 * Z2Z2);
    const U2 = mod(X2 * Z1Z1);
    const S1 = mod(mod(Y1 * Z2) * Z2Z2);
    const S2 = mod(mod(Y2 * Z1) * Z1Z1);
    const H = mod(U2 - U1);
    const r = mod(S2 - S1);
    if (H === _0n) {
      if (r === _0n) {
        return this.double();
      } else {
        return _JacobianPoint.ZERO;
      }
    }
    const HH = mod(H * H);
    const HHH = mod(H * HH);
    const V = mod(U1 * HH);
    const X3 = mod(r * r - HHH - _2n * V);
    const Y3 = mod(r * (V - X3) - S1 * HHH);
    const Z3 = mod(Z1 * Z2 * H);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiplyUnsafe(scalar) {
    const P0 = _JacobianPoint.ZERO;
    if (typeof scalar === "bigint" && scalar === _0n)
      return P0;
    let n = normalizeScalar(scalar);
    if (n === _1n)
      return this;
    if (!USE_ENDOMORPHISM) {
      let p = P0;
      let d2 = this;
      while (n > _0n) {
        if (n & _1n)
          p = p.add(d2);
        d2 = d2.double();
        n >>= _1n;
      }
      return p;
    }
    let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
    let k1p = P0;
    let k2p = P0;
    let d = this;
    while (k1 > _0n || k2 > _0n) {
      if (k1 & _1n)
        k1p = k1p.add(d);
      if (k2 & _1n)
        k2p = k2p.add(d);
      d = d.double();
      k1 >>= _1n;
      k2 >>= _1n;
    }
    if (k1neg)
      k1p = k1p.negate();
    if (k2neg)
      k2p = k2p.negate();
    k2p = new _JacobianPoint(mod(k2p.x * endo.beta), k2p.y, k2p.z);
    return k1p.add(k2p);
  }
  precomputeWindow(W) {
    const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
    const points = [];
    let p = this;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i = 1; i < 2 ** (W - 1); i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  wNAF(n, affinePoint) {
    if (!affinePoint && this.equals(_JacobianPoint.BASE))
      affinePoint = Point.BASE;
    const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
    if (256 % W) {
      throw new Error("Point#wNAF: Invalid precomputation window, must be power of 2");
    }
    let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
    if (!precomputes) {
      precomputes = this.precomputeWindow(W);
      if (affinePoint && W !== 1) {
        precomputes = _JacobianPoint.normalizeZ(precomputes);
        pointPrecomputes.set(affinePoint, precomputes);
      }
    }
    let p = _JacobianPoint.ZERO;
    let f2 = _JacobianPoint.BASE;
    const windows = 1 + (USE_ENDOMORPHISM ? 128 / W : 256 / W);
    const windowSize = 2 ** (W - 1);
    const mask = BigInt(2 ** W - 1);
    const maxNumber = 2 ** W;
    const shiftBy = BigInt(W);
    for (let window2 = 0; window2 < windows; window2++) {
      const offset = window2 * windowSize;
      let wbits = Number(n & mask);
      n >>= shiftBy;
      if (wbits > windowSize) {
        wbits -= maxNumber;
        n += _1n;
      }
      const offset1 = offset;
      const offset2 = offset + Math.abs(wbits) - 1;
      const cond1 = window2 % 2 !== 0;
      const cond2 = wbits < 0;
      if (wbits === 0) {
        f2 = f2.add(constTimeNegate(cond1, precomputes[offset1]));
      } else {
        p = p.add(constTimeNegate(cond2, precomputes[offset2]));
      }
    }
    return { p, f: f2 };
  }
  multiply(scalar, affinePoint) {
    let n = normalizeScalar(scalar);
    let point;
    let fake;
    if (USE_ENDOMORPHISM) {
      const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
      let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
      let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
      k1p = constTimeNegate(k1neg, k1p);
      k2p = constTimeNegate(k2neg, k2p);
      k2p = new _JacobianPoint(mod(k2p.x * endo.beta), k2p.y, k2p.z);
      point = k1p.add(k2p);
      fake = f1p.add(f2p);
    } else {
      const { p, f: f2 } = this.wNAF(n, affinePoint);
      point = p;
      fake = f2;
    }
    return _JacobianPoint.normalizeZ([point, fake])[0];
  }
  toAffine(invZ) {
    const { x, y, z } = this;
    const is0 = this.equals(_JacobianPoint.ZERO);
    if (invZ == null)
      invZ = is0 ? _8n : invert(z);
    const iz1 = invZ;
    const iz2 = mod(iz1 * iz1);
    const iz3 = mod(iz2 * iz1);
    const ax = mod(x * iz2);
    const ay = mod(y * iz3);
    const zz = mod(z * iz1);
    if (is0)
      return Point.ZERO;
    if (zz !== _1n)
      throw new Error("invZ was invalid");
    return new Point(ax, ay);
  }
};
JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1n);
JacobianPoint.ZERO = new JacobianPoint(_0n, _1n, _0n);
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var Point = class _Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  _setWindowSize(windowSize) {
    this._WINDOW_SIZE = windowSize;
    pointPrecomputes.delete(this);
  }
  hasEvenY() {
    return this.y % _2n === _0n;
  }
  static fromCompressedHex(bytes2) {
    const isShort = bytes2.length === 32;
    const x = bytesToNumber(isShort ? bytes2 : bytes2.subarray(1));
    if (!isValidFieldElement(x))
      throw new Error("Point is not on curve");
    const y2 = weierstrass(x);
    let y = sqrtMod(y2);
    const isYOdd = (y & _1n) === _1n;
    if (isShort) {
      if (isYOdd)
        y = mod(-y);
    } else {
      const isFirstByteOdd = (bytes2[0] & 1) === 1;
      if (isFirstByteOdd !== isYOdd)
        y = mod(-y);
    }
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromUncompressedHex(bytes2) {
    const x = bytesToNumber(bytes2.subarray(1, fieldLen + 1));
    const y = bytesToNumber(bytes2.subarray(fieldLen + 1, fieldLen * 2 + 1));
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromHex(hex) {
    const bytes2 = ensureBytes(hex);
    const len = bytes2.length;
    const header = bytes2[0];
    if (len === fieldLen)
      return this.fromCompressedHex(bytes2);
    if (len === compressedLen && (header === 2 || header === 3)) {
      return this.fromCompressedHex(bytes2);
    }
    if (len === uncompressedLen && header === 4)
      return this.fromUncompressedHex(bytes2);
    throw new Error(`Point.fromHex: received invalid point. Expected 32-${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes, not ${len}`);
  }
  static fromPrivateKey(privateKey) {
    return _Point.BASE.multiply(normalizePrivateKey(privateKey));
  }
  static fromSignature(msgHash, signature, recovery) {
    const { r, s } = normalizeSignature(signature);
    if (![0, 1, 2, 3].includes(recovery))
      throw new Error("Cannot recover: invalid recovery bit");
    const h = truncateHash(ensureBytes(msgHash));
    const { n } = CURVE;
    const radj = recovery === 2 || recovery === 3 ? r + n : r;
    const rinv = invert(radj, n);
    const u1 = mod(-h * rinv, n);
    const u2 = mod(s * rinv, n);
    const prefix = recovery & 1 ? "03" : "02";
    const R = _Point.fromHex(prefix + numTo32bStr(radj));
    const Q = _Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
    if (!Q)
      throw new Error("Cannot recover signature: point at infinify");
    Q.assertValidity();
    return Q;
  }
  toRawBytes(isCompressed = false) {
    return hexToBytes2(this.toHex(isCompressed));
  }
  toHex(isCompressed = false) {
    const x = numTo32bStr(this.x);
    if (isCompressed) {
      const prefix = this.hasEvenY() ? "02" : "03";
      return `${prefix}${x}`;
    } else {
      return `04${x}${numTo32bStr(this.y)}`;
    }
  }
  toHexX() {
    return this.toHex(true).slice(2);
  }
  toRawX() {
    return this.toRawBytes(true).slice(1);
  }
  assertValidity() {
    const msg = "Point is not on elliptic curve";
    const { x, y } = this;
    if (!isValidFieldElement(x) || !isValidFieldElement(y))
      throw new Error(msg);
    const left = mod(y * y);
    const right = weierstrass(x);
    if (mod(left - right) !== _0n)
      throw new Error(msg);
  }
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
  negate() {
    return new _Point(this.x, mod(-this.y));
  }
  double() {
    return JacobianPoint.fromAffine(this).double().toAffine();
  }
  add(other) {
    return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiply(scalar) {
    return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
  }
  multiplyAndAddUnsafe(Q, a, b) {
    const P = JacobianPoint.fromAffine(this);
    const aP = a === _0n || a === _1n || this !== _Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
    const bQ = JacobianPoint.fromAffine(Q).multiplyUnsafe(b);
    const sum = aP.add(bQ);
    return sum.equals(JacobianPoint.ZERO) ? void 0 : sum.toAffine();
  }
};
Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
Point.ZERO = new Point(_0n, _0n);
function sliceDER(s) {
  return Number.parseInt(s[0], 16) >= 8 ? "00" + s : s;
}
function parseDERInt(data) {
  if (data.length < 2 || data[0] !== 2) {
    throw new Error(`Invalid signature integer tag: ${bytesToHex2(data)}`);
  }
  const len = data[1];
  const res = data.subarray(2, len + 2);
  if (!len || res.length !== len) {
    throw new Error(`Invalid signature integer: wrong length`);
  }
  if (res[0] === 0 && res[1] <= 127) {
    throw new Error("Invalid signature integer: trailing length");
  }
  return { data: bytesToNumber(res), left: data.subarray(len + 2) };
}
function parseDERSignature(data) {
  if (data.length < 2 || data[0] != 48) {
    throw new Error(`Invalid signature tag: ${bytesToHex2(data)}`);
  }
  if (data[1] !== data.length - 2) {
    throw new Error("Invalid signature: incorrect length");
  }
  const { data: r, left: sBytes } = parseDERInt(data.subarray(2));
  const { data: s, left: rBytesLeft } = parseDERInt(sBytes);
  if (rBytesLeft.length) {
    throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex2(rBytesLeft)}`);
  }
  return { r, s };
}
var Signature = class _Signature {
  constructor(r, s) {
    this.r = r;
    this.s = s;
    this.assertValidity();
  }
  static fromCompact(hex) {
    const arr = isBytes(hex);
    const name = "Signature.fromCompact";
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`${name}: Expected string or Uint8Array`);
    const str = arr ? bytesToHex2(hex) : hex;
    if (str.length !== 128)
      throw new Error(`${name}: Expected 64-byte hex`);
    return new _Signature(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
  }
  static fromDER(hex) {
    const arr = isBytes(hex);
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
    const { r, s } = parseDERSignature(arr ? hex : hexToBytes2(hex));
    return new _Signature(r, s);
  }
  static fromHex(hex) {
    return this.fromDER(hex);
  }
  assertValidity() {
    const { r, s } = this;
    if (!isWithinCurveOrder(r))
      throw new Error("Invalid Signature: r must be 0 < r < n");
    if (!isWithinCurveOrder(s))
      throw new Error("Invalid Signature: s must be 0 < s < n");
  }
  hasHighS() {
    const HALF = CURVE.n >> _1n;
    return this.s > HALF;
  }
  normalizeS() {
    return this.hasHighS() ? new _Signature(this.r, mod(-this.s, CURVE.n)) : this;
  }
  toDERRawBytes() {
    return hexToBytes2(this.toDERHex());
  }
  toDERHex() {
    const sHex = sliceDER(numberToHexUnpadded(this.s));
    const rHex = sliceDER(numberToHexUnpadded(this.r));
    const sHexL = sHex.length / 2;
    const rHexL = rHex.length / 2;
    const sLen = numberToHexUnpadded(sHexL);
    const rLen = numberToHexUnpadded(rHexL);
    const length = numberToHexUnpadded(rHexL + sHexL + 4);
    return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
  }
  toRawBytes() {
    return this.toDERRawBytes();
  }
  toHex() {
    return this.toDERHex();
  }
  toCompactRawBytes() {
    return hexToBytes2(this.toCompactHex());
  }
  toCompactHex() {
    return numTo32bStr(this.r) + numTo32bStr(this.s);
  }
};
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(item) {
  if (!isBytes(item))
    throw new Error("Uint8Array expected");
}
function concatBytes2(...arrays) {
  arrays.every(abytes);
  if (arrays.length === 1)
    return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
var hexes2 = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex2(bytes2) {
  abytes(bytes2);
  let hex = "";
  for (let i = 0; i < bytes2.length; i++) {
    hex += hexes2[bytes2[i]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
var POW_2_256 = BigInt("0x10000000000000000000000000000000000000000000000000000000000000000");
function numTo32bStr(num) {
  if (typeof num !== "bigint")
    throw new Error("Expected bigint");
  if (!(_0n <= num && num < POW_2_256))
    throw new Error("Expected number 0 <= n < 2^256");
  return num.toString(16).padStart(64, "0");
}
function numTo32b(num) {
  const b = hexToBytes2(numTo32bStr(num));
  if (b.length !== 32)
    throw new Error("Error: expected 32 bytes");
  return b;
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToNumber: expected string, got " + typeof hex);
  }
  return BigInt(`0x${hex}`);
}
function bytesToNumber(bytes2) {
  return hexToNumber(bytesToHex2(bytes2));
}
function ensureBytes(hex) {
  return isBytes(hex) ? Uint8Array.from(hex) : hexToBytes2(hex);
}
function normalizeScalar(num) {
  if (typeof num === "number" && Number.isSafeInteger(num) && num > 0)
    return BigInt(num);
  if (typeof num === "bigint" && isWithinCurveOrder(num))
    return num;
  throw new TypeError("Expected valid private scalar: 0 < scalar < curve.n");
}
function mod(a, b = CURVE.P) {
  const result = a % b;
  return result >= _0n ? result : b + result;
}
function pow2(x, power) {
  const { P } = CURVE;
  let res = x;
  while (power-- > _0n) {
    res *= res;
    res %= P;
  }
  return res;
}
function sqrtMod(x) {
  const { P } = CURVE;
  const _6n = BigInt(6);
  const _11n = BigInt(11);
  const _22n = BigInt(22);
  const _23n = BigInt(23);
  const _44n = BigInt(44);
  const _88n = BigInt(88);
  const b2 = x * x * x % P;
  const b3 = b2 * b2 * x % P;
  const b6 = pow2(b3, _3n) * b3 % P;
  const b9 = pow2(b6, _3n) * b3 % P;
  const b11 = pow2(b9, _2n) * b2 % P;
  const b22 = pow2(b11, _11n) * b11 % P;
  const b44 = pow2(b22, _22n) * b22 % P;
  const b88 = pow2(b44, _44n) * b44 % P;
  const b176 = pow2(b88, _88n) * b88 % P;
  const b220 = pow2(b176, _44n) * b44 % P;
  const b223 = pow2(b220, _3n) * b3 % P;
  const t1 = pow2(b223, _23n) * b22 % P;
  const t2 = pow2(t1, _6n) * b2 % P;
  const rt = pow2(t2, _2n);
  const xc = rt * rt % P;
  if (xc !== x)
    throw new Error("Cannot find square root");
  return rt;
}
function invert(number2, modulo = CURVE.P) {
  if (number2 === _0n || modulo <= _0n) {
    throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
  }
  let a = mod(number2, modulo);
  let b = modulo;
  let x = _0n, y = _1n, u = _1n, v = _0n;
  while (a !== _0n) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function invertBatch(nums, p = CURVE.P) {
  const scratch = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (num === _0n)
      return acc;
    scratch[i] = acc;
    return mod(acc * num, p);
  }, _1n);
  const inverted = invert(lastMultiplied, p);
  nums.reduceRight((acc, num, i) => {
    if (num === _0n)
      return acc;
    scratch[i] = mod(acc * scratch[i], p);
    return mod(acc * num, p);
  }, inverted);
  return scratch;
}
function bits2int_2(bytes2) {
  const delta = bytes2.length * 8 - groupLen * 8;
  const num = bytesToNumber(bytes2);
  return delta > 0 ? num >> BigInt(delta) : num;
}
function truncateHash(hash2, truncateOnly = false) {
  const h = bits2int_2(hash2);
  if (truncateOnly)
    return h;
  const { n } = CURVE;
  return h >= n ? h - n : h;
}
var _sha256Sync;
var _hmacSha256Sync;
var HmacDrbg = class {
  constructor(hashLen3, qByteLen) {
    this.hashLen = hashLen3;
    this.qByteLen = qByteLen;
    if (typeof hashLen3 !== "number" || hashLen3 < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    this.v = new Uint8Array(hashLen3).fill(1);
    this.k = new Uint8Array(hashLen3).fill(0);
    this.counter = 0;
  }
  hmac(...values) {
    return utils.hmacSha256(this.k, ...values);
  }
  hmacSync(...values) {
    return _hmacSha256Sync(this.k, ...values);
  }
  checkSync() {
    if (typeof _hmacSha256Sync !== "function")
      throw new ShaError("hmacSha256Sync needs to be set");
  }
  incr() {
    if (this.counter >= 1e3)
      throw new Error("Tried 1,000 k values for sign(), all were invalid");
    this.counter += 1;
  }
  async reseed(seed = new Uint8Array()) {
    this.k = await this.hmac(this.v, Uint8Array.from([0]), seed);
    this.v = await this.hmac(this.v);
    if (seed.length === 0)
      return;
    this.k = await this.hmac(this.v, Uint8Array.from([1]), seed);
    this.v = await this.hmac(this.v);
  }
  reseedSync(seed = new Uint8Array()) {
    this.checkSync();
    this.k = this.hmacSync(this.v, Uint8Array.from([0]), seed);
    this.v = this.hmacSync(this.v);
    if (seed.length === 0)
      return;
    this.k = this.hmacSync(this.v, Uint8Array.from([1]), seed);
    this.v = this.hmacSync(this.v);
  }
  async generate() {
    this.incr();
    let len = 0;
    const out = [];
    while (len < this.qByteLen) {
      this.v = await this.hmac(this.v);
      const sl = this.v.slice();
      out.push(sl);
      len += this.v.length;
    }
    return concatBytes2(...out);
  }
  generateSync() {
    this.checkSync();
    this.incr();
    let len = 0;
    const out = [];
    while (len < this.qByteLen) {
      this.v = this.hmacSync(this.v);
      const sl = this.v.slice();
      out.push(sl);
      len += this.v.length;
    }
    return concatBytes2(...out);
  }
};
function isWithinCurveOrder(num) {
  return _0n < num && num < CURVE.n;
}
function isValidFieldElement(num) {
  return _0n < num && num < CURVE.P;
}
function kmdToSig(kBytes, m, d, lowS = true) {
  const { n } = CURVE;
  const k = truncateHash(kBytes, true);
  if (!isWithinCurveOrder(k))
    return;
  const kinv = invert(k, n);
  const q = Point.BASE.multiply(k);
  const r = mod(q.x, n);
  if (r === _0n)
    return;
  const s = mod(kinv * mod(m + d * r, n), n);
  if (s === _0n)
    return;
  let sig = new Signature(r, s);
  let recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n);
  if (lowS && sig.hasHighS()) {
    sig = sig.normalizeS();
    recovery ^= 1;
  }
  return { sig, recovery };
}
function normalizePrivateKey(key) {
  let num;
  if (typeof key === "bigint") {
    num = key;
  } else if (typeof key === "number" && Number.isSafeInteger(key) && key > 0) {
    num = BigInt(key);
  } else if (typeof key === "string") {
    if (key.length !== 2 * groupLen)
      throw new Error("Expected 32 bytes of private key");
    num = hexToNumber(key);
  } else if (isBytes(key)) {
    if (key.length !== groupLen)
      throw new Error("Expected 32 bytes of private key");
    num = bytesToNumber(key);
  } else {
    throw new TypeError("Expected valid private key");
  }
  if (!isWithinCurveOrder(num))
    throw new Error("Expected private key: 0 < key < n");
  return num;
}
function normalizePublicKey(publicKey) {
  if (publicKey instanceof Point) {
    publicKey.assertValidity();
    return publicKey;
  } else {
    return Point.fromHex(publicKey);
  }
}
function normalizeSignature(signature) {
  if (signature instanceof Signature) {
    signature.assertValidity();
    return signature;
  }
  try {
    return Signature.fromDER(signature);
  } catch (error) {
    return Signature.fromCompact(signature);
  }
}
function getPublicKey(privateKey, isCompressed = false) {
  return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
}
function bits2int(bytes2) {
  const slice = bytes2.length > fieldLen ? bytes2.slice(0, fieldLen) : bytes2;
  return bytesToNumber(slice);
}
function bits2octets(bytes2) {
  const z1 = bits2int(bytes2);
  const z2 = mod(z1, CURVE.n);
  return int2octets(z2 < _0n ? z1 : z2);
}
function int2octets(num) {
  return numTo32b(num);
}
function initSigArgs(msgHash, privateKey, extraEntropy) {
  if (msgHash == null)
    throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
  const h1 = ensureBytes(msgHash);
  const d = normalizePrivateKey(privateKey);
  const seedArgs = [int2octets(d), bits2octets(h1)];
  if (extraEntropy != null) {
    if (extraEntropy === true)
      extraEntropy = utils.randomBytes(fieldLen);
    const e = ensureBytes(extraEntropy);
    if (e.length !== fieldLen)
      throw new Error(`sign: Expected ${fieldLen} bytes of extra data`);
    seedArgs.push(e);
  }
  const seed = concatBytes2(...seedArgs);
  const m = bits2int(h1);
  return { seed, m, d };
}
function finalizeSig(recSig, opts) {
  const { sig, recovery } = recSig;
  const { der, recovered } = Object.assign({ canonical: true, der: true }, opts);
  const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
  return recovered ? [hashed, recovery] : hashed;
}
function signSync(msgHash, privKey, opts = {}) {
  const { seed, m, d } = initSigArgs(msgHash, privKey, opts.extraEntropy);
  const drbg = new HmacDrbg(hashLen, groupLen);
  drbg.reseedSync(seed);
  let sig;
  while (!(sig = kmdToSig(drbg.generateSync(), m, d, opts.canonical)))
    drbg.reseedSync();
  return finalizeSig(sig, opts);
}
var vopts = { strict: true };
function verify(signature, msgHash, publicKey, opts = vopts) {
  let sig;
  try {
    sig = normalizeSignature(signature);
    msgHash = ensureBytes(msgHash);
  } catch (error) {
    return false;
  }
  const { r, s } = sig;
  if (opts.strict && sig.hasHighS())
    return false;
  const h = truncateHash(msgHash);
  let P;
  try {
    P = normalizePublicKey(publicKey);
  } catch (error) {
    return false;
  }
  const { n } = CURVE;
  const sinv = invert(s, n);
  const u1 = mod(h * sinv, n);
  const u2 = mod(r * sinv, n);
  const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2);
  if (!R)
    return false;
  const v = mod(R.x, n);
  return v === r;
}
Point.BASE._setWindowSize(8);
var crypto3 = {
  node: nodeCrypto,
  web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
};
var TAGGED_HASH_PREFIXES = {};
var utils = {
  bytesToHex: bytesToHex2,
  hexToBytes: hexToBytes2,
  concatBytes: concatBytes2,
  mod,
  invert,
  isValidPrivateKey(privateKey) {
    try {
      normalizePrivateKey(privateKey);
      return true;
    } catch (error) {
      return false;
    }
  },
  _bigintTo32Bytes: numTo32b,
  _normalizePrivateKey: normalizePrivateKey,
  hashToPrivateKey: (hash2) => {
    hash2 = ensureBytes(hash2);
    const minLen = groupLen + 8;
    if (hash2.length < minLen || hash2.length > 1024) {
      throw new Error(`Expected valid bytes of private key as per FIPS 186`);
    }
    const num = mod(bytesToNumber(hash2), CURVE.n - _1n) + _1n;
    return numTo32b(num);
  },
  randomBytes: (bytesLength = 32) => {
    if (crypto3.web) {
      return crypto3.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto3.node) {
      const { randomBytes: randomBytes2 } = crypto3.node;
      return Uint8Array.from(randomBytes2(bytesLength));
    } else {
      throw new Error("The environment doesn't have randomBytes function");
    }
  },
  randomPrivateKey: () => utils.hashToPrivateKey(utils.randomBytes(groupLen + 8)),
  precompute(windowSize = 8, point = Point.BASE) {
    const cached = point === Point.BASE ? point : new Point(point.x, point.y);
    cached._setWindowSize(windowSize);
    cached.multiply(_3n);
    return cached;
  },
  sha256: async (...messages) => {
    if (crypto3.web) {
      const buffer = await crypto3.web.subtle.digest("SHA-256", concatBytes2(...messages));
      return new Uint8Array(buffer);
    } else if (crypto3.node) {
      const { createHash } = crypto3.node;
      const hash2 = createHash("sha256");
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have sha256 function");
    }
  },
  hmacSha256: async (key, ...messages) => {
    if (crypto3.web) {
      const ckey = await crypto3.web.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
      const message = concatBytes2(...messages);
      const buffer = await crypto3.web.subtle.sign("HMAC", ckey, message);
      return new Uint8Array(buffer);
    } else if (crypto3.node) {
      const { createHmac } = crypto3.node;
      const hash2 = createHmac("sha256", key);
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have hmac-sha256 function");
    }
  },
  sha256Sync: void 0,
  hmacSha256Sync: void 0,
  taggedHash: async (tag, ...messages) => {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === void 0) {
      const tagH = await utils.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes2(tagH, tagH);
      TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return utils.sha256(tagP, ...messages);
  },
  taggedHashSync: (tag, ...messages) => {
    if (typeof _sha256Sync !== "function")
      throw new ShaError("sha256Sync is undefined, you need to set it");
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === void 0) {
      const tagH = _sha256Sync(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes2(tagH, tagH);
      TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return _sha256Sync(tagP, ...messages);
  },
  _JacobianPoint: JacobianPoint
};
Object.defineProperties(utils, {
  sha256Sync: {
    configurable: false,
    get() {
      return _sha256Sync;
    },
    set(val) {
      if (!_sha256Sync)
        _sha256Sync = val;
    }
  },
  hmacSha256Sync: {
    configurable: false,
    get() {
      return _hmacSha256Sync;
    },
    set(val) {
      if (!_hmacSha256Sync)
        _hmacSha256Sync = val;
    }
  }
});

// node_modules/@scure/bip32/node_modules/@scure/base/lib/esm/index.js
// @__NO_SIDE_EFFECTS__
function assertNumber(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`Wrong integer: ${n}`);
}
function isBytes2(a) {
  return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
}
// @__NO_SIDE_EFFECTS__
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode = args.map((x) => x.decode).reduce(wrap, id);
  return { encode, decode };
}
// @__NO_SIDE_EFFECTS__
function alphabet(alphabet2) {
  return {
    encode: (digits) => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
        throw new Error("alphabet.encode input should be an array of numbers");
      return digits.map((i) => {
        /* @__PURE__ */ assertNumber(i);
        if (i < 0 || i >= alphabet2.length)
          throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet2.length})`);
        return alphabet2[i];
      });
    },
    decode: (input) => {
      if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
        throw new Error("alphabet.decode input should be array of strings");
      return input.map((letter) => {
        if (typeof letter !== "string")
          throw new Error(`alphabet.decode: not string element=${letter}`);
        const index = alphabet2.indexOf(letter);
        if (index === -1)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet2}`);
        return index;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join(separator = "") {
  if (typeof separator !== "string")
    throw new Error("join separator should be string");
  return {
    encode: (from) => {
      if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
        throw new Error("join.encode input should be array of strings");
      for (let i of from)
        if (typeof i !== "string")
          throw new Error(`join.encode: non-string input=${i}`);
      return from.join(separator);
    },
    decode: (to) => {
      if (typeof to !== "string")
        throw new Error("join.decode input should be string");
      return to.split(separator);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function convertRadix(data, from, to) {
  if (from < 2)
    throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
  if (to < 2)
    throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
  if (!Array.isArray(data))
    throw new Error("convertRadix: data should be array");
  if (!data.length)
    return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data);
  digits.forEach((d) => {
    /* @__PURE__ */ assertNumber(d);
    if (d < 0 || d >= from)
      throw new Error(`Wrong integer: ${d}`);
  });
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < digits.length; i++) {
      const digit = digits[i];
      const digitBase = from * carry + digit;
      if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
        throw new Error("convertRadix: carry overflow");
      }
      carry = digitBase % to;
      const rounded = Math.floor(digitBase / to);
      digits[i] = rounded;
      if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
        throw new Error("convertRadix: carry overflow");
      if (!done)
        continue;
      else if (!rounded)
        pos = i;
      else
        done = false;
    }
    res.push(carry);
    if (done)
      break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
    res.push(0);
  return res.reverse();
}
// @__NO_SIDE_EFFECTS__
function radix(num) {
  /* @__PURE__ */ assertNumber(num);
  return {
    encode: (bytes2) => {
      if (!isBytes2(bytes2))
        throw new Error("radix.encode input should be Uint8Array");
      return /* @__PURE__ */ convertRadix(Array.from(bytes2), 2 ** 8, num);
    },
    decode: (digits) => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
        throw new Error("radix.decode input should be array of numbers");
      return Uint8Array.from(/* @__PURE__ */ convertRadix(digits, num, 2 ** 8));
    }
  };
}
// @__NO_SIDE_EFFECTS__
function checksum(len, fn) {
  /* @__PURE__ */ assertNumber(len);
  if (typeof fn !== "function")
    throw new Error("checksum fn should be function");
  return {
    encode(data) {
      if (!isBytes2(data))
        throw new Error("checksum.encode: input should be Uint8Array");
      const checksum2 = fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(checksum2, data.length);
      return res;
    },
    decode(data) {
      if (!isBytes2(data))
        throw new Error("checksum.decode: input should be Uint8Array");
      const payload = data.slice(0, -len);
      const newChecksum = fn(payload).slice(0, len);
      const oldChecksum = data.slice(-len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
var genBase58 = (abc) => /* @__PURE__ */ chain(/* @__PURE__ */ radix(58), /* @__PURE__ */ alphabet(abc), /* @__PURE__ */ join(""));
var base58 = /* @__PURE__ */ genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
var createBase58check = (sha2562) => /* @__PURE__ */ chain(/* @__PURE__ */ checksum(4, (data) => sha2562(sha2562(data))), base58);
var base58check = createBase58check;

// node_modules/@scure/bip32/lib/esm/index.js
utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, utils.concatBytes(...msgs));
var base58check2 = base58check(sha256);
function bytesToNumber2(bytes2) {
  return BigInt(`0x${bytesToHex(bytes2)}`);
}
function numberToBytes(num) {
  return hexToBytes(num.toString(16).padStart(64, "0"));
}
var MASTER_SECRET = utf8ToBytes("Bitcoin seed");
var BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
var HARDENED_OFFSET = 2147483648;
var hash160 = (data) => ripemd160(sha256(data));
var fromU32 = (data) => createView(data).getUint32(0, false);
var toU32 = (n) => {
  if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1) {
    throw new Error(`Invalid number=${n}. Should be from 0 to 2 ** 32 - 1`);
  }
  const buf = new Uint8Array(4);
  createView(buf).setUint32(0, n, false);
  return buf;
};
var HDKey = class _HDKey {
  constructor(opt) {
    this.depth = 0;
    this.index = 0;
    this.chainCode = null;
    this.parentFingerprint = 0;
    if (!opt || typeof opt !== "object") {
      throw new Error("HDKey.constructor must not be called directly");
    }
    this.versions = opt.versions || BITCOIN_VERSIONS;
    this.depth = opt.depth || 0;
    this.chainCode = opt.chainCode;
    this.index = opt.index || 0;
    this.parentFingerprint = opt.parentFingerprint || 0;
    if (!this.depth) {
      if (this.parentFingerprint || this.index) {
        throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
      }
    }
    if (opt.publicKey && opt.privateKey) {
      throw new Error("HDKey: publicKey and privateKey at same time.");
    }
    if (opt.privateKey) {
      if (!utils.isValidPrivateKey(opt.privateKey)) {
        throw new Error("Invalid private key");
      }
      this.privKey = typeof opt.privateKey === "bigint" ? opt.privateKey : bytesToNumber2(opt.privateKey);
      this.privKeyBytes = numberToBytes(this.privKey);
      this.pubKey = getPublicKey(opt.privateKey, true);
    } else if (opt.publicKey) {
      this.pubKey = Point.fromHex(opt.publicKey).toRawBytes(true);
    } else {
      throw new Error("HDKey: no public or private key provided");
    }
    this.pubHash = hash160(this.pubKey);
  }
  get fingerprint() {
    if (!this.pubHash) {
      throw new Error("No publicKey set!");
    }
    return fromU32(this.pubHash);
  }
  get identifier() {
    return this.pubHash;
  }
  get pubKeyHash() {
    return this.pubHash;
  }
  get privateKey() {
    return this.privKeyBytes || null;
  }
  get publicKey() {
    return this.pubKey || null;
  }
  get privateExtendedKey() {
    const priv = this.privateKey;
    if (!priv) {
      throw new Error("No private key");
    }
    return base58check2.encode(this.serialize(this.versions.private, concatBytes(new Uint8Array([0]), priv)));
  }
  get publicExtendedKey() {
    if (!this.pubKey) {
      throw new Error("No public key");
    }
    return base58check2.encode(this.serialize(this.versions.public, this.pubKey));
  }
  static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
    bytes(seed);
    if (8 * seed.length < 128 || 8 * seed.length > 512) {
      throw new Error(`HDKey: wrong seed length=${seed.length}. Should be between 128 and 512 bits; 256 bits is advised)`);
    }
    const I = hmac(sha512, MASTER_SECRET, seed);
    return new _HDKey({
      versions,
      chainCode: I.slice(32),
      privateKey: I.slice(0, 32)
    });
  }
  static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
    const keyBuffer = base58check2.decode(base58key);
    const keyView = createView(keyBuffer);
    const version = keyView.getUint32(0, false);
    const opt = {
      versions,
      depth: keyBuffer[4],
      parentFingerprint: keyView.getUint32(5, false),
      index: keyView.getUint32(9, false),
      chainCode: keyBuffer.slice(13, 45)
    };
    const key = keyBuffer.slice(45);
    const isPriv = key[0] === 0;
    if (version !== versions[isPriv ? "private" : "public"]) {
      throw new Error("Version mismatch");
    }
    if (isPriv) {
      return new _HDKey({ ...opt, privateKey: key.slice(1) });
    } else {
      return new _HDKey({ ...opt, publicKey: key });
    }
  }
  static fromJSON(json) {
    return _HDKey.fromExtendedKey(json.xpriv);
  }
  derive(path) {
    if (!/^[mM]'?/.test(path)) {
      throw new Error('Path must start with "m" or "M"');
    }
    if (/^[mM]'?$/.test(path)) {
      return this;
    }
    const parts = path.replace(/^[mM]'?\//, "").split("/");
    let child = this;
    for (const c of parts) {
      const m = /^(\d+)('?)$/.exec(c);
      if (!m || m.length !== 3) {
        throw new Error(`Invalid child index: ${c}`);
      }
      let idx = +m[1];
      if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
        throw new Error("Invalid index");
      }
      if (m[2] === "'") {
        idx += HARDENED_OFFSET;
      }
      child = child.deriveChild(idx);
    }
    return child;
  }
  deriveChild(index) {
    if (!this.pubKey || !this.chainCode) {
      throw new Error("No publicKey or chainCode set");
    }
    let data = toU32(index);
    if (index >= HARDENED_OFFSET) {
      const priv = this.privateKey;
      if (!priv) {
        throw new Error("Could not derive hardened child key");
      }
      data = concatBytes(new Uint8Array([0]), priv, data);
    } else {
      data = concatBytes(this.pubKey, data);
    }
    const I = hmac(sha512, this.chainCode, data);
    const childTweak = bytesToNumber2(I.slice(0, 32));
    const chainCode = I.slice(32);
    if (!utils.isValidPrivateKey(childTweak)) {
      throw new Error("Tweak bigger than curve order");
    }
    const opt = {
      versions: this.versions,
      chainCode,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    };
    try {
      if (this.privateKey) {
        const added = utils.mod(this.privKey + childTweak, CURVE.n);
        if (!utils.isValidPrivateKey(added)) {
          throw new Error("The tweak was out of range or the resulted private key is invalid");
        }
        opt.privateKey = added;
      } else {
        const added = Point.fromHex(this.pubKey).add(Point.fromPrivateKey(childTweak));
        if (added.equals(Point.ZERO)) {
          throw new Error("The tweak was equal to negative P, which made the result key invalid");
        }
        opt.publicKey = added.toRawBytes(true);
      }
      return new _HDKey(opt);
    } catch (err) {
      return this.deriveChild(index + 1);
    }
  }
  sign(hash2) {
    if (!this.privateKey) {
      throw new Error("No privateKey set!");
    }
    bytes(hash2, 32);
    return signSync(hash2, this.privKey, {
      canonical: true,
      der: false
    });
  }
  verify(hash2, signature) {
    bytes(hash2, 32);
    bytes(signature, 64);
    if (!this.publicKey) {
      throw new Error("No publicKey set!");
    }
    let sig;
    try {
      sig = Signature.fromCompact(signature);
    } catch (error) {
      return false;
    }
    return verify(sig, hash2, this.publicKey);
  }
  wipePrivateData() {
    this.privKey = void 0;
    if (this.privKeyBytes) {
      this.privKeyBytes.fill(0);
      this.privKeyBytes = void 0;
    }
    return this;
  }
  toJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey
    };
  }
  serialize(version, key) {
    if (!this.chainCode) {
      throw new Error("No chainCode set");
    }
    bytes(key, 33);
    return concatBytes(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
  }
};

// node_modules/@stacks/common/dist/esm/config.js
var config = {
  network: {
    layer1: "placeholder"
  },
  logLevel: "debug"
};

// node_modules/@stacks/common/dist/esm/errors.js
var ERROR_CODES = {
  MISSING_PARAMETER: "missing_parameter",
  REMOTE_SERVICE_ERROR: "remote_service_error",
  INVALID_STATE: "invalid_state",
  NO_SESSION_DATA: "no_session_data",
  DOES_NOT_EXIST: "does_not_exist",
  FAILED_DECRYPTION_ERROR: "failed_decryption_error",
  INVALID_DID_ERROR: "invalid_did_error",
  NOT_ENOUGH_FUNDS_ERROR: "not_enough_error",
  INVALID_AMOUNT_ERROR: "invalid_amount_error",
  LOGIN_FAILED_ERROR: "login_failed",
  SIGNATURE_VERIFICATION_ERROR: "signature_verification_failure",
  CONFLICT_ERROR: "conflict_error",
  NOT_ENOUGH_PROOF_ERROR: "not_enough_proof_error",
  BAD_PATH_ERROR: "bad_path_error",
  VALIDATION_ERROR: "validation_error",
  PAYLOAD_TOO_LARGE_ERROR: "payload_too_large_error",
  PRECONDITION_FAILED_ERROR: "precondition_failed_error",
  UNKNOWN: "unknown"
};
Object.freeze(ERROR_CODES);
var BlockstackError = class extends Error {
  constructor(error) {
    super();
    let message = error.message;
    let bugDetails = `Error Code: ${error.code}`;
    let stack = this.stack;
    if (!stack) {
      try {
        throw new Error();
      } catch (e) {
        stack = e.stack;
      }
    } else {
      bugDetails += `Stack Trace:
${stack}`;
    }
    message += `
If you believe this exception is caused by a bug in stacks.js,
      please file a bug report: https://github.com/blockstack/stacks.js/issues

${bugDetails}`;
    this.message = message;
    this.code = error.code;
    this.parameter = error.parameter ? error.parameter : void 0;
  }
  toString() {
    return `${super.toString()}
    code: ${this.code} param: ${this.parameter ? this.parameter : "n/a"}`;
  }
};
var FailedDecryptionError = class extends BlockstackError {
  constructor(message = "Unable to decrypt cipher object.") {
    super({ code: ERROR_CODES.FAILED_DECRYPTION_ERROR, message });
    this.message = message;
    this.name = "FailedDecryptionError";
  }
};
var GaiaHubError = class extends BlockstackError {
  constructor(error, response) {
    super(error);
    if (response) {
      this.hubError = {
        statusCode: response.status,
        statusText: response.statusText
      };
      if (typeof response.body === "string") {
        this.hubError.message = response.body;
      } else if (typeof response.body === "object") {
        Object.assign(this.hubError, response.body);
      }
    }
  }
};
var DoesNotExist = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.DOES_NOT_EXIST }, response);
    this.name = "DoesNotExist";
  }
};
var ConflictError = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.CONFLICT_ERROR }, response);
    this.name = "ConflictError";
  }
};
var NotEnoughProofError = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.NOT_ENOUGH_PROOF_ERROR }, response);
    this.name = "NotEnoughProofError";
  }
};
var BadPathError = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.BAD_PATH_ERROR }, response);
    this.name = "BadPathError";
  }
};
var ValidationError = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.VALIDATION_ERROR }, response);
    this.name = "ValidationError";
  }
};
var PayloadTooLargeError = class extends GaiaHubError {
  constructor(message, response, maxUploadByteSize) {
    super({ message, code: ERROR_CODES.PAYLOAD_TOO_LARGE_ERROR }, response);
    this.name = "PayloadTooLargeError";
    this.maxUploadByteSize = maxUploadByteSize;
  }
};
var PreconditionFailedError = class extends GaiaHubError {
  constructor(message, response) {
    super({ message, code: ERROR_CODES.PRECONDITION_FAILED_ERROR }, response);
    this.name = "PreconditionFailedError";
  }
};

// node_modules/@stacks/common/dist/esm/logger.js
var levels = ["debug", "info", "warn", "error", "none"];
var levelToInt = {};
var intToLevel = {};
for (let index = 0; index < levels.length; index++) {
  const level = levels[index];
  levelToInt[level] = index;
  intToLevel[index] = level;
}
var Logger = class {
  static error(message) {
    if (!this.shouldLog("error"))
      return;
    console.error(this.logMessage("error", message));
  }
  static warn(message) {
    if (!this.shouldLog("warn"))
      return;
    console.warn(this.logMessage("warn", message));
  }
  static info(message) {
    if (!this.shouldLog("info"))
      return;
    console.log(this.logMessage("info", message));
  }
  static debug(message) {
    if (!this.shouldLog("debug"))
      return;
    console.log(this.logMessage("debug", message));
  }
  static logMessage(level, message) {
    return `[${level.toUpperCase()}] ${message}`;
  }
  static shouldLog(level) {
    const currentLevel = levelToInt[config.logLevel];
    return currentLevel <= levelToInt[level];
  }
};

// node_modules/@stacks/common/dist/esm/utils.js
function nextYear() {
  return new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() + 1));
}
function nextMonth() {
  return new Date((/* @__PURE__ */ new Date()).setMonth((/* @__PURE__ */ new Date()).getMonth() + 1));
}
function megabytesToBytes(megabytes) {
  if (!Number.isFinite(megabytes)) {
    return 0;
  }
  return Math.floor(megabytes * 1024 * 1024);
}
function makeUUID4() {
  let d = (/* @__PURE__ */ new Date()).getTime();
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    d += performance.now();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
}
function without0x(value) {
  return /^0x/i.test(value) ? value.slice(2) : value;
}
var hexes3 = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex3(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (const u of uint8a) {
    hex += hexes3[u];
  }
  return hex;
}
function hexToBytes3(hex) {
  if (typeof hex !== "string") {
    throw new TypeError(`hexToBytes: expected string, got ${typeof hex}`);
  }
  hex = without0x(hex);
  hex = hex.length % 2 ? `0${hex}` : hex;
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function utf8ToBytes2(str) {
  return new TextEncoder().encode(str);
}
function bytesToUtf8(arr) {
  return new TextDecoder().decode(arr);
}
function concatBytes3(...arrays) {
  if (!arrays.every((a) => a instanceof Uint8Array))
    throw new Error("Uint8Array list expected");
  if (arrays.length === 1)
    return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}

// node_modules/@stacks/common/dist/esm/constants.js
var HIRO_MAINNET_URL = "https://api.mainnet.hiro.so";
var HIRO_TESTNET_URL = "https://api.testnet.hiro.so";
var DEVNET_URL = "http://localhost:3999";
var PRIVATE_KEY_BYTES_COMPRESSED = 33;

// node_modules/@stacks/common/dist/esm/keys.js
function privateKeyToBytes(privateKey) {
  const privateKeyBuffer = typeof privateKey === "string" ? hexToBytes3(privateKey) : privateKey;
  if (privateKeyBuffer.length != 32 && privateKeyBuffer.length != 33) {
    throw new Error(`Improperly formatted private-key. Private-key byte length should be 32 or 33. Length provided: ${privateKeyBuffer.length}`);
  }
  if (privateKeyBuffer.length == 33 && privateKeyBuffer[32] !== 1) {
    throw new Error("Improperly formatted private-key. 33 bytes indicate compressed key, but the last byte must be == 01");
  }
  return privateKeyBuffer;
}

// node_modules/@stacks/common/dist/esm/buffer.js
function writeUInt32BE(destination, value, offset = 0) {
  destination[offset + 3] = value;
  value >>>= 8;
  destination[offset + 2] = value;
  value >>>= 8;
  destination[offset + 1] = value;
  value >>>= 8;
  destination[offset] = value;
  return destination;
}

// node_modules/@stacks/common/dist/esm/fetch.js
var defaultFetchOpts = {
  referrerPolicy: "origin",
  headers: {
    "x-hiro-product": "stacksjs"
  }
};
async function fetchWrapper(input, init) {
  const fetchOpts = {};
  Object.assign(fetchOpts, defaultFetchOpts, init);
  const fetchResult = await fetch(input, fetchOpts);
  return fetchResult;
}
function argsForCreateFetchFn(args) {
  let fetchLib = fetchWrapper;
  let middlewares = [];
  if (args.length > 0 && typeof args[0] === "function") {
    fetchLib = args.shift();
  }
  if (args.length > 0) {
    middlewares = args;
  }
  return { fetchLib, middlewares };
}
function createFetchFn(...args) {
  const { fetchLib, middlewares } = argsForCreateFetchFn(args);
  const fetchFn = async (url, init) => {
    let fetchParams = { url, init: init ?? {} };
    for (const middleware of middlewares) {
      if (typeof middleware.pre === "function") {
        const result = await Promise.resolve(middleware.pre({
          fetch: fetchLib,
          ...fetchParams
        }));
        fetchParams = result ?? fetchParams;
      }
    }
    let response = await fetchLib(fetchParams.url, fetchParams.init);
    for (const middleware of middlewares) {
      if (typeof middleware.post === "function") {
        const result = await Promise.resolve(middleware.post({
          fetch: fetchLib,
          url: fetchParams.url,
          init: fetchParams.init,
          response: response?.clone() ?? response
        }));
        response = result ?? response;
      }
    }
    return response;
  };
  return fetchFn;
}

// node_modules/@stacks/encryption/node_modules/@noble/secp256k1/lib/esm/index.js
var nodeCrypto2 = __toESM(require_crypto(), 1);
var _0n2 = BigInt(0);
var _1n2 = BigInt(1);
var _2n2 = BigInt(2);
var _3n2 = BigInt(3);
var _8n2 = BigInt(8);
var CURVE2 = Object.freeze({
  a: _0n2,
  b: BigInt(7),
  P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: _1n2,
  Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
  Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee")
});
var divNearest2 = (a, b) => (a + b / _2n2) / b;
var endo2 = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  splitScalar(k) {
    const { n } = CURVE2;
    const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
    const b1 = -_1n2 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
    const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
    const b2 = a1;
    const POW_2_128 = BigInt("0x100000000000000000000000000000000");
    const c1 = divNearest2(b2 * k, n);
    const c2 = divNearest2(-b1 * k, n);
    let k1 = mod2(k - c1 * a1 - c2 * a2, n);
    let k2 = mod2(-c1 * b1 - c2 * b2, n);
    const k1neg = k1 > POW_2_128;
    const k2neg = k2 > POW_2_128;
    if (k1neg)
      k1 = n - k1;
    if (k2neg)
      k2 = n - k2;
    if (k1 > POW_2_128 || k2 > POW_2_128) {
      throw new Error("splitScalarEndo: Endomorphism failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
};
var fieldLen2 = 32;
var groupLen2 = 32;
var hashLen2 = 32;
var compressedLen2 = fieldLen2 + 1;
var uncompressedLen2 = 2 * fieldLen2 + 1;
function weierstrass2(x) {
  const { a, b } = CURVE2;
  const x2 = mod2(x * x);
  const x3 = mod2(x2 * x);
  return mod2(x3 + a * x + b);
}
var USE_ENDOMORPHISM2 = CURVE2.a === _0n2;
var ShaError2 = class extends Error {
  constructor(message) {
    super(message);
  }
};
function assertJacPoint2(other) {
  if (!(other instanceof JacobianPoint2))
    throw new TypeError("JacobianPoint expected");
}
var JacobianPoint2 = class _JacobianPoint {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static fromAffine(p) {
    if (!(p instanceof Point2)) {
      throw new TypeError("JacobianPoint#fromAffine: expected Point");
    }
    if (p.equals(Point2.ZERO))
      return _JacobianPoint.ZERO;
    return new _JacobianPoint(p.x, p.y, _1n2);
  }
  static toAffineBatch(points) {
    const toInv = invertBatch2(points.map((p) => p.z));
    return points.map((p, i) => p.toAffine(toInv[i]));
  }
  static normalizeZ(points) {
    return _JacobianPoint.toAffineBatch(points).map(_JacobianPoint.fromAffine);
  }
  equals(other) {
    assertJacPoint2(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    const Z1Z1 = mod2(Z1 * Z1);
    const Z2Z2 = mod2(Z2 * Z2);
    const U1 = mod2(X1 * Z2Z2);
    const U2 = mod2(X2 * Z1Z1);
    const S1 = mod2(mod2(Y1 * Z2) * Z2Z2);
    const S2 = mod2(mod2(Y2 * Z1) * Z1Z1);
    return U1 === U2 && S1 === S2;
  }
  negate() {
    return new _JacobianPoint(this.x, mod2(-this.y), this.z);
  }
  double() {
    const { x: X1, y: Y1, z: Z1 } = this;
    const A = mod2(X1 * X1);
    const B = mod2(Y1 * Y1);
    const C = mod2(B * B);
    const x1b = X1 + B;
    const D = mod2(_2n2 * (mod2(x1b * x1b) - A - C));
    const E = mod2(_3n2 * A);
    const F = mod2(E * E);
    const X3 = mod2(F - _2n2 * D);
    const Y3 = mod2(E * (D - X3) - _8n2 * C);
    const Z3 = mod2(_2n2 * Y1 * Z1);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  add(other) {
    assertJacPoint2(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    if (X2 === _0n2 || Y2 === _0n2)
      return this;
    if (X1 === _0n2 || Y1 === _0n2)
      return other;
    const Z1Z1 = mod2(Z1 * Z1);
    const Z2Z2 = mod2(Z2 * Z2);
    const U1 = mod2(X1 * Z2Z2);
    const U2 = mod2(X2 * Z1Z1);
    const S1 = mod2(mod2(Y1 * Z2) * Z2Z2);
    const S2 = mod2(mod2(Y2 * Z1) * Z1Z1);
    const H = mod2(U2 - U1);
    const r = mod2(S2 - S1);
    if (H === _0n2) {
      if (r === _0n2) {
        return this.double();
      } else {
        return _JacobianPoint.ZERO;
      }
    }
    const HH = mod2(H * H);
    const HHH = mod2(H * HH);
    const V = mod2(U1 * HH);
    const X3 = mod2(r * r - HHH - _2n2 * V);
    const Y3 = mod2(r * (V - X3) - S1 * HHH);
    const Z3 = mod2(Z1 * Z2 * H);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiplyUnsafe(scalar) {
    const P0 = _JacobianPoint.ZERO;
    if (typeof scalar === "bigint" && scalar === _0n2)
      return P0;
    let n = normalizeScalar2(scalar);
    if (n === _1n2)
      return this;
    if (!USE_ENDOMORPHISM2) {
      let p = P0;
      let d2 = this;
      while (n > _0n2) {
        if (n & _1n2)
          p = p.add(d2);
        d2 = d2.double();
        n >>= _1n2;
      }
      return p;
    }
    let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(n);
    let k1p = P0;
    let k2p = P0;
    let d = this;
    while (k1 > _0n2 || k2 > _0n2) {
      if (k1 & _1n2)
        k1p = k1p.add(d);
      if (k2 & _1n2)
        k2p = k2p.add(d);
      d = d.double();
      k1 >>= _1n2;
      k2 >>= _1n2;
    }
    if (k1neg)
      k1p = k1p.negate();
    if (k2neg)
      k2p = k2p.negate();
    k2p = new _JacobianPoint(mod2(k2p.x * endo2.beta), k2p.y, k2p.z);
    return k1p.add(k2p);
  }
  precomputeWindow(W) {
    const windows = USE_ENDOMORPHISM2 ? 128 / W + 1 : 256 / W + 1;
    const points = [];
    let p = this;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i = 1; i < 2 ** (W - 1); i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  wNAF(n, affinePoint) {
    if (!affinePoint && this.equals(_JacobianPoint.BASE))
      affinePoint = Point2.BASE;
    const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
    if (256 % W) {
      throw new Error("Point#wNAF: Invalid precomputation window, must be power of 2");
    }
    let precomputes = affinePoint && pointPrecomputes2.get(affinePoint);
    if (!precomputes) {
      precomputes = this.precomputeWindow(W);
      if (affinePoint && W !== 1) {
        precomputes = _JacobianPoint.normalizeZ(precomputes);
        pointPrecomputes2.set(affinePoint, precomputes);
      }
    }
    let p = _JacobianPoint.ZERO;
    let f2 = _JacobianPoint.BASE;
    const windows = 1 + (USE_ENDOMORPHISM2 ? 128 / W : 256 / W);
    const windowSize = 2 ** (W - 1);
    const mask = BigInt(2 ** W - 1);
    const maxNumber = 2 ** W;
    const shiftBy = BigInt(W);
    for (let window2 = 0; window2 < windows; window2++) {
      const offset = window2 * windowSize;
      let wbits = Number(n & mask);
      n >>= shiftBy;
      if (wbits > windowSize) {
        wbits -= maxNumber;
        n += _1n2;
      }
      const offset1 = offset;
      const offset2 = offset + Math.abs(wbits) - 1;
      const cond1 = window2 % 2 !== 0;
      const cond2 = wbits < 0;
      if (wbits === 0) {
        f2 = f2.add(constTimeNegate2(cond1, precomputes[offset1]));
      } else {
        p = p.add(constTimeNegate2(cond2, precomputes[offset2]));
      }
    }
    return { p, f: f2 };
  }
  multiply(scalar, affinePoint) {
    let n = normalizeScalar2(scalar);
    let point;
    let fake;
    if (USE_ENDOMORPHISM2) {
      const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(n);
      let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
      let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
      k1p = constTimeNegate2(k1neg, k1p);
      k2p = constTimeNegate2(k2neg, k2p);
      k2p = new _JacobianPoint(mod2(k2p.x * endo2.beta), k2p.y, k2p.z);
      point = k1p.add(k2p);
      fake = f1p.add(f2p);
    } else {
      const { p, f: f2 } = this.wNAF(n, affinePoint);
      point = p;
      fake = f2;
    }
    return _JacobianPoint.normalizeZ([point, fake])[0];
  }
  toAffine(invZ) {
    const { x, y, z } = this;
    const is0 = this.equals(_JacobianPoint.ZERO);
    if (invZ == null)
      invZ = is0 ? _8n2 : invert2(z);
    const iz1 = invZ;
    const iz2 = mod2(iz1 * iz1);
    const iz3 = mod2(iz2 * iz1);
    const ax = mod2(x * iz2);
    const ay = mod2(y * iz3);
    const zz = mod2(z * iz1);
    if (is0)
      return Point2.ZERO;
    if (zz !== _1n2)
      throw new Error("invZ was invalid");
    return new Point2(ax, ay);
  }
};
JacobianPoint2.BASE = new JacobianPoint2(CURVE2.Gx, CURVE2.Gy, _1n2);
JacobianPoint2.ZERO = new JacobianPoint2(_0n2, _1n2, _0n2);
function constTimeNegate2(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
var pointPrecomputes2 = /* @__PURE__ */ new WeakMap();
var Point2 = class _Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  _setWindowSize(windowSize) {
    this._WINDOW_SIZE = windowSize;
    pointPrecomputes2.delete(this);
  }
  hasEvenY() {
    return this.y % _2n2 === _0n2;
  }
  static fromCompressedHex(bytes2) {
    const isShort = bytes2.length === 32;
    const x = bytesToNumber3(isShort ? bytes2 : bytes2.subarray(1));
    if (!isValidFieldElement2(x))
      throw new Error("Point is not on curve");
    const y2 = weierstrass2(x);
    let y = sqrtMod2(y2);
    const isYOdd = (y & _1n2) === _1n2;
    if (isShort) {
      if (isYOdd)
        y = mod2(-y);
    } else {
      const isFirstByteOdd = (bytes2[0] & 1) === 1;
      if (isFirstByteOdd !== isYOdd)
        y = mod2(-y);
    }
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromUncompressedHex(bytes2) {
    const x = bytesToNumber3(bytes2.subarray(1, fieldLen2 + 1));
    const y = bytesToNumber3(bytes2.subarray(fieldLen2 + 1, fieldLen2 * 2 + 1));
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromHex(hex) {
    const bytes2 = ensureBytes2(hex);
    const len = bytes2.length;
    const header = bytes2[0];
    if (len === fieldLen2)
      return this.fromCompressedHex(bytes2);
    if (len === compressedLen2 && (header === 2 || header === 3)) {
      return this.fromCompressedHex(bytes2);
    }
    if (len === uncompressedLen2 && header === 4)
      return this.fromUncompressedHex(bytes2);
    throw new Error(`Point.fromHex: received invalid point. Expected 32-${compressedLen2} compressed bytes or ${uncompressedLen2} uncompressed bytes, not ${len}`);
  }
  static fromPrivateKey(privateKey) {
    return _Point.BASE.multiply(normalizePrivateKey2(privateKey));
  }
  static fromSignature(msgHash, signature, recovery) {
    const { r, s } = normalizeSignature2(signature);
    if (![0, 1, 2, 3].includes(recovery))
      throw new Error("Cannot recover: invalid recovery bit");
    const h = truncateHash2(ensureBytes2(msgHash));
    const { n } = CURVE2;
    const radj = recovery === 2 || recovery === 3 ? r + n : r;
    const rinv = invert2(radj, n);
    const u1 = mod2(-h * rinv, n);
    const u2 = mod2(s * rinv, n);
    const prefix = recovery & 1 ? "03" : "02";
    const R = _Point.fromHex(prefix + numTo32bStr2(radj));
    const Q = _Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
    if (!Q)
      throw new Error("Cannot recover signature: point at infinify");
    Q.assertValidity();
    return Q;
  }
  toRawBytes(isCompressed = false) {
    return hexToBytes4(this.toHex(isCompressed));
  }
  toHex(isCompressed = false) {
    const x = numTo32bStr2(this.x);
    if (isCompressed) {
      const prefix = this.hasEvenY() ? "02" : "03";
      return `${prefix}${x}`;
    } else {
      return `04${x}${numTo32bStr2(this.y)}`;
    }
  }
  toHexX() {
    return this.toHex(true).slice(2);
  }
  toRawX() {
    return this.toRawBytes(true).slice(1);
  }
  assertValidity() {
    const msg = "Point is not on elliptic curve";
    const { x, y } = this;
    if (!isValidFieldElement2(x) || !isValidFieldElement2(y))
      throw new Error(msg);
    const left = mod2(y * y);
    const right = weierstrass2(x);
    if (mod2(left - right) !== _0n2)
      throw new Error(msg);
  }
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
  negate() {
    return new _Point(this.x, mod2(-this.y));
  }
  double() {
    return JacobianPoint2.fromAffine(this).double().toAffine();
  }
  add(other) {
    return JacobianPoint2.fromAffine(this).add(JacobianPoint2.fromAffine(other)).toAffine();
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiply(scalar) {
    return JacobianPoint2.fromAffine(this).multiply(scalar, this).toAffine();
  }
  multiplyAndAddUnsafe(Q, a, b) {
    const P = JacobianPoint2.fromAffine(this);
    const aP = a === _0n2 || a === _1n2 || this !== _Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
    const bQ = JacobianPoint2.fromAffine(Q).multiplyUnsafe(b);
    const sum = aP.add(bQ);
    return sum.equals(JacobianPoint2.ZERO) ? void 0 : sum.toAffine();
  }
};
Point2.BASE = new Point2(CURVE2.Gx, CURVE2.Gy);
Point2.ZERO = new Point2(_0n2, _0n2);
function sliceDER2(s) {
  return Number.parseInt(s[0], 16) >= 8 ? "00" + s : s;
}
function parseDERInt2(data) {
  if (data.length < 2 || data[0] !== 2) {
    throw new Error(`Invalid signature integer tag: ${bytesToHex4(data)}`);
  }
  const len = data[1];
  const res = data.subarray(2, len + 2);
  if (!len || res.length !== len) {
    throw new Error(`Invalid signature integer: wrong length`);
  }
  if (res[0] === 0 && res[1] <= 127) {
    throw new Error("Invalid signature integer: trailing length");
  }
  return { data: bytesToNumber3(res), left: data.subarray(len + 2) };
}
function parseDERSignature2(data) {
  if (data.length < 2 || data[0] != 48) {
    throw new Error(`Invalid signature tag: ${bytesToHex4(data)}`);
  }
  if (data[1] !== data.length - 2) {
    throw new Error("Invalid signature: incorrect length");
  }
  const { data: r, left: sBytes } = parseDERInt2(data.subarray(2));
  const { data: s, left: rBytesLeft } = parseDERInt2(sBytes);
  if (rBytesLeft.length) {
    throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex4(rBytesLeft)}`);
  }
  return { r, s };
}
var Signature2 = class _Signature {
  constructor(r, s) {
    this.r = r;
    this.s = s;
    this.assertValidity();
  }
  static fromCompact(hex) {
    const arr = hex instanceof Uint8Array;
    const name = "Signature.fromCompact";
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`${name}: Expected string or Uint8Array`);
    const str = arr ? bytesToHex4(hex) : hex;
    if (str.length !== 128)
      throw new Error(`${name}: Expected 64-byte hex`);
    return new _Signature(hexToNumber2(str.slice(0, 64)), hexToNumber2(str.slice(64, 128)));
  }
  static fromDER(hex) {
    const arr = hex instanceof Uint8Array;
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
    const { r, s } = parseDERSignature2(arr ? hex : hexToBytes4(hex));
    return new _Signature(r, s);
  }
  static fromHex(hex) {
    return this.fromDER(hex);
  }
  assertValidity() {
    const { r, s } = this;
    if (!isWithinCurveOrder2(r))
      throw new Error("Invalid Signature: r must be 0 < r < n");
    if (!isWithinCurveOrder2(s))
      throw new Error("Invalid Signature: s must be 0 < s < n");
  }
  hasHighS() {
    const HALF = CURVE2.n >> _1n2;
    return this.s > HALF;
  }
  normalizeS() {
    return this.hasHighS() ? new _Signature(this.r, mod2(-this.s, CURVE2.n)) : this;
  }
  toDERRawBytes() {
    return hexToBytes4(this.toDERHex());
  }
  toDERHex() {
    const sHex = sliceDER2(numberToHexUnpadded2(this.s));
    const rHex = sliceDER2(numberToHexUnpadded2(this.r));
    const sHexL = sHex.length / 2;
    const rHexL = rHex.length / 2;
    const sLen = numberToHexUnpadded2(sHexL);
    const rLen = numberToHexUnpadded2(rHexL);
    const length = numberToHexUnpadded2(rHexL + sHexL + 4);
    return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
  }
  toRawBytes() {
    return this.toDERRawBytes();
  }
  toHex() {
    return this.toDERHex();
  }
  toCompactRawBytes() {
    return hexToBytes4(this.toCompactHex());
  }
  toCompactHex() {
    return numTo32bStr2(this.r) + numTo32bStr2(this.s);
  }
};
function concatBytes4(...arrays) {
  if (!arrays.every((b) => b instanceof Uint8Array))
    throw new Error("Uint8Array list expected");
  if (arrays.length === 1)
    return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
var hexes4 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex4(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  let hex = "";
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes4[uint8a[i]];
  }
  return hex;
}
var POW_2_2562 = BigInt("0x10000000000000000000000000000000000000000000000000000000000000000");
function numTo32bStr2(num) {
  if (typeof num !== "bigint")
    throw new Error("Expected bigint");
  if (!(_0n2 <= num && num < POW_2_2562))
    throw new Error("Expected number 0 <= n < 2^256");
  return num.toString(16).padStart(64, "0");
}
function numTo32b2(num) {
  const b = hexToBytes4(numTo32bStr2(num));
  if (b.length !== 32)
    throw new Error("Error: expected 32 bytes");
  return b;
}
function numberToHexUnpadded2(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToNumber: expected string, got " + typeof hex);
  }
  return BigInt(`0x${hex}`);
}
function hexToBytes4(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToBytes: expected string, got " + typeof hex);
  }
  if (hex.length % 2)
    throw new Error("hexToBytes: received invalid unpadded hex" + hex.length);
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function bytesToNumber3(bytes2) {
  return hexToNumber2(bytesToHex4(bytes2));
}
function ensureBytes2(hex) {
  return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes4(hex);
}
function normalizeScalar2(num) {
  if (typeof num === "number" && Number.isSafeInteger(num) && num > 0)
    return BigInt(num);
  if (typeof num === "bigint" && isWithinCurveOrder2(num))
    return num;
  throw new TypeError("Expected valid private scalar: 0 < scalar < curve.n");
}
function mod2(a, b = CURVE2.P) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow22(x, power) {
  const { P } = CURVE2;
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= P;
  }
  return res;
}
function sqrtMod2(x) {
  const { P } = CURVE2;
  const _6n = BigInt(6);
  const _11n = BigInt(11);
  const _22n = BigInt(22);
  const _23n = BigInt(23);
  const _44n = BigInt(44);
  const _88n = BigInt(88);
  const b2 = x * x * x % P;
  const b3 = b2 * b2 * x % P;
  const b6 = pow22(b3, _3n2) * b3 % P;
  const b9 = pow22(b6, _3n2) * b3 % P;
  const b11 = pow22(b9, _2n2) * b2 % P;
  const b22 = pow22(b11, _11n) * b11 % P;
  const b44 = pow22(b22, _22n) * b22 % P;
  const b88 = pow22(b44, _44n) * b44 % P;
  const b176 = pow22(b88, _88n) * b88 % P;
  const b220 = pow22(b176, _44n) * b44 % P;
  const b223 = pow22(b220, _3n2) * b3 % P;
  const t1 = pow22(b223, _23n) * b22 % P;
  const t2 = pow22(t1, _6n) * b2 % P;
  const rt = pow22(t2, _2n2);
  const xc = rt * rt % P;
  if (xc !== x)
    throw new Error("Cannot find square root");
  return rt;
}
function invert2(number2, modulo = CURVE2.P) {
  if (number2 === _0n2 || modulo <= _0n2) {
    throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
  }
  let a = mod2(number2, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod2(x, modulo);
}
function invertBatch2(nums, p = CURVE2.P) {
  const scratch = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (num === _0n2)
      return acc;
    scratch[i] = acc;
    return mod2(acc * num, p);
  }, _1n2);
  const inverted = invert2(lastMultiplied, p);
  nums.reduceRight((acc, num, i) => {
    if (num === _0n2)
      return acc;
    scratch[i] = mod2(acc * scratch[i], p);
    return mod2(acc * num, p);
  }, inverted);
  return scratch;
}
function bits2int_22(bytes2) {
  const delta = bytes2.length * 8 - groupLen2 * 8;
  const num = bytesToNumber3(bytes2);
  return delta > 0 ? num >> BigInt(delta) : num;
}
function truncateHash2(hash2, truncateOnly = false) {
  const h = bits2int_22(hash2);
  if (truncateOnly)
    return h;
  const { n } = CURVE2;
  return h >= n ? h - n : h;
}
var _sha256Sync2;
var _hmacSha256Sync2;
var HmacDrbg2 = class {
  constructor(hashLen3, qByteLen) {
    this.hashLen = hashLen3;
    this.qByteLen = qByteLen;
    if (typeof hashLen3 !== "number" || hashLen3 < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    this.v = new Uint8Array(hashLen3).fill(1);
    this.k = new Uint8Array(hashLen3).fill(0);
    this.counter = 0;
  }
  hmac(...values) {
    return utils2.hmacSha256(this.k, ...values);
  }
  hmacSync(...values) {
    return _hmacSha256Sync2(this.k, ...values);
  }
  checkSync() {
    if (typeof _hmacSha256Sync2 !== "function")
      throw new ShaError2("hmacSha256Sync needs to be set");
  }
  incr() {
    if (this.counter >= 1e3)
      throw new Error("Tried 1,000 k values for sign(), all were invalid");
    this.counter += 1;
  }
  async reseed(seed = new Uint8Array()) {
    this.k = await this.hmac(this.v, Uint8Array.from([0]), seed);
    this.v = await this.hmac(this.v);
    if (seed.length === 0)
      return;
    this.k = await this.hmac(this.v, Uint8Array.from([1]), seed);
    this.v = await this.hmac(this.v);
  }
  reseedSync(seed = new Uint8Array()) {
    this.checkSync();
    this.k = this.hmacSync(this.v, Uint8Array.from([0]), seed);
    this.v = this.hmacSync(this.v);
    if (seed.length === 0)
      return;
    this.k = this.hmacSync(this.v, Uint8Array.from([1]), seed);
    this.v = this.hmacSync(this.v);
  }
  async generate() {
    this.incr();
    let len = 0;
    const out = [];
    while (len < this.qByteLen) {
      this.v = await this.hmac(this.v);
      const sl = this.v.slice();
      out.push(sl);
      len += this.v.length;
    }
    return concatBytes4(...out);
  }
  generateSync() {
    this.checkSync();
    this.incr();
    let len = 0;
    const out = [];
    while (len < this.qByteLen) {
      this.v = this.hmacSync(this.v);
      const sl = this.v.slice();
      out.push(sl);
      len += this.v.length;
    }
    return concatBytes4(...out);
  }
};
function isWithinCurveOrder2(num) {
  return _0n2 < num && num < CURVE2.n;
}
function isValidFieldElement2(num) {
  return _0n2 < num && num < CURVE2.P;
}
function kmdToSig2(kBytes, m, d, lowS = true) {
  const { n } = CURVE2;
  const k = truncateHash2(kBytes, true);
  if (!isWithinCurveOrder2(k))
    return;
  const kinv = invert2(k, n);
  const q = Point2.BASE.multiply(k);
  const r = mod2(q.x, n);
  if (r === _0n2)
    return;
  const s = mod2(kinv * mod2(m + d * r, n), n);
  if (s === _0n2)
    return;
  let sig = new Signature2(r, s);
  let recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n2);
  if (lowS && sig.hasHighS()) {
    sig = sig.normalizeS();
    recovery ^= 1;
  }
  return { sig, recovery };
}
function normalizePrivateKey2(key) {
  let num;
  if (typeof key === "bigint") {
    num = key;
  } else if (typeof key === "number" && Number.isSafeInteger(key) && key > 0) {
    num = BigInt(key);
  } else if (typeof key === "string") {
    if (key.length !== 2 * groupLen2)
      throw new Error("Expected 32 bytes of private key");
    num = hexToNumber2(key);
  } else if (key instanceof Uint8Array) {
    if (key.length !== groupLen2)
      throw new Error("Expected 32 bytes of private key");
    num = bytesToNumber3(key);
  } else {
    throw new TypeError("Expected valid private key");
  }
  if (!isWithinCurveOrder2(num))
    throw new Error("Expected private key: 0 < key < n");
  return num;
}
function normalizePublicKey2(publicKey) {
  if (publicKey instanceof Point2) {
    publicKey.assertValidity();
    return publicKey;
  } else {
    return Point2.fromHex(publicKey);
  }
}
function normalizeSignature2(signature) {
  if (signature instanceof Signature2) {
    signature.assertValidity();
    return signature;
  }
  try {
    return Signature2.fromDER(signature);
  } catch (error) {
    return Signature2.fromCompact(signature);
  }
}
function getPublicKey2(privateKey, isCompressed = false) {
  return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
}
function isProbPub(item) {
  const arr = item instanceof Uint8Array;
  const str = typeof item === "string";
  const len = (arr || str) && item.length;
  if (arr)
    return len === compressedLen2 || len === uncompressedLen2;
  if (str)
    return len === compressedLen2 * 2 || len === uncompressedLen2 * 2;
  if (item instanceof Point2)
    return true;
  return false;
}
function getSharedSecret(privateA, publicB, isCompressed = false) {
  if (isProbPub(privateA))
    throw new TypeError("getSharedSecret: first arg must be private key");
  if (!isProbPub(publicB))
    throw new TypeError("getSharedSecret: second arg must be public key");
  const b = normalizePublicKey2(publicB);
  b.assertValidity();
  return b.multiply(normalizePrivateKey2(privateA)).toRawBytes(isCompressed);
}
function bits2int2(bytes2) {
  const slice = bytes2.length > fieldLen2 ? bytes2.slice(0, fieldLen2) : bytes2;
  return bytesToNumber3(slice);
}
function bits2octets2(bytes2) {
  const z1 = bits2int2(bytes2);
  const z2 = mod2(z1, CURVE2.n);
  return int2octets2(z2 < _0n2 ? z1 : z2);
}
function int2octets2(num) {
  return numTo32b2(num);
}
function initSigArgs2(msgHash, privateKey, extraEntropy) {
  if (msgHash == null)
    throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
  const h1 = ensureBytes2(msgHash);
  const d = normalizePrivateKey2(privateKey);
  const seedArgs = [int2octets2(d), bits2octets2(h1)];
  if (extraEntropy != null) {
    if (extraEntropy === true)
      extraEntropy = utils2.randomBytes(fieldLen2);
    const e = ensureBytes2(extraEntropy);
    if (e.length !== fieldLen2)
      throw new Error(`sign: Expected ${fieldLen2} bytes of extra data`);
    seedArgs.push(e);
  }
  const seed = concatBytes4(...seedArgs);
  const m = bits2int2(h1);
  return { seed, m, d };
}
function finalizeSig2(recSig, opts) {
  const { sig, recovery } = recSig;
  const { der, recovered } = Object.assign({ canonical: true, der: true }, opts);
  const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
  return recovered ? [hashed, recovery] : hashed;
}
function signSync2(msgHash, privKey, opts = {}) {
  const { seed, m, d } = initSigArgs2(msgHash, privKey, opts.extraEntropy);
  const drbg = new HmacDrbg2(hashLen2, groupLen2);
  drbg.reseedSync(seed);
  let sig;
  while (!(sig = kmdToSig2(drbg.generateSync(), m, d, opts.canonical)))
    drbg.reseedSync();
  return finalizeSig2(sig, opts);
}
Point2.BASE._setWindowSize(8);
var crypto4 = {
  node: nodeCrypto2,
  web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
};
var TAGGED_HASH_PREFIXES2 = {};
var utils2 = {
  bytesToHex: bytesToHex4,
  hexToBytes: hexToBytes4,
  concatBytes: concatBytes4,
  mod: mod2,
  invert: invert2,
  isValidPrivateKey(privateKey) {
    try {
      normalizePrivateKey2(privateKey);
      return true;
    } catch (error) {
      return false;
    }
  },
  _bigintTo32Bytes: numTo32b2,
  _normalizePrivateKey: normalizePrivateKey2,
  hashToPrivateKey: (hash2) => {
    hash2 = ensureBytes2(hash2);
    const minLen = groupLen2 + 8;
    if (hash2.length < minLen || hash2.length > 1024) {
      throw new Error(`Expected valid bytes of private key as per FIPS 186`);
    }
    const num = mod2(bytesToNumber3(hash2), CURVE2.n - _1n2) + _1n2;
    return numTo32b2(num);
  },
  randomBytes: (bytesLength = 32) => {
    if (crypto4.web) {
      return crypto4.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto4.node) {
      const { randomBytes: randomBytes2 } = crypto4.node;
      return Uint8Array.from(randomBytes2(bytesLength));
    } else {
      throw new Error("The environment doesn't have randomBytes function");
    }
  },
  randomPrivateKey: () => utils2.hashToPrivateKey(utils2.randomBytes(groupLen2 + 8)),
  precompute(windowSize = 8, point = Point2.BASE) {
    const cached = point === Point2.BASE ? point : new Point2(point.x, point.y);
    cached._setWindowSize(windowSize);
    cached.multiply(_3n2);
    return cached;
  },
  sha256: async (...messages) => {
    if (crypto4.web) {
      const buffer = await crypto4.web.subtle.digest("SHA-256", concatBytes4(...messages));
      return new Uint8Array(buffer);
    } else if (crypto4.node) {
      const { createHash } = crypto4.node;
      const hash2 = createHash("sha256");
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have sha256 function");
    }
  },
  hmacSha256: async (key, ...messages) => {
    if (crypto4.web) {
      const ckey = await crypto4.web.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
      const message = concatBytes4(...messages);
      const buffer = await crypto4.web.subtle.sign("HMAC", ckey, message);
      return new Uint8Array(buffer);
    } else if (crypto4.node) {
      const { createHmac } = crypto4.node;
      const hash2 = createHmac("sha256", key);
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have hmac-sha256 function");
    }
  },
  sha256Sync: void 0,
  hmacSha256Sync: void 0,
  taggedHash: async (tag, ...messages) => {
    let tagP = TAGGED_HASH_PREFIXES2[tag];
    if (tagP === void 0) {
      const tagH = await utils2.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes4(tagH, tagH);
      TAGGED_HASH_PREFIXES2[tag] = tagP;
    }
    return utils2.sha256(tagP, ...messages);
  },
  taggedHashSync: (tag, ...messages) => {
    if (typeof _sha256Sync2 !== "function")
      throw new ShaError2("sha256Sync is undefined, you need to set it");
    let tagP = TAGGED_HASH_PREFIXES2[tag];
    if (tagP === void 0) {
      const tagH = _sha256Sync2(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes4(tagH, tagH);
      TAGGED_HASH_PREFIXES2[tag] = tagP;
    }
    return _sha256Sync2(tagP, ...messages);
  },
  _JacobianPoint: JacobianPoint2
};
Object.defineProperties(utils2, {
  sha256Sync: {
    configurable: false,
    get() {
      return _sha256Sync2;
    },
    set(val) {
      if (!_sha256Sync2)
        _sha256Sync2 = val;
    }
  },
  hmacSha256Sync: {
    configurable: false,
    get() {
      return _hmacSha256Sync2;
    },
    set(val) {
      if (!_hmacSha256Sync2)
        _hmacSha256Sync2 = val;
    }
  }
});

// node_modules/@stacks/encryption/dist/esm/ec.js
var import_base64_js = __toESM(require_base64_js());

// node_modules/@stacks/encryption/dist/esm/cryptoUtils.js
function isSubtleCryptoAvailable() {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}
var NO_CRYPTO_LIB = 'Crypto lib not found. Either the WebCrypto "crypto.subtle" or Node.js "crypto" module must be available.';
async function getCryptoLib() {
  if (isSubtleCryptoAvailable()) {
    return {
      lib: crypto.subtle,
      name: "subtleCrypto"
    };
  } else {
    try {
      const nodeCrypto4 = require_crypto();
      return {
        lib: nodeCrypto4,
        name: "nodeCrypto"
      };
    } catch (error) {
      throw new Error(NO_CRYPTO_LIB);
    }
  }
}

// node_modules/@stacks/encryption/dist/esm/aesCipher.js
var NodeCryptoAesCipher = class {
  constructor(createCipher2, createDecipher) {
    this.createCipher = createCipher2;
    this.createDecipher = createDecipher;
  }
  async encrypt(algorithm, key, iv, data) {
    if (algorithm !== "aes-128-cbc" && algorithm !== "aes-256-cbc") {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cipher = this.createCipher(algorithm, key, iv);
    const result = new Uint8Array(concatBytes3(cipher.update(data), cipher.final()));
    return Promise.resolve(result);
  }
  async decrypt(algorithm, key, iv, data) {
    if (algorithm !== "aes-128-cbc" && algorithm !== "aes-256-cbc") {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cipher = this.createDecipher(algorithm, key, iv);
    const result = new Uint8Array(concatBytes3(cipher.update(data), cipher.final()));
    return Promise.resolve(result);
  }
};
var WebCryptoAesCipher = class {
  constructor(subtleCrypto) {
    this.subtleCrypto = subtleCrypto;
  }
  async encrypt(algorithm, key, iv, data) {
    let algo;
    let length;
    if (algorithm === "aes-128-cbc") {
      algo = "AES-CBC";
      length = 128;
    } else if (algorithm === "aes-256-cbc") {
      algo = "AES-CBC";
      length = 256;
    } else {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cryptoKey = await this.subtleCrypto.importKey("raw", key, { name: algo, length }, false, ["encrypt"]);
    const result = await this.subtleCrypto.encrypt({ name: algo, iv }, cryptoKey, data);
    return new Uint8Array(result);
  }
  async decrypt(algorithm, key, iv, data) {
    let algo;
    let length;
    if (algorithm === "aes-128-cbc") {
      algo = "AES-CBC";
      length = 128;
    } else if (algorithm === "aes-256-cbc") {
      algo = "AES-CBC";
      length = 256;
    } else {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cryptoKey = await this.subtleCrypto.importKey("raw", key, { name: algo, length }, false, ["decrypt"]);
    const result = await this.subtleCrypto.decrypt({ name: algo, iv }, cryptoKey, data);
    return new Uint8Array(result);
  }
};
async function createCipher() {
  const cryptoLib = await getCryptoLib();
  if (cryptoLib.name === "subtleCrypto") {
    return new WebCryptoAesCipher(cryptoLib.lib);
  }
  return new NodeCryptoAesCipher(cryptoLib.lib.createCipheriv, cryptoLib.lib.createDecipheriv);
}

// node_modules/@stacks/encryption/dist/esm/keys.js
var import_bs58 = __toESM(require_bs58());

// node_modules/@stacks/encryption/dist/esm/hashRipemd160.js
function hashRipemd160(data) {
  return ripemd160(data);
}

// node_modules/@stacks/encryption/dist/esm/sha2Hash.js
var NodeCryptoSha2Hash = class {
  constructor(createHash) {
    this.createHash = createHash;
  }
  async digest(data, algorithm = "sha256") {
    try {
      const result = this.createHash(algorithm).update(data).digest();
      return Promise.resolve(result);
    } catch (error) {
      console.log(error);
      console.log(`Error performing ${algorithm} digest with Node.js 'crypto.createHash', falling back to JS implementation.`);
      return Promise.resolve(algorithm === "sha256" ? hashSha256Sync(data) : hashSha512Sync(data));
    }
  }
};
var WebCryptoSha2Hash = class {
  constructor(subtleCrypto) {
    this.subtleCrypto = subtleCrypto;
  }
  async digest(data, algorithm = "sha256") {
    let algo;
    if (algorithm === "sha256") {
      algo = "SHA-256";
    } else if (algorithm === "sha512") {
      algo = "SHA-512";
    } else {
      throw new Error(`Unsupported hash algorithm ${algorithm}`);
    }
    try {
      const hash2 = await this.subtleCrypto.digest(algo, data);
      return new Uint8Array(hash2);
    } catch (error) {
      console.log(error);
      console.log(`Error performing ${algorithm} digest with WebCrypto, falling back to JS implementation.`);
      return Promise.resolve(algorithm === "sha256" ? hashSha256Sync(data) : hashSha512Sync(data));
    }
  }
};
async function createSha2Hash() {
  const cryptoLib = await getCryptoLib();
  if (cryptoLib.name === "subtleCrypto") {
    return new WebCryptoSha2Hash(cryptoLib.lib);
  } else {
    return new NodeCryptoSha2Hash(cryptoLib.lib.createHash);
  }
}
function hashSha256Sync(data) {
  return sha256(data);
}
function hashSha512Sync(data) {
  return sha512(data);
}

// node_modules/@stacks/encryption/dist/esm/keys.js
var BITCOIN_PUBKEYHASH = 0;
utils2.hmacSha256Sync = (key, ...msgs) => {
  const h = hmac.create(sha256, key);
  msgs.forEach((msg) => h.update(msg));
  return h.digest();
};
function base58Encode(hash2) {
  const checksum2 = sha256(sha256(hash2));
  return import_bs58.default.encode(concatBytes3(hash2, checksum2).slice(0, hash2.length + 4));
}
function base58CheckEncode(version, hash2) {
  return base58Encode(concatBytes3(new Uint8Array([version]), hash2.slice(0, 20)));
}
function publicKeyToBtcAddress(publicKey, version = BITCOIN_PUBKEYHASH) {
  const publicKeyBytes = typeof publicKey === "string" ? hexToBytes3(publicKey) : publicKey;
  const publicKeyHash160 = hashRipemd160(hashSha256Sync(publicKeyBytes));
  return base58CheckEncode(version, publicKeyHash160);
}
function getPublicKeyFromPrivate(privateKey) {
  const privateKeyBytes = privateKeyToBytes(privateKey);
  return bytesToHex3(getPublicKey2(privateKeyBytes.slice(0, 32), true));
}
function ecSign(messageHash, privateKey) {
  return signSync2(messageHash, privateKeyToBytes(privateKey).slice(0, 32), {
    der: false
  });
}

// node_modules/@stacks/encryption/dist/esm/utils.js
function hashCode(string) {
  let hash2 = 0;
  if (string.length === 0)
    return hash2;
  for (let i = 0; i < string.length; i++) {
    const character = string.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + character;
    hash2 &= hash2;
  }
  return hash2 & 2147483647;
}

// node_modules/@stacks/encryption/dist/esm/ec.js
utils2.hmacSha256Sync = (key, ...msgs) => {
  const h = hmac.create(sha256, key);
  msgs.forEach((msg) => h.update(msg));
  return h.digest();
};
var InvalidPublicKeyReason;
(function(InvalidPublicKeyReason2) {
  InvalidPublicKeyReason2["InvalidFormat"] = "InvalidFormat";
  InvalidPublicKeyReason2["IsNotPoint"] = "IsNotPoint";
})(InvalidPublicKeyReason || (InvalidPublicKeyReason = {}));
async function aes256CbcEncrypt(iv, key, plaintext) {
  const cipher = await createCipher();
  return await cipher.encrypt("aes-256-cbc", key, iv, plaintext);
}
async function aes256CbcDecrypt(iv, key, ciphertext) {
  const cipher = await createCipher();
  return await cipher.decrypt("aes-256-cbc", key, iv, ciphertext);
}
function hmacSha256(key, content) {
  return hmac(sha256, key, content);
}
function equalsConstTime(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a[i] ^ b[i];
  }
  return res === 0;
}
function sharedSecretToKeys(sharedSecret) {
  const hashedSecret = hashSha512Sync(sharedSecret);
  return {
    encryptionKey: hashedSecret.slice(0, 32),
    hmacKey: hashedSecret.slice(32)
  };
}
function allHexChars(maybe) {
  return maybe.match(/^[0-9a-f]+$/i) !== null;
}
function isValidPublicKey(pub) {
  const invalidFormat = {
    result: false,
    reason_data: "Invalid public key format",
    reason: InvalidPublicKeyReason.InvalidFormat
  };
  const invalidPoint = {
    result: false,
    reason_data: "Public key is not a point",
    reason: InvalidPublicKeyReason.IsNotPoint
  };
  if (pub.length !== 66 && pub.length !== 130)
    return invalidFormat;
  const firstByte = pub.slice(0, 2);
  if (pub.length === 130 && firstByte !== "04")
    return invalidFormat;
  if (pub.length === 66 && firstByte !== "02" && firstByte !== "03")
    return invalidFormat;
  if (!allHexChars(pub))
    return invalidFormat;
  try {
    const point = Point2.fromHex(pub);
    point.assertValidity();
    return {
      result: true,
      reason_data: null,
      reason: null
    };
  } catch (e) {
    return invalidPoint;
  }
}
async function encryptECIES(publicKey, content, wasString, cipherTextEncoding) {
  const validity = isValidPublicKey(publicKey);
  if (!validity.result) {
    throw validity;
  }
  const ephemeralPrivateKey = utils2.randomPrivateKey();
  const ephemeralPublicKey = getPublicKey2(ephemeralPrivateKey, true);
  let sharedSecret = getSharedSecret(ephemeralPrivateKey, publicKey, true);
  sharedSecret = sharedSecret.slice(1);
  const sharedKeys = sharedSecretToKeys(sharedSecret);
  const initializationVector = utils2.randomBytes(16);
  const cipherText = await aes256CbcEncrypt(initializationVector, sharedKeys.encryptionKey, content);
  const macData = concatBytes3(initializationVector, ephemeralPublicKey, cipherText);
  const mac = hmacSha256(sharedKeys.hmacKey, macData);
  let cipherTextString;
  if (!cipherTextEncoding || cipherTextEncoding === "hex") {
    cipherTextString = bytesToHex3(cipherText);
  } else if (cipherTextEncoding === "base64") {
    cipherTextString = (0, import_base64_js.fromByteArray)(cipherText);
  } else {
    throw new Error(`Unexpected cipherTextEncoding "${cipherTextEncoding}"`);
  }
  const result = {
    iv: bytesToHex3(initializationVector),
    ephemeralPK: bytesToHex3(ephemeralPublicKey),
    cipherText: cipherTextString,
    mac: bytesToHex3(mac),
    wasString
  };
  if (cipherTextEncoding && cipherTextEncoding !== "hex") {
    result.cipherTextEncoding = cipherTextEncoding;
  }
  return result;
}
async function decryptECIES(privateKey, cipherObject) {
  if (!cipherObject.ephemeralPK) {
    throw new FailedDecryptionError("Unable to get public key from cipher object. You might be trying to decrypt an unencrypted object.");
  }
  const ephemeralPK = cipherObject.ephemeralPK;
  let sharedSecret = getSharedSecret(privateKey, ephemeralPK, true);
  sharedSecret = sharedSecret.slice(1);
  const sharedKeys = sharedSecretToKeys(sharedSecret);
  const ivBytes = hexToBytes3(cipherObject.iv);
  let cipherTextBytes;
  if (!cipherObject.cipherTextEncoding || cipherObject.cipherTextEncoding === "hex") {
    cipherTextBytes = hexToBytes3(cipherObject.cipherText);
  } else if (cipherObject.cipherTextEncoding === "base64") {
    cipherTextBytes = (0, import_base64_js.toByteArray)(cipherObject.cipherText);
  } else {
    throw new Error(`Unexpected cipherTextEncoding "${cipherObject.cipherText}"`);
  }
  const macData = concatBytes3(ivBytes, hexToBytes3(ephemeralPK), cipherTextBytes);
  const actualMac = hmacSha256(sharedKeys.hmacKey, macData);
  const expectedMac = hexToBytes3(cipherObject.mac);
  if (!equalsConstTime(expectedMac, actualMac)) {
    throw new FailedDecryptionError("Decryption failed: failure in MAC check");
  }
  const plainText = await aes256CbcDecrypt(ivBytes, sharedKeys.encryptionKey, cipherTextBytes);
  if (cipherObject.wasString) {
    return bytesToUtf8(plainText);
  }
  return plainText;
}
function signECDSA(privateKey, content) {
  const contentBytes = typeof content === "string" ? utf8ToBytes2(content) : content;
  const publicKey = getPublicKeyFromPrivate(privateKey);
  const contentHash = hashSha256Sync(contentBytes);
  const signature = signSync2(contentHash, privateKey);
  return {
    signature: bytesToHex3(signature),
    publicKey
  };
}

// node_modules/@stacks/encryption/dist/esm/cryptoRandom.js
var randomBytes = (bytesLength = 32) => utils2.randomBytes(bytesLength);

// node_modules/@stacks/encryption/dist/esm/encryption.js
async function encryptContent(content, options) {
  const opts = Object.assign({}, options);
  let privateKey;
  if (!opts.publicKey) {
    if (!opts.privateKey) {
      throw new Error("Either public key or private key must be supplied for encryption.");
    }
    opts.publicKey = getPublicKeyFromPrivate(opts.privateKey);
  }
  const wasString = typeof opts.wasString === "boolean" ? opts.wasString : typeof content === "string";
  const contentBytes = typeof content === "string" ? utf8ToBytes2(content) : content;
  const cipherObject = await encryptECIES(opts.publicKey, contentBytes, wasString, opts.cipherTextEncoding);
  let cipherPayload = JSON.stringify(cipherObject);
  if (opts.sign) {
    if (typeof opts.sign === "string") {
      privateKey = opts.sign;
    } else if (!privateKey) {
      privateKey = opts.privateKey;
    }
    const signatureObject = signECDSA(privateKey, cipherPayload);
    const signedCipherObject = {
      signature: signatureObject.signature,
      publicKey: signatureObject.publicKey,
      cipherText: cipherPayload
    };
    cipherPayload = JSON.stringify(signedCipherObject);
  }
  return cipherPayload;
}
function decryptContent(content, options) {
  const opts = Object.assign({}, options);
  if (!opts.privateKey) {
    throw new Error("Private key is required for decryption.");
  }
  try {
    const cipherObject = JSON.parse(content);
    return decryptECIES(opts.privateKey, cipherObject);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error("Failed to parse encrypted content JSON. The content may not be encrypted. If using getFile, try passing { decrypt: false }.");
    } else {
      throw err;
    }
  }
}

// node_modules/@stacks/encryption/dist/esm/wallet.js
var import_bip39 = __toESM(require_bip39());
var import_english = __toESM(require_english());

// node_modules/@stacks/encryption/dist/esm/pbkdf2.js
var NodeCryptoPbkdf2 = class {
  constructor(nodePbkdf2) {
    this.nodePbkdf2 = nodePbkdf2;
  }
  async derive(password, salt, iterations, keyLength, digest) {
    if (digest !== "sha512" && digest !== "sha256") {
      throw new Error(`Unsupported digest "${digest}" for Pbkdf2`);
    }
    return new Promise((resolve, reject) => {
      this.nodePbkdf2(password, salt, iterations, keyLength, digest, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
};
var WebCryptoPbkdf2 = class {
  constructor(subtleCrypto) {
    this.subtleCrypto = subtleCrypto;
  }
  async derive(password, salt, iterations, keyLength, digest) {
    let algo;
    if (digest === "sha256") {
      algo = "SHA-256";
    } else if (digest === "sha512") {
      algo = "SHA-512";
    } else {
      throw new Error(`Unsupported Pbkdf2 digest algorithm "${digest}"`);
    }
    const passwordBytes = utf8ToBytes2(password);
    try {
      const key = await this.subtleCrypto.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
      const result = await this.subtleCrypto.deriveBits({
        name: "PBKDF2",
        salt,
        iterations,
        hash: { name: algo }
      }, key, keyLength * 8);
      return new Uint8Array(result);
    } catch (error) {
      const partialWebCrypto = new WebCryptoPartialPbkdf2(this.subtleCrypto);
      return partialWebCrypto.derive(password, salt, iterations, keyLength, digest);
    }
  }
};
var WebCryptoPartialPbkdf2 = class {
  constructor(subtleCrypto) {
    this.subtleCrypto = subtleCrypto;
  }
  async derive(password, salt, iterations, keyLength, digest) {
    if (digest !== "sha512" && digest !== "sha256") {
      throw new Error(`Unsupported digest "${digest}" for Pbkdf2`);
    }
    const passwordBytes = utf8ToBytes2(password);
    const algo = digest === "sha512" ? "SHA-512" : "SHA-256";
    const algoOpts = { name: "HMAC", hash: algo };
    const hmacDigest = (key, data) => this.subtleCrypto.importKey("raw", key, algoOpts, true, ["sign"]).then((cryptoKey) => this.subtleCrypto.sign(algoOpts, cryptoKey, data)).then((result) => new Uint8Array(result));
    const DK = new Uint8Array(keyLength);
    const saltLength = salt.length;
    const block1 = new Uint8Array(saltLength + 4);
    block1.set(salt);
    let destPos = 0;
    const hLen = digest === "sha512" ? 64 : 32;
    const l = Math.ceil(keyLength / hLen);
    for (let i = 1; i <= l; i++) {
      writeUInt32BE(block1, i, saltLength);
      const T = await hmacDigest(passwordBytes, block1);
      let U = T;
      for (let j = 1; j < iterations; j++) {
        U = await hmacDigest(passwordBytes, U);
        for (let k = 0; k < hLen; k++) {
          T[k] ^= U[k];
        }
      }
      DK.set(T.subarray(0, DK.byteLength - destPos), destPos);
      destPos += hLen;
    }
    return DK;
  }
};
async function createPbkdf2() {
  const cryptoLib = await getCryptoLib();
  if (cryptoLib.name === "subtleCrypto") {
    return new WebCryptoPbkdf2(cryptoLib.lib);
  }
  return new NodeCryptoPbkdf2(cryptoLib.lib.pbkdf2);
}

// node_modules/@stacks/encryption/dist/esm/wallet.js
async function encryptMnemonic(phrase, password, opts) {
  let mnemonicEntropy;
  try {
    const entropyBytes = (0, import_bip39.mnemonicToEntropy)(phrase, import_english.wordlist);
    mnemonicEntropy = bytesToHex3(entropyBytes);
  } catch (error) {
    console.error("Invalid mnemonic phrase provided");
    console.error(error);
    throw new Error("Not a valid bip39 mnemonic");
  }
  const plaintextNormalized = hexToBytes3(mnemonicEntropy);
  const pbkdf2 = await createPbkdf2();
  const salt = opts?.getRandomBytes ? opts.getRandomBytes(16) : randomBytes(16);
  const keysAndIV = await pbkdf2.derive(password, salt, 1e5, 48, "sha512");
  const encKey = keysAndIV.slice(0, 16);
  const macKey = keysAndIV.slice(16, 32);
  const iv = keysAndIV.slice(32, 48);
  const cipher = await createCipher();
  const cipherText = await cipher.encrypt("aes-128-cbc", encKey, iv, plaintextNormalized);
  const hmacPayload = concatBytes3(salt, cipherText);
  const hmacDigest = hmacSha256(macKey, hmacPayload);
  return concatBytes3(salt, hmacDigest, cipherText);
}

// node_modules/@stacks/auth/dist/esm/messages.js
var import_jsontokens = __toESM(require_lib3());

// node_modules/@stacks/auth/dist/esm/dids.js
function makeDIDFromAddress(address) {
  return `did:btc-addr:${address}`;
}

// node_modules/@stacks/auth/dist/esm/messages.js
var VERSION = "1.4.0";
async function encryptPrivateKey(publicKey, privateKey) {
  const encryptedObj = await encryptECIES(publicKey, utf8ToBytes2(privateKey), true);
  const encryptedJSON = JSON.stringify(encryptedObj);
  return bytesToHex3(utf8ToBytes2(encryptedJSON));
}
async function makeAuthResponse(privateKey, profile = {}, metadata, coreToken = null, appPrivateKey = null, expiresAt = nextMonth().getTime(), transitPublicKey = null, hubUrl = null, blockstackAPIUrl = null, associationToken = null, appPrivateKeyFromWalletSalt = null) {
  const publicKey = import_jsontokens.SECP256K1Client.derivePublicKey(privateKey);
  const address = publicKeyToBtcAddress(publicKey);
  let privateKeyPayload = appPrivateKey;
  let coreTokenPayload = coreToken;
  let additionalProperties = {};
  if (appPrivateKey !== void 0 && appPrivateKey !== null) {
    if (transitPublicKey !== void 0 && transitPublicKey !== null) {
      privateKeyPayload = await encryptPrivateKey(transitPublicKey, appPrivateKey);
      if (coreToken !== void 0 && coreToken !== null) {
        coreTokenPayload = await encryptPrivateKey(transitPublicKey, coreToken);
      }
    }
    additionalProperties = {
      email: metadata?.email ? metadata.email : null,
      profile_url: metadata?.profileUrl ? metadata.profileUrl : null,
      hubUrl,
      blockstackAPIUrl,
      associationToken,
      version: VERSION
    };
  } else {
  }
  const payload = Object.assign({}, {
    jti: makeUUID4(),
    iat: Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3),
    exp: Math.floor(expiresAt / 1e3),
    iss: makeDIDFromAddress(address),
    private_key: privateKeyPayload,
    public_keys: [publicKey],
    appPrivateKeyFromWalletSalt,
    profile,
    core_token: coreTokenPayload
  }, additionalProperties);
  const tokenSigner = new import_jsontokens.TokenSigner("ES256k", privateKey);
  return tokenSigner.sign(payload);
}

// node_modules/@stacks/profile/dist/esm/profileTokens.js
var import_jsontokens2 = __toESM(require_lib3());

// node_modules/@stacks/network/dist/esm/constants.js
var ChainId;
(function(ChainId2) {
  ChainId2[ChainId2["Mainnet"] = 1] = "Mainnet";
  ChainId2[ChainId2["Testnet"] = 2147483648] = "Testnet";
})(ChainId || (ChainId = {}));
var PeerNetworkId;
(function(PeerNetworkId2) {
  PeerNetworkId2[PeerNetworkId2["Mainnet"] = 385875968] = "Mainnet";
  PeerNetworkId2[PeerNetworkId2["Testnet"] = 4278190080] = "Testnet";
})(PeerNetworkId || (PeerNetworkId = {}));
var DEFAULT_CHAIN_ID = ChainId.Mainnet;
var TransactionVersion;
(function(TransactionVersion2) {
  TransactionVersion2[TransactionVersion2["Mainnet"] = 0] = "Mainnet";
  TransactionVersion2[TransactionVersion2["Testnet"] = 128] = "Testnet";
})(TransactionVersion || (TransactionVersion = {}));
var AddressVersion;
(function(AddressVersion2) {
  AddressVersion2[AddressVersion2["MainnetSingleSig"] = 22] = "MainnetSingleSig";
  AddressVersion2[AddressVersion2["MainnetMultiSig"] = 20] = "MainnetMultiSig";
  AddressVersion2[AddressVersion2["TestnetSingleSig"] = 26] = "TestnetSingleSig";
  AddressVersion2[AddressVersion2["TestnetMultiSig"] = 21] = "TestnetMultiSig";
})(AddressVersion || (AddressVersion = {}));
var DEFAULT_TRANSACTION_VERSION = TransactionVersion.Mainnet;

// node_modules/@stacks/network/dist/esm/network.js
var STACKS_MAINNET = {
  chainId: ChainId.Mainnet,
  transactionVersion: TransactionVersion.Mainnet,
  peerNetworkId: PeerNetworkId.Mainnet,
  magicBytes: "X2",
  bootAddress: "SP000000000000000000002Q6VF78",
  addressVersion: {
    singleSig: AddressVersion.MainnetSingleSig,
    multiSig: AddressVersion.MainnetMultiSig
  },
  client: { baseUrl: HIRO_MAINNET_URL }
};
var STACKS_TESTNET = {
  chainId: ChainId.Testnet,
  transactionVersion: TransactionVersion.Testnet,
  peerNetworkId: PeerNetworkId.Testnet,
  magicBytes: "T2",
  bootAddress: "ST000000000000000000002AMW42H",
  addressVersion: {
    singleSig: AddressVersion.TestnetSingleSig,
    multiSig: AddressVersion.TestnetMultiSig
  },
  client: { baseUrl: HIRO_TESTNET_URL }
};
var STACKS_DEVNET = {
  ...STACKS_TESTNET,
  addressVersion: { ...STACKS_TESTNET.addressVersion },
  magicBytes: "id",
  client: { baseUrl: DEVNET_URL }
};
var STACKS_MOCKNET = {
  ...STACKS_DEVNET,
  addressVersion: { ...STACKS_DEVNET.addressVersion },
  client: { ...STACKS_DEVNET.client }
};
function networkFromName(name) {
  switch (name) {
    case "mainnet":
      return STACKS_MAINNET;
    case "testnet":
      return STACKS_TESTNET;
    case "devnet":
      return STACKS_DEVNET;
    case "mocknet":
      return STACKS_MOCKNET;
    default:
      throw new Error(`Unknown network name: ${name}`);
  }
}
function networkFrom(network) {
  if (typeof network === "string")
    return networkFromName(network);
  return network;
}
function clientFromNetwork(network) {
  if (network.client.fetch)
    return network.client;
  return {
    ...network.client,
    fetch: createFetchFn()
  };
}

// node_modules/@stacks/transactions/dist/esm/constants.js
var MAX_PAYLOAD_LEN = 1 + 16 * 1024 * 1024;
var PREAMBLE_ENCODED_SIZE = 165;
var MAX_RELAYERS_LEN = 16;
var PEER_ADDRESS_ENCODED_SIZE = 16;
var HASH160_ENCODED_SIZE = 20;
var NEIGHBOR_ADDRESS_ENCODED_SIZE = PEER_ADDRESS_ENCODED_SIZE + 2 + HASH160_ENCODED_SIZE;
var RELAY_DATA_ENCODED_SIZE = NEIGHBOR_ADDRESS_ENCODED_SIZE + 4;
var STRING_MAX_LENGTH = MAX_PAYLOAD_LEN + (PREAMBLE_ENCODED_SIZE + MAX_RELAYERS_LEN * RELAY_DATA_ENCODED_SIZE);
var PayloadType;
(function(PayloadType2) {
  PayloadType2[PayloadType2["TokenTransfer"] = 0] = "TokenTransfer";
  PayloadType2[PayloadType2["SmartContract"] = 1] = "SmartContract";
  PayloadType2[PayloadType2["VersionedSmartContract"] = 6] = "VersionedSmartContract";
  PayloadType2[PayloadType2["ContractCall"] = 2] = "ContractCall";
  PayloadType2[PayloadType2["PoisonMicroblock"] = 3] = "PoisonMicroblock";
  PayloadType2[PayloadType2["Coinbase"] = 4] = "Coinbase";
  PayloadType2[PayloadType2["CoinbaseToAltRecipient"] = 5] = "CoinbaseToAltRecipient";
  PayloadType2[PayloadType2["TenureChange"] = 7] = "TenureChange";
  PayloadType2[PayloadType2["NakamotoCoinbase"] = 8] = "NakamotoCoinbase";
})(PayloadType || (PayloadType = {}));
var ClarityVersion;
(function(ClarityVersion2) {
  ClarityVersion2[ClarityVersion2["Clarity1"] = 1] = "Clarity1";
  ClarityVersion2[ClarityVersion2["Clarity2"] = 2] = "Clarity2";
  ClarityVersion2[ClarityVersion2["Clarity3"] = 3] = "Clarity3";
  ClarityVersion2[ClarityVersion2["Clarity4"] = 4] = "Clarity4";
  ClarityVersion2[ClarityVersion2["Clarity5"] = 5] = "Clarity5";
  ClarityVersion2[ClarityVersion2["Clarity6"] = 6] = "Clarity6";
})(ClarityVersion || (ClarityVersion = {}));
var AnchorMode;
(function(AnchorMode2) {
  AnchorMode2[AnchorMode2["OnChainOnly"] = 1] = "OnChainOnly";
  AnchorMode2[AnchorMode2["OffChainOnly"] = 2] = "OffChainOnly";
  AnchorMode2[AnchorMode2["Any"] = 3] = "Any";
})(AnchorMode || (AnchorMode = {}));
var AnchorModeNames = ["onChainOnly", "offChainOnly", "any"];
var AnchorModeMap = {
  [AnchorModeNames[0]]: AnchorMode.OnChainOnly,
  [AnchorModeNames[1]]: AnchorMode.OffChainOnly,
  [AnchorModeNames[2]]: AnchorMode.Any,
  [AnchorMode.OnChainOnly]: AnchorMode.OnChainOnly,
  [AnchorMode.OffChainOnly]: AnchorMode.OffChainOnly,
  [AnchorMode.Any]: AnchorMode.Any
};
var PostConditionMode;
(function(PostConditionMode2) {
  PostConditionMode2[PostConditionMode2["Allow"] = 1] = "Allow";
  PostConditionMode2[PostConditionMode2["Deny"] = 2] = "Deny";
  PostConditionMode2[PostConditionMode2["Originator"] = 3] = "Originator";
})(PostConditionMode || (PostConditionMode = {}));
var PostConditionType;
(function(PostConditionType2) {
  PostConditionType2[PostConditionType2["STX"] = 0] = "STX";
  PostConditionType2[PostConditionType2["Fungible"] = 1] = "Fungible";
  PostConditionType2[PostConditionType2["NonFungible"] = 2] = "NonFungible";
  PostConditionType2[PostConditionType2["Staking"] = 3] = "Staking";
  PostConditionType2[PostConditionType2["PoX"] = 4] = "PoX";
})(PostConditionType || (PostConditionType = {}));
var AuthType;
(function(AuthType2) {
  AuthType2[AuthType2["Standard"] = 4] = "Standard";
  AuthType2[AuthType2["Sponsored"] = 5] = "Sponsored";
})(AuthType || (AuthType = {}));
var AddressHashMode;
(function(AddressHashMode2) {
  AddressHashMode2[AddressHashMode2["P2PKH"] = 0] = "P2PKH";
  AddressHashMode2[AddressHashMode2["P2SH"] = 1] = "P2SH";
  AddressHashMode2[AddressHashMode2["P2WPKH"] = 2] = "P2WPKH";
  AddressHashMode2[AddressHashMode2["P2WSH"] = 3] = "P2WSH";
  AddressHashMode2[AddressHashMode2["P2SHNonSequential"] = 5] = "P2SHNonSequential";
  AddressHashMode2[AddressHashMode2["P2WSHNonSequential"] = 7] = "P2WSHNonSequential";
})(AddressHashMode || (AddressHashMode = {}));
var PubKeyEncoding;
(function(PubKeyEncoding2) {
  PubKeyEncoding2[PubKeyEncoding2["Compressed"] = 0] = "Compressed";
  PubKeyEncoding2[PubKeyEncoding2["Uncompressed"] = 1] = "Uncompressed";
})(PubKeyEncoding || (PubKeyEncoding = {}));
var FungibleConditionCode;
(function(FungibleConditionCode2) {
  FungibleConditionCode2[FungibleConditionCode2["Equal"] = 1] = "Equal";
  FungibleConditionCode2[FungibleConditionCode2["Greater"] = 2] = "Greater";
  FungibleConditionCode2[FungibleConditionCode2["GreaterEqual"] = 3] = "GreaterEqual";
  FungibleConditionCode2[FungibleConditionCode2["Less"] = 4] = "Less";
  FungibleConditionCode2[FungibleConditionCode2["LessEqual"] = 5] = "LessEqual";
})(FungibleConditionCode || (FungibleConditionCode = {}));
var NonFungibleConditionCode;
(function(NonFungibleConditionCode2) {
  NonFungibleConditionCode2[NonFungibleConditionCode2["Sends"] = 16] = "Sends";
  NonFungibleConditionCode2[NonFungibleConditionCode2["DoesNotSend"] = 17] = "DoesNotSend";
  NonFungibleConditionCode2[NonFungibleConditionCode2["MaybeSent"] = 18] = "MaybeSent";
})(NonFungibleConditionCode || (NonFungibleConditionCode = {}));
var PoxConditionCode;
(function(PoxConditionCode2) {
  PoxConditionCode2[PoxConditionCode2["WillNotPerform"] = 48] = "WillNotPerform";
  PoxConditionCode2[PoxConditionCode2["MayPerform"] = 49] = "MayPerform";
  PoxConditionCode2[PoxConditionCode2["WillPerform"] = 50] = "WillPerform";
})(PoxConditionCode || (PoxConditionCode = {}));
var PostConditionPrincipalId;
(function(PostConditionPrincipalId2) {
  PostConditionPrincipalId2[PostConditionPrincipalId2["Origin"] = 1] = "Origin";
  PostConditionPrincipalId2[PostConditionPrincipalId2["Standard"] = 2] = "Standard";
  PostConditionPrincipalId2[PostConditionPrincipalId2["Contract"] = 3] = "Contract";
})(PostConditionPrincipalId || (PostConditionPrincipalId = {}));
var AssetType;
(function(AssetType2) {
  AssetType2[AssetType2["STX"] = 0] = "STX";
  AssetType2[AssetType2["Fungible"] = 1] = "Fungible";
  AssetType2[AssetType2["NonFungible"] = 2] = "NonFungible";
})(AssetType || (AssetType = {}));
var TenureChangeCause;
(function(TenureChangeCause2) {
  TenureChangeCause2[TenureChangeCause2["BlockFound"] = 0] = "BlockFound";
  TenureChangeCause2[TenureChangeCause2["Extended"] = 1] = "Extended";
  TenureChangeCause2[TenureChangeCause2["ExtendedRuntime"] = 2] = "ExtendedRuntime";
  TenureChangeCause2[TenureChangeCause2["ExtendedReadCount"] = 3] = "ExtendedReadCount";
  TenureChangeCause2[TenureChangeCause2["ExtendedReadLength"] = 4] = "ExtendedReadLength";
  TenureChangeCause2[TenureChangeCause2["ExtendedWriteCount"] = 5] = "ExtendedWriteCount";
  TenureChangeCause2[TenureChangeCause2["ExtendedWriteLength"] = 6] = "ExtendedWriteLength";
})(TenureChangeCause || (TenureChangeCause = {}));
var AuthFieldType;
(function(AuthFieldType2) {
  AuthFieldType2[AuthFieldType2["PublicKeyCompressed"] = 0] = "PublicKeyCompressed";
  AuthFieldType2[AuthFieldType2["PublicKeyUncompressed"] = 1] = "PublicKeyUncompressed";
  AuthFieldType2[AuthFieldType2["SignatureCompressed"] = 2] = "SignatureCompressed";
  AuthFieldType2[AuthFieldType2["SignatureUncompressed"] = 3] = "SignatureUncompressed";
})(AuthFieldType || (AuthFieldType = {}));
var TxRejectedReason;
(function(TxRejectedReason2) {
  TxRejectedReason2["Serialization"] = "Serialization";
  TxRejectedReason2["Deserialization"] = "Deserialization";
  TxRejectedReason2["SignatureValidation"] = "SignatureValidation";
  TxRejectedReason2["FeeTooLow"] = "FeeTooLow";
  TxRejectedReason2["BadNonce"] = "BadNonce";
  TxRejectedReason2["NotEnoughFunds"] = "NotEnoughFunds";
  TxRejectedReason2["NoSuchContract"] = "NoSuchContract";
  TxRejectedReason2["NoSuchPublicFunction"] = "NoSuchPublicFunction";
  TxRejectedReason2["BadFunctionArgument"] = "BadFunctionArgument";
  TxRejectedReason2["ContractAlreadyExists"] = "ContractAlreadyExists";
  TxRejectedReason2["PoisonMicroblocksDoNotConflict"] = "PoisonMicroblocksDoNotConflict";
  TxRejectedReason2["PoisonMicroblockHasUnknownPubKeyHash"] = "PoisonMicroblockHasUnknownPubKeyHash";
  TxRejectedReason2["PoisonMicroblockIsInvalid"] = "PoisonMicroblockIsInvalid";
  TxRejectedReason2["BadAddressVersionByte"] = "BadAddressVersionByte";
  TxRejectedReason2["NoCoinbaseViaMempool"] = "NoCoinbaseViaMempool";
  TxRejectedReason2["ServerFailureNoSuchChainTip"] = "ServerFailureNoSuchChainTip";
  TxRejectedReason2["ServerFailureDatabase"] = "ServerFailureDatabase";
  TxRejectedReason2["ServerFailureOther"] = "ServerFailureOther";
})(TxRejectedReason || (TxRejectedReason = {}));

// node_modules/@stacks/transactions/node_modules/@noble/secp256k1/lib/esm/index.js
var nodeCrypto3 = __toESM(require_crypto(), 1);
var _0n3 = BigInt(0);
var _1n3 = BigInt(1);
var _2n3 = BigInt(2);
var _3n3 = BigInt(3);
var _8n3 = BigInt(8);
var CURVE3 = Object.freeze({
  a: _0n3,
  b: BigInt(7),
  P: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: _1n3,
  Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
  Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee")
});
var divNearest3 = (a, b) => (a + b / _2n3) / b;
var endo3 = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  splitScalar(k) {
    const { n } = CURVE3;
    const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
    const b1 = -_1n3 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
    const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
    const b2 = a1;
    const POW_2_128 = BigInt("0x100000000000000000000000000000000");
    const c1 = divNearest3(b2 * k, n);
    const c2 = divNearest3(-b1 * k, n);
    let k1 = mod3(k - c1 * a1 - c2 * a2, n);
    let k2 = mod3(-c1 * b1 - c2 * b2, n);
    const k1neg = k1 > POW_2_128;
    const k2neg = k2 > POW_2_128;
    if (k1neg)
      k1 = n - k1;
    if (k2neg)
      k2 = n - k2;
    if (k1 > POW_2_128 || k2 > POW_2_128) {
      throw new Error("splitScalarEndo: Endomorphism failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
};
var fieldLen3 = 32;
var groupLen3 = 32;
var compressedLen3 = fieldLen3 + 1;
var uncompressedLen3 = 2 * fieldLen3 + 1;
function weierstrass3(x) {
  const { a, b } = CURVE3;
  const x2 = mod3(x * x);
  const x3 = mod3(x2 * x);
  return mod3(x3 + a * x + b);
}
var USE_ENDOMORPHISM3 = CURVE3.a === _0n3;
var ShaError3 = class extends Error {
  constructor(message) {
    super(message);
  }
};
function assertJacPoint3(other) {
  if (!(other instanceof JacobianPoint3))
    throw new TypeError("JacobianPoint expected");
}
var JacobianPoint3 = class _JacobianPoint {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static fromAffine(p) {
    if (!(p instanceof Point3)) {
      throw new TypeError("JacobianPoint#fromAffine: expected Point");
    }
    if (p.equals(Point3.ZERO))
      return _JacobianPoint.ZERO;
    return new _JacobianPoint(p.x, p.y, _1n3);
  }
  static toAffineBatch(points) {
    const toInv = invertBatch3(points.map((p) => p.z));
    return points.map((p, i) => p.toAffine(toInv[i]));
  }
  static normalizeZ(points) {
    return _JacobianPoint.toAffineBatch(points).map(_JacobianPoint.fromAffine);
  }
  equals(other) {
    assertJacPoint3(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    const Z1Z1 = mod3(Z1 * Z1);
    const Z2Z2 = mod3(Z2 * Z2);
    const U1 = mod3(X1 * Z2Z2);
    const U2 = mod3(X2 * Z1Z1);
    const S1 = mod3(mod3(Y1 * Z2) * Z2Z2);
    const S2 = mod3(mod3(Y2 * Z1) * Z1Z1);
    return U1 === U2 && S1 === S2;
  }
  negate() {
    return new _JacobianPoint(this.x, mod3(-this.y), this.z);
  }
  double() {
    const { x: X1, y: Y1, z: Z1 } = this;
    const A = mod3(X1 * X1);
    const B = mod3(Y1 * Y1);
    const C = mod3(B * B);
    const x1b = X1 + B;
    const D = mod3(_2n3 * (mod3(x1b * x1b) - A - C));
    const E = mod3(_3n3 * A);
    const F = mod3(E * E);
    const X3 = mod3(F - _2n3 * D);
    const Y3 = mod3(E * (D - X3) - _8n3 * C);
    const Z3 = mod3(_2n3 * Y1 * Z1);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  add(other) {
    assertJacPoint3(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    if (X2 === _0n3 || Y2 === _0n3)
      return this;
    if (X1 === _0n3 || Y1 === _0n3)
      return other;
    const Z1Z1 = mod3(Z1 * Z1);
    const Z2Z2 = mod3(Z2 * Z2);
    const U1 = mod3(X1 * Z2Z2);
    const U2 = mod3(X2 * Z1Z1);
    const S1 = mod3(mod3(Y1 * Z2) * Z2Z2);
    const S2 = mod3(mod3(Y2 * Z1) * Z1Z1);
    const H = mod3(U2 - U1);
    const r = mod3(S2 - S1);
    if (H === _0n3) {
      if (r === _0n3) {
        return this.double();
      } else {
        return _JacobianPoint.ZERO;
      }
    }
    const HH = mod3(H * H);
    const HHH = mod3(H * HH);
    const V = mod3(U1 * HH);
    const X3 = mod3(r * r - HHH - _2n3 * V);
    const Y3 = mod3(r * (V - X3) - S1 * HHH);
    const Z3 = mod3(Z1 * Z2 * H);
    return new _JacobianPoint(X3, Y3, Z3);
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiplyUnsafe(scalar) {
    const P0 = _JacobianPoint.ZERO;
    if (typeof scalar === "bigint" && scalar === _0n3)
      return P0;
    let n = normalizeScalar3(scalar);
    if (n === _1n3)
      return this;
    if (!USE_ENDOMORPHISM3) {
      let p = P0;
      let d2 = this;
      while (n > _0n3) {
        if (n & _1n3)
          p = p.add(d2);
        d2 = d2.double();
        n >>= _1n3;
      }
      return p;
    }
    let { k1neg, k1, k2neg, k2 } = endo3.splitScalar(n);
    let k1p = P0;
    let k2p = P0;
    let d = this;
    while (k1 > _0n3 || k2 > _0n3) {
      if (k1 & _1n3)
        k1p = k1p.add(d);
      if (k2 & _1n3)
        k2p = k2p.add(d);
      d = d.double();
      k1 >>= _1n3;
      k2 >>= _1n3;
    }
    if (k1neg)
      k1p = k1p.negate();
    if (k2neg)
      k2p = k2p.negate();
    k2p = new _JacobianPoint(mod3(k2p.x * endo3.beta), k2p.y, k2p.z);
    return k1p.add(k2p);
  }
  precomputeWindow(W) {
    const windows = USE_ENDOMORPHISM3 ? 128 / W + 1 : 256 / W + 1;
    const points = [];
    let p = this;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i = 1; i < 2 ** (W - 1); i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  wNAF(n, affinePoint) {
    if (!affinePoint && this.equals(_JacobianPoint.BASE))
      affinePoint = Point3.BASE;
    const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
    if (256 % W) {
      throw new Error("Point#wNAF: Invalid precomputation window, must be power of 2");
    }
    let precomputes = affinePoint && pointPrecomputes3.get(affinePoint);
    if (!precomputes) {
      precomputes = this.precomputeWindow(W);
      if (affinePoint && W !== 1) {
        precomputes = _JacobianPoint.normalizeZ(precomputes);
        pointPrecomputes3.set(affinePoint, precomputes);
      }
    }
    let p = _JacobianPoint.ZERO;
    let f2 = _JacobianPoint.BASE;
    const windows = 1 + (USE_ENDOMORPHISM3 ? 128 / W : 256 / W);
    const windowSize = 2 ** (W - 1);
    const mask = BigInt(2 ** W - 1);
    const maxNumber = 2 ** W;
    const shiftBy = BigInt(W);
    for (let window2 = 0; window2 < windows; window2++) {
      const offset = window2 * windowSize;
      let wbits = Number(n & mask);
      n >>= shiftBy;
      if (wbits > windowSize) {
        wbits -= maxNumber;
        n += _1n3;
      }
      const offset1 = offset;
      const offset2 = offset + Math.abs(wbits) - 1;
      const cond1 = window2 % 2 !== 0;
      const cond2 = wbits < 0;
      if (wbits === 0) {
        f2 = f2.add(constTimeNegate3(cond1, precomputes[offset1]));
      } else {
        p = p.add(constTimeNegate3(cond2, precomputes[offset2]));
      }
    }
    return { p, f: f2 };
  }
  multiply(scalar, affinePoint) {
    let n = normalizeScalar3(scalar);
    let point;
    let fake;
    if (USE_ENDOMORPHISM3) {
      const { k1neg, k1, k2neg, k2 } = endo3.splitScalar(n);
      let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
      let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
      k1p = constTimeNegate3(k1neg, k1p);
      k2p = constTimeNegate3(k2neg, k2p);
      k2p = new _JacobianPoint(mod3(k2p.x * endo3.beta), k2p.y, k2p.z);
      point = k1p.add(k2p);
      fake = f1p.add(f2p);
    } else {
      const { p, f: f2 } = this.wNAF(n, affinePoint);
      point = p;
      fake = f2;
    }
    return _JacobianPoint.normalizeZ([point, fake])[0];
  }
  toAffine(invZ) {
    const { x, y, z } = this;
    const is0 = this.equals(_JacobianPoint.ZERO);
    if (invZ == null)
      invZ = is0 ? _8n3 : invert3(z);
    const iz1 = invZ;
    const iz2 = mod3(iz1 * iz1);
    const iz3 = mod3(iz2 * iz1);
    const ax = mod3(x * iz2);
    const ay = mod3(y * iz3);
    const zz = mod3(z * iz1);
    if (is0)
      return Point3.ZERO;
    if (zz !== _1n3)
      throw new Error("invZ was invalid");
    return new Point3(ax, ay);
  }
};
JacobianPoint3.BASE = new JacobianPoint3(CURVE3.Gx, CURVE3.Gy, _1n3);
JacobianPoint3.ZERO = new JacobianPoint3(_0n3, _1n3, _0n3);
function constTimeNegate3(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
var pointPrecomputes3 = /* @__PURE__ */ new WeakMap();
var Point3 = class _Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  _setWindowSize(windowSize) {
    this._WINDOW_SIZE = windowSize;
    pointPrecomputes3.delete(this);
  }
  hasEvenY() {
    return this.y % _2n3 === _0n3;
  }
  static fromCompressedHex(bytes2) {
    const isShort = bytes2.length === 32;
    const x = bytesToNumber4(isShort ? bytes2 : bytes2.subarray(1));
    if (!isValidFieldElement3(x))
      throw new Error("Point is not on curve");
    const y2 = weierstrass3(x);
    let y = sqrtMod3(y2);
    const isYOdd = (y & _1n3) === _1n3;
    if (isShort) {
      if (isYOdd)
        y = mod3(-y);
    } else {
      const isFirstByteOdd = (bytes2[0] & 1) === 1;
      if (isFirstByteOdd !== isYOdd)
        y = mod3(-y);
    }
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromUncompressedHex(bytes2) {
    const x = bytesToNumber4(bytes2.subarray(1, fieldLen3 + 1));
    const y = bytesToNumber4(bytes2.subarray(fieldLen3 + 1, fieldLen3 * 2 + 1));
    const point = new _Point(x, y);
    point.assertValidity();
    return point;
  }
  static fromHex(hex) {
    const bytes2 = ensureBytes3(hex);
    const len = bytes2.length;
    const header = bytes2[0];
    if (len === fieldLen3)
      return this.fromCompressedHex(bytes2);
    if (len === compressedLen3 && (header === 2 || header === 3)) {
      return this.fromCompressedHex(bytes2);
    }
    if (len === uncompressedLen3 && header === 4)
      return this.fromUncompressedHex(bytes2);
    throw new Error(`Point.fromHex: received invalid point. Expected 32-${compressedLen3} compressed bytes or ${uncompressedLen3} uncompressed bytes, not ${len}`);
  }
  static fromPrivateKey(privateKey) {
    return _Point.BASE.multiply(normalizePrivateKey3(privateKey));
  }
  static fromSignature(msgHash, signature, recovery) {
    const { r, s } = normalizeSignature3(signature);
    if (![0, 1, 2, 3].includes(recovery))
      throw new Error("Cannot recover: invalid recovery bit");
    const h = truncateHash3(ensureBytes3(msgHash));
    const { n } = CURVE3;
    const radj = recovery === 2 || recovery === 3 ? r + n : r;
    const rinv = invert3(radj, n);
    const u1 = mod3(-h * rinv, n);
    const u2 = mod3(s * rinv, n);
    const prefix = recovery & 1 ? "03" : "02";
    const R = _Point.fromHex(prefix + numTo32bStr3(radj));
    const Q = _Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
    if (!Q)
      throw new Error("Cannot recover signature: point at infinify");
    Q.assertValidity();
    return Q;
  }
  toRawBytes(isCompressed = false) {
    return hexToBytes5(this.toHex(isCompressed));
  }
  toHex(isCompressed = false) {
    const x = numTo32bStr3(this.x);
    if (isCompressed) {
      const prefix = this.hasEvenY() ? "02" : "03";
      return `${prefix}${x}`;
    } else {
      return `04${x}${numTo32bStr3(this.y)}`;
    }
  }
  toHexX() {
    return this.toHex(true).slice(2);
  }
  toRawX() {
    return this.toRawBytes(true).slice(1);
  }
  assertValidity() {
    const msg = "Point is not on elliptic curve";
    const { x, y } = this;
    if (!isValidFieldElement3(x) || !isValidFieldElement3(y))
      throw new Error(msg);
    const left = mod3(y * y);
    const right = weierstrass3(x);
    if (mod3(left - right) !== _0n3)
      throw new Error(msg);
  }
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
  negate() {
    return new _Point(this.x, mod3(-this.y));
  }
  double() {
    return JacobianPoint3.fromAffine(this).double().toAffine();
  }
  add(other) {
    return JacobianPoint3.fromAffine(this).add(JacobianPoint3.fromAffine(other)).toAffine();
  }
  subtract(other) {
    return this.add(other.negate());
  }
  multiply(scalar) {
    return JacobianPoint3.fromAffine(this).multiply(scalar, this).toAffine();
  }
  multiplyAndAddUnsafe(Q, a, b) {
    const P = JacobianPoint3.fromAffine(this);
    const aP = a === _0n3 || a === _1n3 || this !== _Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
    const bQ = JacobianPoint3.fromAffine(Q).multiplyUnsafe(b);
    const sum = aP.add(bQ);
    return sum.equals(JacobianPoint3.ZERO) ? void 0 : sum.toAffine();
  }
};
Point3.BASE = new Point3(CURVE3.Gx, CURVE3.Gy);
Point3.ZERO = new Point3(_0n3, _0n3);
function sliceDER3(s) {
  return Number.parseInt(s[0], 16) >= 8 ? "00" + s : s;
}
function parseDERInt3(data) {
  if (data.length < 2 || data[0] !== 2) {
    throw new Error(`Invalid signature integer tag: ${bytesToHex5(data)}`);
  }
  const len = data[1];
  const res = data.subarray(2, len + 2);
  if (!len || res.length !== len) {
    throw new Error(`Invalid signature integer: wrong length`);
  }
  if (res[0] === 0 && res[1] <= 127) {
    throw new Error("Invalid signature integer: trailing length");
  }
  return { data: bytesToNumber4(res), left: data.subarray(len + 2) };
}
function parseDERSignature3(data) {
  if (data.length < 2 || data[0] != 48) {
    throw new Error(`Invalid signature tag: ${bytesToHex5(data)}`);
  }
  if (data[1] !== data.length - 2) {
    throw new Error("Invalid signature: incorrect length");
  }
  const { data: r, left: sBytes } = parseDERInt3(data.subarray(2));
  const { data: s, left: rBytesLeft } = parseDERInt3(sBytes);
  if (rBytesLeft.length) {
    throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex5(rBytesLeft)}`);
  }
  return { r, s };
}
var Signature3 = class _Signature {
  constructor(r, s) {
    this.r = r;
    this.s = s;
    this.assertValidity();
  }
  static fromCompact(hex) {
    const arr = hex instanceof Uint8Array;
    const name = "Signature.fromCompact";
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`${name}: Expected string or Uint8Array`);
    const str = arr ? bytesToHex5(hex) : hex;
    if (str.length !== 128)
      throw new Error(`${name}: Expected 64-byte hex`);
    return new _Signature(hexToNumber3(str.slice(0, 64)), hexToNumber3(str.slice(64, 128)));
  }
  static fromDER(hex) {
    const arr = hex instanceof Uint8Array;
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
    const { r, s } = parseDERSignature3(arr ? hex : hexToBytes5(hex));
    return new _Signature(r, s);
  }
  static fromHex(hex) {
    return this.fromDER(hex);
  }
  assertValidity() {
    const { r, s } = this;
    if (!isWithinCurveOrder3(r))
      throw new Error("Invalid Signature: r must be 0 < r < n");
    if (!isWithinCurveOrder3(s))
      throw new Error("Invalid Signature: s must be 0 < s < n");
  }
  hasHighS() {
    const HALF = CURVE3.n >> _1n3;
    return this.s > HALF;
  }
  normalizeS() {
    return this.hasHighS() ? new _Signature(this.r, mod3(-this.s, CURVE3.n)) : this;
  }
  toDERRawBytes() {
    return hexToBytes5(this.toDERHex());
  }
  toDERHex() {
    const sHex = sliceDER3(numberToHexUnpadded3(this.s));
    const rHex = sliceDER3(numberToHexUnpadded3(this.r));
    const sHexL = sHex.length / 2;
    const rHexL = rHex.length / 2;
    const sLen = numberToHexUnpadded3(sHexL);
    const rLen = numberToHexUnpadded3(rHexL);
    const length = numberToHexUnpadded3(rHexL + sHexL + 4);
    return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
  }
  toRawBytes() {
    return this.toDERRawBytes();
  }
  toHex() {
    return this.toDERHex();
  }
  toCompactRawBytes() {
    return hexToBytes5(this.toCompactHex());
  }
  toCompactHex() {
    return numTo32bStr3(this.r) + numTo32bStr3(this.s);
  }
};
function concatBytes5(...arrays) {
  if (!arrays.every((b) => b instanceof Uint8Array))
    throw new Error("Uint8Array list expected");
  if (arrays.length === 1)
    return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
var hexes5 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex5(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  let hex = "";
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes5[uint8a[i]];
  }
  return hex;
}
var POW_2_2563 = BigInt("0x10000000000000000000000000000000000000000000000000000000000000000");
function numTo32bStr3(num) {
  if (typeof num !== "bigint")
    throw new Error("Expected bigint");
  if (!(_0n3 <= num && num < POW_2_2563))
    throw new Error("Expected number 0 <= n < 2^256");
  return num.toString(16).padStart(64, "0");
}
function numTo32b3(num) {
  const b = hexToBytes5(numTo32bStr3(num));
  if (b.length !== 32)
    throw new Error("Error: expected 32 bytes");
  return b;
}
function numberToHexUnpadded3(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber3(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToNumber: expected string, got " + typeof hex);
  }
  return BigInt(`0x${hex}`);
}
function hexToBytes5(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToBytes: expected string, got " + typeof hex);
  }
  if (hex.length % 2)
    throw new Error("hexToBytes: received invalid unpadded hex" + hex.length);
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function bytesToNumber4(bytes2) {
  return hexToNumber3(bytesToHex5(bytes2));
}
function ensureBytes3(hex) {
  return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes5(hex);
}
function normalizeScalar3(num) {
  if (typeof num === "number" && Number.isSafeInteger(num) && num > 0)
    return BigInt(num);
  if (typeof num === "bigint" && isWithinCurveOrder3(num))
    return num;
  throw new TypeError("Expected valid private scalar: 0 < scalar < curve.n");
}
function mod3(a, b = CURVE3.P) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow23(x, power) {
  const { P } = CURVE3;
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= P;
  }
  return res;
}
function sqrtMod3(x) {
  const { P } = CURVE3;
  const _6n = BigInt(6);
  const _11n = BigInt(11);
  const _22n = BigInt(22);
  const _23n = BigInt(23);
  const _44n = BigInt(44);
  const _88n = BigInt(88);
  const b2 = x * x * x % P;
  const b3 = b2 * b2 * x % P;
  const b6 = pow23(b3, _3n3) * b3 % P;
  const b9 = pow23(b6, _3n3) * b3 % P;
  const b11 = pow23(b9, _2n3) * b2 % P;
  const b22 = pow23(b11, _11n) * b11 % P;
  const b44 = pow23(b22, _22n) * b22 % P;
  const b88 = pow23(b44, _44n) * b44 % P;
  const b176 = pow23(b88, _88n) * b88 % P;
  const b220 = pow23(b176, _44n) * b44 % P;
  const b223 = pow23(b220, _3n3) * b3 % P;
  const t1 = pow23(b223, _23n) * b22 % P;
  const t2 = pow23(t1, _6n) * b2 % P;
  const rt = pow23(t2, _2n3);
  const xc = rt * rt % P;
  if (xc !== x)
    throw new Error("Cannot find square root");
  return rt;
}
function invert3(number2, modulo = CURVE3.P) {
  if (number2 === _0n3 || modulo <= _0n3) {
    throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
  }
  let a = mod3(number2, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod3(x, modulo);
}
function invertBatch3(nums, p = CURVE3.P) {
  const scratch = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (num === _0n3)
      return acc;
    scratch[i] = acc;
    return mod3(acc * num, p);
  }, _1n3);
  const inverted = invert3(lastMultiplied, p);
  nums.reduceRight((acc, num, i) => {
    if (num === _0n3)
      return acc;
    scratch[i] = mod3(acc * scratch[i], p);
    return mod3(acc * num, p);
  }, inverted);
  return scratch;
}
function bits2int_23(bytes2) {
  const delta = bytes2.length * 8 - groupLen3 * 8;
  const num = bytesToNumber4(bytes2);
  return delta > 0 ? num >> BigInt(delta) : num;
}
function truncateHash3(hash2, truncateOnly = false) {
  const h = bits2int_23(hash2);
  if (truncateOnly)
    return h;
  const { n } = CURVE3;
  return h >= n ? h - n : h;
}
var _sha256Sync3;
var _hmacSha256Sync3;
function isWithinCurveOrder3(num) {
  return _0n3 < num && num < CURVE3.n;
}
function isValidFieldElement3(num) {
  return _0n3 < num && num < CURVE3.P;
}
function normalizePrivateKey3(key) {
  let num;
  if (typeof key === "bigint") {
    num = key;
  } else if (typeof key === "number" && Number.isSafeInteger(key) && key > 0) {
    num = BigInt(key);
  } else if (typeof key === "string") {
    if (key.length !== 2 * groupLen3)
      throw new Error("Expected 32 bytes of private key");
    num = hexToNumber3(key);
  } else if (key instanceof Uint8Array) {
    if (key.length !== groupLen3)
      throw new Error("Expected 32 bytes of private key");
    num = bytesToNumber4(key);
  } else {
    throw new TypeError("Expected valid private key");
  }
  if (!isWithinCurveOrder3(num))
    throw new Error("Expected private key: 0 < key < n");
  return num;
}
function normalizeSignature3(signature) {
  if (signature instanceof Signature3) {
    signature.assertValidity();
    return signature;
  }
  try {
    return Signature3.fromDER(signature);
  } catch (error) {
    return Signature3.fromCompact(signature);
  }
}
function getPublicKey3(privateKey, isCompressed = false) {
  return Point3.fromPrivateKey(privateKey).toRawBytes(isCompressed);
}
Point3.BASE._setWindowSize(8);
var crypto5 = {
  node: nodeCrypto3,
  web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
};
var TAGGED_HASH_PREFIXES3 = {};
var utils3 = {
  bytesToHex: bytesToHex5,
  hexToBytes: hexToBytes5,
  concatBytes: concatBytes5,
  mod: mod3,
  invert: invert3,
  isValidPrivateKey(privateKey) {
    try {
      normalizePrivateKey3(privateKey);
      return true;
    } catch (error) {
      return false;
    }
  },
  _bigintTo32Bytes: numTo32b3,
  _normalizePrivateKey: normalizePrivateKey3,
  hashToPrivateKey: (hash2) => {
    hash2 = ensureBytes3(hash2);
    const minLen = groupLen3 + 8;
    if (hash2.length < minLen || hash2.length > 1024) {
      throw new Error(`Expected valid bytes of private key as per FIPS 186`);
    }
    const num = mod3(bytesToNumber4(hash2), CURVE3.n - _1n3) + _1n3;
    return numTo32b3(num);
  },
  randomBytes: (bytesLength = 32) => {
    if (crypto5.web) {
      return crypto5.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto5.node) {
      const { randomBytes: randomBytes2 } = crypto5.node;
      return Uint8Array.from(randomBytes2(bytesLength));
    } else {
      throw new Error("The environment doesn't have randomBytes function");
    }
  },
  randomPrivateKey: () => utils3.hashToPrivateKey(utils3.randomBytes(groupLen3 + 8)),
  precompute(windowSize = 8, point = Point3.BASE) {
    const cached = point === Point3.BASE ? point : new Point3(point.x, point.y);
    cached._setWindowSize(windowSize);
    cached.multiply(_3n3);
    return cached;
  },
  sha256: async (...messages) => {
    if (crypto5.web) {
      const buffer = await crypto5.web.subtle.digest("SHA-256", concatBytes5(...messages));
      return new Uint8Array(buffer);
    } else if (crypto5.node) {
      const { createHash } = crypto5.node;
      const hash2 = createHash("sha256");
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have sha256 function");
    }
  },
  hmacSha256: async (key, ...messages) => {
    if (crypto5.web) {
      const ckey = await crypto5.web.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
      const message = concatBytes5(...messages);
      const buffer = await crypto5.web.subtle.sign("HMAC", ckey, message);
      return new Uint8Array(buffer);
    } else if (crypto5.node) {
      const { createHmac } = crypto5.node;
      const hash2 = createHmac("sha256", key);
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have hmac-sha256 function");
    }
  },
  sha256Sync: void 0,
  hmacSha256Sync: void 0,
  taggedHash: async (tag, ...messages) => {
    let tagP = TAGGED_HASH_PREFIXES3[tag];
    if (tagP === void 0) {
      const tagH = await utils3.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes5(tagH, tagH);
      TAGGED_HASH_PREFIXES3[tag] = tagP;
    }
    return utils3.sha256(tagP, ...messages);
  },
  taggedHashSync: (tag, ...messages) => {
    if (typeof _sha256Sync3 !== "function")
      throw new ShaError3("sha256Sync is undefined, you need to set it");
    let tagP = TAGGED_HASH_PREFIXES3[tag];
    if (tagP === void 0) {
      const tagH = _sha256Sync3(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes5(tagH, tagH);
      TAGGED_HASH_PREFIXES3[tag] = tagP;
    }
    return _sha256Sync3(tagP, ...messages);
  },
  _JacobianPoint: JacobianPoint3
};
Object.defineProperties(utils3, {
  sha256Sync: {
    configurable: false,
    get() {
      return _sha256Sync3;
    },
    set(val) {
      if (!_sha256Sync3)
        _sha256Sync3 = val;
    }
  },
  hmacSha256Sync: {
    configurable: false,
    get() {
      return _hmacSha256Sync3;
    },
    set(val) {
      if (!_hmacSha256Sync3)
        _hmacSha256Sync3 = val;
    }
  }
});

// node_modules/@stacks/transactions/dist/esm/keys.js
var import_c32check3 = __toESM(require_lib4());

// node_modules/@stacks/transactions/dist/esm/address.js
function addressHashModeToVersion(hashMode, network) {
  network = networkFrom(network ?? STACKS_MAINNET);
  switch (hashMode) {
    case AddressHashMode.P2PKH:
      switch (network.transactionVersion) {
        case TransactionVersion.Mainnet:
          return AddressVersion.MainnetSingleSig;
        case TransactionVersion.Testnet:
          return AddressVersion.TestnetSingleSig;
        default:
          throw new Error(`Unexpected transactionVersion ${network.transactionVersion} for hashMode ${hashMode}`);
      }
    case AddressHashMode.P2SH:
    case AddressHashMode.P2SHNonSequential:
    case AddressHashMode.P2WPKH:
    case AddressHashMode.P2WSH:
    case AddressHashMode.P2WSHNonSequential:
      switch (network.transactionVersion) {
        case TransactionVersion.Mainnet:
          return AddressVersion.MainnetMultiSig;
        case TransactionVersion.Testnet:
          return AddressVersion.TestnetMultiSig;
        default:
          throw new Error(`Unexpected transactionVersion ${network.transactionVersion} for hashMode ${hashMode}`);
      }
    default:
      throw new Error(`Unexpected hashMode ${hashMode}`);
  }
}

// node_modules/@stacks/transactions/dist/esm/utils.js
var import_c32check2 = __toESM(require_lib4());
var import_lodash = __toESM(require_lodash());

// node_modules/@stacks/transactions/dist/esm/wire/types.js
var StacksWireType;
(function(StacksWireType2) {
  StacksWireType2[StacksWireType2["Address"] = 0] = "Address";
  StacksWireType2[StacksWireType2["Principal"] = 1] = "Principal";
  StacksWireType2[StacksWireType2["LengthPrefixedString"] = 2] = "LengthPrefixedString";
  StacksWireType2[StacksWireType2["MemoString"] = 3] = "MemoString";
  StacksWireType2[StacksWireType2["Asset"] = 4] = "Asset";
  StacksWireType2[StacksWireType2["PostCondition"] = 5] = "PostCondition";
  StacksWireType2[StacksWireType2["PublicKey"] = 6] = "PublicKey";
  StacksWireType2[StacksWireType2["LengthPrefixedList"] = 7] = "LengthPrefixedList";
  StacksWireType2[StacksWireType2["Payload"] = 8] = "Payload";
  StacksWireType2[StacksWireType2["MessageSignature"] = 9] = "MessageSignature";
  StacksWireType2[StacksWireType2["StructuredDataSignature"] = 10] = "StructuredDataSignature";
  StacksWireType2[StacksWireType2["TransactionAuthField"] = 11] = "TransactionAuthField";
})(StacksWireType || (StacksWireType = {}));

// node_modules/@stacks/transactions/dist/esm/wire/helpers.js
var import_c32check = __toESM(require_lib4());
function addressFromVersionHash(version, hash2) {
  return { type: StacksWireType.Address, version, hash160: hash2 };
}
function addressToString(address) {
  return (0, import_c32check.c32address)(address.version, address.hash160);
}

// node_modules/@stacks/transactions/dist/esm/utils.js
var hash1602 = (input) => {
  return ripemd160(sha256(input));
};
var hashP2PKH = (input) => {
  return bytesToHex3(hash1602(input));
};

// node_modules/@stacks/transactions/dist/esm/keys.js
utils3.hmacSha256Sync = (key, ...msgs) => {
  const h = hmac.create(sha256, key);
  msgs.forEach((msg) => h.update(msg));
  return h.digest();
};
function getAddressFromPrivateKey(privateKey, network = "mainnet") {
  network = networkFrom(network);
  const publicKey = privateKeyToPublic(privateKey);
  return getAddressFromPublicKey(publicKey, network);
}
function getAddressFromPublicKey(publicKey, network = "mainnet") {
  network = networkFrom(network);
  publicKey = typeof publicKey === "string" ? hexToBytes3(publicKey) : publicKey;
  const addrVer = addressHashModeToVersion(AddressHashMode.P2PKH, network);
  const addr = addressFromVersionHash(addrVer, hashP2PKH(publicKey));
  const addrString = addressToString(addr);
  return addrString;
}
function privateKeyToHex(publicKey) {
  return typeof publicKey === "string" ? publicKey : bytesToHex3(publicKey);
}
function privateKeyIsCompressed(privateKey) {
  const length = typeof privateKey === "string" ? privateKey.length / 2 : privateKey.byteLength;
  return length === PRIVATE_KEY_BYTES_COMPRESSED;
}
function privateKeyToPublic(privateKey) {
  privateKey = privateKeyToBytes(privateKey);
  const isCompressed = privateKeyIsCompressed(privateKey);
  return bytesToHex3(getPublicKey3(privateKey.slice(0, 32), isCompressed));
}
function compressPrivateKey(privateKey) {
  privateKey = privateKeyToHex(privateKey);
  return privateKey.length == PRIVATE_KEY_BYTES_COMPRESSED * 2 ? privateKey : `${privateKey}01`;
}

// node_modules/@stacks/profile/dist/esm/profileTokens.js
function signProfileToken(profile, privateKey, subject, issuer, signingAlgorithm = "ES256K", issuedAt = /* @__PURE__ */ new Date(), expiresAt = nextYear()) {
  if (signingAlgorithm !== "ES256K") {
    throw new Error("Signing algorithm not supported");
  }
  const publicKey = import_jsontokens2.SECP256K1Client.derivePublicKey(privateKey);
  if (!subject) {
    subject = { publicKey };
  }
  if (!issuer) {
    issuer = { publicKey };
  }
  const tokenSigner = new import_jsontokens2.TokenSigner(signingAlgorithm, privateKey);
  const payload = {
    jti: makeUUID4(),
    iat: issuedAt.toISOString(),
    exp: expiresAt.toISOString(),
    subject,
    issuer,
    claim: profile
  };
  return tokenSigner.sign(payload);
}
function wrapProfileToken(token) {
  return {
    token,
    decodedToken: (0, import_jsontokens2.decodeToken)(token)
  };
}

// node_modules/@stacks/auth/dist/esm/profile.js
function getNameInfo(opts) {
  const network = networkFrom(opts.network ?? "mainnet");
  const client = Object.assign({}, clientFromNetwork(network), opts.client);
  const nameLookupURL = `${client.baseUrl}/v1/names/${opts.name}`;
  return client.fetch(nameLookupURL).then((resp) => {
    if (resp.status === 404) {
      throw new Error("Name not found");
    } else if (resp.status !== 200) {
      throw new Error(`Bad response status: ${resp.status}`);
    } else {
      return resp.json();
    }
  }).then((nameInfo) => {
    if (nameInfo.address) {
      return Object.assign({}, nameInfo, { address: nameInfo.address });
    } else {
      return nameInfo;
    }
  });
}

// node_modules/@stacks/wallet-sdk/dist/esm/models/common.js
var HARDENED_OFFSET2 = 2147483648;
var getGaiaAddress = (account) => {
  const publicKey = getPublicKeyFromPrivate(account.dataPrivateKey);
  const address = publicKeyToBtcAddress(publicKey);
  return address;
};
var getRootNode = (wallet) => {
  return HDKey.fromExtendedKey(wallet.rootKey);
};

// node_modules/@stacks/wallet-sdk/dist/esm/usernames.js
var fetchFirstName = async (opts) => {
  const network = networkFrom(opts.network ?? "mainnet");
  const client = Object.assign({}, clientFromNetwork(network), opts.client);
  try {
    const namesResponse = await client.fetch(`${client.baseUrl}/v1/addresses/stacks/${opts.address}`);
    const namesJson = await namesResponse.json();
    if ((namesJson.names.length || 0) > 0) {
      return namesJson.names[0];
    }
  } catch (e) {
  }
  return void 0;
};

// node_modules/@stacks/wallet-sdk/dist/esm/utils.js
var import_jsontokens3 = __toESM(require_lib3());
var import_zone_file = __toESM(require_dist());
function assertIsTruthy(val) {
  if (!val) {
    throw new Error(`expected: true, actual: ${val}`);
  }
}
var getProfileURLFromZoneFile = async (name, fetchFn = createFetchFn()) => {
  const url = `https://api.hiro.so/v1/names/${name}`;
  const res = await fetchFn(url);
  if (res.ok) {
    const nameInfo = await res.json();
    const zone = (0, import_zone_file.parseZoneFile)(nameInfo.zonefile);
    const uri = zone.uri?.[0]?.target;
    if (uri) {
      return uri;
    }
    throw new Error(`No zonefile uri found: ${nameInfo.zonefile}`);
  }
  return;
};
var getHubInfo = async (gaiaHubUrl, fetchFn = createFetchFn()) => {
  const response = await fetchFn(`${gaiaHubUrl}/hub_info`);
  if (!response.ok)
    throw new Error("Failed to fetch hub info");
  const data = await response.json();
  return data;
};
var makeGaiaAuthToken = ({ hubInfo, privateKey, gaiaHubUrl }) => {
  const challengeText = hubInfo.challenge_text;
  const iss = getPublicKeyFromPrivate(privateKey);
  const salt = bytesToHex3(randomBytes(16));
  const payload = {
    gaiaHubUrl,
    iss,
    salt
  };
  if (challengeText) {
    payload.gaiaChallenge = challengeText;
  }
  const token = new import_jsontokens3.TokenSigner("ES256K", privateKey).sign(payload);
  return `v1:${token}`;
};
var connectToGaiaHubWithConfig = ({ hubInfo, privateKey, gaiaHubUrl }) => {
  const readURL = hubInfo.read_url_prefix;
  const token = makeGaiaAuthToken({ hubInfo, privateKey, gaiaHubUrl });
  const address = publicKeyToBtcAddress(getPublicKeyFromPrivate(privateKey));
  return {
    url_prefix: readURL,
    max_file_upload_size_megabytes: 100,
    address,
    token,
    server: gaiaHubUrl
  };
};
var makeGaiaAssociationToken = ({ privateKey: secretKeyHex, childPublicKeyHex }) => {
  const LIFETIME_SECONDS = 365 * 24 * 3600;
  const signerKeyHex = secretKeyHex.slice(0, 64);
  const compressedPublicKeyHex = getPublicKeyFromPrivate(signerKeyHex);
  const salt = bytesToHex3(randomBytes(16));
  const payload = {
    childToAssociate: childPublicKeyHex,
    iss: compressedPublicKeyHex,
    exp: LIFETIME_SECONDS + (/* @__PURE__ */ new Date()).getTime() / 1e3,
    iat: Date.now() / 1e3,
    salt
  };
  const tokenSigner = new import_jsontokens3.TokenSigner("ES256K", signerKeyHex);
  const token = tokenSigner.sign(payload);
  return token;
};
function whenChainId(chainId) {
  return (chainIdMap) => chainIdMap[chainId];
}

// node_modules/@stacks/wallet-sdk/dist/esm/derive.js
var DATA_DERIVATION_PATH = `m/888'/0'`;
var WALLET_CONFIG_PATH = `m/44/5757'/0'/1`;
var STX_DERIVATION_PATH = `m/44'/5757'/0'/0`;
var deriveWalletKeys = async (rootNode) => {
  assertIsTruthy(rootNode.privateKey);
  return {
    salt: await deriveSalt(rootNode),
    rootKey: rootNode.privateExtendedKey,
    configPrivateKey: bytesToHex3(deriveConfigPrivateKey(rootNode))
  };
};
var deriveConfigPrivateKey = (rootNode) => {
  const derivedConfigKey = rootNode.derive(WALLET_CONFIG_PATH).privateKey;
  if (!derivedConfigKey)
    throw new TypeError("Unable to derive config key for wallet identities");
  return derivedConfigKey;
};
var deriveLegacyConfigPrivateKey = (rootNode) => {
  const derivedLegacyKey = rootNode.deriveChild(45 + HARDENED_OFFSET2).privateKey;
  if (!derivedLegacyKey)
    throw new TypeError("Unable to derive config key for wallet identities");
  return bytesToHex3(derivedLegacyKey);
};
var deriveSalt = async (rootNode) => {
  const identitiesKeychain = rootNode.derive(DATA_DERIVATION_PATH);
  const publicKeyHex = utf8ToBytes2(bytesToHex3(identitiesKeychain.publicKey));
  const sha2Hash = await createSha2Hash();
  const saltData = await sha2Hash.digest(publicKeyHex, "sha256");
  return bytesToHex3(saltData);
};
var DerivationType;
(function(DerivationType2) {
  DerivationType2[DerivationType2["Wallet"] = 0] = "Wallet";
  DerivationType2[DerivationType2["Data"] = 1] = "Data";
  DerivationType2[DerivationType2["Unknown"] = 2] = "Unknown";
})(DerivationType || (DerivationType = {}));
var selectStxDerivation = async ({ username, rootNode, index, network }) => {
  if (network)
    network = networkFrom(network);
  if (username) {
    const stxDerivationTypeForUsername = await selectDerivationTypeForUsername({
      username,
      rootNode,
      index,
      network
    });
    return { username, stxDerivationType: stxDerivationTypeForUsername };
  } else {
    const { username: username2, derivationType } = await selectUsernameForAccount({
      rootNode,
      index,
      network
    });
    return { username: username2, stxDerivationType: derivationType };
  }
};
var selectDerivationTypeForUsername = async ({ username, rootNode, index, network }) => {
  if (network) {
    const nameInfo = await getNameInfo({ name: username });
    const stxPrivateKey = deriveStxPrivateKey({ rootNode, index });
    let derivedAddress = getAddressFromPrivateKey(stxPrivateKey);
    if (derivedAddress !== nameInfo.address) {
      const dataPrivateKey = deriveDataPrivateKey({
        rootNode,
        index
      });
      derivedAddress = getAddressFromPrivateKey(dataPrivateKey);
      if (derivedAddress !== nameInfo.address) {
        return DerivationType.Unknown;
      } else {
        return DerivationType.Data;
      }
    } else {
      return DerivationType.Wallet;
    }
  } else {
    return DerivationType.Unknown;
  }
};
var selectUsernameForAccount = async (opts) => {
  const network = networkFrom(opts.network ?? "mainnet");
  const client = Object.assign({}, clientFromNetwork(network), opts.client);
  if (opts.network) {
    const stxPrivateKey = deriveStxPrivateKey(opts);
    const address = getAddressFromPrivateKey(stxPrivateKey, opts.network);
    let username = await fetchFirstName({ address, client });
    if (username) {
      return { username, derivationType: DerivationType.Wallet };
    } else {
      const dataPrivateKey = deriveDataPrivateKey(opts);
      const address2 = getAddressFromPrivateKey(dataPrivateKey, opts.network);
      username = await fetchFirstName({ address: address2, client });
      if (username) {
        return { username, derivationType: DerivationType.Data };
      }
    }
  }
  return { username: void 0, derivationType: DerivationType.Wallet };
};
var fetchUsernameForAccountByDerivationType = async (opts) => {
  const network = networkFrom(opts.network ?? "mainnet");
  const client = Object.assign({}, clientFromNetwork(network), opts.client);
  const privateKey = derivePrivateKeyByType(opts);
  const address = getAddressFromPrivateKey(privateKey, network);
  const username = await fetchFirstName({ address, client });
  return { username };
};
var derivePrivateKeyByType = ({ rootNode, index, derivationType }) => {
  return derivationType === DerivationType.Wallet ? deriveStxPrivateKey({ rootNode, index }) : deriveDataPrivateKey({ rootNode, index });
};
var deriveStxPrivateKey = ({ rootNode, index }) => {
  const childKey = rootNode.derive(STX_DERIVATION_PATH).deriveChild(index);
  assertIsTruthy(childKey.privateKey);
  return compressPrivateKey(childKey.privateKey);
};
var deriveDataPrivateKey = ({ rootNode, index }) => {
  const childKey = rootNode.derive(DATA_DERIVATION_PATH).deriveChild(index + HARDENED_OFFSET2);
  assertIsTruthy(childKey.privateKey);
  return compressPrivateKey(childKey.privateKey);
};
var deriveAccount = ({ rootNode, index, salt, stxDerivationType }) => {
  const stxPrivateKey = stxDerivationType === DerivationType.Wallet ? deriveStxPrivateKey({ rootNode, index }) : deriveDataPrivateKey({ rootNode, index });
  const identitiesKeychain = rootNode.derive(DATA_DERIVATION_PATH);
  const identityKeychain = identitiesKeychain.deriveChild(index + HARDENED_OFFSET2);
  if (!identityKeychain.privateKey)
    throw new Error("Must have private key to derive identities");
  const dataPrivateKey = bytesToHex3(identityKeychain.privateKey);
  const appsKey = identityKeychain.deriveChild(0 + HARDENED_OFFSET2).privateExtendedKey;
  return {
    stxPrivateKey,
    dataPrivateKey,
    appsKey,
    salt,
    index
  };
};

// node_modules/@stacks/wallet-sdk/dist/esm/generate.js
function randomSeedPhrase(entropy = 256) {
  return (0, import_bip392.generateMnemonic)(import_english2.wordlist, entropy);
}
var generateSecretKey = randomSeedPhrase;
var generateWallet = async ({ secretKey, password }) => {
  const ciphertextBytes = await encryptMnemonic(secretKey, password);
  const encryptedSecretKey = bytesToHex3(ciphertextBytes);
  const rootPrivateKey = await (0, import_bip392.mnemonicToSeed)(secretKey);
  const rootNode = HDKey.fromMasterSeed(rootPrivateKey);
  const walletKeys = await deriveWalletKeys(rootNode);
  const wallet = {
    ...walletKeys,
    encryptedSecretKey,
    accounts: [],
    config: {
      accounts: []
    }
  };
  return generateNewAccount(wallet);
};
var generateNewAccount = (wallet) => {
  const accountIndex = wallet.accounts.length;
  const newAccount = deriveAccount({
    rootNode: getRootNode(wallet),
    index: accountIndex,
    salt: wallet.salt,
    stxDerivationType: DerivationType.Wallet
  });
  return {
    ...wallet,
    accounts: [...wallet.accounts, newAccount]
  };
};

// node_modules/@stacks/wallet-sdk/dist/esm/models/legacy-wallet-config.js
async function fetchLegacyWalletConfig({ wallet, gaiaHubConfig, fetchFn = createFetchFn() }) {
  const rootNode = getRootNode(wallet);
  const legacyConfigKey = deriveLegacyConfigPrivateKey(rootNode);
  try {
    const response = await fetchFn(`${gaiaHubConfig.url_prefix}${gaiaHubConfig.address}/wallet-config.json`);
    if (!response.ok)
      return null;
    const encrypted = await response.text();
    const configJSON = await decryptContent(encrypted, {
      privateKey: legacyConfigKey
    });
    const config2 = JSON.parse(configJSON);
    return config2;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// node_modules/@stacks/storage/dist/esm/hub.js
var import_base64_js2 = __toESM(require_base64_js());
var import_jsontokens4 = __toESM(require_lib3());
async function uploadToGaiaHub(filename, contents, hubConfig, contentType = "application/octet-stream", newFile = true, etag, dangerouslyIgnoreEtag, fetchFn = createFetchFn()) {
  Logger.debug(`uploadToGaiaHub: uploading ${filename} to ${hubConfig.server}`);
  const headers = {
    "Content-Type": contentType,
    Authorization: `bearer ${hubConfig.token}`
  };
  if (!dangerouslyIgnoreEtag) {
    if (newFile) {
      headers["If-None-Match"] = "*";
    } else if (etag) {
      headers["If-Match"] = etag;
    }
  }
  const response = await fetchFn(`${hubConfig.server}/store/${hubConfig.address}/${filename}`, {
    method: "POST",
    headers,
    body: contents
  });
  if (!response.ok) {
    throw await getBlockstackErrorFromResponse(response, "Error when uploading to Gaia hub.", hubConfig);
  }
  const responseText = await response.text();
  return JSON.parse(responseText);
}
function makeLegacyAuthToken(challengeText, signerKeyHex) {
  let parsedChallenge;
  try {
    parsedChallenge = JSON.parse(challengeText);
  } catch (err) {
    throw new Error("Failed in parsing legacy challenge text from the gaia hub.");
  }
  if (parsedChallenge[0] === "gaiahub" && parsedChallenge[3] === "blockstack_storage_please_sign") {
    const digest = hashSha256Sync(utf8ToBytes2(challengeText));
    const compressedPrivateKey = signerKeyHex.length === PRIVATE_KEY_BYTES_COMPRESSED * 2 ? signerKeyHex : `${signerKeyHex}01`;
    const signatureBytes = ecSign(digest, compressedPrivateKey);
    const signature = Signature2.fromCompact(bytesToHex3(signatureBytes)).toDERHex();
    const publickey = getPublicKeyFromPrivate(signerKeyHex);
    const token = (0, import_base64_js2.fromByteArray)(utf8ToBytes2(JSON.stringify({ publickey, signature })));
    return token;
  }
  throw new Error("Failed to connect to legacy gaia hub. If you operate this hub, please update.");
}
function makeV1GaiaAuthToken(hubInfo, signerKeyHex, hubUrl, associationToken) {
  const challengeText = hubInfo.challenge_text;
  const handlesV1Auth = hubInfo.latest_auth_version && parseInt(hubInfo.latest_auth_version.slice(1), 10) >= 1;
  const iss = getPublicKeyFromPrivate(signerKeyHex);
  if (!handlesV1Auth) {
    return makeLegacyAuthToken(challengeText, signerKeyHex);
  }
  const salt = bytesToHex3(randomBytes(16));
  const payload = {
    gaiaChallenge: challengeText,
    hubUrl,
    iss,
    salt,
    associationToken
  };
  const token = new import_jsontokens4.TokenSigner("ES256K", signerKeyHex).sign(payload);
  return `v1:${token}`;
}
async function connectToGaiaHub(gaiaHubUrl, challengeSignerHex, associationToken, fetchFn = createFetchFn()) {
  Logger.debug(`connectToGaiaHub: ${gaiaHubUrl}/hub_info`);
  const response = await fetchFn(`${gaiaHubUrl}/hub_info`);
  const hubInfo = await response.json();
  const readURL = hubInfo.read_url_prefix;
  const token = makeV1GaiaAuthToken(hubInfo, challengeSignerHex, gaiaHubUrl, associationToken);
  const address = publicKeyToBtcAddress(getPublicKeyFromPrivate(challengeSignerHex));
  return {
    url_prefix: readURL,
    max_file_upload_size_megabytes: hubInfo.max_file_upload_size_megabytes,
    address,
    token,
    server: gaiaHubUrl
  };
}
async function getGaiaErrorResponse(response) {
  let responseMsg = "";
  let responseJson;
  try {
    responseMsg = await response.text();
    try {
      responseJson = JSON.parse(responseMsg);
    } catch (error) {
    }
  } catch (error) {
    Logger.debug(`Error getting bad http response text: ${error}`);
  }
  const status = response.status;
  const statusText = response.statusText;
  const body = responseJson || responseMsg;
  return { status, statusText, body };
}
async function getBlockstackErrorFromResponse(response, errorMsg, hubConfig) {
  if (response.ok) {
    throw new Error("Cannot get a BlockstackError from a valid response.");
  }
  const gaiaResponse = await getGaiaErrorResponse(response);
  if (gaiaResponse.status === 401) {
    return new ValidationError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 402) {
    return new NotEnoughProofError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 403) {
    return new BadPathError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 404) {
    throw new DoesNotExist(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 409) {
    return new ConflictError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 412) {
    return new PreconditionFailedError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 413) {
    const maxBytes = hubConfig && hubConfig.max_file_upload_size_megabytes ? megabytesToBytes(hubConfig.max_file_upload_size_megabytes) : 0;
    return new PayloadTooLargeError(errorMsg, gaiaResponse, maxBytes);
  } else {
    return new Error(errorMsg);
  }
}

// node_modules/@stacks/wallet-sdk/dist/esm/models/wallet-config.js
var createWalletGaiaConfig = async ({ gaiaHubUrl, wallet }) => {
  return connectToGaiaHub(gaiaHubUrl, wallet.configPrivateKey);
};
var getOrCreateWalletConfig = async ({ wallet, gaiaHubConfig, skipUpload, fetchFn = createFetchFn() }) => {
  const config2 = await fetchWalletConfig({ wallet, gaiaHubConfig, fetchFn });
  if (config2)
    return config2;
  const newConfig = makeWalletConfig(wallet);
  if (!skipUpload) {
    await updateWalletConfig({ wallet, gaiaHubConfig });
  }
  return newConfig;
};
var fetchWalletConfig = async ({ wallet, gaiaHubConfig, fetchFn = createFetchFn() }) => {
  try {
    const response = await fetchFn(`${gaiaHubConfig.url_prefix}${gaiaHubConfig.address}/wallet-config.json`);
    if (!response.ok)
      return null;
    const encrypted = await response.text();
    const configJSON = await decryptContent(encrypted, {
      privateKey: wallet.configPrivateKey
    });
    const config2 = JSON.parse(configJSON);
    return config2;
  } catch (error) {
    console.error(error);
    return null;
  }
};
var updateWalletConfig = async ({ wallet, walletConfig: _walletConfig, gaiaHubConfig }) => {
  const walletConfig = _walletConfig || makeWalletConfig(wallet);
  const encrypted = await encryptWalletConfig({ wallet, walletConfig });
  await uploadToGaiaHub("wallet-config.json", encrypted, gaiaHubConfig, void 0, void 0, void 0, true);
  return walletConfig;
};
function makeWalletConfig(wallet) {
  return {
    accounts: wallet.accounts.map((account) => ({
      username: account.username,
      apps: {}
    }))
  };
}
var encryptWalletConfig = async ({ wallet, walletConfig }) => {
  const publicKey = getPublicKeyFromPrivate(wallet.configPrivateKey);
  const encrypted = await encryptContent(JSON.stringify(walletConfig), { publicKey });
  return encrypted;
};
var updateWalletConfigWithApp = async ({ wallet, account, app, gaiaHubConfig, walletConfig }) => {
  wallet.accounts.forEach((account2, index) => {
    const configApp = walletConfig.accounts[index];
    if (configApp) {
      configApp.apps = configApp.apps || {};
      configApp.username = account2.username;
      walletConfig.accounts[index] = configApp;
    } else {
      walletConfig.accounts.push({
        username: account2.username,
        apps: {}
      });
    }
  });
  const configAccount = walletConfig.accounts[account.index];
  configAccount.apps = configAccount.apps || {};
  configAccount.apps[app.origin] = app;
  walletConfig.accounts[account.index] = configAccount;
  await updateWalletConfig({ wallet, walletConfig, gaiaHubConfig });
  return walletConfig;
};

// node_modules/@stacks/wallet-sdk/dist/esm/models/wallet.js
async function restoreWalletAccounts({ wallet, gaiaHubUrl, network = "mainnet", client: _client }) {
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const hubInfo = await getHubInfo(gaiaHubUrl, client.fetch);
  const rootNode = getRootNode(wallet);
  const legacyGaiaConfig = connectToGaiaHubWithConfig({
    hubInfo,
    privateKey: deriveLegacyConfigPrivateKey(getRootNode(wallet)),
    gaiaHubUrl
  });
  const currentGaiaConfig = connectToGaiaHubWithConfig({
    hubInfo,
    privateKey: wallet.configPrivateKey,
    gaiaHubUrl
  });
  const [walletConfig, legacyWalletConfig] = await Promise.all([
    fetchWalletConfig({ wallet, gaiaHubConfig: currentGaiaConfig, fetchFn: client.fetch }),
    fetchLegacyWalletConfig({ wallet, gaiaHubConfig: legacyGaiaConfig, fetchFn: client.fetch })
  ]);
  if (walletConfig && walletConfig.accounts.length >= (legacyWalletConfig?.identities.length || 0)) {
    const newAccounts = await Promise.all(walletConfig.accounts.map(async (_, index) => {
      let existingAccount = wallet.accounts[index];
      const { username } = await fetchUsernameForAccountByDerivationType({
        rootNode,
        index,
        derivationType: DerivationType.Wallet,
        network
      });
      if (!existingAccount) {
        existingAccount = deriveAccount({
          rootNode,
          index,
          salt: wallet.salt,
          stxDerivationType: DerivationType.Wallet
        });
      } else {
        existingAccount = {
          ...existingAccount,
          stxPrivateKey: deriveStxPrivateKey({
            rootNode,
            index
          })
        };
      }
      return {
        ...existingAccount,
        username
      };
    }));
    return {
      ...wallet,
      accounts: newAccounts
    };
  }
  if (legacyWalletConfig) {
    const newAccounts = await Promise.all(legacyWalletConfig.identities.map(async (_, index) => {
      let existingAccount = wallet.accounts[index];
      const { username } = await fetchUsernameForAccountByDerivationType({
        rootNode,
        index,
        derivationType: DerivationType.Wallet,
        network
      });
      if (!existingAccount) {
        existingAccount = deriveAccount({
          rootNode,
          index,
          salt: wallet.salt,
          stxDerivationType: DerivationType.Wallet
        });
      } else {
        existingAccount = {
          ...existingAccount,
          stxPrivateKey: deriveStxPrivateKey({
            rootNode,
            index
          })
        };
      }
      return {
        ...existingAccount,
        username
      };
    }));
    const meta = {};
    if (legacyWalletConfig.hideWarningForReusingIdentity) {
      meta.hideWarningForReusingIdentity = true;
    }
    const newConfig = {
      accounts: legacyWalletConfig.identities.map((identity) => ({
        username: identity.username,
        apps: identity.apps
      })),
      meta
    };
    await updateWalletConfig({
      wallet,
      walletConfig: newConfig,
      gaiaHubConfig: currentGaiaConfig
    });
    return {
      ...wallet,
      accounts: newAccounts
    };
  }
  return wallet;
}

// node_modules/@stacks/wallet-sdk/dist/esm/models/profile.js
var DEFAULT_PROFILE = {
  "@type": "Person",
  "@context": "http://schema.org"
};
var DEFAULT_PROFILE_FILE_NAME = "profile.json";
var fetchProfileFromUrl = async (profileUrl, fetchFn = createFetchFn()) => {
  try {
    const res = await fetchFn(profileUrl);
    if (res.ok) {
      const json = await res.json();
      const { decodedToken } = json[0];
      return decodedToken.payload?.claim;
    }
    if (res.status === 404)
      return null;
    throw new Error("Network error when fetching profile");
  } catch (error) {
    return null;
  }
};
var fetchAccountProfileUrl = async ({ account, gaiaHubUrl }) => {
  if (account.username) {
    try {
      const url = await getProfileURLFromZoneFile(account.username);
      if (url)
        return url;
    } catch (error) {
      if (true) {
        console.warn("Error fetching profile URL from zone file:", error);
      }
    }
  }
  return `${gaiaHubUrl}${getGaiaAddress(account)}/profile.json`;
};
function signProfileForUpload({ profile, account }) {
  const privateKey = account.stxPrivateKey;
  const publicKey = getPublicKeyFromPrivate(privateKey.slice(0, 64));
  const token = signProfileToken(profile, privateKey, { publicKey });
  const tokenRecord = wrapProfileToken(token);
  const tokenRecords = [tokenRecord];
  return JSON.stringify(tokenRecords, null, 2);
}
async function uploadProfile({ gaiaHubUrl, account, signedProfileTokenData, gaiaHubConfig }) {
  const identityHubConfig = gaiaHubConfig || await connectToGaiaHub(gaiaHubUrl, account.dataPrivateKey);
  await uploadToGaiaHub(DEFAULT_PROFILE_FILE_NAME, signedProfileTokenData, identityHubConfig, void 0, void 0, void 0, true);
}
var signAndUploadProfile = async ({ profile, gaiaHubUrl, account, gaiaHubConfig }) => {
  const signedProfileTokenData = signProfileForUpload({ profile, account });
  await uploadProfile({ gaiaHubUrl, account, signedProfileTokenData, gaiaHubConfig });
};

// node_modules/@stacks/wallet-sdk/dist/esm/models/account.js
function getStxAddress(accountOrOptions, network = "mainnet") {
  if ("account" in accountOrOptions) {
    const { account, network: network2 = "mainnet" } = accountOrOptions;
    return getAddressFromPrivateKey(account.stxPrivateKey, network2);
  }
  return getAddressFromPrivateKey(accountOrOptions.stxPrivateKey, network);
}
var getAccountDisplayName = (account) => {
  if (account.username) {
    return account.username.split(".")[0];
  }
  return `Account ${account.index + 1}`;
};
var getAppPrivateKey = ({ account, appDomain }) => {
  const hashBytes = hashSha256Sync(utf8ToBytes2(`${appDomain}${account.salt}`));
  const hash2 = bytesToHex3(hashBytes);
  const appIndex = hashCode(hash2);
  const appsNode = HDKey.fromExtendedKey(account.appsKey);
  const appKeychain = appsNode.deriveChild(appIndex + HARDENED_OFFSET2);
  if (!appKeychain.privateKey)
    throw "Needs private key";
  return bytesToHex3(appKeychain.privateKey);
};
async function optionalGaiaProfileData({ gaiaHubUrl, fetchFn, account }) {
  const hubInfo = await getHubInfo(gaiaHubUrl, fetchFn).catch(() => void 0);
  if (!hubInfo)
    return {};
  const profileUrl = await fetchAccountProfileUrl({ account, gaiaHubUrl: hubInfo.read_url_prefix });
  const profile = await fetchProfileFromUrl(profileUrl, fetchFn) || DEFAULT_PROFILE;
  return { hubInfo, profileUrl, profile };
}
var makeAuthResponse2 = async ({ account, appDomain, transitPublicKey, scopes = [], gaiaHubUrl, appPrivateKeyFromWalletSalt = null, additionalData = {}, fetchFn = createFetchFn() }) => {
  const appPrivateKey = getAppPrivateKey({ account, appDomain });
  const { hubInfo, profileUrl, profile } = await optionalGaiaProfileData({
    gaiaHubUrl,
    fetchFn,
    account
  });
  if (scopes.includes("publish_data") && hubInfo && profile) {
    if (!profile.apps) {
      profile.apps = {};
    }
    const publicKey = getPublicKeyFromPrivate(appPrivateKey);
    const address = publicKeyToBtcAddress(publicKey);
    const storageUrl = `${hubInfo.read_url_prefix}${address}/`;
    profile.apps[appDomain] = storageUrl;
    if (!profile.appsMeta) {
      profile.appsMeta = {};
    }
    profile.appsMeta[appDomain] = {
      storage: storageUrl,
      publicKey
    };
    const gaiaHubConfig = connectToGaiaHubWithConfig({
      hubInfo,
      privateKey: account.dataPrivateKey,
      gaiaHubUrl
    });
    await signAndUploadProfile({ profile, account, gaiaHubUrl, gaiaHubConfig });
  }
  const compressedAppPublicKey = getPublicKeyFromPrivate(appPrivateKey.slice(0, 64));
  const associationToken = makeGaiaAssociationToken({
    privateKey: account.dataPrivateKey,
    childPublicKeyHex: compressedAppPublicKey
  });
  return makeAuthResponse(account.dataPrivateKey, {
    ...profile || {},
    stxAddress: {
      testnet: getStxAddress({ account, network: "testnet" }),
      mainnet: getStxAddress({ account, network: "mainnet" })
    },
    ...additionalData
  }, profileUrl ? { profileUrl } : null, void 0, appPrivateKey, void 0, transitPublicKey, gaiaHubUrl, void 0, associationToken, appPrivateKeyFromWalletSalt);
};
export {
  DEFAULT_PROFILE,
  DEFAULT_PROFILE_FILE_NAME,
  DerivationType,
  HARDENED_OFFSET2 as HARDENED_OFFSET,
  assertIsTruthy,
  connectToGaiaHubWithConfig,
  createWalletGaiaConfig,
  deriveAccount,
  deriveConfigPrivateKey,
  deriveDataPrivateKey,
  deriveLegacyConfigPrivateKey,
  derivePrivateKeyByType,
  deriveSalt,
  deriveStxPrivateKey,
  deriveWalletKeys,
  encryptWalletConfig,
  fetchAccountProfileUrl,
  fetchLegacyWalletConfig,
  fetchProfileFromUrl,
  fetchUsernameForAccountByDerivationType,
  fetchWalletConfig,
  generateNewAccount,
  generateSecretKey,
  generateWallet,
  getAccountDisplayName,
  getAppPrivateKey,
  getGaiaAddress,
  getHubInfo,
  getOrCreateWalletConfig,
  getProfileURLFromZoneFile,
  getRootNode,
  getStxAddress,
  makeAuthResponse2 as makeAuthResponse,
  makeGaiaAssociationToken,
  makeWalletConfig,
  randomSeedPhrase,
  restoreWalletAccounts,
  selectStxDerivation,
  signAndUploadProfile,
  signProfileForUpload,
  updateWalletConfig,
  updateWalletConfigWithApp,
  uploadProfile,
  whenChainId
};
/*! Bundled license information:

@noble/hashes/utils.js:
@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/lib/index.js:
@scure/base/lib/esm/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip39/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@noble/secp256k1/lib/index.js:
@noble/secp256k1/lib/esm/index.js:
@noble/secp256k1/lib/esm/index.js:
@noble/secp256k1/lib/esm/index.js:
  (*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/
