import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div className="ui-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-header">
          <h3>{title}</h3>
          <button className="ui-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="ui-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
