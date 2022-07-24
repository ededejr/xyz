#!/usr/bin/env zx
const { _: args, ...flags } = argv;

const withScripts = flags['with-scripts'];
const ROOT_DIR = path.join(__dirname, '../../');

// Get available scripts
const scripts = (await glob(`${ROOT_DIR}/src/**/*.mjs`)).filter(
  (script) => !script.includes('_')
);

const availableCommands = scripts.map((script) =>
  script
    .replace(`${ROOT_DIR}src`, '')
    .replace(/\.mjs$/, '')
    .split('/')
    .filter(Boolean)
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
