// Gọi API tiến độ học tập
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function getProgress() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.PROGRESS);
  return data;
}

export async function getMistakes() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.MISTAKES);
  return data;
}
