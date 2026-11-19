// Gọi API tài khoản (Identity Service)
import { apiClient, saveTokens, clearTokens, getRefreshToken } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export async function login(usernameOrEmail, password) {
  const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { usernameOrEmail, password });
  saveTokens(data);
  return data.user;
}

export async function register(formData) {
  const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, formData);
  return data;
}

export async function logout() {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken: getRefreshToken() });
  } catch {
    // Dù server báo lỗi vẫn xóa token ở máy người dùng
  }
  clearTokens();
}

export async function getMyProfile() {
  const { data } = await apiClient.get(API_ENDPOINTS.AUTH.ME);
  return data;
}

export async function updateMyProfile(fields) {
  const { data } = await apiClient.put(API_ENDPOINTS.AUTH.ME, fields);
  return data;
}
// Đổi Google authorization code lấy token của hệ thống
export async function loginWithGoogle(code) {
  const { data } = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { code });
  saveTokens(data);
  return data.user ?? await getMyProfile();
}