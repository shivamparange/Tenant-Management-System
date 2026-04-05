import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import './SettingsMenu.css';

interface SettingsMenuProps {
  user: User;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onDeleteProfile: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  user, 
  isDarkMode, 
  onToggleTheme, 
  onLogout, 
  onEditProfile, 
  onDeleteProfile 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="settings-container" ref={menuRef}>
      <button 
        className={`btn btn-glass btn-icon settings-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <svg className="icon gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="settings-dropdown glass-panel animation-fade-in">
          <div className="dropdown-header">
            <img src={user.photo} alt="Profile" className="dropdown-avatar" />
            <div className="dropdown-user-info">
              <span className="name">{user.name}</span>
              <span className="role">{user.role}</span>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-list">
            <button className="dropdown-item" onClick={() => { onEditProfile(); setIsOpen(false); }}>
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Edit Profile</span>
            </button>

            <button className="dropdown-item" onClick={onToggleTheme}>
              {isDarkMode ? (
                <>
                  <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button className="dropdown-item danger" onClick={() => { onDeleteProfile(); setIsOpen(false); }}>
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Delete Account</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item logout" onClick={onLogout}>
            <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
