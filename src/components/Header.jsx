import React from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  Users, 
  History, 
  BarChart3, 
  Settings, 
  UserPlus, 
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

export default function Header({ 
  activeView, 
  setActiveView, 
  onAddPerson, 
  onAddTransaction,
  isVerified,
  onOpenVerification
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', label: 'All People', icon: Users },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Wallet size={24} />
          </div>
          <div className="brand-text">
            <h1>Personal Borrowed Money Tracker</h1>
            <div className="owner-pill">
              <span>Record Owner:</span>
              <strong>Hari Satya Sai Puvvala</strong>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onOpenVerification}
            title="Check verification against reference data"
          >
            <ShieldCheck size={16} color={isVerified ? '#16a34a' : '#d97706'} />
            <span>{isVerified ? 'Data Verified' : 'Check Totals'}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onAddPerson}
          >
            <UserPlus size={16} />
            <span>Add Person</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={onAddTransaction}
          >
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <nav className="nav-container" aria-label="Main Navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
