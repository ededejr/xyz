#!/usr/bin/env zx
import crypto from 'crypto';

const { _: args, ...flags } = argv;

const showObject = flags['object'];
const showJson = flags['json'];

const ROOT_DIR = path.join(__dirname, '../../');

// Get available scripts
const scripts = (await glob(`${ROOT_DIR}/src/**/*.mjs`)).filter(
  (script) => !script.includes('_')
);

const RE = {
  meta: {
    description: /@meta\.description: (.*)/,
  },
};

async function generateCommandMap(scripts) {
  const commands = scripts.map((script) => ({
    script,
    signature: script
      .replace(`${ROOT_DIR}src`, '')
      .replace('.mjs', '')
      .replace(/\//g, '.')
      .substring(1),
  }));

  const map = {};

  for (const command of commands) {
    const { script, signature } = command;

    const objPath = signature.split('.');

    // carry the pointer down the object
    let curr = map;

    for (const pt of objPath) {
      if (!curr[pt]) {
        curr[pt] = {};
      }
      // update the pointer to be the
      // next level of the object
      curr = curr[pt];
    }

    // read file to determine metadata
    const contents = await fs.readFile(script);
    const fileText = contents.toString();

    // extract metadata with regex
    const descriptionMatch = fileText.match(RE.meta.description);

    // build command
    curr.fingerprint = fingerprint(fileText);
    curr.signature = signature;
    curr.script = script;
    curr.meta = {};

    if (descriptionMatch) {
      const [, description] = descriptionMatch;
      curr.meta.description = description;
    }
  }

  return map;
}

function fingerprint(content) {
  return crypto.createHash('md5').update(content).digest('hex');
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

const commandMap = await generateCommandMap(scripts);

if (showObject) {
  console.log(commandMap);
} else if (showJson) {
  console.log(JSON.stringify(commandMap, null, 2));
} else {
  console.log(chalk.dim('Generating map...\n'));
  Object.keys(commandMap).forEach((key) => printCommand(commandMap, key));
}
