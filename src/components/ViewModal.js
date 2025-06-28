import React from 'react';
import './ViewModal.css';

// Icon components
const X = () => <span>✕</span>;
const Edit = () => <span>✏️</span>;
const Trash = () => <span>🗑️</span>;

const ViewModal = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  title, 
  children,
  showActions = true,
  customActions = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="view-modal-overlay" onClick={onClose}>
      <div className="view-modal-content" onClick={e => e.stopPropagation()}>
        <div className="view-modal-header">
          <h2 className="view-modal-title">{title}</h2>
          <button className="view-modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        
        <div className="view-modal-body">
          {children}
        </div>
        
        {showActions && (
          <div className="view-modal-footer">
            {customActions}
            <button className="btn btn-secondary" onClick={onEdit}>
              <Edit />
              Edit
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              <Trash />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ViewSection = ({ label, children, icon }) => (
  <div className="view-section">
    {label && (
      <div className="view-section-label">
        {icon && <span className="view-section-icon">{icon}</span>}
        {label}
      </div>
    )}
    <div className="view-section-content">{children}</div>
  </div>
);

export const ViewField = ({ label, value, type = 'text' }) => (
  <div className="view-field">
    <span className="view-field-label">{label}:</span>
    <span className={`view-field-value ${type}`}>{value || 'Not set'}</span>
  </div>
);

export const ViewTags = ({ tags = [] }) => (
  <div className="view-tags">
    {tags.map((tag, index) => (
      <span key={index} className="view-tag">{tag}</span>
    ))}
  </div>
);

export default ViewModal;