import React from 'react';

export function StatusPanel({ status, loading }) {
  const system = status?.system || status?.mode;
  const statusStyles = {
    HEALTHY: 'text-emerald-300 bg-emerald-400',
    DEGRADED: 'text-amber-300 bg-amber-300',
    RECOVERING: 'text-sky-300 bg-sky-300',
    FAILED: 'text-red-300 bg-red-400',
  };
  const style = statusStyles[system] || 'text-zinc-300 bg-zinc-500';

  return (
    <section className="border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">System status</p>
          <h2 className={`mt-3 text-4xl font-bold tracking-normal ${style.split(' ')[0]}`}>
            {loading ? 'CHECKING' : system || 'UNKNOWN'}
          </h2>
        </div>
        <span className={`h-4 w-4 ${style.split(' ')[1]}`} aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm leading-6 text-zinc-400">
        Health is checked every 2 seconds from the browser through the backend.
      </p>
    </section>
  );
}
