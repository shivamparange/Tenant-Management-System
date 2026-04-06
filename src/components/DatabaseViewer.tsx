import React, { useState } from 'react';
import type { Property, User } from '../types';
import './DatabaseViewer.css';

interface DatabaseViewerProps {
  properties: Property[];
  currentUser?: User;
  onClose: () => void;
}

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ properties, currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'tenants' | 'payments' | 'users'>('properties');
  const [users, setUsers] = useState<User[]>([]);

  // Placeholder for users until backend API is ready
  const fetchUsers = async () => {
    if (activeTab !== 'users' || currentUser?.role !== 'admin') return;
    setUsers([]);
  };

  React.useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleUpdateUserRole = async (id: string, newRole: string) => {
    console.log(id, newRole);
    alert('User role update requires backend API.');
  };

  const handleDeleteUser = async (id: string) => {
    console.log(id);
    alert('User deletion requires backend API.');
  };

  // Flatten the nested data to create tabular structures
  const tenantRows = properties.flatMap(p => 
    (p.history || []).map(h => ({
      propertyId: p.id,
      propertyName: p.name,
      propertyUnit: p.unitNumber || 'N/A',
      tenantId: h.id,
      tenantName: h.tenantName,
      phoneNumber: h.phoneNumber,
      moveInDate: h.moveInDate,
      moveOutDate: h.moveOutDate || 'Present',
      rentAmount: h.rentAmount,
      deposit: h.deposit,
      paymentsCount: (h.payments || []).length
    }))
  );

  const paymentRows = properties.flatMap(p => 
    (p.history || []).flatMap(h => 
      (h.payments || []).map(pay => ({
        paymentId: pay.id,
        propertyName: p.name,
        tenantName: h.tenantName,
        month: pay.month,
        amount: pay.amount,
        status: pay.status,
        paymentDate: pay.paymentDate || 'N/A'
      }))
    )
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content glass-panel database-container">
        <div className="db-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg className="icon" style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <h2>Raw Database Viewer</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close dialog">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="db-tabs">
          <button className={`db-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
            Properties ({properties.length})
          </button>
          <button className={`db-tab ${activeTab === 'tenants' ? 'active' : ''}`} onClick={() => setActiveTab('tenants')}>
            Tenant History ({tenantRows.length})
          </button>
          <button className={`db-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            Payment Ledgers ({paymentRows.length})
          </button>
          {currentUser?.role === 'admin' && (
            <button className={`db-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              User Management
            </button>
          )}
        </div>

        <div className="db-table-container">
          {activeTab === 'properties' && (
            <table className="db-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Monthly Rent</th>
                  <th>Address</th>
                  <th>Bill #</th>
                  <th>Current Tenant</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td className="db-id" title={p.id}>{p.id.substring(0, 8)}...</td>
                    <td>{p.name}</td>
                    <td>{p.unitNumber || '-'}</td>
                    <td style={{textTransform: 'capitalize'}}>{p.type}</td>
                    <td>
                      <span className={`db-badge db-badge-${p.status}`}>{p.status}</span>
                    </td>
                    <td>₹{p.rent}</td>
                    <td>{p.address}</td>
                    <td>{p.lightBillNumber || '-'}</td>
                    <td>{p.tenantName || '-'}</td>
                    <td>{p.tenantPhone || '-'}</td>
                  </tr>
                ))}
                {properties.length === 0 && <tr><td colSpan={10} className="db-empty">No properties in database.</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'tenants' && (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Tenant ID</th>
                  <th>Property</th>
                  <th>Tenant Name</th>
                  <th>Phone</th>
                  <th>Move In</th>
                  <th>Move Out</th>
                  <th>Rent Amount</th>
                  <th>Deposit</th>
                  <th>Logs</th>
                </tr>
              </thead>
              <tbody>
                {tenantRows.map(t => (
                  <tr key={t.tenantId}>
                    <td className="db-id" title={t.tenantId}>{t.tenantId.substring(0, 8)}...</td>
                    <td>{t.propertyName} {t.propertyUnit !== 'N/A' && `#${t.propertyUnit}`}</td>
                    <td>{t.tenantName}</td>
                    <td>{t.phoneNumber}</td>
                    <td>{t.moveInDate}</td>
                    <td>{t.moveOutDate === 'Present' ? <span className="db-badge db-badge-occupied">Present</span> : t.moveOutDate}</td>
                    <td>₹{t.rentAmount}</td>
                    <td>₹{t.deposit}</td>
                    <td>{t.paymentsCount} Payment(s)</td>
                  </tr>
                ))}
                {tenantRows.length === 0 && <tr><td colSpan={9} className="db-empty">No tenant history in database.</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'payments' && (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Rent Month</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map(pay => (
                  <tr key={pay.paymentId}>
                    <td className="db-id" title={pay.paymentId}>{pay.paymentId.substring(0, 8)}...</td>
                    <td>{pay.propertyName}</td>
                    <td>{pay.tenantName}</td>
                    <td><strong>{pay.month}</strong></td>
                    <td>
                      <span className={`db-badge db-badge-${pay.status === 'paid' ? 'vacant' : 'maintenance'}`}>
                        {pay.status.toUpperCase()}
                      </span>
                    </td>
                    <td>₹{pay.amount}</td>
                    <td>{pay.paymentDate}</td>
                  </tr>
                ))}
                {paymentRows.length === 0 && <tr><td colSpan={7} className="db-empty">No payment records in database.</td></tr>}
              </tbody>
            </table>
          )}
          {activeTab === 'users' && currentUser?.role === 'admin' && (
            <table className="db-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="db-id" title={u.id}>{u.id?.substring(0, 8)}...</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={u.photo} alt={u.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                       <select 
                         className="btn-glass" 
                         value={u.role || 'tenant'} 
                         onChange={(e) => handleUpdateUserRole(u.id!, e.target.value as any)}
                         style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                       >
                         <option value="admin">Admin</option>
                         <option value="manager">Manager</option>
                         <option value="tenant">Tenant</option>
                       </select>
                    </td>
                    <td>
                       <button className="btn-icon-small btn-danger-text" onClick={() => handleDeleteUser(u.id!)} title="Delete User">
                          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.2)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          * Read-only raw data aggregated from backend SQL collections.
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
