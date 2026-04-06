import { useState, useEffect } from 'react';
import type { Property, PropertyStatus, User, TenantHistoryRecord } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PropertyHistory from './components/PropertyHistory';
import DashboardCharts from './components/DashboardCharts';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import PropertyControls from './components/PropertyControls';
import DatabaseViewer from './components/DatabaseViewer';
import MaintenanceRequestsAdmin from './components/MaintenanceRequestsAdmin';
import LandingPage from './components/LandingPage';
import ProfileEditor from './components/ProfileEditor';
import TenantDashboard from './components/TenantDashboard';
import { exportRentReport } from './utils/exportReport';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [viewingHistoryProperty, setViewingHistoryProperty] = useState<Property | undefined>(undefined);
  const [historyModalMode, setHistoryModalMode] = useState<'view' | 'add'>('view');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDatabaseViewOpen, setIsDatabaseViewOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');

  // Sync with Backend Auth (Token check can be added here)
  useEffect(() => {
    // We've removed LocalStorage persistence as requested.
    // Real auth persistence would use a secure cookie or a token refresh flow.
  }, []);

  // Toggle theme
  useEffect(() => {
    if (!isDarkMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Fetch properties from Node API
  const fetchProperties = async () => {
    if (!user?.id) {
      setProperties([]);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/properties`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      // Map DB columns to our React Property type
      const mappedData = data.map((item: any) => ({
        id: item.id?.toString() || crypto.randomUUID(), // Convert integer ID to string
        name: item.property_name || '',
        unitNumber: item.unit_number || '',
        type: item.type || 'room',
        address: item.address || '',
        rent: item.monthly_rent || 0,
        status: (item.status || 'vacant').toLowerCase(),
        createdAt: Date.now(),
        tenantName: '',
        tenantPhone: '',
        notes: ''
      }));
      
      mappedData.sort((a: Property, b: Property) => (b.createdAt || 0) - (a.createdAt || 0));
      setProperties(mappedData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  // Real-time synchronization fallback or initial load
  useEffect(() => {
    fetchProperties();
    // (We removed onSnapshot, so no real-time stream right now without polling)
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login'); // Redirect to login
  };

  const handleUpdateProfile = async (newData: Partial<User>) => {
    if (!user?.id) return;
    // convert this to API call when /update-user is ready
    setUser(prev => prev ? { ...prev, ...newData } : null);
    setIsProfileEditorOpen(false);
    alert('Profile updated locally.');
  };

  const handleDeleteProfile = async () => {
    if (!user?.id) return;
    if (window.confirm('Delete your profile?')) {
      setUser(null);
      setAuthMode('landing');
      alert('Profile deleted (Simulated).');
    }
  };

  const handleSave = async (property: Property) => {
    if (!user?.id) return;
    
    try {
      let savedPropertyId = property.id;
      if (editingProperty) {
         // PUT request for updating
         const response = await fetch(`${process.env.REACT_APP_API_URL}/property`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             id: property.id,
             property_name: property.name,
             unit_number: property.unitNumber || '',
             type: property.type,
             address: property.address,
             rent: property.rent,
             status: property.status
           })
         });
         
         if (!response.ok) throw new Error("Failed to update property");
      } else {
         // POST request for adding
         const response = await fetch(`${process.env.REACT_APP_API_URL}/add-property`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             property_name: property.name,
             unit_number: property.unitNumber || '',
             type: property.type,
             address: property.address,
             rent: property.rent,
             status: property.status
           })
         });

         if (!response.ok) throw new Error("Failed to add property via API");
         const result = await response.json();
         savedPropertyId = result.id ? result.id.toString() : property.id;
      }

      if (property.status === 'occupied' && property.tenantName) {
        const tenantPayload = {
          property_id: savedPropertyId,
          user_id: (property.tenant_id && property.tenant_id !== '') ? property.tenant_id : null,
          name: property.tenantName,
          phone: property.tenantPhone,
          email: property.tenantEmail || '',
          password: property.tenantPassword || '',
          move_in_date: new Date().toISOString().split('T')[0],
          move_out_date: null,
          deposit: 0,
          rent_amount: property.rent,
          rent_due_day: 5
        };
        const tr = await fetch(`${process.env.REACT_APP_API_URL}/add-tenant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tenantPayload)
        });
        
        const trData = await tr.json().catch(() => ({}));
        if (!tr.ok) {
          throw new Error(trData.message || "Failed to save tenant record");
        }
        if (trData.success && trData.message === "Tenant account created successfully. They can now login.") {
          alert(trData.message);
        }
      }

      // Refresh property list from DB
      await fetchProperties();
      closeForm();
      
    } catch (e: any) {
      console.error("Failed to save property:", e);
      alert(e.message || 'Failed to save property. Check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/property`, {
           method: "DELETE",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ id })
        });
        
        if (!response.ok) throw new Error("Failed to delete property");
        
        await fetchProperties();
      } catch (e) {
        console.error("Failed to delete property:", e);
        alert("Failed to delete property");
      }
    }
  };

  const handleUpdateHistory = async (propertyId: string, history: TenantHistoryRecord[]) => {
    // Refresh properties to sync status and linked users
    fetchProperties();
    if (viewingHistoryProperty?.id === propertyId) {
      setViewingHistoryProperty(prev => prev ? { ...prev, history } : undefined);
    }
  };

  const openFormForEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const openFormForNew = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProperty(undefined);
  };

  // Derived filtered properties
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    if (authMode === 'landing') {
      return (
        <LandingPage 
          onGetStarted={() => setAuthMode('signup')}
          onSignIn={() => setAuthMode('login')}
        />
      );
    }
    
    if (authMode === 'login') {
      return (
        <LoginPage 
          successMessage={signupSuccessMessage}
          onLogin={(userData) => {
            handleLogin(userData);
            setSignupSuccessMessage(null); // Clear success message after login
          }} 
          onNavigateSignup={() => {
            setSignupSuccessMessage(null);
            setAuthMode('signup');
          }} 
        />
      );
    } else {
      return (
        <SignupPage 
          onSuccess={(msg: string) => {
            setSignupSuccessMessage(msg);
            setAuthMode('login'); // Auto switch to login after successful signup
          }} 
          onNavigateLogin={() => setAuthMode('login')} 
        />
      );
    }
  }

  return (
    <div className="app-container">
      <Header 
        user={user} 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
        onLogout={handleLogout} 
        onAddProperty={openFormForNew} 
        onOpenDatabase={() => setIsDatabaseViewOpen(true)}
        onOpenMaintenance={() => setIsMaintenanceOpen(true)}
        onEditProfile={() => setIsProfileEditorOpen(true)}
        onDeleteProfile={handleDeleteProfile}
      />

      {isProfileEditorOpen && (
        <ProfileEditor 
          user={user}
          onSave={handleUpdateProfile}
          onDelete={handleDeleteProfile}
          onCancel={() => setIsProfileEditorOpen(false)}
        />
      )}

      {isDatabaseViewOpen && (
        <DatabaseViewer 
          properties={properties}                currentUser={user}
          onClose={() => setIsDatabaseViewOpen(false)} 
        />
      )}

      {isMaintenanceOpen && (
        <MaintenanceRequestsAdmin 
          onClose={() => setIsMaintenanceOpen(false)} 
          onRefresh={fetchProperties}
        />
      )}

      {isFormOpen && (
        <PropertyForm 
          initialData={editingProperty} 
          onSave={handleSave} 
          onCancel={closeForm} 
        />
      )}

      {viewingHistoryProperty && (
        <PropertyHistory
          property={viewingHistoryProperty}
          initialMode={historyModalMode}
          onUpdateHistory={handleUpdateHistory}
          onClose={() => setViewingHistoryProperty(undefined)}
        />
      )}

      <main className="app-main">
        <header className="dashboard-header animate-fade-in">
          <h2 className="gradient-text">
            {user.role === 'admin' ? 'Admin Dashboard' : 
             user.role === 'manager' ? 'Manager Dashboard' : 
             'Tenant Dashboard'}
          </h2>
          <p className="text-muted">
            {user.role === 'admin' ? 'System overview and global property management.' : 
             user.role === 'manager' ? 'Manage your properties and tenant relations.' : 
             'View your property details and payment status.'}
          </p>
        </header>

        {user.role === 'tenant' ? (
           <TenantDashboard user={user} />
        ) : (
          <>
            <DashboardStats properties={properties} />
            <DashboardCharts properties={properties} />
          </>
        )}

        {user.role !== 'tenant' && (
          <>
            <PropertyControls 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onExport={() => exportRentReport(properties)}
            />

            <section className="property-list" aria-label="Properties Directory">
              {properties.length === 0 ? (
                <div className="empty-state glass-panel">
                  <svg className="icon" style={{width: 48, height: 48, marginBottom: 16, opacity: 0.5}} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h2>No properties yet</h2>
                  <p>Add your first room or flat to start tracking.</p>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={openFormForNew}>
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid">
                  {filteredProperties.length === 0 ? (
                    <div style={{ padding: '24px', color: 'var(--text-muted)' }}>No properties match your search.</div>
                  ) : (
                    filteredProperties.map(property => (
                      <PropertyCard 
                      key={property.id} 
                      property={property} 
                      userRole={user.role}
                      onEdit={() => openFormForEdit(property)}
                      onDelete={() => handleDelete(property.id)}
                      onViewHistory={() => {
                        setViewingHistoryProperty(property);
                        setHistoryModalMode('view');
                      }}
                      onAddTenant={() => {
                        setViewingHistoryProperty(property);
                        setHistoryModalMode('add');
                      }}
                    />
                    ))
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
