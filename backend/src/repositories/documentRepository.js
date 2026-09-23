const fs = require('node:fs/promises');
const path = require('node:path');

class DocumentRepository {
  constructor(storageDirectory) {
    this.storageDirectory = storageDirectory;
    this.documents = new Map();
  }

  async create(document, storedFileName) {
    const record = { ...document, storedFileName };
    this.documents.set(record.id, record);
    return this.toMetadata(record);
  }

  async findAll() {
    return Array.from(this.documents.values(), (document) => this.toMetadata(document));
  }

  async findById(id) {
    const document = this.documents.get(id);
    return document ? this.toMetadata(document) : null;
  }

  getFilePath(document) {
    return path.join(this.storageDirectory, document.storedFileName);
  }

  getFilePathById(id) {
    const document = this.documents.get(id);
    return document ? this.getFilePath(document) : null;
  }

  async fileExistsById(id) {
    const filePath = this.getFilePathById(id);
    if (!filePath) {
      return false;
    }

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async removeFile(document) {
    await fs.unlink(this.getFilePath(document));
  }

  toMetadata(document) {
    const { storedFileName, ...metadata } = document;
    return metadata;
  }
}

module.exports = DocumentRepository;