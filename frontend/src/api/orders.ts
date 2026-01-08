import apiClient from './client';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ordersApi = {
  // Public endpoints (no auth)
  createOrderPublic: async (orderData: any) => {
    const response = await axios.post(`${API_BASE_URL}/api/public/orders/create`, orderData);
    return response.data;
  },

  getActiveOrdersPublic: async (deviceUid: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/orders/active?device_uid=${deviceUid}`);
    return response.data;
  },

  submitFeedback: async (orderId: number, feedbackData: {
    device_uid: string;
    satisfaction_rating: number;
    comment?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/public/orders/${orderId}/feedback/`,
      feedbackData
    );
    return response.data;
  },

  // Staff endpoints (auth required)
  getAllOrders: async () => {
    const response = await apiClient.get('/orders/');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await apiClient.get(`/orders/${id}/`);
    return response.data;
  },

  getOrderQueue: async (statuses?: string, myOrders?: boolean) => {
    const params = new URLSearchParams();
    if (statuses) params.append('status', statuses);
    if (myOrders) params.append('my_orders', 'true');
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/orders/queue/${queryString}`);
    return response.data;
  },

  changeOrderStatus: async (id: number, statusData: any) => {
    const response = await apiClient.patch(`/orders/${id}/status/`, statusData);
    return response.data;
  },

  cancelOrder: async (id: number, note?: string) => {
    const response = await apiClient.post(`/orders/${id}/cancel/`, { note });
    return response.data;
  },
};
