import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '/api';

const baseURL = /^https?:\/\//i.test(normalizedApiUrl) || normalizedApiUrl.startsWith('/')
  ? normalizedApiUrl
  : `http://${normalizedApiUrl}`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;