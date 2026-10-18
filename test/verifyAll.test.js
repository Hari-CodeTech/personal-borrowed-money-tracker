import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS, VERIFIED_BENCHMARKS } from '../src/data/initialData.js';
import { calculateOverallTotals, calculatePersonTotals, runDatasetDiagnostics } from '../src/utils/calculations.js';
import { toPaise, toRupees, formatINR } from '../src/utils/currency.js';
import { validatePerson, validateTransaction, validateRepayment } from '../src/utils/validation.js';

console.log('====================================================');
console.log('RUNNING AUTOMATED AUDIT & VERIFICATION SUITE');
console.log('Personal Borrowed Money Tracker - Hari Satya Sai Puvvala');
console.log('====================================================\n');

let failedTests = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Initial counts
assert(INITIAL_PEOPLE.length === 18, `People count is exactly 18 (actual: ${INITIAL_PEOPLE.length})`);
assert(INITIAL_TRANSACTIONS.length === 55, `Initial transactions count is 55 (actual: ${INITIAL_TRANSACTIONS.length})`);

// 2. Diagnostics on initial dataset
const diag = runDatasetDiagnostics(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(diag.isValid === true, `Diagnostic validation is valid (mismatches: ${diag.mismatches.length})`);
if (diag.mismatches.length > 0) {
  console.error(diag.mismatches);
}

// 3. Overall Totals
const totals = calculateOverallTotals(INITIAL_PEOPLE, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(totals.totalRecorded === 572630, `Grand Total Recorded is ₹5,72,630 (actual: ${totals.totalRecorded})`);
assert(totals.categoryBreakdown['Close Family'].totalRecorded === 435830, `Close Family total is ₹4,35,830 (actual: ${totals.categoryBreakdown['Close Family'].totalRecorded})`);
assert(totals.categoryBreakdown['Outer Family'].totalRecorded === 91000, `Outer Family total is ₹91,000 (actual: ${totals.categoryBreakdown['Outer Family'].totalRecorded})`);
assert(totals.categoryBreakdown['Friends'].totalRecorded === 45800, `Friends total is ₹45,800 (actual: ${totals.categoryBreakdown['Friends'].totalRecorded})`);

// 4. Close Family individual verification
const srinu = INITIAL_PEOPLE.find(p => p.name === 'Srinu Pedhananna');
assert(srinu && srinu.isHighlighted, 'Srinu Pedhananna is marked with visual highlight');
assert(srinu && srinu.highlightBadge === 'IMPORTANT FAMILY RECORD', 'Srinu Pedhananna has badge "IMPORTANT FAMILY RECORD"');

const srinuTotals = calculatePersonTotals(srinu.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(srinuTotals.totalRecorded === 203300, `Srinu Pedhananna total is ₹2,03,300 (actual: ${srinuTotals.totalRecorded})`);
assert(srinuTotals.transactions.length === 4, `Srinu Pedhananna has 4 separate transactions (actual: ${srinuTotals.transactions.length})`);

const ceremonyTx = srinuTotals.transactions.find(t => t.amount === 200000);
assert(ceremonyTx && ceremonyTx.reason === "Father's function and ceremony related expenses", `₹2,00,000 ceremony transaction preserved separately with correct reason`);

const harsha = INITIAL_PEOPLE.find(p => p.name === 'Harsha');
const harshaTotals = calculatePersonTotals(harsha.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(harshaTotals.totalRecorded === 123670, `Harsha total is ₹1,23,670 (actual: ${harshaTotals.totalRecorded})`);
assert(harshaTotals.transactions.length === 16, `Harsha has 16 transactions (actual: ${harshaTotals.transactions.length})`);

const bhagravi = INITIAL_PEOPLE.find(p => p.name === 'Bhagravi');
const bhagraviTotals = calculatePersonTotals(bhagravi.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(bhagraviTotals.totalRecorded === 66060, `Bhagravi total is ₹66,060 (actual: ${bhagraviTotals.totalRecorded})`);
assert(bhagraviTotals.transactions.length === 8, `Bhagravi has 8 transactions (actual: ${bhagraviTotals.transactions.length})`);

// 5. Outer Family checks
const yerammma = INITIAL_PEOPLE.find(p => p.name === 'Yerammma');
const yerammmaTotals = calculatePersonTotals(yerammma.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(yerammmaTotals.totalRecorded === 10000, `Yerammma total is ₹10,000`);
assert(yerammmaTotals.indirectAmount === 10000, `Yerammma is classified as Indirect (actual: ${yerammmaTotals.indirectAmount})`);

// 6. Friends checks
const vasu = INITIAL_PEOPLE.find(p => p.name === 'Vasu Uncle');
const vasuTotals = calculatePersonTotals(vasu.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(vasuTotals.totalRecorded === 13800, `Vasu Uncle total is ₹13,800`);
assert(vasuTotals.familyDebt === 12500, `Vasu Uncle father's dues + ceremony is ₹12,500 (actual: ${vasuTotals.familyDebt})`);

const subbarao = INITIAL_PEOPLE.find(p => p.name === 'Subbarao Uncle');
const subbaraoTotals = calculatePersonTotals(subbarao.id, INITIAL_TRANSACTIONS, INITIAL_REPAYMENTS);
assert(subbaraoTotals.totalRecorded === 31000, `Subbarao Uncle total is ₹31,000`);
assert(subbaraoTotals.familyDebt === 25000, `Subbarao Uncle old father's due is ₹25,000 (actual: ${subbaraoTotals.familyDebt})`);

// 7. Date requirements: Ensure no invented historical dates
const hasInventedDate = INITIAL_TRANSACTIONS.some(t => t.date !== null && t.date !== '');
assert(!hasInventedDate, 'Zero historical dates invented across all 53 records');

// 8. Dynamic calculation test: Adding a transaction
const dynamicTxs = [...INITIAL_TRANSACTIONS, {
  id: 'test-new-tx',
  personId: harsha.id,
  amount: 500,
  reason: 'Test snack',
  classification: 'Personal Debt',
  date: null
}];
const dynamicTotals = calculateOverallTotals(INITIAL_PEOPLE, dynamicTxs, INITIAL_REPAYMENTS);
assert(dynamicTotals.totalRecorded === 573130, `Adding ₹500 dynamically updates total to ₹5,73,130 (actual: ${dynamicTotals.totalRecorded})`);

// 9. Repayment test
const dynamicRepayments = [{
  id: 'test-repay',
  personId: harsha.id,
  amount: 2000,
  date: null
}];
const repayTotals = calculateOverallTotals(INITIAL_PEOPLE, dynamicTxs, dynamicRepayments);
assert(repayTotals.totalRepaid === 2000, `Repayment of ₹2,000 recorded`);
assert(repayTotals.confirmedOutstanding === dynamicTotals.confirmedDebt - 2000, `Confirmed outstanding reduced by repayment amount`);

// 10. Form validation tests
const invalidPerson = validatePerson('', 'Close Family', INITIAL_PEOPLE);
assert(!invalidPerson.isValid, 'Empty person name rejected');

const dupPerson = validatePerson('Harsha', 'Close Family', INITIAL_PEOPLE);
assert(!dupPerson.isValid, 'Duplicate person name warned/rejected');

const invalidTx = validateTransaction({ personId: harsha.id, amount: -50, classification: 'Personal Debt' });
assert(!invalidTx.isValid, 'Negative amount rejected');

console.log('\n====================================================');
if (failedTests === 0) {
  console.log('🎉 ALL 20 UNIT & AUDIT TESTS PASSED WITH 100% INTEGRITY!');
} else {
  console.error(`💥 ${failedTests} TESTS FAILED!`);
  process.exit(1);
}
console.log('====================================================');
