import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentApi';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadDocuments() {
      try {
        setDocuments(await listDocuments(controller.signal));
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDocuments();
    return () => controller.abort();
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setSuccessMessage('Documento enviado com sucesso.');
    setError('');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="brand">DMS / workspace</span>
        <span className="header-status">Armazenamento local ativo</span>
      </header>
      <main>
        <section className="hero">
          <p className="eyebrow">Centro de documentos</p>
          <h1>Seu trabalho, em um só lugar.</h1>
          <p className="hero-copy">Envie, organize e recupere seus arquivos com rapidez.</p>
        </section>
        <div className="workspace">
          <UploadComponent onUploaded={handleUploaded} onError={setError} />
          {successMessage && <p className="state-message">{successMessage}</p>}
          <DocumentList documents={documents} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  );
}
