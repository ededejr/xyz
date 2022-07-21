#!/usr/bin/env zx

// Nodejs encryption with CTR
const crypto = require('crypto');

export class Encrypter {
  constructor(config) {
    const { algorithm, secretKey, iv } = Object.assign({
      algorithm: 'aes-256-ctr',
      secretKey: crypto.randomBytes(32),
      iv: crypto.randomBytes(16)
    }, config);

    this._algorithm = algorithm ;
    this._secretKey = secretKey;
    this._iv = iv;

    this._encryptionCipher = crypto.createCipheriv(algorithm, secretKey, iv);
    this._decryptionCipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  }

  get key() {
    return this._secretKey;
  }

  encrypt(text) {
    let cipher = crypto.createCipheriv(this._algorithm, Buffer.from(this._secretKey), this._iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: this._iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  }

  decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(this._algorithm, Buffer.from(this._secretKey), this._iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  encryptFile(filePath, outputPath) {
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);
    input.pipe(this._encryptionCipher).pipe(output);
  }

  decryptFile(filePath, outputPath) {
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);
    input.pipe(this._decryptionCipher).pipe(output);
  }

  static getSystemBasedConfig() {
    return {};
  }
}