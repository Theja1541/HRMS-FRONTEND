import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import FFHistoryFilters from '../components/FFHistoryFilters';
import FFHistoryTable from '../components/FFHistoryTable';
import { getFFHistory } from '../api/separationService';
import Button from '../../../components/ui/Button';

export default function FFHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    from_date: searchParams.get('from_date') || '',
    to_date: searchParams.get('to_date') || '',
    department: searchParams.get('department') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const res = await getFFHistory(params);
      setData(res.results || res.data || []);
      setTotalCount(res.count || (res.data ? res.data.length : 0));
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
      const emptyFilters = {
        from_date: '', to_date: '', department: '', status: '', search: '', page: '1'
      };
      setFilters(emptyFilters);
      setSearchParams({});
      return;
    }

    const newFilters = { ...filters, [key]: value };
    if (key !== 'page') newFilters.page = '1'; // reset to page 1 on filter change
    
    setFilters(newFilters);

    // Sync to URL
    const paramsToSet = {};
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) paramsToSet[k] = newFilters[k];
    });
    setSearchParams(paramsToSet, { replace: true });
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', String(newPage));
  };

  const currentPage = parseInt(filters.page || '1', 10);
  const pageSize = 50; // default for DRF or whatever is configured
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>F&F Settlement History</h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and export organization-wide full and final settlements.</p>
      </div>

      <FFHistoryFilters filters={filters} onFilterChange={handleFilterChange} />

      <FFHistoryTable 
        data={data} 
        loading={loading} 
        error={error} 
        onRetry={fetchHistory} 
      />

      {/* Pagination controls */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <Button 
            variant="secondary" 
            disabled={currentPage <= 1} 
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span style={{ fontSize: '0.875rem', color: '#475569' }}>
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="secondary" 
            disabled={currentPage >= totalPages} 
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
