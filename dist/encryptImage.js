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

// src/encryptImage.ts
var encryptImage_exports = {};
__export(encryptImage_exports, {
  encryptImage: () => encryptImage
});
module.exports = __toCommonJS(encryptImage_exports);
var import_pngjs = require("pngjs");

// src/defaults.ts
var BYTE_SIZE = 8;
var ENCRYPTION_METHOD = "aes256";
var LENGTH_BYTES = 8;
var SHASUM_BYTES = 32;

// src/png.ts
var CHANNEL_COUNT = ["r", "g", "b", "a"].length;
var countBytesForNRgbBytes = (n) => Math.floor(n * BYTE_SIZE * CHANNEL_COUNT / (CHANNEL_COUNT - 1));
var isAlphaByte = (_, i) => !((i + 1) % CHANNEL_COUNT);
var isRgbByte = (_, i) => (i + 1) % CHANNEL_COUNT;
var recombineRgbAndAlpha = (rgb, alpha) => Buffer.from(
  Array(rgb.length + alpha.length).fill(null).map((_, i) => (i + 1) % CHANNEL_COUNT ? rgb[i - Math.floor(i / CHANNEL_COUNT)] : alpha[i % CHANNEL_COUNT])
);
var splitRgbAndAlpha = (data) => {
  const rgbBytes = data.filter(isRgbByte);
  const alphaBytes = data.filter(isAlphaByte);
  return [rgbBytes, alphaBytes];
};

// src/utils.ts
var import_crypto = require("crypto");
var encryptBuffer = (message, password) => {
  const iv = (0, import_crypto.scryptSync)(password, password.slice(4), 16);
  const key = (0, import_crypto.scryptSync)(password, password.slice(-4), 32);
  const cipher = (0, import_crypto.createCipheriv)(ENCRYPTION_METHOD, key, iv);
  const chunk1 = cipher.update(message);
  const chunk2 = cipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};
var getShasumData = (message) => (0, import_crypto.createHash)("sha256").update(message).digest();

// src/encryptImage.ts
var getLengthData = (message) => {
  const lengthHex = message.length.toString(16);
  const lengthBuffer = Buffer.from(lengthHex.length % 2 ? `0${lengthHex}` : lengthHex, "hex");
  const pad = Buffer.alloc(LENGTH_BYTES - lengthBuffer.length);
  return Buffer.concat([pad, lengthBuffer], LENGTH_BYTES);
};
var getBit = (data) => (i) => {
  const byteIndex = Math.floor(i / BYTE_SIZE);
  const bitIndex = i % BYTE_SIZE;
  const byte = data[byteIndex];
  const shiftDistance = BYTE_SIZE - 1 - bitIndex;
  return (byte >> shiftDistance) % 2;
};
var addDataToByte = (data) => (byte, i) => byte >> 1 << 1 | getBit(data)(i);
var embedData = ([data, bed]) => bed.map(addDataToByte(data));
var store = (imageData, message) => {
  const bytesAvailable = imageData.length;
  const bytesToStore = LENGTH_BYTES + SHASUM_BYTES + message.length;
  const bytesRequired = countBytesForNRgbBytes(bytesToStore);
  if (bytesAvailable < bytesRequired)
    throw new Error("Image is not large enough to store message");
  const lengthData = getLengthData(message);
  const shasumData = getShasumData(message);
  const bytesToUse = imageData.slice(0, bytesRequired);
  const bytesToLeave = imageData.slice(bytesRequired);
  const [rgb, alpha] = splitRgbAndAlpha(bytesToUse);
  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE;
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE;
  const bytesToUseWithLengthData = rgb.slice(0, lengthDataSize);
  const bytesToUseWithShasumData = rgb.slice(lengthDataSize, lengthDataSize + shasumDataSize);
  const bytesToUseWithMessageData = rgb.slice(lengthDataSize + shasumDataSize);
  const embeddedData = Buffer.concat(
    [
      [lengthData, bytesToUseWithLengthData],
      [shasumData, bytesToUseWithShasumData],
      [message, bytesToUseWithMessageData]
    ].map(embedData),
    rgb.length
  );
  const recombined = recombineRgbAndAlpha(embeddedData, alpha);
  const adjustedImageData = Buffer.concat([recombined, bytesToLeave], bytesAvailable);
  return adjustedImageData;
};
var encryptImage = (image, message, encoding, password) => {
  const messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message, encoding);
  const secretBuffer = password ? encryptBuffer(messageBuffer, password) : messageBuffer;
  const png = import_pngjs.PNG.sync.read(image);
  const data = store(png.data, secretBuffer);
  const adjustedPng = Object.assign({}, png, { data });
  return import_pngjs.PNG.sync.write(adjustedPng);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  encryptImage
});
//# sourceMappingURL=encryptImage.js.map