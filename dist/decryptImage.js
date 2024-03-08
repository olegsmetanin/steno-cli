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

// src/decryptImage.ts
var decryptImage_exports = {};
__export(decryptImage_exports, {
  decryptImage: () => decryptImage
});
module.exports = __toCommonJS(decryptImage_exports);
var import_pngjs = require("pngjs");

// src/defaults.ts
var BYTE_SIZE = 8;
var ENCRYPTION_METHOD = "aes256";
var LENGTH_BYTES = 8;
var SHASUM_BYTES = 32;

// src/png.ts
var CHANNEL_COUNT = ["r", "g", "b", "a"].length;
var isRgbByte = (_, i) => (i + 1) % CHANNEL_COUNT;

// src/utils.ts
var import_crypto = require("crypto");
var decryptBuffer = (data, password) => {
  const iv = (0, import_crypto.scryptSync)(password, password.slice(4), 16);
  const key = (0, import_crypto.scryptSync)(password, password.slice(-4), 32);
  const decipher = (0, import_crypto.createDecipheriv)(ENCRYPTION_METHOD, key, iv);
  const chunk1 = decipher.update(data);
  const chunk2 = decipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};
var getShasumData = (message) => (0, import_crypto.createHash)("sha256").update(message).digest();

// src/decryptImage.ts
var extractBinary = (b) => b % 2;
var splitBitsAsBytes = (bitsAsBytes) => (_, i) => {
  const start = i * BYTE_SIZE;
  return bitsAsBytes.slice(start, start + BYTE_SIZE);
};
var combineByteIntoBit = (accumulator, currentByte, i) => {
  const shiftDistance = BYTE_SIZE - 1 - i;
  return currentByte << shiftDistance | accumulator;
};
var combineBufferIntoByte = (buffer) => buffer.reduce(combineByteIntoBit, 0);
var combineBits = (bitsAsBytes) => {
  const n = Math.ceil(bitsAsBytes.length / BYTE_SIZE);
  return Array(n).fill(null).map(splitBitsAsBytes(bitsAsBytes)).map(combineBufferIntoByte);
};
var decode = (data) => {
  const bitsAsBytes = data.map(extractBinary);
  const combined = combineBits(bitsAsBytes);
  return Buffer.from(combined);
};
var messageMatchesShasum = (message, shasum) => getShasumData(message).equals(shasum);
var extractData = (imageData) => {
  const rgb = imageData.filter(isRgbByte);
  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE;
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE;
  const lengthAndShasumSize = lengthDataSize + shasumDataSize;
  const lengthData = rgb.slice(0, lengthDataSize);
  const decodedLengthData = decode(lengthData);
  const length = parseInt(decodedLengthData.toString("hex"), 16) * BYTE_SIZE;
  const shasumData = rgb.slice(lengthDataSize, lengthAndShasumSize);
  const decodedShasumData = decode(shasumData);
  const messageData = rgb.slice(lengthAndShasumSize, lengthAndShasumSize + length);
  const decodedMessageData = decode(messageData);
  if (!messageMatchesShasum(decodedMessageData, decodedShasumData))
    throw new Error("Shasum did not match decoded message");
  return decodedMessageData;
};
var decryptImage = (image, encoding, password) => {
  const png = import_pngjs.PNG.sync.read(image);
  const data = extractData(png.data);
  const output = password ? decryptBuffer(data, password) : data;
  return encoding ? output.toString(encoding) : output;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decryptImage
});
//# sourceMappingURL=decryptImage.js.map