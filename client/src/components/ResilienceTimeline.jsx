import React from 'react';

export function ResilienceTimeline({
  status,
  pendingOperations = 0,
}) {
  const system = status?.system || 'UNKNOWN';

  const steps = [
    {
      number: '01',
      title: 'DETECT',
      description: 'Dependency failure identified.',
    },
    {
      number: '02',
      title: 'FALLBACK',
      description: 'Local persistence takes control.',
    },
    {
      number: '03',
      title: 'QUEUE',
      description: `${pendingOperations} operation(s) preserved.`,
    },
    {
      number: '04',
      title: 'RECOVER',
      description: 'Primary dependency returns.',
    },
    {
      number: '05',
      title: 'SYNC',
      description: 'Queued operations reconcile.',
    },
  ];

  return (
    <section
      className="mt-12 border"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--bg-panel)',
      }}
    >

      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: 'var(--line)' }}
      >

        <div>

          <p
            className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-faint)' }}
          >
            Autonomous recovery
          </p>

          <h3 className="mt-1 text-sm font-semibold">
            Failure response pipeline
          </h3>

        </div>

        <span
          className="text-[9px] uppercase"
          style={{
            color:
              system === 'RECOVERING'
                ? 'var(--blue)'
                : system === 'HEALTHY'
                  ? 'var(--green)'
                  : 'var(--text-faint)',
          }}
        >
          {system}
        </span>

      </div>

      <div className="grid md:grid-cols-5">

        {steps.map((step, index) => {

          const active =
            system === 'RECOVERING'
              ? index <= 4
              : system === 'DEGRADED'
                ? index <= 2
                : system === 'HEALTHY'
                  ? index === 4
                  : false;

          return (
            <React.Fragment key={step.number}>

              <div
                className="relative p-5"
                style={{
                  borderColor: 'var(--line)',
                  background: active
                    ? 'rgba(255,140,66,.035)'
                    : 'transparent',
                }}
              >

                <div
                  className="text-[10px]"
                  style={{
                    color: active
                      ? 'var(--amber)'
                      : 'var(--text-faint)',
                  }}
                >
                  {step.number}
                </div>

                <h4 className="mt-6 text-xs font-semibold">
                  {step.title}
                </h4>

                <p
                  className="mt-2 text-[9px] leading-5"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {step.description}
                </p>

              </div>

              {index < 4 && (
                <div
                  className="hidden items-center justify-center border-r text-xs md:flex"
                  style={{
                    borderColor: 'var(--line)',
                    color: 'var(--amber)',
                  }}
                >
                  →
                </div>
              )}

            </React.Fragment>
          );
        })}

      </div>

    </section>
  );
}