"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@commander-js/extra-typings/index.js
var require_extra_typings = __commonJS({
  "node_modules/@commander-js/extra-typings/index.js"(exports2, module2) {
    "use strict";
    var commander = require("commander");
    exports2 = module2.exports = {};
    exports2.program = new commander.Command();
    exports2.Argument = commander.Argument;
    exports2.Command = commander.Command;
    exports2.CommanderError = commander.CommanderError;
    exports2.Help = commander.Help;
    exports2.InvalidArgumentError = commander.InvalidArgumentError;
    exports2.InvalidOptionArgumentError = commander.InvalidArgumentError;
    exports2.Option = commander.Option;
    exports2.createCommand = (name) => new commander.Command(name);
    exports2.createOption = (flags, description) => new commander.Option(flags, description);
    exports2.createArgument = (name, description) => new commander.Argument(name, description);
  }
});

// node_modules/@commander-js/extra-typings/esm.mjs
var import_index = __toESM(require_extra_typings(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/index.ts
var import_fs = require("fs");

// src/decryptImage.ts
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

// src/encryptImage.ts
var import_pngjs2 = require("pngjs");
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
  const png = import_pngjs2.PNG.sync.read(image);
  const data = store(png.data, secretBuffer);
  const adjustedPng = Object.assign({}, png, { data });
  return import_pngjs2.PNG.sync.write(adjustedPng);
};

// src/index.ts
var program2 = new Command();
program2.name("steno-cli").version("0.1.0").description("steno-cli");
program2.command("encrypt <password> <input-file> <input-png> <output-png>").description("encrypt <input-file> file to <input-png> using password <password> and save to <output-png>").action((password, input_file, input_png, output_png) => {
  if (password.length < 8) {
    console.log("password should be at least eight characters long");
  } else {
    console.log(`encrypt ${input_file} file to ${input_png} and save to ${output_png}`);
    const imageBuf = (0, import_fs.readFileSync)(input_png);
    const srcBuf = (0, import_fs.readFileSync)(input_file);
    const encodedFile = encryptImage(imageBuf, srcBuf, void 0, password);
    (0, import_fs.writeFileSync)(output_png, encodedFile);
  }
});
program2.command("decrypt <password> <input-png> <output-file>").description("decrypt <input-png> to <output-file> using password <password>").action((password, input_png, output_file) => {
  console.log(`decrypt ${input_png} file to ${output_file}`);
  const imageBuf = (0, import_fs.readFileSync)(input_png);
  const decodedFile = decryptImage(imageBuf, void 0, password);
  (0, import_fs.writeFileSync)(output_file, decodedFile);
});
program2.parse();
//# sourceMappingURL=index.js.map