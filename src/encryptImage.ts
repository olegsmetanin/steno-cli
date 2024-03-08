import { PNG } from 'pngjs';

import { BYTE_SIZE, LENGTH_BYTES, SHASUM_BYTES } from './defaults';
import { countBytesForNRgbBytes, recombineRgbAndAlpha, splitRgbAndAlpha } from './png';
import { encryptBuffer, getShasumData } from './utils';

const getLengthData = (message: Buffer) => {
  const lengthHex = message.length.toString(16);
  const lengthBuffer = Buffer.from(lengthHex.length % 2 ? `0${lengthHex}` : lengthHex, 'hex');
  const pad = Buffer.alloc(LENGTH_BYTES - lengthBuffer.length);
  return Buffer.concat([pad, lengthBuffer], LENGTH_BYTES);
};

const getBit = (data: Buffer) => (i: number) => {
  const byteIndex = Math.floor(i / BYTE_SIZE);
  const bitIndex = i % BYTE_SIZE;

  const byte = data[byteIndex];
  const shiftDistance = BYTE_SIZE - 1 - bitIndex;
  /* tslint:disable:no-bitwise */
  return (byte >> shiftDistance) % 2;
  /* tslint:enable:no-bitwise */
};

/* tslint:disable:no-bitwise */
const addDataToByte = (data: Buffer) => (byte: number, i: number) => ((byte >> 1) << 1) | getBit(data)(i);
/* tslint:enable:no-bitwise */

const embedData = ([data, bed]: any[]) => bed.map(addDataToByte(data));

const store = (imageData: Buffer, message: Buffer) => {
  const bytesAvailable = imageData.length;
  const bytesToStore = LENGTH_BYTES + SHASUM_BYTES + message.length;
  const bytesRequired = countBytesForNRgbBytes(bytesToStore);

  if (bytesAvailable < bytesRequired) throw new Error('Image is not large enough to store message');

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
      [message, bytesToUseWithMessageData],
    ].map(embedData),
    rgb.length
  );

  const recombined = recombineRgbAndAlpha(embeddedData, alpha);
  const adjustedImageData = Buffer.concat([recombined, bytesToLeave], bytesAvailable);

  return adjustedImageData;
};

export const encryptImage = (image: Buffer, message: string | Buffer, encoding?: BufferEncoding, password?: string) => {
  const messageBuffer: Buffer = Buffer.isBuffer(message) ? message : Buffer.from(message, encoding);
  const secretBuffer: Buffer = password ? encryptBuffer(messageBuffer, password) : messageBuffer;

  const png: PNG = PNG.sync.read(image);
  const data = store(png.data, secretBuffer);
  const adjustedPng: PNG = Object.assign({}, png, { data });

  return PNG.sync.write(adjustedPng);
};
