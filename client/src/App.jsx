import React, { useEffect, useState } from 'react';
import {
  createTask,
  deleteTask,
  getStatus,
  getTasks,
  updateTask,
  syncOperations,
} from './api.js';

import {
  saveTask,
  saveTasks,
  getOperations,
} from './services/localDb.js';

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
  const [pendingOperations, setPendingOperations] = useState(0);

  async function updatePendingOperations() {
    try {
      const operations = await getOperations();
      setPendingOperations(operations.length);
    } catch (error) {
      console.error('Could not read pending operations:', error);
    }
  }

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
            message:
              'Cannot check database because the backend is unavailable.',
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

      const cacheableTasks = nextTasks.filter(
        (task) => task.clientId
      );

      await saveTasks(cacheableTasks);
    } catch (nextError) {
      setTasksError(nextError.message);
    }
  }

  async function loadData() {
    try {
      await Promise.all([
        loadHealth(),
        loadTasks(),
        updatePendingOperations(),
      ]);
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
          await updatePendingOperations();
        } else {
          await updatePendingOperations();
        }

        setStatus(currentStatus);
      } catch {
        // Backend is still unavailable.
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

    await updatePendingOperations();

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

    await updatePendingOperations();
  }

  async function handleDelete(task) {
    await deleteTask(
      task._id || task.clientId,
      task
    );

    setTasks((current) =>
      current.filter(
        (item) => item.clientId !== task.clientId
      )
    );

    await updatePendingOperations();
  }

  const system = status?.system || 'UNKNOWN';

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* NAVBAR */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400 text-sm font-black text-zinc-950">
              R
            </div>

            <span className="font-semibold tracking-tight">
              RELAY
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                system === 'HEALTHY'
                  ? 'bg-emerald-400'
                  : system === 'RECOVERING'
                    ? 'bg-sky-400'
                    : system === 'DEGRADED'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
              }`}
            />

            <span className="text-xs font-medium text-zinc-400">
              {system}
            </span>
          </div>
        </nav>

        {/* HERO */}
        <section className="pb-14 pt-20 lg:pt-28">
          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Autonomous resilience layer
            </div>

            <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Your system shouldn't stop
              <span className="text-emerald-400">
                {' '}because a dependency does.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
              RELAY detects dependency failures, keeps the application
              running locally, queues operations safely, and
              automatically synchronizes everything when the system
              recovers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  CURRENT STATE
                </p>

                <p className="mt-1 font-semibold text-white">
                  {loading ? 'Checking...' : system}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  QUEUED OPERATIONS
                </p>

                <p className="mt-1 font-semibold text-white">
                  {pendingOperations}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/[0.07] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* LIVE SYSTEM */}
        <section className="space-y-4">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
                Live system
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Resilience monitor
              </h2>
            </div>

            <span className="text-xs text-zinc-600">
              Auto-refreshing every 2s
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <StatusPanel
              status={status}
              loading={loading}
              pendingOperations={pendingOperations}
            />

            <DependencyCards status={status} />
          </div>
        </section>

        {/* TASK AREA */}
        <section className="mt-16">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
              Application
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Keep working
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Tasks continue to work even when the database doesn't.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <TaskForm onCreate={handleCreate} />

            <TaskList
              tasks={tasks}
              loading={loading}
              error={tasksError}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-20 border-t border-zinc-900 pt-12">

          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
              Failure response
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Built to survive failure.
            </h2>

            <p className="mt-3 text-zinc-500">
              RELAY doesn't wait for a human to restart the system.
              It adapts, preserves the user's work, and repairs the
              connection when possible.
            </p>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-5">

            {[
              ['01', 'DETECT', 'Identify dependency failure'],
              ['02', 'FALLBACK', 'Switch to local persistence'],
              ['03', 'QUEUE', 'Safely preserve operations'],
              ['04', 'RECOVER', 'Detect dependency restoration'],
              ['05', 'SYNC', 'Reconcile queued changes'],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="bg-zinc-950 p-5"
              >
                <p className="text-xs font-mono text-emerald-400">
                  {number}
                </p>

                <h3 className="mt-8 text-sm font-semibold">
                  {title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  {description}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* ARCHITECTURE - MOVED TO BOTTOM */}
        <footer className="mt-20 border-t border-zinc-900 py-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
                Architecture
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                React · Express · MongoDB · IndexedDB
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-700">
                RELAY
              </p>

              <p className="mt-1 text-xs text-zinc-700">
                Built for systems that keep going.
              </p>
            </div>

          </div>

        </footer>

      </div>
    </main>
  );
}