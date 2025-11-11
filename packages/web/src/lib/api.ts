import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { tokenStorage, userStorage } from './storage';
import type { ApiError } from '@/types/api';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token using safe storage
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Check if we should suppress toast for this request
    const suppressToast = (error.config as InternalAxiosRequestConfig & { suppressToast?: boolean })?.suppressToast;

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login only if not on public pages
          tokenStorage.clearTokens();
          userStorage.clearUser();

          // Don't redirect if we're already on public pages
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const publicPaths = ['/', '/auth/login', '/auth/register'];
          const isOnPublicPage = publicPaths.includes(currentPath);

          if (!isOnPublicPage) {
            if (!suppressToast) {
              toast.error('Session expired. Please login again.');
            }
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 1000);
          }
          break;

        case 403:
          // Forbidden
          if (!suppressToast) {
            toast.error('You do not have permission to perform this action.');
          }
          break;

        case 404:
          // Not found
          if (!suppressToast) {
            toast.error(data?.message || 'Resource not found.');
          }
          break;

        case 429:
          // Too many requests
          const retryAfter = error.response.headers['retry-after'];
          if (!suppressToast) {
            toast.error(
              `Too many requests. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`
            );
          }
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          if (!suppressToast) {
            toast.error('Server error. Please try again later.');
          }
          break;

        default:
          // Other errors
          if (!suppressToast) {
            toast.error(data?.message || 'An error occurred. Please try again.');
          }
      }
    } else if (error.request) {
      // Request was made but no response received
      if (!suppressToast) {
        toast.error('Network error. Please check your connection.');
      }
    } else {
      // Something else happened
      if (!suppressToast) {
        toast.error('An unexpected error occurred.');
      }
    }

    return Promise.reject(error);
  }
);
