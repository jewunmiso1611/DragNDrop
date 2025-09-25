// src/context/ErrorProvider.jsx

import React, { createContext, useState, useEffect } from "react";
import { bindErrorSetter } from "./errorContextRef";

// 에러 컨텍스트 생성
export const ErrorContext = createContext();

// ErrorProvider 컴포넌트
export default function ErrorProvider({ children }) {
  const [error, setError] = useState({
    show: false,
    message: '',
    type: 'error', // 'success'도 가능하게
  });

  useEffect(() => {
    bindErrorSetter(setError); // 전역에서 사용할 수 있게 바인딩
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
}
