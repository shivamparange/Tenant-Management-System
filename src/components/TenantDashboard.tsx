import React, { useState, useEffect } from 'react';
import type { User, Property, Complaint } from '../types';
import './LoginPage.css'; // Reusing some glass styles

interface TenantDashboardProps {
  user: User;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ user }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [issueType, setIssueType] = useState('Plumbing');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTenantData();
  }, [user]);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned property
      const propRes = await fetch(`${process.env.REACT_APP_API_URL}/tenant/property/${user.id}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperty(propData);
      }

      // 2. Fetch maintenance requests
      const compRes = await fetch(`${process.env.REACT_APP_API_URL}/tenant-maintenance/${user.id}`);
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData);
      }
    } catch (err) {
      console.error("Error fetching tenant data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async () => {
    if (!property) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: property.rent })
      });

      const order = await response.json();
      console.log("Order created:", order);

      // Simulated Razorpay success
      const paymentSuccess = {
        tenant_id: user.id,
        property_id: property.id,
        amount: property.rent,
        transaction_id: "PAY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        payment_method: "UPI"
      };

      const successRes = await fetch(`${process.env.REACT_APP_API_URL}/payment-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentSuccess)
      });

      if (successRes.ok) {
        alert("Payment Successful! Rent marked as paid.");
        fetchTenantData();
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    }
  };

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !property) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/maintenance-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          property_id: property.id,
          issue_type: issueType,
          description: description
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert("Maintenance request submitted successfully.");
          setShowComplaintForm(false);
          setDescription('');
          fetchTenantData();
        } else {
          alert("Submission failed. Check backend console.");
        }
      }
    } catch (err) {
      alert("Failed to raise request.");
    }
  };

  if (loading) return <div className="loader-container"><span className="loader"></span></div>;

  return (
    <div className="app-main" style={{ padding: '20px' }}>
      <header className="dashboard-header animate-fade-in">
        <h2 className="gradient-text">Welcome, {user.name}</h2>
        <p className="text-muted">Manage your residency and payments easily.</p>
      </header>

      <div className="grid">
        {/* Rent & Property Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Current Residence</h3>
          {property ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{property.name}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{property.address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="rent-badge">₹{property.rent} / month</span>
                </div>
              </div>

              <div className="payment-status-strip paid" style={{ marginTop: '10px' }}>
                <span>Status: <strong className="status-text">Paid</strong></span>
                <span>Next Due: 5th June</span>
              </div>

              <button className="btn btn-primary glow-button" onClick={handlePayRent} style={{ width: '100%', marginTop: '10px' }}>
                Pay Rent Now
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>No property assigned. Please contact the manager.</p>
            </div>
          )}
        </div>

        {/* Maintenance Requests */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Maintenance Requests</h3>
            <button className="btn btn-glass" onClick={() => setShowComplaintForm(!showComplaintForm)}>
              {showComplaintForm ? 'View List' : '+ Raise Request'}
            </button>
          </div>

          {showComplaintForm ? (
            <form onSubmit={handleRaiseComplaint} className="login-form">
              <div className="form-group">
                <label>Issue Type</label>
                <select className="input-glass select-glass" value={issueType} onChange={e => setIssueType(e.target.value)}>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Appliance">Appliance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="input-glass" 
                  style={{ height: '80px', paddingTop: '10px' }} 
                  placeholder="Describe your problem..." 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {complaints.length === 0 ? (
                <p className="text-muted">No active requests.</p>
              ) : (
                complaints.map(c => (
                  <div key={c.id} className="info-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.issue_type}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{c.description}</div>
                    </div>
                    <span className={`status-pill status-${c.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.65rem' }}>
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
        <h3>Payment History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="db-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* This should be fetched from backend */}
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  Loading history...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
