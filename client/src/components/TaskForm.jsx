import React, { useState } from 'react';

export function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle) {
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
    <section className="border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-semibold text-white">Create task</h2>
      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-zinc-300" htmlFor="task-title">
          Task title
        </label>
        <input
          id="task-title"
          className="border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-400"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task for the relay"
          maxLength={160}
        />
        <button
          className="bg-emerald-400 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
          type="submit"
          disabled={saving || !title.trim()}
        >
          {saving ? 'Saving...' : 'Create task'}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
