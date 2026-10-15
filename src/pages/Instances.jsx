import React, { useState } from 'react';
import {
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  RotateCw,
  Trash2,
  Eye,
  Plus,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { formatPercent } from '../utils/formatters';

export const Instances = () => {
  const {
    instances,
    terminateInstance,
    rebootInstance,
    scalingPolicy,
    selectedRegion,
  } = useApp();

  const [selectedInstance, setSelectedInstance] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmActionModal, setConfirmActionModal] = useState({
    isOpen: false,
    type: null, // 'terminate' | 'reboot'
    instance: null,
  });

  // Calculate metrics
  const total = instances.length;
  const healthyCount = instances.filter((i) => i.status === 'healthy').length;
  const unhealthyCount = instances.filter((i) => i.status === 'unhealthy').length;
  const warningCount = instances.filter((i) => i.status === 'warning').length;
  const avgCpu = Math.round(
    instances.reduce((acc, curr) => acc + curr.cpuUsage, 0) / (total || 1)
  );

  const handleOpenDetails = (instance) => {
    setSelectedInstance(instance);
    setDetailsModalOpen(true);
  };

  const handleTriggerAction = (type, instance) => {
    setConfirmActionModal({
      isOpen: true,
      type,
      instance,
    });
  };

  const executeConfirmedAction = () => {
    const { type, instance } = confirmActionModal;
    if (type === 'terminate') {
      terminateInstance(instance.id);
    } else if (type === 'reboot') {
      rebootInstance(instance.id);
    }
    setConfirmActionModal({ isOpen: false, type: null, instance: null });
  };

  // Helper for CPU progress bar colors
  const getCpuBarClass = (usage) => {
    if (usage >= 80) return 'cpu-bar-danger';
    if (usage >= 60) return 'cpu-bar-warning';
    return 'cpu-bar-healthy';
  };

  // Table columns definition
  const columns = [
    {
      header: 'Instance ID',
      accessor: 'id',
      sortable: true,
      cell: (row) => (
        <button
          type="button"
          className="table-link-btn"
          onClick={() => handleOpenDetails(row)}
        >
          <Server size={14} className="cell-icon text-muted" />
          <span className="font-mono font-bold">{row.id}</span>
        </button>
      ),
    },
    {
      header: 'Name & Version',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-primary-dark">{row.name}</div>
          <div className="text-xs text-muted">{row.version} • {row.os}</div>
        </div>
      ),
    },
    {
      header: 'Health Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'CPU Utilization',
      accessor: 'cpuUsage',
      sortable: true,
      cell: (row) => (
        <div className="cpu-cell-wrapper">
          <div className="cpu-text-row">
            <span className="cpu-pct font-mono">{formatPercent(row.cpuUsage)}</span>
            {row.cpuUsage > scalingPolicy.targetCpuUtilization && (
              <span className="cpu-alert-indicator" title="Above ASG Target">
                <AlertTriangle size={12} />
              </span>
            )}
          </div>
          <div className="cpu-progress-bg">
            <div
              className={`cpu-progress-fill ${getCpuBarClass(row.cpuUsage)}`}
              style={{ width: `${Math.min(100, row.cpuUsage)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'instanceType',
      sortable: true,
      cell: (row) => <span className="badge-tag font-mono">{row.instanceType}</span>,
    },
    {
      header: 'AZ',
      accessor: 'availabilityZone',
      sortable: true,
      cell: (row) => <span className="az-tag">{row.availabilityZone}</span>,
    },
    {
      header: 'Private / Public IP',
      accessor: 'privateIp',
      sortable: false,
      cell: (row) => (
        <div className="text-xs font-mono">
          <div>{row.privateIp}</div>
          <div className="text-muted">{row.publicIp}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      sortable: false,
      cell: (row) => (
        <div className="row-actions-group">
          <button
            type="button"
            className="action-btn-sm"
            onClick={() => handleOpenDetails(row)}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="action-btn-sm"
            onClick={() => handleTriggerAction('reboot', row)}
            title="Simulate Reboot"
          >
            <RotateCw size={14} />
          </button>
          <button
            type="button"
            className="action-btn-sm btn-action-danger"
            onClick={() => handleTriggerAction('terminate', row)}
            title="Simulate Terminate"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Simulation Info */}
      <div className="demo-notice-banner">
        <div className="notice-left">
          <Info size={18} className="notice-icon" />
          <span className="notice-title">Simulated EC2 Fleet:</span>
          <span className="notice-text">
            Actions like Reboot and Terminate only modify local mock state. Terminating an instance triggers an Auto Scaling replacement event within 4 seconds.
          </span>
        </div>
        <span className="notice-pill">Local State Only</span>
      </div>

      {/* KPI Cards */}
      <section className="stats-grid">
        <StatCard
          title="Total Instances"
          value={total}
          unit="Nodes"
          icon={Server}
          description={`Min: ${scalingPolicy.minCapacity} | Desired: ${scalingPolicy.desiredCapacity} | Max: ${scalingPolicy.maxCapacity}`}
          variant="default"
        />

        <StatCard
          title="Healthy Instances"
          value={healthyCount}
          unit="In-Service"
          icon={CheckCircle}
          trend={`${Math.round((healthyCount / (total || 1)) * 100)}% healthy`}
          trendDirection="up"
          trendIsGood={true}
          description="Registered with ALB target group"
          variant="success"
        />

        <StatCard
          title="Degraded / Alerting"
          value={unhealthyCount + warningCount}
          unit="Instances"
          icon={AlertTriangle}
          trend={unhealthyCount > 0 ? `${unhealthyCount} critical` : 'All healthy'}
          trendDirection={unhealthyCount > 0 ? 'up' : 'down'}
          trendIsGood={unhealthyCount === 0}
          description={`${warningCount} warning, ${unhealthyCount} unhealthy`}
          variant={unhealthyCount > 0 ? 'danger' : 'default'}
        />

        <StatCard
          title="Average Fleet CPU"
          value={avgCpu}
          unit="%"
          icon={Cpu}
          trend={`Target: ${scalingPolicy.targetCpuUtilization}%`}
          trendDirection={avgCpu > 70 ? 'up' : 'down'}
          trendIsGood={avgCpu <= 70}
          description="Aggregated 5-minute CloudWatch metric"
          variant={avgCpu > 75 ? 'warning' : 'default'}
        />
      </section>

      {/* Instance Table Section */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">EC2 Fleet Inventory</h3>
            <p className="section-card-subtitle">
              Manage virtual machines connected to the Application Load Balancer and Auto Scaling Group
            </p>
          </div>
          <div className="header-meta-right">
            <span className="region-meta-badge">Region: {selectedRegion}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={instances}
          searchable={true}
          searchPlaceholder="Search by ID, name, IP, or type..."
          filterOptions={{
            key: 'status',
            label: 'Health Filter',
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'healthy', label: 'Healthy Only' },
              { value: 'warning', label: 'Warning Only' },
              { value: 'unhealthy', label: 'Unhealthy Only' },
            ],
          }}
          pageSize={6}
          emptyMessage="No matching EC2 instances found"
          emptySubMessage="Try resetting filters or searching with another keyword"
        />
      </div>

      {/* Instance Details Modal */}
      {selectedInstance && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Instance Details: ${selectedInstance.id}`}
          subtitle={`${selectedInstance.name} • ${selectedInstance.instanceType}`}
          footer={
            <div className="modal-footer-between">
              <span className="text-xs text-muted">
                Simulated AWS EC2 metadata instance
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          }
        >
          <div className="details-modal-grid">
            <div className="details-prop-item">
              <span className="details-label">Status</span>
              <StatusBadge status={selectedInstance.status} />
            </div>

            <div className="details-prop-item">
              <span className="details-label">CPU Utilization</span>
              <span className="details-val font-mono font-bold">
                {selectedInstance.cpuUsage}%
              </span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Memory Utilization</span>
              <span className="details-val font-mono">{selectedInstance.memoryUsage}%</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Instance Type</span>
              <span className="details-val font-mono">{selectedInstance.instanceType}</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Availability Zone</span>
              <span className="details-val">{selectedInstance.availabilityZone}</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Private IPv4</span>
              <span className="details-val font-mono">{selectedInstance.privateIp}</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Public IPv4</span>
              <span className="details-val font-mono">{selectedInstance.publicIp}</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Target Group</span>
              <span className="details-val font-mono">{selectedInstance.targetGroup}</span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">ALB Registration</span>
              <span className="details-val">
                {selectedInstance.albRegistered ? 'Registered & Forwarding' : 'Draining / Deregistered'}
              </span>
            </div>

            <div className="details-prop-item">
              <span className="details-label">Uptime</span>
              <span className="details-val">{selectedInstance.uptime}</span>
            </div>

            <div className="details-prop-item details-col-span-2">
              <span className="details-label">Operating System & AMI</span>
              <span className="details-val">{selectedInstance.os} (ami-0c7217cdde317cfec)</span>
            </div>

            <div className="details-prop-item details-col-span-2">
              <span className="details-label">Launch Timestamp</span>
              <span className="details-val">{selectedInstance.launchTime}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmActionModal.isOpen && (
        <Modal
          isOpen={confirmActionModal.isOpen}
          onClose={() => setConfirmActionModal({ isOpen: false, type: null, instance: null })}
          title={
            confirmActionModal.type === 'terminate'
              ? 'Confirm Simulated Termination'
              : 'Confirm Simulated Reboot'
          }
          subtitle={`Target: ${confirmActionModal.instance?.id}`}
          footer={
            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmActionModal({ isOpen: false, type: null, instance: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${confirmActionModal.type === 'terminate' ? 'btn-danger' : 'btn-primary'}`}
                onClick={executeConfirmedAction}
              >
                {confirmActionModal.type === 'terminate' ? 'Terminate (Demo)' : 'Reboot (Demo)'}
              </button>
            </div>
          }
        >
          <div className="confirm-modal-content">
            <p className="confirm-text">
              {confirmActionModal.type === 'terminate'
                ? `Are you sure you want to simulate terminating instance ${confirmActionModal.instance?.id}? This will remove it from the local list and trigger an automated Auto Scaling replenishment event.`
                : `Are you sure you want to simulate rebooting instance ${confirmActionModal.instance?.id}? It will enter a temporary warning state before recovering.`}
            </p>
            <p className="text-xs text-muted mt-2">
              Note: This action only modifies in-browser mock state. No real AWS resources will be modified.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Instances;
