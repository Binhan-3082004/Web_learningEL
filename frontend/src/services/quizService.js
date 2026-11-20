// Gọi API Quiz từ vựng
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

// count = undefined → server tự quyết dùng QuizQuestionCount của bài (nếu có lessonId)
export async function startQuiz({ lessonId, count } = {}) {
  const body = {};
  if (lessonId !== undefined) body.lessonId = lessonId;
  if (count !== undefined) body.count = count;
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.QUIZ_START, body);
  return data;
}

export async function submitQuiz(sessionId, answers) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.submitQuiz(sessionId), { answers });
  return data;
}
