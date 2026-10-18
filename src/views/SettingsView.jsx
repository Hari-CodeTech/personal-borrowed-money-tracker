import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  FileSpreadsheet, 
  HardDrive, 
  ShieldAlert, 
  CheckCircle2,
  Database
} from 'lucide-react';
import { 
  downloadJsonBackup, 
  parseAndValidateBackup 
} from '../services/storageService';
import { 
  exportTransactionsToCSV, 
  exportPeopleSummaryToCSV 
} from '../utils/csvExport';

export default function SettingsView({
  people = [],
  transactions = [],
  repayments = [],
  totals,
  onImportData,
  onResetToInitial,
  showToast
}) {
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleExportJSON = () => {
    downloadJsonBackup(people, transactions, repayments);
    showToast('Full JSON backup downloaded successfully.', 'success');
  };

  const handleExportTransactionsCSV = () => {
    exportTransactionsToCSV(transactions, people);
    showToast('Transactions CSV downloaded.', 'success');
  };

  const handleExportSummaryCSV = () => {
    exportPeopleSummaryToCSV(people, totals.personMetrics);
    showToast('People Summary CSV downloaded.', 'success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseAndValidateBackup(event.target.result);
      if (!result.success) {
        setImportError(result.error);
        setImportPreview(null);
      } else {
        setImportPreview(result);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPreview || !importPreview.data) return;

    // First create safety backup of current data
    downloadJsonBackup(people, transactions, repayments);

    // Apply imported data
    onImportData(importPreview.data);
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Backup restored successfully. A safety copy of previous data was saved.', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Data Storage, Backups & Settings</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
          Manage local records, generate portable backups, export spreadsheets, and configure storage.
        </p>
      </div>

      {/* Critical Storage Advisory Banner */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <ShieldAlert size={26} color="#d97706" flexShrink={0} />
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>
            Important LocalStorage Advisory & Data Safeguards
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5, marginBottom: '0.5rem' }}>
            Your records are stored securely inside your browser's persistent <strong>HTML5 localStorage</strong>. 
            Clearing your browser's history, cookies, or site cache can erase this local database.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
            <strong>Device Synchronization Note:</strong> Browser localStorage is local to this specific device and browser profile.
            It does <em>not</em> automatically synchronize to other phones or computers. Please maintain regular 
            <strong>.json backups</strong> using the export button below.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Backup & Export Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Export Backups</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Download portable offline archives</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <button type="button" className="btn btn-primary" onClick={handleExportJSON}>
              <Download size={16} />
              <span>Download Full JSON Backup</span>
            </button>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-subtle)' }}>
              Contains all 18 people, all 53+ transactions, repayments, notes, and exact classification metadata.
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0.4rem 0' }} />

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportTransactionsCSV} style={{ flex: 1 }}>
                <FileSpreadsheet size={15} />
                <span>Transactions CSV</span>
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportSummaryCSV} style={{ flex: 1 }}>
                <FileSpreadsheet size={15} />
                <span>Summary CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Restore / Import Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--success-50)', color: 'var(--success-600)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Restore JSON Backup</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Import a previously saved .json archive</p>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Select Backup JSON File</span>
            </button>

            {importError && (
              <div className="form-error" style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)' }}>
                <AlertTriangle size={15} />
                <span>{importError}</span>
              </div>
            )}

            {/* Import Preview Modal / Card */}
            {importPreview && (
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem',
                background: '#f8fafc',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Validated Backup Archive
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                  • {importPreview.stats.peopleCount} People<br />
                  • {importPreview.stats.transactionCount} Transactions<br />
                  • {importPreview.stats.repaymentCount} Repayments<br />
                  • Archive Export Date: {importPreview.stats.exportedAt}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleConfirmImport}
                  >
                    <span>Confirm & Restore</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setImportPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Reset Section */}
      <div style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid #fee2e2', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.25rem 1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b' }}>
            Reset to Verified Benchmark Dataset
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
            Restores all 18 people and 53 historical transactions totaling ₹5,72,630 exactly as specified in the original record.
          </p>
        </div>

        <button 
          type="button" 
          className="btn btn-outline-danger btn-sm"
          onClick={onResetToInitial}
        >
          <RefreshCw size={14} />
          <span>Reset to Initial Records</span>
        </button>
      </div>
    </div>
  );
}
