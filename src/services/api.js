/**
 * CloudScale API Client & Service Layer
 * Designed for seamless transition from local simulated mock data
 * to a live Spring Boot / AWS REST API backend.
 */
import axios from 'axios';
import {
  INITIAL_INSTANCES,
  INITIAL_SCALING_EVENTS,
  INITIAL_ALERTS,
  INITIAL_DEPLOYMENTS,
  INFRASTRUCTURE_COMPONENTS,
  generateTimeSeriesData,
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false';

// Create configured Axios instance for future Spring Boot backend
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor (ready for JWT authentication token injection)
apiClient.interceptors.request.use(
  (config) => {
    // Note: Secrets or tokens will be set via secure cookies or runtime state
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    console.warn(`[CloudScale API] Error:`, message);
    return Promise.reject(error);
  }
);

/**
 * Service methods with graceful fallback to simulated mock data
 */
export const cloudScaleApi = {
  // GET /api/health
  async getHealth() {
    if (USE_MOCK) {
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'cloudscale-core-service',
        database: 'UP',
        loadBalancer: 'HEALTHY',
        isMock: true,
      };
    }
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // GET /api/instances
  async getInstances() {
    if (USE_MOCK) {
      return [...INITIAL_INSTANCES];
    }
    const response = await apiClient.get('/api/instances');
    return response.data;
  },

  // GET /api/metrics?range=1h
  async getMetrics(range = '1h') {
    if (USE_MOCK) {
      return generateTimeSeriesData(12, range);
    }
    const response = await apiClient.get('/api/metrics', { params: { range } });
    return response.data;
  },

  // GET /api/scaling/events
  async getScalingEvents() {
    if (USE_MOCK) {
      return [...INITIAL_SCALING_EVENTS];
    }
    const response = await apiClient.get('/api/scaling/events');
    return response.data;
  },

  // GET /api/deployments
  async getDeployments() {
    if (USE_MOCK) {
      return [...INITIAL_DEPLOYMENTS];
    }
    const response = await apiClient.get('/api/deployments');
    return response.data;
  },

  // GET /api/alerts
  async getAlerts() {
    if (USE_MOCK) {
      return [...INITIAL_ALERTS];
    }
    const response = await apiClient.get('/api/alerts');
    return response.data;
  },

  // GET /api/infrastructure
  async getInfrastructureStatus() {
    if (USE_MOCK) {
      return [...INFRASTRUCTURE_COMPONENTS];
    }
    const response = await apiClient.get('/api/infrastructure');
    return response.data;
  },

  // POST /api/load-test/start (future backend load generator)
  async startLoadTest(config) {
    if (USE_MOCK) {
      return { success: true, testId: `sim-${Date.now()}`, message: 'Simulation initialized' };
    }
    const response = await apiClient.post('/api/load-test/start', config);
    return response.data;
  },
};

export default cloudScaleApi;
