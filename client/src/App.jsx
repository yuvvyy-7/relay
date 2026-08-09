import React, { useEffect, useState } from 'react';
import {
  createTask,
  deleteTask,
  getStatus,
  getTasks,
  updateTask,
  syncOperations,
} from './api.js';

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

      // Keep a local copy for offline use.
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

    setTasks((current) => [
      task,
      ...current,
    ]);

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
        item.clientId === task.clientId
          ? updated
          : item
      )
    );
  }

  async function handleDelete(task) {
    await deleteTask(
      task._id || task.clientId,
      task
    );

    setTasks((current) =>
      current.filter(
        (item) =>
          item.clientId !== task.clientId
      )
    );
  }

  /*
   * MongoDB controls the primary path.
   *
   * When MongoDB is healthy:
   * MongoDB = glowing primary
   *
   * When MongoDB fails:
   * MongoDB = dim
   * RELAY = active
   * IDB = glowing fallback
   */
  const databaseHealthy =
    status?.dependencies?.database?.status ===
    'HEALTHY';

  const system =
    status?.system ||
    status?.mode ||
    'UNKNOWN';

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex items-center justify-between border-b border-[var(--line)] py-5">

          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2"
              style={{
                background: 'var(--amber)',
                boxShadow:
                  '0 0 12px rgba(255,140,66,.5)',
              }}
            />

            <span
              className="font-mono text-xs font-medium uppercase tracking-[0.2em]"
              style={{
                color: 'var(--text)',
              }}
            >
              RELAY
            </span>
          </div>

          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{
              color: 'var(--text-faint)',
            }}
          >
            Autonomous Resilience Layer
          </span>

        </header>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="py-16 sm:py-20">

          <div
            className="mb-5 inline-flex border px-3 py-2"
            style={{
              borderColor:
                'rgba(255,140,66,.3)',
              background:
                'rgba(255,140,66,.04)',
            }}
          >
            <span
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{
                color: 'var(--amber)',
              }}
            >
              Autonomous Resilience Layer
            </span>
          </div>


          <h1
            className="max-w-4xl font-bold"
            style={{
              color: 'var(--text)',
            }}
          >
            Systems fail.
            <br />

            <span
              style={{
                color: 'var(--amber)',
              }}
            >
              RELAY doesn't.
            </span>
          </h1>


          <p
            className="mt-7 max-w-2xl text-base leading-7"
            style={{
              color: 'var(--text-dim)',
            }}
          >
            RELAY detects dependency failures, moves
            operations onto local persistence, queues
            changes safely, and synchronizes them
            automatically when infrastructure returns.
          </p>


          {/* =================================================
              RELAY SWITCH DIAGRAM
          ================================================= */}

          <div
            className="mt-10 overflow-x-auto border p-5 sm:p-7"
            style={{
              borderColor:
                'var(--line-bright)',

              background:
                'var(--bg-panel)',
            }}
          >

            {/* Diagram header */}

            <div className="mb-6 flex items-center justify-between">

              <span
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{
                  color: 'var(--text-faint)',
                }}
              >
                MongoDB → Local + IDB
              </span>

              <span
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{
                  color: databaseHealthy
                    ? 'var(--green)'
                    : 'var(--amber)',
                }}
              >
                {databaseHealthy
                  ? 'Primary path active'
                  : 'Fallback active'}
              </span>

            </div>


            {/* Diagram */}

            <div className="flex min-w-[680px] items-center">

              {/* =================================================
                  MONGODB PRIMARY
              ================================================= */}

              <div
                className={`w-48 border p-4 transition-all duration-500 ${
                  databaseHealthy
                    ? 'relay-glow'
                    : 'opacity-40'
                }`}
                style={{
                  borderColor:
                    databaseHealthy
                      ? 'rgba(95,227,166,.55)'
                      : 'var(--line-bright)',

                  background:
                    databaseHealthy
                      ? 'var(--green-dim)'
                      : 'rgba(255,255,255,.01)',
                }}
              >

                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      databaseHealthy
                        ? 'var(--green)'
                        : 'var(--text-faint)',
                  }}
                >
                  Primary
                </div>

                <div
                  className="mt-2 text-lg font-semibold"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  MongoDB
                </div>

                <div
                  className="mt-2 font-mono text-[10px]"
                  style={{
                    color:
                      databaseHealthy
                        ? 'var(--green)'
                        : 'var(--text-faint)',
                  }}
                >
                  {databaseHealthy
                    ? '● connected'
                    : '● unavailable'}
                </div>

              </div>


              {/* =================================================
                  MONGODB → RELAY TRACK
              ================================================= */}

              <div
                className="mx-3 h-px w-20 border-t border-dashed transition-all duration-500"
                style={{
                  borderColor:
                    databaseHealthy
                      ? 'var(--green)'
                      : 'var(--line-bright)',

                  opacity:
                    databaseHealthy
                      ? 1
                      : 0.3,

                  boxShadow:
                    databaseHealthy
                      ? '0 0 8px rgba(95,227,166,.2)'
                      : 'none',
                }}
              />


              {/* =================================================
                  RELAY SWITCH
              ================================================= */}

              <div
                className="relay-amber-glow relative w-48 border p-4"
                style={{
                  borderColor:
                    'var(--amber)',

                  background:
                    'var(--amber-dim)',
                }}
              >

                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      'var(--amber)',
                  }}
                >
                  Switching layer
                </div>

                <div
                  className="mt-2 text-lg font-semibold"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  R / RELAY
                </div>

                <div
                  className="mt-2 font-mono text-[10px]"
                  style={{
                    color:
                      'var(--text-dim)',
                  }}
                >
                  {databaseHealthy
                    ? 'primary → normal'
                    : 'failure → fallback'}
                </div>

              </div>


              {/* =================================================
                  RELAY → IDB TRACK
              ================================================= */}

              <div
                className="mx-3 h-px flex-1 border-t border-dashed"
                style={{
                  borderColor:
                    'var(--green)',

                  boxShadow:
                    '0 0 8px rgba(95,227,166,.25)',
                }}
              />


              {/* =================================================
                  IDB FALLBACK
              ================================================= */}

              <div
                className="relay-glow w-48 border p-4"
                style={{
                  borderColor:
                    'rgba(95,227,166,.55)',

                  background:
                    'var(--green-dim)',
                }}
              >

                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      'var(--green)',
                  }}
                >
                  Fallback
                </div>

                <div
                  className="mt-2 text-lg font-semibold"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  IDB / Local
                </div>

                <div
                  className="mt-2 font-mono text-[10px]"
                  style={{
                    color:
                      'var(--green)',
                  }}
                >
                  ● ready
                </div>

              </div>

            </div>


            {/* Diagram explanation */}

            <p
              className="mt-6 max-w-4xl font-mono text-[11px] leading-5"
              style={{
                color:
                  'var(--text-faint)',
              }}
            >
              {databaseHealthy
                ? 'MongoDB is healthy. RELAY routes operations through the primary database while keeping IndexedDB ready as a local fallback.'
                : 'MongoDB is unavailable. RELAY has switched operations to IndexedDB so the application can continue working.'}
            </p>

          </div>


          {/* =================================================
              HERO METRICS
          ================================================= */}

          <div
            className="mt-3 grid max-w-3xl grid-cols-2 border"
            style={{
              borderColor: 'var(--line)',
            }}
          >

            <div
              className="border-r p-5"
              style={{
                borderColor:
                  'var(--line)',
              }}
            >

              <div
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{
                  color:
                    'var(--text-faint)',
                }}
              >
                System state
              </div>

              <div
                className="mt-3 text-xl font-semibold"
                style={{
                  color:
                    system === 'HEALTHY'
                      ? 'var(--green)'
                      : system === 'RECOVERING'
                        ? 'var(--blue)'
                        : system === 'DEGRADED'
                          ? 'var(--amber)'
                          : 'var(--danger)',
                }}
              >
                {loading
                  ? 'CHECKING'
                  : system}
              </div>

            </div>


            <div className="p-5">

              <div
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{
                  color:
                    'var(--text-faint)',
                }}
              >
                Primary
              </div>

              <div
                className="mt-3 text-xl font-semibold"
                style={{
                  color:
                    databaseHealthy
                      ? 'var(--green)'
                      : 'var(--amber)',
                }}
              >
                {databaseHealthy
                  ? 'MONGODB'
                  : 'IDB / LOCAL'}
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error ? (
          <div
            className="mb-6 border px-4 py-3 text-sm"
            style={{
              borderColor:
                'rgba(229,72,77,.4)',

              background:
                'rgba(229,72,77,.08)',

              color: '#ffb4b6',
            }}
          >
            {error}
          </div>
        ) : null}


        {/* =====================================================
            SYSTEM STATUS
        ===================================================== */}

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">

          <StatusPanel
            status={status}
            loading={loading}
          />

          <DependencyCards
            status={status}
          />

        </section>


        {/* =====================================================
            TASK / OPERATION AREA
        ===================================================== */}

        <section className="mt-12 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">

          <TaskForm
            onCreate={handleCreate}
          />

          <TaskList
            tasks={tasks}
            loading={loading}
            error={tasksError}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />

        </section>


        {/* =====================================================
    ARCHITECTURE / EXPLANATION
===================================================== */}

<section className="architecture-footer">

  <div className="architecture-inner">

    <div>
      <div className="architecture-label">
        Architecture
      </div>

      <div className="architecture-stack">
        React · Express · MongoDB · IndexedDB
      </div>
    </div>

    <div className="architecture-brand">
      <div className="architecture-name">
        RELAY
      </div>

      <div className="architecture-tagline">
        Built for systems that keep going.
      </div>
    </div>

  </div>

</section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="border-t py-8"
          style={{
            borderColor:
              'var(--line)',
          }}
        >

          <div className="flex flex-col justify-between gap-3 sm:flex-row">

            <span
              className="font-mono text-[10px] uppercase tracking-[0.15em]"
              style={{
                color:
                  'var(--text-faint)',
              }}
            >
              RELAY · Autonomous Resilience Layer
            </span>

            <span
              className="font-mono text-[10px]"
              style={{
                color:
                  'var(--text-faint)',
              }}
            >
              MongoDB · IndexedDB · Express · React
            </span>

          </div>

        </footer>

      </div>
    </main>
  );
}