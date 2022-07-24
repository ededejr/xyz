#!/usr/bin/env zx

import { SpotifyApi } from './_utils.mjs';

const api = new SpotifyApi();
const { context, item } = await api.fetchCurrentlyPlaying();
const { album, artists, name } = item;

const [artist, ...features] = artists;
const featuresText = features.map((ft) => ft.name).join(', ');
const trackArtist = chalk.dim(
  `${artist.name}${featuresText ? ` feat. ${featuresText}` : ''}`
);

const title = chalk.bold(name);
const middleLine = chalk.dim(`${album.name}, ${trackArtist}`);
const bottomLine = chalk.dim(new Date(album.release_date).getFullYear());

console.log(`
${title}
${middleLine}
${bottomLine}`);
