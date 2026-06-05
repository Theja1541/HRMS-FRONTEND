import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { approveFFSettlement } from '../api/separationService';
import toast from 'react-hot-toast';

export default function ApproveSettlementButton({ settlementId, onApproveSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveFFSettlement(settlementId);
      toast.success("Settlement approved successfully!");
      setIsModalOpen(false);
      onApproveSuccess();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.includes('locked')) {
        toast.error("This settlement was already approved by another user. Refreshing...");
        onApproveSuccess(); // Refetch to get the locked state
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to approve settlement.");
      }
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setIsModalOpen(true)}>
        Approve Settlement
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => !isApproving && setIsModalOpen(false)} title="Approve Settlement">
        <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
          Are you sure you want to approve and lock this settlement? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isApproving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={isApproving} loading={isApproving}>
            Confirm Approval
          </Button>
        </div>
      </Modal>
    </>
  );
}
