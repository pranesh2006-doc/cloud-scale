import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Globe,
  Clock,
  Database,
  Save,
  RotateCcw,
  Link,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AWS_REGIONS } from '../data/mockData';

export const Settings = () => {
  const { preferences, setPreferences, resetAllDemoData, addToast } = useApp();

  const [formData, setFormData] = useState({ ...preferences });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setPreferences(formData);
    addToast('Preferences saved successfully to local browser storage.', 'success');
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    // Realistic connection probe simulation
    setTimeout(() => {
      setTestingConnection(false);
      // Since backend doesn't exist yet, demonstrate graceful fallback message
      setConnectionResult({
        success: false,
        message: `Endpoint ${formData.apiUrl || 'http://localhost:8080'} is currently unreachable. CloudScale is running in offline simulation mode.`,
      });
      addToast('Backend connection tested (simulation fallback active).', 'info');
    }, 1200);
  };

  return (
    <div className="page-container">
      {/* Simulation Banner */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <ShieldCheck size={18} className="notice-icon" />
          <span className="notice-title">Preferences & Security Configuration:</span>
          <span className="notice-text">
            All configuration values below are persisted in your browser's localStorage. No secrets or AWS keys are stored.
          </span>
        </div>
        <span className="notice-pill">Client Storage</span>
      </div>

      <form onSubmit={handleSaveSettings}>
        <div className="settings-grid">
          {/* General & UI Preferences */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3 className="section-card-title">General Dashboard Settings</h3>
                <p className="section-card-subtitle">Display preferences and regional defaults</p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="default-region-select">Default AWS Region</label>
                <select
                  id="default-region-select"
                  className="form-control"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
                </select>
                <span className="form-hint">Primary AWS datacenter for telemetry metrics</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="default-time-select">Default Metrics Time Resolution</label>
                <select
                  id="default-time-select"
                  className="form-control"
                  value={formData.timeRange}
                  onChange={(e) => handleInputChange('timeRange', e.target.value)}
                >
                  <option value="15m">15 Minutes (High granularity)</option>
                  <option value="1h">1 Hour (Standard)</option>
                  <option value="6h">6 Hours</option>
                  <option value="24h">24 Hours (Daily trend)</option>
                </select>
                <span className="form-hint">Default time slice when opening charts</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="refresh-interval-select">Auto-Refresh Interval</label>
                <select
                  id="refresh-interval-select"
                  className="form-control"
                  value={formData.refreshInterval}
                  onChange={(e) => handleInputChange('refreshInterval', Number(e.target.value))}
                >
                  <option value="5">Every 5 seconds</option>
                  <option value="15">Every 15 seconds (Recommended)</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 60 seconds</option>
                </select>
                <span className="form-hint">Polling rate for simulated metrics stream</span>
              </div>
            </div>
          </div>

          {/* Notifications & Alert Preferences */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3 className="section-card-title">Notification Channels</h3>
                <p className="section-card-subtitle">Configure dispatch routes for critical alarms</p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="checkbox-setting-item">
                <input
                  type="checkbox"
                  id="emailAlerts"
                  checked={formData.emailAlerts}
                  onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                />
                <label htmlFor="emailAlerts" className="checkbox-label">
                  <span className="checkbox-title">Email Notifications</span>
                  <span className="checkbox-sub">
                    Send urgent CloudWatch metric alarms to <code>engineer@cloudscale.local</code>
                  </span>
                </label>
              </div>

              <div className="checkbox-setting-item">
                <input
                  type="checkbox"
                  id="slackWebhook"
                  checked={formData.slackWebhook}
                  onChange={(e) => handleInputChange('slackWebhook', e.target.checked)}
                />
                <label htmlFor="slackWebhook" className="checkbox-label">
                  <span className="checkbox-title">Slack Webhook Alerts</span>
                  <span className="checkbox-sub">
                    Post automated incident messages to <code>#cloudscale-ops</code>
                  </span>
                </label>
              </div>

              <div className="checkbox-setting-item">
                <input
                  type="checkbox"
                  id="audioAlerts"
                  checked={formData.audioAlerts}
                  onChange={(e) => handleInputChange('audioAlerts', e.target.checked)}
                />
                <label htmlFor="audioAlerts" className="checkbox-label">
                  <span className="checkbox-title">Audible Alarm Chime</span>
                  <span className="checkbox-sub">
                    Play browser chime when critical severity incidents are triggered
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Future Backend Integration */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3 className="section-card-title">Backend API Integration</h3>
                <p className="section-card-subtitle">
                  Configure REST API endpoint for future Spring Boot service
                </p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="form-group">
                <label className="form-label" htmlFor="api-base-url-input">Spring Boot API Base URL</label>
                <div className="input-with-button">
                  <input
                    id="api-base-url-input"
                    type="url"
                    className="form-control"
                    value={formData.apiUrl}
                    onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                    placeholder="http://localhost:8080"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? 'Probing...' : 'Test Connection'}
                  </button>
                </div>
                <span className="form-hint">
                  Environment variable: <code>VITE_API_BASE_URL</code>
                </span>
              </div>

              {connectionResult && (
                <div
                  className={`connection-result-box ${connectionResult.success ? 'success' : 'warning'}`}
                >
                  <AlertCircle size={16} />
                  <span>{connectionResult.message}</span>
                </div>
              )}

              <div className="security-notice-box">
                <EyeOff size={16} className="text-muted" />
                <span className="text-xs text-muted">
                  <strong>Security Best Practice:</strong> AWS credentials, IAM secret keys, and database passwords must never be stored in frontend browser storage. Authentication will be delegated to Spring Security JWT cookies when connected.
                </span>
              </div>
            </div>
          </div>

          {/* Demo Data Management */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3 className="section-card-title">Demo State Management</h3>
                <p className="section-card-subtitle">
                  Reset in-memory instances, scaling history, and alerts
                </p>
              </div>
            </div>

            <div className="settings-fields">
              <p className="text-sm text-muted">
                If you have modified instance states, terminated EC2 nodes, or fired test bursts, you can reset all simulation entities back to their initial baseline.
              </p>

              <div className="reset-action-row">
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={resetAllDemoData}
                >
                  <RotateCcw size={15} />
                  <span>Reset All Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="settings-save-footer">
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={18} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
