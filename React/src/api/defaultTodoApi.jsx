import axiosInstance from './axiosInstance';

/**
 * [GET] 기본 카드 목록 조회 (공용 + 유저용)
 * @returns {DefaultTodoDTO[]}
 */
export const fetchDefaultCards = async () => {
  const res = await axiosInstance.get('/default-todo/list');
  return res.data;
};

/**
 * [POST] 기본 카드 생성
 * @param {DefaultTodoDTO} dto
 */
export const createDefaultCards = async (dto) => {
  const res = await axiosInstance.post('/default-todo/new', dto);
  return res.data;
};

/**
 * [PUT] 기본 카드 수정
 * @param {number} dno
 * @param {DefaultTodoDTO} dto
 */
export const updateDefaultCards = async (dno, dto) => {
  const res = await axiosInstance.put(`/default-todo/${dno}`, dto);
  return res.data;
};

/**
 * [DELETE] 기본 카드 삭제
 * @param {number} dno
 */
export const deleteDefaultCards = async (dno) => {
  const res = await axiosInstance.delete(`/default-todo/${dno}`);
  return res.data;
};

/**
 * [POST] 지정된 기본 카드 1개를, 기간과 요일 조건에 따라 자동 등록
 * @param {object} dto - AutoInsertDTO 형식
 * {
 *   dno: number,
 *   startDate: string (yyyy-MM-dd),
 *   endDate: string (yyyy-MM-dd),
 *   days: string[],  // ["Mon", "Wed", "Fri"]
 *   startTime: string (HH:mm:ss), // ✅ 추가됨
 *   endTime: string (HH:mm:ss),   // ✅ 추가됨
 *   memberUno: number
 * }
 */
export const insertDefaultTodosByDates = async (dto) => {
  const res = await axiosInstance.post('/default-todo/auto-insert', dto);
  return res.data;
};
