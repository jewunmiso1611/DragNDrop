import { useRef } from 'react';

export const useLock = () => {
  const isLocked = useRef(false);

  const acquireUpdateLock = async (fn) => {
    if (isLocked.current) {
      console.warn("🚫 중복 실행 방지됨");
      return false;
    }

    isLocked.current = true;
    try {
      await fn();
    } finally {
      isLocked.current = false;
    }
    return true;
  };

  return { acquireUpdateLock };
};
