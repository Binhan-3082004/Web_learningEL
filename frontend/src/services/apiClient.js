// Axios dùng chung: tự gắn access token vào mỗi request và tự làm mới token khi hết hạn (lỗi 401)
import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({ baseURL: BASE_URL });

export function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

// Gắn access token vào mọi request
apiClient.interceptors.request.use((requestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  return requestConfig;
});

// Gộp nhiều request bị 401 cùng lúc thành một lần gọi refresh
let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config: failedRequest, response } = error;
    const canRetry =
      response?.status === 401 &&
      failedRequest &&
      !failedRequest._retry &&
      !failedRequest.url.startsWith('/auth/') &&
      getRefreshToken();
    if (!canRetry) return Promise.reject(error);

    failedRequest._retry = true;
    try {
      refreshPromise =
        refreshPromise ||
        axios
          .post(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken: getRefreshToken() })
          .finally(() => {
            refreshPromise = null;
          });
      const { data } = await refreshPromise;
      saveTokens(data);
      failedRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(failedRequest);
    } catch (refreshError) {
      clearTokens();
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
);
