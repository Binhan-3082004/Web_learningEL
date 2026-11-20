// Gọi API bài học (Learning Service)
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

// Trả về mảng chặng: [{chapter, chapterTitle, lessons:[...]}]
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

// ── Admin ──
export async function adminGetLessons() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.ADMIN_LESSONS);
  return data;
}

export async function adminGetLesson(id) {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.adminLesson(id));
  return data;
}

export async function adminCreateLesson(body) {
  const { data } = await apiClient.post(API_ENDPOINTS.LEARNING.ADMIN_LESSONS, body);
  return data;
}

export async function adminUpdateLesson(id, body) {
  const { data } = await apiClient.put(API_ENDPOINTS.LEARNING.adminLesson(id), body);
  return data;
}

export async function adminDeleteLesson(id) {
  const { data } = await apiClient.delete(API_ENDPOINTS.LEARNING.adminLesson(id));
  return data;
}

export async function adminGetVocabularies() {
  const { data } = await apiClient.get(API_ENDPOINTS.LEARNING.ADMIN_VOCABULARIES);
  return data;
}
