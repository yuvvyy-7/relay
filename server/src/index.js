import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDB } from './db.js';
import { getHealthState } from './services/healthService.js';
import { tasksRouter } from './routes/tasks.js';
import { systemRouter } from './routes/system.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  })
);
app.use(express.json());

app.get('/health', async (req, res, next) => {
  try {
    res.json(await getHealthState());
  } catch (error) {
    next(error);
  }
});

app.use('/tasks', tasksRouter);
app.use('/system', systemRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Server error',
    detail: error.message,
  });
});

try {
  await connectDB();
  console.log('MongoDB connected');
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
}

app.listen(port, () => {
  console.log(`RELAY API running on http://localhost:${port}`);
});
