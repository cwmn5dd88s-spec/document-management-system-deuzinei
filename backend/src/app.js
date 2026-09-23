const express = require('express');
const config = require('./config');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(express.json());
app.use(documentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'O arquivo excede o tamanho máximo permitido.' });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Envie um único arquivo no campo file.' });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Erro interno do servidor.' : error.message;
  return res.status(statusCode).json({ error: message });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DMS backend ouvindo na porta ${config.port}`);
  });
}

module.exports = app;
