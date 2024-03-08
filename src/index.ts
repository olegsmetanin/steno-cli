import { Command } from '@commander-js/extra-typings';
import { readFileSync, writeFileSync } from 'fs';

import { decryptImage } from './decryptImage';
import { encryptImage } from './encryptImage';

const program = new Command();

program.name('steno-cli').version('0.1.0').description('steno-cli');

program
  .command('encrypt <password> <input-file> <input-png> <output-png>')
  .description('encrypt <input-file> file to <input-png> using password <password> and save to <output-png>')
  .action((password, input_file, input_png, output_png) => {
    if (password.length < 8) {
      console.log('password should be at least eight characters long');
    } else {
      console.log(`encrypt ${input_file} file to ${input_png} and save to ${output_png}`);
      const imageBuf = readFileSync(input_png);
      const srcBuf = readFileSync(input_file);
      const encodedFile = encryptImage(imageBuf, srcBuf, undefined, password);
      writeFileSync(output_png, encodedFile);
    }
  });

program
  .command('decrypt <password> <input-png> <output-file>')
  .description('decrypt <input-png> to <output-file> using password <password>')
  .action((password, input_png, output_file) => {
    console.log(`decrypt ${input_png} file to ${output_file}`);
    const imageBuf = readFileSync(input_png);
    const decodedFile = decryptImage(imageBuf, undefined, password);
    writeFileSync(output_file, decodedFile);
  });

program.parse();
