import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { AuthContext, AuthProvider } from './context/AuthContext';
import ErrorProvider from './context/ErrorProvider'; // ✅ default export
import { TodoProvider } from './context/TodoContext';
import GlobalErrorModal from './components/GlobalErrorModal';
import { StyleProvider } from './context/StyleContext';
import { CalendarProvider } from './context/CalendarContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import FindPage from './pages/FindPage';
import ResetPwPage from './pages/ResetPwPage';
import Mypage from './pages/Mypage';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Routes>
      <Route
        path="/main"
        element={user ? <MainPage /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find" element={<FindPage />} />
      <Route path="/reset-pw" element={<ResetPwPage />} />
      <Route path="/mypage" element={<Mypage />} />
      <Route
        path="*"
        element={<Navigate to={user ? "/main" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorProvider> {/* ✅ 전역 에러 컨텍스트 등록 */}
      <StyleProvider>
        <AuthProvider>
          <TodoProvider>
            <CalendarProvider>
              <Router>
                <AppRoutes />
                <GlobalErrorModal />
              </Router>
            </CalendarProvider>
          </TodoProvider>
        </AuthProvider>
      </StyleProvider>
    </ErrorProvider>
  );
}

export default App;
