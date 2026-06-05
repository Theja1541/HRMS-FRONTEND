import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'medium', disabled, loading, onClick, className = '', type = 'button' }) {
  return (
    <button 
      type={type}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="ui-btn-spinner"></span>}
      {children}
    </button>
  );
}
