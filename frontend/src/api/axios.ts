import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : 'http://localhost:8000';

const baseURL = /^https?:\/\//i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `http://${normalizedApiUrl}`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;