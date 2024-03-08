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

// src/utils.ts
var utils_exports = {};
__export(utils_exports, {
  decryptBuffer: () => decryptBuffer,
  encryptBuffer: () => encryptBuffer,
  getShasumData: () => getShasumData
});
module.exports = __toCommonJS(utils_exports);
var import_crypto = require("crypto");

// src/defaults.ts
var ENCRYPTION_METHOD = "aes256";

// src/utils.ts
var decryptBuffer = (data, password) => {
  const iv = (0, import_crypto.scryptSync)(password, password.slice(4), 16);
  const key = (0, import_crypto.scryptSync)(password, password.slice(-4), 32);
  const decipher = (0, import_crypto.createDecipheriv)(ENCRYPTION_METHOD, key, iv);
  const chunk1 = decipher.update(data);
  const chunk2 = decipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};
var encryptBuffer = (message, password) => {
  const iv = (0, import_crypto.scryptSync)(password, password.slice(4), 16);
  const key = (0, import_crypto.scryptSync)(password, password.slice(-4), 32);
  const cipher = (0, import_crypto.createCipheriv)(ENCRYPTION_METHOD, key, iv);
  const chunk1 = cipher.update(message);
  const chunk2 = cipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};
var getShasumData = (message) => (0, import_crypto.createHash)("sha256").update(message).digest();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decryptBuffer,
  encryptBuffer,
  getShasumData
});
//# sourceMappingURL=utils.js.map