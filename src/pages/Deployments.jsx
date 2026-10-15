import React, { useState, useEffect, useRef } from 'react';
import {
  GitBranch,
  GitCommit,
  Rocket,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Play,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

const PIPELINE_STAGES = [
  { id: 1, name: 'Checkout', label: '1. Git Checkout & Submodules', duration: '12s' },
  { id: 2, name: 'Build', label: '2. Maven Java 17 Compilation', duration: '45s' },
  { id: 3, name: 'Test', label: '3. JUnit 5 & Testcontainers Suite', duration: '58s' },
  { id: 4, name: 'Package', label: '4. Docker Image Build & ECR Push', duration: '35s' },
  { id: 5, name: 'Deploy', label: '5. ALB Rolling Blue-Green Deployment', duration: '40s' },
];

export const Deployments = () => {
  const { deployments, setDeployments, addToast } = useApp();

  // Deployment simulation state
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [activeLogs, setActiveLogs] = useState([]);
  const timerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startDemoDeployment = () => {
    if (isDeploying) return;

    setIsDeploying(true);
    setCurrentStageIndex(0);
    setActiveLogs([
      `[00:01] Initializing GitHub Actions runner: ubuntu-22.04 (cloudscale-runner-04)`,
      `[00:02] Fetching repository octocat/cloudscale-backend @ ref: refs/heads/main`,
    ]);

    addToast('[Demo CI/CD] GitHub Actions pipeline run started.', 'info');

    // Progression through stages
    let stage = 0;
    const stageLogs = [
      `[00:05] Git Checkout complete. Commit: 9c2b48e (HEAD -> main)`,
      `[00:15] Maven executing: mvn clean compile -DskipTests=false (Spring Boot 3.2.3)`,
      `[00:25] Tests passing: 184 testcases executed, 0 failures, 0 skipped.`,
      `[00:35] Docker build complete: 123456789012.dkr.ecr.us-east-1.amazonaws.com/cloudscale:v2.4.2 pushed.`,
      `[00:48] AWS ALB rolling deployment: Target group tg-cloudscale-api healthy. Traffic drained & updated.`,
    ];

    const advanceStage = () => {
      if (stage < PIPELINE_STAGES.length - 1) {
        stage += 1;
        setCurrentStageIndex(stage);
        setActiveLogs((prev) => [...prev, stageLogs[stage]]);
        timerRef.current = setTimeout(advanceStage, 1800);
      } else {
        // Completion
        setIsDeploying(false);
        const newDeployment = {
          id: `dep-${Date.now().toString().substring(7)}`,
          version: 'v2.4.2',
          commit: '9c2b48e',
          commitMessage: 'feat(scaling): integrate dynamic predictive auto-scaling metric',
          author: 'devaprasanna',
          branch: 'main',
          environment: 'Production',
          status: 'SUCCESS',
          duration: '1m 20s',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          trigger: 'manual_dispatch',
        };

        setDeployments((prev) => [newDeployment, ...prev]);
        addToast('[Demo CI/CD] Production deployment v2.4.2 succeeded and registered with ALB!', 'success');
      }
    };

    timerRef.current = setTimeout(advanceStage, 1800);
  };

  const latestDeploy = deployments[0] || {};
  const totalDeployments = deployments.length;
  const successfulCount = deployments.filter((d) => d.status === 'SUCCESS').length;

  const deploymentColumns = [
    {
      header: 'Version & Tag',
      accessor: 'version',
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-primary-dark">{row.version}</span>,
    },
    {
      header: 'Commit Message',
      accessor: 'commitMessage',
      sortable: false,
      cell: (row) => (
        <div>
          <div className="font-medium text-sm">{row.commitMessage}</div>
          <div className="text-xs text-muted font-mono">
            {row.commit} • by @{row.author} on branch <code>{row.branch}</code>
          </div>
        </div>
      ),
    },
    {
      header: 'Environment',
      accessor: 'environment',
      sortable: true,
      cell: (row) => <span className="badge-tag">{row.environment}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Trigger',
      accessor: 'trigger',
      sortable: true,
      cell: (row) => <code className="font-mono text-xs">{row.trigger}</code>,
    },
    {
      header: 'Duration',
      accessor: 'duration',
      sortable: true,
      cell: (row) => <span className="text-xs font-mono">{row.duration}</span>,
    },
    {
      header: 'Completed At',
      accessor: 'timestamp',
      sortable: true,
      cell: (row) => <span className="text-xs font-mono">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="page-container">
      {/* Simulation Info */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <Rocket size={18} className="notice-icon" />
          <span className="notice-title">CI/CD Pipeline Simulator:</span>
          <span className="notice-text">
            Triggering a demo deployment simulates the 5-stage GitHub Actions workflow (Checkout, Build, Test, Package, Deploy) locally without modifying live AWS infrastructure.
          </span>
        </div>
        <span className="notice-pill">Workflow Engine</span>
      </div>

      {/* KPI Stats */}
      <section className="stats-grid">
        <StatCard
          title="Active Live Release"
          value={latestDeploy.version || 'v2.4.1'}
          unit="Current"
          icon={GitBranch}
          description={`Commit: ${latestDeploy.commit || 'a9b4f12'}`}
          variant="default"
        />

        <StatCard
          title="Pipeline Success Rate"
          value={totalDeployments > 0 ? Math.round((successfulCount / totalDeployments) * 100) : 100}
          unit="%"
          icon={CheckCircle2}
          trend={`${successfulCount} / ${totalDeployments} succeeded`}
          trendDirection="up"
          trendIsGood={true}
          description="Last 30 days build history"
          variant="success"
        />

        <StatCard
          title="Average Build Duration"
          value="3m 42s"
          unit="Avg"
          icon={Clock}
          trend="-18s vs last sprint"
          trendDirection="down"
          trendIsGood={true}
          description="Docker multi-stage cached runner"
          variant="default"
        />

        <StatCard
          title="Target Environment"
          value="Production"
          unit="us-east-1"
          icon={Rocket}
          trend="Blue / Green Ready"
          trendDirection="neutral"
          trendIsGood={true}
          description="Zero-downtime rolling update"
          variant="default"
        />
      </section>

      {/* Active Pipeline Simulator Card */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">GitHub Actions Workflow: deploy-production.yml</h3>
            <p className="section-card-subtitle">
              Automated continuous integration and zero-downtime deployment to AWS Application Load Balancer
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={startDemoDeployment}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <>
                <Loader2 size={16} className="spin-anim" />
                <span>Pipeline Running...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Demo Deployment</span>
              </>
            )}
          </button>
        </div>

        {/* 5-Stage Visual Progress Bar */}
        <div className="pipeline-stages-container">
          {PIPELINE_STAGES.map((stg, index) => {
            const isCompleted = index < currentStageIndex || (!isDeploying && currentStageIndex === PIPELINE_STAGES.length - 1);
            const isCurrent = isDeploying && index === currentStageIndex;
            const isPending = !isDeploying && currentStageIndex === -1 ? false : index > currentStageIndex;

            let stageClass = 'stage-idle';
            if (isCompleted) stageClass = 'stage-completed';
            if (isCurrent) stageClass = 'stage-running';

            return (
              <div key={stg.id} className={`pipeline-stage-item ${stageClass}`}>
                <div className="stage-indicator-box">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="stage-icon-done" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="stage-icon-spinner spin-anim" />
                  ) : (
                    <span className="stage-number">{index + 1}</span>
                  )}
                </div>
                <div className="stage-info">
                  <span className="stage-title">{stg.name}</span>
                  <span className="stage-duration">{stg.duration}</span>
                </div>
                {index < PIPELINE_STAGES.length - 1 && <div className="stage-connector-line" />}
              </div>
            );
          })}
        </div>

        {/* Interactive Build Log Terminal */}
        {(isDeploying || activeLogs.length > 0) && (
          <div className="pipeline-terminal">
            <div className="terminal-header">
              <Terminal size={14} />
              <span>Pipeline Execution Log (Simulated Runner)</span>
            </div>
            <div className="terminal-body font-mono text-xs">
              {activeLogs.map((log, i) => (
                <div key={i} className="terminal-log-line">
                  {log}
                </div>
              ))}
              {isDeploying && (
                <div className="terminal-cursor-line">
                  <span className="terminal-prompt">&gt;</span>
                  <span className="cursor-blink">_</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deployment History Table */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Deployment Audit Trail</h3>
            <p className="section-card-subtitle">
              Verified release history with commit SHAs, author identity, and execution duration
            </p>
          </div>
          <span className="badge-pill-outline">{deployments.length} Releases</span>
        </div>

        <DataTable
          columns={deploymentColumns}
          data={deployments}
          searchable={true}
          searchPlaceholder="Search by commit, version, or message..."
          pageSize={5}
          emptyMessage="No deployments found"
        />
      </div>
    </div>
  );
};

export default Deployments;
