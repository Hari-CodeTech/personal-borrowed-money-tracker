import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { DEBT_CLASSIFICATIONS } from '../data/initialData';
import { validateTransaction } from '../utils/validation';

export default function EditTransactionModal({ 
  transaction, 
  people = [], 
  onClose, 
  onSave 
}) {
  const [personId, setPersonId] = useState(transaction.personId);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [reason, setReason] = useState(transaction.reason || '');
  const [classification, setClassification] = useState(transaction.classification || 'Unconfirmed');
  const [notes, setNotes] = useState(transaction.notes || '');
  const [date, setDate] = useState(transaction.date || '');
  const [errors, setErrors] = useState({});

  const person = people.find(p => p.id === personId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = reason.trim() === '' ? 'Not specified' : reason.trim();

    const validation = validateTransaction({
      personId,
      amount,
      classification
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, ''));

    const updatedTx = {
      ...transaction,
      personId,
      amount: numAmount,
      reason: finalReason,
      classification,
      notes: notes.trim(),
      date: date.trim() === '' ? null : date.trim()
    };

    onSave(updatedTx);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Edit Transaction</h2>
            <p>Update amount, classification, or reason for {person?.name || 'record'}.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Person selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-person">
                Person *
              </label>
              <select
                id="edit-tx-person"
                className="form-control"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
              >
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-amount">
                Amount (₹ INR) *
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
                  id="edit-tx-amount"
                  type="number"
                  step="any"
                  min="1"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                  }}
                />
              </div>
              {errors.amount && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.amount}</span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-reason">
                Reason / Purpose
              </label>
              <input
                id="edit-tx-reason"
                type="text"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Classification */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-classification">
                Debt Classification *
              </label>
              <select
                id="edit-tx-classification"
                className="form-control"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                {DEBT_CLASSIFICATIONS.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Date (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-date">
                Date <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="edit-tx-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="form-hint">
                Historical records without dates can remain date-free.
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tx-notes">
                Notes
              </label>
              <textarea
                id="edit-tx-notes"
                className="form-control"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Update Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
