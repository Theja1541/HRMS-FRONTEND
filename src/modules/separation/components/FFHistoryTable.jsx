import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import SettlementStatusBadge from './SettlementStatusBadge';
import Button from '../../../components/ui/Button';

export default function FFHistoryTable({ data, loading, error, onRetry }) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
        <p>Failed to load F&F history.</p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  const formatCurrency = (amount) => 
    Number(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'resignation_details',
      render: (res) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{res?.employee_name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{res?.employee}</div>
        </div>
      ),
    },
    {
      title: 'Dept / Desig',
      dataIndex: 'resignation_details',
      render: (res) => (
        <div>
          <div>{res?.department || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{res?.designation || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'LWD',
      dataIndex: 'resignation_details',
      render: (res) => res?.last_working_day || 'N/A',
    },
    {
      title: 'Gross',
      dataIndex: 'gross_amount',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Net Payable',
      dataIndex: 'net_amount',
      render: (val) => <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>{formatCurrency(val)}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <SettlementStatusBadge status={status} />,
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      render: (id) => (
        <Button variant="secondary" size="small" onClick={() => navigate(`/separation/ff-settlements/${id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading history...</div>
      ) : (
        <Table columns={columns} data={data} rowKey="id" />
      )}
    </div>
  );
}
