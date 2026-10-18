import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { VERIFIED_BENCHMARKS } from '../data/initialData';

export default function VerificationModal({ 
  people = [], 
  totals, 
  diagnostics, 
  onClose,
  onResetToInitial
}) {
  const { isValid, mismatches = [] } = diagnostics || {};

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={24} color={isValid ? '#16a34a' : '#d97706'} />
              <h2>Financial Audit & Benchmark Verification</h2>
            </div>
            <p>Real-time reconciliation of individual transactions against baseline verified totals.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status summary banner */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isValid ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${isValid ? '#bbf7d0' : '#fde68a'}`,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {isValid ? (
              <CheckCircle2 size={24} color="#16a34a" flexShrink={0} />
            ) : (
              <AlertTriangle size={24} color="#d97706" flexShrink={0} />
            )}
            <div>
              <h4 style={{ color: isValid ? '#166534' : '#92400e', fontWeight: 700, fontSize: '0.95rem' }}>
                {isValid 
                  ? 'All 18 People & Grand Totals Match 100% Perfectly' 
                  : `Active Data Variance (${mismatches.length} Difference${mismatches.length > 1 ? 's' : ''})`}
              </h4>
              <p style={{ color: isValid ? '#15803d' : '#78350f', fontSize: '0.85rem' }}>
                {isValid 
                  ? `Grand Total Recorded is exactly ${formatINR(VERIFIED_BENCHMARKS.grandTotal)}. All 53 transaction amounts sum accurately with 0 paise discrepancy.` 
                  : 'You have added, edited, or modified records since initial seeding. The audit table below highlights current totals vs initial benchmarks.'}
              </p>
            </div>
          </div>

          {/* Category Summary Verification */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Category Level Verification
          </h3>
          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Expected Total</th>
                  <th>Calculated Total</th>
                  <th>Variance</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(VERIFIED_BENCHMARKS.categoryTotals).map(([cat, expected]) => {
                  const actual = totals?.categoryBreakdown[cat]?.totalRecorded || 0;
                  const diff = actual - expected;
                  const isCatMatch = diff === 0;

                  return (
                    <tr key={cat}>
                      <td><strong>{cat}</strong></td>
                      <td className="amount-cell">{formatINR(expected)}</td>
                      <td className="amount-cell">{formatINR(actual)}</td>
                      <td className="amount-cell" style={{ color: isCatMatch ? 'var(--text-subtle)' : '#dc2626' }}>
                        {diff === 0 ? '₹0' : (diff > 0 ? `+${formatINR(diff)}` : formatINR(diff))}
                      </td>
                      <td>
                        <span className={`badge ${isCatMatch ? 'badge-indirect' : 'badge-unconfirmed'}`}>
                          {isCatMatch ? 'VERIFIED' : 'VARIANCE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#fafbfc', fontWeight: 700 }}>
                  <td>GRAND TOTAL RECORDED</td>
                  <td className="amount-cell" style={{ color: 'var(--primary-700)' }}>
                    {formatINR(VERIFIED_BENCHMARKS.grandTotal)}
                  </td>
                  <td className="amount-cell" style={{ color: 'var(--primary-700)' }}>
                    {formatINR(totals?.totalRecorded)}
                  </td>
                  <td className="amount-cell">
                    {totals?.totalRecorded - VERIFIED_BENCHMARKS.grandTotal === 0 ? '₹0' : formatINR(totals?.totalRecorded - VERIFIED_BENCHMARKS.grandTotal)}
                  </td>
                  <td>
                    <span className={`badge ${totals?.totalRecorded === VERIFIED_BENCHMARKS.grandTotal ? 'badge-indirect' : 'badge-unconfirmed'}`}>
                      {totals?.totalRecorded === VERIFIED_BENCHMARKS.grandTotal ? 'PERFECT MATCH' : 'VARIANCE'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Individual Person Audit */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Individual Person Benchmark Audit
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Person Name</th>
                  <th>Category</th>
                  <th>Expected Total</th>
                  <th>Current Recorded</th>
                  <th>Tx Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {people.map(person => {
                  const expected = VERIFIED_BENCHMARKS.personTotals[person.name];
                  const m = totals?.personMetrics[person.id] || {};
                  const actual = m.totalRecorded || 0;
                  const isMatch = expected !== undefined && actual === expected;

                  return (
                    <tr key={person.id}>
                      <td>
                        <strong>{person.name}</strong>
                        {person.isHighlighted && (
                          <span className="badge badge-special-record" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                            Highlighted
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-informational" style={{ fontSize: '0.75rem' }}>
                          {person.category}
                        </span>
                      </td>
                      <td className="amount-cell">
                        {expected !== undefined ? formatINR(expected) : 'Custom Person'}
                      </td>
                      <td className="amount-cell">
                        {formatINR(actual)}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {m.transactionCount || 0}
                      </td>
                      <td>
                        {expected === undefined ? (
                          <span className="badge badge-informational">New Person</span>
                        ) : isMatch ? (
                          <span className="badge badge-indirect">
                            <CheckCircle2 size={12} />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="badge badge-personal-debt">
                            Diff: {formatINR(actual - expected)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onResetToInitial}
            title="Reset any experimental changes back to the exact verified starting state"
          >
            <RefreshCw size={14} />
            <span>Reset to Verified Initial Dataset</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
