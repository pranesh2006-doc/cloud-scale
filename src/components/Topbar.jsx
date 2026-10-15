import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  RotateCw,
  Bell,
  Globe,
  Layers,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AWS_REGIONS, ENVIRONMENTS } from '../data/mockData';
import { formatTimestamp } from '../utils/formatters';

export const Topbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedEnvironment,
    setSelectedEnvironment,
    lastUpdated,
    refreshData,
    alerts,
    dismissAlert,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Derive page title & breadcrumbs from route
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Overview Dashboard', section: 'Infrastructure' };
      case '/instances':
        return { title: 'EC2 Instances', section: 'Compute' };
      case '/traffic-testing':
        return { title: 'Traffic Load Simulator', section: 'Testing & Stress' };
      case '/scaling-policies':
        return { title: 'Auto Scaling Policies', section: 'Scaling & Resilience' };
      case '/monitoring':
        return { title: 'CloudWatch Metrics & Alerts', section: 'Observability' };
      case '/deployments':
        return { title: 'CI/CD Deployments', section: 'Delivery Pipeline' };
      case '/rate-limiting':
        return { title: 'API Rate Limiting', section: 'Security & Throttling' };
      case '/settings':
        return { title: 'Settings & Integrations', section: 'Configuration' };
      default:
        return { title: 'Dashboard', section: 'CloudScale' };
    }
  };

  const meta = getPageMeta();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumbs">
          <div className="breadcrumb-trail">
            <span className="breadcrumb-root">CloudScale</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-section">{meta.section}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{meta.title}</span>
          </div>
          <h1 className="topbar-page-title">{meta.title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* Mock Data Banner Pill */}
        <div className="topbar-mock-pill" title="This application runs in high-fidelity simulation mode. No AWS charges occur.">
          <span className="mock-pill-dot" />
          <span className="mock-pill-text">Simulated Telemetry</span>
        </div>

        {/* Environment Selector */}
        <div className="topbar-select-wrapper">
          <Layers size={14} className="topbar-select-icon" />
          <select
            className="topbar-select"
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            aria-label="Select Cloud Environment"
          >
            {ENVIRONMENTS.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div className="topbar-select-wrapper">
          <Globe size={14} className="topbar-select-icon" />
          <select
            className="topbar-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            aria-label="Select AWS Region"
          >
            {AWS_REGIONS.map((region) => (
              <option key={region.id} value={region.id}>
                {region.id} ({region.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={handleManualRefresh}
          title={`Last updated at ${formatTimestamp(lastUpdated)}. Click to refresh metrics.`}
          aria-label="Refresh metrics"
        >
          <RotateCw size={17} className={isRefreshing ? 'spin-anim' : ''} />
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="topbar-dropdown-container" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn notif-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label={`Notifications (${unreadAlerts.length} unread)`}
          >
            <Bell size={18} />
            {unreadAlerts.length > 0 && (
              <span className="notif-badge">{unreadAlerts.length}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="dropdown-menu notif-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-title-row">
                  <span className="dropdown-title">System Alerts</span>
                  <span className="notif-count-tag">{alerts.length} total</span>
                </div>
                <span className="dropdown-subtitle">Simulated CloudWatch & ALB Events</span>
              </div>

              <div className="notif-list">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`notif-item notif-${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}
                    >
                      <div className="notif-item-header">
                        <span className={`notif-severity-badge severity-${alert.severity}`}>
                          {alert.severity}
                        </span>
                        <span className="notif-time">{alert.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="notif-item-title">{alert.title}</p>
                      <p className="notif-item-msg">{alert.message}</p>
                      <div className="notif-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">
                    <CheckCircle size={20} className="text-success" />
                    <span>All systems healthy. No active alerts.</span>
                  </div>
                )}
              </div>

              <div className="dropdown-footer">
                <Link
                  to="/monitoring"
                  className="dropdown-footer-link"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <span>View All Alerts & Metrics</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="topbar-dropdown-container" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User account menu"
          >
            <div className="avatar-circle">
              <User size={15} />
            </div>
            <div className="profile-text-group">
              <span className="profile-name">Cloud Architect</span>
              <span className="profile-role">Admin (Demo)</span>
            </div>
            <ChevronDown size={14} className="profile-chevron" />
          </button>

          {profileOpen && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-header">
                <p className="profile-dropdown-user">Cloud Architect</p>
                <p className="profile-dropdown-email">engineer@cloudscale.local</p>
              </div>
              <div className="dropdown-menu-list">
                <Link
                  to="/settings"
                  className="dropdown-menu-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Security & Preferences</span>
                </Link>
                <div className="dropdown-divider" />
                <div className="dropdown-info-item">
                  <span className="info-label">Current Role</span>
                  <span className="info-val">IAM Administrator</span>
                </div>
                <div className="dropdown-info-item">
                  <span className="info-label">AWS Session</span>
                  <span className="info-val">Assumed Role (Mock)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
