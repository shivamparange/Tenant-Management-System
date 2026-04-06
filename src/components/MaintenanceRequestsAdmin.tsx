import React, { useState, useEffect } from 'react';
import type { Complaint } from '../types';
import './DatabaseViewer.css'; // Reusing database viewer overall modal styles

interface MaintenanceRequestsAdminProps {
  onClose: () => void;
  onRefresh?: () => void;
}

const MaintenanceRequestsAdmin: React.FC<MaintenanceRequestsAdminProps> = ({ onClose, onRefresh }) => {
  const [requests, setRequests] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/maintenance-requests`);
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error("Error fetching admin maintenance requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/maintenance-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
        onRefresh?.();
        alert(data.message || "Status updated successfully");
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Pending': return 'status-vacant'; // Yellow
      case 'Approved': return 'status-maintenance'; // Blue
      case 'Resolved': return 'status-occupied'; // Green
      case 'Rejected': return 'status-rejected'; // Custom Red (or we can use error colors)
      default: return 'status-vacant';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ width: '95%', maxWidth: '1000px', padding: '0' }}>
        <div className="db-header">
          <div className="db-title-group">
            <h2 className="gradient-text">Maintenance Requests</h2>
            <p className="text-muted">Review and manage tenant complaints.</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="db-content" style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><span className="loader"></span></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <p>No maintenance requests found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {requests.map(req => (
                <article key={req.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.issue_type}</h3>
                    <span className={`status-pill ${getStatusClass(req.status)}`}>{req.status}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Property: <strong style={{color: 'var(--text-primary)'}}>{req.property_name}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Tenant: <strong style={{color: 'var(--text-primary)'}}>{req.tenant_name}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Date: {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>

                  <p style={{ margin: 0, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.95rem' }}>
                    {req.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', flexWrap: 'wrap' }}>
                    {req.status === 'Pending' && (
                      <>
                        <button className="btn btn-primary" onClick={() => handleUpdateStatus(req.id, 'Approved')} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>Approve</button>
                        <button className="btn btn-glass btn-danger-text" onClick={() => handleUpdateStatus(req.id, 'Rejected')} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>Reject</button>
                      </>
                    )}
                    {req.status === 'Approved' && (
                      <button className="btn btn-primary glow-button" onClick={() => handleUpdateStatus(req.id, 'Resolved')} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', background: 'var(--emerald-primary)' }}>Mark Resolved</button>
                    )}
                    {(req.status === 'Resolved' || req.status === 'Rejected') && (
                      <span style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Ticket closed
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequestsAdmin;
