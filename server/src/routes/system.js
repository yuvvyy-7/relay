import express from 'express';
import { getHealthState } from '../services/healthService.js';

export const systemRouter = express.Router();

systemRouter.get('/health', async (req, res, next) => {
  try {
    res.json(await getHealthState());
  } catch (error) {
    next(error);
  }
});

systemRouter.get('/status', async (req, res, next) => {
  try {
    const health = await getHealthState();

    res.json({
      mode: health.system,
      api: health.dependencies.backend.status,
      mongo: {
        connected: health.dependencies.database.connected,
        state: health.dependencies.database.state,
        database: health.dependencies.database.database,
      },
      health,
    });
  } catch (error) {
    next(error);
  }
});
