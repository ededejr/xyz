#!/usr/bin/env zx

// Parse command
const { _: args, ...flags} = argv;

// Load available scripts
const scripts = (await glob(`${__dirname}/src/**/*.mjs`)).filter(script => !script.includes('_'));
const availableCommands = scripts
  .map(script => script
    .replace(`${__dirname}/src/`, '')
    .replace(/\.mjs$/, '')
    .split('/')
  );

const scriptFileName = await getScript();

if (!scriptFileName) {
  console.log('No script found');
  process.exit();
}

process.env.FORCE_COLOR=3
$`zx --quiet ${scriptFileName} ${Object.keys(flags).map(flag => `--${flag}=${flags[flag]}`).join(' ')}`;

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