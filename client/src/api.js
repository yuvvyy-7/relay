const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'http://127.0.0.1:4000');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getStatus() {
  return request('/health');
}

export function getTasks() {
  return request('/tasks');
}

export function createTask(title) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function updateTask(id, completed) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
