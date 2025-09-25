import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ✅ 로그인 시
  const login = (newToken, userInfo) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userInfo);
  };

  // ✅ 로그아웃 시
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // ✅ 앱 시작 시 토큰 복원 및 사용자 정보 조회
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token');

      if (savedToken && !user) {
        try {
          const res = await axiosInstance.get('/member/info');

          console.log('✅ 사용자 정보:', res.data);

          setUser(res.data);
        } catch (err) {
          console.error('토큰 복원 실패:', err);
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
