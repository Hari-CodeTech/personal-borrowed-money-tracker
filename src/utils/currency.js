/**
 * Currency and financial number utilities for Indian Rupee (INR).
 * Handles precise calculations in integer paise to avoid IEEE-754 floating-point errors.
 */

// Convert Rupee number/string to integer paise (1 INR = 100 paise)
export function toPaise(rupees) {
  if (rupees === null || rupees === undefined || rupees === '') return 0;
  const num = typeof rupees === 'string' ? parseFloat(rupees.replace(/,/g, '')) : Number(rupees);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

// Convert paise back to rupees
export function toRupees(paise) {
  if (paise === null || paise === undefined) return 0;
  return paise / 100;
}

/**
 * Format an amount in INR with Indian number formatting:
 * e.g., ₹1,000, ₹25,000, ₹1,23,670, ₹2,00,000, ₹5,72,630
 */
export function formatINR(rupees, showDecimals = false) {
  const num = typeof rupees === 'string' ? parseFloat(rupees.replace(/,/g, '')) : Number(rupees || 0);
  if (isNaN(num)) return '₹0';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const options = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? (absNum % 1 !== 0 ? 2 : 0) : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  };

  try {
    const formatted = new Intl.NumberFormat('en-IN', options).format(absNum);
    return isNegative ? `-${formatted}` : formatted;
  } catch (e) {
    // Fallback if Intl fails
    const parts = absNum.toFixed(showDecimals ? 2 : 0).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedInt = otherNumbers !== '' ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;

    const res = `₹${formattedInt}${decimalPart}`;
    return isNegative ? `-${res}` : res;
  }
}

/**
 * Parses user input string to clean numeric value
 */
export function parseCurrencyInput(input) {
  if (!input) return 0;
  if (typeof input === 'number') return input;
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}
