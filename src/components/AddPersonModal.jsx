import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import { validatePerson } from '../utils/validation';

export default function AddPersonModal({ existingPeople = [], onClose, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES.CLOSE_FAMILY);
  const [relationshipNotes, setRelationshipNotes] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validatePerson(name, category, existingPeople);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newPerson = {
      id: `person-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      category,
      relationshipNotes: relationshipNotes.trim(),
      isHighlighted: false
    };

    onSave(newPerson);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Add New Person</h2>
            <p>Maintain records of people from whom money was borrowed or family dues exist.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="person-name">
                Person Full Name / Identifier *
              </label>
              <input
                id="person-name"
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Harsha, Srinu Pedhananna, Saradi Uncle Garu"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                autoFocus
              />
              {errors.name && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="person-category">
                Category *
              </label>
              <select
                id="person-category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.values(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="relationship-notes">
                Relationship Notes <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="relationship-notes"
                className="form-control"
                rows="3"
                placeholder="e.g. From Ammamma's side, Father's close associate, cousin, etc."
                value={relationshipNotes}
                onChange={(e) => setRelationshipNotes(e.target.value)}
              />
              <div className="form-hint">
                Add any family relationship context, side of the family, or special identifiers.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Save Person</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
