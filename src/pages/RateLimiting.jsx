import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle,
  HelpCircle,
  Info,
  Server,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { formatNumber } from '../utils/formatters';

export const RateLimiting = () => {
  const { rateLimitConfig, setRateLimitConfig, addToast } = useApp();

  // Burst simulation state
  const [isSimulatingBurst, setIsSimulatingBurst] = useState(false);
  const [burstSize, setBurstSize] = useState(150);
  const [totalRequests, setTotalRequests] = useState(1280);
  const [allowedRequests, setAllowedRequests] = useState(1194);
  const [rejectedRequests, setRejectedRequests] = useState(86);
  const [http429Count, setHttp429Count] = useState(86);

  // Editable limit
  const [customLimit, setCustomLimit] = useState(rateLimitConfig.globalLimitRpm);

  const handleUpdateLimit = (e) => {
    e.preventDefault();
    setRateLimitConfig((prev) => ({
      ...prev,
      globalLimitRpm: customLimit,
    }));
    addToast(`[Demo] Global rate limit set to ${customLimit} requests/min.`, 'success');
  };

  const handleSimulateBurst = () => {
    if (isSimulatingBurst) return;

    setIsSimulatingBurst(true);
    addToast(`[Simulation] Sending a burst of ${burstSize} requests against rate limiter...`, 'info');

    // Simulate token bucket exhaustion
    setTimeout(() => {
      const allowed = Math.min(burstSize, Math.round(customLimit * 0.4));
      const rejected = burstSize - allowed;

      setTotalRequests((prev) => prev + burstSize);
      setAllowedRequests((prev) => prev + allowed);
      setRejectedRequests((prev) => prev + rejected);
      setHttp429Count((prev) => prev + rejected);

      // Update endpoint usages
      setRateLimitConfig((prev) => ({
        ...prev,
        endpoints: prev.endpoints.map((ep) => ({
          ...ep,
          currentUsage: Math.min(ep.limitRpm, Math.round(ep.currentUsage + (burstSize / 4))),
        })),
      }));

      setIsSimulatingBurst(false);
      addToast(
        `[Simulation] Burst resolved: ${allowed} allowed (HTTP 200), ${rejected} throttled (HTTP 429).`,
        rejected > 0 ? 'warning' : 'success'
      );
    }, 1200);
  };

  const handleResetCounters = () => {
    setTotalRequests(1280);
    setAllowedRequests(1194);
    setRejectedRequests(86);
    setHttp429Count(86);
    addToast('Rate limiting counters reset to defaults.', 'info');
  };

  // Chart data from endpoints
  const endpointChartData = rateLimitConfig.endpoints.map((ep) => ({
    name: ep.path.replace('/api/v1', ''),
    used: ep.currentUsage,
    limit: ep.limitRpm,
  }));

  return (
    <div className="page-container">
      {/* Simulation Info */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <ShieldAlert size={18} className="notice-icon" />
          <span className="notice-title">API Gateway Rate Limiter Simulation:</span>
          <span className="notice-text">
            Simulates a Token Bucket rate-limiting algorithm. Dispatching simulated bursts demonstrates token exhaustion and HTTP 429 response handling.
          </span>
        </div>
        <span className="notice-pill">Protection Engine</span>
      </div>

      {/* KPI Stats */}
      <section className="stats-grid">
        <StatCard
          title="Total API Invocations"
          value={formatNumber(totalRequests)}
          unit="Calls"
          icon={Activity}
          description="Monitored in current 60s sliding window"
          variant="default"
        />

        <StatCard
          title="Allowed Requests (2xx)"
          value={formatNumber(allowedRequests)}
          unit={`(${((allowedRequests / (totalRequests || 1)) * 100).toFixed(1)}%)`}
          icon={ShieldCheck}
          trend="Passed through to Spring Boot"
          trendDirection="up"
          trendIsGood={true}
          description="Within token capacity"
          variant="success"
        />

        <StatCard
          title="HTTP 429 Responses"
          value={formatNumber(http429Count)}
          unit="Throttled"
          icon={AlertTriangle}
          trend={http429Count > 0 ? 'Rate limit engaged' : 'Zero dropped'}
          trendDirection={http429Count > 0 ? 'up' : 'down'}
          trendIsGood={http429Count === 0}
          description="Too Many Requests returned"
          variant={http429Count > 0 ? 'warning' : 'default'}
        />

        <StatCard
          title="Configured Global Limit"
          value={rateLimitConfig.globalLimitRpm}
          unit="RPM / IP"
          icon={Zap}
          description={`Algorithm: ${rateLimitConfig.algorithm}`}
          variant="default"
        />
      </section>

      {/* Burst Simulator & Limit Configuration */}
      <div className="charts-grid-two">
        {/* Interactive Burst Simulator Card */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Simulate Traffic Spike & Throttling</h3>
              <p className="section-card-subtitle">
                Fire an instantaneous burst of concurrent API calls to test rate limiter capacity
              </p>
            </div>
          </div>

          <div className="burst-simulator-box">
            <div className="burst-control-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="burst-size-input">Burst Size (Requests in 1 second)</label>
                <input
                  id="burst-size-input"
                  type="number"
                  className="form-control"
                  min="20"
                  max="1000"
                  step="10"
                  value={burstSize}
                  onChange={(e) => setBurstSize(Number(e.target.value))}
                  disabled={isSimulatingBurst}
                />
                <span className="form-hint">
                  {burstSize > customLimit ? 'Will exceed bucket and generate HTTP 429' : 'Within normal bucket allowance'}
                </span>
              </div>

              <div className="burst-btn-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSimulateBurst}
                  disabled={isSimulatingBurst}
                >
                  <Zap size={16} />
                  <span>{isSimulatingBurst ? 'Simulating Burst...' : 'Fire Burst (Demo)'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetCounters}
                  disabled={isSimulatingBurst}
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="bucket-visualizer">
              <div className="bucket-label-row">
                <span className="bucket-name">Token Bucket Capacity Visualization</span>
                <span className="bucket-fill-pct font-mono">
                  {Math.round((allowedRequests % 100))}% tokens remaining
                </span>
              </div>
              <div className="bucket-track">
                <div
                  className="bucket-fill"
                  style={{ width: `${Math.max(10, 100 - (http429Count % 80))}%` }}
                />
              </div>
              <p className="bucket-caption text-xs text-muted">
                Refill rate: {Math.round(customLimit / 60)} tokens/sec. When tokens drop to 0, incoming requests receive immediate HTTP 429.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Rate Limit Policy */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Rate Limiting Policy Settings</h3>
              <p className="section-card-subtitle">
                Configure IP-level and client tier threshold settings
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateLimit} className="policy-settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="custom-rpm-input">Global Requests Per Minute (RPM)</label>
              <input
                id="custom-rpm-input"
                type="number"
                className="form-control"
                min="10"
                max="5000"
                step="10"
                value={customLimit}
                onChange={(e) => setCustomLimit(Number(e.target.value))}
              />
              <span className="form-hint">Enforced per origin IPv4 / IPv6 address</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="algorithm-select">Limiter Algorithm</label>
              <select id="algorithm-select" className="form-control" defaultValue="Token Bucket" disabled>
                <option value="Token Bucket">Token Bucket (Redis backed with Lua scripts)</option>
                <option value="Leaky Bucket">Leaky Bucket</option>
                <option value="Sliding Window">Sliding Window Counter</option>
              </select>
            </div>

            <button type="submit" className="btn btn-secondary">
              Update Limit (Demo)
            </button>
          </form>
        </div>
      </div>

      {/* Endpoint Table & Educational Deep Dive */}
      <div className="charts-grid-two">
        {/* Endpoint-level Usage Table */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Endpoint Consumption & Limits</h3>
              <p className="section-card-subtitle">
                Individual endpoint quota consumption in current interval
              </p>
            </div>
          </div>

          <div className="endpoint-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method & Path</th>
                  <th>Tier</th>
                  <th>Usage / Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rateLimitConfig.endpoints.map((ep) => {
                  const pct = Math.round((ep.currentUsage / ep.limitRpm) * 100);
                  const isNear = pct > 80;
                  return (
                    <tr key={ep.id}>
                      <td>
                        <div className="endpoint-method-row">
                          <span className={`method-pill method-${ep.method.toLowerCase()}`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-sm font-semibold">{ep.path}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag">{ep.tier}</span>
                      </td>
                      <td>
                        <div className="endpoint-quota-cell">
                          <span className="font-mono text-xs">
                            {ep.currentUsage} / {ep.limitRpm} RPM ({pct}%)
                          </span>
                          <div className="cpu-progress-bg">
                            <div
                              className={`cpu-progress-fill ${isNear ? 'cpu-bar-danger' : 'cpu-bar-healthy'}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          status={isNear ? 'warning' : 'healthy'}
                          text={isNear ? 'HIGH' : 'NORMAL'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Architecture Explanation */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">HTTP 429 Too Many Requests Deep Dive</h3>
              <p className="section-card-subtitle">
                Industry standards for API protection and downstream resilience
              </p>
            </div>
          </div>

          <div className="rate-limit-explanation">
            <div className="explain-box">
              <h5 className="explain-title">What happens when a limit is exceeded?</h5>
              <p className="explain-body">
                The reverse proxy (ALB or Spring Cloud Gateway) immediately drops the request before it reaches Spring Boot application threads, protecting MySQL connection pools from starvation.
              </p>
            </div>

            <div className="explain-box">
              <h5 className="explain-title">Standard RFC 6585 Headers Returned:</h5>
              <div className="rfc-headers-list font-mono text-xs">
                <div className="header-item">
                  <span className="hdr-key">HTTP/1.1 429</span>
                  <span className="hdr-val">Too Many Requests</span>
                </div>
                <div className="header-item">
                  <span className="hdr-key">Retry-After:</span>
                  <span className="hdr-val">30</span>
                </div>
                <div className="header-item">
                  <span className="hdr-key">X-RateLimit-Limit:</span>
                  <span className="hdr-val">{customLimit}</span>
                </div>
                <div className="header-item">
                  <span className="hdr-key">X-RateLimit-Remaining:</span>
                  <span className="hdr-val">0</span>
                </div>
                <div className="header-item">
                  <span className="hdr-key">X-RateLimit-Reset:</span>
                  <span className="hdr-val">1729004400</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimiting;
