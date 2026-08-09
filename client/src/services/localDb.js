import { openDB } from 'idb';

const DB_NAME = 'relay-local';
const VERSION = 2;
const TASKS = 'tasks';
const OPERATIONS = 'operations';

const dbPromise = openDB(DB_NAME, VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(TASKS)) {
      db.createObjectStore(TASKS, {
        keyPath: 'clientId',
      });
    }

    if (!db.objectStoreNames.contains(OPERATIONS)) {
      const store = db.createObjectStore(OPERATIONS, {
        keyPath: 'id',
        autoIncrement: true,
      });

      store.createIndex('createdAt', 'createdAt');
    }
  },
});

export async function saveTask(task) {
  if (!task?.clientId) return;

  const db = await dbPromise;
  await db.put(TASKS, task);
}

export async function saveTasks(tasks) {
  const db = await dbPromise;
  const tx = db.transaction(TASKS, 'readwrite');

  for (const task of tasks) {
    if (task?.clientId) {
      await tx.store.put(task);
    }
  }

  await tx.done;
}

export async function getTasks() {
  const db = await dbPromise;
  return db.getAll(TASKS);
}

export async function deleteTask(clientId) {
  const db = await dbPromise;
  await db.delete(TASKS, clientId);
}

export async function clearTasks() {
  const db = await dbPromise;
  await db.clear(TASKS);
}

export async function addOperation(operation) {
  const db = await dbPromise;

  await db.add(OPERATIONS, {
    ...operation,
    createdAt: Date.now(),
  });
}

export async function getOperations() {
  const db = await dbPromise;
  return db.getAll(OPERATIONS);
}

export async function removeOperation(id) {
  const db = await dbPromise;
  await db.delete(OPERATIONS, id);
}

export async function clearOperations() {
  const db = await dbPromise;
  await db.clear(OPERATIONS);
}