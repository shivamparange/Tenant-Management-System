import React, { useState } from 'react';
import './LoginPage.css';
interface SignupPageProps {
  onSuccess: (message: string) => void;
  onNavigateLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSuccess, onNavigateLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState<'admin' | 'manager' | 'tenant'>('tenant');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);



  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      return setError('Please fill in all required fields.');
    }
    if (phone.length < 10) {
      return setError('Please enter a valid 10-digit mobile number.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (!agreedToTerms) {
      return setError('You must agree to the Terms and Conditions.');
    }

    setLoading(true);
    try {
      // 1) Make API call to backend /signup
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          role: role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create an account.');
      }

      onSuccess('Account created successfully. Please login.');
      onNavigateLogin();
    } catch (err: any) {
      console.error('Signup Error:', err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card glass-panel signup-card" aria-labelledby="signup-heading">
        <div className="login-header">
          <div className="login-logo">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 id="signup-heading" className="gradient-text" style={{ fontSize: '2rem' }}>Create Account</h1>
          <p className="login-subtitle">Join Parange Estates today.</p>
          {error && <div className="login-error-message animation-fade-in" role="alert">{error}</div>}
        </div>

        <div className="login-body">
          <form className="login-form" onSubmit={handleEmailSignup}>
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input 
                  type="text" 
                  id="fullName" 
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input 
                  type="tel" 
                  id="mobile" 
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
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
              <label>Select Profile <span aria-hidden="true">*</span></label>
              <div className="role-selection">
                <label className={`role-option ${role === 'tenant' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="tenant" 
                    checked={role === 'tenant'} 
                    onChange={() => setRole('tenant')} 
                  />
                  <span>Tenant</span>
                </label>
                <label className={`role-option ${role === 'manager' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="manager" 
                    checked={role === 'manager'} 
                    onChange={() => setRole('manager')} 
                  />
                  <span>Manager</span>
                </label>
                <label className={`role-option ${role === 'admin' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin" 
                    checked={role === 'admin'} 
                    onChange={() => setRole('admin')} 
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>



            <div className="form-group">
              <label htmlFor="password">Password <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Create a strong password"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span aria-hidden="true">*</span></label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms">I agree to the Terms & Conditions</label>
            </div>

            <button type="submit" className="btn btn-primary login-submit glow-button" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>Already have an account? <span className="link-text" onClick={onNavigateLogin}>Log in</span></p>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
