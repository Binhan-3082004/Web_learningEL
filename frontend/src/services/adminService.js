// Gọi API thống kê dành cho Admin
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function getUserStatistics() {
  const { data } = await apiClient.get(API_ENDPOINTS.USERS.STATS);
  return data;
}

export async function getContentStatistics() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.ADMIN_STATS);
  return data;
}
