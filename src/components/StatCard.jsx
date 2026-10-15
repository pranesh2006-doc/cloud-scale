import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard Component
 * Displays summary KPIs with trend indicators and status colors
 */
export const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  trendIsGood = true,
  description,
  variant = 'default', // 'default' | 'primary' | 'warning' | 'danger' | 'success'
}) => {
  const getTrendIcon = () => {
    if (trendDirection === 'up') return <TrendingUp size={14} />;
    if (trendDirection === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendClass = () => {
    if (trendDirection === 'neutral') return 'trend-neutral';
    const isPositive = trendDirection === 'up';
    // If trendIsGood is true, up is green. If false (e.g. latency, error rate), up is red.
    const isGood = trendIsGood ? isPositive : !isPositive;
    return isGood ? 'trend-good' : 'trend-bad';
  };

  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrapper">
            <Icon size={18} className="stat-card-icon" />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value-row">
          <span className="stat-card-value">{value}</span>
          {unit && <span className="stat-card-unit">{unit}</span>}
        </div>

        {(trend || description) && (
          <div className="stat-card-footer">
            {trend && (
              <span className={`stat-card-trend ${getTrendClass()}`}>
                {getTrendIcon()}
                <span>{trend}</span>
              </span>
            )}
            {description && <span className="stat-card-description">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
