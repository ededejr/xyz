#!/usr/bin/env zx
import { set } from './_utils/set.mjs';
import { fingerprint } from './_utils/fingerprint.mjs';
import { getCommands } from './_utils/getCommands.mjs';

const { _: args, ...flags } = argv;

const showObject = flags['object'];
const showJson = flags['json'];

const RE = {
  meta: {
    description: /@meta\.description: (.*)/,
  },
};

async function generateCommandMap() {
  const commands = getCommands();

  const map = {};

  for (const command of commands) {
    const { script, signature } = command;

    const value = {};

    // read file to determine metadata
    const contents = await fs.readFile(script);
    const fileText = contents.toString();

    // extract metadata with regex
    const descriptionMatch = fileText.match(RE.meta.description);

    // build command
    value.fingerprint = fingerprint(fileText);
    value.signature = signature;
    value.script = script;
    value.meta = {};

    if (descriptionMatch) {
      const [, description] = descriptionMatch;
      value.meta.description = description;
    }

    set(value, signature, map);
  }

  return map;
}

function printCommand(obj, key) {
  const command = obj[key];
  const { fingerprint, signature, script, meta, ...subcommands } = command;
  const { description } = meta || { description: '' };

  if (signature && signature.includes('.')) {
    const level = signature.split('.').length;
    const indent = ' '.repeat(level);

    console.log(`${indent}${chalk.magenta(`${key}`)}
${indent} ${chalk.dim(`signature: ${signature}`)}
${indent} ${chalk.dim(`script: ${script}`)}
${indent} ${chalk.dim(`fingerprint: ${fingerprint}`)}
${indent} ${chalk.dim('meta:')}${
      description ? chalk.dim(`\n${indent}  - description: ${description}`) : ''
    }
`);
  } else if (signature) {
    console.log(`${chalk.bold(key)}
 ${chalk.dim(`signature: ${signature}`)}
 ${chalk.dim(`script: ${script}`)}
 ${chalk.dim(`fingerprint: ${fingerprint}`)}
 ${chalk.dim('meta:')}${
      description ? chalk.dim(`\n  - description: ${description}`) : ''
    }
`);
  } else {
    console.log(`${chalk.bold(`${key}`)}`);
  }

  if (Object.keys(subcommands).length) {
    Object.keys(subcommands).forEach((key) => printCommand(subcommands, key));
  }
}

const commandMap = await generateCommandMap();

if (showObject) {
  console.log(commandMap);
} else if (showJson) {
  console.log(JSON.stringify(commandMap, null, 2));
} else {
  console.log(chalk.dim('Generating map...\n'));
  Object.keys(commandMap).forEach((key) => printCommand(commandMap, key));
}
