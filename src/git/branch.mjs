#!/usr/bin/env zx
const branch = await $`git branch --show-current`;
console.log(branch);
