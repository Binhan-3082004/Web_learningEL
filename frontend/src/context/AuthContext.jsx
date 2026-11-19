// Lưu trạng thái đăng nhập toàn cục: ai đang đăng nhập, đăng nhập/đăng xuất, kiểm tra vai trò
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { clearTokens, getAccessToken } from '../services/apiClient';
// import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginWithGoogle = useCallback(async (code) => {
    const loggedInUser = await authService.loginWithGoogle(code);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Khi mở lại trang: nếu còn token thì lấy lại thông tin người dùng
  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    authService
      .getMyProfile()
      .then(setUser)
      .catch(clearTokens)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (usernameOrEmail, password) => {
    const loggedInUser = await authService.login(usernameOrEmail, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const hasRole = useCallback((role) => Boolean(user?.roles?.includes(role)), [user]);

  const value = useMemo(
    () => ({ user, isLoading, login, loginWithGoogle, register: authService.register, logout, hasRole, setUser }),
    [user, isLoading, login, loginWithGoogle, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
