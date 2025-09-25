// src/api/calendarApi.js
import axiosInstance from "./axiosInstance";

/**
 * 캘린더에 드래그한 투두 저장
 * @param {Object} param0 - tdno, memberUno, startDate, endDate, title, grade
 * @returns 저장된 CalendarTodoDTO
 */
export const postCalendarTodo = async ({ tdno, memberUno, startDate, endDate, title,content, grade, dailyTimes }) => {
  try {
    const res = await axiosInstance.post("/calendar", {
      tdno,
      memberUno,
      startDate,
      endDate,
      title,
      content,
      grade,
      dailyTimes,
    });
    return res.data;
  } catch (err) {
    console.error("❌ CalendarTodo 저장 실패", err);
    throw err;
  }
};

/**
 * 로그인한 유저의 전체 캘린더 일정 불러오기
 * @param {number} memberUno
 * @returns CalendarTodoDTO 배열
 */
export const getCalendarTodos = async (memberUno) => {
  try {
    const res = await axiosInstance.get(`/calendar/list/${memberUno}`);
    return res.data;
  } catch (err) {
    console.error("❌ CalendarTodo 목록 불러오기 실패", err);
    throw err;
  }
};

// ✅ 일정 불러오기
export const fetchCalendarTodoList = async (memberUno) => {
  try {
    const res = await axiosInstance.get(`/calendar/list/${memberUno}`);
    return res.data;
  } catch (err) {
    console.error("❌ 일정 불러오기 실패", err);
    throw err;
  }
};

export const updateCalendarTodo = async ({ tdno, startDate, endDate, dailyTimes }) => {
  try {
    await axiosInstance.put("/calendar/update", { tdno, startDate, endDate, dailyTimes });
  } catch (err) {
    console.error("❌ CalendarTodo 날짜 수정 실패", err);
    throw err;
  }
};

export const fetchTodoByDate = async (memberUno, dateStr) => {
  try {
    const res = await axiosInstance.get('/calendar/todo', {
      params: {
        memberUno: memberUno,
        targetDate: dateStr,
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ 날짜별 CalendarTodo 조회 실패", err);
    throw err;
  }
};

export const fetchCalendarTodoById = async (tdno, memberUno) => {
    const response = await fetch(`/api/todos/${tdno}?memberUno=${memberUno}`);
    if (!response.ok) {
        throw new Error('Todo not found');
    }
    return response.json();
};

export const updateTodo = async (todo) => {
  const res = await axiosInstance.put(`/todo?uno=${todo.memberUno}`, todo);
  return res.data;
};

export const editCalendarTodo = async (todo) => {
  const res = await axiosInstance.put('/calendar/edit', todo);
  return res.data;
};

export const deleteCalendarTodo = async (tdno) => {
  return await axiosInstance.delete(`/calendar/${tdno}`);
};


export const updateTodoDone = async (tdno, isDone) => {
  return axiosInstance.put(`/calendar/done/${tdno}`, null, {
    params: { done: isDone }, // ✅ 이게 필수야!
  });
};