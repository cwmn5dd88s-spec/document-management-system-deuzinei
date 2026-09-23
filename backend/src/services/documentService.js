const crypto = require('node:crypto');

const DOCUMENT_ID_PATTERN = /^[0-9a-f-]{36}$/i;

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async createDocument(file) {
    this.validateFile(file);
    const document = this.createMetadata(file);

    try {
      return await this.documentRepository.create(document, file.filename);
    } catch (error) {
      await this.documentRepository.removeFile({ ...document, storedFileName: file.filename });
      throw error;
    }
  }

  async listDocuments() {
    return this.documentRepository.findAll();
  }

  async getDocumentDownload(id) {
    this.validateDocumentId(id);
    const document = await this.findDocumentOrThrow(id);
    await this.ensureFileExists(id);

    return {
      metadata: document,
      filePath: this.documentRepository.getFilePathById(id)
    };
  }

  validateFile(file) {
    if (!file) {
      throw createServiceError('O arquivo é obrigatório.', 400);
    }
  }

  validateDocumentId(id) {
    if (!id || !DOCUMENT_ID_PATTERN.test(id)) {
      throw createServiceError('O identificador do documento é obrigatório.', 400);
    }
  }

  createMetadata(file) {
    return {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default-user'
    };
  }

  async findDocumentOrThrow(id) {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createServiceError('Documento não encontrado.', 404);
    }

    return document;
  }

  async ensureFileExists(id) {
    if (!(await this.documentRepository.fileExistsById(id))) {
      throw createServiceError('Arquivo do documento não encontrado.', 404);
    }
  }
}

module.exports = DocumentService;