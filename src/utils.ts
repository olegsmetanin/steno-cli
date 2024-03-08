import { createCipheriv, createDecipheriv, createHash, scryptSync } from 'crypto';

import { ENCRYPTION_METHOD } from './defaults';

export const decryptBuffer = (data: Buffer, password: string) => {
  const iv = scryptSync(password, password.slice(4), 16);
  const key = scryptSync(password, password.slice(-4), 32);
  const decipher = createDecipheriv(ENCRYPTION_METHOD, key, iv);
  const chunk1 = decipher.update(data);
  const chunk2 = decipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};

export const encryptBuffer = (message: Buffer, password: string) => {
  const iv = scryptSync(password, password.slice(4), 16);
  const key = scryptSync(password, password.slice(-4), 32);
  const cipher = createCipheriv(ENCRYPTION_METHOD, key, iv);
  const chunk1 = cipher.update(message);
  const chunk2 = cipher.final();
  return Buffer.concat([chunk1, chunk2], chunk1.length + chunk2.length);
};

export const getShasumData = (message: Buffer) => createHash('sha256').update(message).digest();
