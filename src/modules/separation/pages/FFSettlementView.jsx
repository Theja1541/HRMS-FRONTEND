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

  const fetchSettlement = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/separation/settlements/${id}/`);
      setSettlement(res.data);
    } catch (err) {
      setError('Failed to load settlement details.');
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
        // Assuming there might be a field for resolution notes in backend, ignoring for now if not schema-supported
      });
      toast.success("Dispute marked as resolved.");
      fetchSettlement();
    } catch (err) {
      toast.error("Failed to resolve dispute.");
    } finally {
      setIsPatching(false);
    }
  };

  if (loading) {
    return (
      <div className="ff-view-loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !settlement) {
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
          <h2>Full & Final Settlement #{settlement.id}</h2>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
        
        <div className="ff-status-bar">
          <SettlementStatusBadge status={settlement.status} />
          {settlement.locked && settlement.approved_by && (
            <span className="ff-approved-info">
              Approved by {settlement.approved_by_name || settlement.approved_by} on {format(new Date(settlement.approved_at), 'dd MMM yyyy')}
            </span>
          )}
        </div>
      </div>

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
            <span>{formatCurrency(settlement.gross_amount)}</span>
          </div>
          {/* If there are other earnings, list them here */}
        </div>

        <div className="ff-deductions-card">
          <h3>Deductions</h3>
          <DeductionTable 
            deductions={settlement.deductions} 
            isLocked={settlement.locked} 
            onAddDeduction={handleAddDeduction}
            isSubmitting={isPatching}
          />
        </div>
      </div>

      <div className="ff-summary-bar">
        <div className="summary-item">
          <span>Gross Payable:</span>
          <strong>{formatCurrency(settlement.gross_amount)}</strong>
        </div>
        <div className="summary-item">
          <span>Total Deductions:</span>
          <strong>{formatCurrency(totalDeductions)}</strong>
        </div>
        <div className="summary-item net-payable">
          <span>Net Payable:</span>
          <strong>{formatCurrency(settlement.net_amount)}</strong>
        </div>
      </div>

      <div className="ff-actions">
        {canApprove && (
          <ApproveSettlementButton 
            settlementId={settlement.id} 
            onApproveSuccess={fetchSettlement} 
          />
        )}
      </div>
    </div>
  );
}
