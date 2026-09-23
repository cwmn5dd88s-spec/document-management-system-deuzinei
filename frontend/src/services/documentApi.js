const API_PREFIX = '/api';
const REQUEST_TIMEOUT = 15000;

async function request(path, options = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT);
  const externalSignal = options.signal;
  const abortRequest = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  externalSignal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = 'Não foi possível concluir a operação.';
      try {
        const payload = await response.json();
        message = payload.error || message;
      } catch {
        // Mantém a mensagem padrão para respostas sem JSON.
      }
      throw new Error(message);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError' && timedOut) {
      throw new Error('A operação demorou demais para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortRequest);
  }
}

export async function listDocuments(signal) {
  const response = await request('/documents', { signal });
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await request('/upload', { method: 'POST', body: formData });
  return response.json();
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  return response.blob();
}
