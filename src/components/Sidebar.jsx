import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Zap,
  Sliders,
  LineChart,
  GitBranch,
  ShieldAlert,
  Settings,
  Cloud,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { alerts, instances } = useApp();

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;
  const unhealthyInstanceCount = instances.filter((i) => i.status === 'unhealthy').length;

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/instances',
      label: 'Instances',
      icon: Server,
      badge: unhealthyInstanceCount > 0 ? `${unhealthyInstanceCount} alert` : `${instances.length}`,
      badgeType: unhealthyInstanceCount > 0 ? 'badge-danger' : 'badge-neutral',
    },
    {
      to: '/traffic-testing',
      label: 'Traffic Testing',
      icon: Zap,
      badge: 'Interactive',
      badgeType: 'badge-primary',
    },
    {
      to: '/scaling-policies',
      label: 'Scaling Policies',
      icon: Sliders,
      badge: null,
    },
    {
      to: '/monitoring',
      label: 'Monitoring & Alerts',
      icon: LineChart,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
      badgeType: 'badge-danger',
    },
    {
      to: '/deployments',
      label: 'Deployments',
      icon: GitBranch,
      badge: 'CI/CD',
      badgeType: 'badge-neutral',
    },
    {
      to: '/rate-limiting',
      label: 'API Rate Limiting',
      icon: ShieldAlert,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-container">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <Cloud size={22} className="cloud-logo-svg" />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-name">CloudScale</span>
              <span className="brand-tag">AWS MONITORING</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Development Mode Pill */}
        <div className="sidebar-mode-indicator">
          <div className="mode-status-dot pulse" />
          <div className="mode-status-text">
            <span className="mode-title">DEV SIMULATION</span>
            <span className="mode-subtitle">Realistic Mock Telemetry</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="sidebar-nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>

                    {item.badge && (
                      <span className={`nav-badge ${item.badgeType || 'badge-neutral'}`}>
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight size={14} className="nav-chevron" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer info */}
        <div className="sidebar-footer">
          <div className="sidebar-stack-info">
            <span className="stack-label">INFRASTRUCTURE STACK</span>
            <div className="stack-badges">
              <span className="stack-pill">EC2 ASG</span>
              <span className="stack-pill">ALB</span>
              <span className="stack-pill">Spring Boot</span>
              <span className="stack-pill">RDS MySQL</span>
            </div>
          </div>
          <div className="sidebar-version-row">
            <span>CloudScale Dashboard</span>
            <span className="version-code">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
