import React, { useState } from 'react';
import './LoginPage.css';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateSignup: () => void;
  successMessage?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateSignup, successMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Make API call to backend /login
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Map DB columns to our React User type
      const userData: User = {
        id: data.user.id.toString(), 
        name: data.user.name || email.split('@')[0],
        email: data.user.email,
        photo: data.user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        role: data.user.role || 'tenant'
      };

      onLogin(userData);
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card glass-panel" aria-labelledby="login-heading">
        <div className="login-header">
          <div className="login-logo">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 id="login-heading" className="gradient-text">Parange Estates</h1>
          <p className="login-subtitle">Manage your properties with elegance and ease.</p>
          {successMessage && <div className="login-success-message animation-fade-in" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '0.85rem' }}>{successMessage}</div>}
          {error && <div className="login-error-message animation-fade-in">{error}</div>}
        </div>

        <div className="login-body">
          <form className="login-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-submit glow-button" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>Don't have an account? <span className="link-text" onClick={onNavigateSignup} onKeyDown={(e) => e.key === 'Enter' && onNavigateSignup()} role="button" tabIndex={0}>Sign up for free</span></p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
