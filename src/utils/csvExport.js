/**
 * Utilities to export application data to CSV files.
 */

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full transaction history to CSV
 */
export function exportTransactionsToCSV(transactions = [], people = []) {
  const personMap = {};
  people.forEach(p => {
    personMap[p.id] = p;
  });

  const headers = [
    'Person Name',
    'Category',
    'Amount (INR)',
    'Reason',
    'Debt Classification',
    'Optional Date',
    'Notes'
  ];

  const rows = transactions.map(tx => {
    const person = personMap[tx.personId] || { name: 'Unknown', category: 'Unknown' };
    return [
      escapeCsvField(person.name),
      escapeCsvField(person.category),
      escapeCsvField(tx.amount),
      escapeCsvField(tx.reason || 'Not specified'),
      escapeCsvField(tx.classification || 'Unconfirmed'),
      escapeCsvField(tx.date || 'Historical (No date)'),
      escapeCsvField(tx.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `transactions_export_${timestamp}.csv`);
}

/**
 * Export summary report by person to CSV
 */
export function exportPeopleSummaryToCSV(people = [], personMetrics = {}) {
  const headers = [
    'Person Name',
    'Category',
    'Total Recorded (INR)',
    'Confirmed Debt (INR)',
    'Total Repaid (INR)',
    'Confirmed Outstanding (INR)',
    'Family Debt (INR)',
    'Unconfirmed Amount (INR)',
    'Indirect Amount (INR)',
    'Relationship Notes'
  ];

  const rows = people.map(p => {
    const m = personMetrics[p.id] || {};
    return [
      escapeCsvField(p.name),
      escapeCsvField(p.category),
      escapeCsvField(m.totalRecorded || 0),
      escapeCsvField(m.confirmedDebt || 0),
      escapeCsvField(m.totalRepaid || 0),
      escapeCsvField(m.confirmedOutstanding || 0),
      escapeCsvField(m.familyDebt || 0),
      escapeCsvField(m.unconfirmedAmount || 0),
      escapeCsvField(m.indirectAmount || 0),
      escapeCsvField(p.relationshipNotes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `borrowed_money_summary_${timestamp}.csv`);
}

/**
 * Export repayment history to CSV
 */
export function exportRepaymentsToCSV(repayments = [], people = []) {
  const personMap = {};
  people.forEach(p => {
    personMap[p.id] = p;
  });

  const headers = [
    'Person Name',
    'Repayment Amount (INR)',
    'Date',
    'Notes'
  ];

  const rows = repayments.map(r => {
    const person = personMap[r.personId] || { name: 'Unknown' };
    return [
      escapeCsvField(person.name),
      escapeCsvField(r.amount),
      escapeCsvField(r.date || 'No date specified'),
      escapeCsvField(r.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `repayments_export_${timestamp}.csv`);
}
