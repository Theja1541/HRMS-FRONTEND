import React from 'react';
import './Spinner.css';

export default function Spinner({ size = 'medium', className = '' }) {
  return (
    <div className={`ui-spinner ui-spinner-${size} ${className}`}></div>
  );
}
