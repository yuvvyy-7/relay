import React from 'react';

export function IncidentCard({ task, onToggle, onDelete }) {
  const resolved = task.completed;

  const severity = task.title.match(/\[(SEV-[123])\]/)?.[1] || 'SEV-2';

  const severityStyle = {
    'SEV-1': 'border-red-500/30 bg-red-500/10 text-red-300',
    'SEV-2': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    'SEV-3': 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  };

  const cleanTitle = task.title.replace(/\[SEV-[123]\]\s*/, '');

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider ${severityStyle[severity]}`}
            >
              {severity}
            </span>

            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {resolved ? 'Resolved' : 'Investigating'}
            </span>
          </div>

          <h3
            className={`mt-3 text-sm font-medium ${
              resolved ? 'text-zinc-600 line-through' : 'text-zinc-200'
            }`}
          >
            {cleanTitle}
          </h3>

          <p className="mt-2 text-xs text-zinc-700">
            Incident ID · {task.clientId?.slice(0, 8) || task._id?.slice(-8)}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onToggle(task)}
            className="rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white"
          >
            {resolved ? 'Reopen' : 'Resolve'}
          </button>

          <button
            onClick={() => onDelete(task)}
            className="rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-600 hover:border-red-900 hover:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}