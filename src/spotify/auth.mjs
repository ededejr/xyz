#!/usr/bin/env zx

import { SpotifyApi } from './_utils.mjs';

const { _: args, ...flags } = argv;

const shouldRefreshToken = flags['refresh-token'];

const api = new SpotifyApi();

if (shouldRefreshToken) {
  const token = await api.fetchRefreshToken();
  console.log(token);
} else {
  const url = await api.authorize();
  console.log(url);
}
