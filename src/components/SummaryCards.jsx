import React from 'react';
import { 
  CircleDollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  HelpCircle, 
  Info,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function SummaryCards({ totals, diagnostics, onOpenVerification }) {
  const {
    totalRecorded,
    confirmedOutstanding,
    totalRepaid,
    peopleCount,
    unconfirmedCount,
    familyDebt,
    indirectAmount
  } = totals;

  const isVerified = diagnostics?.isValid;

  return (
    <div className="summary-section">
      {/* Required Disclaimer Banner */}
      <div className="disclaimer-banner">
        <div className="disclaimer-icon">
          <Info size={22} />
        </div>
        <div className="disclaimer-content">
          <h3>Record Classification Context</h3>
          <p>
            The <strong>Total Recorded Amount</strong> is the aggregate sum of all listed historical records ({formatINR(totalRecorded)}).
            It is <strong>NOT</strong> automatically the amount Hari currently owes. Some records relate to his father's old dues,
            family function expenditures, and one record was not directly received by him. 
            Until ownership and repayment status are individually confirmed, they remain categorized separately under 
            Family Debt, Indirect, or Unconfirmed.
          </p>
        </div>
      </div>

      {/* Verification Ribbon */}
      <div className="verification-status-ribbon">
        <div className="ribbon-status">
          <span className={`status-indicator ${isVerified ? 'verified' : 'mismatch'}`} />
          <span>
            {isVerified 
              ? 'System Diagnostics: All individual and category totals match verified benchmarks (₹5,72,630 grand total).' 
              : `System Diagnostics: Custom modifications active (${diagnostics?.mismatches?.length || 0} variance from initial benchmarks).`}
          </span>
        </div>
        <button 
          type="button" 
          className="btn btn-secondary btn-sm"
          onClick={onOpenVerification}
        >
          <ShieldCheck size={15} />
          <span>View Verification Audit</span>
        </button>
      </div>

      {/* 5 Primary Summary Cards */}
      <div className="summary-grid">
        {/* 1. Total Recorded Amount */}
        <div className="summary-card accent-recorded">
          <div className="summary-card-header">
            <span className="summary-card-title">Total Recorded Amount</span>
            <div className="summary-card-icon icon-blue">
              <CircleDollarSign size={18} />
            </div>
          </div>
          <div className="summary-card-value">{formatINR(totalRecorded)}</div>
          <div className="summary-card-subtitle">
            Sum of all 53 historical records
          </div>
        </div>

        {/* 2. Confirmed Outstanding Balance */}
        <div className="summary-card accent-confirmed">
          <div className="summary-card-header">
            <span className="summary-card-title">Confirmed Balance</span>
            <div className="summary-card-icon icon-red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="summary-card-value">{formatINR(confirmedOutstanding)}</div>
          <div className="summary-card-subtitle">
            Personal debt minus repayments
          </div>
        </div>

        {/* 3. Total Amount Repaid */}
        <div className="summary-card accent-repaid">
          <div className="summary-card-header">
            <span className="summary-card-title">Total Amount Repaid</span>
            <div className="summary-card-icon icon-green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="summary-card-value">{formatINR(totalRepaid)}</div>
          <div className="summary-card-subtitle">
            Recorded partial/full repayments
          </div>
        </div>

        {/* 4. Number of People */}
        <div className="summary-card accent-people">
          <div className="summary-card-header">
            <span className="summary-card-title">Recorded People</span>
            <div className="summary-card-icon icon-purple">
              <Users size={18} />
            </div>
          </div>
          <div className="summary-card-value">{peopleCount}</div>
          <div className="summary-card-subtitle">
            Close Family, Outer Family & Friends
          </div>
        </div>

        {/* 5. Number of Unconfirmed Records */}
        <div className="summary-card accent-unconfirmed">
          <div className="summary-card-header">
            <span className="summary-card-title">Unconfirmed Records</span>
            <div className="summary-card-icon icon-amber">
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="summary-card-value">{unconfirmedCount}</div>
          <div className="summary-card-subtitle">
            Pending verification of ownership/reason
          </div>
        </div>
      </div>
    </div>
  );
}
