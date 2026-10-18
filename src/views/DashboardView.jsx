import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter, UserPlus, PlusCircle } from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import CategorySection from '../components/CategorySection';
import { CATEGORIES } from '../data/initialData';

export default function DashboardView({ 
  people = [], 
  transactions = [], 
  repayments = [], 
  totals, 
  diagnostics,
  onSelectPerson,
  onAddPerson,
  onAddTransaction,
  onOpenVerification
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'amount-desc' | 'amount-asc'

  // Filter and sort people
  const processedPeople = useMemo(() => {
    let list = [...people];

    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.relationshipNotes && p.relationshipNotes.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      const metricsA = totals.personMetrics[a.id] || {};
      const metricsB = totals.personMetrics[b.id] || {};

      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'amount-desc':
          return (metricsB.totalRecorded || 0) - (metricsA.totalRecorded || 0);
        case 'amount-asc':
          return (metricsA.totalRecorded || 0) - (metricsB.totalRecorded || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [people, searchTerm, sortBy, totals.personMetrics]);

  // Group by categories
  const closeFamily = processedPeople.filter(p => p.category === CATEGORIES.CLOSE_FAMILY);
  const outerFamily = processedPeople.filter(p => p.category === CATEGORIES.OUTER_FAMILY);
  const friends = processedPeople.filter(p => p.category === CATEGORIES.FRIENDS);

  return (
    <div>
      {/* 5 KPI Summary Cards & Context */}
      <SummaryCards 
        totals={totals}
        diagnostics={diagnostics}
        onOpenVerification={onOpenVerification}
      />

      {/* Controls Bar: Search & Sort */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search person by name (e.g. Harsha, Bhagravi, Srinu Pedhananna, Vasu...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-sort-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={16} color="var(--text-subtle)" />
            <select
              className="select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort people"
            >
              <option value="name-asc">Sort by Name (A → Z)</option>
              <option value="name-desc">Sort by Name (Z → A)</option>
              <option value="amount-desc">Sort by Recorded Amount (High → Low)</option>
              <option value="amount-asc">Sort by Recorded Amount (Low → High)</option>
            </select>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={onAddTransaction}
          >
            <PlusCircle size={15} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <CategorySection
        category={CATEGORIES.CLOSE_FAMILY}
        people={closeFamily}
        personMetrics={totals.personMetrics}
        onSelectPerson={onSelectPerson}
        defaultExpanded={true}
      />

      <CategorySection
        category={CATEGORIES.OUTER_FAMILY}
        people={outerFamily}
        personMetrics={totals.personMetrics}
        onSelectPerson={onSelectPerson}
        defaultExpanded={true}
      />

      <CategorySection
        category={CATEGORIES.FRIENDS}
        people={friends}
        personMetrics={totals.personMetrics}
        onSelectPerson={onSelectPerson}
        defaultExpanded={true}
      />
    </div>
  );
}
