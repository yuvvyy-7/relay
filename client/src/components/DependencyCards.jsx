import React from 'react';

export function DependencyCards({ status }) {
  const backend = status?.dependencies?.backend;
  const database = status?.dependencies?.database;
  const cards = [
    {
      name: 'Backend',
      value: backend?.status || 'CHECKING',
      message: backend?.message || 'Waiting for health check.',
    },
    {
      name: 'MongoDB',
      value: database?.status || 'CHECKING',
      message: database?.message || 'Waiting for health check.',
    },
  ];

  const styles = {
    HEALTHY: 'bg-emerald-400 text-emerald-300',
    FAILED: 'bg-red-400 text-red-300',
    UNKNOWN: 'bg-zinc-500 text-zinc-300',
    CHECKING: 'bg-zinc-500 text-zinc-300',
  };

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {cards.map((card) => (
        <article key={card.name} className="border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-zinc-300">{card.name}</h3>
            <span className={`h-3 w-3 ${styles[card.value]?.split(' ')[0] || 'bg-zinc-500'}`} />
          </div>
          <p className={`mt-4 text-xl font-semibold ${styles[card.value]?.split(' ')[1] || 'text-zinc-300'}`}>
            {card.value}
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">{card.message}</p>
        </article>
      ))}
    </section>
  );
}
