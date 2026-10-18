import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { loadAppData, saveAppData, resetToInitialDataset } from './services/storageService';
import { calculateOverallTotals, runDatasetDiagnostics } from './utils/calculations';
import { formatINR } from './utils/currency';

export default function App() {
  // Core persistent data
  const [people, setPeople] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadAppData();
    setPeople(loaded.people);
    setTransactions(loaded.transactions);
    setRepayments(loaded.repayments || []);
    setIsLoaded(true);

    if (loaded.loadError) {
      showToast(loaded.loadError, 'warning');
    }
  }, [showToast]);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveAppData(people, transactions, repayments);
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
    setPeople(prev => [...prev, newPerson]);
    setIsAddPersonOpen(false);
    showToast(`Added ${newPerson.name} to ${newPerson.category}.`, 'success');
  };

  const handleUpdatePerson = (updatedPerson) => {
    setPeople(prev => prev.map(p => p.id === updatedPerson.id ? updatedPerson : p));
    setPersonToEdit(null);
    showToast(`Updated details for ${updatedPerson.name}.`, 'success');
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
        setPeople(prev => prev.filter(p => p.id !== person.id));
        setTransactions(prev => prev.filter(t => t.personId !== person.id));
        setRepayments(prev => prev.filter(r => r.personId !== person.id));
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
    setTransactions(prev => [...prev, newTx]);
    setIsAddTxOpen(false);
    const person = people.find(p => p.id === newTx.personId);
    showToast(`Recorded ${formatINR(newTx.amount)} for ${person?.name || 'person'}.`, 'success');
  };

  const handleOpenEditTx = (tx) => {
    setTxToEdit(tx);
  };

  const handleUpdateTx = (updatedTx) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setTxToEdit(null);
    showToast(`Transaction updated successfully.`, 'success');
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
        setTransactions(prev => prev.filter(t => t.id !== tx.id));
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
    setRepayments(prev => [...prev, newRepayment]);
    setIsRecordRepaymentOpen(false);
    const person = people.find(p => p.id === newRepayment.personId);
    showToast(`Recorded repayment of ${formatINR(newRepayment.amount)} for ${person?.name || 'person'}.`, 'success');
  };

  const handleOpenEditRepayment = (repay) => {
    setRepaymentToEdit(repay);
  };

  const handleUpdateRepayment = (updatedRepayment) => {
    setRepayments(prev => prev.map(r => r.id === updatedRepayment.id ? updatedRepayment : r));
    setRepaymentToEdit(null);
    showToast(`Repayment record updated.`, 'success');
  };

  const handleDeleteRepayment = (repay) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Repayment Record',
      message: `Are you sure you want to delete this repayment of ${formatINR(repay.amount)}? The confirmed outstanding balance will increase accordingly.`,
      confirmText: 'Delete Repayment',
      isDanger: true,
      onConfirm: () => {
        setRepayments(prev => prev.filter(r => r.id !== repay.id));
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
    setSelectedPersonId(null);
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
