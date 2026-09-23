const crypto = require('node:crypto');

const DOCUMENT_ID_PATTERN = /^[0-9a-f-]{36}$/i;

function serviceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class DocumentService {
  constructor(repository) {
    this.repository = repository;
  }

  async createDocument(file) {
    if (!file) throw serviceError('O arquivo é obrigatório.', 400);
    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: 'default-user'
    };

    try {
      return await this.repository.create(document, file.filename);
    } catch (error) {
      await this.repository.removeFileByName(file.filename);
      throw error;
    }
  }

  listDocuments() {
    return this.repository.findAll();
  }

  async getDocumentDownload(id) {
    if (!id || !DOCUMENT_ID_PATTERN.test(id)) {
      throw serviceError('O identificador do documento é inválido.', 400);
    }
    const document = await this.repository.findById(id);
    if (!document) throw serviceError('Documento não encontrado.', 404);
    const filePath = this.repository.getFilePathById(id);
    if (!(await this.repository.fileExistsById(id))) {
      throw serviceError('Arquivo do documento não encontrado.', 404);
    }
    return { metadata: document, filePath };
  }
}

module.exports = DocumentService;
