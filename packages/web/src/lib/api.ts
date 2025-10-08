import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token and logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and logging
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1000);
          break;

        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          toast.error(data?.message || 'Resource not found.');
          break;

        case 429:
          // Too many requests
          const retryAfter = error.response.headers['retry-after'];
          toast.error(
            `Too many requests. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Server error. Please try again later.');
          if (process.env.NODE_ENV === 'development') {
            console.error('[API Server Error]', data);
          }
          break;

        default:
          // Other errors
          toast.error(data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
      console.error('[API Network Error]', error.request);
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
      console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
  }
);
