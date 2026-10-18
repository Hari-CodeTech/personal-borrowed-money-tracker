import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Info, 
  AlertCircle, 
  Clock, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function PersonModal({ 
  person, 
  metrics, 
  onClose, 
  onAddTransaction,
  onRecordRepayment,
  onEditPerson,
  onDeletePerson,
  onEditTransaction,
  onDeleteTransaction,
  onEditRepayment,
  onDeleteRepayment
}) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'repayments'

  if (!person) return null;

  const {
    totalRecorded = 0,
    confirmedDebt = 0,
    confirmedOutstanding = 0,
    familyDebt = 0,
    indirectAmount = 0,
    informationalAmount = 0,
    unconfirmedAmount = 0,
    totalRepaid = 0,
    transactions = [],
    repayments = []
  } = metrics || {};

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

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog wide" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2>{person.name}</h2>
              <span className="badge badge-close-family">{person.category}</span>
              {person.isHighlighted && (
                <span className="badge badge-special-record">
                  <Sparkles size={12} />
                  {person.highlightBadge || 'IMPORTANT FAMILY RECORD'}
                </span>
              )}
            </div>
            {person.relationshipNotes && (
              <p style={{ marginTop: '0.25rem' }}>{person.relationshipNotes}</p>
            )}
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Quick Metrics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>TOTAL RECORDED</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-700)' }}>
                {formatINR(totalRecorded)}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>CONFIRMED OUTSTANDING</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: confirmedOutstanding > 0 ? '#dc2626' : 'var(--text-main)' }}>
                {formatINR(confirmedOutstanding)}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>TOTAL REPAID</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
                {formatINR(totalRepaid)}
              </div>
            </div>

            {familyDebt > 0 && (
              <div style={{ background: '#fff7ed', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 600 }}>FAMILY DEBT</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#9a3412' }}>
                  {formatINR(familyDebt)}
                </div>
              </div>
            )}

            {unconfirmedAmount > 0 && (
              <div style={{ background: '#fefce8', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 600 }}>UNCONFIRMED</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#854d0e' }}>
                  {formatINR(unconfirmedAmount)}
                </div>
              </div>
            )}

            {indirectAmount > 0 && (
              <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>INDIRECT AMOUNT</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#166534' }}>
                  {formatINR(indirectAmount)}
                </div>
              </div>
            )}
          </div>

          {/* Special notice for Srinu Pedhananna */}
          {person.name === 'Srinu Pedhananna' && (
            <div className="disclaimer-banner" style={{ marginBottom: '1.25rem' }}>
              <Sparkles size={20} color="#b45309" />
              <div className="disclaimer-content">
                <h3>Primary Ceremony Transaction Notice</h3>
                <p>
                  The ₹2,00,000 transaction is specifically associated with father's ceremonies and family functions.
                  It is kept distinct from personal expenditures and can be reclassified or updated as needed.
                </p>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className={`btn btn-sm ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('transactions')}
              >
                <span>Transactions ({transactions.length})</span>
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${activeTab === 'repayments' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('repayments')}
              >
                <span>Repayments ({repayments.length})</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => onEditPerson(person)}
              >
                <Edit3 size={14} />
                <span>Edit Person</span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => onRecordRepayment(person)}
              >
                <CreditCard size={14} />
                <span>Record Repayment</span>
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => onAddTransaction(person)}
              >
                <PlusCircle size={14} />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Transactions */}
          {activeTab === 'transactions' && (
            <div>
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <p>No transactions recorded for {person.name}.</p>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => onAddTransaction(person)}
                  >
                    Add First Transaction
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Amount</th>
                        <th>Reason</th>
                        <th>Classification</th>
                        <th>Date</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr 
                          key={tx.id}
                          style={tx.isPrimaryHighlight ? { backgroundColor: '#fffdf7' } : {}}
                        >
                          <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td className="amount-cell" style={tx.isPrimaryHighlight ? { color: '#b45309', fontSize: '1rem' } : {}}>
                            {formatINR(tx.amount)}
                          </td>
                          <td>
                            <strong>{tx.reason || 'Not specified'}</strong>
                            {tx.isPrimaryHighlight && (
                              <span className="badge badge-special-record" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                                Primary Record
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
                                title="Edit Transaction"
                                onClick={() => onEditTransaction(tx)}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-outline-danger btn-icon btn-sm"
                                title="Delete Transaction"
                                onClick={() => onDeleteTransaction(tx)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Repayments */}
          {activeTab === 'repayments' && (
            <div>
              {repayments.length === 0 ? (
                <div className="empty-state">
                  <p>No repayments recorded yet for {person.name}.</p>
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm"
                    onClick={() => onRecordRepayment(person)}
                  >
                    Record a Repayment
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Repayment Amount</th>
                        <th>Date</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repayments.map((r, idx) => (
                        <tr key={r.id}>
                          <td style={{ color: 'var(--text-subtle)' }}>{idx + 1}</td>
                          <td className="amount-cell" style={{ color: '#16a34a' }}>
                            {formatINR(r.amount)}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            {r.date || 'No date specified'}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {r.notes || '-'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary btn-icon btn-sm"
                                title="Edit Repayment"
                                onClick={() => onEditRepayment(r)}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-outline-danger btn-icon btn-sm"
                                title="Delete Repayment"
                                onClick={() => onDeleteRepayment(r)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button 
            type="button" 
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDeletePerson(person)}
          >
            <Trash2 size={14} />
            <span>Delete Person</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
