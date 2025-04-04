// cryptoUtils.js
const crypto = require('crypto');
const fs = require('fs');
const stream = require('stream');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.scryptSync(process.env.FILE_SECRET || 'your_file_secret', 'salt', 32);
const IV_LENGTH = 16; // Initialization vector length

// Encrypt File (with error handling)
function encryptFile(inputPath, outputPath, callback) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  // Write the IV to the output file first
  output.write(iv, (err) => {
    if (err) return callback(err);
    input
      .pipe(cipher)
      .pipe(output)
      .on('finish', () => callback(null))
      .on('error', (err) => callback(err));
  });
}

// Decrypt File (using a PassThrough stream for IV extraction)
function decryptFile(inputPath, outputPath, callback) {
  const input = fs.createReadStream(inputPath);
  let iv;
  let remainingData = null;

  // Read the IV from the first chunk
  input.once('data', (chunk) => {
    iv = chunk.slice(0, IV_LENGTH);
    // Get any remaining data from the first chunk after the IV
    remainingData = chunk.slice(IV_LENGTH);

    // Create a PassThrough stream for the remaining data plus the rest of the file
    const passThrough = new stream.PassThrough();
    // If there's remaining data, push it into the passThrough stream
    if (remainingData.length) {
      passThrough.write(remainingData);
    }

    // Pipe the rest of the file into passThrough after the first chunk is processed
    input.pipe(passThrough);

    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    const output = fs.createWriteStream(outputPath);

    passThrough
      .pipe(decipher)
      .pipe(output)
      .on('finish', () => callback(null))
      .on('error', (err) => callback(err));
  });

  input.on('error', (err) => callback(err));
}

module.exports = { encryptFile, decryptFile };
