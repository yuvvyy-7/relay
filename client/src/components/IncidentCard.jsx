import React from 'react';

export function IncidentCard({
  task,
  onToggle,
  onDelete,
}) {
  const resolved = task.completed;

  const severity =
    task.title.match(/\[(SEV-[123])\]/)?.[1] || 'SEV-2';

  const severityColors = {
    'SEV-1': '#E5484D',
    'SEV-2': '#FF8C42',
    'SEV-3': '#5B8DEF',
  };

  const cleanTitle = task.title.replace(
    /\[SEV-[123]\]\s*/,
    ''
  );

  return (
    <article
      className="border-b p-5 last:border-b-0"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--bg-panel)',
      }}
    >

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <span
              className="border px-2 py-1 text-[9px] font-semibold"
              style={{
                borderColor: `${severityColors[severity]}66`,
                color: severityColors[severity],
                background: `${severityColors[severity]}12`,
              }}
            >
              {severity}
            </span>

            <span
              className="flex items-center gap-2 text-[9px] uppercase tracking-wider"
              style={{
                color: resolved
                  ? 'var(--green)'
                  : 'var(--text-dim)',
              }}
            >

              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: resolved
                    ? 'var(--green)'
                    : 'var(--amber)',
                }}
              />

              {resolved ? 'Resolved' : 'Investigating'}

            </span>

          </div>

          <h3
            className={`mt-4 text-sm font-medium ${
              resolved ? 'line-through opacity-40' : ''
            }`}
          >
            {cleanTitle}
          </h3>

          <p
            className="mt-2 text-[9px]"
            style={{ color: 'var(--text-faint)' }}
          >
            ID ·{' '}
            {task.clientId?.slice(0, 8) ||
              task._id?.slice(-8)}
          </p>

        </div>

        <div className="flex shrink-0 gap-2">

          <button
            onClick={() => onToggle(task)}
            className="border px-3 py-2 text-[9px] transition hover:text-white"
            style={{
              borderColor: 'var(--line-bright)',
              color: 'var(--text-dim)',
            }}
          >
            {resolved ? 'REOPEN' : 'RESOLVE'}
          </button>

          <button
            onClick={() => onDelete(task)}
            className="border bg-transparent px-3 py-2 text-[9px] transition hover:border-[#E5484D] hover:text-[#E5484D]"
            style={{
              borderColor: 'var(--line-bright)',
              color: 'var(--text-faint)',
            }}
          >
            DELETE
          </button>

        </div>

      </div>

    </article>
  );
}