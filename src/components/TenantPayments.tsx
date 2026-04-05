import React, { useState } from 'react';
import type { TenantHistoryRecord, RentPaymentRecord, Property } from '../types';

interface TenantPaymentsProps {
  property: Property;
  tenant: TenantHistoryRecord;
  onUpdateTenant: (updatedTenant: TenantHistoryRecord) => void;
}

const TenantPayments: React.FC<TenantPaymentsProps> = ({ property, tenant, onUpdateTenant }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>(tenant.rentAmount || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState<'paid' | 'unpaid'>('paid');

  const payments = tenant.payments || [];

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonth || newAmount === '') return;

    const payload = {
      tenant_id: tenant.id,
      property_id: property.id,
      month: newMonth,
      amount: Number(newAmount),
      paymentDate: newStatus === 'paid' ? newDate : undefined,
      status: newStatus
    };

    try {
      const response = await fetch("http://localhost:5000/add-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        const newPayment: RentPaymentRecord = {
          id: data.id ? data.id.toString() : crypto.randomUUID(),
          month: newMonth,
          amount: Number(newAmount),
          paymentDate: newStatus === 'paid' ? newDate : undefined,
          status: newStatus
        };
        const updatedTenant = {
          ...tenant,
          payments: [...payments, newPayment].sort((a, b) => b.month.localeCompare(a.month))
        };
        onUpdateTenant(updatedTenant); 
        setIsAdding(false);
      } else {
        alert("Failed to save payment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const newStatus = payment.status === 'paid' ? 'unpaid' : 'paid';
    const newDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined;

    try {
      const response = await fetch("http://localhost:5000/payment-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, status: newStatus, paymentDate: newDate })
      });
      if (response.ok) {
        const updatedPayments = payments.map(p => {
          if (p.id === paymentId) {
            return {
              ...p,
              status: newStatus,
              paymentDate: newDate
            } as RentPaymentRecord;
          }
          return p;
        });
        onUpdateTenant({ ...tenant, payments: updatedPayments });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Delete this payment record?')) {
      try {
        const response = await fetch(`http://localhost:5000/payment/${paymentId}`, {
          method: "DELETE"
        });
        if (response.ok) {
          const updatedPayments = payments.filter(p => p.id !== paymentId);
          onUpdateTenant({ ...tenant, payments: updatedPayments });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const printReceipt = (payment: RentPaymentRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Rent Receipt - ${tenant.tenantName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1a237e; }
            .details table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .details th, .details td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
            .amount { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; color: #2e7d32; }
            .footer { margin-top: 40px; text-align: center; color: #777; font-size: 14px; }
            @media print { body { padding: 0; } .receipt-container { border: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>Rent Receipt</h1>
              <p>Date: ${payment.paymentDate || new Date().toISOString().split('T')[0]}</p>
            </div>
            <div class="details">
              <table>
                <tr><th>Property:</th><td>${property.name} ${property.unitNumber ? '#' + property.unitNumber : ''}</td></tr>
                <tr><th>Tenant:</th><td>${tenant.tenantName}</td></tr>
                <tr><th>Rent Month:</th><td>${payment.month}</td></tr>
                <tr><th>Payment Status:</th><td>${payment.status.toUpperCase()}</td></tr>
              </table>
            </div>
            <div class="amount">
              Amount Paid: ₹${(payment.amount || 0).toLocaleString()}
            </div>
            <div class="footer">
              <p>Generated by Parange Estates Management System</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h5 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Monthly Payments</h5>
        {!isAdding && (
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setIsAdding(true)}>
            + Add Payment
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddPayment} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Month (e.g. 2023-01)</label>
              <input type="month" className="input-glass" required value={newMonth} onChange={e => setNewMonth(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" className="input-glass" required min="0" step="500" value={newAmount} onChange={e => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label>Status</label>
              <select className="input-glass select-glass" value={newStatus} onChange={e => setNewStatus(e.target.value as 'paid' | 'unpaid')}>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            {newStatus === 'paid' && (
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" className="input-glass" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-glass" onClick={() => setIsAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Rent</button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '12px 0' }}>No payment records found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payments.map(payment => (
            <div key={payment.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: payment.status === 'paid' ? '3px solid var(--emerald-success)' : '3px solid #ef4444' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 600 }}>{payment.month}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{(payment.amount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {payment.status === 'paid' ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--emerald-success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                    Paid on {payment.paymentDate}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                    Unpaid
                  </span>
                )}
                
                <button title="Toggle Status" onClick={() => handleToggleStatus(payment.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                  <svg className="icon" style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {payment.status === 'paid' && (
                  <button title="Print Receipt" onClick={() => printReceipt(payment)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '4px' }}>
                    <svg className="icon" style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                )}

                <button title="Delete" onClick={() => handleDeletePayment(payment.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.7 }}>
                   <svg className="icon" style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantPayments;
