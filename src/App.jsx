import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import AllPeopleView from './views/AllPeopleView';
import TransactionHistoryView from './views/TransactionHistoryView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

// Modals
import PersonModal from './components/PersonModal';
import AddPersonModal from './components/AddPersonModal';
import EditPersonModal from './components/EditPersonModal';
import AddTransactionModal from './components/AddTransactionModal';
import EditTransactionModal from './components/EditTransactionModal';
import RecordRepaymentModal from './components/RecordRepaymentModal';
import EditRepaymentModal from './components/EditRepaymentModal';
import ConfirmDialog from './components/ConfirmDialog';
import VerificationModal from './components/VerificationModal';
import Toast from './components/Toast';

// Services & Utils
import { 
  loadAppData, 
  saveAppData, 
  resetToInitialDataset,
  reconcileWithIndexedDB,
  requestStoragePersistence
} from './services/storageService';
import { calculateOverallTotals, runDatasetDiagnostics } from './utils/calculations';
import { formatINR } from './utils/currency';

export default function App() {
  // Core persistent data - initialized directly from verified storage
  const [people, setPeople] = useState(() => {
    const loaded = loadAppData();
    return loaded.people;
  });
  const [transactions, setTransactions] = useState(() => {
    const loaded = loadAppData();
    return loaded.transactions;
  });
  const [repayments, setRepayments] = useState(() => {
    const loaded = loadAppData();
    return loaded.repayments || [];
  });
  const [isLoaded, setIsLoaded] = useState(true);

  // Ref to always hold current state for beforeunload flush
  const stateRef = useRef({ people, transactions, repayments });
  useEffect(() => {
    stateRef.current = { people, transactions, repayments };
  }, [people, transactions, repayments]);

  // Active navigation view: 'dashboard' | 'people' | 'history' | 'reports' | 'settings'
  const [activeView, setActiveView] = useState('dashboard');

  // Selected person for details modal
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  // Modal visibility states
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txTargetPersonId, setTxTargetPersonId] = useState('');
  const [txToEdit, setTxToEdit] = useState(null);
  const [isRecordRepaymentOpen, setIsRecordRepaymentOpen] = useState(false);
  const [repayTargetPersonId, setRepayTargetPersonId] = useState('');
  const [repaymentToEdit, setRepaymentToEdit] = useState(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  // Generic confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    isDanger: true,
    onConfirm: () => {}
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // On initial mount: request browser persistence, reconcile with IndexedDB, and listen for multi-tab updates
  useEffect(() => {
    // 1. Request persistent storage from browser (Chrome, Edge, Safari, Firefox)
    requestStoragePersistence().then(persisted => {
      if (persisted) {
        console.log('Browser persistent storage active: records protected from browser eviction.');
      }
    });

    // 2. Reconcile with IndexedDB in case localStorage was cleared by browser
    reconcileWithIndexedDB(people.length, transactions.length).then(recovered => {
      if (recovered) {
        setPeople(recovered.people);
        setTransactions(recovered.transactions);
        setRepayments(recovered.repayments || []);
        showToast('Restored latest records from protected secondary storage.', 'info');
      }
    });

    // 3. Multi-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === 'pbmt_unified_state_v1' || e.key === 'pbmt_people_v1' || e.key === 'pbmt_transactions_v1') {
        const fresh = loadAppData();
        setPeople(fresh.people);
        setTransactions(fresh.transactions);
        setRepayments(fresh.repayments || []);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Flush to storage before page unloads or tab is closed
    const handleUnload = () => {
      if (stateRef.current.people.length > 0) {
        saveAppData(
          stateRef.current.people, 
          stateRef.current.transactions, 
          stateRef.current.repayments, 
          { trigger: 'page_unload' }
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [people.length, transactions.length, showToast]);

  // Persist whenever state changes (safety net)
  useEffect(() => {
    if (isLoaded && people.length > 0) {
      saveAppData(people, transactions, repayments, { trigger: 'state_effect' });
    }
  }, [people, transactions, repayments, isLoaded]);

  // Calculate real-time financial totals and diagnostics
  const overallTotals = useMemo(() => {
    return calculateOverallTotals(people, transactions, repayments);
  }, [people, transactions, repayments]);

  const diagnostics = useMemo(() => {
    return runDatasetDiagnostics(people, transactions, repayments);
  }, [people, transactions, repayments]);

  // Currently selected person object
  const currentSelectedPerson = useMemo(() => {
    return people.find(p => p.id === selectedPersonId) || null;
  }, [people, selectedPersonId]);

  // ==========================================
  // ACTION HANDLERS: PEOPLE
  // ==========================================
  const handleSaveNewPerson = (newPerson) => {
    const nextPeople = [...people, newPerson];
    setPeople(nextPeople);
    saveAppData(nextPeople, transactions, repayments, { trigger: 'add_person' });
    setIsAddPersonOpen(false);
    showToast(`Added ${newPerson.name} to ${newPerson.category}. Record saved securely.`, 'success');
  };

  const handleUpdatePerson = (updatedPerson) => {
    const nextPeople = people.map(p => p.id === updatedPerson.id ? updatedPerson : p);
    setPeople(nextPeople);
    saveAppData(nextPeople, transactions, repayments, { trigger: 'update_person' });
    setPersonToEdit(null);
    showToast(`Updated details for ${updatedPerson.name}. Record saved.`, 'success');
  };

  const handleDeletePerson = (person) => {
    const personTxs = transactions.filter(t => t.personId === person.id);
    const personRepays = repayments.filter(r => r.personId === person.id);

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${person.name}?`,
      message: `Are you sure you want to delete ${person.name}? This will also delete ${personTxs.length} associated transaction(s) and ${personRepays.length} repayment record(s). This action cannot be undone.`,
      confirmText: 'Delete Person & Records',
      isDanger: true,
      onConfirm: () => {
        const nextPeople = people.filter(p => p.id !== person.id);
        const nextTxs = transactions.filter(t => t.personId !== person.id);
        const nextRepays = repayments.filter(r => r.personId !== person.id);
        setPeople(nextPeople);
        setTransactions(nextTxs);
        setRepayments(nextRepays);
        saveAppData(nextPeople, nextTxs, nextRepays, { trigger: 'delete_person' });
        if (selectedPersonId === person.id) setSelectedPersonId(null);
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        showToast(`Deleted ${person.name} and associated records.`, 'success');
      }
    });
  };

  // ==========================================
  // ACTION HANDLERS: TRANSACTIONS
  // ==========================================
  const handleOpenAddTx = (person = null) => {
    setTxTargetPersonId(person ? person.id : (people[0]?.id || ''));
    setIsAddTxOpen(true);
  };

  const handleSaveNewTx = (newTx) => {
    const nextTxs = [...transactions, newTx];
    setTransactions(nextTxs);
    saveAppData(people, nextTxs, repayments, { trigger: 'add_transaction' });
    setIsAddTxOpen(false);
    const person = people.find(p => p.id === newTx.personId);
    showToast(`Recorded ${formatINR(newTx.amount)} for ${person?.name || 'person'}. Saved permanently.`, 'success');
  };

  const handleOpenEditTx = (tx) => {
    setTxToEdit(tx);
  };

  const handleUpdateTx = (updatedTx) => {
    const nextTxs = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    setTransactions(nextTxs);
    saveAppData(people, nextTxs, repayments, { trigger: 'update_transaction' });
    setTxToEdit(null);
    showToast(`Transaction updated successfully and saved.`, 'success');
  };

  const handleDeleteTx = (tx) => {
    const person = people.find(p => p.id === tx.personId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Transaction Record',
      message: `Delete transaction of ${formatINR(tx.amount)} (${tx.reason}) for ${person?.name || 'person'}? All balances will be recalculated immediately.`,
      confirmText: 'Delete Transaction',
      isDanger: true,
      onConfirm: () => {
        const nextTxs = transactions.filter(t => t.id !== tx.id);
        setTransactions(nextTxs);
        saveAppData(people, nextTxs, repayments, { trigger: 'delete_transaction' });
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        showToast(`Transaction of ${formatINR(tx.amount)} deleted.`, 'success');
      }
    });
  };

  // ==========================================
  // ACTION HANDLERS: REPAYMENTS
  // ==========================================
  const handleOpenRecordRepayment = (person = null) => {
    setRepayTargetPersonId(person ? person.id : (people[0]?.id || ''));
    setIsRecordRepaymentOpen(true);
  };

  const handleSaveNewRepayment = (newRepayment) => {
    const nextRepayments = [...repayments, newRepayment];
    setRepayments(nextRepayments);
    saveAppData(people, transactions, nextRepayments, { trigger: 'add_repayment' });
    setIsRecordRepaymentOpen(false);
    const person = people.find(p => p.id === newRepayment.personId);
    showToast(`Recorded repayment of ${formatINR(newRepayment.amount)} for ${person?.name || 'person'}. Saved.`, 'success');
  };

  const handleOpenEditRepayment = (repay) => {
    setRepaymentToEdit(repay);
  };

  const handleUpdateRepayment = (updatedRepayment) => {
    const nextRepayments = repayments.map(r => r.id === updatedRepayment.id ? updatedRepayment : r);
    setRepayments(nextRepayments);
    saveAppData(people, transactions, nextRepayments, { trigger: 'update_repayment' });
    setRepaymentToEdit(null);
    showToast(`Repayment record updated and saved.`, 'success');
  };

  const handleDeleteRepayment = (repay) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Repayment Record',
      message: `Are you sure you want to delete this repayment of ${formatINR(repay.amount)}? The confirmed outstanding balance will increase accordingly.`,
      confirmText: 'Delete Repayment',
      isDanger: true,
      onConfirm: () => {
        const nextRepayments = repayments.filter(r => r.id !== repay.id);
        setRepayments(nextRepayments);
        saveAppData(people, transactions, nextRepayments, { trigger: 'delete_repayment' });
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        showToast(`Repayment of ${formatINR(repay.amount)} deleted.`, 'success');
      }
    });
  };

  // ==========================================
  // DATA MANAGEMENT & RESTORE
  // ==========================================
  const handleImportBackup = (importedData) => {
    setPeople(importedData.people);
    setTransactions(importedData.transactions);
    setRepayments(importedData.repayments || []);
    saveAppData(importedData.people, importedData.transactions, importedData.repayments || [], { trigger: 'import_backup' });
    setSelectedPersonId(null);
    showToast('Backup restored and committed to permanent storage.', 'success');
  };

  const handleRestoreSnapshot = (snapshotData) => {
    if (!snapshotData || !snapshotData.people || !snapshotData.transactions) return;
    setPeople(snapshotData.people);
    setTransactions(snapshotData.transactions);
    setRepayments(snapshotData.repayments || []);
    saveAppData(snapshotData.people, snapshotData.transactions, snapshotData.repayments || [], { trigger: 'restore_snapshot' });
    setSelectedPersonId(null);
    showToast('Auto-backup snapshot restored successfully.', 'success');
  };

  const handleResetToInitial = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Verified Initial Dataset?',
      message: 'This will reset all records back to the verified initial dataset of 18 people and 53 transactions (Total: ₹5,72,630). Any new custom transactions or repayments will be replaced.',
      confirmText: 'Reset to Benchmark Dataset',
      isDanger: true,
      onConfirm: () => {
        const reset = resetToInitialDataset();
        setPeople(reset.people);
        setTransactions(reset.transactions);
        setRepayments(reset.repayments);
        setSelectedPersonId(null);
        setIsVerificationOpen(false);
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        showToast('Application reset to initial verified dataset (₹5,72,630).', 'success');
      }
    });
  };

  return (
    <div className="app-layout">
      {/* Header with Title, Hari Satya Sai Puvvala, Nav, and Quick Action buttons */}
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        onAddPerson={() => setIsAddPersonOpen(true)}
        onAddTransaction={() => handleOpenAddTx(null)}
        isVerified={diagnostics.isValid}
        onOpenVerification={() => setIsVerificationOpen(true)}
      />

      {/* Main View Area */}
      <main className="main-content">
        {activeView === 'dashboard' && (
          <DashboardView 
            people={people}
            transactions={transactions}
            repayments={repayments}
            totals={overallTotals}
            diagnostics={diagnostics}
            onSelectPerson={(person) => setSelectedPersonId(person.id)}
            onAddPerson={() => setIsAddPersonOpen(true)}
            onAddTransaction={() => handleOpenAddTx(null)}
            onOpenVerification={() => setIsVerificationOpen(true)}
          />
        )}

        {activeView === 'people' && (
          <AllPeopleView 
            people={people}
            personMetrics={overallTotals.personMetrics}
            onSelectPerson={(person) => setSelectedPersonId(person.id)}
            onAddPerson={() => setIsAddPersonOpen(true)}
          />
        )}

        {activeView === 'history' && (
          <TransactionHistoryView 
            transactions={transactions}
            repayments={repayments}
            people={people}
            onEditTransaction={handleOpenEditTx}
            onDeleteTransaction={handleDeleteTx}
            onEditRepayment={handleOpenEditRepayment}
            onDeleteRepayment={handleDeleteRepayment}
            onAddTransaction={() => handleOpenAddTx(null)}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView 
            people={people}
            totals={overallTotals}
            onSelectPerson={(person) => setSelectedPersonId(person.id)}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView 
            people={people}
            transactions={transactions}
            repayments={repayments}
            totals={overallTotals}
            onImportData={handleImportBackup}
            onRestoreSnapshot={handleRestoreSnapshot}
            onResetToInitial={handleResetToInitial}
            showToast={showToast}
          />
        )}
      </main>

      {/* Person Details Modal */}
      {currentSelectedPerson && (
        <PersonModal 
          person={currentSelectedPerson}
          metrics={overallTotals.personMetrics[currentSelectedPerson.id]}
          onClose={() => setSelectedPersonId(null)}
          onAddTransaction={() => handleOpenAddTx(currentSelectedPerson)}
          onRecordRepayment={() => handleOpenRecordRepayment(currentSelectedPerson)}
          onEditPerson={(p) => setPersonToEdit(p)}
          onDeletePerson={handleDeletePerson}
          onEditTransaction={handleOpenEditTx}
          onDeleteTransaction={handleDeleteTx}
          onEditRepayment={handleOpenEditRepayment}
          onDeleteRepayment={handleDeleteRepayment}
        />
      )}

      {/* Add Person Modal */}
      {isAddPersonOpen && (
        <AddPersonModal 
          existingPeople={people}
          onClose={() => setIsAddPersonOpen(false)}
          onSave={handleSaveNewPerson}
        />
      )}

      {/* Edit Person Modal */}
      {personToEdit && (
        <EditPersonModal 
          person={personToEdit}
          existingPeople={people}
          onClose={() => setPersonToEdit(null)}
          onSave={handleUpdatePerson}
        />
      )}

      {/* Add Transaction Modal */}
      {isAddTxOpen && (
        <AddTransactionModal 
          people={people}
          selectedPersonId={txTargetPersonId}
          onClose={() => setIsAddTxOpen(false)}
          onSave={handleSaveNewTx}
        />
      )}

      {/* Edit Transaction Modal */}
      {txToEdit && (
        <EditTransactionModal 
          transaction={txToEdit}
          people={people}
          onClose={() => setTxToEdit(null)}
          onSave={handleUpdateTx}
        />
      )}

      {/* Record Repayment Modal */}
      {isRecordRepaymentOpen && (
        <RecordRepaymentModal 
          people={people}
          selectedPersonId={repayTargetPersonId}
          personMetrics={overallTotals.personMetrics}
          onClose={() => setIsRecordRepaymentOpen(false)}
          onSave={handleSaveNewRepayment}
        />
      )}

      {/* Edit Repayment Modal */}
      {repaymentToEdit && (
        <EditRepaymentModal 
          repayment={repaymentToEdit}
          people={people}
          onClose={() => setRepaymentToEdit(null)}
          onSave={handleUpdateRepayment}
        />
      )}

      {/* Verification & Benchmark Audit Modal */}
      {isVerificationOpen && (
        <VerificationModal 
          people={people}
          totals={overallTotals}
          diagnostics={diagnostics}
          onClose={() => setIsVerificationOpen(false)}
          onResetToInitial={handleResetToInitial}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
