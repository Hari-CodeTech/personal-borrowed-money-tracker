import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let toastClass = 'toast-success';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          toastClass = 'toast-error';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          toastClass = 'toast-warning';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon size={18} flexShrink={0} />
            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '0.2rem',
                display: 'flex'
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
