import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/relay';
const mongoTimeoutMs = 1500;
let connectionPromise = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongoUri, {
        heartbeatFrequencyMS: 1000,
        serverSelectionTimeoutMS: mongoTimeoutMs,
        socketTimeoutMS: mongoTimeoutMs,
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
}

export function getMongoStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    connected: mongoose.connection.readyState === 1,
    state: states[mongoose.connection.readyState] || 'unknown',
    database: mongoose.connection.name || 'relay',
  };
}

async function withTimeout(operation, timeoutMs, timeoutMessage) {
  let timeoutId;

  const timeout = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkMongoHealth() {
  try {
    await withTimeout(connectDB(), mongoTimeoutMs, 'MongoDB connection timed out.');
    await withTimeout(
      mongoose.connection.db.admin().ping(),
      mongoTimeoutMs,
      'MongoDB health ping timed out.'
    );

    return {
      name: 'MongoDB',
      status: 'HEALTHY',
      connected: true,
      state: getMongoStatus().state,
      database: mongoose.connection.name || 'relay',
      message: 'Database ping succeeded.',
    };
  } catch (error) {
    return {
      name: 'MongoDB',
      status: 'FAILED',
      connected: false,
      state: getMongoStatus().state,
      database: mongoose.connection.name || 'relay',
      message: error.message,
    };
  }
}
