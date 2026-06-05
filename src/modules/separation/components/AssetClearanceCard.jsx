import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetClearanceStatus, generateFFSettlement } from '../api/separationService';
import api from '../../../api/axios';
import AssetStatusBadge from './AssetStatusBadge';
import OverrideReasonModal from './OverrideReasonModal';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';
import './AssetClearanceCard.css';

export default function AssetClearanceCard({ resignationId, employeeId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState(null);
  
  const [existingSettlement, setExistingSettlement] = useState(null);
  const [settlementChecking, setSettlementChecking] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAssetClearanceStatus(resignationId);
      setStatusData(data);
    } catch (err) {
      setError('Could not load asset status. Retry.');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSettlement = async () => {
    if (!employeeId) {
      setSettlementChecking(false);
      return;
    }
    try {
      setSettlementChecking(true);
      const response = await api.get('/settlements/', { 
        params: { employee: employeeId, exclude_status: 'DISBURSED' } 
      });
      if (response.data && response.data.results && response.data.results.length > 0) {
        setExistingSettlement(response.data.results[0]);
      }
    } catch (err) {
      console.error("Failed to check existing settlement", err);
    } finally {
      setSettlementChecking(false);
    }
  };

  useEffect(() => {
    if (resignationId) {
      fetchStatus();
      checkExistingSettlement();
    }
  }, [resignationId, employeeId]);

  const handleGenerateClick = () => {
    if (statusData?.clearance_blocked) {
      setIsModalOpen(true);
    } else {
      executeGenerate();
    }
  };

  const executeGenerate = async (overrideReason = '') => {
    try {
      setGenerating(true);
      setModalError('');
      const payload = overrideReason ? { override_reason: overrideReason } : {};
      const newSettlement = await generateFFSettlement(resignationId, payload);
      toast.success("F&F Settlement generated successfully!");
      setIsModalOpen(false);
      // Navigate to the newly generated settlement
      navigate(`/separation/ff-settlements/${newSettlement.id}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to generate settlement.";
      if (isModalOpen) {
        setModalError(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading || settlementChecking) {
    return (
      <div className="asset-clearance-card loading">
        <Spinner />
        <p>Loading asset clearance status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-clearance-card error">
        <p>{error}</p>
        <Button onClick={fetchStatus}>Retry</Button>
      </div>
    );
  }

  if (!statusData) return null;

  const hasAssets = 
    statusData.cleared?.length > 0 || 
    statusData.unreturned?.length > 0 || 
    statusData.damaged?.length > 0 || 
    statusData.lost?.length > 0;

  const formatCurrency = (amount) => 
    Number(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <div className="asset-clearance-card">
      <div className="card-header">
        <h3>Asset Clearance Status</h3>
      </div>

      <div className="card-body">
        {!hasAssets ? (
          <div className="empty-state">No assets were assigned to this employee.</div>
        ) : (
          <div className="assets-lists">
            {statusData.unreturned?.length > 0 && (
              <div className="asset-group">
                <h4>Unreturned Assets</h4>
                <ul className="asset-items">
                  {statusData.unreturned.map(a => (
                    <li key={a.asset_id}>
                      <div className="item-info">
                        <span className="item-name">{a.asset_name}</span>
                        <span className="item-meta">Assigned: {a.assigned_date}</span>
                      </div>
                      <AssetStatusBadge status="UNRETURNED" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {statusData.damaged?.length > 0 && (
              <div className="asset-group">
                <h4>Damaged Assets</h4>
                <ul className="asset-items">
                  {statusData.damaged.map(a => (
                    <li key={a.asset_id}>
                      <div className="item-info">
                        <span className="item-name">{a.asset_name}</span>
                        <span className="item-meta">
                          Cost: {formatCurrency(a.purchase_cost)} | Recovery: {formatCurrency(a.effective_recovery)}
                        </span>
                      </div>
                      <AssetStatusBadge status="DAMAGED" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {statusData.lost?.length > 0 && (
              <div className="asset-group">
                <h4>Lost Assets</h4>
                <ul className="asset-items">
                  {statusData.lost.map(a => (
                    <li key={a.asset_id}>
                      <div className="item-info">
                        <span className="item-name">{a.asset_name}</span>
                        <span className="item-meta">Recovery: {formatCurrency(a.effective_recovery)}</span>
                      </div>
                      <AssetStatusBadge status="LOST" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {statusData.cleared?.length > 0 && (
              <div className="asset-group">
                <h4>Cleared Assets</h4>
                <ul className="asset-items">
                  {statusData.cleared.map(a => (
                    <li key={a.asset_id}>
                      <div className="item-info">
                        <span className="item-name">{a.asset_name}</span>
                      </div>
                      <AssetStatusBadge status="CLEARED" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {statusData.total_recovery_amount > 0 && (
          <div className="summary-row">
            Total recovery amount: <strong>{formatCurrency(statusData.total_recovery_amount)}</strong>
          </div>
        )}
      </div>

      <div className="card-footer">
        {existingSettlement ? (
          <div className="existing-settlement-alert">
            A Final Settlement already exists for this employee.
            <Button variant="secondary" onClick={() => navigate(`/separation/ff-settlements/${existingSettlement.id}`)}>
              View Settlement
            </Button>
          </div>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleGenerateClick}
          >
            Generate F&F Settlement
          </Button>
        )}
      </div>

      <OverrideReasonModal 
        isOpen={isModalOpen}
        onClose={() => !generating && setIsModalOpen(false)}
        unreturnedAssets={statusData.unreturned}
        onConfirm={executeGenerate}
        isSubmitting={generating}
        error={modalError}
      />
    </div>
  );
}
