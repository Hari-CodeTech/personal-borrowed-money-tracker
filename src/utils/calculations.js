import { toPaise, toRupees } from './currency.js';
import { VERIFIED_BENCHMARKS, CATEGORIES } from '../data/initialData.js';

/**
 * Financial calculation engine.
 * All internal arithmetic uses integer paise to eliminate floating-point imprecision.
 */

/**
 * Calculate totals and breakdown for a single person.
 */
export function calculatePersonTotals(personId, transactions = [], repayments = []) {
  const personTransactions = transactions.filter(t => t.personId === personId);
  const personRepayments = repayments.filter(r => r.personId === personId);

  let totalRecordedPaise = 0;
  let confirmedDebtPaise = 0;
  let familyDebtPaise = 0;
  let indirectPaise = 0;
  let informationalPaise = 0;
  let unconfirmedPaise = 0;

  personTransactions.forEach(tx => {
    const p = toPaise(tx.amount);
    totalRecordedPaise += p;

    switch (tx.classification) {
      case 'Personal Debt':
        confirmedDebtPaise += p;
        break;
      case 'Family Debt':
        familyDebtPaise += p;
        break;
      case 'Indirect / Not Directly Received':
        indirectPaise += p;
        break;
      case 'Informational Record':
        informationalPaise += p;
        break;
      case 'Unconfirmed':
      default:
        unconfirmedPaise += p;
        break;
    }
  });

  let totalRepaidPaise = 0;
  personRepayments.forEach(r => {
    totalRepaidPaise += toPaise(r.amount);
  });

  // Outstanding confirmed balance cannot be negative
  const confirmedOutstandingPaise = Math.max(0, confirmedDebtPaise - totalRepaidPaise);

  // Overall remaining recorded balance
  const remainingRecordedPaise = Math.max(0, totalRecordedPaise - totalRepaidPaise);

  return {
    transactionCount: personTransactions.length,
    repaymentCount: personRepayments.length,
    totalRecorded: toRupees(totalRecordedPaise),
    confirmedDebt: toRupees(confirmedDebtPaise),
    familyDebt: toRupees(familyDebtPaise),
    indirectAmount: toRupees(indirectPaise),
    informationalAmount: toRupees(informationalPaise),
    unconfirmedAmount: toRupees(unconfirmedPaise),
    totalRepaid: toRupees(totalRepaidPaise),
    confirmedOutstanding: toRupees(confirmedOutstandingPaise),
    remainingRecorded: toRupees(remainingRecordedPaise),
    transactions: personTransactions,
    repayments: personRepayments
  };
}

/**
 * Calculate grand totals across all people, categories, and classifications.
 */
export function calculateOverallTotals(people = [], transactions = [], repayments = []) {
  let totalRecordedPaise = 0;
  let confirmedDebtPaise = 0;
  let familyDebtPaise = 0;
  let indirectPaise = 0;
  let informationalPaise = 0;
  let unconfirmedPaise = 0;
  let totalRepaidPaise = 0;
  let unconfirmedCount = 0;

  // Transaction classification sums
  transactions.forEach(tx => {
    const p = toPaise(tx.amount);
    totalRecordedPaise += p;

    switch (tx.classification) {
      case 'Personal Debt':
        confirmedDebtPaise += p;
        break;
      case 'Family Debt':
        familyDebtPaise += p;
        break;
      case 'Indirect / Not Directly Received':
        indirectPaise += p;
        break;
      case 'Informational Record':
        informationalPaise += p;
        break;
      case 'Unconfirmed':
      default:
        unconfirmedPaise += p;
        unconfirmedCount += 1;
        break;
    }
  });

  // Repayment sums
  repayments.forEach(r => {
    totalRepaidPaise += toPaise(r.amount);
  });

  // Confirmed balance = Confirmed debt - Repaid
  const confirmedOutstandingPaise = Math.max(0, confirmedDebtPaise - totalRepaidPaise);

  // Category breakdown
  const categoryTotals = {
    'Close Family': { recordedPaise: 0, count: 0 },
    'Outer Family': { recordedPaise: 0, count: 0 },
    'Friends': { recordedPaise: 0, count: 0 }
  };

  const personCategoryMap = {};
  people.forEach(p => {
    personCategoryMap[p.id] = p.category;
  });

  transactions.forEach(tx => {
    const cat = personCategoryMap[tx.personId] || 'Other';
    const p = toPaise(tx.amount);
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { recordedPaise: 0, count: 0 };
    }
    categoryTotals[cat].recordedPaise += p;
    categoryTotals[cat].count += 1;
  });

  const categoryBreakdown = {};
  Object.keys(categoryTotals).forEach(cat => {
    categoryBreakdown[cat] = {
      totalRecorded: toRupees(categoryTotals[cat].recordedPaise),
      transactionCount: categoryTotals[cat].count
    };
  });

  // Detailed person-by-person metrics
  const personMetrics = {};
  people.forEach(person => {
    personMetrics[person.id] = calculatePersonTotals(person.id, transactions, repayments);
  });

  return {
    totalRecorded: toRupees(totalRecordedPaise),
    confirmedDebt: toRupees(confirmedDebtPaise),
    confirmedOutstanding: toRupees(confirmedOutstandingPaise),
    familyDebt: toRupees(familyDebtPaise),
    indirectAmount: toRupees(indirectPaise),
    informationalAmount: toRupees(informationalPaise),
    unconfirmedAmount: toRupees(unconfirmedPaise),
    totalRepaid: toRupees(totalRepaidPaise),
    peopleCount: people.length,
    transactionCount: transactions.length,
    repaymentCount: repayments.length,
    unconfirmedCount,
    categoryBreakdown,
    personMetrics
  };
}

/**
 * Verifies current dataset against the reference benchmarks.
 * Identifies any discrepancies by person, category, and grand total.
 */
export function runDatasetDiagnostics(people = [], transactions = [], repayments = []) {
  const totals = calculateOverallTotals(people, transactions, repayments);
  const mismatches = [];

  // Check Grand Total
  const grandTotalDiff = totals.totalRecorded - VERIFIED_BENCHMARKS.grandTotal;
  if (grandTotalDiff !== 0) {
    mismatches.push({
      type: 'Grand Total',
      expected: VERIFIED_BENCHMARKS.grandTotal,
      actual: totals.totalRecorded,
      difference: grandTotalDiff
    });
  }

  // Check Categories
  Object.entries(VERIFIED_BENCHMARKS.categoryTotals).forEach(([cat, expected]) => {
    const actual = totals.categoryBreakdown[cat]?.totalRecorded || 0;
    const diff = actual - expected;
    if (diff !== 0) {
      mismatches.push({
        type: `Category: ${cat}`,
        expected,
        actual,
        difference: diff
      });
    }
  });

  // Check Individual People
  people.forEach(person => {
    const expected = VERIFIED_BENCHMARKS.personTotals[person.name];
    if (expected !== undefined) {
      const actual = totals.personMetrics[person.id]?.totalRecorded || 0;
      const diff = actual - expected;
      if (diff !== 0) {
        mismatches.push({
          type: `Person: ${person.name}`,
          personId: person.id,
          expected,
          actual,
          difference: diff
        });
      }
    }
  });

  return {
    isValid: mismatches.length === 0,
    mismatches,
    totals
  };
}
