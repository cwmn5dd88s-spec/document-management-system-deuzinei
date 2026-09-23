import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, isLoading, error }) {
  return (
    <section className="documents-section" aria-labelledby="documents-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2 id="documents-heading">Seus documentos</h2>
        </div>
        <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
      </div>

      {isLoading && <p className="state-message">Carregando documentos...</p>}
      {!isLoading && error && <p className="state-message error-message">{error}</p>}
      {!isLoading && !error && documents.length === 0 && (
        <p className="state-message">Nenhum documento enviado ainda.</p>
      )}
      {!isLoading && !error && documents.length > 0 && (
        <div className="document-table" role="table" aria-label="Documentos enviados">
          <div className="table-row table-header" role="row">
            <span role="columnheader">Nome</span>
            <span role="columnheader">Tamanho</span>
            <span role="columnheader">Enviado em</span>
            <span role="columnheader">Proprietário</span>
            <span role="columnheader">Ação</span>
          </div>
          {documents.map((document) => (
            <div className="table-row" role="row" key={document.id}>
              <strong title={document.originalName}>{document.originalName}</strong>
              <span>{formatFileSize(document.size)}</span>
              <span>{formatDate(document.uploadedAt)}</span>
              <span>{document.owner}</span>
              <DownloadButton document={document} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
