// Import downloaded module
import { PNG } from 'pngjs';

// Import constants
import { BYTE_SIZE, LENGTH_BYTES, SHASUM_BYTES } from './defaults';
// Import custom functions
import { isRgbByte } from './png';
import { decryptBuffer, getShasumData } from './utils';

const extractBinary = (b: number) => b % 2;

const splitBitsAsBytes = (bitsAsBytes: Buffer) => (_: number, i: number) => {
  const start = i * BYTE_SIZE;
  return bitsAsBytes.slice(start, start + BYTE_SIZE);
};

const combineByteIntoBit = (accumulator: number, currentByte: number, i: number) => {
  const shiftDistance = BYTE_SIZE - 1 - i;
  /* tslint:disable:no-bitwise */
  return (currentByte << shiftDistance) | accumulator;
  /* tslint:enable:no-bitwise */
};

const combineBufferIntoByte = (buffer: Buffer) => buffer.reduce(combineByteIntoBit, 0);

const combineBits = (bitsAsBytes: Buffer) => {
  const n = Math.ceil(bitsAsBytes.length / BYTE_SIZE);
  return Array(n).fill(null).map(splitBitsAsBytes(bitsAsBytes)).map(combineBufferIntoByte);
};

const decode = (data: Buffer): Buffer => {
  const bitsAsBytes = data.map(extractBinary) as Buffer;
  const combined = combineBits(bitsAsBytes);
  return Buffer.from(combined);
};

const messageMatchesShasum = (message: Buffer, shasum: Buffer): boolean => getShasumData(message).equals(shasum);

const extractData = (imageData: Buffer) => {
  const rgb: Uint8Array = imageData.filter(isRgbByte);

  const lengthDataSize = LENGTH_BYTES * BYTE_SIZE;
  const shasumDataSize = SHASUM_BYTES * BYTE_SIZE;
  const lengthAndShasumSize = lengthDataSize + shasumDataSize;

  const lengthData = rgb.slice(0, lengthDataSize) as Buffer;
  const decodedLengthData = decode(lengthData);
  const length = parseInt(decodedLengthData.toString('hex'), 16) * BYTE_SIZE;

  const shasumData = rgb.slice(lengthDataSize, lengthAndShasumSize) as Buffer;
  const decodedShasumData = decode(shasumData);

  const messageData = rgb.slice(lengthAndShasumSize, lengthAndShasumSize + length) as Buffer;
  const decodedMessageData = decode(messageData);

  if (!messageMatchesShasum(decodedMessageData, decodedShasumData))
    throw new Error('Shasum did not match decoded message');

  return decodedMessageData;
};

export const decryptImage = (image: Buffer, encoding?: BufferEncoding, password?: string) => {
  const png: PNG = PNG.sync.read(image);
  const data = extractData(png.data);
  const output = password ? decryptBuffer(data, password) : data;
  return encoding ? output.toString(encoding) : output;
};
