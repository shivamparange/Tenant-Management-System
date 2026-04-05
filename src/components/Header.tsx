import type { User } from '../types';
import SettingsMenu from './SettingsMenu';

interface HeaderProps {
  user: User;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onAddProperty: () => void;
  onOpenDatabase: () => void;
  onOpenMaintenance: () => void;
  onEditProfile: () => void;
  onDeleteProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  isDarkMode, 
  onToggleTheme, 
  onLogout, 
  onAddProperty, 
  onOpenDatabase,
  onOpenMaintenance,
  onEditProfile,
  onDeleteProfile
}) => {
  return (
    <header className="app-header glass-panel">
      <div className="logo" aria-label="Parange Estates Logo">
        <div className="logo-icon-wrapper glow-indigo">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h1 className="gradient-text">Parange Estates</h1>
      </div>
      <div className="header-actions">
        <div className="user-profile">
          <div className="user-info">
            <img src={user.photo} alt={`${user.name}'s profile`} className="user-avatar" loading="lazy" width="40" height="40" />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className={`user-role-badge role-${user.role || 'tenant'}`}>
                {user.role || 'tenant'}
              </span>
            </div>
          </div>
          
          <SettingsMenu 
            user={user}
            isDarkMode={isDarkMode}
            onToggleTheme={onToggleTheme}
            onLogout={onLogout}
            onEditProfile={onEditProfile}
            onDeleteProfile={onDeleteProfile}
          />
        </div>

        {user.role !== 'tenant' && (
          <div className="header-nav-group">
            {user.role === 'admin' && (
              <button className="btn btn-glass btn-icon glow-purple" onClick={onOpenDatabase} aria-label="Database" title="View Database">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </button>
            )}

            <button className="btn btn-glass btn-icon glow-blue" onClick={onOpenMaintenance} aria-label="Maintenance" title="View Maintenance Requests">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button className="btn btn-primary btn-add glow-indigo" onClick={onAddProperty}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Property</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
