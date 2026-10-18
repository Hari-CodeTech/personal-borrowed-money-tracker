import { CATEGORIES, DEBT_CLASSIFICATIONS } from '../data/initialData.js';

/**
 * Validates a person record before saving
 */
export function validatePerson(name, category, existingPeople = [], excludeId = null) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Person name is required.';
  } else {
    const trimmed = name.trim().toLowerCase();
    const isDuplicate = existingPeople.some(
      p => p.id !== excludeId && p.name.trim().toLowerCase() === trimmed
    );
    if (isDuplicate) {
      errors.name = `A person named "${name.trim()}" already exists. Choose a unique name or add an identifier (e.g. location or relation).`;
    }
  }

  const validCategories = Object.values(CATEGORIES);
  if (!category || !validCategories.includes(category)) {
    errors.category = `Category must be one of: ${validCategories.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates a transaction before saving
 */
export function validateTransaction({ personId, amount, classification }) {
  const errors = {};

  if (!personId) {
    errors.personId = 'Please select a person.';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Amount must be a valid number greater than ₹0.';
  }

  if (!classification || !DEBT_CLASSIFICATIONS.includes(classification)) {
    errors.classification = 'Please select a valid debt classification.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates a repayment before saving
 */
export function validateRepayment({ personId, amount, currentOutstanding = 0 }) {
  const errors = {};
  const warnings = {};

  if (!personId) {
    errors.personId = 'Please select a person.';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Repayment amount must be greater than ₹0.';
  } else if (currentOutstanding > 0 && numericAmount > currentOutstanding) {
    warnings.amount = `Repayment (₹${numericAmount.toLocaleString('en-IN')}) exceeds the confirmed outstanding balance (₹${currentOutstanding.toLocaleString('en-IN')}).`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

/**
 * Validates imported JSON data
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Import file must be a valid JSON object.' };
  }

  if (!Array.isArray(data.people)) {
    return { isValid: false, error: 'Import data is missing a valid "people" array.' };
  }

  if (!Array.isArray(data.transactions)) {
    return { isValid: false, error: 'Import data is missing a valid "transactions" array.' };
  }

  // Validate people structure
  for (let i = 0; i < data.people.length; i++) {
    const p = data.people[i];
    if (!p.id || !p.name || !p.category) {
      return { isValid: false, error: `Person at index ${i} is missing id, name, or category.` };
    }
  }

  // Validate transactions structure
  for (let i = 0; i < data.transactions.length; i++) {
    const tx = data.transactions[i];
    if (!tx.id || !tx.personId || typeof tx.amount !== 'number' || tx.amount <= 0) {
      return { isValid: false, error: `Transaction at index ${i} has an invalid id, personId, or amount.` };
    }
  }

  return { isValid: true };
}
