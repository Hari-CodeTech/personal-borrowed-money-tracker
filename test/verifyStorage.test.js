import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS } from '../src/data/initialData.js';
import { 
  loadAppData, 
  saveAppData, 
  resetToInitialDataset, 
  createBackupPayload, 
  parseAndValidateBackup,
  STORAGE_KEYS
} from '../src/services/storageService.js';

console.log('====================================================');
console.log('RUNNING STORAGE RESILIENCE & PERSISTENCE TEST SUITE');
console.log('Personal Borrowed Money Tracker - Hari Satya Sai Puvvala');
console.log('====================================================\n');

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  }
};
global.localStorage = global.window.localStorage;

let failed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Initial Empty Load: seeds initial benchmark dataset
window.localStorage.clear();
const firstLoad = loadAppData();
assert(firstLoad.people.length === 18, `Empty storage seeds 18 initial people (actual: ${firstLoad.people.length})`);
assert(firstLoad.transactions.length === 55, `Empty storage seeds 55 transactions (actual: ${firstLoad.transactions.length})`);
assert(firstLoad.isInitialSeed === true, 'Flagged as initial seed');

// 2. Verified save: saving modified records
const customPerson = {
  id: 'person-test-123',
  name: 'Kiran Uncle',
  category: 'Outer Family',
  relationshipNotes: 'Test relationship',
  isHighlighted: false
};
const customTx = {
  id: 'tx-test-456',
  personId: 'person-test-123',
  amount: 15000,
  reason: 'Urgent medical assistance',
  classification: 'Personal Debt',
  notes: 'Repay in 3 months',
  date: '2026-11-13'
};

const updatedPeople = [...INITIAL_PEOPLE, customPerson];
const updatedTxs = [...INITIAL_TRANSACTIONS, customTx];
const saveRes = saveAppData(updatedPeople, updatedTxs, INITIAL_REPAYMENTS, { trigger: 'test' });

assert(saveRes.success === true, 'saveAppData returns success: true');
assert(mockStorage[STORAGE_KEYS.UNIFIED_STATE] !== undefined, 'Unified state snapshot created in localStorage');
assert(mockStorage[STORAGE_KEYS.SAFETY_BACKUP] !== undefined, 'Safety backup snapshot created in localStorage');

// 3. Reload from storage: verifies custom records persisted
const secondLoad = loadAppData();
assert(secondLoad.people.length === 19, `Loaded 19 people from storage (actual: ${secondLoad.people.length})`);
assert(secondLoad.transactions.length === 56, `Loaded 56 transactions from storage (actual: ${secondLoad.transactions.length})`);
assert(secondLoad.isInitialSeed === false, 'Not flagged as initial seed');
assert(secondLoad.people.some(p => p.name === 'Kiran Uncle'), 'Custom person "Kiran Uncle" preserved in storage');

// 4. Resilience test: What if an individual key was wiped by browser?
delete mockStorage[STORAGE_KEYS.PEOPLE];
const recoveryLoad = loadAppData();
assert(recoveryLoad.people.length === 19, `Unified state recovers all 19 people even if pbmt_people_v1 key is deleted (actual: ${recoveryLoad.people.length})`);
assert(recoveryLoad.people.some(p => p.name === 'Kiran Uncle'), 'Recovered custom person from unified snapshot');

// 5. Resilience test: What if both individual and unified were wiped, but safety backup exists?
delete mockStorage[STORAGE_KEYS.PEOPLE];
delete mockStorage[STORAGE_KEYS.TRANSACTIONS];
delete mockStorage[STORAGE_KEYS.UNIFIED_STATE];
const safetyLoad = loadAppData();
assert(safetyLoad.people.length === 19, `Safety backup recovers all 19 people even when primary keys deleted (actual: ${safetyLoad.people.length})`);
assert(safetyLoad.source === 'safety_backup', 'Successfully identified safety_backup as recovery source');

// 6. Backup payload export and import validation
const backup = createBackupPayload(updatedPeople, updatedTxs, INITIAL_REPAYMENTS);
assert(backup.stats.peopleCount === 19, 'Backup payload includes all 19 people');
assert(backup.stats.transactionCount === 56, 'Backup payload includes all 56 transactions');

const validation = parseAndValidateBackup(JSON.stringify(backup));
assert(validation.success === true, 'parseAndValidateBackup validates clean backup payload');
assert(validation.data.people.length === 19, 'Validated backup parsed 19 people correctly');

if (failed === 0) {
  console.log('\n====================================================');
  console.log('🎉 ALL STORAGE RESILIENCE TESTS PASSED (100% PASS)');
  console.log('====================================================');
} else {
  console.error(`\n❌ ${failed} tests failed!`);
  process.exit(1);
}

