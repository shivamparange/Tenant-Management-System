import React, { useState, useEffect } from 'react';
import type { Property, User } from '../types';
import './PropertyForm.css';

interface PropertyFormProps {
  initialData?: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSave, onCancel }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    unitNumber: '',
    type: 'room',
    address: '',
    rent: undefined,
    status: 'vacant',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantPassword: '',
    notes: '',
    lightBillNumber: ''
  });

  useEffect(() => {
    fetchUsers();
    if (initialData) {
      setFormData({
        ...initialData,
        tenant_id: initialData.tenant_id ? initialData.tenant_id.toString() : ''
      });
    }
  }, [initialData]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/all-users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || (formData.rent === undefined)) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload: Property = {
      ...(formData as Property),
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || Date.now(),
    };
    
    onSave(payload);

    if (!initialData) {
      setFormData({
        name: '',
        unitNumber: '',
        type: 'room',
        address: '',
        rent: undefined,
        status: 'vacant',
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        tenantPassword: '',
        notes: '',
        lightBillNumber: ''
      });
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-labelledby="form-dialog-title" aria-modal="true">
      <div className="modal-content glass-panel form-container">
        <div className="form-header">
          <h2 id="form-dialog-title">{initialData ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="btn-close" onClick={onCancel} aria-label="Close dialog">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="prop-name">Property Name <span aria-hidden="true">*</span><span className="sr-only">(Required)</span></label>
              <input 
                type="text" 
                id="prop-name"
                name="name" 
                className="input-glass" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. Sunset Apartment"
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prop-unit">Unit/Room # <span className="sr-only">(Optional)</span></label>
              <input 
                type="text" 
                id="prop-unit"
                name="unitNumber" 
                className="input-glass" 
                value={formData.unitNumber || ''} 
                onChange={handleChange} 
                placeholder="e.g. 3B"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prop-type">Property Type</label>
              <select id="prop-type" name="type" className="input-glass select-glass" value={formData.type} onChange={handleChange}>
                <option value="room">Room</option>
                <option value="flat">Flat</option>
                <option value="villa">Villa</option>
                <option value="gala">Gala</option>
                <option value="farmhouse">Farmhouse</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="prop-rent">Monthly Rent (INR) <span aria-hidden="true">*</span><span className="sr-only">(Required)</span></label>
              <input 
                type="number" 
                id="prop-rent"
                name="rent" 
                className="input-glass" 
                value={formData.rent !== undefined ? formData.rent : ''} 
                onChange={handleChange} 
                placeholder="e.g. 1500"
                min="0"
                step="500"
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="prop-address">Address <span aria-hidden="true">*</span><span className="sr-only">(Required)</span></label>
              <input 
                type="text" 
                id="prop-address"
                name="address" 
                className="input-glass" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="123 Main St, City"
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="prop-light-bill">Light Bill Number <span className="sr-only">(Optional)</span></label>
              <input 
                type="text" 
                id="prop-light-bill"
                name="lightBillNumber" 
                className="input-glass" 
                value={formData.lightBillNumber || ''} 
                onChange={handleChange} 
                placeholder="e.g. 12345678"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prop-status">Current Status</label>
            <select id="prop-status" name="status" className="input-glass select-glass" value={formData.status} onChange={handleChange}>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {formData.status === 'occupied' && (
            <>
              <div className="form-row animation-fade-in">
                <div className="form-group">
                  <input 
                    type="text" 
                    id="prop-tenant"
                    name="tenantName" 
                    className="input-glass" 
                    value={formData.tenantName || ''} 
                    onChange={handleChange} 
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prop-tenant-id">Link to User Account</label>
                  <select 
                    id="prop-tenant-id" 
                    name="tenant_id" 
                    className="input-glass select-glass" 
                    value={formData.tenant_id || ''} 
                    onChange={handleChange}
                  >
                    <option value="">-- No Account --</option>
                    {users.filter(u => u.role === 'tenant').map(u => (
                      <option key={u.id} value={u.id?.toString()}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Select existing account or leave blank to automatically create a new one.
                  </p>
                </div>
              </div>
              {(!formData.tenant_id || formData.tenant_id === '') && (
                <div className="form-row animation-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="prop-tenant-email">Email (Required for Login) <span aria-hidden="true">*</span></label>
                    <input 
                      type="email" 
                      id="prop-tenant-email" 
                      name="tenantEmail" 
                      className="input-glass" 
                      value={formData.tenantEmail || ''} 
                      onChange={handleChange} 
                      required 
                      placeholder="tenant@example.com" 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prop-tenant-password">Password (Required for Login) <span aria-hidden="true">*</span></label>
                    <input 
                      type="text" 
                      id="prop-tenant-password" 
                      name="tenantPassword" 
                      className="input-glass" 
                      value={formData.tenantPassword || ''} 
                      onChange={handleChange} 
                      required 
                      placeholder="Create a secure password" 
                    />
                  </div>
                </div>
              )}
              <div className="form-row animation-fade-in">
                <div className="form-group">
                  <label htmlFor="prop-phone">Tenant Phone</label>
                  <input 
                    type="tel" 
                    id="prop-phone"
                    name="tenantPhone" 
                    className="input-glass" 
                    value={formData.tenantPhone || ''} 
                    onChange={handleChange} 
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="form-row animation-fade-in">
                <div className="form-group">
                  <label htmlFor="prop-next-payment">Next Payment Date</label>
                  <input 
                    type="date" 
                    id="prop-next-payment"
                    name="nextPaymentDate" 
                    className="input-glass" 
                    value={formData.nextPaymentDate || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prop-payment-status">Payment Status</label>
                  <select id="prop-payment-status" name="paymentStatus" className="input-glass select-glass" value={formData.paymentStatus || 'pending'} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="prop-notes">Additional Notes</label>
            <textarea 
              id="prop-notes"
              name="notes" 
              className="input-glass textarea-glass" 
              value={formData.notes || ''} 
              onChange={handleChange} 
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-glass" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Property</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
