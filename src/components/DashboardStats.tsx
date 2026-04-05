import React, { useState, useEffect } from 'react';
import type { Property } from '../types';

interface DashboardStatsProps {
  properties: Property[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ properties }) => {
  const [totalUnits, setTotalUnits] = useState<number>(0);
  
  // Real stats from our new API
  useEffect(() => {
    fetch("http://localhost:5000/dashboard-stats")
      .then(res => res.json())
      .then(data => setTotalUnits(data.total_properties))
      .catch(err => console.error("Failed to fetch dashboard stats", err));
  }, []);

  const occupiedCount = properties.filter(p => p.status === 'occupied').length;
  const vacantCount = properties.filter(p => p.status === 'vacant').length;
  const maintenanceCount = properties.filter(p => p.status === 'maintenance').length;
  const totalRent = properties.filter(p => p.status === 'occupied').reduce((sum, p) => sum + p.rent, 0);

  return (
    <section className="dashboard" aria-label="Dashboard Key Statistics">
      <article className="stat-card glass-panel glow-indigo">
        <div className="stat-header">
          <div className="stat-icon-wrapper indigo-glow" aria-hidden="true">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 id="stat-total-props">Total Units</h3>
        </div>
        <div className="stat-value" aria-labelledby="stat-total-props">{totalUnits || properties.length}</div>
      </article>
      
      <article className="stat-card glass-panel glow-emerald">
        <div className="stat-header">
          <div className="stat-icon-wrapper emerald-glow" aria-hidden="true">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 id="stat-occupied">Occupied</h3>
        </div>
        <div className="stat-value" aria-labelledby="stat-occupied">{occupiedCount}</div>
      </article>
      
      <article className="stat-card glass-panel glow-orange">
        <div className="stat-header">
          <div className="stat-icon-wrapper orange-glow" aria-hidden="true">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 id="stat-vacant">Vacant</h3>
        </div>
        <div className="stat-value" aria-labelledby="stat-vacant">{vacantCount}</div>
      </article>

      <article className="stat-card glass-panel glow-blue">
        <div className="stat-header">
          <div className="stat-icon-wrapper blue-glow" aria-hidden="true" style={{color: '#3b82f6'}}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 id="stat-maintenance">Maintenance</h3>
        </div>
        <div className="stat-value" aria-labelledby="stat-maintenance">{maintenanceCount}</div>
      </article>
      
      <article className="stat-card glass-panel glow-purple">
        <div className="stat-header">
          <div className="stat-icon-wrapper purple-glow" aria-hidden="true">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 id="stat-monthly-rent">Revenue</h3>
        </div>
        <div className="stat-value gradient-text" aria-labelledby="stat-monthly-rent">
          ₹{totalRent.toLocaleString()}
        </div>
      </article>
    </section>
  );
};

export default DashboardStats;
