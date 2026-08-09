import React from 'react';

export function DependencyCards({ status }) {
  const dependencies = [
    status?.dependencies?.backend || {
      name: 'Backend',
      status: 'UNKNOWN',
      message: 'Waiting for health data.',
    },

    status?.dependencies?.database || {
      name: 'MongoDB',
      status: 'UNKNOWN',
      message: 'Waiting for health data.',
    },
  ];

  function getStyle(dependency) {
    if (dependency.status === 'HEALTHY') {
      return {
        color: 'var(--green)',
        label: 'ONLINE',
      };
    }

    if (dependency.status === 'FAILED') {
      return {
        color: 'var(--danger)',
        label: 'OFFLINE',
      };
    }

    return {
      color: 'var(--text-faint)',
      label: 'UNKNOWN',
    };
  }

  return (
    <div
      className="grid border"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--bg-panel)',
      }}
    >

      {dependencies.map((dependency, index) => {
        const visual = getStyle(dependency);

        return (
          <div
            key={dependency.name}
            className={`p-6 ${
              index !== dependencies.length - 1
                ? 'border-b'
                : ''
            }`}
            style={{
              borderColor: 'var(--line)',
            }}
          >

            <div className="flex items-center justify-between">

              <div
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: 'var(--text-faint)' }}
              >
                Dependency
              </div>

              <div
                className="flex items-center gap-2 text-[10px]"
                style={{ color: visual.color }}
              >

                <span
                  className="relay-pulse h-2 w-2"
                  style={{
                    background: visual.color,
                    boxShadow: `0 0 10px ${visual.color}`,
                  }}
                />

                {visual.label}

              </div>

            </div>

            <h3 className="mt-5 text-xl font-semibold">
              {dependency.name}
            </h3>

            <p
              className="mt-2 text-[10px] leading-5"
              style={{ color: 'var(--text-faint)' }}
            >
              {dependency.message}
            </p>

          </div>
        );
      })}

    </div>
  );
}