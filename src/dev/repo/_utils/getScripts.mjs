export const ROOT_DIR = path.join(__dirname, '../../../');

// Get available scripts
const scripts = (await glob(`${ROOT_DIR}/src/**/*.mjs`)).filter(
  (script) => !script.includes('_')
);

export function getScripts() {
  return scripts;
}
