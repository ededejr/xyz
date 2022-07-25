#!/usr/bin/env zx
import { set } from './_utils/set.mjs';
import { fingerprint } from './_utils/fingerprint.mjs';
import { getCommands } from './_utils/getCommands.mjs';

const { _: args, ...flags } = argv;

const showJson = flags['json'];
const verbose = flags['verbose'];

async function generateSignature() {
  const commands = getCommands();

  const map = {};

  for (const command of commands) {
    const { script, signature } = command;
    const contents = await fs.readFile(script);
    const fileText = contents.toString();
    set(fingerprint(fileText), signature, map);
  }

  return map;
}

const signatureObj = await generateSignature();
const signature = fingerprint(JSON.stringify(signatureObj));

if (verbose) {
  console.log(chalk.gray(`\nsignature: ${chalk.bold.blue(signature)}\n`));
  console.log(chalk.gray(`composition:\n`));
  console.log(chalk.dim(JSON.stringify(signatureObj, null, 2)));
} else if (showJson) {
  console.log(JSON.stringify({ signature }));
} else {
  console.log(signature);
}
