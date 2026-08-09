import { checkMongoHealth } from '../db.js';

const recoveringWindowMs = 5000;

let previousMongoStatus = null;
let recoveringUntil = 0;

export async function getHealthState() {
  const checkedAt = new Date().toISOString();
  const backend = {
    name: 'Backend',
    status: 'HEALTHY',
    message: 'Express API is responding.',
  };

  const database = await checkMongoHealth();

  if (previousMongoStatus === 'FAILED' && database.status === 'HEALTHY') {
    recoveringUntil = Date.now() + recoveringWindowMs;
  }

  previousMongoStatus = database.status;

  let system = 'HEALTHY';

  if (backend.status === 'FAILED') {
    system = 'FAILED';
  } else if (database.status === 'FAILED') {
    system = 'DEGRADED';
  } else if (Date.now() < recoveringUntil) {
    system = 'RECOVERING';
  }

  return {
    system,
    checkedAt,
    dependencies: {
      backend,
      database,
    },
  };
}
