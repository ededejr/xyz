#!/usr/bin/env zx
import { ROOT_DIR } from './_utils/getScripts.mjs';
import conventionalChangelog from 'conventional-changelog';

const { stdout } = await $`git rev-parse --short HEAD`;
const commitSha = stdout.replace('\n', '');
const filename = path.join(ROOT_DIR, `.xyz/changelogs/${commitSha}.md`);
await fs.mkdir(path.dirname(filename), { recursive: true });
const ws = await fs.createWriteStream(filename);

conventionalChangelog({
  preset: 'angular',
}).pipe(ws);
