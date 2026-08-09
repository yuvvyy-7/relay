import React, { useState } from 'react';

export function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle || saving) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await onCreate(nextTitle);

      setTitle('');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-zinc-800 bg-zinc-900/70 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Create task
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <label
          htmlFor="task-title"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Task title
        </label>

        <input
          id="task-title"
          className="w-full border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={
            saving
              ? 'Saving task...'
              : 'Add a task for the relay'
          }
          maxLength={160}
          disabled={saving}
        />

        {saving && (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Saving task...
              </span>

              <span className="text-emerald-400">
                Processing
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden bg-zinc-800">
              <div className="h-full w-1/2 animate-pulse bg-emerald-400" />
            </div>
          </div>
        )}

        <button
          className="mt-4 w-full bg-emerald-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          type="submit"
          disabled={saving || !title.trim()}
        >
          {saving ? 'Saving...' : 'Create task'}
        </button>

        {error ? (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}