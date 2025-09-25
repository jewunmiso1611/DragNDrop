// src/api/globalErrorHandler.js

import { errorMessages } from '../api/errorMessages';
import { errorContextRef } from './errorContextRef';

export const errorHandler = (error) => {
  const errorData = error.response?.data;
  const errorCode = errorData?.code || "SERVER_ERROR";

  const message = errorMessages[errorCode] || "알 수 없는 오류입니다.";

  // 모달 띄우기 (ErrorContext 사용)
  const context = errorContextRef.current;
  if (context) {
    context.setError({ show: true, message });
  }

  return Promise.reject(error); // 필요 시
};
