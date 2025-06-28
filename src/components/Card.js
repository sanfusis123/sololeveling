import React, { useRef } from 'react';
import './Card.css';

const Card = ({ 
  children, 
  onClick, 
  className = '', 
  hover = true,
  gradient = null,
  icon = null 
}) => {
  const cardRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (!hover || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    cardRef.current.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  };
  
  const handleMouseLeave = () => {
    if (!hover || !cardRef.current) return;
    
    cardRef.current.style.setProperty('--rotate-x', '0deg');
    cardRef.current.style.setProperty('--rotate-y', '0deg');
  };
  
  const cardClasses = `card ${hover ? 'card-hover' : ''} ${gradient ? `card-gradient-${gradient}` : ''} ${className}`;
  
  return (
    <div 
      ref={cardRef}
      className={cardClasses} 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {icon && <div className="card-icon">{icon}</div>}
      {children}
    </div>
  );
};

export const CardHeader = ({ children, actions }) => (
  <div className="card-header">
    <div className="card-header-content">{children}</div>
    {actions && <div className="card-header-actions">{actions}</div>}
  </div>
);

export const CardTitle = ({ children, subtitle }) => (
  <div className="card-title-wrapper">
    <h3 className="card-title">{children}</h3>
    {subtitle && <p className="card-subtitle">{subtitle}</p>}
  </div>
);

export const CardBody = ({ children }) => (
  <div className="card-body">{children}</div>
);

export const CardFooter = ({ children }) => (
  <div className="card-footer">{children}</div>
);

export const CardMeta = ({ items }) => (
  <div className="card-meta">
    {items.map((item, index) => (
      <span 
        key={index} 
        className={`card-meta-item ${item.type || ''} ${item.onClick ? 'clickable' : ''}`}
        onClick={item.onClick}
        style={item.onClick ? { cursor: 'pointer' } : {}}
      >
        {item.icon && <span className="card-meta-icon">{item.icon}</span>}
        {item.label}
      </span>
    ))}
  </div>
);

export default Card;