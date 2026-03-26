import React from 'react';
import { NavLink } from 'react-router-dom';
import './PharmaHeader.css';

const PharmaHeader: React.FC = () => {
  return (
    <header className="pharma-header">
      <div className="header-left">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" className="icon-svg">
            <path
              d="M19 14V6c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 14h18l-2 6H5l-2-6z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1>Pharma Forms</h1>
          <p className="subtitle">Clinical Trial Protocol Suite</p>
        </div>
      </div>
      <div className="header-right">
        <div className="meta-item">
          <span className="label">ENVIRONMENT</span>
          <span className="value env">DEVELOPMENT</span>
        </div>
        <div className="meta-item">
          <span className="label">INVESTIGATOR</span>
          <span className="value user">DR. M. PATEL</span>
        </div>
        <NavLink to="/" className="exit-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="exit-icon"
            style={{ width: '18px', height: '18px' }}
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Exit Suite</span>
        </NavLink>
      </div>
    </header>
  );
};

export default PharmaHeader;