import React, { useEffect } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  useEffect(() => {
    // Add reveal animation on scroll
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <nav className="landing-nav animate-fade-in">
        <div className="logo">
          <div className="logo-icon-wrapper glow-indigo">
             <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
             </svg>
          </div>
          <h1 className="gradient-text">Parange Estates</h1>
        </div>
        <div className="nav-actions">
          <button className="btn btn-glass" onClick={onSignIn}>Sign In</button>
          <button className="btn btn-primary glow-button" onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content animate-slide-up">
          <h1 className="hero-title">Smart Property Management <br/><span className="gradient-text">for Modern Landlords</span></h1>
          <p className="hero-description">
            The all-in-one platform to track properties, manage tenants, and monitor rent payments with elegant real-time analytics.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-xl glow-button" onClick={onGetStarted}>Get Started Free</button>
            <button className="btn btn-glass btn-xl" onClick={onSignIn}>Sign In to Dashboard</button>
          </div>
        </div>
        <div className="hero-visual animate-fade-in">
           {/* Visual placeholder for dashboard preview */}
           <div className="dashboard-preview-card glass-panel">
              <div className="preview-header"></div>
              <div className="preview-stats">
                <div className="preview-stat"></div>
                <div className="preview-stat"></div>
                <div className="preview-stat"></div>
              </div>
              <div className="preview-chart"></div>
           </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section reveal">
        <div className="section-header">
          <h2 className="section-title">Everything you need to <span className="gradient-text">scale your estate</span></h2>
          <p className="section-subtitle">Powerful tools designed for individual landlords and property managers.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon indigo-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10m-6 0h6" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h3>Property Management</h3>
            <p>Easily add and organize rooms, flats, villas, and villas with custom details.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon emerald-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h3>Tenant Tracking</h3>
            <p>Keep a detailed history of tenants, contact info, and move-in/out dates.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon orange-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h3>Rent Payments</h3>
            <p>Log payments monthly and track overdue rent with automated status badges.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon purple-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h3>Real-time Dashboard</h3>
            <p>Visualize your income and occupancy rates with professional interactive charts.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works reveal">
        <h2 className="section-title text-center">How It <span className="gradient-text">Works</span></h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number indigo-glow">1</div>
            <h4>Add Properties</h4>
            <p>Input your unit details, rent amounts, and bill numbers.</p>
          </div>
          <div className="step-arrow"></div>
          <div className="step-item">
            <div className="step-number emerald-glow">2</div>
            <h4>Assign Tenants</h4>
            <p>Link tenants to units and track their payment history.</p>
          </div>
          <div className="step-arrow"></div>
          <div className="step-item">
            <div className="step-number purple-glow">3</div>
            <h4>Monthly Tracking</h4>
            <p>Monitor revenue and export professional reports.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials reveal">
        <h2 className="section-title text-center">Loved by <span className="gradient-text">Landlords</span></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card glass-panel">
            <p>"The best tool I've used for my flat management. The design is stunning and the charts are so helpful."</p>
            <div className="testimonial-user">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              <div>
                <h5>Rajesh Kumar</h5>
                <span>Villa Owner</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass-panel">
            <p>"Simple, fast, and does exactly what it says. Tracking 20+ units has never been this easy."</p>
            <div className="testimonial-user">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sherry" alt="User" />
              <div>
                <h5>Anita Sharma</h5>
                <span>Property Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <h2 className="gradient-text">Parange Estates</h2>
            </div>
            <p>Managing the future of real estate portals with precision and elegance.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <label>Product</label>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Analytics</a>
            </div>
            <div className="link-group">
              <label>Company</label>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
            <div className="link-group">
              <label>Follow Us</label>
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">Facebook</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Parange Estates. Built for Excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
