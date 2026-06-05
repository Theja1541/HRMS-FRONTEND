import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import './OverrideReasonModal.css';

export default function OverrideReasonModal({ isOpen, onClose, unreturnedAssets, onConfirm, isSubmitting, error }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unreturned assets detected">
      <div className="override-modal-content">
        <p>The following assets have not been returned:</p>
        <ul className="unreturned-list">
          {unreturnedAssets?.map(a => (
            <li key={a.asset_id}>
              {a.asset_name} (Assigned: {a.assigned_date})
            </li>
          ))}
        </ul>

        {error && <div className="override-error">{error}</div>}

        <div className="form-group">
          <label>Override reason</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for overriding the unreturned assets block..."
            rows={4}
            disabled={isSubmitting}
          />
          <small>Minimum 10 characters required.</small>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={reason.trim().length < 10 || isSubmitting}
            loading={isSubmitting}
          >
            Confirm & Generate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
