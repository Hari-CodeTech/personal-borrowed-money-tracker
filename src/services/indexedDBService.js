/**
 * IndexedDB & Persistent Storage Service
 * 
 * Provides secondary durable persistence, auto-backup rolling snapshots,
 * and browser storage persistence grant (navigator.storage.persist).
 */

const DB_NAME = 'PBMT_Database_v1';
const DB_VERSION = 1;
const STORES = {
  STATE: 'app_state',
  SNAPSHOTS: 'snapshots'
};

const MAX_SNAPSHOTS = 20;

/**
 * Open or upgrade the IndexedDB database
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.STATE)) {
          db.createObjectStore(STORES.STATE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
          const snapshotStore = db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
          snapshotStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open failed:', event.target.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB initialization error:', err);
      resolve(null);
    }
  });
}

/**
 * Persist the current application state to IndexedDB and record a rolling snapshot
 */
export async function saveStateToIndexedDB(people, transactions, repayments, trigger = 'auto-save') {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.STATE, STORES.SNAPSHOTS], 'readwrite');
      const stateStore = tx.objectStore(STORES.STATE);
      const snapshotStore = tx.objectStore(STORES.SNAPSHOTS);

      const now = Date.now();
      const isoDate = new Date().toISOString();

      // 1. Put current master state
      stateStore.put({
        key: 'current_state',
        people,
        transactions,
        repayments,
        updatedAt: isoDate,
        timestamp: now
      });

      // 2. Put snapshot record
      const snapshotId = `snapshot-${now}`;
      snapshotStore.put({
        id: snapshotId,
        timestamp: now,
        date: isoDate,
        trigger,
        peopleCount: people.length,
        transactionCount: transactions.length,
        repaymentCount: repayments.length,
        data: {
          people,
          transactions,
          repayments
        }
      });

      // 3. Trim excess snapshots beyond MAX_SNAPSHOTS
      const countRequest = snapshotStore.count();
      countRequest.onsuccess = () => {
        if (countRequest.result > MAX_SNAPSHOTS) {
          const openCursor = snapshotStore.openCursor();
          let deleted = 0;
          const toDelete = countRequest.result - MAX_SNAPSHOTS;
          openCursor.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && deleted < toDelete) {
              snapshotStore.delete(cursor.primaryKey);
              deleted++;
              cursor.continue();
            }
          };
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      console.warn('Error saving to IndexedDB:', err);
      resolve(false);
    }
  });
}

/**
 * Load latest master state from IndexedDB
 */
export async function loadStateFromIndexedDB() {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.STATE], 'readonly');
      const store = tx.objectStore(STORES.STATE);
      const request = store.get('current_state');

      request.onsuccess = () => {
        if (request.result && request.result.people) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
      resolve(null);
    }
  });
}

/**
 * Retrieve all rolling backup snapshots from IndexedDB
 */
export async function getSnapshotsFromIndexedDB() {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORES.SNAPSHOTS], 'readonly');
      const store = tx.objectStore(STORES.SNAPSHOTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const list = request.result || [];
        // Sort descending: newest first
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };

      request.onerror = () => resolve([]);
    } catch (err) {
      console.warn('Error getting snapshots:', err);
      resolve([]);
    }
  });
}

/**
 * Request persistent browser storage so browser will NOT automatically evict records
 */
export async function requestStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch (err) {
      console.warn('navigator.storage.persist error:', err);
      return false;
    }
  }
  return false;
}

/**
 * Check if persistent storage is already granted
 */
export async function checkStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      const isPersisted = await navigator.storage.persisted();
      let quota = null;
      let usage = null;
      if (navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        quota = est.quota;
        usage = est.usage;
      }
      return { isPersisted, quota, usage };
    } catch (err) {
      return { isPersisted: false, quota: null, usage: null };
    }
  }
  return { isPersisted: false, quota: null, usage: null };
}

