import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import Instances from './pages/Instances';
import TrafficTesting from './pages/TrafficTesting';
import ScalingPolicies from './pages/ScalingPolicies';
import Monitoring from './pages/Monitoring';
import Deployments from './pages/Deployments';
import RateLimiting from './pages/RateLimiting';
import Settings from './pages/Settings';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="instances" element={<Instances />} />
            <Route path="traffic-testing" element={<TrafficTesting />} />
            <Route path="scaling-policies" element={<ScalingPolicies />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="deployments" element={<Deployments />} />
            <Route path="rate-limiting" element={<RateLimiting />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
