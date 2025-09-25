// src/api/recurringTodoApi.js
import axiosInstance from './axiosInstance'; // ✅ JWT 설정 포함된 인스턴스

// 🔹 반복 일정 생성
export const createRecurringTodo = async (dto) => {
  const res = await axiosInstance.post('/recurring-todo', dto);
  return res.data;
};

// 🔹 반복 일정 전체 조회
export const fetchRecurringTodos = async () => {
  const res = await axiosInstance.get('/recurring-todo');
  return res.data;
};

// 🔹 특정 rno 반복 일정 조회
export const fetchRecurringTodoById = async (rno) => {
  const res = await axiosInstance.get(`/recurring-todo/${rno}`);
  return res.data;
};

// 🔹 특정 rno + 날짜로 반복 일정 + tdno 조회 ✅ 추가
export const fetchRecurringTodoWithTdno = async (rno, dateStr) => {
  const res = await axiosInstance.get(`/recurring-todo/${rno}/with-tdno`, {
    params: { date: dateStr },
  });
  return res.data;
};

// 🔹 반복 일정 수정
export const updateRecurringTodo = async (rno, dto) => {
  const res = await axiosInstance.put(`/recurring-todo/${rno}`, dto);
  return res.data;
};

// 🔹 반복 일정 삭제
export const deleteRecurringTodo = async (rno) => {
  const res = await axiosInstance.delete(`/recurring-todo/${rno}`);
  return res.data;
};
