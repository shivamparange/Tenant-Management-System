import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import type { Property } from '../types';

interface DashboardChartsProps {
  properties: Property[];
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6']; // Occupied, Vacant, Maintenance / Pending

const DashboardCharts: React.FC<DashboardChartsProps> = ({ properties }) => {
  if (!properties || properties.length === 0) return null;

  // 1. Pie Chart Data: Occupancy Rate
  const occupiedCount = properties.filter(p => p.status === 'occupied').length;
  const vacantCount = properties.filter(p => p.status === 'vacant').length;
  const maintenanceCount = properties.filter(p => p.status === 'maintenance').length;
  const total = properties.length;
  
  const occupancyData = [
    { name: 'Occupied', value: occupiedCount, percent: ((occupiedCount/total)*100).toFixed(0) },
    { name: 'Vacant', value: vacantCount, percent: ((vacantCount/total)*100).toFixed(0) },
    { name: 'Maintenance', value: maintenanceCount, percent: ((maintenanceCount/total)*100).toFixed(0) }
  ];

  // 2. Bar Chart Data: Monthly Rent Collection (Simulated/Calculated from current properties)
  // In a real app, this would come from a history collection or similar.
  const rentCollectionData = [
    { name: 'Jan', amount: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.85 : 0), 0) },
    { name: 'Feb', amount: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.90 : 0), 0) },
    { name: 'Mar', amount: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.95 : 0), 0) },
    { name: 'Apr', amount: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent : 0), 0) },
  ];

  // 3. Line Chart Data: Income Trends
  const incomeTrendData = [
    { month: 'Jan', income: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.8 : 0), 0) },
    { month: 'Feb', income: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.85 : 0), 0) },
    { month: 'Mar', income: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent * 0.92 : 0), 0) },
    { month: 'Apr', income: properties.reduce((s, p) => s + (p.status === 'occupied' ? p.rent : 0), 0) },
  ];

  const tooltipStyle = { 
    backgroundColor: 'var(--bg-secondary)', 
    border: '1px solid var(--glass-border)', 
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    color: 'var(--text-primary)'
  };

  return (
    <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
      <article className="glass-panel glow-indigo" style={{ padding: '24px' }}>
        <h3 className="chart-title">Occupancy Rate</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {occupancyData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-panel glow-purple" style={{ padding: '24px' }}>
        <h3 className="chart-title">Rent Collection</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={rentCollectionData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                cursor={{ fill: 'var(--input-bg)' }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="amount" fill="var(--indigo-primary)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-panel glow-orange" style={{ padding: '24px' }}>
        <h3 className="chart-title">Income Trends</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={incomeTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="var(--orange-glow)" 
                strokeWidth={3} 
                dot={{ r: 6, fill: 'var(--orange-glow)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
};

export default DashboardCharts;
