import React from 'react';
import Badge from '../../../components/ui/Badge';

export default function SettlementStatusBadge({ status }) {
  const getProps = () => {
    switch (status) {
      case 'DRAFT':
        return { variant: 'neutral', label: 'Draft' };
      case 'PENDING_APPROVAL':
        return { variant: 'warning', label: 'Pending Approval' };
      case 'APPROVED':
        return { variant: 'success', label: 'Approved' };
      case 'DISBURSED':
        return { variant: 'info', label: 'Disbursed' };
      case 'DISPUTED':
        return { variant: 'danger', label: 'Disputed' };
      default:
        return { variant: 'neutral', label: status };
    }
  };

  const { variant, label } = getProps();

  return <Badge variant={variant}>{label}</Badge>;
}
