import { API_URL } from '../config';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return response;
};

export { API_URL };
