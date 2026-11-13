import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  FileSpreadsheet, 
  HardDrive, 
  ShieldAlert, 
  CheckCircle2,
  Database,
  ShieldCheck,
  History,
  Lock,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  downloadJsonBackup, 
  parseAndValidateBackup,
  getRecentSnapshots,
  checkStoragePersistence,
  requestStoragePersistence
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
  onRestoreSnapshot,
  onResetToInitial,
  showToast
}) {
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);

  // Storage Persistence Status
  const [storageStatus, setStorageStatus] = useState({
    isPersisted: false,
    usage: null,
    quota: null,
    loading: true
  });

  // Recent Auto-Backup Snapshots from IndexedDB
  const [snapshots, setSnapshots] = useState([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(true);

  // Load storage health and snapshots on mount
  useEffect(() => {
    refreshStorageInfo();
  }, [people.length, transactions.length]);

  const refreshStorageInfo = async () => {
    try {
      const perm = await checkStoragePersistence();
      setStorageStatus({
        isPersisted: perm.isPersisted,
        usage: perm.usage,
        quota: perm.quota,
        loading: false
      });

      const list = await getRecentSnapshots();
      setSnapshots(list);
      setLoadingSnapshots(false);
    } catch (err) {
      console.warn('Error loading storage info:', err);
      setStorageStatus(prev => ({ ...prev, loading: false }));
      setLoadingSnapshots(false);
    }
  };

  const handleRequestPersistence = async () => {
    const granted = await requestStoragePersistence();
    if (granted) {
      showToast('Browser persistent storage granted! Records are protected from automatic eviction.', 'success');
    } else {
      showToast('Browser did not grant persistence automatically. Please keep manual JSON backups.', 'warning');
    }
    refreshStorageInfo();
  };

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

  const handleRestoreHistoricalSnapshot = (snapshot) => {
    if (!snapshot || !snapshot.data) return;
    const confirmMsg = `Restore snapshot from ${new Date(snapshot.timestamp).toLocaleString()} (${snapshot.peopleCount} people, ${snapshot.transactionCount} transactions)?`;
    if (window.confirm(confirmMsg)) {
      onRestoreSnapshot(snapshot.data);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Data Storage, Backups & Settings</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
          Manage local records, configure dual persistent storage, and access automatic backup snapshots.
        </p>
      </div>

      {/* Storage Shield Status Card */}
      <div style={{
        backgroundColor: storageStatus.isPersisted ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${storageStatus.isPersisted ? '#bbf7d0' : '#fde68a'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              background: storageStatus.isPersisted ? '#dcfce7' : '#fef3c7', 
              color: storageStatus.isPersisted ? '#16a34a' : '#d97706',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {storageStatus.isPersisted ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: storageStatus.isPersisted ? '#166534' : '#92400e', marginBottom: '0.35rem' }}>
                Dual-Storage Engine Status: {storageStatus.isPersisted ? 'Fully Protected & Persistent' : 'Protected (LocalStorage + IndexedDB Mirror)'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: storageStatus.isPersisted ? '#14532d' : '#78350f', lineHeight: 1.5 }}>
                Every change you make is saved instantly across <strong>HTML5 LocalStorage</strong> and a secondary <strong>IndexedDB database</strong> with automated rolling snapshots.
              </p>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                <span>• <strong>HTML5 LocalStorage:</strong> Active</span>
                <span>• <strong>IndexedDB Dual Mirror:</strong> Active</span>
                <span>• <strong>Browser Eviction Shield:</strong> {storageStatus.isPersisted ? 'Granted (Safe from automatic wipe)' : 'Standard'}</span>
              </div>
            </div>
          </div>

          {!storageStatus.isPersisted && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleRequestPersistence}
              style={{ alignSelf: 'flex-start', background: '#fff' }}
            >
              <Lock size={15} />
              <span>Enable Browser Eviction Shield</span>
            </button>
          )}
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
              Contains all {people.length} people, {transactions.length} transactions, repayments, notes, and exact classification metadata.
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

      {/* Auto-Backup Snapshots History */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Automatic Rolling Snapshots (IndexedDB)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                System automatically takes snapshots every time you add, edit, or delete records.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={refreshStorageInfo}
            title="Refresh snapshot list"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingSnapshots ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', padding: '1rem 0' }}>Loading snapshots...</div>
        ) : snapshots.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', padding: '1rem 0' }}>
            No snapshots recorded yet. Make any change to automatically create your first snapshot.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Saved At</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Trigger</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>People</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Transactions</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Repayments</th>
                  <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.slice(0, 8).map((snap, idx) => (
                  <tr key={snap.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: idx === 0 ? 600 : 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="var(--text-subtle)" />
                        <span>{new Date(snap.timestamp).toLocaleString()}</span>
                        {idx === 0 && <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>Latest</span>}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-subtle)' }}>{snap.trigger}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{snap.peopleCount}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{snap.transactionCount}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{snap.repaymentCount}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
                        onClick={() => handleRestoreHistoricalSnapshot(snap)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Why did records disappear before? (Explainer Guide) */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <HelpCircle size={20} color="var(--primary-600)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Why Did Data Previously Disappear After a Few Hours or Days?
          </h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.6rem' }}>
            If you experienced records disappearing after some time, here is what typically happened:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>
              <strong>Mobile In-App Browsers:</strong> If you opened your tracker link from an app like WhatsApp, Telegram, or Gmail, the app opens it in a temporary in-app webview. When the app is closed, that temporary storage is wiped. <em>Tip: Always open in standard Chrome or Safari, or tap "Add to Home Screen".</em>
            </li>
            <li>
              <strong>Different Devices or Browsers:</strong> Browser storage lives exclusively on the specific phone or computer and browser profile you entered it in. If you added data on your phone, it will not appear on your laptop unless you transfer a JSON backup.
            </li>
            <li>
              <strong>Browser Storage Eviction & Safari ITP:</strong> Without persistence permission, mobile Safari and browsers under storage pressure delete client-side storage after 7 days of inactivity. We now auto-request the browser eviction shield and mirror all records to IndexedDB.
            </li>
            <li>
              <strong>Vite Port Switching (Local Dev):</strong> When running locally, if port 3000 was busy, Vite would silently start on port 3001 (which has a separate empty storage origin). We have locked the port to 3000 to prevent this.
            </li>
          </ul>
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
