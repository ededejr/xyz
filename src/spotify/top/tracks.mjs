#!/usr/bin/env zx

import { SpotifyApi } from '../_utils.mjs';

const api = new SpotifyApi();
const tracks = await api.fetchTopTracks();

function outputTrack(track, index) {
  const rank = `${index + 1}. `;
  const [artist, ...features] = track.artists;
  const featuresText = features.join(', ');

  const trackArtist = chalk.dim(
    `${artist}${featuresText ? ` feat. ${featuresText}` : ''}`
  );
  const duration = chalk.dim(
    `(${Math.floor(track.duration / 60000)}:${Math.floor(
      (track.duration % 60000) / 1000
    )}m)`
  );

  const title = chalk.bold(`${rank}${track.name}`);
  const middleLine = chalk.dim(`${track.album.name}, ${trackArtist}`);
  const bottomLine = chalk.dim(
    `${new Date(track.album.releaseDate).getFullYear()} · ${track.url}`
  );

  const spacing = ' '.repeat(rank.length);

  console.log(`
${title} ${duration}
${spacing}${middleLine}
${spacing}${bottomLine}`);
}

tracks.forEach(outputTrack);
