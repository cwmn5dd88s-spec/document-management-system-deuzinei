import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ onUploaded, onError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      onError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    onError('');

    try {
      const document = await uploadDocument(selectedFile);
      setSelectedFile(null);
      inputRef.current.value = '';
      onUploaded(document);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Adicionar arquivo</p>
        <h2>Envie um documento</h2>
        <p className="muted">Arquivos ficam disponíveis para sua equipe assim que o envio terminar.</p>
      </div>
      <div className="upload-controls">
        <label className="file-picker">
          <span>{selectedFile ? selectedFile.name : 'Escolher arquivo'}</span>
          <input
            ref={inputRef}
            type="file"
            onChange={(event) => setSelectedFile(event.target.files[0] || null)}
            disabled={isUploading}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </div>
    </form>
  );
}
