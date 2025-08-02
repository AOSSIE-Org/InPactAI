import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Type, User, Building } from 'lucide-react';

interface FilterOptions {
  status: string;
  contract_type: string;
  min_budget: string;
  max_budget: string;
  start_date_from: string;
  start_date_to: string;
  creator_id: string;
  brand_id: string;
  search_term: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div style={{
      background: 'rgba(26, 26, 26, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '1px solid rgba(42, 42, 42, 0.6)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      marginBottom: '24px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(42, 42, 42, 0.6)',
        cursor: 'pointer'
      }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={20} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Advanced Filters</span>
          {hasActiveFilters && (
            <div style={{
              background: '#6366f1',
              color: '#fff',
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Active
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#ef4444',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      {isOpen && (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="signed">Signed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Contract Type Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Contract Type
              </label>
              <select
                value={filters.contract_type}
                onChange={(e) => handleFilterChange('contract_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Types</option>
                <option value="one-time">One-time</option>
                <option value="ongoing">Ongoing</option>
                <option value="performance-based">Performance-based</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Budget Range
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_budget}
                  onChange={(e) => handleFilterChange('min_budget', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_budget}
                  onChange={(e) => handleFilterChange('max_budget', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Start Date Range
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={filters.start_date_from}
                  onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="date"
                  value={filters.start_date_to}
                  onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Creator ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Creator ID
              </label>
              <input
                type="text"
                placeholder="Enter creator ID"
                value={filters.creator_id}
                onChange={(e) => handleFilterChange('creator_id', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Brand ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Brand ID
              </label>
              <input
                type="text"
                placeholder="Enter brand ID"
                value={filters.brand_id}
                onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Search Term */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Search Term
              </label>
              <input
                type="text"
                placeholder="Search in contract title, creator, or brand..."
                value={filters.search_term}
                onChange={(e) => handleFilterChange('search_term', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#6366f1' }}>
                Active Filters:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filters.status !== 'all' && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Status: {filters.status}
                  </span>
                )}
                {filters.contract_type !== 'all' && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Type: {filters.contract_type}
                  </span>
                )}
                {(filters.min_budget || filters.max_budget) && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Budget: ${filters.min_budget || '0'} - ${filters.max_budget || '∞'}
                  </span>
                )}
                {(filters.start_date_from || filters.start_date_to) && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Date: {filters.start_date_from || 'Any'} to {filters.start_date_to || 'Any'}
                  </span>
                )}
                {filters.creator_id && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Creator: {filters.creator_id}
                  </span>
                )}
                {filters.brand_id && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Brand: {filters.brand_id}
                  </span>
                )}
                {filters.search_term && (
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Search: "{filters.search_term}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters; 