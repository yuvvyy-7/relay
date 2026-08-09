import React, { useState } from 'react';

export function IncidentForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('SEV-2');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle || saving) return;

    try {
      setSaving(true);

      await onCreate(`[${severity}] ${nextTitle}`);

      setTitle('');
      setSeverity('SEV-2');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
          Operations
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Report incident
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Create an incident even when infrastructure is unavailable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Incident description
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={saving}
            placeholder="e.g. Payment service unavailable"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">
            Severity
          </label>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 disabled:opacity-50"
          >
            <option>SEV-1</option>
            <option>SEV-2</option>
            <option>SEV-3</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="w-full rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          {saving ? 'Registering incident...' : 'Report incident'}
        </button>
      </form>
    </section>
  );
}