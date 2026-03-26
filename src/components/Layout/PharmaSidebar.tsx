import React from 'react';
import { NavLink } from 'react-router-dom';
import './PharmaSidebar.css';

interface NavItem {
  to: string;
  label: string;
  iconPath: string | string[];
}

const navItems: NavItem[] = [
  {
    to: '/intake',
    label: 'Subject Intake',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    to: '/protocol',
    label: 'Protocol I/E',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    to: '/physical-exam',
    label: 'Physical Exam',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
  },
  {
    to: '/medication',
    label: 'Medication',
    iconPath: [
      'M4.879 4.879a3 3 0 114.242 4.242 3 3 0 01-4.242-4.242z',
      'M9.121 9.121L19 19'
    ]
  },
  {
    to: '/adverse-events',
    label: 'Adverse Events',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  },
  {
    to: '/visits',
    label: 'Visits & Labs',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    to: '/dashboard',
    label: 'Regulatory',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
];

const PharmaSidebar: React.FC = () => {
  const renderIcon = (iconPath: string | string[]): React.ReactNode => {
    if (Array.isArray(iconPath)) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
          {iconPath.map((path, index) => (
            <path
              key={index}
              d={path}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" className="nav-icon">
        <path
          d={iconPath}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <aside className="pharma-sidebar">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link active nav-link-active' : 'nav-link'
                }
              >
                {renderIcon(item.iconPath)}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default PharmaSidebar;