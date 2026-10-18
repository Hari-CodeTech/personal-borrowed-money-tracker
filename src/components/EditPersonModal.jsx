import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import { validatePerson } from '../utils/validation';

export default function EditPersonModal({ person, existingPeople = [], onClose, onSave }) {
  const [name, setName] = useState(person.name);
  const [category, setCategory] = useState(person.category);
  const [relationshipNotes, setRelationshipNotes] = useState(person.relationshipNotes || '');
  const [isHighlighted, setIsHighlighted] = useState(!!person.isHighlighted);
  const [highlightBadge, setHighlightBadge] = useState(person.highlightBadge || 'IMPORTANT FAMILY RECORD');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validatePerson(name, category, existingPeople, person.id);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const updatedPerson = {
      ...person,
      name: name.trim(),
      category,
      relationshipNotes: relationshipNotes.trim(),
      isHighlighted,
      highlightBadge: isHighlighted ? highlightBadge.trim() : ''
    };

    onSave(updatedPerson);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Edit Person Details</h2>
            <p>Update name, category, or relationship context for {person.name}.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-person-name">
                Person Full Name / Identifier *
              </label>
              <input
                id="edit-person-name"
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
              />
              {errors.name && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-person-category">
                Category *
              </label>
              <select
                id="edit-person-category"
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
              <label className="form-label" htmlFor="edit-relationship-notes">
                Relationship Notes <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="edit-relationship-notes"
                className="form-control"
                rows="3"
                value={relationshipNotes}
                onChange={(e) => setRelationshipNotes(e.target.value)}
              />
            </div>

            {/* Special Highlight Toggle */}
            <div className="form-group" style={{ 
              backgroundColor: '#fafbfc', 
              padding: '0.85rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-light)' 
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                />
                <span>Visually Highlight this Person on Dashboard</span>
              </label>
              {isHighlighted && (
                <div style={{ marginTop: '0.65rem' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Custom Highlight Badge Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={highlightBadge}
                    onChange={(e) => setHighlightBadge(e.target.value)}
                    placeholder="e.g. IMPORTANT FAMILY RECORD"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Update Person</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
