import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed with this action? This cannot be undone.',
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: isDanger ? '#fee2e2' : '#fef3c7',
              color: isDanger ? '#dc2626' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {isDanger && <Trash2 size={16} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
