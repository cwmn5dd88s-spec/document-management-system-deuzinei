const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const app = require('../src/app');
const config = require('../src/config');

let server;
let port;

function request(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      port,
      path: pathname,
      method: options.method || 'GET',
      headers: options.headers
    };
    const request = http.request(requestOptions, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks)
      }));
    });

    request.on('error', reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

function createMultipartBody(filename, content) {
  const boundary = `----dms-${Date.now()}`;
  const body = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      'Content-Type: text/plain\r\n\r\n' +
      `${content}\r\n` +
      `--${boundary}--\r\n`
  );

  return {
    body,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    }
  };
}

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  port = server.address().port;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  const storedFiles = await fs.readdir(config.storageDirectory);
  await Promise.all(
    storedFiles
      .filter((file) => file !== '.gitkeep')
      .map((file) => fs.unlink(path.join(config.storageDirectory, file)))
  );
});

test('expõe health e lista vazia inicialmente', async () => {
  const health = await request('/health');
  const documents = await request('/documents');

  assert.equal(health.status, 200);
  assert.deepEqual(JSON.parse(health.body), { status: 'ok' });
  assert.equal(documents.status, 200);
  assert.deepEqual(JSON.parse(documents.body), []);
});

test('rejeita upload sem arquivo', async () => {
  const response = await request('/upload', { method: 'POST' });

  assert.equal(response.status, 400);
  assert.equal(JSON.parse(response.body).error, 'O arquivo é obrigatório.');
});

test('faz upload, lista e baixa o documento', async () => {
  const multipart = createMultipartBody('relatorio.txt', 'conteudo seguro');
  const upload = await request('/upload', { method: 'POST', ...multipart });
  const metadata = JSON.parse(upload.body);

  assert.equal(upload.status, 201);
  assert.equal(metadata.originalName, 'relatorio.txt');
  assert.equal(metadata.size, 15);
  assert.equal(metadata.owner, 'default-user');
  assert.match(metadata.id, /^[0-9a-f-]{36}$/i);
  assert.equal((await fs.readdir(config.storageDirectory)).length, 2);

  const list = await request('/documents');
  const download = await request(`/documents/${metadata.id}/download`);

  assert.equal(list.status, 200);
  assert.deepEqual(JSON.parse(list.body), [metadata]);
  assert.equal(download.status, 200);
  assert.equal(download.body.toString(), 'conteudo seguro');
  assert.match(download.headers['content-disposition'], /relatorio\.txt/);
});

test('rejeita identificador inválido e inexistente', async () => {
  const invalid = await request('/documents/not-an-id/download');
  const missing = await request('/documents/223e4567-e89b-12d3-a456-426614174000/download');

  assert.equal(invalid.status, 400);
  assert.equal(missing.status, 404);
});
