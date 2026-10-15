import React from 'react';
import { Info } from 'lucide-react';

/**
 * ChartCard Component
 * Consistent container for Recharts and analytical visuals
 */
export const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  badge = 'Simulated',
  infoText,
  height = 300,
}) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title-group">
          <div className="chart-card-heading-row">
            <h3 className="chart-card-title">{title}</h3>
            {badge && <span className="chart-simulated-pill">{badge}</span>}
          </div>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>

        <div className="chart-card-actions">
          {actions}
          {infoText && (
            <div className="chart-info-tooltip-trigger" title={infoText}>
              <Info size={16} />
            </div>
          )}
        </div>
      </div>

      <div className="chart-card-content" style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
