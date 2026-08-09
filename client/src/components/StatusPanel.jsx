import React from 'react';

export function StatusPanel({
  status,
  loading,
  pendingOperations = 0,
}) {
  const system = status?.system || status?.mode;

  const statusStyles = {
    HEALTHY: {
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'SYSTEM OPERATIONAL',
    },

    DEGRADED: {
      text: 'text-amber-300',
      dot: 'bg-amber-300',
      label: 'FAILURE DETECTED',
    },

    RECOVERING: {
      text: 'text-sky-300',
      dot: 'bg-sky-300',
      label: 'RECOVERY IN PROGRESS',
    },

    FAILED: {
      text: 'text-red-300',
      dot: 'bg-red-400',
      label: 'SYSTEM OFFLINE',
    },
  };

  const current = statusStyles[system] || {
    text: 'text-zinc-300',
    dot: 'bg-zinc-500',
    label: 'CHECKING SYSTEM',
  };

  const isRecovering = system === 'RECOVERING';

  return (
    <section className="border border-zinc-800 bg-zinc-900/70 p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            System status
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${current.dot} ${
                isRecovering ? 'animate-pulse' : ''
              }`}
              aria-hidden="true"
            />

            <h2
              className={`text-4xl font-bold tracking-tight ${current.text}`}
            >
              {loading ? 'CHECKING' : system || 'UNKNOWN'}
            </h2>
          </div>

          <p className={`mt-2 text-sm ${current.text}`}>
            {loading ? 'Checking dependencies...' : current.label}
          </p>
        </div>

        <div className="min-w-[120px] border-l border-zinc-800 pl-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Pending
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {pendingOperations}
          </p>

          <p className="text-xs text-zinc-600">
            operations
          </p>
        </div>
      </div>

      {isRecovering && (
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sky-300">
                Restoring system
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Synchronizing local operations with MongoDB
              </p>
            </div>

            <span className="text-xs font-medium text-sky-400">
              ACTIVE
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/3 animate-[recovery_1.5s_ease-in-out_infinite] rounded-full bg-sky-400" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="text-sky-300">
              ● Reconnected
            </div>

            <div className="text-sky-300">
              ● Syncing queue
            </div>

            <div className="text-zinc-600">
              ○ Verified
            </div>
          </div>
        </div>
      )}

      {!isRecovering && (
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <p className="text-sm leading-6 text-zinc-400">
            RELAY continuously monitors its dependencies and
            automatically switches to local persistence when the
            database becomes unavailable.
          </p>
        </div>
      )}
    </section>
  );
}