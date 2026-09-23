const crypto = require('node:crypto');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async createDocument(file) {
    if (!file) {
      const error = new Error('O arquivo é obrigatório.');
      error.statusCode = 400;
      throw error;
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
      await this.documentRepository.removeFile({ ...document, storedFileName: file.filename });
      throw error;
    }
  }

  async listDocuments() {
    return this.documentRepository.findAll();
  }

  async getDocumentDownload(id) {
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      const error = new Error('O identificador do documento é obrigatório.');
      error.statusCode = 400;
      throw error;
    }

    const document = await this.documentRepository.findById(id);
    if (!document) {
      const error = new Error('Documento não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (!(await this.documentRepository.fileExistsById(id))) {
      const error = new Error('Arquivo do documento não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return {
      metadata: document,
      filePath: this.documentRepository.getFilePathById(id)
    };
  }
}

module.exports = DocumentService;