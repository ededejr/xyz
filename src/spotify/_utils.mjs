#!/usr/bin/env zx
import { getEnv } from '../_utils/env.mjs';

const SpotifyEndpoints = {
  base: `https://api.spotify.com/v1/me`,
  nowPlaying: `/player/currently-playing`,
  token: `https://accounts.spotify.com/api/token`,
  topTracks: `/top/tracks`,
  topArtists: `/top/artists`,
};

export class SpotifyApi {
  accessToken = null;
  accessTokenTimeout = 60 * 1000 * 60;

  /**
   * Get the top tracks from Spotify.
   */
  async fetchTopTracks() {
    this.log(`fetchTopTracks`);
    const { items } = await this.makeServiceCall(SpotifyEndpoints.topTracks);

    return items.map(item => ({
      album: {
        name: item.album.name,
        url: item.album.external_urls.spotify,
        releaseDate: +(new Date(item.album.release_date))
      },
      artists: item.artists.map(artist => artist.name),
      duration: item.duration_ms,
      id: item.id,
      images: item.album.images,
      popularity: item.popularity,
      previewUrl: item.preview_url,
      name: item.name,
      url: item.external_urls.spotify,
    }));
  }

  /**
   * Get the top artists from Spotify.
   */
   async fetchTopArtists() {
    this.log(`fetchTopArtists`);
    const { items } = await this.makeServiceCall(SpotifyEndpoints.topArtists);

    return items.map(item => ({
      followers: item.followers.total,
      genres: item.genres,
      id: item.id,
      images: item.images,
      popularity: item.popularity,
      name: item.name,
      url: item.external_urls.spotify
    }));
  }

  async makeServiceCall(endpoint) {
    if (!this.accessToken) {
      await this.fetchAccessToken();
    }

    this.log(`making service call to ${endpoint}`);
    const url = new URL(`${SpotifyEndpoints.base}${endpoint}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return await response.json();
  }

  async fetchAccessToken() {
    this.log('Fetching access token');
    const searchParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: getEnv('SPOTIFY_REFRESH_TOKEN'),
    }).toString();

    const url = new URL(`${SpotifyEndpoints.token}?${searchParams}`);

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.BasicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

    const { access_token } = await response.json();

    this.log('Acquired access token');
    this.accessToken = access_token;

    // Clear the access token after the chosen timeout.
    setTimeout(() => {
      this.accessToken = null;
      this.log('Cleared access token');
    }, this.accessTokenTimeout).unref();
    
    return access_token;
  }

  get BasicAuth() {
    const clientId = getEnv('SPOTIFY_CLIENT_ID');
    const clientSecret = getEnv('SPOTIFY_CLIENT_SECRET');
    return Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
  }

  log(message) {
    console.log(chalk.hex('#0e0e0e').dim(`[SpotifyApi] ${message}`));
  }
}