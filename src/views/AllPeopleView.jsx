import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Filter, ArrowUpDown, ChevronRight, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { CATEGORIES } from '../data/initialData';

export default function AllPeopleView({ 
  people = [], 
  personMetrics = {}, 
  onSelectPerson,
  onAddPerson 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [debtFilter, setDebtFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');

  const filteredPeople = useMemo(() => {
    let list = [...people];

    // Search
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.relationshipNotes && p.relationshipNotes.toLowerCase().includes(q))
      );
    }

    // Category
    if (categoryFilter !== 'ALL') {
      list = list.filter(p => p.category === categoryFilter);
    }

    // Debt filter
    if (debtFilter === 'CONFIRMED') {
      list = list.filter(p => (personMetrics[p.id]?.confirmedOutstanding || 0) > 0);
    } else if (debtFilter === 'FAMILY') {
      list = list.filter(p => (personMetrics[p.id]?.familyDebt || 0) > 0);
    } else if (debtFilter === 'UNCONFIRMED') {
      list = list.filter(p => (personMetrics[p.id]?.unconfirmedAmount || 0) > 0);
    } else if (debtFilter === 'REPAID') {
      list = list.filter(p => (personMetrics[p.id]?.totalRepaid || 0) > 0);
    }

    // Sort
    list.sort((a, b) => {
      const mA = personMetrics[a.id] || {};
      const mB = personMetrics[b.id] || {};

      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'amount-desc':
          return (mB.totalRecorded || 0) - (mA.totalRecorded || 0);
        case 'amount-asc':
          return (mA.totalRecorded || 0) - (mB.totalRecorded || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [people, searchTerm, categoryFilter, debtFilter, sortBy, personMetrics]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>All People ({people.length})</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
            Complete directory of all family members and friends with recorded financial transactions.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onAddPerson}>
          <UserPlus size={16} />
          <span>Add New Person</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or relationship notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-sort-group">
          {/* Category Filter */}
          <select
            className="select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories</option>
            {Object.values(CATEGORIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Debt Classification Filter */}
          <select
            className="select-control"
            value={debtFilter}
            onChange={(e) => setDebtFilter(e.target.value)}
            aria-label="Filter by record type"
          >
            <option value="ALL">All Record Statuses</option>
            <option value="CONFIRMED">Has Confirmed Balance</option>
            <option value="FAMILY">Has Family/Father Dues</option>
            <option value="UNCONFIRMED">Has Unconfirmed Records</option>
            <option value="REPAID">Has Recorded Repayments</option>
          </select>

          {/* Sort */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort people"
          >
            <option value="name-asc">Sort Name (A → Z)</option>
            <option value="name-desc">Sort Name (Z → A)</option>
            <option value="amount-desc">Recorded (High → Low)</option>
            <option value="amount-asc">Recorded (Low → High)</option>
          </select>
        </div>
      </div>

      {/* People Directory Table */}
      {filteredPeople.length === 0 ? (
        <div className="empty-state">
          <h3>No people match your filters</h3>
          <p>Try clearing your search query or changing your category filters.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Person Name</th>
                <th>Category</th>
                <th>Total Recorded</th>
                <th>Confirmed Outstanding</th>
                <th>Family Dues</th>
                <th>Unconfirmed</th>
                <th>Repaid</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map(person => {
                const m = personMetrics[person.id] || {};
                const isSpecial = person.isHighlighted || person.name === 'Srinu Pedhananna';

                return (
                  <tr 
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    style={{ cursor: 'pointer', backgroundColor: isSpecial ? '#fffdf7' : undefined }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong>{person.name}</strong>
                        {isSpecial && (
                          <span className="badge badge-special-record" style={{ fontSize: '0.65rem' }}>
                            <Sparkles size={10} />
                            Special
                          </span>
                        )}
                      </div>
                      {person.relationshipNotes && (
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                          {person.relationshipNotes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-close-family" style={{ fontSize: '0.75rem' }}>
                        {person.category}
                      </span>
                    </td>
                    <td className="amount-cell" style={{ color: 'var(--primary-700)', fontWeight: 800 }}>
                      {formatINR(m.totalRecorded)}
                    </td>
                    <td className="amount-cell" style={{ color: (m.confirmedOutstanding || 0) > 0 ? '#dc2626' : 'var(--text-subtle)' }}>
                      {formatINR(m.confirmedOutstanding || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: (m.familyDebt || 0) > 0 ? '#c2410c' : 'var(--text-subtle)' }}>
                      {formatINR(m.familyDebt || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: (m.unconfirmedAmount || 0) > 0 ? '#854d0e' : 'var(--text-subtle)' }}>
                      {formatINR(m.unconfirmedAmount || 0)}
                    </td>
                    <td className="amount-cell" style={{ color: (m.totalRepaid || 0) > 0 ? '#16a34a' : 'var(--text-subtle)' }}>
                      {m.totalRepaid > 0 ? `-${formatINR(m.totalRepaid)}` : '₹0'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPerson(person);
                        }}
                      >
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
