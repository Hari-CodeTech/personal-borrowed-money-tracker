import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS } from '../data/initialData.js';
import { validateImportData } from '../utils/validation.js';
import { 
  saveStateToIndexedDB, 
  loadStateFromIndexedDB, 
  getSnapshotsFromIndexedDB,
  requestStoragePersistence,
  checkStoragePersistence
} from './indexedDBService.js';

export const STORAGE_KEYS = {
  PEOPLE: 'pbmt_people_v1',
  TRANSACTIONS: 'pbmt_transactions_v1',
  REPAYMENTS: 'pbmt_repayments_v1',
  UNIFIED_STATE: 'pbmt_unified_state_v1',
  SAFETY_BACKUP: 'pbmt_safety_backup_v1',
  SETTINGS: 'pbmt_settings_v1',
  LAST_SAVED: 'pbmt_last_saved_timestamp_v1'
};

/**
 * Validates whether an array of people has valid minimal structure
 */
function isValidPeopleArray(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(p => p && p.id && p.name);
}

/**
 * Validates whether an array of transactions has valid structure
 */
function isValidTransactionsArray(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(t => t && t.id && t.personId);
}

/**
 * Initializes and retrieves data synchronously from localStorage.
 * Prioritizes the unified state snapshot first, then individual keys.
 * If localStorage is completely empty, seeds with the initial verified dataset.
 */
export function loadAppData() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      people: INITIAL_PEOPLE,
      transactions: INITIAL_TRANSACTIONS,
      repayments: INITIAL_REPAYMENTS,
      isInitialSeed: true
    };
  }

  try {
    // 1. Try unified state container first (atomic snapshot)
    const rawUnified = localStorage.getItem(STORAGE_KEYS.UNIFIED_STATE);
    if (rawUnified) {
      try {
        const unified = JSON.parse(rawUnified);
        if (isValidPeopleArray(unified.people) && isValidTransactionsArray(unified.transactions)) {
          return {
            people: unified.people,
            transactions: unified.transactions,
            repayments: Array.isArray(unified.repayments) ? unified.repayments : [],
            isInitialSeed: false,
            source: 'unified_local_storage'
          };
        }
      } catch (err) {
        console.warn('Failed to parse unified state, falling back to individual keys:', err);
      }
    }

    // 2. Try individual storage keys
    const rawPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const rawRepayments = localStorage.getItem(STORAGE_KEYS.REPAYMENTS);

    if (rawPeople && rawTransactions) {
      const parsedPeople = JSON.parse(rawPeople);
      const parsedTransactions = JSON.parse(rawTransactions);
      const parsedRepayments = rawRepayments ? JSON.parse(rawRepayments) : [];

      if (isValidPeopleArray(parsedPeople) && isValidTransactionsArray(parsedTransactions)) {
        return {
          people: parsedPeople,
          transactions: parsedTransactions,
          repayments: Array.isArray(parsedRepayments) ? parsedRepayments : [],
          isInitialSeed: false,
          source: 'individual_local_storage'
        };
      }
    }

    // 3. Try safety backup if available
    const rawSafety = localStorage.getItem(STORAGE_KEYS.SAFETY_BACKUP);
    if (rawSafety) {
      try {
        const safety = JSON.parse(rawSafety);
        if (isValidPeopleArray(safety.people) && isValidTransactionsArray(safety.transactions)) {
          console.warn('Recovered data from safety backup key.');
          return {
            people: safety.people,
            transactions: safety.transactions,
            repayments: Array.isArray(safety.repayments) ? safety.repayments : [],
            isInitialSeed: false,
            source: 'safety_backup'
          };
        }
      } catch (err) {
        console.warn('Failed to parse safety backup:', err);
      }
    }

    // 4. First-time load: seed initial verified dataset
    saveAppData(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS, { trigger: 'initial_seed' });
    return {
      people: INITIAL_PEOPLE,
      transactions: INITIAL_TRANSACTIONS,
      repayments: INITIAL_REPAYMENTS,
      isInitialSeed: true,
      source: 'initial_benchmark'
    };
  } catch (err) {
    console.error('Critical error loading from localStorage:', err);
    return {
      people: INITIAL_PEOPLE,
      transactions: INITIAL_TRANSACTIONS,
      repayments: INITIAL_REPAYMENTS,
      loadError: 'Failed to parse stored records. Initial dataset loaded in memory.',
      isInitialSeed: true,
      source: 'fallback_memory'
    };
  }
}

/**
 * Checks IndexedDB asynchronously to see if it holds a richer or newer dataset
 * than what was found in localStorage (crucial for recovering from browser localStorage wipes).
 */
export async function reconcileWithIndexedDB(currentPeopleCount, currentTxCount) {
  try {
    const idbState = await loadStateFromIndexedDB();
    if (!idbState || !isValidPeopleArray(idbState.people) || !isValidTransactionsArray(idbState.transactions)) {
      return null;
    }

    // If IndexedDB has more transactions or people than what was currently loaded (e.g. localStorage was cleared)
    const idbTxCount = idbState.transactions.length;
    const idbPeopleCount = idbState.people.length;

    if (idbTxCount > currentTxCount || idbPeopleCount > currentPeopleCount) {
      console.log(`IndexedDB holds newer/richer data (${idbTxCount} txs vs ${currentTxCount} in localStorage). Restoring...`);
      // Restore back to localStorage
      saveAppData(idbState.people, idbState.transactions, idbState.repayments || [], { trigger: 'idb_reconciliation' });
      return {
        people: idbState.people,
        transactions: idbState.transactions,
        repayments: idbState.repayments || [],
        recoveredFrom: 'IndexedDB'
      };
    }
  } catch (err) {
    console.warn('Error during IndexedDB reconciliation:', err);
  }
  return null;
}

/**
 * Persist app state thoroughly to BOTH localStorage and IndexedDB with rolling snapshots
 */
export function saveAppData(people, transactions, repayments, { trigger = 'user_action' } = {}) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, error: 'No localStorage available in environment' };
  }

  const timestamp = Date.now();
  const isoTime = new Date().toISOString();

  try {
    const peopleStr = JSON.stringify(people);
    const txStr = JSON.stringify(transactions);
    const repStr = JSON.stringify(repayments);

    // 1. Write individual keys
    localStorage.setItem(STORAGE_KEYS.PEOPLE, peopleStr);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, txStr);
    localStorage.setItem(STORAGE_KEYS.REPAYMENTS, repStr);
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, timestamp.toString());

    // 2. Write unified atomic state
    const unifiedPayload = JSON.stringify({
      people,
      transactions,
      repayments,
      savedAt: isoTime,
      timestamp
    });
    localStorage.setItem(STORAGE_KEYS.UNIFIED_STATE, unifiedPayload);

    // 3. Update safety backup (only if dataset has valid content)
    if (people.length > 0 && transactions.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SAFETY_BACKUP, unifiedPayload);
    }

    // 4. Asynchronously persist to IndexedDB & save rolling auto-snapshot
    saveStateToIndexedDB(people, transactions, repayments, trigger).catch(err => {
      console.warn('Background IndexedDB save encountered an issue:', err);
    });

    return { success: true, savedAt: isoTime, timestamp };
  } catch (err) {
    console.error('Failed to save to localStorage:', err);

    // If localStorage failed (e.g. QuotaExceeded), still attempt IndexedDB save!
    try {
      saveStateToIndexedDB(people, transactions, repayments, trigger);
    } catch (idbErr) {
      console.error('Both localStorage and IndexedDB failed to save:', idbErr);
    }

    return { success: false, error: err.message };
  }
}

/**
 * Reset application data back to the verified initial dataset
 */
export function resetToInitialDataset() {
  saveAppData(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS, { trigger: 'manual_reset' });
  return {
    people: INITIAL_PEOPLE,
    transactions: INITIAL_TRANSACTIONS,
    repayments: INITIAL_REPAYMENTS
  };
}

/**
 * Fetch rolling backup snapshots from IndexedDB
 */
export async function getRecentSnapshots() {
  return await getSnapshotsFromIndexedDB();
}

/**
 * Creates an exportable JSON object of all user data
 */
export function createBackupPayload(people, transactions, repayments) {
  return {
    app: 'Personal Borrowed Money Tracker',
    owner: 'Hari Satya Sai Puvvala',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    stats: {
      peopleCount: people.length,
      transactionCount: transactions.length,
      repaymentCount: repayments.length
    },
    people,
    transactions,
    repayments
  };
}

/**
 * Trigger download of full JSON backup
 */
export function downloadJsonBackup(people, transactions, repayments) {
  const payload = createBackupPayload(people, transactions, repayments);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `money_tracker_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate JSON file uploaded by user
 */
export function parseAndValidateBackup(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateImportData(parsed);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    return {
      success: true,
      data: {
        people: parsed.people,
        transactions: parsed.transactions,
        repayments: Array.isArray(parsed.repayments) ? parsed.repayments : []
      },
      stats: {
        peopleCount: parsed.people.length,
        transactionCount: parsed.transactions.length,
        repaymentCount: Array.isArray(parsed.repayments) ? parsed.repayments.length : 0,
        exportedAt: parsed.exportedAt || 'Unknown date'
      }
    };
  } catch (err) {
    return { success: false, error: 'Invalid JSON format. Please upload a valid JSON backup file.' };
  }
}

export { requestStoragePersistence, checkStoragePersistence };
