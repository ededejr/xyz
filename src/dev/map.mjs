#!/usr/bin/env zx

const { _: args, ...flags } = argv;

const showObj = flags['object'];
const verbose = flags['verbose'];

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

    curr.signature = signature;
    curr.script = script;
    curr.meta = {};

    // read file to determine metadata
    const contents = await fs.readFile(script);
    const fileText = contents.toString();

    const descriptionMatch = fileText.match(RE.meta.description);

    if (descriptionMatch) {
      const [, description] = descriptionMatch;
      curr.meta.description = description;
    }
  }

  return map;
}

function printCommand(obj, key) {
  const command = obj[key];
  const { signature, script, meta, ...subcommands } = command;
  const { description } = meta || { description: '' };

  if (signature && signature.includes('.')) {
    const level = signature.split('.').length;
    const indent = ' '.repeat(level);

    console.log(`${indent}${chalk.magenta(`${key}`)}
${indent} ${chalk.dim(`signature: ${signature}`)}
${indent} ${chalk.dim(`script: ${script}`)}
${indent} ${chalk.dim('meta:')}${
      description ? chalk.dim(`\n${indent}  - description: ${description}`) : ''
    }
`);
  } else if (signature) {
    console.log(`${chalk.bold(key)}
 ${chalk.dim(`signature: ${signature}`)}
 ${chalk.dim(`script: ${script}`)}
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

if (showObj) {
  console.log(commandMap);
}

console.log(chalk.dim('Generating map...\n'));
Object.keys(commandMap).forEach((key) => printCommand(commandMap, key));
