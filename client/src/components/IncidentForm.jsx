import React, { useState } from 'react';

export function IncidentForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('SEV-2');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle || saving) {
      return;
    }

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
    <section
      className="border p-6"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--bg-panel)',
      }}
    >

      <div>

        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-faint)' }}
        >
          Operations
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Report incident
        </h2>

        <p
          className="mt-2 text-[10px] leading-5"
          style={{ color: 'var(--text-dim)' }}
        >
          Register operational events without depending on
          infrastructure availability.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >

        <div>

          <label
            className="mb-2 block text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--text-faint)' }}
          >
            Incident description
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={saving}
            placeholder="Payment service unavailable"
            className="w-full rounded-lg border px-4 py-3 text-xs outline-none transition"
            style={{
              borderColor: 'var(--line)',
              background: 'var(--bg-panel-raised)',
              color: 'var(--text)',
            }}
          />

        </div>

        <div>

          <label
            className="mb-2 block text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--text-faint)' }}
          >
            Severity
          </label>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            disabled={saving}
            className="w-full rounded-lg border px-4 py-3 text-xs outline-none"
            style={{
              borderColor: 'var(--line)',
              background: 'var(--bg-panel-raised)',
              color: 'var(--text)',
            }}
          >
            <option>SEV-1</option>
            <option>SEV-2</option>
            <option>SEV-3</option>
          </select>

        </div>

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="w-full rounded-lg px-4 py-3 text-xs font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'var(--amber)',
            color: '#100A05',
          }}
        >
          {saving ? 'REGISTERING...' : 'REPORT INCIDENT'}
        </button>

      </form>

    </section>
  );
}