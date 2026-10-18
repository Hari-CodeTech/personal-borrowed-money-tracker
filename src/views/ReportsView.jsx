import React from 'react';
import { Download, BarChart3, PieChart, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { exportPeopleSummaryToCSV } from '../utils/csvExport';
import { CATEGORIES } from '../data/initialData';

export default function ReportsView({ 
  people = [], 
  totals, 
  onSelectPerson 
}) {
  const {
    totalRecorded,
    confirmedDebt,
    confirmedOutstanding,
    familyDebt,
    indirectAmount,
    informationalAmount,
    unconfirmedAmount,
    totalRepaid,
    categoryBreakdown,
    personMetrics
  } = totals;

  const handleExportSummaryCSV = () => {
    exportPeopleSummaryToCSV(people, personMetrics);
  };

  // Compute percentages
  const pct = (amount) => {
    if (!totalRecorded || totalRecorded === 0) return 0;
    return Math.min(100, Math.round((amount / totalRecorded) * 100));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Financial Analysis & Reports</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
            Analytical breakdown of recorded amounts across categories, classifications, and individuals.
          </p>
        </div>

        <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportSummaryCSV}>
          <Download size={15} />
          <span>Export Summary CSV</span>
        </button>
      </div>

      {/* Grid: Category Breakdown + Classification Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Category Breakdown Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="var(--primary-600)" />
            <span>Category Distribution</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.values(CATEGORIES).map(cat => {
              const catTotal = categoryBreakdown[cat]?.totalRecorded || 0;
              const percentage = pct(catTotal);

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <strong>{cat}</strong>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {formatINR(catTotal)} ({percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-active)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: cat === CATEGORIES.CLOSE_FAMILY ? '#2563eb' : (cat === CATEGORIES.OUTER_FAMILY ? '#4f46e5' : '#9333ea'),
                        borderRadius: 'var(--radius-full)' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classification Breakdown Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="#d97706" />
            <span>Debt Classification Overview</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                <span>Confirmed Personal Debt</span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(confirmedDebt)} ({pct(confirmedDebt)}%)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c2410c' }} />
                <span>Family / Father Dues</span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(familyDebt)} ({pct(familyDebt)}%)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#854d0e' }} />
                <span>Unconfirmed Records</span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(unconfirmedAmount)} ({pct(unconfirmedAmount)}%)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#166534' }} />
                <span>Indirect (Not Directly Received)</span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(indirectAmount)} ({pct(indirectAmount)}%)</strong>
            </div>

            {informationalAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  <span>Informational Records</span>
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(informationalAmount)}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#16a34a' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} />
                <span>Total Amount Repaid</span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(totalRepaid)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Individual Person Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          Individual Person Account Status
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Category</th>
                <th>Total Recorded</th>
                <th>Confirmed Debt</th>
                <th>Repaid</th>
                <th>Confirmed Balance</th>
                <th>Family Dues</th>
                <th>Unconfirmed</th>
                <th>Indirect</th>
              </tr>
            </thead>
            <tbody>
              {people.map(person => {
                const m = personMetrics[person.id] || {};
                return (
                  <tr 
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <strong>{person.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-informational" style={{ fontSize: '0.75rem' }}>
                        {person.category}
                      </span>
                    </td>
                    <td className="amount-cell" style={{ color: 'var(--primary-700)', fontWeight: 800 }}>
                      {formatINR(m.totalRecorded)}
                    </td>
                    <td className="amount-cell">
                      {formatINR(m.confirmedDebt || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: m.totalRepaid > 0 ? '#16a34a' : 'inherit' }}>
                      {m.totalRepaid > 0 ? `-${formatINR(m.totalRepaid)}` : '₹0'}
                    </td>
                    <td className="amount-cell" style={{ color: m.confirmedOutstanding > 0 ? '#dc2626' : 'inherit', fontWeight: 700 }}>
                      {formatINR(m.confirmedOutstanding || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: m.familyDebt > 0 ? '#c2410c' : 'inherit' }}>
                      {formatINR(m.familyDebt || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: m.unconfirmedAmount > 0 ? '#854d0e' : 'inherit' }}>
                      {formatINR(m.unconfirmedAmount || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: m.indirectAmount > 0 ? '#166534' : 'inherit' }}>
                      {formatINR(m.indirectAmount || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
