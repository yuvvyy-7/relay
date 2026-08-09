import React from 'react';

export function ResilienceTimeline({ status, pendingOperations }) {
  const recovering = status?.system === 'RECOVERING';
  const degraded = status?.system === 'DEGRADED';

  return (
    <section className="mt-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
          Autonomous recovery
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          What happens when something fails?
        </h2>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-5">
        {[
          ['01', 'DETECT', 'Dependency failure detected'],
          ['02', 'FALLBACK', 'Local persistence takes over'],
          ['03', 'QUEUE', `${pendingOperations} operation(s) waiting`],
          ['04', 'RECOVER', 'Dependency becomes available'],
          ['05', 'SYNC', 'Queued changes are reconciled'],
        ].map(([number, title, description], index) => {
          const active =
            (degraded && index < 3) ||
            (recovering && index < 5);

          return (
            <div
              key={number}
              className={`rounded-xl border p-5 transition ${
                active
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <span
                className={`text-xs font-mono ${
                  active ? 'text-emerald-400' : 'text-zinc-700'
                }`}
              >
                {number}
              </span>

              <h3 className="mt-6 text-sm font-semibold">
                {title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}