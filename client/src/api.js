import {
  saveTask,
  saveTasks,
  getTasks as getLocalTasks,
  deleteTask as deleteLocalTask,
  addOperation,
  getOperations,
  removeOperation,
} from './services/localDb.js';

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

export async function getTasks() {
  try {
    const tasks = await request('/tasks');

    await saveTasks(tasks);

    return tasks;
  } catch (error) {
    console.warn('MongoDB unavailable. Loading local tasks.');

    const localTasks = await getLocalTasks();

    if (localTasks.length > 0) {
      return localTasks;
    }

    throw error;
  }
}

export async function createTask(title, clientId) {
  try {
    const task = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        clientId,
      }),
    });

    await saveTask(task);

    return task;
  } catch (error) {
    console.warn('MongoDB unavailable. Creating task locally.');

    const task = {
      clientId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: true,
    };

    await saveTask(task);

    await addOperation({
      type: 'CREATE',
      clientId,
      data: task,
    });

    return task;
  }
}

export async function updateTask(id, completed, task = null) {
  try {
    const updated = await request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        completed,
      }),
    });

    await saveTask(updated);

    return updated;
  } catch (error) {
    console.warn('MongoDB unavailable. Updating task locally.');

    const localTasks = await getLocalTasks();
    const existing = localTasks.find(
      (item) => item._id === id || item.clientId === id
    );

    if (!existing && !task) {
      throw error;
    }

    const updated = {
      ...(existing || task),
      completed,
      updatedAt: new Date().toISOString(),
      offline: true,
    };

    await saveTask(updated);

    await addOperation({
      type: 'UPDATE',
      clientId: updated.clientId,
      mongoId: updated._id || null,
      data: {
        completed,
      },
    });

    return updated;
  }
}

export async function deleteTask(id, task = null) {
  try {
    await request(`/tasks/${id}`, {
      method: 'DELETE',
    });

    if (task?.clientId) {
      await deleteLocalTask(task.clientId);
    }

    return null;
  } catch (error) {
    console.warn('MongoDB unavailable. Deleting task locally.');

    const localTasks = await getLocalTasks();
    const existing =
      localTasks.find(
        (item) => item._id === id || item.clientId === id
      ) || task;

    if (!existing) {
      throw error;
    }

    await deleteLocalTask(existing.clientId);

    await addOperation({
      type: 'DELETE',
      clientId: existing.clientId,
      mongoId: existing._id || null,
    });

    return null;
  }
}

export async function syncOperations() {
  const operations = await getOperations();

  for (const operation of operations) {
    try {
      if (operation.type === 'CREATE') {
        await request('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: operation.data.title,
            clientId: operation.clientId,
          }),
        });
      }

      if (operation.type === 'UPDATE') {
        const id = operation.mongoId || operation.clientId;

        await request(`/tasks/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            completed: operation.data.completed,
          }),
        });
      }

      if (operation.type === 'DELETE') {
        const id = operation.mongoId || operation.clientId;

        await request(`/tasks/${id}`, {
          method: 'DELETE',
        });
      }

      await removeOperation(operation.id);
    } catch (error) {
      console.warn('Sync paused:', error.message);
      break;
    }
  }
}