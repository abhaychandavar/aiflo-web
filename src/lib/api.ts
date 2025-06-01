// lib/api.ts
import settings from '@/config/app';
import axios from 'axios'
import { getSession, signIn } from 'next-auth/react';

export const api = axios.create({
  withCredentials: true,
})


api.interceptors.request.use(async (config) => {
    if (!config.url) return config;
    
    const urlParts = config.url.split('/');
    const serviceNameRaw = urlParts[0];
    const serviceNameRegex = /^<[^<>]+>$/;
    if (!serviceNameRegex.test(serviceNameRaw)) {
        return config;
    }
    let baseURL = serviceNameRaw === 'nextApi' ? settings.nextApi : '';
    const serviceName = serviceNameRaw.replace('<', '').replace('>', '') as keyof typeof settings.services;
    if (!baseURL.length) {
        baseURL = settings.services[serviceName].baseURL;
    }
    if (!baseURL) {
      throw new Error(`Unknown service: ${serviceName}`);
    }
  
    const relativePath = urlParts.slice(1).join('/');
    config.url = `${baseURL}/${relativePath}`;
    
    const session = await getSession();

    if (session) {
        config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }

    return config;
  }, (error) => {
    return Promise.reject(error);
});

// Response Interceptor for 401 Handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            await signIn();
            const session = await getSession();
            const { accessToken } = (session as any);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
);
  
export default api;