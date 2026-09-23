const API_PREFIX = '/api';

async function parseResponse(response) {
  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';

    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      // Mantém a mensagem padrão quando a API não retorna JSON.
    }

    throw new Error(message);
  }

  return response;
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`);
  await parseResponse(response);
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });
  await parseResponse(response);
  return response.json();
}

export async function downloadDocument(id) {
  const response = await fetch(`${API_PREFIX}/documents/${encodeURIComponent(id)}/download`);
  await parseResponse(response);
  return response.blob();
}
