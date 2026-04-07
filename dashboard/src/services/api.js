import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('insightx_token', res.data.token);
    }
    return res.data;
  },
  signup: async (email, password) => {
    const res = await api.post('/auth/signup', { email, password });
    if (res.data.token) {
      localStorage.setItem('insightx_token', res.data.token);
    }
    return res.data;
  },
  verify: () => api.get('/auth/verify'),
  logout: () => {
    localStorage.removeItem('insightx_token');
  }
};

export const dashboardAPI = {
  getVideos: () => api.get('/dashboard/videos').then(res => res.data),
  getVideoData: (analysisId) => api.get(`/dashboard/video/${analysisId}`).then(res => res.data)
};

export default api;
