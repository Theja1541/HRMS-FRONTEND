import React from 'react';
import './Badge.css';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
