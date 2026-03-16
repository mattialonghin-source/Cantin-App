// IndexedDB Management for Cantina Personale
const DB_NAME = 'CantinaPWA';
const DB_VERSION = 1;
const STORE_NAME = 'bottiglie';

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('cantina', 'cantina', { unique: false });
        store.createIndex('vino', 'vino', { unique: false });
        store.createIndex('denominazione', 'denominazione', { unique: false });
        store.createIndex('annata', 'annata', { unique: false });
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function sanitizeBottiglia(data) {
  return {
    quantita: Number(data.quantita) || 0,
    cantina: String(data.cantina || '').trim(),
    vino: String(data.vino || '').trim(),
    denominazione: String(data.denominazione || '').trim(),
    annata: Number(data.annata) || null,
    costo: parseFloat(data.costo) || 0,
    uve: String(data.uve || '').trim(),
    consumo: String(data.consumo || '').trim(),
    luogo: String(data.luogo || '').trim(),
    temperatura: String(data.temperatura || '').trim(),
    abbinamenti: String(data.abbinamenti || '').trim(),
    acquisto: Number(data.acquisto) || null,
    approvazione: Number(data.approvazione) || 0,
    note: String(data.note || '').trim(),
    posizione: ['interna', 'esterna'].includes(data.posizione) ? data.posizione : '',
  };
}

async function getAllBottiglie() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getBottiglia(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addBottiglia(data) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const sanitized = sanitizeBottiglia(data);
    const request = store.add(sanitized);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateBottiglia(id, data) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const sanitized = sanitizeBottiglia(data);
    sanitized.id = id;
    const request = store.put(sanitized);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteBottiglia(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearAllBottiglie() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function bulkAddBottiglie(items) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;
    let errors = 0;
    const total = items.length;
    if (total === 0) { resolve({ added: 0, errors: 0 }); return; }
    items.forEach((item) => {
      const sanitized = sanitizeBottiglia(item);
      const req = store.add(sanitized);
      req.onsuccess = () => {
        count++;
        if (count + errors === total) resolve({ added: count, errors });
      };
      req.onerror = () => {
        errors++;
        if (count + errors === total) resolve({ added: count, errors });
      };
    });
  });
}

async function getStats() {
  const all = await getAllBottiglie();
  const bottiglie = all.reduce((sum, b) => sum + (Number(b.quantita) || 0), 0);
  const etichette = all.length;
  const valore = all.reduce((sum, b) => sum + ((Number(b.quantita) || 0) * (parseFloat(b.costo) || 0)), 0);
  return { bottiglie, etichette, valore };
}

async function getDenominazioni() {
  const all = await getAllBottiglie();
  const set = new Set(all.map(b => b.denominazione).filter(d => d && d.trim() !== ''));
  return Array.from(set).sort();
}
