import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import ExportCSVButton from './ExportCSVButton';
import './FFHistoryFilters.css';

export default function FFHistoryFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        onFilterChange('search', localFilters.search);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [localFilters.search]);

  const applyChange = (name, value) => {
    onFilterChange(name, value);
  };

  const handleClear = () => {
    onFilterChange('clear', null);
  };

  return (
    <div className="ff-filters-container">
      <div className="ff-filters-row">
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input 
              type="date" 
              name="from_date" 
              value={localFilters.from_date || ''} 
              onChange={handleChange}
              onBlur={() => applyChange('from_date', localFilters.from_date)}
            />
            <span>to</span>
            <input 
              type="date" 
              name="to_date" 
              value={localFilters.to_date || ''} 
              onChange={handleChange}
              onBlur={() => applyChange('to_date', localFilters.to_date)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select 
            name="status" 
            value={localFilters.status || ''} 
            onChange={(e) => {
              handleChange(e);
              applyChange('status', e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="DISBURSED">Disbursed</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Search</label>
          <input 
            type="text" 
            name="search" 
            value={localFilters.search || ''} 
            onChange={handleChange}
            placeholder="Search by name or ID"
          />
        </div>
      </div>

      <div className="ff-filters-actions">
        <Button variant="secondary" onClick={handleClear}>Clear Filters</Button>
        <ExportCSVButton activeFilters={filters} />
      </div>
    </div>
  );
}
