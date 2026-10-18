import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { validateRepayment } from '../utils/validation';

export default function EditRepaymentModal({ 
  repayment, 
  people = [], 
  onClose, 
  onSave 
}) {
  const [personId, setPersonId] = useState(repayment.personId);
  const [amount, setAmount] = useState(String(repayment.amount));
  const [notes, setNotes] = useState(repayment.notes || '');
  const [date, setDate] = useState(repayment.date || '');
  const [errors, setErrors] = useState({});

  const person = people.find(p => p.id === personId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateRepayment({
      personId,
      amount
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, ''));

    const updatedRepayment = {
      ...repayment,
      personId,
      amount: numAmount,
      notes: notes.trim(),
      date: date.trim() === '' ? null : date.trim()
    };

    onSave(updatedRepayment);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Edit Repayment Record</h2>
            <p>Modify repayment amount or notes for {person?.name || 'record'}.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-repay-person">
                Person *
              </label>
              <select
                id="edit-repay-person"
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

            <div className="form-group">
              <label className="form-label" htmlFor="edit-repay-amount">
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
                  id="edit-repay-amount"
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

            <div className="form-group">
              <label className="form-label" htmlFor="edit-repay-date">
                Repayment Date <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="edit-repay-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-repay-notes">
                Payment Details / Transaction Mode
              </label>
              <textarea
                id="edit-repay-notes"
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
              <span>Update Repayment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
