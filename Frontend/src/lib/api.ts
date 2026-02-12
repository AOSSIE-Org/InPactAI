// API client with request/response interceptors
import { supabase } from "@/utils/supabase";

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Request interceptor - adds auth token and common headers
async function interceptRequest(url: string, config: RequestConfig = {}): Promise<RequestConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Add auth token if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return {
    ...config,
    headers,
  };
}

// Response interceptor - handles errors and logging
async function interceptResponse(response: Response): Promise<Response> {
  // Log response time if available
  const processTime = response.headers.get('X-Process-Time');
  if (processTime) {
    console.debug(`API response time: ${parseFloat(processTime).toFixed(3)}s`);
  }

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    console.error(`API Error: ${response.status}`, error);
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response;
}

// Main API client
export const apiClient = {
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestConfig = await interceptRequest(url, { ...config, method: 'GET' });
    
    const response = await fetch(url, requestConfig);
    const interceptedResponse = await interceptResponse(response);
    
    return interceptedResponse.json();
  },

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestConfig = await interceptRequest(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const response = await fetch(url, requestConfig);
    const interceptedResponse = await interceptResponse(response);
    
    return interceptedResponse.json();
  },

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestConfig = await interceptRequest(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    const response = await fetch(url, requestConfig);
    const interceptedResponse = await interceptResponse(response);
    
    return interceptedResponse.json();
  },

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestConfig = await interceptRequest(url, { ...config, method: 'DELETE' });
    
    const response = await fetch(url, requestConfig);
    const interceptedResponse = await interceptResponse(response);
    
    return interceptedResponse.json();
  },
};

export default apiClient;
