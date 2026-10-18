import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  CornerDownRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function PersonCard({ person, metrics, onClick }) {
  const {
    totalRecorded = 0,
    confirmedDebt = 0,
    confirmedOutstanding = 0,
    unconfirmedAmount = 0,
    familyDebt = 0,
    indirectAmount = 0,
    totalRepaid = 0,
    transactionCount = 0,
    transactions = []
  } = metrics || {};

  const isLargeAmount = totalRecorded >= 25000;
  const isSpecialHighlight = person.isHighlighted || person.name === 'Srinu Pedhananna';
  
  // Find prominent primary transaction if Srinu Pedhananna
  const primaryTx = isSpecialHighlight 
    ? transactions.find(t => t.isPrimaryHighlight || t.amount === 200000) 
    : null;

  // Badge class for category
  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Close Family': return 'badge-close-family';
      case 'Outer Family': return 'badge-outer-family';
      case 'Friends': return 'badge-friends';
      default: return 'badge-informational';
    }
  };

  return (
    <div 
      className={`person-card ${isLargeAmount ? 'large-amount-border' : ''} ${isSpecialHighlight ? 'special-highlight' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Special Badge for Srinu Pedhananna */}
      {isSpecialHighlight && (
        <div className="special-badge-container">
          <span className="badge badge-special-record">
            <Sparkles size={12} />
            {person.highlightBadge || 'IMPORTANT FAMILY RECORD'}
          </span>
        </div>
      )}

      {/* Card Header */}
      <div className="person-card-header">
        <div>
          <h3 className="person-card-name">{person.name}</h3>
          <span className={`badge ${getCategoryBadgeClass(person.category)}`} style={{ marginTop: '0.35rem' }}>
            {person.category}
          </span>
          {person.relationshipNotes && (
            <p className="person-notes-snippet" title={person.relationshipNotes}>
              {person.relationshipNotes}
            </p>
          )}
        </div>

        {isLargeAmount && !isSpecialHighlight && (
          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            Major Record
          </span>
        )}
      </div>

      {/* PROMINENT CEREMONY TRANSACTION FOR SRINU PEDHANANNA */}
      {isSpecialHighlight && primaryTx && (
        <div className="prominent-ceremony-box">
          <div className="ceremony-box-title">
            <AlertCircle size={14} />
            Primary Family Event Transaction
          </div>
          <div className="ceremony-box-amount">{formatINR(primaryTx.amount)}</div>
          <div className="ceremony-box-desc">
            {primaryTx.reason}
          </div>
          <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem' }}>
            <span className="badge badge-family-debt" style={{ fontSize: '0.7rem' }}>
              Family Debt
            </span>
            <span className="badge badge-informational" style={{ fontSize: '0.7rem' }}>
              Ceremony & Dues
            </span>
          </div>
        </div>
      )}

      {/* Yerammma Indirect Notice */}
      {person.name === 'Yerammma' && (
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.5rem 0.65rem', 
          marginBottom: '0.75rem',
          fontSize: '0.785rem',
          color: '#166534',
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center'
        }}>
          <Info size={14} flexShrink={0} />
          <span>Indirect: Not directly received by Hari</span>
        </div>
      )}

      {/* Financial Metrics Breakdown */}
      <div className="person-card-metrics">
        <div className="metric-row">
          <span className="metric-label">Total Recorded:</span>
          <span className="metric-value highlight-total">{formatINR(totalRecorded)}</span>
        </div>

        {confirmedDebt > 0 && (
          <div className="metric-row">
            <span className="metric-label">Confirmed Debt:</span>
            <span className="metric-value" style={{ color: '#b91c1c' }}>{formatINR(confirmedDebt)}</span>
          </div>
        )}

        {confirmedOutstanding > 0 && (
          <div className="metric-row">
            <span className="metric-label">Confirmed Outstanding:</span>
            <span className="metric-value" style={{ color: '#dc2626' }}>{formatINR(confirmedOutstanding)}</span>
          </div>
        )}

        {familyDebt > 0 && (
          <div className="metric-row">
            <span className="metric-label">Family / Father Dues:</span>
            <span className="metric-value" style={{ color: '#c2410c' }}>{formatINR(familyDebt)}</span>
          </div>
        )}

        {indirectAmount > 0 && (
          <div className="metric-row">
            <span className="metric-label">Indirect Amount:</span>
            <span className="metric-value" style={{ color: '#15803d' }}>{formatINR(indirectAmount)}</span>
          </div>
        )}

        {unconfirmedAmount > 0 && (
          <div className="metric-row">
            <span className="metric-label">Unconfirmed Amount:</span>
            <span className="metric-value highlight-unconfirmed">{formatINR(unconfirmedAmount)}</span>
          </div>
        )}

        {totalRepaid > 0 && (
          <div className="metric-row">
            <span className="metric-label">Total Repaid:</span>
            <span className="metric-value highlight-repaid">-{formatINR(totalRepaid)}</span>
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="person-card-footer">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
        </span>
        <button 
          type="button" 
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
