import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Shield,
  Save,
  CheckCircle,
  HelpCircle,
  Info,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

export const ScalingPolicies = () => {
  const {
    scalingPolicy,
    updateScalingPolicy,
    scalingEvents,
    instances,
    addToast,
  } = useApp();

  // Local form state for editing
  const [formData, setFormData] = useState({ ...scalingPolicy });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(value) || value,
    }));
  };

  const handleSavePolicy = (e) => {
    e.preventDefault();

    if (formData.minCapacity > formData.desiredCapacity) {
      addToast('Minimum capacity cannot exceed Desired capacity.', 'error');
      return;
    }
    if (formData.desiredCapacity > formData.maxCapacity) {
      addToast('Desired capacity cannot exceed Maximum capacity.', 'error');
      return;
    }
    if (formData.targetCpuUtilization < 10 || formData.targetCpuUtilization > 95) {
      addToast('Target CPU must be between 10% and 95%.', 'error');
      return;
    }

    updateScalingPolicy(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...scalingPolicy });
    setIsEditing(false);
  };

  // Scaling event table columns
  const eventColumns = [
    {
      header: 'Timestamp (UTC)',
      accessor: 'timestamp',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.timestamp}</span>,
    },
    {
      header: 'Event Type',
      accessor: 'type',
      sortable: true,
      cell: (row) => {
        let badgeType = 'info';
        let icon = null;
        if (row.type === 'SCALE_OUT') {
          badgeType = 'warning';
          icon = <ArrowUpRight size={13} />;
        } else if (row.type === 'SCALE_IN') {
          badgeType = 'info';
          icon = <ArrowDownRight size={13} />;
        } else {
          badgeType = 'neutral';
          icon = <RefreshCw size={13} />;
        }

        return (
          <span className={`status-badge status-badge-${badgeType}`}>
            {icon}
            <span className="ml-1">{row.type}</span>
          </span>
        );
      },
    },
    {
      header: 'Capacity Shift',
      id: 'capacity',
      sortable: false,
      cell: (row) => (
        <span className="font-mono text-sm">
          <strong>{row.previousCapacity}</strong> → <strong className="text-primary">{row.newCapacity}</strong> instances
        </span>
      ),
    },
    {
      header: 'Cause & CloudWatch Trigger',
      accessor: 'reason',
      sortable: false,
      cell: (row) => <span className="text-sm text-muted">{row.reason}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="page-container">
      {/* Simulation Info */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <Info size={18} className="notice-icon" />
          <span className="notice-title">Auto Scaling Policy Simulation:</span>
          <span className="notice-text">
            Editing thresholds updates frontend policy calculations and chart target lines. In production, this maps to AWS Application Auto Scaling APIs.
          </span>
        </div>
        <span className="notice-pill">Policy Engine</span>
      </div>

      {/* KPI Overview */}
      <section className="stats-grid">
        <StatCard
          title="Current Fleet Size"
          value={instances.length}
          unit="Active Nodes"
          icon={Layers}
          description={`Desired target: ${scalingPolicy.desiredCapacity}`}
          variant="default"
        />

        <StatCard
          title="Target CPU Utilization"
          value={scalingPolicy.targetCpuUtilization}
          unit="%"
          icon={Cpu}
          description="CloudWatch TargetTracking Alarm metric"
          variant="default"
        />

        <StatCard
          title="Capacity Envelope"
          value={`${scalingPolicy.minCapacity} - ${scalingPolicy.maxCapacity}`}
          unit="Min / Max"
          icon={Sliders}
          description="Enforced hard boundary limits"
          variant="default"
        />

        <StatCard
          title="Cooldown Duration"
          value={scalingPolicy.scaleOutCooldown}
          unit="Seconds"
          icon={Clock}
          description="Scale-out / in stabilization delay"
          variant="default"
        />
      </section>

      {/* Policy Form & Threshold Explanation Grid */}
      <div className="charts-grid-two">
        {/* Editable Scaling Policy Form */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Auto Scaling Group Configuration</h3>
              <p className="section-card-subtitle">
                Group Name: <code className="font-mono">{scalingPolicy.asgName}</code>
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Policy
              </button>
            )}
          </div>

          <form onSubmit={handleSavePolicy}>
            <div className="policy-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="min-capacity">Minimum Capacity</label>
                <input
                  id="min-capacity"
                  type="number"
                  className="form-control"
                  min="1"
                  max="20"
                  value={formData.minCapacity}
                  onChange={(e) => handleInputChange('minCapacity', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Baseline minimum count</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="desired-capacity">Desired Capacity</label>
                <input
                  id="desired-capacity"
                  type="number"
                  className="form-control"
                  min="1"
                  max="50"
                  value={formData.desiredCapacity}
                  onChange={(e) => handleInputChange('desiredCapacity', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Default operating capacity</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="max-capacity">Maximum Capacity</label>
                <input
                  id="max-capacity"
                  type="number"
                  className="form-control"
                  min="2"
                  max="100"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Maximum allowable ceiling</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="target-cpu">Target CPU Utilization (%)</label>
                <input
                  id="target-cpu"
                  type="number"
                  className="form-control"
                  min="10"
                  max="95"
                  value={formData.targetCpuUtilization}
                  onChange={(e) => handleInputChange('targetCpuUtilization', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Scale out when average CPU exceeds this</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scale-out-cooldown">Scale-Out Cooldown (sec)</label>
                <input
                  id="scale-out-cooldown"
                  type="number"
                  className="form-control"
                  min="60"
                  max="1800"
                  step="30"
                  value={formData.scaleOutCooldown}
                  onChange={(e) => handleInputChange('scaleOutCooldown', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Wait period before next scale-out</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scale-in-cooldown">Scale-In Cooldown (sec)</label>
                <input
                  id="scale-in-cooldown"
                  type="number"
                  className="form-control"
                  min="60"
                  max="1800"
                  step="30"
                  value={formData.scaleInCooldown}
                  onChange={(e) => handleInputChange('scaleInCooldown', e.target.value)}
                  disabled={!isEditing}
                />
                <span className="form-hint">Wait period before terminating instances</span>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions-row">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Policy (Demo)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Visual Scaling Logic & Timeline Explanation */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Target Tracking Scaling Mechanics</h3>
              <p className="section-card-subtitle">
                How AWS EC2 Auto Scaling evaluates metrics and adjusts instance capacity
              </p>
            </div>
          </div>

          <div className="scaling-logic-card">
            <div className="scaling-threshold-visual">
              <div className="threshold-bar-wrapper">
                <div className="threshold-zone zone-scalein">
                  <span className="zone-label">Scale-In Zone</span>
                  <span className="zone-sub">&lt; 45% CPU</span>
                </div>
                <div className="threshold-zone zone-optimal">
                  <span className="zone-label">Optimal Equilibrium</span>
                  <span className="zone-sub">45% - 70% CPU</span>
                </div>
                <div className="threshold-zone zone-scaleout">
                  <span className="zone-label">Scale-Out Zone</span>
                  <span className="zone-sub">&gt; {scalingPolicy.targetCpuUtilization}% CPU</span>
                </div>
              </div>
              <div
                className="current-threshold-marker"
                style={{ left: `${scalingPolicy.targetCpuUtilization}%` }}
                title={`Target Threshold: ${scalingPolicy.targetCpuUtilization}%`}
              >
                <div className="marker-line" />
                <span className="marker-label">Target: {scalingPolicy.targetCpuUtilization}%</span>
              </div>
            </div>

            <div className="scaling-steps-list">
              <div className="scaling-step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h5 className="step-title">CloudWatch Alarm Trigger</h5>
                  <p className="step-desc">
                    Aggregated EC2 metric <code>CPUUtilization</code> is sampled over 3 consecutive 1-minute evaluation periods.
                  </p>
                </div>
              </div>

              <div className="scaling-step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h5 className="step-title">Proportional Capacity Adjustment</h5>
                  <p className="step-desc">
                    AWS computes the exact capacity needed: <code>TargetCapacity = CurrentCapacity * (CurrentCPU / TargetCPU)</code>.
                  </p>
                </div>
              </div>

              <div className="scaling-step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h5 className="step-title">ALB Target Registration & Cooldown</h5>
                  <p className="step-desc">
                    New EC2 instances initialize, pass Application Load Balancer health checks, and wait {scalingPolicy.scaleOutCooldown}s cooldown before further scaling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scaling Events History Table */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Auto Scaling Lifecycle Events</h3>
            <p className="section-card-subtitle">
              Audit log of automatic scaling activities, health replacements, and cluster resizes
            </p>
          </div>
          <span className="badge-pill-outline">{scalingEvents.length} Recorded Events</span>
        </div>

        <DataTable
          columns={eventColumns}
          data={scalingEvents}
          searchable={false}
          pageSize={5}
          emptyMessage="No scaling events recorded yet"
        />
      </div>
    </div>
  );
};

export default ScalingPolicies;
