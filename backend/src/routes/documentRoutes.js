const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

const storageDirectory = path.resolve(__dirname, '../../storage');
fs.mkdirSync(storageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: storageDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 10 * 1024 * 1024)
  }
});
const repository = new DocumentRepository(storageDirectory);
const service = new DocumentService(repository);
const controller = new DocumentController(service);
const router = express.Router();

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;