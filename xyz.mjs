#!/usr/bin/env zx

// Get available scripts
const scripts = await glob('src/**/*.mjs');
const availableCommands = scripts
  .map(script => script
    .replace(/^src\//, '')
    .replace(/\.mjs$/, '')
    .split('/')
  );

// Parse command
const { _: args, ...flags} = argv;

function formatArrayOutput(arr) {
  return `\n${arr.map(item => ` - ${item}`).join('\n')}`;
}

console.log(
  '---------------------------',
  'Debugger',
  '\nscripts:', formatArrayOutput(scripts),
  '\ncommands:', formatArrayOutput(availableCommands.map(command => command.join(' '))),
  '\ncurrent args:', args,
  '\n---------------------------',
  '\n'
);

const scriptFileName = await getScript();

if (!scriptFileName) {
  console.log('No script found');
  process.exit();
}

$`zx ${scriptFileName}`;

async function getScript() {
  const constructedPath = path.join(__dirname, 'src', ...args);
  const constructedFileName = `${constructedPath}.mjs`;

  if (!await doesFileExist(constructedFileName)) {
    return null;
  }

  return constructedFileName;
}

async function doesFileExist(fileName) {
  let exists = false;

  try {
    await fs.access(fileName);
    exists = true;
  } catch (error) {
    // do nothing
  }

  return exists;
}