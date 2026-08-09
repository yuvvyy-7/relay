import React from 'react';

export function StatusPanel({
  status,
  loading,
  pendingOperations = 0,
}) {
  const system = status?.system || status?.mode || 'UNKNOWN';

  const config = {
    HEALTHY: {
      color: 'var(--green)',
      label: 'Operational',
      message: 'All monitored dependencies are responding normally.',
    },

    DEGRADED: {
      color: 'var(--amber)',
      label: 'Degraded',
      message: 'Primary infrastructure is unavailable. Local fallback is active.',
    },

    RECOVERING: {
      color: 'var(--blue)',
      label: 'Recovering',
      message: 'Infrastructure restored. RELAY is synchronizing pending work.',
    },

    FAILED: {
      color: 'var(--danger)',
      label: 'Failed',
      message: 'The backend is unavailable.',
    },

    UNKNOWN: {
      color: 'var(--text-faint)',
      label: 'Unknown',
      message: 'Waiting for the health monitor.',
    },
  };

  const current = config[system] || config.UNKNOWN;

  return (
    <section
      className="border p-6"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--bg-panel)',
      }}
    >

      <div className="flex items-start justify-between">

        <div>

          <div
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-faint)' }}
          >

            <span
              className="relay-pulse h-2 w-2"
              style={{
                background: current.color,
                boxShadow: `0 0 12px ${current.color}`,
              }}
            />

            System status

          </div>

          <h2
            className="mt-5 text-4xl font-semibold"
            style={{ color: current.color }}
          >
            {loading ? 'CHECKING' : system}
          </h2>

        </div>

        <div
          className="border px-3 py-2 text-right"
          style={{
            borderColor: 'var(--line)',
            background: 'var(--bg-panel-raised)',
          }}
        >

          <div
            className="text-[9px] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            Queue
          </div>

          <div className="mt-1 text-sm">
            {pendingOperations}
          </div>

        </div>

      </div>

      <div
        className="mt-8 border-t pt-5"
        style={{ borderColor: 'var(--line)' }}
      >

        <p
          className="text-xs leading-6"
          style={{ color: 'var(--text-dim)' }}
        >
          {current.message}
        </p>

      </div>

    </section>
  );
}