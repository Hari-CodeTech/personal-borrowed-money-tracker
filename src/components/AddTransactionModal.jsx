import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import { DEBT_CLASSIFICATIONS } from '../data/initialData';
import { validateTransaction } from '../utils/validation';

export default function AddTransactionModal({ 
  people = [], 
  selectedPersonId = '', 
  onClose, 
  onSave 
}) {
  const [personId, setPersonId] = useState(selectedPersonId || (people[0]?.id || ''));
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [classification, setClassification] = useState('Personal Debt');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(''); // Optional, not required!
  const [errors, setErrors] = useState({});

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

    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      personId,
      amount: numAmount,
      reason: finalReason,
      classification,
      notes: notes.trim(),
      date: date.trim() === '' ? null : date.trim() // Optional, never invented
    };

    onSave(newTx);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Add Borrowed Money Record</h2>
            <p>Record a new borrowed amount, expense, or family obligation.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Person selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-person">
                Person *
              </label>
              <select
                id="tx-person"
                className={`form-control ${errors.personId ? 'error' : ''}`}
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
              >
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
              {errors.personId && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.personId}</span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">
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
                  id="tx-amount"
                  type="number"
                  step="any"
                  min="1"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}
                  placeholder="e.g. 10000"
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

            {/* Reason */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-reason">
                Reason / Purpose
              </label>
              <input
                id="tx-reason"
                type="text"
                className="form-control"
                placeholder="e.g. Rent, Bike repair, Laptop, Shoes, or leave empty for 'Not specified'"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="form-hint">
                Leave empty to automatically record as <strong>"Not specified"</strong>.
              </div>
            </div>

            {/* Debt Classification */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-classification">
                Debt Classification *
              </label>
              <select
                id="tx-classification"
                className="form-control"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                {DEBT_CLASSIFICATIONS.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="form-hint">
                {classification === 'Personal Debt' && 'Directly counts towards your confirmed outstanding balance.'}
                {classification === 'Family Debt' && 'Related to father\'s old dues, ceremony, or family obligation.'}
                {classification === 'Indirect / Not Directly Received' && 'Not directly given to you; excluded from personal debt calculations.'}
                {classification === 'Informational Record' && 'Tracked for reference only; not a personal debt.'}
                {classification === 'Unconfirmed' && 'Requires further verification before classifying as personal debt.'}
              </div>
            </div>

            {/* Optional Date (NOT REQUIRED, NO INVENTED DATES) */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-date">
                Date <span className="optional-tag">(Optional - Leave blank for historical memory)</span>
              </label>
              <input
                id="tx-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="form-hint">
                Dates are strictly optional. No date is required or fabricated for past memories.
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-notes">
                Additional Notes <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="tx-notes"
                className="form-control"
                rows="2"
                placeholder="Any special remarks or context..."
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
              <PlusCircle size={16} />
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
