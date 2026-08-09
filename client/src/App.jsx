import React, { useEffect, useState } from 'react';
import { createTask, deleteTask, getStatus, getTasks, updateTask, syncOperations } from './api.js';
import { saveTask, saveTasks } from './services/localDb.js';
import { DependencyCards } from './components/DependencyCards.jsx';
import { StatusPanel } from './components/StatusPanel.jsx';
import { TaskForm } from './components/TaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';

export default function App() {
  const [status, setStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [tasksError, setTasksError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadHealth() {
    try {
      setError('');
      const nextStatus = await getStatus();
      setStatus(nextStatus);
    } catch (nextError) {
      setStatus({
        system: 'FAILED',
        dependencies: {
          backend: {
            name: 'Backend',
            status: 'FAILED',
            message: 'Express API is not responding.',
          },
          database: {
            name: 'MongoDB',
            status: 'UNKNOWN',
            message: 'Cannot check database because the backend is unavailable.',
          },
        },
      });
      setError('Backend health check failed.');
    }
  }

  async function loadTasks() {
  try {
    setTasksError('');

    const nextTasks = await getTasks();

    setTasks(nextTasks);

    // Keep a local copy for future offline use.
    const cacheableTasks = nextTasks.filter((task) => task.clientId);

    await saveTasks(cacheableTasks);
  } catch (nextError) {
    setTasksError(nextError.message);
  }
}

  async function loadData() {
    try {
      await Promise.all([loadHealth(), loadTasks()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const healthTimer = window.setInterval(async () => {
      await loadHealth();

      try {
        const currentStatus = await getStatus();

        if (
          currentStatus.system === 'RECOVERING' ||
          currentStatus.system === 'HEALTHY'
        ) {
          await syncOperations();
          await loadTasks();
        }

        setStatus(currentStatus);
      } catch {
        // Still unavailable.
      }
    }, 2000);

    return () => {
      window.clearInterval(healthTimer);
    };
  }, []);

  async function handleCreate(title) {
  const clientId = crypto.randomUUID();

  const task = await createTask(title, clientId);

  await saveTask(task);

  setTasks((current) => [task, ...current]);

  try {
    setStatus(await getStatus());
  } catch {
    // Health monitor will update itself.
  }
}

  async function handleToggle(task) {
  const updated = await updateTask(
    task._id || task.clientId,
    !task.completed,
    task
  );

  setTasks((current) =>
    current.map((item) =>
      item.clientId === task.clientId ? updated : item
    )
  );
}

  async function handleDelete(task) {
  await deleteTask(task._id || task.clientId, task);

  setTasks((current) =>
    current.filter((item) => item.clientId !== task.clientId)
  );
}

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-2 border-b border-zinc-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">RELAY</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Resilient Task Console
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            Foundation build: React, Express, MongoDB, and basic task CRUD.
          </p>
        </header>

        {error ? (
          <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <StatusPanel status={status} loading={loading} />
          <DependencyCards status={status} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <TaskForm onCreate={handleCreate} />
          <TaskList
            tasks={tasks}
            loading={loading}
            error={tasksError}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  );
}
