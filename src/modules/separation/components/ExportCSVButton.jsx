import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { exportFFHistoryCSV } from '../api/separationService';
import toast from 'react-hot-toast';

export default function ExportCSVButton({ activeFilters }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await exportFFHistoryCSV(activeFilters);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fromDate = activeFilters.from_date || 'all';
      const toDate = activeFilters.to_date || 'all';
      link.setAttribute('download', `ff_history_${fromDate}_to_${toDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
    } catch (err) {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} loading={loading} disabled={loading}>
      Export CSV
    </Button>
  );
}
