import React, { useState, useEffect } from 'react';
import type { Property, TenantHistoryRecord, User } from '../types';
import TenantPayments from './TenantPayments';
import './PropertyHistory.css';

interface PropertyHistoryProps {
  property: Property;
  initialMode?: 'view' | 'add';
  onUpdateHistory: (propertyId: string, history: TenantHistoryRecord[]) => void;
  onClose: () => void;
}

const PropertyHistory: React.FC<PropertyHistoryProps> = ({ property, initialMode = 'view', onUpdateHistory, onClose }) => {
  const [isAdding, setIsAdding] = useState(initialMode === 'add');
  const [editingRecord, setEditingRecord] = useState<TenantHistoryRecord | null>(null);
  const [isPresent, setIsPresent] = useState(initialMode === 'add');
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<TenantHistoryRecord[]>(property.history || []);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<TenantHistoryRecord>>({
    tenantName: '',
    phoneNumber: '',
    email: '',
    moveInDate: '',
    moveOutDate: '',
    rentAmount: undefined,
    deposit: undefined,
    user_id: '',
    id: undefined as string | undefined,
    notes: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/all-users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/history/${property.id}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend fields to frontend types if needed
        const mapped = data.map((d: any) => ({
          ...d,
          tenantName: d.name,
          phoneNumber: d.phone,
          moveInDate: d.move_in_date,
          moveOutDate: d.move_out_date,
          rentAmount: Number(d.rent_amount),
          user_id: d.user_id ? d.user_id.toString() : ''
        }));
        setHistory(mapped);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      tenantName: '',
      phoneNumber: '',
      email: '',
      moveInDate: '',
      moveOutDate: '',
      rentAmount: property.rent || undefined,
      deposit: undefined,
      user_id: '',
      id: undefined,
      notes: ''
    });
    setEditingRecord(null);
    setIsPresent(true);
    setIsAdding(true);
  };

  const handleOpenEdit = (record: TenantHistoryRecord) => {
    setFormData(record);
    setEditingRecord(record);
    setIsPresent(!record.moveOutDate);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const newHistory = (property.history || []).filter(r => r.id !== id);
      onUpdateHistory(property.id, newHistory);
    }
  };

  const handleUpdateTenant = (updatedTenant: TenantHistoryRecord) => {
    const newHistory = (property.history || []).map(r => r.id === updatedTenant.id ? updatedTenant : r);
    onUpdateHistory(property.id, newHistory);
  };

  const togglePayments = (id: string) => {
    setExpandedPayments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: formData.id,
      property_id: property.id,
      user_id: (formData.user_id && formData.user_id !== '') ? formData.user_id : null,
      name: formData.tenantName,
      phone: formData.phoneNumber,
      email: formData.email || '',
      password: formData.password || '',
      move_in_date: formData.moveInDate,
      move_out_date: isPresent ? null : formData.moveOutDate,
      deposit: formData.deposit,
      rent_amount: formData.rentAmount,
      rent_due_day: 5 // Default for now
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add-tenant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save tenant record");
      }

      const responseData = await response.json();
      alert(responseData.success ? responseData.message : "Tenant record synchronized successfully!");
      fetchUsers();
      fetchHistory();
      setIsAdding(false);
      onUpdateHistory(property.id, []);
    } catch (err: any) {
      alert(err.message || "Failed to save tenant record.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel property-history-modal">
        <div className="form-header">
          <div className="header-title">
            <h2 className="gradient-text">Property History</h2>
            <p>{property.name} {property.unitNumber ? `#${property.unitNumber}` : ''}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAdding ? (
          <div className="history-list-view">
            <div className="history-actions">
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Record
              </button>
            </div>

            <div className="history-timeline">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><span className="loader"></span></div>
              ) : (!history || history.length === 0) ? (
                <div className="empty-history">
                  <p>No history records found for this property.</p>
                </div>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content glass-panel">
                      <div className="record-header">
                        <div className="tenant-main">
                          <h4>{record.tenantName}</h4>
                          <span className="date-range">
                            {record.moveInDate} — {record.moveOutDate || 'Present'}
                          </span>
                        </div>
                        <div className="record-actions">
                          <button className={`btn-icon-small ${expandedPayments.has(record.id) ? 'active-expansion' : ''}`} onClick={() => togglePayments(record.id)} title="Manage Payments">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button className="btn-icon-small" onClick={() => handleOpenEdit(record)} title="Edit">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="btn-icon-small btn-danger-text" onClick={() => handleDelete(record.id)} title="Delete">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="record-details">
                        <div className="detail-item">
                          <span className="label">Phone:</span>
                          <span>{record.phoneNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Rent:</span>
                          <span className="value">₹{(record.rentAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Deposit:</span>
                          <span className="value">₹{(record.deposit || 0).toLocaleString()}</span>
                        </div>
                        {record.notes && (
                          <div className="detail-item notes">
                            <span className="label">Notes:</span>
                            <p>{record.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {expandedPayments.has(record.id) && (
                        <TenantPayments 
                          property={property} 
                          tenant={record} 
                          onUpdateTenant={handleUpdateTenant} 
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form className="property-form history-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tenant Name</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  value={formData.tenantName}
                  onChange={e => setFormData({...formData, tenantName: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Move In Date</label>
                <input 
                  type="date" 
                  className="input-glass" 
                  value={formData.moveInDate}
                  onChange={e => setFormData({...formData, moveInDate: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label htmlFor="moveOutDate" style={{ marginBottom: 0 }}>Move Out Date</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="isPresent" 
                      checked={isPresent}
                      onChange={e => {
                        setIsPresent(e.target.checked);
                        if (e.target.checked) setFormData({...formData, moveOutDate: ''});
                      }}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isPresent" style={{ fontSize: '0.85rem', marginBottom: 0, cursor: 'pointer', color: 'var(--text-secondary)' }}>Present</label>
                  </div>
                </div>
                <input 
                  type="date" 
                  id="moveOutDate"
                  className="input-glass" 
                  value={formData.moveOutDate || ''}
                  onChange={e => {
                    setFormData({...formData, moveOutDate: e.target.value});
                    if (e.target.value) setIsPresent(false);
                  }}
                  disabled={isPresent}
                  style={isPresent ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Link to User Account (Auto-Dashboard)</label>
                <select 
                  className="input-glass select-glass" 
                  value={formData.user_id || ''} 
                  onChange={e => setFormData({...formData, user_id: e.target.value})}
                >
                  <option value="">-- Select Account --</option>
                  {users.filter(u => u.role === 'tenant').map(u => (
                    <option key={u.id} value={u.id?.toString()}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Select existing account or leave blank to automatically create a new one.
                </p>
              </div>
            </div>

            {(!formData.user_id || formData.user_id === '') && (
              <div className="form-row animation-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Email (Required for Login) <span aria-hidden="true">*</span></label>
                  <input 
                    type="email" 
                    className="input-glass" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password (Required for Login) <span aria-hidden="true">*</span></label>
                  <input 
                    type="text" 
                    className="input-glass" 
                    value={formData.password || ''} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Create a secure password"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form-row animation-fade-in">
              <div className="form-group">
                <label>Monthly Rent</label>
                <input 
                  type="number" 
                  className="input-glass" 
                  value={formData.rentAmount ?? ''}
                  onChange={e => setFormData({...formData, rentAmount: e.target.value === '' ? undefined : Number(e.target.value)})}
                  step="500"
                  min="0"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Deposit Amount</label>
                <input 
                  type="number" 
                  className="input-glass" 
                  value={formData.deposit ?? ''}
                  onChange={e => setFormData({...formData, deposit: e.target.value === '' ? undefined : Number(e.target.value)})}
                  step="500"
                  min="0"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea 
                className="input-glass textarea-glass" 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-glass" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingRecord ? 'Update Record' : 'Save Record'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PropertyHistory;
