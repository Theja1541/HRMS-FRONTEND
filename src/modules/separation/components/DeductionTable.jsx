import React from 'react';
import Badge from '../../../components/ui/Badge';
import AddDeductionRow from './AddDeductionRow';
import './DeductionTable.css';

export default function DeductionTable({ deductions = [], isLocked, onAddDeduction, isSubmitting }) {
  const formatCurrency = (amount) => 
    Number(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const getTypeBadge = (type) => {
    switch(type) {
      case 'ASSET_DAMAGE': return <Badge variant="warning">Asset Damage</Badge>;
      case 'ASSET_LOST': return <Badge variant="danger">Asset Lost</Badge>;
      case 'LOAN': return <Badge variant="info">Loan</Badge>;
      case 'ADVANCE': return <Badge variant="primary">Advance</Badge>;
      default: return <Badge variant="neutral">Other</Badge>;
    }
  };

  return (
    <div className="ui-table-container">
      <table className="ui-table deduction-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            {!isLocked && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {deductions.map(d => (
            <tr key={d.id || Math.random()}>
              <td>{getTypeBadge(d.deduction_type || d.type)}</td>
              <td>{d.description}</td>
              <td className="amount-cell">{formatCurrency(d.amount)}</td>
              {!isLocked && <td></td>}
            </tr>
          ))}
          
          {!isLocked && (
            <AddDeductionRow onAdd={onAddDeduction} isSubmitting={isSubmitting} />
          )}

          {deductions.length === 0 && isLocked && (
            <tr>
              <td colSpan="3" className="ui-table-empty">No deductions recorded.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
