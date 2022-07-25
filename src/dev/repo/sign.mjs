#!/usr/bin/env zx
import { set } from './_utils/set.mjs';
import { fingerprint } from './_utils/fingerprint.mjs';
import { getCommands } from './_utils/getCommands.mjs';

const { _: args, ...flags } = argv;

const showJson = flags['json'];

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

const signature = await generateSignature();

if (showJson) {
  console.log(JSON.stringify(signature, null, 2));
} else {
  console.log(signature);
}
