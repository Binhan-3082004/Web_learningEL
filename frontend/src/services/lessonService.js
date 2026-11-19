// Gọi API bài học (Learning Service)
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function getLessons(level) {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.LESSONS, { params: level ? { level } : {} });
  return data;
}

export async function getLessonDetail(lessonId) {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.lessonDetail(lessonId));
  return data;
}

export async function completeLesson(lessonId) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.completeLesson(lessonId));
  return data;
}
