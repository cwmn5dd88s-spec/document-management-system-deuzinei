const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const config = require('../config');
const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

fs.mkdirSync(config.storageDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: config.storageDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = /^[.][a-z0-9]{1,10}$/.test(extension) ? extension : '';
    callback(null, `${crypto.randomUUID()}${safeExtension}`);
  }
});
const upload = multer({ storage, limits: { fileSize: config.maxUploadSize } });
const repository = new DocumentRepository(config.storageDirectory);
const service = new DocumentService(repository);
const controller = new DocumentController(service);
const router = express.Router();

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;
