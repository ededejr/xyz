#!/usr/bin/env zx

import { SpotifyApi } from '../_utils.mjs';

const api = new SpotifyApi();
const artists = await api.fetchTopArtists();
const formatter = Intl.NumberFormat('en', { notation: 'compact' });

function outputArtist(artist, index) {
  const rank = `${index + 1}. `;
  const genres = `${artist.genres.join(', ')}`;

  const title = chalk.bold(`${rank}${artist.name}`);
  const middleLine = chalk.dim(`${genres}`);
  const bottomLine = chalk.dim(
    `${artist.popularity} · ${formatter.format(artist.followers)} · ${
      artist.url
    }`
  );

  const spacing = ' '.repeat(rank.length);

  console.log(`
${title}
${spacing}${middleLine}
${spacing}${bottomLine}`);
}

artists.forEach(outputArtist);
