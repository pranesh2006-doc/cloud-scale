import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Activity,
  CheckCircle,
  AlertOctagon,
  Clock,
  Gauge,
  Sliders,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { formatNumber } from '../utils/formatters';

const TARGET_ENDPOINTS = [
  {
    path: '/api/v1/orders/checkout',
    method: 'POST',
    description: 'High CPU & MySQL transactional write load',
    expectedLatency: '45-90ms',
  },
  {
    path: '/api/v1/products',
    method: 'GET',
    description: 'Read-heavy cached catalog queries',
    expectedLatency: '15-30ms',
  },
  {
    path: '/api/v1/analytics/realtime',
    method: 'GET',
    description: 'Aggregated analytics compute query',
    expectedLatency: '60-120ms',
  },
  {
    path: '/api/v1/health',
    method: 'GET',
    description: 'Lightweight ALB probe heartbeat',
    expectedLatency: '5-12ms',
  },
];

export const TrafficTesting = () => {
  const { addToast } = useApp();

  // Test configuration
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/orders/checkout');
  const [targetRequests, setTargetRequests] = useState(1000);
  const [concurrency, setConcurrency] = useState(25);
  const [durationSecs, setDurationSecs] = useState(30);

  // Test execution state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [rateLimitedCount, setRateLimitedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentRps, setCurrentRps] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [rpsHistory, setRpsHistory] = useState([
    { time: '0s', rps: 0, latency: 0 },
  ]);

  const intervalRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartTest = () => {
    if (isRunning) return;

    if (targetRequests <= 0 || concurrency <= 0 || durationSecs <= 0) {
      addToast('Please provide valid positive numbers for requests, concurrency, and duration.', 'error');
      return;
    }

    setIsRunning(true);
    setElapsedSecs(0);
    setSentCount(0);
    setSuccessCount(0);
    setRateLimitedCount(0);
    setErrorCount(0);
    setCurrentRps(0);
    setAvgLatency(0);
    setRpsHistory([{ time: '0s', rps: 0, latency: 0 }]);

    addToast(`[Simulation] Traffic load generator started against ${selectedEndpoint}`, 'info');

    const expectedRps = Math.round(targetRequests / durationSecs);
    let currentElapsed = 0;
    let accumulatedSent = 0;
    let accumulatedSuccess = 0;
    let accumulatedRateLimit = 0;
    let accumulatedError = 0;

    intervalRef.current = setInterval(() => {
      currentElapsed += 1;
      setElapsedSecs(currentElapsed);

      // Simulate slight jitter in RPS
      const jitter = (Math.random() * 0.3 - 0.15) * expectedRps;
      const stepRps = Math.max(5, Math.round(expectedRps + jitter));
      accumulatedSent += stepRps;

      // Simulate status code distribution based on endpoint and concurrency
      let step429 = 0;
      let step500 = 0;

      if (concurrency > 40 || accumulatedSent > 800) {
        step429 = Math.round(stepRps * 0.08); // 8% rate limited
      }
      if (concurrency > 75) {
        step500 = Math.round(stepRps * 0.02); // 2% 500 error under high load
      }

      const step200 = Math.max(0, stepRps - step429 - step500);

      accumulatedSuccess += step200;
      accumulatedRateLimit += step429;
      accumulatedError += step500;

      const currentLat = Math.round(35 + (concurrency * 0.8) + (Math.random() * 10 - 5));

      setSentCount(accumulatedSent);
      setSuccessCount(accumulatedSuccess);
      setRateLimitedCount(accumulatedRateLimit);
      setErrorCount(accumulatedError);
      setCurrentRps(stepRps);
      setAvgLatency(currentLat);

      setRpsHistory((prev) => [
        ...prev.slice(-15),
        {
          time: `${currentElapsed}s`,
          rps: stepRps,
          latency: currentLat,
        },
      ]);

      // Stop condition
      if (currentElapsed >= durationSecs || accumulatedSent >= targetRequests) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        addToast(`[Simulation] Traffic test finished: ${accumulatedSent} requests processed.`, 'success');
      }
    }, 1000);
  };

  const handleStopTest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    addToast('[Simulation] Traffic load test halted manually.', 'warning');
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsedSecs(0);
    setSentCount(0);
    setSuccessCount(0);
    setRateLimitedCount(0);
    setErrorCount(0);
    setCurrentRps(0);
    setAvgLatency(0);
    setRpsHistory([{ time: '0s', rps: 0, latency: 0 }]);
    addToast('Traffic test counters reset.', 'info');
  };

  const successRate = sentCount > 0 ? ((successCount / sentCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="page-container">
      {/* Simulation Banner */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <Gauge size={18} className="notice-icon" />
          <span className="notice-title">Client-Side Traffic Simulator:</span>
          <span className="notice-text">
            This module generates simulated synthetic traffic metrics inside your browser. No external HTTP requests are dispatched to real servers.
          </span>
        </div>
        <span className="notice-pill">Synthetic Demo</span>
      </div>

      {/* Configuration & Controls Card */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Load Test Generator Configuration</h3>
            <p className="section-card-subtitle">
              Configure parameters to test ALB routing behavior, Spring Boot instance saturation, and rate limits
            </p>
          </div>
          {isRunning && (
            <span className="badge-pill-running pulse">
              Simulation Active ({elapsedSecs}s / {durationSecs}s)
            </span>
          )}
        </div>

        <div className="traffic-form-grid">
          {/* Target Endpoint */}
          <div className="form-group">
            <label className="form-label" htmlFor="endpoint-select">Target API Endpoint</label>
            <select
              id="endpoint-select"
              className="form-control"
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              disabled={isRunning}
            >
              {TARGET_ENDPOINTS.map((ep) => (
                <option key={ep.path} value={ep.path}>
                  {ep.method} {ep.path} ({ep.description})
                </option>
              ))}
            </select>
            <span className="form-hint">
              Selected: {TARGET_ENDPOINTS.find((e) => e.path === selectedEndpoint)?.description}
            </span>
          </div>

          {/* Target Requests */}
          <div className="form-group">
            <label className="form-label" htmlFor="requests-input">Total Request Budget</label>
            <input
              id="requests-input"
              type="number"
              className="form-control"
              min="50"
              max="50000"
              step="50"
              value={targetRequests}
              onChange={(e) => setTargetRequests(Number(e.target.value))}
              disabled={isRunning}
            />
            <span className="form-hint">Recommended: 500 to 5,000 for realistic simulation</span>
          </div>

          {/* Concurrency */}
          <div className="form-group">
            <label className="form-label" htmlFor="concurrency-input">Simulated Concurrency (Virtual Users)</label>
            <input
              id="concurrency-input"
              type="number"
              className="form-control"
              min="1"
              max="200"
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              disabled={isRunning}
            />
            <span className="form-hint">Concurrency &gt; 40 triggers simulated rate limiting</span>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label" htmlFor="duration-select">Test Duration</label>
            <select
              id="duration-select"
              className="form-control"
              value={durationSecs}
              onChange={(e) => setDurationSecs(Number(e.target.value))}
              disabled={isRunning}
            >
              <option value="10">10 Seconds (Quick check)</option>
              <option value="30">30 Seconds (Standard run)</option>
              <option value="60">60 Seconds (Sustained load)</option>
              <option value="120">120 Seconds (Extended stress)</option>
            </select>
            <span className="form-hint">Expected throughput: ~{Math.round(targetRequests / durationSecs)} req/sec</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="traffic-actions-bar">
          <div className="actions-left">
            {!isRunning ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartTest}
              >
                <Play size={16} />
                <span>Start Load Simulation</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleStopTest}
              >
                <Square size={16} />
                <span>Halt Test</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isRunning}
            >
              <RotateCcw size={16} />
              <span>Reset Counters</span>
            </button>
          </div>

          <div className="actions-status-right">
            <span className="status-indicator-text">
              Status:{' '}
              <strong>{isRunning ? 'TRANSMITTING SIMULATED LOAD' : sentCount > 0 ? 'COMPLETED' : 'READY'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Live Metrics Row */}
      <section className="stats-grid">
        <StatCard
          title="Generated Requests"
          value={formatNumber(sentCount)}
          unit={`/ ${formatNumber(targetRequests)}`}
          icon={Activity}
          trend={isRunning ? `${currentRps} RPS active` : 'Idle'}
          trendDirection={isRunning ? 'up' : 'neutral'}
          trendIsGood={true}
          description={`Elapsed time: ${elapsedSecs}s of ${durationSecs}s`}
          variant="default"
        />

        <StatCard
          title="HTTP 200 OK (Success)"
          value={formatNumber(successCount)}
          unit={`(${successRate}%)`}
          icon={CheckCircle}
          trend={successCount > 0 ? 'Routed to instances' : '-'}
          trendDirection="up"
          trendIsGood={true}
          description="Processed by Spring Boot endpoints"
          variant="success"
        />

        <StatCard
          title="HTTP 429 Too Many Requests"
          value={formatNumber(rateLimitedCount)}
          unit="Throttled"
          icon={ShieldAlert}
          trend={rateLimitedCount > 0 ? 'Rate limit engaged' : 'Within limit'}
          trendDirection={rateLimitedCount > 0 ? 'up' : 'neutral'}
          trendIsGood={rateLimitedCount === 0}
          description="Protected by API Gateway / Token Bucket"
          variant={rateLimitedCount > 0 ? 'warning' : 'default'}
        />

        <StatCard
          title="Avg Latency (ALB + App)"
          value={avgLatency || 0}
          unit="ms"
          icon={Clock}
          trend={avgLatency > 80 ? 'Elevated under load' : 'Normal latency'}
          trendDirection={avgLatency > 80 ? 'up' : 'down'}
          trendIsGood={avgLatency <= 60}
          description="Round trip synthetic latency"
          variant={avgLatency > 80 ? 'warning' : 'default'}
        />
      </section>

      {/* Live Chart & Status Code Breakdown */}
      <div className="charts-grid-two">
        <ChartCard
          title="Live Requests per Second (RPS)"
          subtitle="Real-time synthetic throughput curve as virtual users execute queries"
          badge="Live Simulation"
          height={270}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rpsHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit=" rps" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="rps"
                name="Requests / Sec"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rpsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* HTTP Status Breakdown Card */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">HTTP Status Code Distribution</h3>
              <p className="section-card-subtitle">
                Synthetic response breakdown during this test execution
              </p>
            </div>
          </div>

          <div className="status-bars-container">
            {/* 200 OK */}
            <div className="status-bar-item">
              <div className="status-bar-label-row">
                <span className="status-code-pill pill-200">200 OK</span>
                <span className="status-count font-mono">{formatNumber(successCount)} reqs</span>
                <span className="status-pct">{sentCount ? ((successCount / sentCount) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-success"
                  style={{ width: `${sentCount ? (successCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 429 Too Many Requests */}
            <div className="status-bar-item">
              <div className="status-bar-label-row">
                <span className="status-code-pill pill-429">429 Rate Limited</span>
                <span className="status-count font-mono">{formatNumber(rateLimitedCount)} reqs</span>
                <span className="status-pct">{sentCount ? ((rateLimitedCount / sentCount) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-warning"
                  style={{ width: `${sentCount ? (rateLimitedCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 500 Internal Server Error */}
            <div className="status-bar-item">
              <div className="status-bar-label-row">
                <span className="status-code-pill pill-500">500 Server Error</span>
                <span className="status-count font-mono">{formatNumber(errorCount)} reqs</span>
                <span className="status-pct">{sentCount ? ((errorCount / sentCount) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-danger"
                  style={{ width: `${sentCount ? (errorCount / sentCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="simulation-educational-note">
            <Info size={15} className="note-icon" />
            <span className="note-text">
              Under high concurrency (&gt;40 virtual users), simulated tokens in the Rate Limiter bucket exhaust, generating HTTP 429 responses with standard <code>Retry-After</code> headers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficTesting;
