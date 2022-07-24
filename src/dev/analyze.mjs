#!/usr/bin/env zx
import { getRootDir } from '../_utils/dir.mjs';

const { _: args, ...flags } = argv;

const withScripts = flags['with-scripts'];

// Get available scripts
const scripts = (await glob(`${getRootDir()}/src/**/*.mjs`)).filter(
  (script) => !script.includes('_')
);
const availableCommands = scripts.map((script) =>
  script
    .replace(`${getRootDir()}/src`, '')
    .replace(/\.mjs$/, '')
    .split('/')
);

let scriptOutput = '';

if (withScripts) {
  scriptOutput = '\nscripts:' + formatArrayOutput(scripts);
}

console.log(
  'xyz report\n',
  scriptOutput,
  '\ncommands:',
  formatArrayOutput(availableCommands.map((command) => command.join(' '))),
  '\ncurrent args:\n',
  args,
  '\n'
);

function formatArrayOutput(arr) {
  return `\n${arr.map((item) => ` - ${item}`).join('\n')}`;
}
