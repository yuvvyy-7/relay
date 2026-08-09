import express from 'express';
import crypto from 'node:crypto';
import { Task } from '../models/Task.js';


export const tasksRouter = express.Router();

tasksRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();

    if (!title) {
      return res.status(400).json({
        message: 'Task title is required.',
      });
    }

    const clientId = String(req.body.clientId || crypto.randomUUID());

    const existingTask = await Task.findOne({ clientId });

    if (existingTask) {
      return res.json(existingTask);
    }

    const task = await Task.create({
      title,
      clientId,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: Boolean(req.body.completed) },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
