import React from 'react';
import type { PropertyStatus } from '../types';

interface PropertyControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | PropertyStatus;
  onStatusFilterChange: (status: 'all' | PropertyStatus) => void;
  onExport: () => void;
}

const PropertyControls: React.FC<PropertyControlsProps> = ({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange, 
  onExport 
}) => {
  return (
    <div className="toolbar glass-panel" style={{ display: 'flex', gap: '16px', padding: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '12px', flexGrow: 1, minWidth: '300px' }}>
        <input 
          type="text" 
          placeholder="Search properties, tenants, or address..." 
          className="input-glass"
          style={{ flexGrow: 1 }}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search properties"
        />
        <select 
          className="input-glass" 
          value={statusFilter} 
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          style={{ width: '150px' }}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="occupied">Occupied</option>
          <option value="vacant">Vacant</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <button className="btn btn-secondary glass-panel" style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} onClick={onExport} aria-label="Export Rent Report">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report
      </button>
    </div>
  );
};

export default PropertyControls;
