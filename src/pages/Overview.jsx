import React from 'react';
import {
  Server,
  Cpu,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers,
  Database,
  GitCommit,
  Network,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { formatNumber, formatPercent } from '../utils/formatters';

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label, unit = '%' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-item">
            <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-val">
              {entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Overview = () => {
  const {
    instances,
    infraStatus,
    timeRange,
    setTimeRange,
    timeSeriesData,
    scalingPolicy,
    selectedRegion,
    selectedEnvironment,
  } = useApp();

  // Compute live aggregates from instances state
  const totalInstances = instances.length;
  const healthyInstances = instances.filter((i) => i.status === 'healthy').length;
  const avgCpu = Math.round(
    instances.reduce((acc, curr) => acc + curr.cpuUsage, 0) / (totalInstances || 1)
  );

  // Latest traffic from time series
  const latestDataPoint = timeSeriesData[timeSeriesData.length - 1] || { requests: 3120, latency: 24 };

  const timeRangeOptions = [
    { value: '15m', label: '15m' },
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
  ];

  return (
    <div className="page-container">
      {/* Simulation Notice Banner */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <ShieldCheck size={18} className="notice-icon" />
          <span className="notice-title">Cloud Infrastructure Simulation Active:</span>
          <span className="notice-text">
            Displaying live simulated telemetry for AWS EC2 Auto Scaling, ALB, Spring Boot & RDS MySQL ({selectedEnvironment.toUpperCase()} / {selectedRegion}).
          </span>
        </div>
        <span className="notice-pill">Mock Mode</span>
      </div>

      {/* KPI Cards Row */}
      <section className="stats-grid">
        <StatCard
          title="Running EC2 Instances"
          value={`${healthyInstances}/${totalInstances}`}
          unit="Active"
          icon={Server}
          trend="+1 in last hr"
          trendDirection="up"
          trendIsGood={true}
          description={`ASG Target: ${scalingPolicy.desiredCapacity} Desired (Max ${scalingPolicy.maxCapacity})`}
          variant="default"
        />

        <StatCard
          title="Average CPU Utilization"
          value={avgCpu}
          unit="%"
          icon={Cpu}
          trend={avgCpu > 70 ? 'Above target (+12%)' : 'Optimal (-4%)'}
          trendDirection={avgCpu > 70 ? 'up' : 'down'}
          trendIsGood={avgCpu <= 70}
          description={`Auto Scale threshold: ${scalingPolicy.targetCpuUtilization}%`}
          variant={avgCpu > 75 ? 'warning' : 'default'}
        />

        <StatCard
          title="Requests per Minute"
          value={formatNumber(latestDataPoint.requests)}
          unit="RPM"
          icon={Activity}
          trend="+8.4% vs prev hour"
          trendDirection="up"
          trendIsGood={true}
          description={`Avg latency: ${latestDataPoint.latency}ms through ALB`}
          variant="default"
        />

        <StatCard
          title="Application Availability"
          value="99.98"
          unit="%"
          icon={CheckCircle2}
          trend="SLA: 99.90%"
          trendDirection="up"
          trendIsGood={true}
          description="0 target connection drops reported"
          variant="success"
        />
      </section>

      {/* Time Range Filter Bar */}
      <div className="time-filter-bar">
        <div className="time-filter-info">
          <Clock size={16} />
          <span className="time-filter-label">Metrics Resolution Range:</span>
        </div>
        <div className="time-filter-buttons">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`time-filter-btn ${timeRange === opt.value ? 'active' : ''}`}
              onClick={() => setTimeRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-two">
        {/* CPU Utilization Area Chart */}
        <ChartCard
          title="Cluster CPU Utilization"
          subtitle="Aggregated EC2 Auto Scaling fleet metrics vs 70% threshold"
          infoText="When CPU exceeds 70% for 3 consecutive intervals, the Target Tracking policy provisions additional EC2 instances."
          badge="Simulated CloudWatch"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
              <Tooltip content={<CustomChartTooltip unit="%" />} />
              <ReferenceLine
                y={scalingPolicy.targetCpuUtilization}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Scale Threshold (${scalingPolicy.targetCpuUtilization}%)`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU Utilization"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cpuGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Traffic Throughput Line Chart */}
        <ChartCard
          title="ALB Request Throughput"
          subtitle="Requests per minute routed to Spring Boot target group"
          infoText="Simulated request volume entering the AWS Application Load Balancer."
          badge="Simulated ALB"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomChartTooltip unit=" RPM" />} />
              <Line
                type="monotone"
                dataKey="requests"
                name="Requests / min"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Infrastructure Health Status Panel */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Infrastructure Components Health</h3>
            <p className="section-card-subtitle">
              Live status across AWS Load Balancers, Spring Boot instances, MySQL RDS, and CI/CD pipelines
            </p>
          </div>
          <span className="badge-pill-outline">5 of 5 Healthy</span>
        </div>

        <div className="infra-grid">
          {infraStatus.map((comp) => {
            const getIcon = () => {
              switch (comp.id) {
                case 'alb':
                  return <Network size={20} className="text-primary" />;
                case 'spring-boot':
                  return <Layers size={20} className="text-primary" />;
                case 'rds':
                  return <Database size={20} className="text-primary" />;
                case 'asg':
                  return <Cpu size={20} className="text-primary" />;
                case 'cicd':
                  return <GitCommit size={20} className="text-primary" />;
                default:
                  return <Server size={20} className="text-primary" />;
              }
            };

            return (
              <div key={comp.id} className="infra-item-card">
                <div className="infra-item-header">
                  <div className="infra-icon-box">{getIcon()}</div>
                  <div className="infra-name-box">
                    <h4 className="infra-name">{comp.name}</h4>
                    <span className="infra-res-code">{comp.resourceName}</span>
                  </div>
                  <StatusBadge status={comp.status} text={comp.badge} />
                </div>

                <p className="infra-details">{comp.details}</p>

                <div className="infra-metrics-row">
                  {Object.entries(comp.metrics).map(([key, val]) => (
                    <div key={key} className="infra-metric-pill">
                      <span className="metric-label">{key}:</span>
                      <span className="metric-value">{String(val)}</span>
                    </div>
                  ))}
                </div>

                <div className="infra-footer-dns">
                  <span className="dns-label">Endpoint / DNS:</span>
                  <code className="dns-code">{comp.dnsName}</code>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Overview;
