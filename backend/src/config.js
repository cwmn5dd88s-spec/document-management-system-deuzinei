const path = require('node:path');

function readPositiveInteger(value, fallback, variableName) {
  const parsedValue = value === undefined ? fallback : Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${variableName} deve ser um inteiro positivo.`);
  }

  return parsedValue;
}

module.exports = {
  port: readPositiveInteger(process.env.PORT, 3000, 'PORT'),
  maxUploadSize: readPositiveInteger(
    process.env.MAX_UPLOAD_SIZE,
    10 * 1024 * 1024,
    'MAX_UPLOAD_SIZE'
  ),
  storageDirectory: path.resolve(__dirname, '../storage')
};
