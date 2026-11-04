const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

/**
 * Returns standard headers including optional client-supplied Gemini key.
 */
function getHeaders(customApiKey = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  const key = customApiKey || localStorage.getItem('prepmate_gemini_api_key');
  if (key) {
    headers['X-Gemini-Api-Key'] = key;
  }
  return headers;
}

/**
 * Checks server health and configuration.
 */
export async function fetchServerConfig() {
  const response = await fetch(`${API_BASE}/config`);
  if (!response.ok) {
    throw new Error('Failed to connect to PrepMate backend server.');
  }
  return response.json();
}

/**
 * Generate interview questions based on role, level, type, number.
 */
export async function generateQuestions(payload, customApiKey = null) {
  const response = await fetch(`${API_BASE}/generate-questions`, {
    method: 'POST',
    headers: getHeaders(customApiKey),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to generate interview questions.');
  }

  return response.json();
}

/**
 * Evaluates candidate answer.
 */
export async function evaluateAnswer(payload, customApiKey = null) {
  const response = await fetch(`${API_BASE}/evaluate-answer`, {
    method: 'POST',
    headers: getHeaders(customApiKey),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to evaluate answer.');
  }

  return response.json();
}

/**
 * Evaluates candidate answer with live SSE streaming.
 */
export async function streamEvaluateAnswer(payload, customApiKey, onChunk, onFinal, onError) {
  try {
    const response = await fetch(`${API_BASE}/stream-evaluate-answer`, {
      method: 'POST',
      headers: getHeaders(customApiKey),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Evaluation stream failed to start.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === 'chunk' && onChunk) {
              onChunk(event.text);
            } else if (event.type === 'final' && onFinal) {
              onFinal(event.data);
            } else if (event.type === 'error' && onError) {
              onError(new Error(event.message));
            }
          } catch (e) {
            console.warn('Failed to parse SSE line:', line, e);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    else throw err;
  }
}

/**
 * Generate a model answer with best practices.
 */
export async function generateSampleAnswer(payload, customApiKey = null) {
  const response = await fetch(`${API_BASE}/generate-sample-answer`, {
    method: 'POST',
    headers: getHeaders(customApiKey),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to generate sample answer.');
  }

  return response.json();
}

/**
 * Stream sample answer generation via SSE.
 */
export async function streamSampleAnswer(payload, customApiKey, onChunk, onDone, onError) {
  try {
    const response = await fetch(`${API_BASE}/stream-sample-answer`, {
      method: 'POST',
      headers: getHeaders(customApiKey),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Sample answer stream failed to start.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === 'chunk' && onChunk) {
              onChunk(event.text);
            } else if (event.type === 'done' && onDone) {
              onDone();
            } else if (event.type === 'error' && onError) {
              onError(new Error(event.message));
            }
          } catch (e) {
            console.warn('Failed to parse SSE line:', line, e);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    else throw err;
  }
}

/**
 * Generate comprehensive final interview summary.
 */
export async function generateInterviewSummary(payload, customApiKey = null) {
  const response = await fetch(`${API_BASE}/interview-summary`, {
    method: 'POST',
    headers: getHeaders(customApiKey),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to generate interview summary.');
  }

  return response.json();
}
