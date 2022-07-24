#!/usr/bin/env zx
import { Encrypter } from './_utils.mjs';

const { _: args, ...flags } = argv;
const { text } = flags;

if (!text) {
  console.log('No text specified');
  process.exit();
}

const config = Encrypter.getSystemBasedConfig();
const encrypter = new Encrypter(config);

console.log(encrypter.encrypt(text));
