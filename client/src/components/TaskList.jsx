import React from 'react';

export function TaskList({ tasks, loading, error, onToggle, onDelete }) {
  return (
    <section className="border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Tasks</h2>
        <span className="text-sm text-zinc-400">{tasks.length} saved</span>
      </div>

      <div className="mt-4 divide-y divide-zinc-800 border border-zinc-800">
        {loading ? <p className="p-4 text-sm text-zinc-400">Loading tasks...</p> : null}
        {error ? <p className="p-4 text-sm text-amber-300">Tasks unavailable: {error}</p> : null}

        {!loading && !error && tasks.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">No tasks yet.</p>
        ) : null}

        {tasks.map((task) => (
          <article key={task._id} className="flex items-center gap-3 bg-zinc-950 p-4">
            <input
              className="h-5 w-5 accent-emerald-400"
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
              aria-label={`Toggle ${task.title}`}
            />
            <div className="min-w-0 flex-1">
              <p className={`break-words text-sm font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                {task.title}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Saved in MongoDB</p>
            </div>
            <button
              className="border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-red-400 hover:text-red-300"
              type="button"
              onClick={() => onDelete(task)}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
