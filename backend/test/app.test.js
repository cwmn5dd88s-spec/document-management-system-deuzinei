const { after, before, test } = require('node:test');
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
    const request = http.request({ port, path: pathname, method: options.method || 'GET', headers: options.headers }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    });
    request.on('error', reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

function multipart(filename, content) {
  const boundary = `----dms-${Date.now()}`;
  const body = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: text/plain\r\n\r\n${content}\r\n--${boundary}--\r\n`
  );
  return {
    body,
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length }
  };
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  port = server.address().port;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  const files = await fs.readdir(config.storageDirectory);
  await Promise.all(files.filter((file) => file !== '.gitkeep').map((file) => fs.unlink(path.join(config.storageDirectory, file))));
});

test('GET /health responde com status operacional', async () => {
  const response = await request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
});

test('POST /upload rejeita requisição sem arquivo', async () => {
  const response = await request('/upload', { method: 'POST' });
  assert.equal(response.status, 400);
  assert.equal(JSON.parse(response.body).error, 'O arquivo é obrigatório.');
});

test('POST /upload cria metadados e arquivo físico', async () => {
  const response = await request('/upload', { method: 'POST', ...multipart('relatorio.txt', 'conteudo seguro') });
  const metadata = JSON.parse(response.body);
  const files = await fs.readdir(config.storageDirectory);

  assert.equal(response.status, 201);
  assert.equal(metadata.originalName, 'relatorio.txt');
  assert.equal(metadata.size, 15);
  assert.equal(metadata.owner, 'default-user');
  assert.match(metadata.id, /^[0-9a-f-]{36}$/i);
  assert.equal(files.length, 2);
  return metadata;
});

test('GET /documents lista os documentos enviados', async () => {
  const response = await request('/documents');
  const documents = JSON.parse(response.body);

  assert.equal(response.status, 200);
  assert.equal(documents.length, 1);
  assert.equal(documents[0].originalName, 'relatorio.txt');
});

test('GET /documents/:id/download baixa o conteúdo do documento', async () => {
  const documents = JSON.parse((await request('/documents')).body);
  const response = await request(`/documents/${documents[0].id}/download`);

  assert.equal(response.status, 200);
  assert.equal(response.body.toString(), 'conteudo seguro');
  assert.match(response.headers['content-disposition'], /relatorio\.txt/);
});

test('GET /documents/:id/download rejeita ID inexistente', async () => {
  const response = await request('/documents/not-an-id/download');
  assert.equal(response.status, 400);
});
