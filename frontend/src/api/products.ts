import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const productsApi = {
  // Public endpoints (no auth)
  getPublicProducts: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/public/products/`);
    return response.data;
  },

  getPublicCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/public/categories/`);
    return response.data;
  },
};
