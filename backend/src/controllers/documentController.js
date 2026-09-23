class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload = async (req, res, next) => {
    try {
      const document = await this.documentService.createDocument(req.file);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const documents = await this.documentService.listDocuments();
      res.json(documents);
    } catch (error) {
      next(error);
    }
  };

  download = async (req, res, next) => {
    try {
      const { metadata, filePath } = await this.documentService.getDocumentDownload(req.params.id);
      res.download(filePath, metadata.originalName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DocumentController;