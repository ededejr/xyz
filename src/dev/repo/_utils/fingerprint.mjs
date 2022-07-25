import crypto from 'crypto';

export function fingerprint(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
