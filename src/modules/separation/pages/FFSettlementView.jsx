import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { patchSettlementDeductions } from '../api/separationService';
import { useAuth } from '../../../auth/AuthContext';
import SettlementStatusBadge from '../components/SettlementStatusBadge';
import DeductionTable from '../components/DeductionTable';
import ApproveSettlementButton from '../components/ApproveSettlementButton';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';
import './FFSettlementView.css';
import NoticeShortfallBanner from '../components/NoticeShortfallBanner';
import { format } from 'date-fns';
export default function FFSettlementView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isPatching, setIsPatching] = useState(false);
  const [disputeRemarks, setDisputeRemarks] = useState('');

  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const fetchSettlement = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/separation/settlements/${id}/`);
      setSettlement(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Settlement not found, we can generate it
        setError('');
      } else {
        setError('Failed to load settlement details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
  }, [id]);

  const handleAddDeduction = async (newDeduction) => {
    try {
      setIsPatching(true);
      const currentDeductions = settlement.deductions || [];
      await patchSettlementDeductions(id, [...currentDeductions, newDeduction]);
      toast.success("Deduction added.");
      fetchSettlement();
    } catch (err) {
      toast.error("Failed to add deduction.");
    } finally {
      setIsPatching(false);
    }
  };

  const handleResolveDispute = async () => {
    try {
      setIsPatching(true);
      await api.patch(`/separation/settlements/${id}/`, {
        status: 'PENDING_APPROVAL',
      });
      toast.success("Dispute marked as resolved.");
      fetchSettlement();
    } catch (err) {
      toast.error("Failed to resolve dispute.");
    } finally {
      setIsPatching(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerateLoading(true);
      setGenerateError(null);
      const { generateFFSettlement } = await import('../api/separationService');
      const data = await generateFFSettlement(id);
      setSettlement(data);
      setError('');
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate settlement.');
    } finally {
      setGenerateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ff-view-loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ff-view-error">
        <p>{error}</p>
        <Button onClick={() => navigate('/separation/ff-history')}>Back to History</Button>
      </div>
    );
  }

  const formatCurrency = (amount) => 
    Number(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const totalDeductions = settlement.deductions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  
  const canApprove = !settlement.locked && settlement.status !== 'DISPUTED' && ['HR', 'SUPER_ADMIN'].includes(user?.role);

  return (
    <div className="ff-view-page">
      <div className="ff-header">
        <div className="ff-header-top">
          <h2>Full & Final Settlement {settlement ? `#${settlement.id}` : 'Generation'}</h2>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
        
        {generateError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #f87171' }}>
            {generateError}
          </div>
        )}

        {!settlement && (
          <div style={{ marginBottom: '20px' }}>
            <Button onClick={handleGenerate} disabled={generateLoading}>
              {generateLoading ? 'Generating...' : 'Generate F&F Settlement'}
            </Button>
          </div>
        )}
        
        {settlement && (
        <div className="ff-status-bar">
          <SettlementStatusBadge status={settlement.status} />
          {settlement.locked && settlement.approved_by && (
            <span className="ff-approved-info">
              Approved by {settlement.approved_by_name || settlement.approved_by} on {format(new Date(settlement.approved_at), 'dd MMM yyyy')}
            </span>
          )}
        </div>
        )}
      </div>

      {settlement && (
        <>
          <NoticeShortfallBanner snapshot={settlement.notice_shortfall_snapshot} />

      <div className="ff-employee-bar">
        <div className="emp-stat">
          <label>Employee</label>
          <span>{settlement.resignation_details?.employee_name || 'N/A'}</span>
        </div>
        <div className="emp-stat">
          <label>Department</label>
          <span>{settlement.resignation_details?.department || 'N/A'}</span>
        </div>
        <div className="emp-stat">
          <label>Last Working Day</label>
          <span>{settlement.resignation_details?.last_working_day || 'N/A'}</span>
        </div>
      </div>

      {settlement.status === 'DISPUTED' && (
        <div className="ff-dispute-section">
          <h4>⚠️ Employee has raised a dispute. Review before approving.</h4>
          <textarea
            rows={3}
            placeholder="HR Resolution Notes..."
            value={disputeRemarks}
            onChange={(e) => setDisputeRemarks(e.target.value)}
            disabled={isPatching}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <Button variant="primary" onClick={handleResolveDispute} disabled={isPatching} loading={isPatching}>
              Mark Resolved
            </Button>
          </div>
        </div>
      )}

      <div className="ff-financials">
        <div className="ff-earnings-card">
          <h3>Earnings</h3>
          <div className="fin-row">
            <span>Gross Salary (Prorated)</span>
            <span>{formatCurrency(settlement.total_earnings || 0)}</span>
          </div>
        </div>

        <div className="ff-deductions-card">
          <h3>Deductions</h3>
          {settlement.deductions && settlement.deductions.length > 0 ? (
            settlement.deductions.map((deduction, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>{deduction.deduction_type}</span>
                <span>{formatCurrency(deduction.amount)}</span>
              </div>
            ))
          ) : (
            <p>No deductions applied.</p>
          )}
        </div>
      </div>

      <div className="ff-summary-bar" style={{ display: 'flex', gap: '24px', marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <div className="summary-item">
          <span>Gross Payable:</span>
          <strong style={{ marginLeft: '8px' }}>{formatCurrency(settlement.total_earnings || 0)}</strong>
        </div>
        <div className="summary-item">
          <span>Total Deductions:</span>
          <strong style={{ marginLeft: '8px' }}>{formatCurrency(settlement.total_deductions || 0)}</strong>
        </div>
        <div className="summary-item net-payable" style={{ marginLeft: 'auto', fontSize: '1.2rem', color: '#059669' }}>
          <span>Net Payable:</span>
          <strong style={{ marginLeft: '8px' }}>{formatCurrency(settlement.net_amount || 0)}</strong>
        </div>
      </div>

      <div className="ff-actions" style={{ marginTop: '24px' }}>
        {canApprove && (
          <ApproveSettlementButton 
            settlementId={settlement.id} 
            onApproveSuccess={fetchSettlement} 
          />
        )}
      </div>
      </>
      )}
    </div>
  );
}
