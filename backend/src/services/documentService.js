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
    if (!file) {
      throw createServiceError('O arquivo é obrigatório.', 400);
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default-user'
    };

    try {
      return await this.documentRepository.create(document, file.filename);
    } catch (error) {
      await this.documentRepository.removeFileByName(file.filename);
      throw error;
    }
  }

  async listDocuments() {
    return this.documentRepository.findAll();
  }

  async getDocumentDownload(id) {
    if (!id || !DOCUMENT_ID_PATTERN.test(id)) {
      throw createServiceError('O identificador do documento é inválido.', 400);
    }

    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createServiceError('Documento não encontrado.', 404);
    }

    const filePath = this.documentRepository.getFilePathById(id);
    if (!(await this.documentRepository.fileExistsById(id))) {
      throw createServiceError('Arquivo do documento não encontrado.', 404);
    }

    return { metadata: document, filePath };
  }
}

module.exports = DocumentService;
