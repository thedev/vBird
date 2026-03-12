import Dexie from 'dexie';

export const db = new Dexie('vBirdDB');

db.version(1).stores({
  observations: '++id, species, count, date, createdAt',
  sessions: '++id, date, location, startTime, protocol',
});

export async function addObservation(obs) {
  return db.observations.add({
    ...obs,
    createdAt: new Date().toISOString(),
  });
}

export async function getObservations() {
  return db.observations.orderBy('createdAt').toArray();
}

export async function updateObservation(id, changes) {
  return db.observations.update(id, changes);
}

export async function deleteObservation(id) {
  return db.observations.delete(id);
}

export async function clearObservations() {
  return db.observations.clear();
}
