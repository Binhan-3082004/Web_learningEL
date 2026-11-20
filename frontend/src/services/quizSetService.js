// Service gọi API Quiz Sets (hệ thống quiz độc lập)
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const E = API_ENDPOINTS.LEARNING;

// ── Người học ──
export async function getQuizSets() {
  const { data } = await apiClient.get(E.QUIZ_SETS);
  return data;
}

export async function getQuizSetQuestions(id) {
  const { data } = await apiClient.get(E.quizSetQuestions(id));
  return data;
}

// answers = [{ questionId, selectedOption }]
export async function submitQuizSet(id, answers) {
  const { data } = await apiClient.post(E.submitQuizSet(id), { answers });
  return data;
}

// ── Admin ──
export async function adminGetQuizSets() {
  const { data } = await apiClient.get(E.ADMIN_QUIZ_SETS);
  return data;
}

export async function adminCreateQuizSet(body) {
  const { data } = await apiClient.post(E.ADMIN_QUIZ_SETS, body);
  return data;
}

export async function adminUpdateQuizSet(id, body) {
  const { data } = await apiClient.put(E.adminQuizSet(id), body);
  return data;
}

export async function adminDeleteQuizSet(id) {
  const { data } = await apiClient.delete(E.adminQuizSet(id));
  return data;
}

export async function adminGetQuizSetQuestions(id) {
  const { data } = await apiClient.get(E.adminQuizSetQuestions(id));
  return data;
}

export async function adminAddQuestion(quizSetId, body) {
  const { data } = await apiClient.post(E.adminQuizSetQuestions(quizSetId), body);
  return data;
}

export async function adminUpdateQuestion(questionId, body) {
  const { data } = await apiClient.put(E.adminQuizSetQuestion(questionId), body);
  return data;
}

export async function adminDeleteQuestion(questionId) {
  const { data } = await apiClient.delete(E.adminQuizSetQuestion(questionId));
  return data;
}
