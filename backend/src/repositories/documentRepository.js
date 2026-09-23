const fs = require('node:fs/promises');
const path = require('node:path');

class DocumentRepository {
  constructor(storageDirectory) {
    this.storageDirectory = path.resolve(storageDirectory);
    this.documents = new Map();
  }

  async create(document, storedFileName) {
    const record = { ...document, storedFileName };
    this.assertSafeStoredFileName(storedFileName);
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

  getFilePathById(id) {
    const document = this.documents.get(id);
    return document ? this.getFilePath(document.storedFileName) : null;
  }

  async fileExistsById(id) {
    const filePath = this.getFilePathById(id);
    if (!filePath) return false;

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async removeFileByName(storedFileName) {
    try {
      await fs.unlink(this.getFilePath(storedFileName));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  getFilePath(storedFileName) {
    this.assertSafeStoredFileName(storedFileName);
    const filePath = path.resolve(this.storageDirectory, storedFileName);
    const storagePrefix = `${this.storageDirectory}${path.sep}`;

    if (!filePath.startsWith(storagePrefix)) {
      throw new Error('Nome físico de arquivo inválido.');
    }

    return filePath;
  }

  assertSafeStoredFileName(storedFileName) {
    if (!storedFileName || storedFileName !== path.basename(storedFileName)) {
      throw new Error('Nome físico de arquivo inválido.');
    }
  }

  toMetadata(document) {
    const { storedFileName, ...metadata } = document;
    return metadata;
  }
}

module.exports = DocumentRepository;
