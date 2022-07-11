let CACHE;

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
export function getEnv(path) {
  const env = loadEnv();
  return env[path];
}

function loadEnv(config = undefined) {
  if (CACHE) {
    return CACHE;
  }

  require('dotenv').config(config);
  const validKeys = Object.keys(process.env).filter(key => key.startsWith('XYZ'));
  const env = {};
  validKeys.forEach(key => {
    env[key.replace('XYZ_', '')] = process.env[key];
  });

  CACHE = env;
  return env;
}