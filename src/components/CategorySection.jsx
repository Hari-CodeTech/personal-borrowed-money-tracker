import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import PersonCard from './PersonCard';
import { formatINR } from '../utils/currency';
import { VERIFIED_BENCHMARKS } from '../data/initialData';

export default function CategorySection({ 
  category, 
  people = [], 
  personMetrics = {}, 
  onSelectPerson,
  defaultExpanded = true
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Compute category total
  const categoryTotal = people.reduce((sum, person) => {
    const m = personMetrics[person.id];
    return sum + (m?.totalRecorded || 0);
  }, 0);

  const expectedBenchmark = VERIFIED_BENCHMARKS.categoryTotals[category];
  const matchesBenchmark = expectedBenchmark !== undefined && categoryTotal === expectedBenchmark;

  return (
    <section className="category-section" aria-labelledby={`heading-${category.replace(/\s+/g, '-')}`}>
      <div 
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(!isExpanded); } }}
        aria-expanded={isExpanded}
      >
        <div className="category-title-area">
          <h2 id={`heading-${category.replace(/\s+/g, '-')}`} className="category-title">
            {category}
          </h2>
          <span className="category-stats-badge">
            {people.length} {people.length === 1 ? 'person' : 'people'}
          </span>
          {matchesBenchmark && (
            <span className="badge badge-indirect" title="Matches reference expected benchmark total">
              <CheckCircle2 size={12} />
              <span>Verified Total</span>
            </span>
          )}
        </div>

        <div className="category-header-right">
          <div className="category-total-display">
            <div className="category-total-label">Category Recorded Total</div>
            <div className="category-total-amount">{formatINR(categoryTotal)}</div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon" 
            aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            tabIndex={-1}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="category-body">
          {people.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p>No records found in {category}.</p>
            </div>
          ) : (
            <div className="people-grid">
              {people.map(person => (
                <PersonCard 
                  key={person.id}
                  person={person}
                  metrics={personMetrics[person.id]}
                  onClick={() => onSelectPerson(person)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
