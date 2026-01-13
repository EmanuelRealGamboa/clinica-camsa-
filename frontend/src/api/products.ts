import axios from 'axios';
import type { Product, ProductCategory } from '../types';

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

  // New Kiosk endpoints
  getFeaturedProduct: async (): Promise<Product | null> => {
    const response = await axios.get(`${API_BASE_URL}/api/public/products/featured/`);
    return response.data;
  },

  getMostOrderedProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/public/products/most-ordered/`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/public/categories/${categoryId}/products/`);
    return response.data;
  },

  getCarouselCategories: async (): Promise<ProductCategory[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/public/categories/carousel/`);
    return response.data;
  },
};
