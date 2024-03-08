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

// src/png.ts
var png_exports = {};
__export(png_exports, {
  countBytesForNRgbBytes: () => countBytesForNRgbBytes,
  isAlphaByte: () => isAlphaByte,
  isRgbByte: () => isRgbByte,
  recombineRgbAndAlpha: () => recombineRgbAndAlpha,
  splitRgbAndAlpha: () => splitRgbAndAlpha
});
module.exports = __toCommonJS(png_exports);

// src/defaults.ts
var BYTE_SIZE = 8;

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  countBytesForNRgbBytes,
  isAlphaByte,
  isRgbByte,
  recombineRgbAndAlpha,
  splitRgbAndAlpha
});
//# sourceMappingURL=png.js.map