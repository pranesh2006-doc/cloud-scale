import React from 'react';

/**
 * StatusBadge Component
 * Renders consistent, accessible status pills for instances, alerts, and pipelines.
 */
export const StatusBadge = ({ status, text, size = 'md' }) => {
  const normStatus = (status || '').toLowerCase().trim();

  let badgeClass = 'status-badge-neutral';
  let dotClass = 'status-dot-neutral';

  if (['healthy', 'success', 'in_service', 'up', 'active', 'passing', 'completed', 'available'].includes(normStatus)) {
    badgeClass = 'status-badge-success';
    dotClass = 'status-dot-success';
  } else if (['warning', 'pending', 'in_progress', 'rebooting', 'scaling'].includes(normStatus)) {
    badgeClass = 'status-badge-warning';
    dotClass = 'status-dot-warning';
  } else if (['unhealthy', 'failed', 'critical', 'stopped', 'error', 'terminated'].includes(normStatus)) {
    badgeClass = 'status-badge-danger';
    dotClass = 'status-dot-danger';
  } else if (['info', 'informational', 'notice'].includes(normStatus)) {
    badgeClass = 'status-badge-info';
    dotClass = 'status-dot-info';
  }

  const displayText = text || status;

  return (
    <span className={`status-badge status-badge-${size} ${badgeClass}`}>
      <span className={`status-dot ${dotClass}`} />
      <span className="status-badge-text">{displayText}</span>
    </span>
  );
};

export default StatusBadge;
