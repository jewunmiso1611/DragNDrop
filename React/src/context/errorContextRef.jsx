// 전역적으로 접근 가능한 에러 setter 저장소
export const errorContextRef = {
  set: () => { }, // 초기 dummy
};

// setError를 외부에 바인딩하는 함수
export function bindErrorSetter(setter) {
  errorContextRef.set = (newError) => {
    if (typeof newError === "string") {
      // 문자열만 넘어오면 기본 에러로 처리
      setter({
        show: true,
        message: newError,
        type: "error",
      });
    } else {
      // 객체 형식이면 그대로 적용 (message, type 등 포함)
      setter({
        show: true,
        ...newError,
      });
    }
  };
}

