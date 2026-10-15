/**
 * CloudScale Infrastructure Mock Data
 * Realistic simulated data for AWS EC2, ALB, Spring Boot, RDS MySQL, and GitHub Actions CI/CD.
 * NOTE: All data in this file is simulated for demo and UI development purposes.
 */

export const AWS_REGIONS = [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-west-1', name: 'EU (Ireland)' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
];

export const ENVIRONMENTS = [
  { id: 'dev', name: 'Development' },
  { id: 'staging', name: 'Staging' },
  { id: 'prod', name: 'Production (Demo)' },
];

export const INITIAL_INSTANCES = [
  {
    id: 'i-0a81b2c3d4e5f6789',
    name: 'cloudscale-api-prod-01',
    status: 'healthy',
    cpuUsage: 48,
    memoryUsage: 62,
    instanceType: 't3.medium',
    availabilityZone: 'us-east-1a',
    privateIp: '10.0.1.142',
    publicIp: '54.210.88.19',
    launchTime: '2026-10-10 08:30:00 UTC',
    uptime: '4d 18h 22m',
    targetGroup: 'tg-cloudscale-api',
    albRegistered: true,
    os: 'Amazon Linux 2023',
    version: 'v2.4.1',
  },
  {
    id: 'i-0b92c3d4e5f67890a',
    name: 'cloudscale-api-prod-02',
    status: 'healthy',
    cpuUsage: 54,
    memoryUsage: 68,
    instanceType: 't3.medium',
    availabilityZone: 'us-east-1b',
    privateIp: '10.0.2.78',
    publicIp: '54.210.92.44',
    launchTime: '2026-10-10 08:35:00 UTC',
    uptime: '4d 18h 17m',
    targetGroup: 'tg-cloudscale-api',
    albRegistered: true,
    os: 'Amazon Linux 2023',
    version: 'v2.4.1',
  },
  {
    id: 'i-0c03d4e5f678901ab',
    name: 'cloudscale-api-prod-03',
    status: 'warning',
    cpuUsage: 82,
    memoryUsage: 79,
    instanceType: 't3.medium',
    availabilityZone: 'us-east-1a',
    privateIp: '10.0.1.205',
    publicIp: '54.210.104.81',
    launchTime: '2026-10-12 14:15:00 UTC',
    uptime: '2d 12h 37m',
    targetGroup: 'tg-cloudscale-api',
    albRegistered: true,
    os: 'Amazon Linux 2023',
    version: 'v2.4.1',
  },
  {
    id: 'i-0d14e5f6789012bc',
    name: 'cloudscale-api-prod-04',
    status: 'unhealthy',
    cpuUsage: 94,
    memoryUsage: 91,
    instanceType: 't3.medium',
    availabilityZone: 'us-east-1c',
    privateIp: '10.0.3.56',
    publicIp: '54.210.119.12',
    launchTime: '2026-10-14 02:40:00 UTC',
    uptime: '1d 00h 12m',
    targetGroup: 'tg-cloudscale-api',
    albRegistered: false,
    os: 'Amazon Linux 2023',
    version: 'v2.4.1',
  },
  {
    id: 'i-0e25f67890123cd',
    name: 'cloudscale-worker-prod-01',
    status: 'healthy',
    cpuUsage: 28,
    memoryUsage: 45,
    instanceType: 'c6i.large',
    availabilityZone: 'us-east-1b',
    privateIp: '10.0.2.199',
    publicIp: '54.210.133.77',
    launchTime: '2026-10-08 11:00:00 UTC',
    uptime: '6d 15h 52m',
    targetGroup: 'tg-cloudscale-workers',
    albRegistered: true,
    os: 'Amazon Linux 2023',
    version: 'v2.4.1',
  },
];

export const INFRASTRUCTURE_COMPONENTS = [
  {
    id: 'alb',
    name: 'AWS Application Load Balancer',
    resourceName: 'alb-cloudscale-prod-main',
    type: 'Application Load Balancer',
    status: 'healthy',
    badge: 'ACTIVE',
    details: '2 Target Groups, 0 Unhealthy Target Hosts, HTTPS Enabled',
    metrics: {
      activeConnections: 1840,
      processedBytes: '4.8 GB/hr',
      latency: '24ms',
    },
    dnsName: 'alb-cloudscale-prod-83921.us-east-1.elb.amazonaws.com',
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot Application Cluster',
    resourceName: 'cloudscale-core-service:v2.4.1',
    type: 'Spring Boot 3.2.3 / Java 17',
    status: 'healthy',
    badge: '4 OF 4 UP',
    details: 'Embedded Tomcat, Micrometer / Prometheus metrics enabled',
    metrics: {
      jvmHeap: '64% (2.56GB / 4GB)',
      threads: '142 active',
      gcPause: '12ms avg',
    },
    dnsName: 'internal-spring-cluster.cloudscale.local',
  },
  {
    id: 'rds',
    name: 'Amazon RDS for MySQL',
    resourceName: 'cloudscale-mysql-primary',
    type: 'Amazon RDS (Multi-AZ db.r6g.xlarge)',
    status: 'healthy',
    badge: 'AVAILABLE',
    details: 'Engine 8.0.35, Multi-AZ with Standby in us-east-1b, Automated Backups ON',
    metrics: {
      cpu: '38.4%',
      connections: '412 / 2000',
      replicaLag: '0.02s',
      freeStorage: '184 GB',
    },
    dnsName: 'cloudscale-mysql-primary.c78129.us-east-1.rds.amazonaws.com:3306',
  },
  {
    id: 'asg',
    name: 'Auto Scaling Group',
    resourceName: 'asg-cloudscale-compute',
    type: 'EC2 Auto Scaling Group',
    status: 'healthy',
    badge: 'IN_SERVICE',
    details: 'Target Tracking: Average CPU > 70% | Min: 2, Desired: 4, Max: 10',
    metrics: {
      min: 2,
      desired: 4,
      max: 10,
      cooldown: '300s',
    },
    dnsName: 'arn:aws:autoscaling:us-east-1:123456789012:autoScalingGroup:...',
  },
  {
    id: 'cicd',
    name: 'GitHub Actions CI/CD',
    resourceName: '.github/workflows/deploy.yml',
    type: 'CI/CD Pipeline',
    status: 'healthy',
    badge: 'PASSING',
    details: 'Run #148: Main branch automatic rolling deploy completed',
    metrics: {
      lastRunTime: '42 mins ago',
      buildDuration: '3m 48s',
      commit: 'a9b4f12',
    },
    dnsName: 'https://github.com/cloudscale-corp/cloudscale-backend/actions',
  },
];

// Helper to generate realistic time series
export const generateTimeSeriesData = (points = 12, range = '1h') => {
  const result = [];
  const now = new Date();
  const stepMinutes = range === '15m' ? 1.25 : range === '1h' ? 5 : range === '6h' ? 30 : 120;

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * stepMinutes * 60 * 1000);
    const timeStr = timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Realistic patterns with subtle waves
    const baseCpu = 50 + Math.sin(i * 0.6) * 18 + (Math.random() * 8 - 4);
    const cpu = Math.max(15, Math.min(95, Math.round(baseCpu)));
    const memory = Math.max(40, Math.min(88, Math.round(62 + Math.cos(i * 0.4) * 8)));
    const requests = Math.max(800, Math.round(2800 + Math.sin(i * 0.5) * 1200 + (Math.random() * 300 - 150)));
    const latency = Math.max(12, Math.round(26 + (cpu > 70 ? (cpu - 70) * 1.5 : 0) + (Math.random() * 6 - 3)));
    const errorRate = parseFloat((cpu > 80 ? 0.8 + (cpu - 80) * 0.15 : 0.05 + Math.random() * 0.08).toFixed(2));
    const dbConnections = Math.round(300 + requests * 0.05 + Math.random() * 20);

    result.push({
      time: timeStr,
      cpu,
      memory,
      requests,
      latency,
      errorRate,
      dbConnections,
      targetCpu: 70, // ASG threshold line
    });
  }
  return result;
};

export const INITIAL_SCALING_POLICY = {
  asgName: 'asg-cloudscale-compute',
  launchTemplate: 'lt-cloudscale-v2.4:1',
  minCapacity: 2,
  desiredCapacity: 4,
  maxCapacity: 10,
  targetCpuUtilization: 70,
  scaleOutCooldown: 300,
  scaleInCooldown: 300,
  healthCheckGracePeriod: 300,
  healthCheckType: 'ELB',
  scalingPolicyType: 'TargetTrackingScaling',
};

export const INITIAL_SCALING_EVENTS = [
  {
    id: 'scale-evt-101',
    timestamp: '2026-10-15 08:42:10 UTC',
    type: 'SCALE_OUT',
    previousCapacity: 3,
    newCapacity: 4,
    reason: 'CPU utilization reached 76.4% (> 70.0% target) for 3 consecutive minutes.',
    instanceId: 'i-0d14e5f6789012bc',
    status: 'COMPLETED',
  },
  {
    id: 'scale-evt-100',
    timestamp: '2026-10-15 06:15:30 UTC',
    type: 'SCALE_IN',
    previousCapacity: 4,
    newCapacity: 3,
    reason: 'Traffic subsided: Average CPU fell to 34.2% (< 45.0% scale-in threshold).',
    instanceId: 'i-0987a6b5c4d3e210f',
    status: 'COMPLETED',
  },
  {
    id: 'scale-evt-099',
    timestamp: '2026-10-14 21:05:00 UTC',
    type: 'SCALE_OUT',
    previousCapacity: 2,
    newCapacity: 4,
    reason: 'Spike load during batch export: Average CPU surged to 88.5%.',
    instanceId: 'i-0b92c3d4e5f67890a',
    status: 'COMPLETED',
  },
  {
    id: 'scale-evt-098',
    timestamp: '2026-10-14 18:30:15 UTC',
    type: 'HEALTH_CHECK_REPLACE',
    previousCapacity: 4,
    newCapacity: 4,
    reason: 'ALB Target Health check failed for i-0716a5b4c3d2e109a (HTTP 502). Terminated and replaced.',
    instanceId: 'i-0c03d4e5f678901ab',
    status: 'COMPLETED',
  },
];

export const INITIAL_ALERTS = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'High CPU Utilization on i-0d14e5f6789012bc',
    message: 'Instance CPU exceeded 90% threshold for 5m. Current: 94%.',
    source: 'CloudWatch / EC2',
    resource: 'i-0d14e5f6789012bc',
    timestamp: '2026-10-15 09:12:00 UTC',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    severity: 'warning',
    title: 'ALB 5xx Error Rate Elevated',
    message: 'Target group tg-cloudscale-api 5xx rate reached 1.8% (> 1.0% warning threshold).',
    source: 'CloudWatch / ALB',
    resource: 'alb-cloudscale-prod-main',
    timestamp: '2026-10-15 08:58:30 UTC',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    severity: 'warning',
    title: 'MySQL Connection Pool at 78% Capacity',
    message: 'Active database connections 412 of 500 pool maximum.',
    source: 'Spring Boot / HikariCP',
    resource: 'cloudscale-mysql-primary',
    timestamp: '2026-10-15 08:35:10 UTC',
    acknowledged: false,
  },
  {
    id: 'alert-004',
    severity: 'info',
    title: 'Auto Scaling Out Event Triggered',
    message: 'ASG asg-cloudscale-compute added 1 instance in response to target tracking.',
    source: 'EC2 Auto Scaling',
    resource: 'asg-cloudscale-compute',
    timestamp: '2026-10-15 08:42:10 UTC',
    acknowledged: true,
  },
  {
    id: 'alert-005',
    severity: 'info',
    title: 'GitHub Actions Deploy Completed',
    message: 'Workflow run #148 (commit a9b4f12) deployed successfully to Production.',
    source: 'GitHub Actions',
    resource: 'cloudscale-core-service:v2.4.1',
    timestamp: '2026-10-15 07:15:00 UTC',
    acknowledged: true,
  },
];

export const INITIAL_DEPLOYMENTS = [
  {
    id: 'dep-148',
    version: 'v2.4.1',
    commit: 'a9b4f12',
    commitMessage: 'fix(alb): increase idle connection timeout and healthcheck buffer',
    author: 'devaprasanna',
    branch: 'main',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '3m 48s',
    timestamp: '2026-10-15 07:15:00 UTC',
    trigger: 'git push',
  },
  {
    id: 'dep-147',
    version: 'v2.4.0',
    commit: 'c4e819b',
    commitMessage: 'feat(orders): add async Kafka event publishing for checkout receipts',
    author: 'sarah-dev',
    branch: 'main',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '4m 12s',
    timestamp: '2026-10-14 19:40:00 UTC',
    trigger: 'git push',
  },
  {
    id: 'dep-146',
    version: 'v2.4.0-rc2',
    commit: '7b2a091',
    commitMessage: 'test(integration): add testcontainers for MySQL 8 and Redis',
    author: 'alex-qa',
    branch: 'staging',
    environment: 'Staging',
    status: 'FAILED',
    duration: '2m 10s',
    timestamp: '2026-10-14 16:22:00 UTC',
    trigger: 'pull_request',
  },
  {
    id: 'dep-145',
    version: 'v2.3.9',
    commit: '3f6c882',
    commitMessage: 'perf(db): optimize composite index on orders(user_id, created_at)',
    author: 'devaprasanna',
    branch: 'main',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '3m 35s',
    timestamp: '2026-10-13 11:05:00 UTC',
    trigger: 'git push',
  },
  {
    id: 'dep-144',
    version: 'v2.3.8',
    commit: '1a9e774',
    commitMessage: 'chore(deps): bump spring-boot-starter-web from 3.2.2 to 3.2.3',
    author: 'dependabot[bot]',
    branch: 'main',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '3m 22s',
    timestamp: '2026-10-12 09:18:00 UTC',
    trigger: 'pull_request',
  },
];

export const INITIAL_RATE_LIMIT_CONFIG = {
  globalLimitRpm: 120,
  windowSeconds: 60,
  algorithm: 'Token Bucket',
  burstCapacity: 40,
  endpoints: [
    {
      id: 'ep-1',
      path: '/api/v1/orders/checkout',
      method: 'POST',
      limitRpm: 60,
      currentUsage: 42,
      tier: 'Sensitive / DB Write',
    },
    {
      id: 'ep-2',
      path: '/api/v1/products',
      method: 'GET',
      limitRpm: 300,
      currentUsage: 198,
      tier: 'Public / Read Cached',
    },
    {
      id: 'ep-3',
      path: '/api/v1/analytics/realtime',
      method: 'GET',
      limitRpm: 90,
      currentUsage: 84,
      tier: 'Heavy Compute',
    },
    {
      id: 'ep-4',
      path: '/api/v1/health',
      method: 'GET',
      limitRpm: 600,
      currentUsage: 120,
      tier: 'Internal Probes',
    },
  ],
};
