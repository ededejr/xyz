import { getScripts, ROOT_DIR } from './getScripts.mjs';

export function getCommands() {
  return getScripts().map((script) => ({
    script,
    signature: script
      .replace(`${ROOT_DIR}src`, '')
      .replace('.mjs', '')
      .replace(/\//g, '.')
      .substring(1),
  }));
}
