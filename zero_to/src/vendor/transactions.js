var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  try {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  } catch (e) {
    throw mod2 = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
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
    var hexes4 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
    function bytesToHex3(uint8a) {
      if (!(uint8a instanceof Uint8Array))
        throw new Error("Uint8Array expected");
      let hex = "";
      for (let i = 0; i < uint8a.length; i++) {
        hex += hexes4[uint8a[i]];
      }
      return hex;
    }
    exports.bytesToHex = bytesToHex3;
    function hexToBytes3(hex) {
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
    exports.hexToBytes = hexToBytes3;
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
    exports.concatBytes = concatBytes3;
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
    function bool3(b) {
      if (typeof b !== "boolean")
        throw new Error(`Expected boolean, not ${b}`);
    }
    exports.bool = bool3;
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
      bool: bool3,
      bytes: bytes2,
      hash: hash2,
      exists: exists2,
      output: output2
    };
    exports.default = assert2;
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
        const { view, buffer: buffer2, blockLen } = this;
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
          buffer2.set(data.subarray(pos, pos + take), this.pos);
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
        const { buffer: buffer2, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer2[pos++] = 128;
        this.buffer.subarray(pos).fill(0);
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer2[i] = 0;
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
        const { buffer: buffer2, outputLen } = this;
        this.digestInto(buffer2);
        const res = buffer2.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
          to.buffer.set(buffer2);
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
      const checksum = (0, utils_1.bytesToHex)(dataHash.slice(0, 4));
      return checksum;
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
      const checksum = dataHex.slice(-8);
      let versionHex = version.toString(16);
      if (versionHex.length === 1) {
        versionHex = `0${versionHex}`;
      }
      if (c32checksum(`${versionHex}${dataHex.substring(0, dataHex.length - 8)}`) !== checksum) {
        throw new Error("Invalid c32check string: checksum mismatch");
      }
      return [version, dataHex.substring(0, dataHex.length - 8)];
    }
    exports.c32checkDecode = c32checkDecode;
  }
});

// node_modules/c32check/node_modules/base-x/src/index.js
var require_src = __commonJS({
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
        var buffer2 = decodeUnsafe(string);
        if (buffer2) {
          return buffer2;
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
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    function encode(data, prefix = "00") {
      const dataBytes = typeof data === "string" ? (0, utils_1.hexToBytes)(data) : data;
      const prefixBytes = typeof prefix === "string" ? (0, utils_1.hexToBytes)(prefix) : data;
      if (!(dataBytes instanceof Uint8Array) || !(prefixBytes instanceof Uint8Array)) {
        throw new TypeError("Argument must be of type Uint8Array or string");
      }
      const checksum = (0, sha256_1.sha256)((0, sha256_1.sha256)(new Uint8Array([...prefixBytes, ...dataBytes])));
      return basex(ALPHABET).encode([...prefixBytes, ...dataBytes, ...checksum.slice(0, 4)]);
    }
    exports.encode = encode;
    function decode(string) {
      const bytes2 = basex(ALPHABET).decode(string);
      const prefixBytes = bytes2.slice(0, 1);
      const dataBytes = bytes2.slice(1, -4);
      const checksum = (0, sha256_1.sha256)((0, sha256_1.sha256)(new Uint8Array([...prefixBytes, ...dataBytes])));
      bytes2.slice(-4).forEach((check, index) => {
        if (check !== checksum[index]) {
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
    var base58check = require_base58check();
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
    function c32address5(version, hash160hex) {
      if (!hash160hex.match(/^[0-9a-fA-F]{40}$/)) {
        throw new Error("Invalid argument: not a hash160 hex string");
      }
      const c32string = (0, checksum_1.c32checkEncode)(version, hash160hex);
      return `S${c32string}`;
    }
    exports.c32address = c32address5;
    function c32addressDecode4(c32addr) {
      if (c32addr.length <= 5) {
        throw new Error("Invalid c32 address: invalid length");
      }
      if (c32addr[0] != "S") {
        throw new Error('Invalid c32 address: must start with "S"');
      }
      return (0, checksum_1.c32checkDecode)(c32addr.slice(1));
    }
    exports.c32addressDecode = c32addressDecode4;
    function b58ToC32(b58check, version = -1) {
      const addrInfo = base58check.decode(b58check);
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
      return c32address5(stacksVersion, hash160String);
    }
    exports.b58ToC32 = b58ToC32;
    function c32ToB58(c32string, version = -1) {
      const addrInfo = c32addressDecode4(c32string);
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
      return base58check.encode(hash160String, prefix);
    }
    exports.c32ToB58 = c32ToB58;
  }
});

// node_modules/c32check/lib/index.js
var require_lib = __commonJS({
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
    var Map2 = getNative(root, "Map");
    var Promise2 = getNative(root, "Promise");
    var Set2 = getNative(root, "Set");
    var WeakMap2 = getNative(root, "WeakMap");
    var nativeCreate = getNative(Object, "create");
    var dataViewCtorString = toSource(DataView2);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
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
        "map": new (Map2 || ListCache)(),
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
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
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
    function cloneBuffer(buffer2, isDeep) {
      if (isDeep) {
        return buffer2.slice();
      }
      var result = new buffer2.constructor(buffer2.length);
      buffer2.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneDataView(dataView, isDeep) {
      var buffer2 = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer2, dataView.byteOffset, dataView.byteLength);
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
      var buffer2 = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer2, typedArray.byteOffset, typedArray.length);
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
    if (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
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
    function cloneDeep2(value) {
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
    module.exports = cloneDeep2;
  }
});

// node_modules/@stacks/common/dist/esm/utils.js
function intToBytes(value, byteLength) {
  return bigIntToBytes(intToBigInt(value), byteLength);
}
function intToBigInt(value) {
  if (typeof value === "bigint")
    return value;
  if (typeof value === "string")
    return BigInt(value);
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new RangeError(`Invalid value. Values of type 'number' must be an integer.`);
    }
    if (value > Number.MAX_SAFE_INTEGER) {
      throw new RangeError(`Invalid value. Values of type 'number' must be less than or equal to ${Number.MAX_SAFE_INTEGER}. For larger values, try using a BigInt instead.`);
    }
    return BigInt(value);
  }
  if (isInstance(value, Uint8Array))
    return BigInt(`0x${bytesToHex(value)}`);
  throw new TypeError(`intToBigInt: Invalid value type. Must be a number, bigint, BigInt-compatible string, or Uint8Array.`);
}
function with0x(value) {
  return /^0x/i.test(value) ? value : `0x${value}`;
}
function without0x(value) {
  return /^0x/i.test(value) ? value.slice(2) : value;
}
function hexToBigInt(hex) {
  if (typeof hex !== "string")
    throw new TypeError(`hexToBigInt: expected string, got ${typeof hex}`);
  return BigInt(`0x${hex}`);
}
function intToHex(integer, byteLength = 8) {
  const value = typeof integer === "bigint" ? integer : intToBigInt(integer);
  return value.toString(16).padStart(byteLength * 2, "0");
}
function hexToInt(hex) {
  return parseInt(hex, 16);
}
function bigIntToBytes(value, length = 16) {
  const hex = intToHex(value, length);
  return hexToBytes(hex);
}
function toTwos(value, width) {
  if (value < -(BigInt(1) << width - BigInt(1)) || (BigInt(1) << width - BigInt(1)) - BigInt(1) < value) {
    throw `Unable to represent integer in width: ${width}`;
  }
  if (value >= BigInt(0)) {
    return BigInt(value);
  }
  return value + (BigInt(1) << width);
}
function nthBit(value, n) {
  return value & BigInt(1) << n;
}
function bytesToTwosBigInt(bytes2) {
  return fromTwos(BigInt(`0x${bytesToHex(bytes2)}`), BigInt(bytes2.byteLength * 8));
}
function fromTwos(value, width) {
  if (nthBit(value, width - BigInt(1))) {
    return value - (BigInt(1) << width);
  }
  return value;
}
var hexes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (const u of uint8a) {
    hex += hexes[u];
  }
  return hex;
}
function hexToBytes(hex) {
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
function utf8ToBytes(str) {
  return new TextEncoder().encode(str);
}
function bytesToUtf8(arr) {
  return new TextDecoder().decode(arr);
}
function asciiToBytes(str) {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i) & 255);
  }
  return new Uint8Array(byteArray);
}
function bytesToAscii(arr) {
  return String.fromCharCode.apply(null, arr);
}
function isNotOctet(octet) {
  return !Number.isInteger(octet) || octet < 0 || octet > 255;
}
function octetsToBytes(numbers) {
  if (numbers.some(isNotOctet))
    throw new Error("Some values are invalid bytes.");
  return new Uint8Array(numbers);
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
function concatArray(elements) {
  return concatBytes(...elements.map((e) => {
    if (typeof e === "number")
      return octetsToBytes([e]);
    if (e instanceof Array)
      return octetsToBytes(e);
    return e;
  }));
}
function isInstance(object, clazz) {
  return object instanceof clazz || object?.constructor?.name?.toLowerCase() === clazz.name;
}
function validateHash256(hex) {
  hex = without0x(hex);
  if (hex.length !== 64)
    return false;
  return /^[0-9a-fA-F]+$/.test(hex);
}

// node_modules/@stacks/common/dist/esm/constants.js
var HIRO_MAINNET_URL = "https://api.mainnet.hiro.so";
var HIRO_TESTNET_URL = "https://api.testnet.hiro.so";
var DEVNET_URL = "http://localhost:3999";
var PRIVATE_KEY_BYTES_COMPRESSED = 33;

// node_modules/@stacks/common/dist/esm/signatures.js
var COORDINATE_BYTES = 32;
function parseRecoverableSignatureVrs(signature) {
  if (signature.length < COORDINATE_BYTES * 2 * 2 + 1) {
    throw new Error("Invalid signature");
  }
  const recoveryIdHex = signature.slice(0, 2);
  const r = signature.slice(2, 2 + COORDINATE_BYTES * 2);
  const s = signature.slice(2 + COORDINATE_BYTES * 2);
  return {
    recoveryId: hexToInt(recoveryIdHex),
    r,
    s
  };
}
function signatureVrsToRsv(signature) {
  return signature.slice(2) + signature.slice(0, 2);
}
function signatureRsvToVrs(signature) {
  return signature.slice(-2) + signature.slice(0, -2);
}

// node_modules/@stacks/common/dist/esm/keys.js
function privateKeyToBytes(privateKey) {
  const privateKeyBuffer = typeof privateKey === "string" ? hexToBytes(privateKey) : privateKey;
  if (privateKeyBuffer.length != 32 && privateKeyBuffer.length != 33) {
    throw new Error(`Improperly formatted private-key. Private-key byte length should be 32 or 33. Length provided: ${privateKeyBuffer.length}`);
  }
  if (privateKeyBuffer.length == 33 && privateKeyBuffer[32] !== 1) {
    throw new Error("Improperly formatted private-key. 33 bytes indicate compressed key, but the last byte must be == 01");
  }
  return privateKeyBuffer;
}

// node_modules/@stacks/common/dist/esm/buffer.js
function readUInt16BE(source, offset) {
  return (source[offset + 0] << 8 | source[offset + 1]) >>> 0;
}
function writeUInt16BE(destination, value, offset = 0) {
  destination[offset + 0] = value >>> 8;
  destination[offset + 1] = value >>> 0;
  return destination;
}
function readUInt8(source, offset) {
  return source[offset];
}
function writeUInt8(destination, value, offset = 0) {
  destination[offset] = value;
  return destination;
}
function readUInt32BE(source, offset) {
  return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
}
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

// node_modules/@stacks/transactions/dist/esm/BytesReader.js
function createEnumChecker(enumVariable) {
  const enumValues = Object.values(enumVariable).filter((v) => typeof v === "number");
  const enumValueSet = new Set(enumValues);
  return (value) => enumValueSet.has(value);
}
var enumCheckFunctions = /* @__PURE__ */ new Map();
function isEnum(enumVariable, value) {
  const checker = enumCheckFunctions.get(enumVariable);
  if (checker !== void 0) {
    return checker(value);
  }
  const newChecker = createEnumChecker(enumVariable);
  enumCheckFunctions.set(enumVariable, newChecker);
  return isEnum(enumVariable, value);
}
var BytesReader = class {
  constructor(bytes2) {
    this.consumed = 0;
    this.source = typeof bytes2 === "string" ? hexToBytes(bytes2) : bytes2;
  }
  readBytes(length) {
    const view = this.source.subarray(this.consumed, this.consumed + length);
    this.consumed += length;
    return view;
  }
  readUInt32BE() {
    return readUInt32BE(this.readBytes(4), 0);
  }
  readUInt8() {
    return readUInt8(this.readBytes(1), 0);
  }
  readUInt16BE() {
    return readUInt16BE(this.readBytes(2), 0);
  }
  readBigUIntLE(length) {
    const bytes2 = this.readBytes(length).slice().reverse();
    const hex = bytesToHex(bytes2);
    return BigInt(`0x${hex}`);
  }
  readBigUIntBE(length) {
    const bytes2 = this.readBytes(length);
    const hex = bytesToHex(bytes2);
    return BigInt(`0x${hex}`);
  }
  get readOffset() {
    return this.consumed;
  }
  set readOffset(val) {
    this.consumed = val;
  }
  get internalBytes() {
    return this.source;
  }
  readUInt8Enum(enumVariable, invalidEnumErrorFormatter) {
    const num = this.readUInt8();
    if (isEnum(enumVariable, num)) {
      return num;
    }
    throw invalidEnumErrorFormatter(num);
  }
};

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
function whenTransactionVersion(transactionVersion) {
  return (map) => map[transactionVersion];
}

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
var BLOCKSTACK_DEFAULT_GAIA_HUB_URL = "https://hub.blockstack.org";
var MAX_STRING_LENGTH_BYTES = 128;
var CLARITY_INT_SIZE = 128;
var CLARITY_INT_BYTE_SIZE = 16;
var COINBASE_BYTES_LENGTH = 32;
var VRF_PROOF_BYTES_LENGTH = 80;
var RECOVERABLE_ECDSA_SIG_LENGTH_BYTES = 65;
var COMPRESSED_PUBKEY_LENGTH_BYTES = 32;
var UNCOMPRESSED_PUBKEY_LENGTH_BYTES = 64;
var MEMO_MAX_LENGTH_BYTES = 34;
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
function anchorModeFrom(mode) {
  if (mode in AnchorModeMap)
    return AnchorModeMap[mode];
  throw new Error(`Invalid anchor mode "${mode}", must be one of: ${AnchorModeNames.join(", ")}`);
}
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

// node_modules/@stacks/transactions/dist/esm/errors.js
var TransactionError = class extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var SerializationError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};
var DeserializationError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};
var NoEstimateAvailableError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};
var NotImplementedError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};
var SigningError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};
var VerificationError = class extends TransactionError {
  constructor(message) {
    super(message);
  }
};

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
var crypto = {
  node: void 0,
  web: typeof self === "object" && "crypto" in self ? self.crypto : void 0
};

// node_modules/@noble/hashes/esm/utils.js
var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr = (word, shift) => word << 32 - shift | word >>> shift;
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
var hexes2 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function utf8ToBytes2(str) {
  if (typeof str !== "string") {
    throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
  }
  return new TextEncoder().encode(str);
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes2(data);
  if (!(data instanceof Uint8Array))
    throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
  return data;
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
    const { view, buffer: buffer2, blockLen } = this;
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
      buffer2.set(data.subarray(pos, pos + take), this.pos);
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
    const { buffer: buffer2, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer2[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer2[i] = 0;
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
    const { buffer: buffer2, outputLen } = this;
    this.digestInto(buffer2);
    const res = buffer2.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen)
      to.buffer.set(buffer2);
    return to;
  }
};

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

// node_modules/@stacks/transactions/node_modules/@noble/secp256k1/lib/esm/index.js
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
    const arr = hex instanceof Uint8Array;
    const name = "Signature.fromCompact";
    if (typeof hex !== "string" && !arr)
      throw new TypeError(`${name}: Expected string or Uint8Array`);
    const str = arr ? bytesToHex2(hex) : hex;
    if (str.length !== 128)
      throw new Error(`${name}: Expected 64-byte hex`);
    return new _Signature(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
  }
  static fromDER(hex) {
    const arr = hex instanceof Uint8Array;
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
function concatBytes2(...arrays) {
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
var hexes3 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex2(uint8a) {
  if (!(uint8a instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  let hex = "";
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes3[uint8a[i]];
  }
  return hex;
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
function hexToBytes2(hex) {
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
function bytesToNumber(bytes2) {
  return hexToNumber(bytesToHex2(bytes2));
}
function ensureBytes(hex) {
  return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes2(hex);
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
  constructor(hashLen2, qByteLen) {
    this.hashLen = hashLen2;
    this.qByteLen = qByteLen;
    if (typeof hashLen2 !== "number" || hashLen2 < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    this.v = new Uint8Array(hashLen2).fill(1);
    this.k = new Uint8Array(hashLen2).fill(0);
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
  } else if (key instanceof Uint8Array) {
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
  } catch (error2) {
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
  } catch (error2) {
    return false;
  }
  const { r, s } = sig;
  if (opts.strict && sig.hasHighS())
    return false;
  const h = truncateHash(msgHash);
  let P;
  try {
    P = normalizePublicKey(publicKey);
  } catch (error2) {
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
var crypto2 = {
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
    } catch (error2) {
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
    if (crypto2.web) {
      return crypto2.web.getRandomValues(new Uint8Array(bytesLength));
    } else if (crypto2.node) {
      const { randomBytes: randomBytes2 } = crypto2.node;
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
    if (crypto2.web) {
      const buffer2 = await crypto2.web.subtle.digest("SHA-256", concatBytes2(...messages));
      return new Uint8Array(buffer2);
    } else if (crypto2.node) {
      const { createHash } = crypto2.node;
      const hash2 = createHash("sha256");
      messages.forEach((m) => hash2.update(m));
      return Uint8Array.from(hash2.digest());
    } else {
      throw new Error("The environment doesn't have sha256 function");
    }
  },
  hmacSha256: async (key, ...messages) => {
    if (crypto2.web) {
      const ckey = await crypto2.web.subtle.importKey("raw", key, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
      const message = concatBytes2(...messages);
      const buffer2 = await crypto2.web.subtle.sign("HMAC", ckey, message);
      return new Uint8Array(buffer2);
    } else if (crypto2.node) {
      const { createHmac } = crypto2.node;
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

// node_modules/@stacks/transactions/dist/esm/keys.js
var import_c32check4 = __toESM(require_lib());

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

// node_modules/@stacks/transactions/dist/esm/utils.js
var import_c32check3 = __toESM(require_lib());
var import_lodash = __toESM(require_lodash());

// node_modules/@stacks/transactions/dist/esm/clarity/constants.js
var ClarityType;
(function(ClarityType2) {
  ClarityType2["Int"] = "int";
  ClarityType2["UInt"] = "uint";
  ClarityType2["Buffer"] = "buffer";
  ClarityType2["BoolTrue"] = "true";
  ClarityType2["BoolFalse"] = "false";
  ClarityType2["PrincipalStandard"] = "address";
  ClarityType2["PrincipalContract"] = "contract";
  ClarityType2["ResponseOk"] = "ok";
  ClarityType2["ResponseErr"] = "err";
  ClarityType2["OptionalNone"] = "none";
  ClarityType2["OptionalSome"] = "some";
  ClarityType2["List"] = "list";
  ClarityType2["Tuple"] = "tuple";
  ClarityType2["StringASCII"] = "ascii";
  ClarityType2["StringUTF8"] = "utf8";
})(ClarityType || (ClarityType = {}));
var ClarityWireType;
(function(ClarityWireType2) {
  ClarityWireType2[ClarityWireType2["int"] = 0] = "int";
  ClarityWireType2[ClarityWireType2["uint"] = 1] = "uint";
  ClarityWireType2[ClarityWireType2["buffer"] = 2] = "buffer";
  ClarityWireType2[ClarityWireType2["true"] = 3] = "true";
  ClarityWireType2[ClarityWireType2["false"] = 4] = "false";
  ClarityWireType2[ClarityWireType2["address"] = 5] = "address";
  ClarityWireType2[ClarityWireType2["contract"] = 6] = "contract";
  ClarityWireType2[ClarityWireType2["ok"] = 7] = "ok";
  ClarityWireType2[ClarityWireType2["err"] = 8] = "err";
  ClarityWireType2[ClarityWireType2["none"] = 9] = "none";
  ClarityWireType2[ClarityWireType2["some"] = 10] = "some";
  ClarityWireType2[ClarityWireType2["list"] = 11] = "list";
  ClarityWireType2[ClarityWireType2["tuple"] = 12] = "tuple";
  ClarityWireType2[ClarityWireType2["ascii"] = 13] = "ascii";
  ClarityWireType2[ClarityWireType2["utf8"] = 14] = "utf8";
})(ClarityWireType || (ClarityWireType = {}));
function clarityTypeToByte(type) {
  return ClarityWireType[type];
}
function clarityByteToType(wireType) {
  return ClarityWireType[wireType];
}

// node_modules/@stacks/transactions/dist/esm/clarity/clarityValue.js
function cvToString(val, encoding = "hex") {
  switch (val.type) {
    case ClarityType.BoolTrue:
      return "true";
    case ClarityType.BoolFalse:
      return "false";
    case ClarityType.Int:
      return val.value.toString();
    case ClarityType.UInt:
      return `u${val.value.toString()}`;
    case ClarityType.Buffer:
      if (encoding === "tryAscii") {
        const str = bytesToAscii(hexToBytes(val.value));
        if (/[ -~]/.test(str)) {
          return JSON.stringify(str);
        }
      }
      return `0x${val.value}`;
    case ClarityType.OptionalNone:
      return "none";
    case ClarityType.OptionalSome:
      return `(some ${cvToString(val.value, encoding)})`;
    case ClarityType.ResponseErr:
      return `(err ${cvToString(val.value, encoding)})`;
    case ClarityType.ResponseOk:
      return `(ok ${cvToString(val.value, encoding)})`;
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return val.value;
    case ClarityType.List:
      return `(list ${val.value.map((v) => cvToString(v, encoding)).join(" ")})`;
    case ClarityType.Tuple:
      return `(tuple ${Object.keys(val.value).map((key) => `(${key} ${cvToString(val.value[key], encoding)})`).join(" ")})`;
    case ClarityType.StringASCII:
      return `"${val.value}"`;
    case ClarityType.StringUTF8:
      return `u"${val.value}"`;
  }
}
function cvToValue(val, strictJsonCompat = false) {
  switch (val.type) {
    case ClarityType.BoolTrue:
      return true;
    case ClarityType.BoolFalse:
      return false;
    case ClarityType.Int:
    case ClarityType.UInt:
      if (strictJsonCompat) {
        return val.value.toString();
      }
      return val.value;
    case ClarityType.Buffer:
      return `0x${val.value}`;
    case ClarityType.OptionalNone:
      return null;
    case ClarityType.OptionalSome:
      return cvToJSON(val.value);
    case ClarityType.ResponseErr:
      return cvToJSON(val.value);
    case ClarityType.ResponseOk:
      return cvToJSON(val.value);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return val.value;
    case ClarityType.List:
      return val.value.map((v) => cvToJSON(v));
    case ClarityType.Tuple:
      const result = {};
      Object.keys(val.value).forEach((key) => {
        result[key] = cvToJSON(val.value[key]);
      });
      return result;
    case ClarityType.StringASCII:
      return val.value;
    case ClarityType.StringUTF8:
      return val.value;
  }
}
function cvToJSON(val) {
  switch (val.type) {
    case ClarityType.ResponseErr:
      return { type: getCVTypeString(val), value: cvToValue(val, true), success: false };
    case ClarityType.ResponseOk:
      return { type: getCVTypeString(val), value: cvToValue(val, true), success: true };
    default:
      return { type: getCVTypeString(val), value: cvToValue(val, true) };
  }
}
function getCVTypeString(val) {
  switch (val.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return "bool";
    case ClarityType.Int:
      return "int";
    case ClarityType.UInt:
      return "uint";
    case ClarityType.Buffer:
      return `(buff ${Math.ceil(val.value.length / 2)})`;
    case ClarityType.OptionalNone:
      return "(optional none)";
    case ClarityType.OptionalSome:
      return `(optional ${getCVTypeString(val.value)})`;
    case ClarityType.ResponseErr:
      return `(response UnknownType ${getCVTypeString(val.value)})`;
    case ClarityType.ResponseOk:
      return `(response ${getCVTypeString(val.value)} UnknownType)`;
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return "principal";
    case ClarityType.List:
      return `(list ${val.value.length} ${val.value.length ? getCVTypeString(val.value[0]) : "UnknownType"})`;
    case ClarityType.Tuple:
      return `(tuple ${Object.keys(val.value).map((key) => `(${key} ${getCVTypeString(val.value[key])})`).join(" ")})`;
    case ClarityType.StringASCII:
      return `(string-ascii ${asciiToBytes(val.value).length})`;
    case ClarityType.StringUTF8:
      return `(string-utf8 ${utf8ToBytes(val.value).length})`;
  }
}
function isClarityType(input, withType) {
  return input.type === withType;
}

// node_modules/@stacks/transactions/dist/esm/clarity/values/booleanCV.js
var trueCV = () => ({ type: ClarityType.BoolTrue });
var falseCV = () => ({ type: ClarityType.BoolFalse });
var boolCV = (bool3) => bool3 ? trueCV() : falseCV();

// node_modules/@stacks/transactions/dist/esm/clarity/values/bufferCV.js
var bufferCV = (buffer2) => {
  if (buffer2.byteLength > 1048576) {
    throw new Error("Cannot construct clarity buffer that is greater than 1MB");
  }
  return { type: ClarityType.Buffer, value: bytesToHex(buffer2) };
};
var bufferCVFromString = (str) => bufferCV(utf8ToBytes(str));

// node_modules/@stacks/transactions/dist/esm/clarity/values/intCV.js
var MAX_U128 = BigInt("0xffffffffffffffffffffffffffffffff");
var MIN_U128 = BigInt(0);
var MAX_I128 = BigInt("0x7fffffffffffffffffffffffffffffff");
var MIN_I128 = BigInt("-170141183460469231731687303715884105728");
var intCV = (value) => {
  if (typeof value === "string" && value.toLowerCase().startsWith("0x")) {
    value = bytesToTwosBigInt(hexToBytes(value));
  }
  if (isInstance(value, Uint8Array))
    value = bytesToTwosBigInt(value);
  const bigInt = intToBigInt(value);
  if (bigInt > MAX_I128) {
    throw new RangeError(`Cannot construct clarity integer from value greater than ${MAX_I128}`);
  } else if (bigInt < MIN_I128) {
    throw new RangeError(`Cannot construct clarity integer form value less than ${MIN_I128}`);
  }
  return { type: ClarityType.Int, value: bigInt };
};
var uintCV = (value) => {
  const bigInt = intToBigInt(value);
  if (bigInt < MIN_U128) {
    throw new RangeError("Cannot construct unsigned clarity integer from negative value");
  } else if (bigInt > MAX_U128) {
    throw new RangeError(`Cannot construct unsigned clarity integer greater than ${MAX_U128}`);
  }
  return { type: ClarityType.UInt, value: bigInt };
};

// node_modules/@stacks/transactions/dist/esm/clarity/values/listCV.js
function listCV(values) {
  return { type: ClarityType.List, value: values };
}

// node_modules/@stacks/transactions/dist/esm/clarity/values/optionalCV.js
function noneCV() {
  return { type: ClarityType.OptionalNone };
}
function someCV(value) {
  return { type: ClarityType.OptionalSome, value };
}
function optionalCVOf(value) {
  return value ? someCV(value) : noneCV();
}

// node_modules/@stacks/transactions/dist/esm/wire/create.js
var import_c32check = __toESM(require_lib());

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
function whenWireType(wireType) {
  return (wireTypeMap) => wireTypeMap[wireType];
}

// node_modules/@stacks/transactions/dist/esm/wire/create.js
function createEmptyAddress() {
  return {
    type: StacksWireType.Address,
    version: AddressVersion.MainnetSingleSig,
    hash160: "0".repeat(40)
  };
}
function createMemoString(content) {
  if (content && exceedsMaxLengthBytes(content, MEMO_MAX_LENGTH_BYTES)) {
    throw new Error(`Memo exceeds maximum length of ${MEMO_MAX_LENGTH_BYTES} bytes`);
  }
  return { type: StacksWireType.MemoString, content };
}
function createLPList(values, lengthPrefixBytes) {
  return {
    type: StacksWireType.LengthPrefixedList,
    lengthPrefixBytes: lengthPrefixBytes || 4,
    values
  };
}
function createMessageSignature(signature) {
  const length = hexToBytes(signature).byteLength;
  if (length != RECOVERABLE_ECDSA_SIG_LENGTH_BYTES) {
    throw Error("Invalid signature");
  }
  return {
    type: StacksWireType.MessageSignature,
    data: signature
  };
}
function createTokenTransferPayload(recipient, amount, memo) {
  if (typeof recipient === "string") {
    recipient = principalCV(recipient);
  }
  if (typeof memo === "string") {
    memo = createMemoString(memo);
  }
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.TokenTransfer,
    recipient,
    amount: intToBigInt(amount),
    memo: memo ?? createMemoString("")
  };
}
function createContractCallPayload(contractAddress, contractName, functionName, functionArgs) {
  if (typeof contractName === "string") {
    contractName = createLPString(contractName);
  }
  if (typeof functionName === "string") {
    functionName = createLPString(functionName);
  }
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.ContractCall,
    contractAddress: typeof contractAddress === "string" ? createAddress(contractAddress) : contractAddress,
    contractName,
    functionName,
    functionArgs
  };
}
function codeBodyString(content) {
  return createLPString(content, 4, 1e5);
}
function createSmartContractPayload(contractName, codeBody, clarityVersion) {
  if (typeof contractName === "string") {
    contractName = createLPString(contractName);
  }
  if (typeof codeBody === "string") {
    codeBody = codeBodyString(codeBody);
  }
  if (typeof clarityVersion === "number") {
    return {
      type: StacksWireType.Payload,
      payloadType: PayloadType.VersionedSmartContract,
      clarityVersion,
      contractName,
      codeBody
    };
  }
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.SmartContract,
    contractName,
    codeBody
  };
}
function createPoisonPayload() {
  return { type: StacksWireType.Payload, payloadType: PayloadType.PoisonMicroblock };
}
function createCoinbasePayload(coinbaseBytes, altRecipient) {
  if (coinbaseBytes.byteLength != COINBASE_BYTES_LENGTH) {
    throw Error(`Coinbase buffer size must be ${COINBASE_BYTES_LENGTH} bytes`);
  }
  if (altRecipient != void 0) {
    return {
      type: StacksWireType.Payload,
      payloadType: PayloadType.CoinbaseToAltRecipient,
      coinbaseBytes,
      recipient: altRecipient
    };
  }
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.Coinbase,
    coinbaseBytes
  };
}
function createNakamotoCoinbasePayload(coinbaseBytes, recipient, vrfProof) {
  if (coinbaseBytes.byteLength != COINBASE_BYTES_LENGTH) {
    throw Error(`Coinbase buffer size must be ${COINBASE_BYTES_LENGTH} bytes`);
  }
  if (vrfProof.byteLength != VRF_PROOF_BYTES_LENGTH) {
    throw Error(`VRF proof buffer size must be ${VRF_PROOF_BYTES_LENGTH} bytes`);
  }
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.NakamotoCoinbase,
    coinbaseBytes,
    recipient: recipient.type === ClarityType.OptionalSome ? recipient.value : void 0,
    vrfProof
  };
}
function createTenureChangePayload(tenureHash, previousTenureHash, burnViewHash, previousTenureEnd, previousTenureBlocks, cause, publicKeyHash) {
  return {
    type: StacksWireType.Payload,
    payloadType: PayloadType.TenureChange,
    tenureHash,
    previousTenureHash,
    burnViewHash,
    previousTenureEnd,
    previousTenureBlocks,
    cause,
    publicKeyHash
  };
}
function createLPString(content, lengthPrefixBytes, maxLengthBytes) {
  const prefixLength = lengthPrefixBytes || 1;
  const maxLength = maxLengthBytes || MAX_STRING_LENGTH_BYTES;
  if (exceedsMaxLengthBytes(content, maxLength)) {
    throw new Error(`String length exceeds maximum bytes ${maxLength}`);
  }
  return {
    type: StacksWireType.LengthPrefixedString,
    content,
    lengthPrefixBytes: prefixLength,
    maxLengthBytes: maxLength
  };
}
function createAsset(addressString, contractName, assetName) {
  return {
    type: StacksWireType.Asset,
    address: createAddress(addressString),
    contractName: createLPString(contractName),
    assetName: createLPString(assetName)
  };
}
function createAddress(c32AddressString) {
  const addressData = (0, import_c32check.c32addressDecode)(c32AddressString);
  return {
    type: StacksWireType.Address,
    version: addressData[0],
    hash160: addressData[1]
  };
}
function createContractPrincipal(addressString, contractName) {
  const addr = createAddress(addressString);
  const name = createLPString(contractName);
  return {
    type: StacksWireType.Principal,
    prefix: PostConditionPrincipalId.Contract,
    address: addr,
    contractName: name
  };
}
function createStandardPrincipal(addressString) {
  const addr = createAddress(addressString);
  return {
    type: StacksWireType.Principal,
    prefix: PostConditionPrincipalId.Standard,
    address: addr
  };
}
function createTransactionAuthField(pubKeyEncoding, contents) {
  return {
    pubKeyEncoding,
    type: StacksWireType.TransactionAuthField,
    contents
  };
}

// node_modules/@stacks/transactions/dist/esm/wire/helpers.js
var import_c32check2 = __toESM(require_lib());

// node_modules/@stacks/transactions/dist/esm/wire/serialization.js
function serializeStacksWire(wire) {
  return bytesToHex(serializeStacksWireBytes(wire));
}
function serializeStacksWireBytes(wire) {
  switch (wire.type) {
    case StacksWireType.Address:
      return serializeAddressBytes(wire);
    case StacksWireType.Principal:
      return serializePrincipalBytes(wire);
    case StacksWireType.LengthPrefixedString:
      return serializeLPStringBytes(wire);
    case StacksWireType.MemoString:
      return serializeMemoStringBytes(wire);
    case StacksWireType.Asset:
      return serializeAssetBytes(wire);
    case StacksWireType.PostCondition:
      return serializePostConditionWireBytes(wire);
    case StacksWireType.PublicKey:
      return serializePublicKeyBytes(wire);
    case StacksWireType.LengthPrefixedList:
      return serializeLPListBytes(wire);
    case StacksWireType.Payload:
      return serializePayloadBytes(wire);
    case StacksWireType.TransactionAuthField:
      return serializeTransactionAuthFieldBytes(wire);
    case StacksWireType.MessageSignature:
      return serializeMessageSignatureBytes(wire);
  }
}
function deserializeStacksWire(bytesReader, type, listType) {
  switch (type) {
    case StacksWireType.Address:
      return deserializeAddress(bytesReader);
    case StacksWireType.Principal:
      return deserializePrincipal(bytesReader);
    case StacksWireType.LengthPrefixedString:
      return deserializeLPString(bytesReader);
    case StacksWireType.MemoString:
      return deserializeMemoString(bytesReader);
    case StacksWireType.Asset:
      return deserializeAsset(bytesReader);
    case StacksWireType.PostCondition:
      return deserializePostConditionWire(bytesReader);
    case StacksWireType.PublicKey:
      return deserializePublicKey(bytesReader);
    case StacksWireType.Payload:
      return deserializePayload(bytesReader);
    case StacksWireType.LengthPrefixedList:
      if (!listType) {
        throw new DeserializationError("No list type specified");
      }
      return deserializeLPList(bytesReader, listType);
    case StacksWireType.MessageSignature:
      return deserializeMessageSignature(bytesReader);
    default:
      throw new Error("Could not recognize StacksWireType");
  }
}
function serializeAddress(address2) {
  return bytesToHex(serializeAddressBytes(address2));
}
function serializeAddressBytes(address2) {
  const bytesArray = [];
  bytesArray.push(hexToBytes(intToHex(address2.version, 1)));
  bytesArray.push(hexToBytes(address2.hash160));
  return concatArray(bytesArray);
}
function deserializeAddress(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const version = hexToInt(bytesToHex(bytesReader.readBytes(1)));
  const data = bytesToHex(bytesReader.readBytes(20));
  return { type: StacksWireType.Address, version, hash160: data };
}
function serializePrincipal(principal3) {
  return bytesToHex(serializePrincipalBytes(principal3));
}
function serializePrincipalBytes(principal3) {
  const bytesArray = [];
  bytesArray.push(principal3.prefix);
  if (principal3.prefix === PostConditionPrincipalId.Standard || principal3.prefix === PostConditionPrincipalId.Contract) {
    bytesArray.push(serializeAddressBytes(principal3.address));
  }
  if (principal3.prefix === PostConditionPrincipalId.Contract) {
    bytesArray.push(serializeLPStringBytes(principal3.contractName));
  }
  return concatArray(bytesArray);
}
function deserializePrincipal(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const prefix = bytesReader.readUInt8Enum(PostConditionPrincipalId, (n) => {
    throw new DeserializationError(`Unexpected Principal payload type: ${n}`);
  });
  if (prefix === PostConditionPrincipalId.Origin) {
    return { type: StacksWireType.Principal, prefix };
  }
  const address2 = deserializeAddress(bytesReader);
  if (prefix === PostConditionPrincipalId.Standard) {
    return { type: StacksWireType.Principal, prefix, address: address2 };
  }
  const contractName = deserializeLPString(bytesReader);
  return {
    type: StacksWireType.Principal,
    prefix,
    address: address2,
    contractName
  };
}
function serializeLPString(lps) {
  return bytesToHex(serializeLPStringBytes(lps));
}
function serializeLPStringBytes(lps) {
  const bytesArray = [];
  const contentBytes = utf8ToBytes(lps.content);
  const length = contentBytes.byteLength;
  bytesArray.push(hexToBytes(intToHex(length, lps.lengthPrefixBytes)));
  bytesArray.push(contentBytes);
  return concatArray(bytesArray);
}
function deserializeLPString(serialized, prefixBytes, maxLength) {
  prefixBytes = prefixBytes ? prefixBytes : 1;
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const length = hexToInt(bytesToHex(bytesReader.readBytes(prefixBytes)));
  const content = bytesToUtf8(bytesReader.readBytes(length));
  return createLPString(content, prefixBytes, maxLength ?? 128);
}
function serializeMemoString(memoString) {
  return bytesToHex(serializeMemoStringBytes(memoString));
}
function serializeMemoStringBytes(memoString) {
  const bytesArray = [];
  const contentBytes = utf8ToBytes(memoString.content);
  const paddedContent = rightPadHexToLength(bytesToHex(contentBytes), MEMO_MAX_LENGTH_BYTES * 2);
  bytesArray.push(hexToBytes(paddedContent));
  return concatArray(bytesArray);
}
function deserializeMemoString(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  let content = bytesToUtf8(bytesReader.readBytes(MEMO_MAX_LENGTH_BYTES));
  content = content.replace(/\u0000*$/, "");
  return { type: StacksWireType.MemoString, content };
}
function serializeAsset(info) {
  return bytesToHex(serializeAssetBytes(info));
}
function serializeAssetBytes(info) {
  const bytesArray = [];
  bytesArray.push(serializeAddressBytes(info.address));
  bytesArray.push(serializeLPStringBytes(info.contractName));
  bytesArray.push(serializeLPStringBytes(info.assetName));
  return concatArray(bytesArray);
}
function deserializeAsset(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  return {
    type: StacksWireType.Asset,
    address: deserializeAddress(bytesReader),
    contractName: deserializeLPString(bytesReader),
    assetName: deserializeLPString(bytesReader)
  };
}
function serializeLPList(lpList) {
  return bytesToHex(serializeLPListBytes(lpList));
}
function serializeLPListBytes(lpList) {
  const list2 = lpList.values;
  const bytesArray = [];
  bytesArray.push(hexToBytes(intToHex(list2.length, lpList.lengthPrefixBytes)));
  for (const l of list2) {
    bytesArray.push(serializeStacksWireBytes(l));
  }
  return concatArray(bytesArray);
}
function deserializeLPList(serialized, type, lengthPrefixBytes) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const length = hexToInt(bytesToHex(bytesReader.readBytes(lengthPrefixBytes || 4)));
  const l = [];
  for (let index = 0; index < length; index++) {
    switch (type) {
      case StacksWireType.Address:
        l.push(deserializeAddress(bytesReader));
        break;
      case StacksWireType.LengthPrefixedString:
        l.push(deserializeLPString(bytesReader));
        break;
      case StacksWireType.MemoString:
        l.push(deserializeMemoString(bytesReader));
        break;
      case StacksWireType.Asset:
        l.push(deserializeAsset(bytesReader));
        break;
      case StacksWireType.PostCondition:
        l.push(deserializePostConditionWire(bytesReader));
        break;
      case StacksWireType.PublicKey:
        l.push(deserializePublicKey(bytesReader));
        break;
      case StacksWireType.TransactionAuthField:
        l.push(deserializeTransactionAuthField(bytesReader));
        break;
    }
  }
  return createLPList(l, lengthPrefixBytes);
}
function serializePostConditionWire(postCondition) {
  return bytesToHex(serializePostConditionWireBytes(postCondition));
}
function serializePostConditionWireBytes(postCondition) {
  const bytesArray = [];
  bytesArray.push(postCondition.conditionType);
  bytesArray.push(serializePrincipalBytes(postCondition.principal));
  if (postCondition.conditionType === PostConditionType.Fungible || postCondition.conditionType === PostConditionType.NonFungible) {
    bytesArray.push(serializeAssetBytes(postCondition.asset));
  }
  if (postCondition.conditionType === PostConditionType.NonFungible) {
    bytesArray.push(serializeCVBytes(postCondition.assetName));
  }
  bytesArray.push(postCondition.conditionCode);
  if (postCondition.conditionType === PostConditionType.STX || postCondition.conditionType === PostConditionType.Fungible || postCondition.conditionType === PostConditionType.Staking) {
    if (postCondition.amount > BigInt("0xffffffffffffffff"))
      throw new SerializationError("The post-condition amount may not be larger than 8 bytes");
    bytesArray.push(intToBytes(postCondition.amount, 8));
  }
  return concatArray(bytesArray);
}
function deserializePostConditionWire(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const postConditionType = bytesReader.readUInt8Enum(PostConditionType, (n) => {
    throw new DeserializationError(`Could not read ${n} as PostConditionType`);
  });
  const principal3 = deserializePrincipal(bytesReader);
  let conditionCode;
  let asset;
  let amount;
  switch (postConditionType) {
    case PostConditionType.STX:
      conditionCode = bytesReader.readUInt8Enum(FungibleConditionCode, (n) => {
        throw new DeserializationError(`Could not read ${n} as FungibleConditionCode`);
      });
      amount = BigInt(`0x${bytesToHex(bytesReader.readBytes(8))}`);
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.STX,
        principal: principal3,
        conditionCode,
        amount
      };
    case PostConditionType.Fungible:
      asset = deserializeAsset(bytesReader);
      conditionCode = bytesReader.readUInt8Enum(FungibleConditionCode, (n) => {
        throw new DeserializationError(`Could not read ${n} as FungibleConditionCode`);
      });
      amount = BigInt(`0x${bytesToHex(bytesReader.readBytes(8))}`);
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.Fungible,
        principal: principal3,
        conditionCode,
        amount,
        asset
      };
    case PostConditionType.NonFungible:
      asset = deserializeAsset(bytesReader);
      const assetName = deserializeCV(bytesReader);
      conditionCode = bytesReader.readUInt8Enum(NonFungibleConditionCode, (n) => {
        throw new DeserializationError(`Could not read ${n} as FungibleConditionCode`);
      });
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.NonFungible,
        principal: principal3,
        conditionCode,
        asset,
        assetName
      };
    case PostConditionType.Staking:
      conditionCode = bytesReader.readUInt8Enum(FungibleConditionCode, (n) => {
        throw new DeserializationError(`Could not read ${n} as FungibleConditionCode`);
      });
      amount = BigInt(`0x${bytesToHex(bytesReader.readBytes(8))}`);
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.Staking,
        principal: principal3,
        conditionCode,
        amount
      };
    case PostConditionType.PoX: {
      const poxConditionCode = bytesReader.readUInt8Enum(PoxConditionCode, (n) => {
        throw new DeserializationError(`Could not read ${n} as PoxConditionCode`);
      });
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.PoX,
        principal: principal3,
        conditionCode: poxConditionCode
      };
    }
  }
}
function serializePayload(payload) {
  return bytesToHex(serializePayloadBytes(payload));
}
function serializePayloadBytes(payload) {
  const bytesArray = [];
  bytesArray.push(payload.payloadType);
  switch (payload.payloadType) {
    case PayloadType.TokenTransfer:
      bytesArray.push(serializeCVBytes(payload.recipient));
      bytesArray.push(intToBytes(payload.amount, 8));
      bytesArray.push(serializeStacksWireBytes(payload.memo));
      break;
    case PayloadType.ContractCall:
      bytesArray.push(serializeStacksWireBytes(payload.contractAddress));
      bytesArray.push(serializeStacksWireBytes(payload.contractName));
      bytesArray.push(serializeStacksWireBytes(payload.functionName));
      const numArgs = new Uint8Array(4);
      writeUInt32BE(numArgs, payload.functionArgs.length, 0);
      bytesArray.push(numArgs);
      payload.functionArgs.forEach((arg) => {
        bytesArray.push(serializeCVBytes(arg));
      });
      break;
    case PayloadType.SmartContract:
      bytesArray.push(serializeStacksWireBytes(payload.contractName));
      bytesArray.push(serializeStacksWireBytes(payload.codeBody));
      break;
    case PayloadType.VersionedSmartContract:
      bytesArray.push(payload.clarityVersion);
      bytesArray.push(serializeStacksWireBytes(payload.contractName));
      bytesArray.push(serializeStacksWireBytes(payload.codeBody));
      break;
    case PayloadType.PoisonMicroblock:
      break;
    case PayloadType.Coinbase:
      bytesArray.push(payload.coinbaseBytes);
      break;
    case PayloadType.CoinbaseToAltRecipient:
      bytesArray.push(payload.coinbaseBytes);
      bytesArray.push(serializeCVBytes(payload.recipient));
      break;
    case PayloadType.NakamotoCoinbase:
      bytesArray.push(payload.coinbaseBytes);
      bytesArray.push(serializeCVBytes(payload.recipient ? someCV(payload.recipient) : noneCV()));
      bytesArray.push(payload.vrfProof);
      break;
    case PayloadType.TenureChange:
      bytesArray.push(hexToBytes(payload.tenureHash));
      bytesArray.push(hexToBytes(payload.previousTenureHash));
      bytesArray.push(hexToBytes(payload.burnViewHash));
      bytesArray.push(hexToBytes(payload.previousTenureEnd));
      bytesArray.push(writeUInt32BE(new Uint8Array(4), payload.previousTenureBlocks));
      bytesArray.push(writeUInt8(new Uint8Array(1), payload.cause));
      bytesArray.push(hexToBytes(payload.publicKeyHash));
      break;
  }
  return concatArray(bytesArray);
}
function deserializePayload(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const payloadType = bytesReader.readUInt8Enum(PayloadType, (n) => {
    throw new Error(`Cannot recognize PayloadType: ${n}`);
  });
  switch (payloadType) {
    case PayloadType.TokenTransfer:
      const recipient = deserializeCV(bytesReader);
      const amount = intToBigInt(bytesReader.readBytes(8));
      const memo = deserializeMemoString(bytesReader);
      return createTokenTransferPayload(recipient, amount, memo);
    case PayloadType.ContractCall:
      const contractAddress = deserializeAddress(bytesReader);
      const contractCallName = deserializeLPString(bytesReader);
      const functionName = deserializeLPString(bytesReader);
      const functionArgs = [];
      const numberOfArgs = bytesReader.readUInt32BE();
      for (let i = 0; i < numberOfArgs; i++) {
        const clarityValue = deserializeCV(bytesReader);
        functionArgs.push(clarityValue);
      }
      return createContractCallPayload(contractAddress, contractCallName, functionName, functionArgs);
    case PayloadType.SmartContract:
      const smartContractName = deserializeLPString(bytesReader);
      const codeBody = deserializeLPString(bytesReader, 4, 1e5);
      return createSmartContractPayload(smartContractName, codeBody);
    case PayloadType.VersionedSmartContract: {
      const clarityVersion = bytesReader.readUInt8Enum(ClarityVersion, (n) => {
        throw new Error(`Cannot recognize ClarityVersion: ${n}`);
      });
      const smartContractName2 = deserializeLPString(bytesReader);
      const codeBody2 = deserializeLPString(bytesReader, 4, STRING_MAX_LENGTH);
      return createSmartContractPayload(smartContractName2, codeBody2, clarityVersion);
    }
    case PayloadType.PoisonMicroblock:
      return createPoisonPayload();
    case PayloadType.Coinbase: {
      const coinbaseBytes = bytesReader.readBytes(COINBASE_BYTES_LENGTH);
      return createCoinbasePayload(coinbaseBytes);
    }
    case PayloadType.CoinbaseToAltRecipient: {
      const coinbaseBytes = bytesReader.readBytes(COINBASE_BYTES_LENGTH);
      const altRecipient = deserializeCV(bytesReader);
      return createCoinbasePayload(coinbaseBytes, altRecipient);
    }
    case PayloadType.NakamotoCoinbase: {
      const coinbaseBytes = bytesReader.readBytes(COINBASE_BYTES_LENGTH);
      const recipient2 = deserializeCV(bytesReader);
      const vrfProof = bytesReader.readBytes(VRF_PROOF_BYTES_LENGTH);
      return createNakamotoCoinbasePayload(coinbaseBytes, recipient2, vrfProof);
    }
    case PayloadType.TenureChange:
      const tenureHash = bytesToHex(bytesReader.readBytes(20));
      const previousTenureHash = bytesToHex(bytesReader.readBytes(20));
      const burnViewHash = bytesToHex(bytesReader.readBytes(20));
      const previousTenureEnd = bytesToHex(bytesReader.readBytes(32));
      const previousTenureBlocks = bytesReader.readUInt32BE();
      const cause = bytesReader.readUInt8Enum(TenureChangeCause, (n) => {
        throw new Error(`Cannot recognize TenureChangeCause: ${n}`);
      });
      const publicKeyHash = bytesToHex(bytesReader.readBytes(20));
      return createTenureChangePayload(tenureHash, previousTenureHash, burnViewHash, previousTenureEnd, previousTenureBlocks, cause, publicKeyHash);
  }
}
function deserializeMessageSignature(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  return createMessageSignature(bytesToHex(bytesReader.readBytes(RECOVERABLE_ECDSA_SIG_LENGTH_BYTES)));
}
function deserializeTransactionAuthField(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const authFieldType = bytesReader.readUInt8Enum(AuthFieldType, (n) => {
    throw new DeserializationError(`Could not read ${n} as AuthFieldType`);
  });
  switch (authFieldType) {
    case AuthFieldType.PublicKeyCompressed:
      return createTransactionAuthField(PubKeyEncoding.Compressed, deserializePublicKey(bytesReader));
    case AuthFieldType.PublicKeyUncompressed:
      return createTransactionAuthField(PubKeyEncoding.Uncompressed, createStacksPublicKey(uncompressPublicKey(deserializePublicKey(bytesReader).data)));
    case AuthFieldType.SignatureCompressed:
      return createTransactionAuthField(PubKeyEncoding.Compressed, deserializeMessageSignature(bytesReader));
    case AuthFieldType.SignatureUncompressed:
      return createTransactionAuthField(PubKeyEncoding.Uncompressed, deserializeMessageSignature(bytesReader));
    default:
      throw new Error(`Unknown auth field type: ${JSON.stringify(authFieldType)}`);
  }
}
function serializeMessageSignature(messageSignature) {
  return bytesToHex(serializeMessageSignatureBytes(messageSignature));
}
function serializeMessageSignatureBytes(messageSignature) {
  return hexToBytes(messageSignature.data);
}
function serializeTransactionAuthField(field) {
  return bytesToHex(serializeTransactionAuthFieldBytes(field));
}
function serializeTransactionAuthFieldBytes(field) {
  const bytesArray = [];
  switch (field.contents.type) {
    case StacksWireType.PublicKey:
      bytesArray.push(field.pubKeyEncoding === PubKeyEncoding.Compressed ? AuthFieldType.PublicKeyCompressed : AuthFieldType.PublicKeyUncompressed);
      bytesArray.push(hexToBytes(compressPublicKey(field.contents.data)));
      break;
    case StacksWireType.MessageSignature:
      bytesArray.push(field.pubKeyEncoding === PubKeyEncoding.Compressed ? AuthFieldType.SignatureCompressed : AuthFieldType.SignatureUncompressed);
      bytesArray.push(serializeMessageSignatureBytes(field.contents));
      break;
  }
  return concatArray(bytesArray);
}
function serializePublicKey(key) {
  return bytesToHex(serializePublicKeyBytes(key));
}
function serializePublicKeyBytes(key) {
  return key.data.slice();
}
function deserializePublicKey(serialized) {
  const bytesReader = isInstance(serialized, BytesReader) ? serialized : new BytesReader(serialized);
  const fieldId = bytesReader.readUInt8();
  const keyLength = fieldId === 4 ? UNCOMPRESSED_PUBKEY_LENGTH_BYTES : COMPRESSED_PUBKEY_LENGTH_BYTES;
  return createStacksPublicKey(concatArray([fieldId, bytesReader.readBytes(keyLength)]));
}

// node_modules/@stacks/transactions/dist/esm/wire/helpers.js
function addressFromPublicKeys(version, hashMode, numSigs, publicKeys) {
  if (publicKeys.length === 0) {
    throw Error("Invalid number of public keys");
  }
  if (hashMode === AddressHashMode.P2PKH || hashMode === AddressHashMode.P2WPKH) {
    if (publicKeys.length !== 1 || numSigs !== 1) {
      throw Error("Invalid number of public keys or signatures");
    }
  }
  if (hashMode === AddressHashMode.P2WPKH || hashMode === AddressHashMode.P2WSH || hashMode === AddressHashMode.P2WSHNonSequential) {
    if (!publicKeys.map((p) => p.data).every(publicKeyIsCompressed)) {
      throw Error("Public keys must be compressed for segwit");
    }
  }
  switch (hashMode) {
    case AddressHashMode.P2PKH:
      return addressFromVersionHash(version, hashP2PKH(publicKeys[0].data));
    case AddressHashMode.P2WPKH:
      return addressFromVersionHash(version, hashP2WPKH(publicKeys[0].data));
    case AddressHashMode.P2SH:
    case AddressHashMode.P2SHNonSequential:
      return addressFromVersionHash(version, hashP2SH(numSigs, publicKeys.map(serializePublicKeyBytes)));
    case AddressHashMode.P2WSH:
    case AddressHashMode.P2WSHNonSequential:
      return addressFromVersionHash(version, hashP2WSH(numSigs, publicKeys.map(serializePublicKeyBytes)));
  }
}
function addressFromVersionHash(version, hash2) {
  return { type: StacksWireType.Address, version, hash160: hash2 };
}
function addressToString(address2) {
  return (0, import_c32check2.c32address)(address2.version, address2.hash160);
}
function isTokenTransferPayload(p) {
  return p.payloadType === PayloadType.TokenTransfer;
}
function isContractCallPayload(p) {
  return p.payloadType === PayloadType.ContractCall;
}
function isSmartContractPayload(p) {
  return p.payloadType === PayloadType.SmartContract;
}
function isPoisonPayload(p) {
  return p.payloadType === PayloadType.PoisonMicroblock;
}
function isCoinbasePayload(p) {
  return p.payloadType === PayloadType.Coinbase;
}
function parseAssetString(id) {
  const [assetAddress, assetContractName, assetTokenName] = id.split(/\.|::/);
  const asset = createAsset(assetAddress, assetContractName, assetTokenName);
  return asset;
}
function parsePrincipalString(principalString) {
  if (principalString.includes(".")) {
    const [address2, contractName] = principalString.split(".");
    return createContractPrincipal(address2, contractName);
  } else {
    return createStandardPrincipal(principalString);
  }
}

// node_modules/@stacks/transactions/dist/esm/clarity/values/principalCV.js
function principalCV(principal3) {
  if (principal3.includes(".")) {
    const [address2, contractName] = principal3.split(".");
    return contractPrincipalCV(address2, contractName);
  } else {
    return standardPrincipalCV(principal3);
  }
}
function standardPrincipalCV(addressString) {
  const addr = createAddress(addressString);
  return { type: ClarityType.PrincipalStandard, value: addressToString(addr) };
}
function standardPrincipalCVFromAddress(address2) {
  return { type: ClarityType.PrincipalStandard, value: addressToString(address2) };
}
function contractPrincipalCV(addressString, contractName) {
  const addr = createAddress(addressString);
  const lengthPrefixedContractName = createLPString(contractName);
  return contractPrincipalCVFromAddress(addr, lengthPrefixedContractName);
}
function contractPrincipalCVFromAddress(address2, contractName) {
  if (utf8ToBytes(contractName.content).byteLength >= 128) {
    throw new Error("Contract name must be less than 128 bytes");
  }
  return {
    type: ClarityType.PrincipalContract,
    value: `${addressToString(address2)}.${contractName.content}`
  };
}
function contractPrincipalCVFromStandard(sp, contractName) {
  return {
    type: ClarityType.PrincipalContract,
    value: `${sp.value}.${contractName}`
  };
}

// node_modules/@stacks/transactions/dist/esm/clarity/values/responseCV.js
function responseErrorCV(value) {
  return { type: ClarityType.ResponseErr, value };
}
function responseOkCV(value) {
  return { type: ClarityType.ResponseOk, value };
}

// node_modules/@stacks/transactions/dist/esm/clarity/values/stringCV.js
var stringAsciiCV = (data) => {
  return { type: ClarityType.StringASCII, value: data };
};
var stringUtf8CV = (data) => {
  return { type: ClarityType.StringUTF8, value: data };
};
var stringCV = (data, encoding) => {
  switch (encoding) {
    case "ascii":
      return stringAsciiCV(data);
    case "utf8":
      return stringUtf8CV(data);
  }
};

// node_modules/@stacks/transactions/dist/esm/clarity/values/tupleCV.js
function tupleCV(data) {
  for (const key in data) {
    if (!isClarityName(key)) {
      throw new Error(`"${key}" is not a valid Clarity name`);
    }
  }
  return { type: ClarityType.Tuple, value: data };
}

// node_modules/@stacks/transactions/dist/esm/clarity/deserialize.js
function deserializeCV(serializedClarityValue) {
  let bytesReader;
  if (typeof serializedClarityValue === "string") {
    const hasHexPrefix = serializedClarityValue.slice(0, 2).toLowerCase() === "0x";
    bytesReader = new BytesReader(hexToBytes(hasHexPrefix ? serializedClarityValue.slice(2) : serializedClarityValue));
  } else if (serializedClarityValue instanceof Uint8Array) {
    bytesReader = new BytesReader(serializedClarityValue);
  } else {
    bytesReader = serializedClarityValue;
  }
  const type = bytesReader.readUInt8Enum(ClarityWireType, (n) => {
    throw new DeserializationError(`Cannot recognize Clarity Type: ${n}`);
  });
  switch (type) {
    case ClarityWireType.int:
      return intCV(bytesToTwosBigInt(bytesReader.readBytes(16)));
    case ClarityWireType.uint:
      return uintCV(bytesReader.readBytes(16));
    case ClarityWireType.buffer:
      const bufferLength = bytesReader.readUInt32BE();
      return bufferCV(bytesReader.readBytes(bufferLength));
    case ClarityWireType.true:
      return trueCV();
    case ClarityWireType.false:
      return falseCV();
    case ClarityWireType.address:
      const sAddress = deserializeAddress(bytesReader);
      return standardPrincipalCVFromAddress(sAddress);
    case ClarityWireType.contract:
      const cAddress = deserializeAddress(bytesReader);
      const contractName = deserializeLPString(bytesReader);
      return contractPrincipalCVFromAddress(cAddress, contractName);
    case ClarityWireType.ok:
      return responseOkCV(deserializeCV(bytesReader));
    case ClarityWireType.err:
      return responseErrorCV(deserializeCV(bytesReader));
    case ClarityWireType.none:
      return noneCV();
    case ClarityWireType.some:
      return someCV(deserializeCV(bytesReader));
    case ClarityWireType.list:
      const listLength = bytesReader.readUInt32BE();
      const listContents = [];
      for (let i = 0; i < listLength; i++) {
        listContents.push(deserializeCV(bytesReader));
      }
      return listCV(listContents);
    case ClarityWireType.tuple:
      const tupleLength = bytesReader.readUInt32BE();
      const tupleContents = {};
      for (let i = 0; i < tupleLength; i++) {
        const clarityName = deserializeLPString(bytesReader).content;
        if (clarityName === void 0) {
          throw new DeserializationError('"content" is undefined');
        }
        tupleContents[clarityName] = deserializeCV(bytesReader);
      }
      return tupleCV(tupleContents);
    case ClarityWireType.ascii:
      const asciiStrLen = bytesReader.readUInt32BE();
      const asciiStr = bytesToAscii(bytesReader.readBytes(asciiStrLen));
      return stringAsciiCV(asciiStr);
    case ClarityWireType.utf8:
      const utf8StrLen = bytesReader.readUInt32BE();
      const utf8Str = bytesToUtf8(bytesReader.readBytes(utf8StrLen));
      return stringUtf8CV(utf8Str);
    default:
      throw new DeserializationError("Unable to deserialize Clarity Value from Uint8Array. Could not find valid Clarity Type.");
  }
}

// node_modules/@stacks/transactions/dist/esm/clarity/serialize.js
function bytesWithTypeID(typeId, bytes2) {
  return concatArray([clarityTypeToByte(typeId), bytes2]);
}
function serializeBoolCV(value) {
  return new Uint8Array([clarityTypeToByte(value.type)]);
}
function serializeOptionalCV(cv) {
  if (cv.type === ClarityType.OptionalNone) {
    return new Uint8Array([clarityTypeToByte(cv.type)]);
  } else {
    return bytesWithTypeID(cv.type, serializeCVBytes(cv.value));
  }
}
function serializeBufferCV(cv) {
  const length = new Uint8Array(4);
  writeUInt32BE(length, Math.ceil(cv.value.length / 2), 0);
  return bytesWithTypeID(cv.type, concatBytes(length, hexToBytes(cv.value)));
}
function serializeIntCV(cv) {
  const bytes2 = bigIntToBytes(toTwos(BigInt(cv.value), BigInt(CLARITY_INT_SIZE)), CLARITY_INT_BYTE_SIZE);
  return bytesWithTypeID(cv.type, bytes2);
}
function serializeUIntCV(cv) {
  const bytes2 = bigIntToBytes(BigInt(cv.value), CLARITY_INT_BYTE_SIZE);
  return bytesWithTypeID(cv.type, bytes2);
}
function serializeStandardPrincipalCV(cv) {
  return bytesWithTypeID(cv.type, serializeAddressBytes(createAddress(cv.value)));
}
function serializeContractPrincipalCV(cv) {
  const [address2, name] = parseContractId(cv.value);
  return bytesWithTypeID(cv.type, concatBytes(serializeAddressBytes(createAddress(address2)), serializeLPStringBytes(createLPString(name))));
}
function serializeResponseCV(cv) {
  return bytesWithTypeID(cv.type, serializeCVBytes(cv.value));
}
function serializeListCV(cv) {
  const bytesArray = [];
  const length = new Uint8Array(4);
  writeUInt32BE(length, cv.value.length, 0);
  bytesArray.push(length);
  for (const value of cv.value) {
    const serializedValue = serializeCVBytes(value);
    bytesArray.push(serializedValue);
  }
  return bytesWithTypeID(cv.type, concatArray(bytesArray));
}
function serializeTupleCV(cv) {
  const bytesArray = [];
  const length = new Uint8Array(4);
  writeUInt32BE(length, Object.keys(cv.value).length, 0);
  bytesArray.push(length);
  const lexicographicOrder = Object.keys(cv.value).sort((a, b) => a.localeCompare(b));
  for (const key of lexicographicOrder) {
    const nameWithLength = createLPString(key);
    bytesArray.push(serializeLPStringBytes(nameWithLength));
    const serializedValue = serializeCVBytes(cv.value[key]);
    bytesArray.push(serializedValue);
  }
  return bytesWithTypeID(cv.type, concatArray(bytesArray));
}
function serializeStringCV(cv, encoding) {
  const bytesArray = [];
  const str = encoding == "ascii" ? asciiToBytes(cv.value) : utf8ToBytes(cv.value);
  const len = new Uint8Array(4);
  writeUInt32BE(len, str.length, 0);
  bytesArray.push(len);
  bytesArray.push(str);
  return bytesWithTypeID(cv.type, concatArray(bytesArray));
}
function serializeStringAsciiCV(cv) {
  return serializeStringCV(cv, "ascii");
}
function serializeStringUtf8CV(cv) {
  return serializeStringCV(cv, "utf8");
}
function serializeCV(value) {
  return bytesToHex(serializeCVBytes(value));
}
function serializeCVBytes(value) {
  switch (value.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return serializeBoolCV(value);
    case ClarityType.OptionalNone:
    case ClarityType.OptionalSome:
      return serializeOptionalCV(value);
    case ClarityType.Buffer:
      return serializeBufferCV(value);
    case ClarityType.UInt:
      return serializeUIntCV(value);
    case ClarityType.Int:
      return serializeIntCV(value);
    case ClarityType.PrincipalStandard:
      return serializeStandardPrincipalCV(value);
    case ClarityType.PrincipalContract:
      return serializeContractPrincipalCV(value);
    case ClarityType.ResponseOk:
    case ClarityType.ResponseErr:
      return serializeResponseCV(value);
    case ClarityType.List:
      return serializeListCV(value);
    case ClarityType.Tuple:
      return serializeTupleCV(value);
    case ClarityType.StringASCII:
      return serializeStringAsciiCV(value);
    case ClarityType.StringUTF8:
      return serializeStringUtf8CV(value);
    default:
      throw new SerializationError("Unable to serialize. Invalid Clarity Value.");
  }
}

// node_modules/@stacks/transactions/dist/esm/clarity/parser.js
function regex(pattern, map) {
  return (s) => {
    const match = s.match(pattern);
    if (!match || match.index !== 0)
      return { success: false };
    return {
      success: true,
      value: match[0],
      rest: s.substring(match[0].length),
      capture: map ? map(match[0]) : void 0
    };
  };
}
function whitespace() {
  return regex(/\s+/);
}
function lazy(c) {
  return (s) => c()(s);
}
function either(combinators) {
  return (s) => {
    for (const c of combinators) {
      const result = c(s);
      if (result.success)
        return result;
    }
    return { success: false };
  };
}
function entire(combinator) {
  return (s) => {
    const result = combinator(s);
    if (!result.success || result.rest)
      return { success: false };
    return result;
  };
}
function optional(c) {
  return (s) => {
    const result = c(s);
    if (result.success)
      return result;
    return {
      success: true,
      value: "",
      rest: s
    };
  };
}
function sequence(combinators, reduce = (v) => v[0]) {
  return (s) => {
    let rest = s;
    let value = "";
    const captures = [];
    for (const c of combinators) {
      const result = c(rest);
      if (!result.success)
        return { success: false };
      rest = result.rest;
      value += result.value;
      if (result.capture)
        captures.push(result.capture);
    }
    return {
      success: true,
      value,
      rest,
      capture: reduce(captures)
    };
  };
}
function chain(combinators, reduce = (v) => v[0]) {
  const joined = combinators.flatMap((combinator, index) => index === 0 ? [combinator] : [optional(whitespace()), combinator]);
  return sequence(joined, reduce);
}
function parens(combinator) {
  return chain([regex(/\(/), combinator, regex(/\)/)]);
}
function greedy(min, combinator, reduce = (v) => v[v.length - 1], separator) {
  return (s) => {
    let rest = s;
    let value = "";
    const captures = [];
    let count;
    for (count = 0; ; count++) {
      const result = combinator(rest);
      if (!result.success)
        break;
      rest = result.rest;
      value += result.value;
      if (result.capture)
        captures.push(result.capture);
      if (separator) {
        const sepResult = separator(rest);
        if (!sepResult.success) {
          count++;
          break;
        }
        rest = sepResult.rest;
        value += sepResult.value;
      }
    }
    if (count < min)
      return { success: false };
    return {
      success: true,
      value,
      rest,
      capture: reduce(captures)
    };
  };
}
function capture(combinator, map) {
  return (s) => {
    const result = combinator(s);
    if (!result.success)
      return { success: false };
    return {
      success: true,
      value: result.value,
      rest: result.rest,
      capture: map ? map(result.value) : result.value
    };
  };
}
function clInt() {
  return capture(regex(/-?[0-9]+/), (v) => cl_exports.int(parseInt(v)));
}
function clUint() {
  return sequence([regex(/u/), capture(regex(/[0-9]+/), (v) => cl_exports.uint(parseInt(v)))]);
}
function clBool() {
  return capture(regex(/true|false/), (v) => cl_exports.bool(v === "true"));
}
function clPrincipal() {
  return sequence([
    regex(/'/),
    capture(sequence([regex(/[A-Z0-9]+/), optional(sequence([regex(/\./), regex(/[a-zA-Z0-9-]+/)]))]), cl_exports.address)
  ]);
}
function clBuffer() {
  return sequence([regex(/0x/), capture(regex(/[0-9a-fA-F]+/), cl_exports.bufferFromHex)]);
}
function unescape(input) {
  try {
    return JSON.parse(`"${input}"`);
  } catch (error2) {
    throw new Error(`Failed to unescape string: "${input}" ${error2 instanceof Error ? error2.message : error2}`);
  }
}
function clAscii() {
  return sequence([
    regex(/"/),
    capture(regex(/(\\.|[^"])*/), (t) => cl_exports.stringAscii(unescape(t))),
    regex(/"/)
  ]);
}
function clUtf8() {
  return sequence([
    regex(/u"/),
    capture(regex(/(\\.|[^"])*/), (t) => cl_exports.stringUtf8(unescape(t))),
    regex(/"/)
  ]);
}
function clList() {
  return parens(sequence([
    regex(/list/),
    greedy(0, sequence([whitespace(), clValue()]), (c) => cl_exports.list(c))
  ]));
}
function clTuple() {
  const tupleCurly = chain([
    regex(/\{/),
    greedy(1, sequence([
      capture(regex(/[a-zA-Z][a-zA-Z0-9_]*/)),
      regex(/\s*:/),
      whitespace(),
      clValue()
    ], ([k, v]) => cl_exports.tuple({ [k]: v })), (c) => cl_exports.tuple(Object.assign({}, ...c.map((t) => t.value))), regex(/\s*,\s*/)),
    regex(/\}/)
  ]);
  const tupleFunction = parens(sequence([
    optional(whitespace()),
    regex(/tuple/),
    whitespace(),
    greedy(1, parens(sequence([
      optional(whitespace()),
      capture(regex(/[a-zA-Z][a-zA-Z0-9_]*/)),
      whitespace(),
      clValue(),
      optional(whitespace())
    ], ([k, v]) => cl_exports.tuple({ [k]: v }))), (c) => cl_exports.tuple(Object.assign({}, ...c.map((t) => t.value))), whitespace())
  ]));
  return either([tupleCurly, tupleFunction]);
}
function clNone() {
  return capture(regex(/none/), cl_exports.none);
}
function clSome() {
  return parens(sequence([regex(/some/), whitespace(), clValue()], (c) => cl_exports.some(c[0])));
}
function clOk() {
  return parens(sequence([regex(/ok/), whitespace(), clValue()], (c) => cl_exports.ok(c[0])));
}
function clErr() {
  return parens(sequence([regex(/err/), whitespace(), clValue()], (c) => cl_exports.error(c[0])));
}
function clValue(map = (v) => v) {
  return either([
    clBuffer,
    clAscii,
    clUtf8,
    clInt,
    clUint,
    clBool,
    clPrincipal,
    clList,
    clTuple,
    clNone,
    clSome,
    clOk,
    clErr
  ].map(lazy).map(map));
}
function parse(clarityValueString) {
  const result = clValue(entire)(clarityValueString);
  if (!result.success || !result.capture)
    throw "Parse error";
  return result.capture;
}
function internal_parseCommaSeparated(clarityValueString) {
  const combinator = entire(greedy(1, clValue(), (c) => cl_exports.list(c), regex(/\s*,\s*/)));
  const result = combinator(clarityValueString);
  if (!result.success || !result.capture)
    throw `Error trying to parse string: ${clarityValueString}`;
  return result.capture.value;
}

// node_modules/@stacks/transactions/dist/esm/utils.js
var randomBytes = (bytesLength) => utils.randomBytes(bytesLength);
var leftPadHex = (hexString) => hexString.length % 2 ? `0${hexString}` : hexString;
var leftPadHexToLength = (hexString, length) => hexString.padStart(length, "0");
var rightPadHexToLength = (hexString, length) => hexString.padEnd(length, "0");
var exceedsMaxLengthBytes = (string, maxLengthBytes) => string ? utf8ToBytes(string).length > maxLengthBytes : false;
function cloneDeep(obj) {
  return (0, import_lodash.default)(obj);
}
function omit(obj, prop) {
  const clone = cloneDeep(obj);
  delete clone[prop];
  return clone;
}
var hash160 = (input) => {
  return ripemd160(sha256(input));
};
var txidFromData = (data) => {
  return bytesToHex(sha512_256(data));
};
var txidFromBytes = txidFromData;
var hashP2PKH = (input) => {
  return bytesToHex(hash160(input));
};
var hashP2WPKH = (input) => {
  const keyHash = hash160(input);
  const redeemScript = concatBytes(new Uint8Array([0]), new Uint8Array([keyHash.length]), keyHash);
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};
var hashP2SH = (numSigs, pubKeys) => {
  if (numSigs > 15 || pubKeys.length > 15) {
    throw Error("P2SH multisig address can only contain up to 15 public keys");
  }
  const bytesArray = [];
  bytesArray.push(80 + numSigs);
  pubKeys.forEach((pubKey) => {
    bytesArray.push(pubKey.length);
    bytesArray.push(pubKey);
  });
  bytesArray.push(80 + pubKeys.length);
  bytesArray.push(174);
  const redeemScript = concatArray(bytesArray);
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};
var hashP2WSH = (numSigs, pubKeys) => {
  if (numSigs > 15 || pubKeys.length > 15) {
    throw Error("P2WSH multisig address can only contain up to 15 public keys");
  }
  const scriptArray = [];
  scriptArray.push(80 + numSigs);
  pubKeys.forEach((pubKey) => {
    scriptArray.push(pubKey.length);
    scriptArray.push(pubKey);
  });
  scriptArray.push(80 + pubKeys.length);
  scriptArray.push(174);
  const script = concatArray(scriptArray);
  const digest = sha256(script);
  const bytesArray = [];
  bytesArray.push(0);
  bytesArray.push(digest.length);
  bytesArray.push(digest);
  const redeemScript = concatArray(bytesArray);
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};
function isClarityName(name) {
  const regex2 = /^[a-zA-Z]([a-zA-Z0-9]|[-_!?+<>=/*])*$|^[-+=/*]$|^[<>]=?$/;
  return regex2.test(name) && name.length < 128;
}
function cvToHex(cv) {
  const serialized = serializeCV(cv);
  return `0x${serialized}`;
}
function hexToCV(hex) {
  return deserializeCV(hex);
}
var parseReadOnlyResponse = (response) => {
  if (response.okay)
    return hexToCV(response.result);
  throw new Error(response.cause);
};
var validateStacksAddress = (address2) => {
  try {
    (0, import_c32check3.c32addressDecode)(address2);
    return true;
  } catch (e) {
    return false;
  }
};
function parseContractId(contractId) {
  const [address2, name] = contractId.split(".");
  if (!address2 || !name)
    throw new Error(`Invalid contract identifier: ${contractId}`);
  return [address2, name];
}

// node_modules/@stacks/transactions/dist/esm/keys.js
utils.hmacSha256Sync = (key, ...msgs) => {
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
  publicKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey;
  const addrVer = addressHashModeToVersion(AddressHashMode.P2PKH, network);
  const addr = addressFromVersionHash(addrVer, hashP2PKH(publicKey));
  const addrString = addressToString(addr);
  return addrString;
}
function createStacksPublicKey(publicKey) {
  publicKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey;
  return {
    type: StacksWireType.PublicKey,
    data: publicKey
  };
}
function publicKeyFromSignatureVrs(messageHash, messageSignature, pubKeyEncoding = PubKeyEncoding.Compressed) {
  const parsedSignature = parseRecoverableSignatureVrs(messageSignature);
  const signature = new Signature(hexToBigInt(parsedSignature.r), hexToBigInt(parsedSignature.s));
  const point = Point.fromSignature(messageHash, signature, parsedSignature.recoveryId);
  const compressed = pubKeyEncoding === PubKeyEncoding.Compressed;
  return point.toHex(compressed);
}
function publicKeyFromSignatureRsv(messageHash, messageSignature, pubKeyEncoding = PubKeyEncoding.Compressed) {
  return publicKeyFromSignatureVrs(messageHash, signatureRsvToVrs(messageSignature), pubKeyEncoding);
}
function privateKeyToHex(publicKey) {
  return typeof publicKey === "string" ? publicKey : bytesToHex(publicKey);
}
var publicKeyToHex = privateKeyToHex;
var isPrivateKeyCompressed = privateKeyIsCompressed;
function privateKeyIsCompressed(privateKey) {
  const length = typeof privateKey === "string" ? privateKey.length / 2 : privateKey.byteLength;
  return length === PRIVATE_KEY_BYTES_COMPRESSED;
}
var isPublicKeyCompressed = publicKeyIsCompressed;
function publicKeyIsCompressed(publicKey) {
  return !publicKeyToHex(publicKey).startsWith("04");
}
function privateKeyToPublic(privateKey) {
  privateKey = privateKeyToBytes(privateKey);
  const isCompressed = privateKeyIsCompressed(privateKey);
  return bytesToHex(getPublicKey(privateKey.slice(0, 32), isCompressed));
}
function compressPublicKey(publicKey) {
  return Point.fromHex(publicKeyToHex(publicKey)).toHex(true);
}
function uncompressPublicKey(publicKey) {
  return Point.fromHex(publicKeyToHex(publicKey)).toHex(false);
}
var makeRandomPrivKey = randomPrivateKey;
function randomPrivateKey() {
  return compressPrivateKey(utils.randomPrivateKey());
}
function signWithKey(privateKey, messageHash) {
  privateKey = privateKeyToBytes(privateKey);
  const [rawSignature, recoveryId] = signSync(messageHash, privateKey.slice(0, 32), {
    canonical: true,
    recovered: true
  });
  if (recoveryId == null) {
    throw new Error("No signature recoveryId received");
  }
  const recoveryIdHex = intToHex(recoveryId, 1);
  return recoveryIdHex + Signature.fromHex(rawSignature).toCompactHex();
}
function signMessageHashRsv({ messageHash, privateKey }) {
  return signatureVrsToRsv(signWithKey(privateKey, messageHash));
}
function compressPrivateKey(privateKey) {
  privateKey = privateKeyToHex(privateKey);
  return privateKey.length == PRIVATE_KEY_BYTES_COMPRESSED * 2 ? privateKey : `${privateKey}01`;
}
function privateKeyToAddress(privateKey, network) {
  const publicKey = privateKeyToPublic(privateKey);
  return publicKeyToAddressSingleSig(publicKey, network);
}
function publicKeyToAddress(...args) {
  if (typeof args[0] === "number")
    return _publicKeyToAddress(...args);
  return publicKeyToAddressSingleSig(...args);
}
function _publicKeyToAddress(version, publicKey) {
  publicKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey;
  return (0, import_c32check4.c32address)(version, bytesToHex(hash160(publicKey)));
}
function publicKeyToAddressSingleSig(publicKey, network) {
  network = network ? networkFrom(network) : STACKS_MAINNET;
  publicKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey;
  return (0, import_c32check4.c32address)(network.addressVersion.singleSig, bytesToHex(hash160(publicKey)));
}

// node_modules/@stacks/transactions/dist/esm/authorization.js
function emptyMessageSignature() {
  return {
    type: StacksWireType.MessageSignature,
    data: bytesToHex(new Uint8Array(RECOVERABLE_ECDSA_SIG_LENGTH_BYTES))
  };
}
function createSpendingCondition(options) {
  if ("publicKey" in options) {
    return createSingleSigSpendingCondition(AddressHashMode.P2PKH, options.publicKey, options.nonce, options.fee);
  }
  return createMultiSigSpendingCondition(AddressHashMode.P2SH, options.numSignatures, options.publicKeys, options.nonce, options.fee);
}
function createSingleSigSpendingCondition(hashMode, pubKey, nonce, fee) {
  const signer = addressFromPublicKeys(0, hashMode, 1, [createStacksPublicKey(pubKey)]).hash160;
  const keyEncoding = publicKeyIsCompressed(pubKey) ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed;
  return {
    hashMode,
    signer,
    nonce: intToBigInt(nonce),
    fee: intToBigInt(fee),
    keyEncoding,
    signature: emptyMessageSignature()
  };
}
function createMultiSigSpendingCondition(hashMode, numSigs, pubKeys, nonce, fee) {
  const stacksPublicKeys = pubKeys.map(createStacksPublicKey);
  const signer = addressFromPublicKeys(0, hashMode, numSigs, stacksPublicKeys).hash160;
  return {
    hashMode,
    signer,
    nonce: intToBigInt(nonce),
    fee: intToBigInt(fee),
    fields: [],
    signaturesRequired: numSigs
  };
}
function isSingleSig(condition) {
  return "signature" in condition;
}
function isSequentialMultiSig(hashMode) {
  return hashMode === AddressHashMode.P2SH || hashMode === AddressHashMode.P2WSH;
}
function isNonSequentialMultiSig(hashMode) {
  return hashMode === AddressHashMode.P2SHNonSequential || hashMode === AddressHashMode.P2WSHNonSequential;
}
function clearCondition(condition) {
  const cloned = cloneDeep(condition);
  cloned.nonce = 0;
  cloned.fee = 0;
  if (isSingleSig(cloned)) {
    cloned.signature = emptyMessageSignature();
  } else {
    cloned.fields = [];
  }
  return {
    ...cloned,
    nonce: BigInt(0),
    fee: BigInt(0)
  };
}
function serializeSingleSigSpendingCondition(condition) {
  return bytesToHex(serializeSingleSigSpendingConditionBytes(condition));
}
function serializeSingleSigSpendingConditionBytes(condition) {
  const bytesArray = [
    condition.hashMode,
    hexToBytes(condition.signer),
    intToBytes(condition.nonce, 8),
    intToBytes(condition.fee, 8),
    condition.keyEncoding,
    serializeMessageSignatureBytes(condition.signature)
  ];
  return concatArray(bytesArray);
}
function serializeMultiSigSpendingCondition(condition) {
  return bytesToHex(serializeMultiSigSpendingConditionBytes(condition));
}
function serializeMultiSigSpendingConditionBytes(condition) {
  const bytesArray = [
    condition.hashMode,
    hexToBytes(condition.signer),
    intToBytes(condition.nonce, 8),
    intToBytes(condition.fee, 8)
  ];
  const fields = createLPList(condition.fields);
  bytesArray.push(serializeLPListBytes(fields));
  const numSigs = new Uint8Array(2);
  writeUInt16BE(numSigs, condition.signaturesRequired, 0);
  bytesArray.push(numSigs);
  return concatArray(bytesArray);
}
function deserializeSingleSigSpendingCondition(hashMode, bytesReader) {
  const signer = bytesToHex(bytesReader.readBytes(20));
  const nonce = BigInt(`0x${bytesToHex(bytesReader.readBytes(8))}`);
  const fee = BigInt(`0x${bytesToHex(bytesReader.readBytes(8))}`);
  const keyEncoding = bytesReader.readUInt8Enum(PubKeyEncoding, (n) => {
    throw new DeserializationError(`Could not parse ${n} as PubKeyEncoding`);
  });
  if (hashMode === AddressHashMode.P2WPKH && keyEncoding != PubKeyEncoding.Compressed) {
    throw new DeserializationError("Failed to parse singlesig spending condition: incomaptible hash mode and key encoding");
  }
  const signature = deserializeMessageSignature(bytesReader);
  return {
    hashMode,
    signer,
    nonce,
    fee,
    keyEncoding,
    signature
  };
}
function deserializeMultiSigSpendingCondition(hashMode, bytesReader) {
  const signer = bytesToHex(bytesReader.readBytes(20));
  const nonce = BigInt("0x" + bytesToHex(bytesReader.readBytes(8)));
  const fee = BigInt("0x" + bytesToHex(bytesReader.readBytes(8)));
  const fields = deserializeLPList(bytesReader, StacksWireType.TransactionAuthField).values;
  let haveUncompressed = false;
  let numSigs = 0;
  for (const field of fields) {
    switch (field.contents.type) {
      case StacksWireType.PublicKey:
        if (!publicKeyIsCompressed(field.contents.data))
          haveUncompressed = true;
        break;
      case StacksWireType.MessageSignature:
        if (field.pubKeyEncoding === PubKeyEncoding.Uncompressed)
          haveUncompressed = true;
        numSigs += 1;
        if (numSigs === 65536)
          throw new VerificationError("Failed to parse multisig spending condition: too many signatures");
        break;
    }
  }
  const signaturesRequired = bytesReader.readUInt16BE();
  if (haveUncompressed && (hashMode === AddressHashMode.P2WSH || hashMode === AddressHashMode.P2WSHNonSequential)) {
    throw new VerificationError("Uncompressed keys are not allowed in this hash mode");
  }
  return {
    hashMode,
    signer,
    nonce,
    fee,
    fields,
    signaturesRequired
  };
}
function serializeSpendingCondition(condition) {
  return bytesToHex(serializeSpendingConditionBytes(condition));
}
function serializeSpendingConditionBytes(condition) {
  if (isSingleSig(condition))
    return serializeSingleSigSpendingConditionBytes(condition);
  return serializeMultiSigSpendingConditionBytes(condition);
}
function deserializeSpendingCondition(bytesReader) {
  const hashMode = bytesReader.readUInt8Enum(AddressHashMode, (n) => {
    throw new DeserializationError(`Could not parse ${n} as AddressHashMode`);
  });
  if (hashMode === AddressHashMode.P2PKH || hashMode === AddressHashMode.P2WPKH) {
    return deserializeSingleSigSpendingCondition(hashMode, bytesReader);
  } else {
    return deserializeMultiSigSpendingCondition(hashMode, bytesReader);
  }
}
function sigHashPreSign(curSigHash, authType, fee, nonce) {
  const hashLength = 32 + 1 + 8 + 8;
  const sigHash = curSigHash + bytesToHex(new Uint8Array([authType])) + bytesToHex(intToBytes(fee, 8)) + bytesToHex(intToBytes(nonce, 8));
  if (hexToBytes(sigHash).byteLength !== hashLength) {
    throw Error("Invalid signature hash length");
  }
  return txidFromData(hexToBytes(sigHash));
}
function sigHashPostSign(curSigHash, pubKey, signature) {
  const hashLength = 32 + 1 + RECOVERABLE_ECDSA_SIG_LENGTH_BYTES;
  const pubKeyEncoding = publicKeyIsCompressed(pubKey.data) ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed;
  const sigHash = curSigHash + leftPadHex(pubKeyEncoding.toString(16)) + signature;
  const sigHashBytes = hexToBytes(sigHash);
  if (sigHashBytes.byteLength > hashLength) {
    throw Error("Invalid signature hash length");
  }
  return txidFromData(sigHashBytes);
}
function nextSignature(curSigHash, authType, fee, nonce, privateKey) {
  const sigHashPre = sigHashPreSign(curSigHash, authType, fee, nonce);
  const signature = signWithKey(privateKey, sigHashPre);
  const publicKey = createStacksPublicKey(privateKeyToPublic(privateKey));
  const nextSigHash = sigHashPostSign(sigHashPre, publicKey, signature);
  return {
    nextSig: signature,
    nextSigHash
  };
}
function nextVerification(initialSigHash, authType, fee, nonce, pubKeyEncoding, signature) {
  const sigHashPre = sigHashPreSign(initialSigHash, authType, fee, nonce);
  const publicKey = createStacksPublicKey(publicKeyFromSignatureVrs(sigHashPre, signature, pubKeyEncoding));
  const nextSigHash = sigHashPostSign(sigHashPre, publicKey, signature);
  return {
    pubKey: publicKey,
    nextSigHash
  };
}
function newInitialSigHash() {
  const spendingCondition = createSingleSigSpendingCondition(AddressHashMode.P2PKH, "", 0, 0);
  spendingCondition.signer = createEmptyAddress().hash160;
  spendingCondition.keyEncoding = PubKeyEncoding.Compressed;
  spendingCondition.signature = emptyMessageSignature();
  return spendingCondition;
}
function verify2(condition, initialSigHash, authType) {
  if (isSingleSig(condition)) {
    return verifySingleSig(condition, initialSigHash, authType);
  } else {
    return verifyMultiSig(condition, initialSigHash, authType);
  }
}
function verifySingleSig(condition, initialSigHash, authType) {
  const { pubKey, nextSigHash } = nextVerification(initialSigHash, authType, condition.fee, condition.nonce, condition.keyEncoding, condition.signature.data);
  const addrBytes = addressFromPublicKeys(0, condition.hashMode, 1, [pubKey]).hash160;
  if (addrBytes !== condition.signer)
    throw new VerificationError(`Signer hash does not equal hash of public key(s): ${addrBytes} != ${condition.signer}`);
  return nextSigHash;
}
function verifyMultiSig(condition, initialSigHash, authType) {
  const publicKeys = [];
  let curSigHash = initialSigHash;
  let haveUncompressed = false;
  let numSigs = 0;
  for (const field of condition.fields) {
    switch (field.contents.type) {
      case StacksWireType.PublicKey:
        if (!publicKeyIsCompressed(field.contents.data))
          haveUncompressed = true;
        publicKeys.push(field.contents);
        break;
      case StacksWireType.MessageSignature:
        if (field.pubKeyEncoding === PubKeyEncoding.Uncompressed)
          haveUncompressed = true;
        const { pubKey, nextSigHash } = nextVerification(curSigHash, authType, condition.fee, condition.nonce, field.pubKeyEncoding, field.contents.data);
        if (isSequentialMultiSig(condition.hashMode)) {
          curSigHash = nextSigHash;
        }
        publicKeys.push(pubKey);
        numSigs += 1;
        if (numSigs === 65536)
          throw new VerificationError("Too many signatures");
        break;
    }
  }
  if (isSequentialMultiSig(condition.hashMode) && numSigs !== condition.signaturesRequired || isNonSequentialMultiSig(condition.hashMode) && numSigs < condition.signaturesRequired)
    throw new VerificationError("Incorrect number of signatures");
  if (haveUncompressed && (condition.hashMode === AddressHashMode.P2WSH || condition.hashMode === AddressHashMode.P2WSHNonSequential))
    throw new VerificationError("Uncompressed keys are not allowed in this hash mode");
  const addrBytes = addressFromPublicKeys(0, condition.hashMode, condition.signaturesRequired, publicKeys).hash160;
  if (addrBytes !== condition.signer)
    throw new VerificationError(`Signer hash does not equal hash of public key(s): ${addrBytes} != ${condition.signer}`);
  return curSigHash;
}
function createStandardAuth(spendingCondition) {
  return {
    authType: AuthType.Standard,
    spendingCondition
  };
}
function createSponsoredAuth(spendingCondition, sponsorSpendingCondition) {
  return {
    authType: AuthType.Sponsored,
    spendingCondition,
    sponsorSpendingCondition: sponsorSpendingCondition ? sponsorSpendingCondition : createSingleSigSpendingCondition(AddressHashMode.P2PKH, "0".repeat(66), 0, 0)
  };
}
function intoInitialSighashAuth(auth) {
  if (auth.spendingCondition) {
    switch (auth.authType) {
      case AuthType.Standard:
        return createStandardAuth(clearCondition(auth.spendingCondition));
      case AuthType.Sponsored:
        return createSponsoredAuth(clearCondition(auth.spendingCondition), newInitialSigHash());
      default:
        throw new SigningError("Unexpected authorization type for signing");
    }
  }
  throw new Error("Authorization missing SpendingCondition");
}
function verifyOrigin(auth, initialSigHash) {
  switch (auth.authType) {
    case AuthType.Standard:
      return verify2(auth.spendingCondition, initialSigHash, AuthType.Standard);
    case AuthType.Sponsored:
      return verify2(auth.spendingCondition, initialSigHash, AuthType.Standard);
    default:
      throw new SigningError("Invalid origin auth type");
  }
}
function setFee(auth, amount) {
  switch (auth.authType) {
    case AuthType.Standard:
      const spendingCondition = {
        ...auth.spendingCondition,
        fee: intToBigInt(amount)
      };
      return { ...auth, spendingCondition };
    case AuthType.Sponsored:
      const sponsorSpendingCondition = {
        ...auth.sponsorSpendingCondition,
        fee: intToBigInt(amount)
      };
      return { ...auth, sponsorSpendingCondition };
  }
}
function getFee(auth) {
  switch (auth.authType) {
    case AuthType.Standard:
      return auth.spendingCondition.fee;
    case AuthType.Sponsored:
      return auth.sponsorSpendingCondition.fee;
  }
}
function setNonce(auth, nonce) {
  const spendingCondition = {
    ...auth.spendingCondition,
    nonce: intToBigInt(nonce)
  };
  return {
    ...auth,
    spendingCondition
  };
}
function setSponsorNonce(auth, nonce) {
  const sponsorSpendingCondition = {
    ...auth.sponsorSpendingCondition,
    nonce: intToBigInt(nonce)
  };
  return {
    ...auth,
    sponsorSpendingCondition
  };
}
function setSponsor(auth, sponsorSpendingCondition) {
  const sc = {
    ...sponsorSpendingCondition,
    nonce: intToBigInt(sponsorSpendingCondition.nonce),
    fee: intToBigInt(sponsorSpendingCondition.fee)
  };
  return {
    ...auth,
    sponsorSpendingCondition: sc
  };
}
function serializeAuthorization(auth) {
  return bytesToHex(serializeAuthorizationBytes(auth));
}
function serializeAuthorizationBytes(auth) {
  const bytesArray = [];
  bytesArray.push(auth.authType);
  switch (auth.authType) {
    case AuthType.Standard:
      bytesArray.push(serializeSpendingConditionBytes(auth.spendingCondition));
      break;
    case AuthType.Sponsored:
      bytesArray.push(serializeSpendingConditionBytes(auth.spendingCondition));
      bytesArray.push(serializeSpendingConditionBytes(auth.sponsorSpendingCondition));
      break;
  }
  return concatArray(bytesArray);
}
function deserializeAuthorization(bytesReader) {
  const authType = bytesReader.readUInt8Enum(AuthType, (n) => {
    throw new DeserializationError(`Could not parse ${n} as AuthType`);
  });
  let spendingCondition;
  switch (authType) {
    case AuthType.Standard:
      spendingCondition = deserializeSpendingCondition(bytesReader);
      return createStandardAuth(spendingCondition);
    case AuthType.Sponsored:
      spendingCondition = deserializeSpendingCondition(bytesReader);
      const sponsorSpendingCondition = deserializeSpendingCondition(bytesReader);
      return createSponsoredAuth(spendingCondition, sponsorSpendingCondition);
  }
}

// node_modules/@stacks/transactions/dist/esm/builders.js
var import_c32check5 = __toESM(require_lib());

// node_modules/@stacks/transactions/dist/esm/contract-abi.js
var ClarityAbiTypeId;
(function(ClarityAbiTypeId2) {
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeUInt128"] = 1] = "ClarityAbiTypeUInt128";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeInt128"] = 2] = "ClarityAbiTypeInt128";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeBool"] = 3] = "ClarityAbiTypeBool";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypePrincipal"] = 4] = "ClarityAbiTypePrincipal";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeNone"] = 5] = "ClarityAbiTypeNone";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeBuffer"] = 6] = "ClarityAbiTypeBuffer";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeResponse"] = 7] = "ClarityAbiTypeResponse";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeOptional"] = 8] = "ClarityAbiTypeOptional";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeTuple"] = 9] = "ClarityAbiTypeTuple";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeList"] = 10] = "ClarityAbiTypeList";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeStringAscii"] = 11] = "ClarityAbiTypeStringAscii";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeStringUtf8"] = 12] = "ClarityAbiTypeStringUtf8";
  ClarityAbiTypeId2[ClarityAbiTypeId2["ClarityAbiTypeTraitReference"] = 13] = "ClarityAbiTypeTraitReference";
})(ClarityAbiTypeId || (ClarityAbiTypeId = {}));
var isClarityAbiPrimitive = (val) => typeof val === "string";
var isClarityAbiBuffer = (val) => val.buffer !== void 0;
var isClarityAbiStringAscii = (val) => val["string-ascii"] !== void 0;
var isClarityAbiStringUtf8 = (val) => val["string-utf8"] !== void 0;
var isClarityAbiResponse = (val) => val.response !== void 0;
var isClarityAbiOptional = (val) => val.optional !== void 0;
var isClarityAbiTuple = (val) => val.tuple !== void 0;
var isClarityAbiList = (val) => val.list !== void 0;
function getTypeUnion(val) {
  if (isClarityAbiPrimitive(val)) {
    if (val === "uint128") {
      return { id: ClarityAbiTypeId.ClarityAbiTypeUInt128, type: val };
    } else if (val === "int128") {
      return { id: ClarityAbiTypeId.ClarityAbiTypeInt128, type: val };
    } else if (val === "bool") {
      return { id: ClarityAbiTypeId.ClarityAbiTypeBool, type: val };
    } else if (val === "principal") {
      return { id: ClarityAbiTypeId.ClarityAbiTypePrincipal, type: val };
    } else if (val === "trait_reference") {
      return { id: ClarityAbiTypeId.ClarityAbiTypeTraitReference, type: val };
    } else if (val === "none") {
      return { id: ClarityAbiTypeId.ClarityAbiTypeNone, type: val };
    } else {
      throw new Error(`Unexpected Clarity ABI type primitive: ${JSON.stringify(val)}`);
    }
  } else if (isClarityAbiBuffer(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeBuffer, type: val };
  } else if (isClarityAbiResponse(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeResponse, type: val };
  } else if (isClarityAbiOptional(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeOptional, type: val };
  } else if (isClarityAbiTuple(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeTuple, type: val };
  } else if (isClarityAbiList(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeList, type: val };
  } else if (isClarityAbiStringAscii(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeStringAscii, type: val };
  } else if (isClarityAbiStringUtf8(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeStringUtf8, type: val };
  } else {
    throw new Error(`Unexpected Clarity ABI type: ${JSON.stringify(val)}`);
  }
}
function encodeAbiClarityValue(value, type) {
  const union = type.id ? type : getTypeUnion(type);
  switch (union.id) {
    case ClarityAbiTypeId.ClarityAbiTypeUInt128:
      return uintCV(value);
    case ClarityAbiTypeId.ClarityAbiTypeInt128:
      return intCV(value);
    case ClarityAbiTypeId.ClarityAbiTypeBool:
      if (value === "false" || value === "0")
        return falseCV();
      else if (value === "true" || value === "1")
        return trueCV();
      else
        throw new Error(`Unexpected Clarity bool value: ${JSON.stringify(value)}`);
    case ClarityAbiTypeId.ClarityAbiTypePrincipal:
      if (value.includes(".")) {
        const [addr2, name2] = value.split(".");
        return contractPrincipalCV(addr2, name2);
      } else {
        return standardPrincipalCV(value);
      }
    case ClarityAbiTypeId.ClarityAbiTypeTraitReference:
      const [addr, name] = value.split(".");
      return contractPrincipalCV(addr, name);
    case ClarityAbiTypeId.ClarityAbiTypeNone:
      return noneCV();
    case ClarityAbiTypeId.ClarityAbiTypeBuffer:
      return bufferCV(hexToBytes(value));
    case ClarityAbiTypeId.ClarityAbiTypeStringAscii:
      return stringAsciiCV(value);
    case ClarityAbiTypeId.ClarityAbiTypeStringUtf8:
      return stringUtf8CV(value);
    case ClarityAbiTypeId.ClarityAbiTypeOptional:
      return someCV(encodeAbiClarityValue(value, union.type.optional));
    case ClarityAbiTypeId.ClarityAbiTypeResponse:
    case ClarityAbiTypeId.ClarityAbiTypeTuple:
    case ClarityAbiTypeId.ClarityAbiTypeList:
      throw new NotImplementedError(`Unsupported encoding for Clarity type: ${union.id}`);
    default:
      throw new Error(`Unexpected Clarity type ID: ${JSON.stringify(union)}`);
  }
}
function encodeClarityValue(type, value) {
  const union = type.id ? type : getTypeUnion(type);
  if (union.id === ClarityAbiTypeId.ClarityAbiTypeBuffer) {
    return bufferCV(utf8ToBytes(value));
  }
  return encodeAbiClarityValue(value, union);
}
function getTypeString(val) {
  if (isClarityAbiPrimitive(val)) {
    if (val === "int128") {
      return "int";
    } else if (val === "uint128") {
      return "uint";
    }
    return val;
  } else if (isClarityAbiBuffer(val)) {
    return `(buff ${val.buffer.length})`;
  } else if (isClarityAbiStringAscii(val)) {
    return `(string-ascii ${val["string-ascii"].length})`;
  } else if (isClarityAbiStringUtf8(val)) {
    return `(string-utf8 ${val["string-utf8"].length})`;
  } else if (isClarityAbiResponse(val)) {
    return `(response ${getTypeString(val.response.ok)} ${getTypeString(val.response.error)})`;
  } else if (isClarityAbiOptional(val)) {
    return `(optional ${getTypeString(val.optional)})`;
  } else if (isClarityAbiTuple(val)) {
    return `(tuple ${val.tuple.map((t) => `(${t.name} ${getTypeString(t.type)})`).join(" ")})`;
  } else if (isClarityAbiList(val)) {
    return `(list ${val.list.length} ${getTypeString(val.list.type)})`;
  } else {
    throw new Error(`Type string unsupported for Clarity type: ${JSON.stringify(val)}`);
  }
}
function abiFunctionToString(func) {
  const access = func.access === "read_only" ? "read-only" : func.access;
  return `(define-${access} (${func.name} ${func.args.map((arg) => `(${arg.name} ${getTypeString(arg.type)})`).join(" ")}))`;
}
function matchType(cv, abiType) {
  const union = getTypeUnion(abiType);
  switch (cv.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeBool;
    case ClarityType.Int:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeInt128;
    case ClarityType.UInt:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeUInt128;
    case ClarityType.Buffer:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeBuffer && union.type.buffer.length >= Math.ceil(cv.value.length / 2);
    case ClarityType.StringASCII:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeStringAscii && union.type["string-ascii"].length >= cv.value.length;
    case ClarityType.StringUTF8:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeStringUtf8 && union.type["string-utf8"].length >= cv.value.length;
    case ClarityType.OptionalNone:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeNone || union.id === ClarityAbiTypeId.ClarityAbiTypeOptional;
    case ClarityType.OptionalSome:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeOptional && matchType(cv.value, union.type.optional);
    case ClarityType.ResponseErr:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeResponse && matchType(cv.value, union.type.response.error);
    case ClarityType.ResponseOk:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeResponse && matchType(cv.value, union.type.response.ok);
    case ClarityType.PrincipalContract:
      return union.id === ClarityAbiTypeId.ClarityAbiTypePrincipal || union.id === ClarityAbiTypeId.ClarityAbiTypeTraitReference;
    case ClarityType.PrincipalStandard:
      return union.id === ClarityAbiTypeId.ClarityAbiTypePrincipal;
    case ClarityType.List:
      return union.id == ClarityAbiTypeId.ClarityAbiTypeList && union.type.list.length >= cv.value.length && cv.value.every((val) => matchType(val, union.type.list.type));
    case ClarityType.Tuple:
      if (union.id == ClarityAbiTypeId.ClarityAbiTypeTuple) {
        const tuple2 = cloneDeep(cv.value);
        for (let i = 0; i < union.type.tuple.length; i++) {
          const abiTupleEntry = union.type.tuple[i];
          const key = abiTupleEntry.name;
          const val = tuple2[key];
          if (val) {
            if (!matchType(val, abiTupleEntry.type)) {
              return false;
            }
            delete tuple2[key];
          } else {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    default:
      return false;
  }
}
function validateContractCall(payload, abi) {
  const filtered = abi.functions.filter((fn) => fn.name === payload.functionName.content);
  if (filtered.length === 1) {
    const abiFunc = filtered[0];
    const abiArgs = abiFunc.args;
    if (payload.functionArgs.length !== abiArgs.length) {
      throw new Error(`Clarity function expects ${abiArgs.length} argument(s) but received ${payload.functionArgs.length}`);
    }
    for (let i = 0; i < payload.functionArgs.length; i++) {
      const payloadArg = payload.functionArgs[i];
      const abiArg = abiArgs[i];
      if (!matchType(payloadArg, abiArg.type)) {
        const argNum = i + 1;
        throw new Error(`Clarity function \`${payload.functionName.content}\` expects argument ${argNum} to be of type ${getTypeString(abiArg.type)}, not ${getCVTypeString(payloadArg)}`);
      }
    }
    return true;
  } else if (filtered.length === 0) {
    throw new Error(`ABI doesn't contain a function with the name ${payload.functionName.content}`);
  } else {
    throw new Error(`Malformed ABI. Contains multiple functions with the name ${payload.functionName.content}`);
  }
}
function parseToCV(input, type) {
  const typeString = getTypeString(type);
  if (isClarityAbiPrimitive(type)) {
    if (type === "uint128") {
      return uintCV(input);
    } else if (type === "int128") {
      return intCV(input);
    } else if (type === "bool") {
      if (input.toLowerCase() === "true") {
        return trueCV();
      } else if (input.toLowerCase() === "false") {
        return falseCV();
      } else {
        throw new Error(`Invalid bool value: ${input}`);
      }
    } else if (type === "principal") {
      if (input.includes(".")) {
        const [address2, contractName] = input.split(".");
        return contractPrincipalCV(address2, contractName);
      } else {
        return standardPrincipalCV(input);
      }
    } else {
      throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
    }
  } else if (isClarityAbiBuffer(type)) {
    const inputLength = utf8ToBytes(input).byteLength;
    if (inputLength > type.buffer.length) {
      throw new Error(`Input exceeds specified buffer length limit of ${type.buffer.length}`);
    }
    return bufferCVFromString(input);
  } else if (isClarityAbiResponse(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiOptional(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiTuple(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiList(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  }
}

// node_modules/@stacks/transactions/dist/esm/transaction.js
var StacksTransactionWire = class {
  constructor({ auth, payload, postConditions = createLPList([]), postConditionMode = PostConditionMode.Deny, transactionVersion, chainId, network = "mainnet" }) {
    network = networkFrom(network);
    this.transactionVersion = transactionVersion ?? network.transactionVersion;
    this.chainId = chainId ?? network.chainId;
    this.auth = auth;
    if ("amount" in payload) {
      this.payload = {
        ...payload,
        amount: intToBigInt(payload.amount)
      };
    } else {
      this.payload = payload;
    }
    this.postConditionMode = postConditionMode;
    this.postConditions = postConditions;
    this.anchorMode = AnchorMode.Any;
  }
  signBegin() {
    const tx = cloneDeep(this);
    tx.auth = intoInitialSighashAuth(tx.auth);
    return tx.txid();
  }
  verifyBegin() {
    const tx = cloneDeep(this);
    tx.auth = intoInitialSighashAuth(tx.auth);
    return tx.txid();
  }
  verifyOrigin() {
    return verifyOrigin(this.auth, this.verifyBegin());
  }
  signNextOrigin(sigHash, privateKey) {
    if (this.auth.spendingCondition === void 0) {
      throw new Error('"auth.spendingCondition" is undefined');
    }
    if (this.auth.authType === void 0) {
      throw new Error('"auth.authType" is undefined');
    }
    return this.signAndAppend(this.auth.spendingCondition, sigHash, AuthType.Standard, privateKey);
  }
  signNextSponsor(sigHash, privateKey) {
    if (this.auth.authType === AuthType.Sponsored) {
      return this.signAndAppend(this.auth.sponsorSpendingCondition, sigHash, AuthType.Sponsored, privateKey);
    } else {
      throw new Error('"auth.sponsorSpendingCondition" is undefined');
    }
  }
  appendPubkey(publicKey) {
    const wire = typeof publicKey === "object" && "type" in publicKey ? publicKey : createStacksPublicKey(publicKey);
    const cond = this.auth.spendingCondition;
    if (cond && !isSingleSig(cond)) {
      const compressed = publicKeyIsCompressed(wire.data);
      cond.fields.push(createTransactionAuthField(compressed ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed, wire));
    } else {
      throw new Error(`Can't append public key to a singlesig condition`);
    }
  }
  signAndAppend(condition, curSigHash, authType, privateKey) {
    const { nextSig, nextSigHash } = nextSignature(curSigHash, authType, condition.fee, condition.nonce, privateKey);
    if (isSingleSig(condition)) {
      condition.signature = createMessageSignature(nextSig);
    } else {
      const compressed = privateKeyIsCompressed(privateKey);
      condition.fields.push(createTransactionAuthField(compressed ? PubKeyEncoding.Compressed : PubKeyEncoding.Uncompressed, createMessageSignature(nextSig)));
    }
    return nextSigHash;
  }
  txid() {
    const serialized = this.serializeBytes();
    return txidFromData(serialized);
  }
  setSponsor(sponsorSpendingCondition) {
    if (this.auth.authType != AuthType.Sponsored) {
      throw new SigningError("Cannot sponsor sign a non-sponsored transaction");
    }
    this.auth = setSponsor(this.auth, sponsorSpendingCondition);
  }
  setFee(amount) {
    this.auth = setFee(this.auth, amount);
  }
  setNonce(nonce) {
    this.auth = setNonce(this.auth, nonce);
  }
  setSponsorNonce(nonce) {
    if (this.auth.authType != AuthType.Sponsored) {
      throw new SigningError("Cannot sponsor sign a non-sponsored transaction");
    }
    this.auth = setSponsorNonce(this.auth, nonce);
  }
  serialize() {
    return bytesToHex(this.serializeBytes());
  }
  serializeBytes() {
    if (this.transactionVersion === void 0) {
      throw new SerializationError('"transactionVersion" is undefined');
    }
    if (this.chainId === void 0) {
      throw new SerializationError('"chainId" is undefined');
    }
    if (this.auth === void 0) {
      throw new SerializationError('"auth" is undefined');
    }
    if (this.payload === void 0) {
      throw new SerializationError('"payload" is undefined');
    }
    const bytesArray = [];
    bytesArray.push(this.transactionVersion);
    const chainIdBytes = new Uint8Array(4);
    writeUInt32BE(chainIdBytes, this.chainId, 0);
    bytesArray.push(chainIdBytes);
    bytesArray.push(serializeAuthorizationBytes(this.auth));
    bytesArray.push(this.anchorMode);
    bytesArray.push(this.postConditionMode);
    bytesArray.push(serializeLPListBytes(this.postConditions));
    bytesArray.push(serializePayloadBytes(this.payload));
    return concatArray(bytesArray);
  }
};
function deserializeTransaction(tx) {
  const bytesReader = isInstance(tx, BytesReader) ? tx : new BytesReader(tx);
  const transactionVersion = bytesReader.readUInt8Enum(TransactionVersion, (n) => {
    throw new Error(`Could not parse ${n} as TransactionVersion`);
  });
  const chainId = bytesReader.readUInt32BE();
  const auth = deserializeAuthorization(bytesReader);
  const anchorMode = bytesReader.readUInt8Enum(AnchorMode, (n) => {
    throw new Error(`Could not parse ${n} as AnchorMode`);
  });
  const postConditionMode = bytesReader.readUInt8Enum(PostConditionMode, (n) => {
    throw new Error(`Could not parse ${n} as PostConditionMode`);
  });
  const postConditions = deserializeLPList(bytesReader, StacksWireType.PostCondition);
  const payload = deserializePayload(bytesReader);
  const transaction = new StacksTransactionWire({
    transactionVersion,
    chainId,
    auth,
    payload,
    postConditions,
    postConditionMode
  });
  transaction.anchorMode = anchorMode;
  return transaction;
}
function deriveNetworkFromTx(transaction) {
  return whenTransactionVersion(transaction.transactionVersion)({
    [TransactionVersion.Mainnet]: STACKS_MAINNET,
    [TransactionVersion.Testnet]: STACKS_TESTNET
  });
}
function estimateTransactionByteLength(transaction) {
  const hashMode = transaction.auth.spendingCondition.hashMode;
  const multiSigHashModes = [AddressHashMode.P2SH, AddressHashMode.P2WSH];
  if (multiSigHashModes.includes(hashMode)) {
    const multiSigSpendingCondition = transaction.auth.spendingCondition;
    const existingSignatures = multiSigSpendingCondition.fields.filter((field) => field.contents.type === StacksWireType.MessageSignature).length;
    const totalSignatureLength = (multiSigSpendingCondition.signaturesRequired - existingSignatures) * (RECOVERABLE_ECDSA_SIG_LENGTH_BYTES + 1);
    return transaction.serializeBytes().byteLength + totalSignatureLength;
  } else {
    return transaction.serializeBytes().byteLength;
  }
}
function serializeTransaction(transaction) {
  return transaction.serialize();
}
function serializeTransactionBytes(transaction) {
  return transaction.serializeBytes();
}
function transactionToHex(transaction) {
  return transaction.serialize();
}

// node_modules/@stacks/transactions/dist/esm/fetch.js
var BROADCAST_PATH = "/v2/transactions";
var TRANSFER_FEE_ESTIMATE_PATH = "/v2/fees/transfer";
var TRANSACTION_FEE_ESTIMATE_PATH = "/v2/fees/transaction";
var ACCOUNT_PATH = "/v2/accounts";
var CONTRACT_ABI_PATH = "/v2/contracts/interface";
var READONLY_FUNCTION_CALL_PATH = "/v2/contracts/call-read";
var MAP_ENTRY_PATH = "/v2/map_entry";
async function broadcastTransaction({ transaction: txOpt, attachment: attachOpt, network: _network, client: _client }) {
  const tx = txOpt.serialize();
  const attachment = attachOpt ? typeof attachOpt === "string" ? attachOpt : bytesToHex(attachOpt) : void 0;
  const json = attachOpt ? { tx, attachment } : { tx };
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  };
  const network = _network ?? deriveNetworkFromTx(txOpt);
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${BROADCAST_PATH}`;
  const response = await client.fetch(url, options);
  if (!response.ok) {
    try {
      return await response.json();
    } catch (e) {
      throw Error("Failed to broadcast transaction (unable to parse node response).", { cause: e });
    }
  }
  const text = await response.text();
  const txid = text.replace(/["]+/g, "");
  if (!validateHash256(txid))
    throw new Error(text);
  return { txid };
}
async function _getNonceApi({ address: address2, network = "mainnet", client: _client }) {
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}/extended/v1/address/${address2}/nonces`;
  const response = await client.fetch(url);
  const result = await response.json();
  return BigInt(result.possible_next_nonce);
}
async function fetchNonce(opts) {
  try {
    return await _getNonceApi(opts);
  } catch (e) {
  }
  const network = networkFrom(opts.network ?? "mainnet");
  const client = Object.assign({}, clientFromNetwork(network), opts.client);
  const url = `${client.baseUrl}${ACCOUNT_PATH}/${opts.address}?proof=0`;
  const response = await client.fetch(url);
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Error fetching nonce. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`);
  }
  const json = await response.json();
  return BigInt(json.nonce);
}
async function fetchFeeEstimateTransfer({ transaction: txOpt, network: _network, client: _client }) {
  const network = typeof txOpt === "number" ? "mainnet" : _network ?? deriveNetworkFromTx(txOpt);
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${TRANSFER_FEE_ESTIMATE_PATH}`;
  const response = await client.fetch(url, {
    headers: { Accept: "application/text" }
  });
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Error estimating transfer fee. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`);
  }
  const feeRateResult = await response.text();
  const txBytes = typeof txOpt === "number" ? BigInt(txOpt) : BigInt(Math.ceil(txOpt.serializeBytes().byteLength));
  const feeRate = BigInt(feeRateResult);
  return feeRate * txBytes;
}
async function fetchFeeEstimateTransaction({ payload, estimatedLength, network = "mainnet", client: _client }) {
  const json = {
    transaction_payload: payload,
    estimated_len: estimatedLength
  };
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  };
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${TRANSACTION_FEE_ESTIMATE_PATH}`;
  const response = await client.fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (body.includes("NoEstimateAvailable")) {
      let json2 = {};
      try {
        json2 = JSON.parse(body);
      } catch (err) {
      }
      throw new NoEstimateAvailableError(json2?.reason_data?.message ?? "");
    }
    throw new Error(`Error estimating transaction fee. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${body}"`);
  }
  const data = await response.json();
  return data.estimations;
}
async function fetchFeeEstimate({ transaction: txOpt, network: _network, client: _client }) {
  const network = _network ?? deriveNetworkFromTx(txOpt);
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  try {
    const estimatedLength = estimateTransactionByteLength(txOpt);
    return (await fetchFeeEstimateTransaction({
      payload: bytesToHex(serializePayloadBytes(txOpt.payload)),
      estimatedLength,
      network,
      client
    }))[1].fee;
  } catch (error2) {
    if (!(error2 instanceof NoEstimateAvailableError))
      throw error2;
    return await fetchFeeEstimateTransfer({ transaction: txOpt, network });
  }
}
async function fetchAbi({ contractAddress: address2, contractName: name, network = "mainnet", client: _client }) {
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${CONTRACT_ABI_PATH}/${address2}/${name}`;
  const response = await client.fetch(url);
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Error fetching contract ABI for contract "${name}" at address ${address2}. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`);
  }
  return JSON.parse(await response.text());
}
async function fetchCallReadOnlyFunction({ contractName, contractAddress, functionName, functionArgs, senderAddress, network = "mainnet", client: _client }) {
  const json = {
    sender: senderAddress,
    arguments: functionArgs.map((arg) => cvToHex(arg))
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(json)
  };
  const name = encodeURIComponent(functionName);
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${READONLY_FUNCTION_CALL_PATH}/${contractAddress}/${contractName}/${name}`;
  const response = await client.fetch(url, options);
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Error calling read-only function. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`);
  }
  return await response.json().then(parseReadOnlyResponse);
}
async function fetchContractMapEntry({ contractAddress, contractName, mapName, mapKey, network = "mainnet", client: _client }) {
  const keyHex = with0x(serializeCV(mapKey));
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(keyHex)
  };
  const client = Object.assign({}, clientFromNetwork(networkFrom(network)), _client);
  const url = `${client.baseUrl}${MAP_ENTRY_PATH}/${contractAddress}/${contractName}/${mapName}?proof=0`;
  const response = await client.fetch(url, options);
  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(`Error fetching map entry for map "${mapName}" in contract "${contractName}" at address ${contractAddress}, using map key "${keyHex}". Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`);
  }
  const json = await response.json();
  if (!json.data) {
    throw new Error(`Error fetching map entry for map "${mapName}" in contract "${contractName}" at address ${contractAddress}, using map key "${keyHex}". Response ${response.status}: ${response.statusText}. Attempted to fetch ${client.baseUrl} and failed with the response: "${JSON.stringify(json)}"`);
  }
  try {
    return deserializeCV(json.data);
  } catch (error2) {
    throw new Error(`Error deserializing Clarity value "${json.data}": ${error2}`);
  }
}

// node_modules/@stacks/transactions/dist/esm/postcondition.js
var MAX_U64 = BigInt("18446744073709551615");
function parsePostConditionAmount(amount) {
  const value = intToBigInt(amount);
  if (value < 0n || value > MAX_U64) {
    throw new RangeError(`Post-condition amount must be between 0 and ${MAX_U64} (u64 max), received: ${value}`);
  }
  return value;
}
var PostConditionCodeWireType;
(function(PostConditionCodeWireType2) {
  PostConditionCodeWireType2[PostConditionCodeWireType2["eq"] = 1] = "eq";
  PostConditionCodeWireType2[PostConditionCodeWireType2["gt"] = 2] = "gt";
  PostConditionCodeWireType2[PostConditionCodeWireType2["lt"] = 4] = "lt";
  PostConditionCodeWireType2[PostConditionCodeWireType2["gte"] = 3] = "gte";
  PostConditionCodeWireType2[PostConditionCodeWireType2["lte"] = 5] = "lte";
  PostConditionCodeWireType2[PostConditionCodeWireType2["sent"] = 16] = "sent";
  PostConditionCodeWireType2[PostConditionCodeWireType2["not-sent"] = 17] = "not-sent";
  PostConditionCodeWireType2[PostConditionCodeWireType2["maybe-sent"] = 18] = "maybe-sent";
})(PostConditionCodeWireType || (PostConditionCodeWireType = {}));
var PoxConditionCodeWireType;
(function(PoxConditionCodeWireType2) {
  PoxConditionCodeWireType2[PoxConditionCodeWireType2["will-not-perform"] = 48] = "will-not-perform";
  PoxConditionCodeWireType2[PoxConditionCodeWireType2["may-perform"] = 49] = "may-perform";
  PoxConditionCodeWireType2[PoxConditionCodeWireType2["will-perform"] = 50] = "will-perform";
})(PoxConditionCodeWireType || (PoxConditionCodeWireType = {}));
function postConditionToWire(postcondition) {
  switch (postcondition.type) {
    case "stx-postcondition":
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.STX,
        principal: postcondition.address === "origin" ? { type: StacksWireType.Principal, prefix: PostConditionPrincipalId.Origin } : parsePrincipalString(postcondition.address),
        conditionCode: conditionTypeToByte(postcondition.condition),
        amount: parsePostConditionAmount(postcondition.amount)
      };
    case "ft-postcondition":
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.Fungible,
        principal: postcondition.address === "origin" ? { type: StacksWireType.Principal, prefix: PostConditionPrincipalId.Origin } : parsePrincipalString(postcondition.address),
        conditionCode: conditionTypeToByte(postcondition.condition),
        amount: parsePostConditionAmount(postcondition.amount),
        asset: parseAssetString(postcondition.asset)
      };
    case "nft-postcondition":
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.NonFungible,
        principal: postcondition.address === "origin" ? { type: StacksWireType.Principal, prefix: PostConditionPrincipalId.Origin } : parsePrincipalString(postcondition.address),
        conditionCode: conditionTypeToByte(postcondition.condition),
        asset: parseAssetString(postcondition.asset),
        assetName: postcondition.assetId
      };
    case "staking-postcondition":
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.Staking,
        principal: postcondition.address === "origin" ? { type: StacksWireType.Principal, prefix: PostConditionPrincipalId.Origin } : parsePrincipalString(postcondition.address),
        conditionCode: conditionTypeToByte(postcondition.condition),
        amount: parsePostConditionAmount(postcondition.amount)
      };
    case "pox-postcondition":
      return {
        type: StacksWireType.PostCondition,
        conditionType: PostConditionType.PoX,
        principal: postcondition.address === "origin" ? { type: StacksWireType.Principal, prefix: PostConditionPrincipalId.Origin } : parsePrincipalString(postcondition.address),
        conditionCode: poxConditionTypeToByte(postcondition.condition)
      };
    default:
      throw new Error("Invalid post condition type");
  }
}
function wireToPostCondition(wire) {
  switch (wire.conditionType) {
    case PostConditionType.STX:
      return {
        type: "stx-postcondition",
        address: principalWireToString(wire.principal),
        condition: conditionByteToType(wire.conditionCode),
        amount: wire.amount.toString()
      };
    case PostConditionType.Fungible:
      return {
        type: "ft-postcondition",
        address: principalWireToString(wire.principal),
        condition: conditionByteToType(wire.conditionCode),
        amount: wire.amount.toString(),
        asset: assetWireToString(wire.asset)
      };
    case PostConditionType.NonFungible:
      return {
        type: "nft-postcondition",
        address: principalWireToString(wire.principal),
        condition: conditionByteToType(wire.conditionCode),
        asset: assetWireToString(wire.asset),
        assetId: wire.assetName
      };
    case PostConditionType.Staking:
      return {
        type: "staking-postcondition",
        address: principalWireToString(wire.principal),
        condition: conditionByteToType(wire.conditionCode),
        amount: wire.amount.toString()
      };
    case PostConditionType.PoX:
      return {
        type: "pox-postcondition",
        address: principalWireToString(wire.principal),
        condition: poxConditionByteToType(wire.conditionCode)
      };
    default: {
      const _exhaustiveCheck = wire;
      throw new Error(`Invalid post condition type: ${_exhaustiveCheck}`);
    }
  }
}
function conditionTypeToByte(condition) {
  return PostConditionCodeWireType[condition];
}
function conditionByteToType(wireType) {
  return PostConditionCodeWireType[wireType];
}
function poxConditionTypeToByte(condition) {
  return PoxConditionCodeWireType[condition];
}
function poxConditionByteToType(wireType) {
  return PoxConditionCodeWireType[wireType];
}
function postConditionToHex(postcondition) {
  const wire = postConditionToWire(postcondition);
  return serializePostConditionWire(wire);
}
function postConditionModeFrom(mode) {
  if (typeof mode === "number")
    return mode;
  if (mode === "allow")
    return PostConditionMode.Allow;
  if (mode === "deny")
    return PostConditionMode.Deny;
  if (mode === "originator")
    return PostConditionMode.Originator;
  throw new Error(`Invalid post condition mode: ${mode}`);
}
function assetWireToString(asset) {
  const address2 = addressToString(asset.address);
  const contractId = `${address2}.${asset.contractName.content}`;
  return `${contractId}::${asset.assetName.content}`;
}
function principalWireToString(principal3) {
  switch (principal3.prefix) {
    case PostConditionPrincipalId.Origin:
      return "origin";
    case PostConditionPrincipalId.Standard:
      return addressToString(principal3.address);
    case PostConditionPrincipalId.Contract:
      const address2 = addressToString(principal3.address);
      return `${address2}.${principal3.contractName.content}`;
    default:
      const _exhaustiveCheck = principal3;
      throw new Error(`Invalid principal type: ${_exhaustiveCheck}`);
  }
}

// node_modules/@stacks/transactions/dist/esm/signer.js
var TransactionSigner = class {
  constructor(transaction) {
    this.transaction = transaction;
    this.sigHash = transaction.signBegin();
    this.originDone = false;
    this.checkOversign = true;
    this.checkOverlap = true;
    const spendingCondition = transaction.auth.spendingCondition;
    if (spendingCondition && !isSingleSig(spendingCondition)) {
      if (spendingCondition.fields.filter((field) => field.contents.type === StacksWireType.MessageSignature).length >= spendingCondition.signaturesRequired) {
        throw new Error("SpendingCondition has more signatures than are expected");
      }
      spendingCondition.fields.forEach((field) => {
        if (field.contents.type !== StacksWireType.MessageSignature)
          return;
        const signature = field.contents;
        const nextVerify = nextVerification(this.sigHash, transaction.auth.authType, spendingCondition.fee, spendingCondition.nonce, PubKeyEncoding.Compressed, signature.data);
        if (!isNonSequentialMultiSig(spendingCondition.hashMode)) {
          this.sigHash = nextVerify.nextSigHash;
        }
      });
    }
  }
  static createSponsorSigner(transaction, spendingCondition) {
    if (transaction.auth.authType != AuthType.Sponsored) {
      throw new SigningError("Cannot add sponsor to non-sponsored transaction");
    }
    const tx = cloneDeep(transaction);
    tx.setSponsor(spendingCondition);
    const originSigHash = tx.verifyOrigin();
    const signer = new this(tx);
    signer.originDone = true;
    signer.sigHash = originSigHash;
    signer.checkOversign = true;
    signer.checkOverlap = true;
    return signer;
  }
  signOrigin(privateKey) {
    if (this.checkOverlap && this.originDone) {
      throw new SigningError("Cannot sign origin after sponsor key");
    }
    if (this.transaction.auth === void 0) {
      throw new SigningError('"transaction.auth" is undefined');
    }
    if (this.transaction.auth.spendingCondition === void 0) {
      throw new SigningError('"transaction.auth.spendingCondition" is undefined');
    }
    const spendingCondition = this.transaction.auth.spendingCondition;
    if (spendingCondition.hashMode === AddressHashMode.P2SH || spendingCondition.hashMode === AddressHashMode.P2WSH) {
      if (this.checkOversign && spendingCondition.fields.filter((field) => field.contents.type === StacksWireType.MessageSignature).length >= spendingCondition.signaturesRequired) {
        throw new Error("Origin would have too many signatures");
      }
    }
    const nextSighash = this.transaction.signNextOrigin(this.sigHash, privateKey);
    if (isSingleSig(this.transaction.auth.spendingCondition) || isSequentialMultiSig(this.transaction.auth.spendingCondition.hashMode)) {
      this.sigHash = nextSighash;
    }
  }
  appendOrigin(publicKey) {
    const wire = typeof publicKey === "object" && "type" in publicKey ? publicKey : createStacksPublicKey(publicKey);
    if (this.checkOverlap && this.originDone) {
      throw Error("Cannot append public key to origin after sponsor key");
    }
    if (this.transaction.auth === void 0) {
      throw new Error('"transaction.auth" is undefined');
    }
    if (this.transaction.auth.spendingCondition === void 0) {
      throw new Error('"transaction.auth.spendingCondition" is undefined');
    }
    this.transaction.appendPubkey(wire);
  }
  signSponsor(privateKey) {
    if (this.transaction.auth === void 0) {
      throw new SigningError('"transaction.auth" is undefined');
    }
    if (this.transaction.auth.authType !== AuthType.Sponsored) {
      throw new SigningError('"transaction.auth.authType" is not AuthType.Sponsored');
    }
    const nextSighash = this.transaction.signNextSponsor(this.sigHash, privateKey);
    this.sigHash = nextSighash;
    this.originDone = true;
  }
  getTxInComplete() {
    return cloneDeep(this.transaction);
  }
  resume(transaction) {
    this.transaction = cloneDeep(transaction);
    this.sigHash = transaction.signBegin();
  }
};

// node_modules/@stacks/transactions/dist/esm/builders.js
async function makeUnsignedSTXTokenTransfer(txOptions) {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: STACKS_MAINNET,
    memo: "",
    sponsored: false
  };
  const options = Object.assign(defaultOptions, txOptions);
  options.network = networkFrom(options.network);
  options.client = Object.assign({}, clientFromNetwork(options.network), txOptions.client);
  const payload = createTokenTransferPayload(options.recipient, options.amount, options.memo);
  let spendingCondition = null;
  if ("publicKey" in options) {
    spendingCondition = createSingleSigSpendingCondition(AddressHashMode.P2PKH, options.publicKey, options.nonce, options.fee);
  } else {
    const hashMode = options.useNonSequentialMultiSig ? AddressHashMode.P2SHNonSequential : AddressHashMode.P2SH;
    const publicKeys = options.address ? sortPublicKeysForAddress(options.publicKeys.map(publicKeyToHex), options.numSignatures, hashMode, createAddress(options.address).hash160) : options.publicKeys.map(publicKeyToHex);
    spendingCondition = createMultiSigSpendingCondition(hashMode, options.numSignatures, publicKeys, options.nonce, options.fee);
  }
  const authorization = options.sponsored ? createSponsoredAuth(spendingCondition) : createStandardAuth(spendingCondition);
  const transaction = new StacksTransactionWire({
    transactionVersion: options.network.transactionVersion,
    chainId: options.network.chainId,
    auth: authorization,
    payload
  });
  if (txOptions.fee == null) {
    const fee = await fetchFeeEstimate({ transaction, ...options });
    transaction.setFee(fee);
  }
  if (txOptions.nonce == null) {
    const addressVersion = options.network.addressVersion.singleSig;
    const address2 = (0, import_c32check5.c32address)(addressVersion, transaction.auth.spendingCondition.signer);
    const txNonce = await fetchNonce({ address: address2, ...options });
    transaction.setNonce(txNonce);
  }
  return transaction;
}
async function makeSTXTokenTransfer(txOptions) {
  if ("senderKey" in txOptions) {
    const publicKey = privateKeyToPublic(txOptions.senderKey);
    const options = omit(txOptions, "senderKey");
    const transaction = await makeUnsignedSTXTokenTransfer({ publicKey, ...options });
    const privKey = txOptions.senderKey;
    const signer = new TransactionSigner(transaction);
    signer.signOrigin(privKey);
    return transaction;
  } else {
    const options = omit(txOptions, "signerKeys");
    const transaction = await makeUnsignedSTXTokenTransfer(options);
    mutatingSignAppendMultiSig(transaction, txOptions.publicKeys.map(publicKeyToHex).slice(), txOptions.signerKeys.map(privateKeyToHex), txOptions.address);
    return transaction;
  }
}
async function makeContractDeploy(txOptions) {
  if ("senderKey" in txOptions) {
    const publicKey = privateKeyToPublic(txOptions.senderKey);
    const options = omit(txOptions, "senderKey");
    const transaction = await makeUnsignedContractDeploy({ publicKey, ...options });
    const privKey = txOptions.senderKey;
    const signer = new TransactionSigner(transaction);
    signer.signOrigin(privKey);
    return transaction;
  } else {
    const options = omit(txOptions, "signerKeys");
    const transaction = await makeUnsignedContractDeploy(options);
    mutatingSignAppendMultiSig(transaction, txOptions.publicKeys.map(publicKeyToHex).slice(), txOptions.signerKeys.map(privateKeyToHex), txOptions.address);
    return transaction;
  }
}
async function makeUnsignedContractDeploy(txOptions) {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: STACKS_MAINNET,
    postConditionMode: PostConditionMode.Deny,
    sponsored: false,
    clarityVersion: ClarityVersion.Clarity4
  };
  const options = Object.assign(defaultOptions, txOptions);
  options.network = networkFrom(options.network);
  options.client = Object.assign({}, clientFromNetwork(options.network), txOptions.client);
  options.postConditionMode = postConditionModeFrom(options.postConditionMode);
  const payload = createSmartContractPayload(options.contractName, options.codeBody, options.clarityVersion);
  let spendingCondition = null;
  if ("publicKey" in options) {
    spendingCondition = createSingleSigSpendingCondition(AddressHashMode.P2PKH, options.publicKey, options.nonce, options.fee);
  } else {
    const hashMode = options.useNonSequentialMultiSig ? AddressHashMode.P2SHNonSequential : AddressHashMode.P2SH;
    const publicKeys = options.address ? sortPublicKeysForAddress(options.publicKeys.map(publicKeyToHex), options.numSignatures, hashMode, createAddress(options.address).hash160) : options.publicKeys.map(publicKeyToHex);
    spendingCondition = createMultiSigSpendingCondition(hashMode, options.numSignatures, publicKeys, options.nonce, options.fee);
  }
  const authorization = options.sponsored ? createSponsoredAuth(spendingCondition) : createStandardAuth(spendingCondition);
  const postConditions = (options.postConditions ?? []).map((pc) => {
    if (typeof pc === "string")
      return deserializePostConditionWire(pc);
    if (typeof pc.type === "string")
      return postConditionToWire(pc);
    return pc;
  });
  const lpPostConditions = createLPList(postConditions);
  const transaction = new StacksTransactionWire({
    transactionVersion: options.network.transactionVersion,
    chainId: options.network.chainId,
    auth: authorization,
    payload,
    postConditions: lpPostConditions,
    postConditionMode: options.postConditionMode
  });
  if (txOptions.fee === void 0 || txOptions.fee === null) {
    const fee = await fetchFeeEstimate({ transaction, ...options });
    transaction.setFee(fee);
  }
  if (txOptions.nonce === void 0 || txOptions.nonce === null) {
    const addressVersion = options.network.addressVersion.singleSig;
    const address2 = (0, import_c32check5.c32address)(addressVersion, transaction.auth.spendingCondition.signer);
    const txNonce = await fetchNonce({ address: address2, ...options });
    transaction.setNonce(txNonce);
  }
  return transaction;
}
async function makeUnsignedContractCall(txOptions) {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: STACKS_MAINNET,
    postConditionMode: PostConditionMode.Deny,
    sponsored: false
  };
  const options = Object.assign(defaultOptions, txOptions);
  options.network = networkFrom(options.network);
  options.client = Object.assign({}, clientFromNetwork(options.network), options.client);
  options.postConditionMode = postConditionModeFrom(options.postConditionMode);
  const payload = createContractCallPayload(options.contractAddress, options.contractName, options.functionName, options.functionArgs);
  if (options?.validateWithAbi) {
    let abi;
    if (typeof options.validateWithAbi === "boolean") {
      if (options?.network) {
        abi = await fetchAbi({ ...options });
      } else {
        throw new Error("Network option must be provided in order to validate with ABI");
      }
    } else {
      abi = options.validateWithAbi;
    }
    validateContractCall(payload, abi);
  }
  let spendingCondition = null;
  if ("publicKey" in options) {
    spendingCondition = createSingleSigSpendingCondition(AddressHashMode.P2PKH, options.publicKey, options.nonce, options.fee);
  } else {
    const hashMode = options.useNonSequentialMultiSig ? AddressHashMode.P2SHNonSequential : AddressHashMode.P2SH;
    const publicKeys = options.address ? sortPublicKeysForAddress(options.publicKeys.map(publicKeyToHex), options.numSignatures, hashMode, createAddress(options.address).hash160) : options.publicKeys.map(publicKeyToHex);
    spendingCondition = createMultiSigSpendingCondition(hashMode, options.numSignatures, publicKeys, options.nonce, options.fee);
  }
  const authorization = options.sponsored ? createSponsoredAuth(spendingCondition) : createStandardAuth(spendingCondition);
  const postConditions = (options.postConditions ?? []).map((pc) => {
    if (typeof pc === "string")
      return deserializePostConditionWire(pc);
    if (typeof pc.type === "string")
      return postConditionToWire(pc);
    return pc;
  });
  const lpPostConditions = createLPList(postConditions);
  const transaction = new StacksTransactionWire({
    transactionVersion: options.network.transactionVersion,
    chainId: options.network.chainId,
    auth: authorization,
    payload,
    postConditions: lpPostConditions,
    postConditionMode: options.postConditionMode
  });
  if (txOptions.fee === void 0 || txOptions.fee === null) {
    const fee = await fetchFeeEstimate({ transaction, ...options });
    transaction.setFee(fee);
  }
  if (txOptions.nonce === void 0 || txOptions.nonce === null) {
    const addressVersion = options.network.addressVersion.singleSig;
    const address2 = (0, import_c32check5.c32address)(addressVersion, transaction.auth.spendingCondition.signer);
    const txNonce = await fetchNonce({ address: address2, ...options });
    transaction.setNonce(txNonce);
  }
  return transaction;
}
async function makeContractCall(txOptions) {
  if ("senderKey" in txOptions) {
    const publicKey = privateKeyToPublic(txOptions.senderKey);
    const options = omit(txOptions, "senderKey");
    const transaction = await makeUnsignedContractCall({ publicKey, ...options });
    const privKey = txOptions.senderKey;
    const signer = new TransactionSigner(transaction);
    signer.signOrigin(privKey);
    return transaction;
  } else {
    const options = omit(txOptions, "signerKeys");
    const transaction = await makeUnsignedContractCall(options);
    mutatingSignAppendMultiSig(transaction, txOptions.publicKeys.map(publicKeyToHex).slice(), txOptions.signerKeys.map(privateKeyToHex), txOptions.address);
    return transaction;
  }
}
async function sponsorTransaction(sponsorOptions) {
  const defaultOptions = {
    fee: 0,
    sponsorNonce: 0,
    sponsorAddressHashmode: AddressHashMode.P2PKH,
    network: deriveNetworkFromTx(sponsorOptions.transaction)
  };
  const options = Object.assign(defaultOptions, sponsorOptions);
  options.network = networkFrom(options.network);
  options.client = Object.assign({}, clientFromNetwork(options.network), options.client);
  const sponsorPubKey = privateKeyToPublic(options.sponsorPrivateKey);
  if (sponsorOptions.fee == null) {
    let txFee = 0;
    switch (options.transaction.payload.payloadType) {
      case PayloadType.TokenTransfer:
      case PayloadType.SmartContract:
      case PayloadType.VersionedSmartContract:
      case PayloadType.ContractCall:
        txFee = BigInt(await fetchFeeEstimate({ ...options }));
        break;
      default:
        throw new Error(`Sponsored transactions not supported for transaction type ${PayloadType[options.transaction.payload.payloadType]}`);
    }
    options.transaction.setFee(txFee);
    options.fee = txFee;
  }
  if (sponsorOptions.sponsorNonce == null) {
    const addressVersion = options.network.addressVersion.singleSig;
    const address2 = publicKeyToAddress(addressVersion, sponsorPubKey);
    const sponsorNonce = await fetchNonce({ address: address2, ...options });
    options.sponsorNonce = sponsorNonce;
  }
  const sponsorSpendingCondition = createSingleSigSpendingCondition(options.sponsorAddressHashmode, sponsorPubKey, options.sponsorNonce, options.fee);
  options.transaction.setSponsor(sponsorSpendingCondition);
  const privKey = options.sponsorPrivateKey;
  const signer = TransactionSigner.createSponsorSigner(options.transaction, sponsorSpendingCondition);
  signer.signSponsor(privKey);
  return signer.transaction;
}
function mutatingSignAppendMultiSig(transaction, publicKeys, signerKeys, address2) {
  if (isSingleSig(transaction.auth.spendingCondition)) {
    throw new Error("Transaction is not a multi-sig transaction");
  }
  const signer = new TransactionSigner(transaction);
  const pubs = address2 ? sortPublicKeysForAddress(publicKeys, transaction.auth.spendingCondition.signaturesRequired, transaction.auth.spendingCondition.hashMode, createAddress(address2).hash160) : publicKeys;
  for (const publicKey of pubs) {
    const signerKey = signerKeys.find((key) => privateKeyToPublic(key) === publicKey);
    if (signerKey) {
      signer.signOrigin(signerKey);
    } else {
      signer.appendOrigin(publicKey);
    }
  }
}
function sortPublicKeysForAddress(publicKeys, numSigs, hashMode, hash2) {
  const hashUnsorted = addressFromPublicKeys(0, hashMode, numSigs, publicKeys.map(createStacksPublicKey)).hash160;
  if (hashUnsorted === hash2)
    return publicKeys;
  const publicKeysSorted = publicKeys.slice().sort();
  const hashSorted = addressFromPublicKeys(0, hashMode, numSigs, publicKeysSorted.map(createStacksPublicKey)).hash160;
  if (hashSorted === hash2)
    return publicKeysSorted;
  throw new Error("Failed to find matching multi-sig address given public-keys.");
}

// node_modules/@stacks/transactions/dist/esm/structuredDataSignature.js
var STRUCTURED_DATA_PREFIX = new Uint8Array([83, 73, 80, 48, 49, 56]);
function hashStructuredData(structuredData) {
  return bytesToHex(sha256(serializeCVBytes(structuredData)));
}
function hashStructuredDataBytes(structuredData) {
  return sha256(serializeCVBytes(structuredData));
}
var hash256BytesLength = 32;
function isDomain(value) {
  if (value.type !== ClarityType.Tuple)
    return false;
  if (!["name", "version", "chain-id"].every((key) => key in value.value))
    return false;
  if (!["name", "version"].every((key) => value.value[key].type === ClarityType.StringASCII))
    return false;
  if (value.value["chain-id"].type !== ClarityType.UInt)
    return false;
  return true;
}
function encodeStructuredData(opts) {
  const bytes2 = encodeStructuredDataBytes(opts);
  return bytesToHex(bytes2);
}
function encodeStructuredDataBytes({ message, domain }) {
  const structuredDataHash = hashStructuredDataBytes(message);
  if (!isDomain(domain)) {
    throw new Error("domain parameter must be a valid domain of type TupleCV with keys 'name', 'version', 'chain-id' with respective types StringASCII, StringASCII, UInt");
  }
  const domainHash = hashStructuredDataBytes(domain);
  return concatBytes(STRUCTURED_DATA_PREFIX, domainHash, structuredDataHash);
}
function decodeStructuredDataSignature(signature) {
  const bytes2 = decodeStructuredDataSignatureBytes(signature);
  return {
    domainHash: bytesToHex(bytes2.domainHash),
    messageHash: bytesToHex(bytes2.messageHash)
  };
}
function decodeStructuredDataSignatureBytes(signature) {
  const encodedMessageBytes = typeof signature === "string" ? hexToBytes(signature) : signature;
  const domainHash = encodedMessageBytes.slice(STRUCTURED_DATA_PREFIX.length, STRUCTURED_DATA_PREFIX.length + hash256BytesLength);
  const messageHash = encodedMessageBytes.slice(STRUCTURED_DATA_PREFIX.length + hash256BytesLength);
  return {
    domainHash,
    messageHash
  };
}
function signStructuredData({ message, domain, privateKey }) {
  const structuredDataHash = bytesToHex(sha256(encodeStructuredDataBytes({ message, domain })));
  return signMessageHashRsv({
    messageHash: structuredDataHash,
    privateKey
  });
}

// node_modules/@stacks/transactions/dist/esm/namespaces/address.js
var address_exports = {};
__export(address_exports, {
  fromPrivateKey: () => fromPrivateKey,
  fromPublicKey: () => fromPublicKey,
  parse: () => parse2,
  stringify: () => stringify
});
var import_c32check6 = __toESM(require_lib());
var C32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function parse2(address2) {
  const [addr, contractName] = address2.split(".");
  const parsed = (0, import_c32check6.c32addressDecode)(addr);
  return {
    version: parsed[0],
    versionChar: C32[parsed[0]],
    hash160: parsed[1],
    contractName
  };
}
function stringify(address2) {
  const version = "version" in address2 ? address2.version : C32.indexOf(address2.versionChar.toUpperCase());
  const addr = (0, import_c32check6.c32address)(version, address2.hash160);
  if (address2.contractName)
    return `${addr}.${address2.contractName}`;
  return addr;
}
var fromPrivateKey = privateKeyToAddress;
var fromPublicKey = publicKeyToAddressSingleSig;

// node_modules/@stacks/transactions/dist/esm/cl.js
var cl_exports = {};
__export(cl_exports, {
  address: () => address,
  bool: () => bool2,
  buffer: () => buffer,
  bufferFromAscii: () => bufferFromAscii,
  bufferFromHex: () => bufferFromHex,
  bufferFromUtf8: () => bufferFromUtf8,
  contractPrincipal: () => contractPrincipal,
  deserialize: () => deserialize,
  error: () => error,
  int: () => int,
  list: () => list,
  none: () => none,
  ok: () => ok,
  parse: () => parse,
  prettyPrint: () => prettyPrint,
  principal: () => principal,
  serialize: () => serialize,
  some: () => some,
  standardPrincipal: () => standardPrincipal,
  stringAscii: () => stringAscii,
  stringUtf8: () => stringUtf8,
  stringify: () => stringify2,
  tuple: () => tuple,
  uint: () => uint
});

// node_modules/@stacks/transactions/dist/esm/clarity/prettyPrint.js
function escape(value) {
  return JSON.stringify(value).slice(1, -1);
}
function formatSpace(space, depth, end = false) {
  if (!space)
    return " ";
  return `
${" ".repeat(space * (depth - (end ? 1 : 0)))}`;
}
function formatList(cv, space, depth = 1) {
  if (cv.value.length === 0)
    return "(list)";
  const spaceBefore = formatSpace(space, depth, false);
  const endSpace = space ? formatSpace(space, depth, true) : "";
  const items = cv.value.map((v) => prettyPrintWithDepth(v, space, depth)).join(spaceBefore);
  return `(list${spaceBefore}${items}${endSpace})`;
}
function formatTuple(cv, space, depth = 1) {
  if (Object.keys(cv.value).length === 0)
    return "{}";
  const items = [];
  for (const [key, value] of Object.entries(cv.value)) {
    items.push(`${key}: ${prettyPrintWithDepth(value, space, depth)}`);
  }
  const spaceBefore = formatSpace(space, depth, false);
  const endSpace = formatSpace(space, depth, true);
  return `{${spaceBefore}${items.sort().join(`,${spaceBefore}`)}${endSpace}}`;
}
function exhaustiveCheck(param) {
  throw new Error(`invalid clarity value type: ${param}`);
}
function prettyPrintWithDepth(cv, space = 0, depth) {
  if (cv.type === ClarityType.BoolFalse)
    return "false";
  if (cv.type === ClarityType.BoolTrue)
    return "true";
  if (cv.type === ClarityType.Int)
    return cv.value.toString();
  if (cv.type === ClarityType.UInt)
    return `u${cv.value.toString()}`;
  if (cv.type === ClarityType.StringASCII)
    return `"${escape(cv.value)}"`;
  if (cv.type === ClarityType.StringUTF8)
    return `u"${escape(cv.value)}"`;
  if (cv.type === ClarityType.PrincipalContract)
    return `'${cv.value}`;
  if (cv.type === ClarityType.PrincipalStandard)
    return `'${cv.value}`;
  if (cv.type === ClarityType.Buffer)
    return `0x${cv.value}`;
  if (cv.type === ClarityType.OptionalNone)
    return "none";
  if (cv.type === ClarityType.OptionalSome)
    return `(some ${prettyPrintWithDepth(cv.value, space, depth)})`;
  if (cv.type === ClarityType.ResponseOk)
    return `(ok ${prettyPrintWithDepth(cv.value, space, depth)})`;
  if (cv.type === ClarityType.ResponseErr)
    return `(err ${prettyPrintWithDepth(cv.value, space, depth)})`;
  if (cv.type === ClarityType.List) {
    return formatList(cv, space, depth + 1);
  }
  if (cv.type === ClarityType.Tuple) {
    return formatTuple(cv, space, depth + 1);
  }
  exhaustiveCheck(cv);
}
function stringify2(cv, space = 0) {
  return prettyPrintWithDepth(cv, space, 0);
}
var prettyPrint = stringify2;

// node_modules/@stacks/transactions/dist/esm/cl.js
var bool2 = boolCV;
var int = intCV;
var uint = uintCV;
function principal(address2) {
  const [addr, name] = address2.split(".");
  return name ? contractPrincipalCV(addr, name) : standardPrincipalCV(addr);
}
var address = principal;
var contractPrincipal = contractPrincipalCV;
var standardPrincipal = standardPrincipalCV;
var list = listCV;
var stringAscii = stringAsciiCV;
var stringUtf8 = stringUtf8CV;
var buffer = bufferCV;
var bufferFromHex = (hex) => bufferCV(hexToBytes(hex));
var bufferFromAscii = (ascii) => bufferCV(asciiToBytes(ascii));
var bufferFromUtf8 = (utf8) => bufferCV(utf8ToBytes(utf8));
var none = noneCV;
var some = someCV;
var ok = responseOkCV;
var error = responseErrorCV;
var tuple = tupleCV;
var serialize = serializeCV;
var deserialize = deserializeCV;

// node_modules/@stacks/transactions/dist/esm/pc.js
var pc_exports = {};
__export(pc_exports, {
  fromHex: () => fromHex,
  origin: () => origin,
  principal: () => principal2
});
function principal2(principal3) {
  const [address2, name] = principal3.split(".");
  if (!address2 || !validateStacksAddress(address2) || typeof name === "string" && !name) {
    throw new Error(`Invalid contract id: ${principal3}`);
  }
  return new PartialPcWithPrincipal(principal3);
}
function origin() {
  return new PartialPcWithPrincipal("origin");
}
var PartialPcWithPrincipal = class {
  constructor(address2) {
    this.address = address2;
  }
  willSendEq(amount) {
    return new PartialPcFtWithCode(this.address, amount, "eq");
  }
  willSendLte(amount) {
    return new PartialPcFtWithCode(this.address, amount, "lte");
  }
  willSendLt(amount) {
    return new PartialPcFtWithCode(this.address, amount, "lt");
  }
  willSendGte(amount) {
    return new PartialPcFtWithCode(this.address, amount, "gte");
  }
  willSendGt(amount) {
    return new PartialPcFtWithCode(this.address, amount, "gt");
  }
  willSendAsset() {
    return new PartialPcNftWithCode(this.address, "sent");
  }
  willNotSendAsset() {
    return new PartialPcNftWithCode(this.address, "not-sent");
  }
  willMaybeSendAsset() {
    return new PartialPcNftWithCode(this.address, "maybe-sent");
  }
  willPerformPox() {
    return { type: "pox-postcondition", address: this.address, condition: "will-perform" };
  }
  willNotPerformPox() {
    return { type: "pox-postcondition", address: this.address, condition: "will-not-perform" };
  }
  mayPerformPox() {
    return { type: "pox-postcondition", address: this.address, condition: "may-perform" };
  }
};
var PartialPcFtWithCode = class {
  constructor(address2, amount, code) {
    this.address = address2;
    this.amount = amount;
    this.code = code;
  }
  ustx() {
    return {
      type: "stx-postcondition",
      address: this.address,
      condition: this.code,
      amount: parsePostConditionAmount(this.amount).toString()
    };
  }
  ft(contractId, tokenName) {
    const [address2, name] = contractId.split(".");
    if (!address2 || !validateStacksAddress(address2) || typeof name === "string" && !name) {
      throw new Error(`Invalid contract id: ${contractId}`);
    }
    return {
      type: "ft-postcondition",
      address: this.address,
      condition: this.code,
      amount: parsePostConditionAmount(this.amount).toString(),
      asset: `${contractId}::${tokenName}`
    };
  }
  ustxToLock() {
    return {
      type: "staking-postcondition",
      address: this.address,
      condition: this.code,
      amount: parsePostConditionAmount(this.amount).toString()
    };
  }
};
var PartialPcNftWithCode = class {
  constructor(address2, code) {
    this.address = address2;
    this.code = code;
  }
  nft(...args) {
    const { contractAddress, contractName, tokenName, assetId } = getNftArgs(...args);
    if (!validateStacksAddress(contractAddress)) {
      throw new Error(`Invalid contract id: ${contractAddress}`);
    }
    return {
      type: "nft-postcondition",
      address: this.address,
      condition: this.code,
      asset: `${contractAddress}.${contractName}::${tokenName}`,
      assetId
    };
  }
};
function parseNft(nftAssetName) {
  const [principal3, tokenName] = nftAssetName.split("::");
  if (!principal3 || !tokenName)
    throw new Error(`Invalid fully-qualified nft asset name: ${nftAssetName}`);
  const [address2, name] = parseContractId(principal3);
  return { contractAddress: address2, contractName: name, tokenName };
}
function fromHex(hex) {
  const wire = deserializePostConditionWire(hex);
  return wireToPostCondition(wire);
}
function getNftArgs(...args) {
  if (args.length === 2) {
    const [assetName, assetId2] = args;
    return { ...parseNft(assetName), assetId: assetId2 };
  }
  const [contractId, tokenName, assetId] = args;
  const [address2, name] = parseContractId(contractId);
  return { contractAddress: address2, contractName: name, tokenName, assetId };
}
export {
  ACCOUNT_PATH,
  address_exports as Address,
  AddressHashMode,
  AddressVersion,
  AnchorMode,
  AnchorModeNames,
  AssetType,
  AuthFieldType,
  AuthType,
  BLOCKSTACK_DEFAULT_GAIA_HUB_URL,
  BROADCAST_PATH,
  BytesReader,
  CLARITY_INT_BYTE_SIZE,
  CLARITY_INT_SIZE,
  COINBASE_BYTES_LENGTH,
  COMPRESSED_PUBKEY_LENGTH_BYTES,
  CONTRACT_ABI_PATH,
  cl_exports as Cl,
  ClarityAbiTypeId,
  ClarityType,
  ClarityVersion,
  ClarityWireType,
  FungibleConditionCode,
  MAP_ENTRY_PATH,
  MAX_STRING_LENGTH_BYTES,
  MEMO_MAX_LENGTH_BYTES,
  NonFungibleConditionCode,
  PayloadType,
  pc_exports as Pc,
  PostConditionMode,
  PostConditionPrincipalId,
  PostConditionType,
  PoxConditionCode,
  PubKeyEncoding,
  READONLY_FUNCTION_CALL_PATH,
  RECOVERABLE_ECDSA_SIG_LENGTH_BYTES,
  STRING_MAX_LENGTH,
  STRUCTURED_DATA_PREFIX,
  StacksTransactionWire,
  StacksWireType,
  TRANSACTION_FEE_ESTIMATE_PATH,
  TRANSFER_FEE_ESTIMATE_PATH,
  TenureChangeCause,
  TransactionSigner,
  TxRejectedReason,
  UNCOMPRESSED_PUBKEY_LENGTH_BYTES,
  VRF_PROOF_BYTES_LENGTH,
  abiFunctionToString,
  addressFromPublicKeys,
  addressFromVersionHash,
  addressHashModeToVersion,
  addressToString,
  anchorModeFrom,
  boolCV,
  broadcastTransaction,
  bufferCV,
  bufferCVFromString,
  clarityByteToType,
  clarityTypeToByte,
  cloneDeep,
  codeBodyString,
  compressPrivateKey,
  compressPublicKey,
  conditionByteToType,
  conditionTypeToByte,
  contractPrincipalCV,
  contractPrincipalCVFromAddress,
  contractPrincipalCVFromStandard,
  createAddress,
  createAsset,
  createCoinbasePayload,
  createContractCallPayload,
  createContractPrincipal,
  createEmptyAddress,
  createLPList,
  createLPString,
  createMemoString,
  createMessageSignature,
  createMultiSigSpendingCondition,
  createNakamotoCoinbasePayload,
  createPoisonPayload,
  createSingleSigSpendingCondition,
  createSmartContractPayload,
  createSpendingCondition,
  createSponsoredAuth,
  createStacksPublicKey,
  createStandardAuth,
  createStandardPrincipal,
  createTenureChangePayload,
  createTokenTransferPayload,
  createTransactionAuthField,
  cvToHex,
  cvToJSON,
  cvToString,
  cvToValue,
  decodeStructuredDataSignature,
  decodeStructuredDataSignatureBytes,
  deriveNetworkFromTx,
  deserializeAddress,
  deserializeAsset,
  deserializeAuthorization,
  deserializeCV,
  deserializeLPList,
  deserializeLPString,
  deserializeMemoString,
  deserializeMessageSignature,
  deserializeMultiSigSpendingCondition,
  deserializePayload,
  deserializePostConditionWire,
  deserializePrincipal,
  deserializePublicKey,
  deserializeSingleSigSpendingCondition,
  deserializeSpendingCondition,
  deserializeStacksWire,
  deserializeTransaction,
  deserializeTransactionAuthField,
  emptyMessageSignature,
  encodeAbiClarityValue,
  encodeClarityValue,
  encodeStructuredData,
  encodeStructuredDataBytes,
  estimateTransactionByteLength,
  exceedsMaxLengthBytes,
  falseCV,
  fetchAbi,
  fetchCallReadOnlyFunction,
  fetchContractMapEntry,
  fetchFeeEstimate,
  fetchFeeEstimateTransaction,
  fetchFeeEstimateTransfer,
  fetchNonce,
  getAddressFromPrivateKey,
  getAddressFromPublicKey,
  getCVTypeString,
  getFee,
  getTypeString,
  getTypeUnion,
  hash160,
  hashP2PKH,
  hashP2SH,
  hashP2WPKH,
  hashP2WSH,
  hashStructuredData,
  hashStructuredDataBytes,
  hexToCV,
  intCV,
  internal_parseCommaSeparated,
  intoInitialSighashAuth,
  isClarityAbiBuffer,
  isClarityAbiList,
  isClarityAbiOptional,
  isClarityAbiPrimitive,
  isClarityAbiResponse,
  isClarityAbiStringAscii,
  isClarityAbiStringUtf8,
  isClarityAbiTuple,
  isClarityName,
  isClarityType,
  isCoinbasePayload,
  isContractCallPayload,
  isNonSequentialMultiSig,
  isPoisonPayload,
  isPrivateKeyCompressed,
  isPublicKeyCompressed,
  isSequentialMultiSig,
  isSingleSig,
  isSmartContractPayload,
  isTokenTransferPayload,
  leftPadHex,
  leftPadHexToLength,
  listCV,
  makeContractCall,
  makeContractDeploy,
  makeRandomPrivKey,
  makeSTXTokenTransfer,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  nextSignature,
  nextVerification,
  noneCV,
  omit,
  optionalCVOf,
  parseAssetString,
  parseContractId,
  parsePostConditionAmount,
  parsePrincipalString,
  parseReadOnlyResponse,
  parseToCV,
  postConditionModeFrom,
  postConditionToHex,
  postConditionToWire,
  poxConditionByteToType,
  poxConditionTypeToByte,
  principalCV,
  privateKeyIsCompressed,
  privateKeyToAddress,
  privateKeyToHex,
  privateKeyToPublic,
  publicKeyFromSignatureRsv,
  publicKeyFromSignatureVrs,
  publicKeyIsCompressed,
  publicKeyToAddress,
  publicKeyToAddressSingleSig,
  publicKeyToHex,
  randomBytes,
  randomPrivateKey,
  responseErrorCV,
  responseOkCV,
  rightPadHexToLength,
  serializeAddress,
  serializeAddressBytes,
  serializeAsset,
  serializeAssetBytes,
  serializeAuthorization,
  serializeAuthorizationBytes,
  serializeCV,
  serializeCVBytes,
  serializeLPList,
  serializeLPListBytes,
  serializeLPString,
  serializeLPStringBytes,
  serializeMemoString,
  serializeMemoStringBytes,
  serializeMessageSignature,
  serializeMessageSignatureBytes,
  serializeMultiSigSpendingCondition,
  serializeMultiSigSpendingConditionBytes,
  serializePayload,
  serializePayloadBytes,
  serializePostConditionWire,
  serializePostConditionWireBytes,
  serializePrincipal,
  serializePrincipalBytes,
  serializePublicKey,
  serializePublicKeyBytes,
  serializeSingleSigSpendingCondition,
  serializeSingleSigSpendingConditionBytes,
  serializeSpendingCondition,
  serializeSpendingConditionBytes,
  serializeStacksWire,
  serializeStacksWireBytes,
  serializeTransaction,
  serializeTransactionAuthField,
  serializeTransactionAuthFieldBytes,
  serializeTransactionBytes,
  setFee,
  setNonce,
  setSponsor,
  setSponsorNonce,
  sigHashPreSign,
  signMessageHashRsv,
  signStructuredData,
  signWithKey,
  someCV,
  sponsorTransaction,
  standardPrincipalCV,
  standardPrincipalCVFromAddress,
  stringAsciiCV,
  stringCV,
  stringUtf8CV,
  transactionToHex,
  trueCV,
  tupleCV,
  txidFromBytes,
  txidFromData,
  uintCV,
  uncompressPublicKey,
  validateContractCall,
  validateStacksAddress,
  verifyOrigin,
  verify as verifySignature,
  whenWireType,
  wireToPostCondition
};
/*! Bundled license information:

@noble/hashes/utils.js:
@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/secp256k1/lib/esm/index.js:
  (*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/
