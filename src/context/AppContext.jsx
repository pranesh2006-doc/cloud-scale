import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_INSTANCES,
  INITIAL_SCALING_POLICY,
  INITIAL_SCALING_EVENTS,
  INITIAL_ALERTS,
  INITIAL_DEPLOYMENTS,
  INITIAL_RATE_LIMIT_CONFIG,
  INFRASTRUCTURE_COMPONENTS,
  generateTimeSeriesData,
} from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Persisted user preferences
  const [preferences, setPreferences] = useLocalStorage('cloudscale_preferences', {
    region: 'us-east-1',
    environment: 'prod',
    timeRange: '1h',
    theme: 'light',
    refreshInterval: 15,
    emailAlerts: true,
    slackWebhook: true,
    audioAlerts: false,
    apiUrl: 'http://localhost:8080',
    demoMode: true,
  });

  // Current selections
  const [selectedRegion, setSelectedRegion] = useState(preferences.region || 'us-east-1');
  const [selectedEnvironment, setSelectedEnvironment] = useState(preferences.environment || 'prod');
  const [timeRange, setTimeRange] = useState(preferences.timeRange || '1h');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Core Application Data (Simulated Local State)
  const [instances, setInstances] = useState(INITIAL_INSTANCES);
  const [infraStatus, setInfraStatus] = useState(INFRASTRUCTURE_COMPONENTS);
  const [scalingPolicy, setScalingPolicy] = useState(INITIAL_SCALING_POLICY);
  const [scalingEvents, setScalingEvents] = useState(INITIAL_SCALING_EVENTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [deployments, setDeployments] = useState(INITIAL_DEPLOYMENTS);
  const [rateLimitConfig, setRateLimitConfig] = useState(INITIAL_RATE_LIMIT_CONFIG);
  const [timeSeriesData, setTimeSeriesData] = useState(() => generateTimeSeriesData(12, '1h'));

  // Notification toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Refresh handler
  const refreshData = useCallback(() => {
    setTimeSeriesData(generateTimeSeriesData(12, timeRange));
    setLastUpdated(new Date());
    addToast('Infrastructure metrics refreshed from mock stream', 'info', 2500);
  }, [timeRange, addToast]);

  // Handle region change
  const handleRegionChange = (newRegion) => {
    setSelectedRegion(newRegion);
    setPreferences((prev) => ({ ...prev, region: newRegion }));
    refreshData();
    addToast(`Switched active region to ${newRegion}`, 'info', 2500);
  };

  // Handle environment change
  const handleEnvironmentChange = (newEnv) => {
    setSelectedEnvironment(newEnv);
    setPreferences((prev) => ({ ...prev, environment: newEnv }));
    refreshData();
    addToast(`Switched environment context to ${newEnv.toUpperCase()}`, 'info', 2500);
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setTimeSeriesData(generateTimeSeriesData(12, range));
    setPreferences((prev) => ({ ...prev, timeRange: range }));
  };

  // Instance actions (Local Demo State Only)
  const terminateInstance = (instanceId) => {
    setInstances((prev) => prev.filter((inst) => inst.id !== instanceId));
    addToast(`[Demo] Terminated instance ${instanceId}. Auto Scaling will register a replacement.`, 'warning');

    // Simulate Auto Scaling replacement after 4 seconds
    setTimeout(() => {
      const newId = `i-${Math.random().toString(36).substring(2, 10)}88`;
      const newInst = {
        id: newId,
        name: `cloudscale-api-prod-0${Math.floor(Math.random() * 8) + 5}`,
        status: 'healthy',
        cpuUsage: Math.floor(Math.random() * 25) + 30,
        memoryUsage: Math.floor(Math.random() * 20) + 50,
        instanceType: 't3.medium',
        availabilityZone: `${selectedRegion}a`,
        privateIp: `10.0.1.${Math.floor(Math.random() * 200) + 20}`,
        publicIp: `54.210.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
        launchTime: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        uptime: '1m',
        targetGroup: 'tg-cloudscale-api',
        albRegistered: true,
        os: 'Amazon Linux 2023',
        version: 'v2.4.1',
      };

      setInstances((prev) => [...prev, newInst]);
      setScalingEvents((prev) => [
        {
          id: `scale-evt-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          type: 'HEALTH_CHECK_REPLACE',
          previousCapacity: instances.length - 1,
          newCapacity: instances.length,
          reason: `Automatic replenishment after simulated termination of ${instanceId}.`,
          instanceId: newId,
          status: 'COMPLETED',
        },
        ...prev,
      ]);
      addToast(`[Demo ASG] Launched replacement instance ${newId}`, 'success');
    }, 4000);
  };

  const rebootInstance = (instanceId) => {
    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === instanceId ? { ...inst, status: 'warning', cpuUsage: 12 } : inst
      )
    );
    addToast(`[Demo] Reboot signal sent to ${instanceId}`, 'info');

    setTimeout(() => {
      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId
            ? { ...inst, status: 'healthy', cpuUsage: Math.floor(Math.random() * 20) + 35 }
            : inst
        )
      );
      addToast(`[Demo] Instance ${instanceId} rebooted and passed ALB health checks.`, 'success');
    }, 3000);
  };

  // Scaling policy actions
  const updateScalingPolicy = (newPolicy) => {
    setScalingPolicy(newPolicy);
    addToast('[Demo] Scaling policy updated successfully in local state.', 'success');
  };

  // Alert actions
  const dismissAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    addToast('Alert dismissed.', 'info', 2000);
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    addToast('Alert marked as acknowledged.', 'info', 2000);
  };

  // Reset demo state
  const resetAllDemoData = () => {
    setInstances(INITIAL_INSTANCES);
    setInfraStatus(INFRASTRUCTURE_COMPONENTS);
    setScalingPolicy(INITIAL_SCALING_POLICY);
    setScalingEvents(INITIAL_SCALING_EVENTS);
    setAlerts(INITIAL_ALERTS);
    setDeployments(INITIAL_DEPLOYMENTS);
    setRateLimitConfig(INITIAL_RATE_LIMIT_CONFIG);
    setTimeSeriesData(generateTimeSeriesData(12, timeRange));
    addToast('All simulated demo data has been reset to defaults.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion: handleRegionChange,
        selectedEnvironment,
        setSelectedEnvironment: handleEnvironmentChange,
        timeRange,
        setTimeRange: handleTimeRangeChange,
        lastUpdated,
        refreshData,
        instances,
        setInstances,
        terminateInstance,
        rebootInstance,
        infraStatus,
        scalingPolicy,
        updateScalingPolicy,
        scalingEvents,
        setScalingEvents,
        alerts,
        dismissAlert,
        acknowledgeAlert,
        deployments,
        setDeployments,
        rateLimitConfig,
        setRateLimitConfig,
        timeSeriesData,
        preferences,
        setPreferences,
        resetAllDemoData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
