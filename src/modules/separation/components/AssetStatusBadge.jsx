import React from 'react';
import Badge from '../../../components/ui/Badge';

export default function AssetStatusBadge({ status }) {
  const getProps = () => {
    switch (status) {
      case 'CLEARED':
        return { variant: 'success', label: 'Cleared' };
      case 'UNRETURNED':
        return { variant: 'danger', label: 'Not returned' };
      case 'DAMAGED':
        return { variant: 'warning', label: 'Damaged' };
      case 'LOST':
        return { variant: 'danger', label: 'Lost' };
      default:
        return { variant: 'neutral', label: status };
    }
  };

  const { variant, label } = getProps();

  return <Badge variant={variant}>{label}</Badge>;
}
