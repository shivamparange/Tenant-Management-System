import React, { useState } from 'react';
import type { User } from '../types';

interface ProfileEditorProps {
  user: User;
  onSave: (newData: Partial<User>) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave, onDelete, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile || '');
  const [photo, setPhoto] = useState(user.photo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, mobile, photo });
  };

  return (
    <div className="modal-overlay animation-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 className="gradient-text" style={{ marginBottom: '24px' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-glass" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input 
              type="tel" 
              className="input-glass" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Profile Picture URL</label>
            <input 
              type="url" 
              className="input-glass" 
              value={photo} 
              onChange={(e) => setPhoto(e.target.value)} 
              required 
            />
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <img src={photo} alt="Preview" style={{ width: 40, height: 40, borderRadius: '10px' }} />
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preview</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
             <button type="submit" className="btn btn-primary glow-indigo" style={{ flex: 1 }}>Save Changes</button>
             <button type="button" className="btn btn-glass" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Danger Zone</span>
            <button 
              type="button" 
              className="btn" 
              onClick={onDelete}
              style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              Delete My Profile Permanently
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
