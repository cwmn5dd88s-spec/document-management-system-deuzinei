class DocumentController {
  constructor(service) {
    this.service = service;
  }

  upload = async (req, res, next) => {
    try {
      res.status(201).json(await this.service.createDocument(req.file));
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      res.json(await this.service.listDocuments());
    } catch (error) {
      next(error);
    }
  };

  download = async (req, res, next) => {
    try {
      const { metadata, filePath } = await this.service.getDocumentDownload(req.params.id);
      res.download(filePath, metadata.originalName, (error) => {
        if (error && !res.headersSent) next(error);
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DocumentController;
