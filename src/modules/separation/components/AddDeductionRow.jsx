import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

export default function AddDeductionRow({ onAdd, isSubmitting }) {
  const [type, setType] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!description.trim() || !amount || Number(amount) <= 0) return;
    onAdd({ type, description, amount: Number(amount) });
    setType('OTHER');
    setDescription('');
    setAmount('');
  };

  return (
    <tr>
      <td>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        >
          <option value="LOAN">Loan</option>
          <option value="ADVANCE">Advance</option>
          <option value="OTHER">Other</option>
        </select>
      </td>
      <td>
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deduction description"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </td>
      <td>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </td>
      <td>
        <Button 
          onClick={handleAdd} 
          disabled={!description.trim() || !amount || Number(amount) <= 0 || isSubmitting}
          loading={isSubmitting}
        >
          Add
        </Button>
      </td>
    </tr>
  );
}
