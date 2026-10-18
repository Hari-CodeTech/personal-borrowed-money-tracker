import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { validateRepayment } from '../utils/validation';

export default function RecordRepaymentModal({ 
  people = [], 
  selectedPersonId = '', 
  personMetrics = {}, 
  onClose, 
  onSave 
}) {
  const [personId, setPersonId] = useState(selectedPersonId || (people[0]?.id || ''));
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [confirmedSpecialDebt, setConfirmedSpecialDebt] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  const person = people.find(p => p.id === personId);
  const metrics = personMetrics[personId] || {};
  const currentOutstanding = metrics.confirmedOutstanding || 0;
  const familyDebt = metrics.familyDebt || 0;
  const unconfirmedAmount = metrics.unconfirmedAmount || 0;

  const hasSpecialDebtOnly = currentOutstanding === 0 && (familyDebt > 0 || unconfirmedAmount > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateRepayment({
      personId,
      amount,
      currentOutstanding
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // If there is no confirmed personal debt, but family or unconfirmed debt exists, require explicit checkbox confirmation
    if (hasSpecialDebtOnly && !confirmedSpecialDebt) {
      setErrors({
        specialDebt: 'This person has no confirmed personal debt. Please check the confirmation below to apply repayment towards family dues or unconfirmed records.'
      });
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, ''));

    const newRepayment = {
      id: `repay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      personId,
      amount: numAmount,
      notes: notes.trim(),
      date: date.trim() === '' ? null : date.trim()
    };

    onSave(newRepayment);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Record a Repayment</h2>
            <p>Log money returned towards personal debts or family accounts.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Person selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="repay-person">
                Person *
              </label>
              <select
                id="repay-person"
                className="form-control"
                value={personId}
                onChange={(e) => {
                  setPersonId(e.target.value);
                  setErrors({});
                  setWarnings({});
                }}
              >
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balances Context Box */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid var(--border-light)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-subtle)' }}>Confirmed Outstanding:</span>
                <strong style={{ color: currentOutstanding > 0 ? '#dc2626' : 'var(--text-main)' }}>
                  {formatINR(currentOutstanding)}
                </strong>
              </div>
              {familyDebt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#c2410c' }}>Family / Father Debt:</span>
                  <strong>{formatINR(familyDebt)}</strong>
                </div>
              )}
              {unconfirmedAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#854d0e' }}>Unconfirmed Records:</span>
                  <strong>{formatINR(unconfirmedAmount)}</strong>
                </div>
              )}
            </div>

            {/* Repayment Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="repay-amount">
                Repayment Amount (₹ INR) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '0.85rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontWeight: 700, 
                  color: 'var(--text-subtle)' 
                }}>
                  ₹
                </span>
                <input
                  id="repay-amount"
                  type="number"
                  step="any"
                  min="1"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                  }}
                  autoFocus
                />
              </div>
              {errors.amount && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.amount}</span>
                </div>
              )}
            </div>

            {/* Special Confirmation for Family/Unconfirmed Debt if no personal confirmed debt */}
            {hasSpecialDebtOnly && (
              <div style={{ 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fde68a', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem', 
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', color: '#92400e', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} flexShrink={0} />
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    Notice: This person has ₹0 confirmed personal debt, but holds Family or Unconfirmed records.
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', color: '#78350f' }}>
                  <input
                    type="checkbox"
                    checked={confirmedSpecialDebt}
                    onChange={(e) => setConfirmedSpecialDebt(e.target.checked)}
                  />
                  <span>I confirm applying this repayment towards family dues or unconfirmed obligations.</span>
                </label>
                {errors.specialDebt && (
                  <div className="form-error" style={{ marginTop: '0.4rem' }}>
                    <AlertCircle size={14} />
                    <span>{errors.specialDebt}</span>
                  </div>
                )}
              </div>
            )}

            {/* Optional Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="repay-date">
                Repayment Date <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="repay-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="repay-notes">
                Payment Details / Transaction Mode <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="repay-notes"
                className="form-control"
                rows="2"
                placeholder="e.g. UPI transfer, Cash, Bank deposit reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <CreditCard size={16} />
              <span>Save Repayment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
