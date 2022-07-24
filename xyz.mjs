#!/usr/bin/env zx

// Parse command
const { _: args, ...flags } = argv;

// Load available scripts
const scripts = (await glob(`${__dirname}/src/**/*.mjs`)).filter(
  (script) => !script.includes('_')
);
const availableCommands = scripts.map((script) =>
  script
    .replace(`${__dirname}/src/`, '')
    .replace(/\.mjs$/, '')
    .split('/')
);

const scriptFileName = await getScript();

if (!scriptFileName) {
  console.log('No script found');
  process.exit();
}

const { stdout, ...passedFlags } = flags;

process.env.FORCE_COLOR = 3;

if (stdout) {
  const { stdout, stderr } = await $`zx --quiet ${scriptFileName} ${Object.keys(
    passedFlags
  )
    .map((flag) => `--${flag}=${passedFlags[flag]}`)
    .join(' ')}`;
  if (stderr) {
    console.error(stderr);
  }
  console.log(stdout);
} else {
  await $`zx --quiet ${scriptFileName} ${Object.keys(passedFlags)
    .map((flag) => `--${flag}=${passedFlags[flag]}`)
    .join(' ')}`;
}

async function getScript() {
  const constructedPath = path.join(__dirname, 'src', ...args);
  const constructedFileName = `${constructedPath}.mjs`;

  if (!(await doesFileExist(constructedFileName))) {
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
