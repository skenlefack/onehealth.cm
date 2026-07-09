import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const client = axios.create({
  baseURL: `${API_URL}/api/analytics`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

const buildParams = (params) => {
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) clean[k] = v;
  });
  return { params: clean };
};

export const getDashboard = (params) => client.get('/dashboard', buildParams(params));
export const getPages = (params) => client.get('/pages', buildParams(params));
export const getReferrers = (params) => client.get('/referrers', buildParams(params));
export const getBrowsers = (params) => client.get('/browsers', buildParams(params));
export const getOsStats = (params) => client.get('/os', buildParams(params));
export const getDevices = (params) => client.get('/devices', buildParams(params));
export const getCountries = (params) => client.get('/countries', buildParams(params));
export const getRealtime = () => client.get('/realtime');
export const getEvents = (params) => client.get('/events', buildParams(params));
export const getUtm = (params) => client.get('/utm', buildParams(params));
