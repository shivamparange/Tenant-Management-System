import React from 'react';
import type { Property } from '../types';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  userRole?: 'admin' | 'manager' | 'tenant';
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewHistory: (property: Property) => void;
  onAddTenant: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, userRole, onEdit, onDelete, onViewHistory, onAddTenant }) => {
  const getPropertyIcon = () => {
    switch (property.type) {
      case 'flat':
        return (
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'villa':
      case 'farmhouse':
        return (
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
          </svg>
        );
      case 'gala':
        return (
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default: // room
        return (
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
    }
  };

  return (
    <article className="property-card glass-panel" aria-label={`Property card for ${property.name}`}>
      <div className="property-thumbnail">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.name} className="thumbnail-img" />
        ) : (
          <div className={`thumbnail-placeholder bg-glow-${property.status}`}>
            {getPropertyIcon()}
          </div>
        )}
        <div className="thumbnail-overlay">
          <span className={`status-pill status-${property.status}`}>
            {property.status}
          </span>
          {property.unitNumber && <span className="unit-pill">#{property.unitNumber}</span>}
        </div>
      </div>

      <div className="card-content">
        <div className="card-top">
          <h3 className="property-name" title={property.name}>{property.name}</h3>
          <div className="rent-badge">₹{(property.rent || 0).toLocaleString()}</div>
        </div>
        
        <div className="info-grid">
          <div className="info-item">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span title={property.address}>{property.address}</span>
          </div>
          
          {property.status === 'occupied' && property.tenantName && (
            <div className="info-item tenant-name">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{property.tenantName}</span>
            </div>
          )}
        </div>

        {property.status === 'occupied' && (property.paymentStatus || property.nextPaymentDate) && (
          <div className={`payment-status-strip ${property.paymentStatus || 'pending'}`}>
            <span>Due: {property.nextPaymentDate || 'N/A'}</span>
            <span className="status-text">{property.paymentStatus || 'Pending'}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="primary-actions">
          <button className="btn btn-view glow-button" onClick={() => onViewHistory(property)}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{userRole === 'tenant' ? 'Payments' : 'Details'}</span>
          </button>
          
          {userRole !== 'tenant' && (
            <button className="btn btn-add-tenant" onClick={() => onAddTenant(property)}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Tenant</span>
            </button>
          )}
        </div>

        {userRole !== 'tenant' && (
          <div className="secondary-actions">
            <button className="btn-icon-only" onClick={() => onEdit(property)} title="Edit Property">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button className="btn-icon-only btn-delete" onClick={() => onDelete(property.id)} title="Delete Property">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PropertyCard;
