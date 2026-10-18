import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS } from '../data/initialData';
import { validateImportData } from '../utils/validation';

const STORAGE_KEYS = {
  PEOPLE: 'pbmt_people_v1',
  TRANSACTIONS: 'pbmt_transactions_v1',
  REPAYMENTS: 'pbmt_repayments_v1',
  SETTINGS: 'pbmt_settings_v1',
  BACKUP: 'pbmt_last_backup_v1'
};

/**
 * Initializes and retrieves data from localStorage.
 * If data does not exist, seeds with the verified initial dataset.
 */
export function loadAppData() {
  try {
    const rawPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const rawRepayments = localStorage.getItem(STORAGE_KEYS.REPAYMENTS);

    if (!rawPeople || !rawTransactions) {
      // First-time load: seed initial verified dataset
      saveAppData(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
      return {
        people: INITIAL_PEOPLE,
        transactions: INITIAL_TRANSACTIONS,
        repayments: INITIAL_REPAYMENTS,
        isInitialSeed: true
      };
    }

    const people = JSON.parse(rawPeople);
    const transactions = JSON.parse(rawTransactions);
    const repayments = rawRepayments ? JSON.parse(rawRepayments) : [];

    return {
      people: Array.isArray(people) ? people : INITIAL_PEOPLE,
      transactions: Array.isArray(transactions) ? transactions : INITIAL_TRANSACTIONS,
      repayments: Array.isArray(repayments) ? repayments : INITIAL_REPAYMENTS,
      isInitialSeed: false
    };
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    return {
      people: INITIAL_PEOPLE,
      transactions: INITIAL_TRANSACTIONS,
      repayments: INITIAL_REPAYMENTS,
      loadError: 'Failed to parse stored records. Initial dataset loaded in memory.'
    };
  }
}

/**
 * Persist app state to localStorage
 */
export function saveAppData(people, transactions, repayments) {
  try {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(repayments));
    return { success: true };
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Reset application data back to the verified initial dataset
 */
export function resetToInitialDataset() {
  saveAppData(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
  return {
    people: INITIAL_PEOPLE,
    transactions: INITIAL_TRANSACTIONS,
    repayments: INITIAL_REPAYMENTS
  };
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
