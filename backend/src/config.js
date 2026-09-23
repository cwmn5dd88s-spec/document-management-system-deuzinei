const path = require('node:path');

function positiveInteger(value, fallback, name) {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} deve ser um inteiro positivo.`);
  }
  return parsed;
}

module.exports = {
  port: positiveInteger(process.env.PORT, 3000, 'PORT'),
  maxUploadSize: positiveInteger(process.env.MAX_UPLOAD_SIZE, 10 * 1024 * 1024, 'MAX_UPLOAD_SIZE'),
  storageDirectory: path.resolve(__dirname, '../storage')
};
