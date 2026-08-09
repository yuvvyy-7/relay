import { openDB } from 'idb';

const DB_NAME = 'relay-local';
const STORE_NAME = 'tasks';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: 'clientId',
      });
    }
  },
});

export async function saveTask(task) {
  const db = await dbPromise;
  await db.put(STORE_NAME, task);
}

export async function saveTasks(tasks) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');

  for (const task of tasks) {
    await tx.store.put(task);
  }

  await tx.done;
}

export async function getTasks() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

export async function deleteTask(clientId) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, clientId);
}

export async function clearTasks() {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}