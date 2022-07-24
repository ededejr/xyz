#!/usr/bin/env zx
import { getEnv } from '../_utils/env.mjs';

const SpotifyEndpoints = {
  base: {
    api: 'https://api.spotify.com/v1/me',
    accounts: 'https://accounts.spotify.com',
  },
  accounts: {
    token: '/api/token',
    authorize: '/authorize',
  },
  api: {
    topTracks: `/top/tracks`,
    topArtists: `/top/artists`,
    currentlyPlaying: `/player/currently-playing`,
  }
};

export class SpotifyApi {
  accessToken = null;
  accessTokenTimeout = 60 * 1000 * 60;
  callbackUri = 'https://edede.ca/spotify/callback';

  /**
   * Get currently playing track from Spotify.
   */
   async fetchCurrentlyPlaying() {
    this.log(`fetchCurrentlyPlaying`);
    return await this.makeServiceCall(SpotifyEndpoints.api.currentlyPlaying);
  }

  /**
   * Get the top tracks from Spotify.
   */
  async fetchTopTracks() {
    this.log(`fetchTopTracks`);
    const { items } = await this.makeServiceCall(SpotifyEndpoints.api.topTracks);

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
    const { items } = await this.makeServiceCall(SpotifyEndpoints.api.topArtists);

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
      await this.refreshAccessToken();
    }

    this.log(`making service call to ${endpoint}`);
    const url = new URL(`${SpotifyEndpoints.base.api}${endpoint}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ContentType: "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error "${response.status} ${response.statusText}" calling ${endpoint}`);
    }

    return await response.json();
  }

  async authorize() {
    this.log('building authorize url');
    const searchParams = new URLSearchParams({
      response_type: 'code',
      client_id: getEnv('SPOTIFY_CLIENT_ID'),
      scope: 'user-read-recently-played user-read-currently-playing user-library-read user-top-read',
      redirect_uri: this.callbackUri,
    }).toString();

    const url = new URL(`${SpotifyEndpoints.base.accounts}${SpotifyEndpoints.accounts.authorize}?${searchParams}`);
    return url.href;
  }

  async fetchRefreshToken() {
    this.log('Fetching access token');
    const searchParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: getEnv('SPOTIFY_CODE'),
      redirect_uri: this.callbackUri,
    }).toString();

    const url = new URL(`${SpotifyEndpoints.base.accounts}${SpotifyEndpoints.token}?${searchParams}`);

    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.BasicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams,
      });

    const { access_token, refresh_token, expires_in } = await response.json();

    this.log('Acquired access token');
    this.accessToken = access_token;
    this.accessTokenTimeout = expires_in * 1000;

    // Clear the access token after the chosen timeout.
    setTimeout(() => {
      this.accessToken = null;
      this.log('Cleared access token');
    }, this.accessTokenTimeout).unref();
    
    return refresh_token;
  }

  async refreshAccessToken() {
    this.log('Refreshing access token');
    const searchParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: getEnv('SPOTIFY_REFRESH_TOKEN'),
    }).toString();

    const url = new URL(`${SpotifyEndpoints.base.accounts}${SpotifyEndpoints.accounts.token}?${searchParams}`);

    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.BasicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams,
      });

    const { access_token, expires_in } = await response.json();

    this.log('Acquired access token');
    this.accessToken = access_token;
    this.accessTokenTimeout = expires_in * 1000;

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