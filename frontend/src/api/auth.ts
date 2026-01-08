import apiClient from './client';

export const authApi = {
  // Login
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refresh: string) => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh });
    return response.data;
  },
};
