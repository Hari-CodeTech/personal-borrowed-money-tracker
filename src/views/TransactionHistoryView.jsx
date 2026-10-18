import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  CreditCard,
  FileText
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { exportTransactionsToCSV, exportRepaymentsToCSV } from '../utils/csvExport';
import { CATEGORIES, DEBT_CLASSIFICATIONS } from '../data/initialData';

export default function TransactionHistoryView({
  transactions = [],
  repayments = [],
  people = [],
  onEditTransaction,
  onDeleteTransaction,
  onEditRepayment,
  onDeleteRepayment,
  onAddTransaction
}) {
  const [activeTab, setActiveTab] = useState('borrowing'); // 'borrowing' | 'repayments'
  const [searchTerm, setSearchTerm] = useState('');
  const [personFilter, setPersonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('amount-desc'); // 'amount-desc' | 'amount-asc'

  // Map of personId -> Person
  const personMap = useMemo(() => {
    const map = {};
    people.forEach(p => { map[p.id] = p; });
    return map;
  }, [people]);

  // Filtered and sorted borrowing transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(tx => {
        const p = personMap[tx.personId];
        const personNameMatch = p?.name.toLowerCase().includes(q);
        const reasonMatch = (tx.reason || '').toLowerCase().includes(q);
        const notesMatch = (tx.notes || '').toLowerCase().includes(q);
        return personNameMatch || reasonMatch || notesMatch;
      });
    }

    if (personFilter !== 'ALL') {
      list = list.filter(tx => tx.personId === personFilter);
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter(tx => personMap[tx.personId]?.category === categoryFilter);
    }

    if (classificationFilter !== 'ALL') {
      list = list.filter(tx => tx.classification === classificationFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [transactions, personMap, searchTerm, personFilter, categoryFilter, classificationFilter, sortBy]);

  // Filtered repayments
  const filteredRepayments = useMemo(() => {
    let list = [...repayments];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(r => {
        const p = personMap[r.personId];
        const personNameMatch = p?.name.toLowerCase().includes(q);
        const notesMatch = (r.notes || '').toLowerCase().includes(q);
        return personNameMatch || notesMatch;
      });
    }

    if (personFilter !== 'ALL') {
      list = list.filter(r => r.personId === personFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [repayments, personMap, searchTerm, personFilter, sortBy]);

  const getClassificationBadgeClass = (c) => {
    switch (c) {
      case 'Personal Debt': return 'badge-personal-debt';
      case 'Family Debt': return 'badge-family-debt';
      case 'Indirect / Not Directly Received': return 'badge-indirect';
      case 'Informational Record': return 'badge-informational';
      case 'Unconfirmed': return 'badge-unconfirmed';
      default: return 'badge-informational';
    }
  };

  const handleExport = () => {
    if (activeTab === 'borrowing') {
      exportTransactionsToCSV(filteredTransactions, people);
    } else {
      exportRepaymentsToCSV(filteredRepayments, people);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Transaction History</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
            Filter, search, sort, and export individual borrowing and repayment records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={15} />
            <span>Export to CSV</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAddTransaction}>
            <PlusCircle size={15} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Tabs: Borrowing vs Repayments */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'borrowing' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('borrowing')}
        >
          <FileText size={15} />
          <span>Borrowing Records ({transactions.length})</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'repayments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('repayments')}
        >
          <CreditCard size={15} />
          <span>Repayments ({repayments.length})</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by person name, reason (e.g. rent, bike, laptop), or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-sort-group">
          {/* Person Filter */}
          <select
            className="select-control"
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            aria-label="Filter by person"
          >
            <option value="ALL">All People</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Classification Filter (Borrowing only) */}
          {activeTab === 'borrowing' && (
            <select
              className="select-control"
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              aria-label="Filter by classification"
            >
              <option value="ALL">All Classifications</option>
              {DEBT_CLASSIFICATIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          {activeTab === 'borrowing' && (
            <select
              className="select-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {Object.values(CATEGORIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort by amount"
          >
            <option value="amount-desc">Amount: High → Low</option>
            <option value="amount-asc">Amount: Low → High</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      {activeTab === 'borrowing' ? (
        filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No borrowing records match filters</h3>
            <p>Try clearing filters or adding new transactions.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Person Name</th>
                  <th>Category</th>
                  <th>Amount (INR)</th>
                  <th>Reason</th>
                  <th>Classification</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => {
                  const person = personMap[tx.personId];
                  return (
                    <tr 
                      key={tx.id}
                      style={tx.isPrimaryHighlight ? { backgroundColor: '#fffdf7' } : undefined}
                    >
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td>
                        <strong>{person?.name || 'Unknown'}</strong>
                      </td>
                      <td>
                        <span className="badge badge-close-family" style={{ fontSize: '0.75rem' }}>
                          {person?.category || 'Family'}
                        </span>
                      </td>
                      <td className="amount-cell" style={{ color: tx.isPrimaryHighlight ? '#b45309' : 'var(--text-main)', fontSize: '0.95rem' }}>
                        {formatINR(tx.amount)}
                      </td>
                      <td>
                        <strong>{tx.reason || 'Not specified'}</strong>
                        {tx.isPrimaryHighlight && (
                          <span className="badge badge-special-record" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                            Primary Ceremony
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getClassificationBadgeClass(tx.classification)}`}>
                          {tx.classification || 'Unconfirmed'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        {tx.date || 'Historical (No date)'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {tx.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit"
                            onClick={() => onEditTransaction(tx)}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-icon btn-sm"
                            title="Delete"
                            onClick={() => onDeleteTransaction(tx)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredRepayments.length === 0 ? (
          <div className="empty-state">
            <h3>No repayments found</h3>
            <p>No repayments have been recorded yet matching your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Person Name</th>
                  <th>Repayment Amount</th>
                  <th>Date</th>
                  <th>Notes / Mode</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.map((r, idx) => {
                  const person = personMap[r.personId];
                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td><strong>{person?.name || 'Unknown'}</strong></td>
                      <td className="amount-cell" style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                        {formatINR(r.amount)}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        {r.date || 'No date specified'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {r.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit"
                            onClick={() => onEditRepayment(r)}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-icon btn-sm"
                            title="Delete"
                            onClick={() => onDeleteRepayment(r)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
