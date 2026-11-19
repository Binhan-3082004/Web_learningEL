// Gọi API thi thử
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function getExams() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.EXAMS);
  return data;
}

export async function startExam(examId) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.startExam(examId));
  return data;
}

export async function submitExam(sessionId, answers) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.submitExam(sessionId), { answers });
  return data;
}
