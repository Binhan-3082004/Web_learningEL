// Gọi API Quiz từ vựng
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function startQuiz({ lessonId, count = 10 }) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.QUIZ_START, { lessonId, count });
  return data;
}

export async function submitQuiz(sessionId, answers) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.submitQuiz(sessionId), { answers });
  return data;
}
