"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/defaults.ts
var defaults_exports = {};
__export(defaults_exports, {
  BYTE_SIZE: () => BYTE_SIZE,
  ENCRYPTION_METHOD: () => ENCRYPTION_METHOD,
  LENGTH_BYTES: () => LENGTH_BYTES,
  SHASUM_BYTES: () => SHASUM_BYTES
});
module.exports = __toCommonJS(defaults_exports);
var BYTE_SIZE = 8;
var ENCRYPTION_METHOD = "aes256";
var LENGTH_BYTES = 8;
var SHASUM_BYTES = 32;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BYTE_SIZE,
  ENCRYPTION_METHOD,
  LENGTH_BYTES,
  SHASUM_BYTES
});
//# sourceMappingURL=defaults.js.map