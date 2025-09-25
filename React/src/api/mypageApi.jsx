import axiosInstance from './axiosInstance';

/**
 * [GET] 회원 정보 가져오기
 * @param {string} userid
 * @returns {MemberDTO}
 */
export const fetchMemberInfo = async (userid) => {
  const res = await axiosInstance.get('/mypage/info', {
    params: { userid },
  });
  return res.data;
};

/**
 * [PUT] 회원 정보 수정
 * @param {MemberDTO} dto
 */
export const updateMemberInfo = async (dto) => {
  const res = await axiosInstance.put('/mypage/update', dto);
  return res.data;
};

/**
 * [DELETE] 회원 탈퇴
 * @param {string} userid
 */
export const deleteMember = async (userid) => {
  const res = await axiosInstance.delete('/mypage/delete', {
    params: { userid },
  });
  return res.data;
};

/**
 * [GET] 마이페이지에서 내 주요 일정 불러오기
 */
export const fetchCalendarTodos = async (uno) => {
  const res = await axiosInstance.get(`/calendar/list/${uno}`);
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
 *   memberUno: number
 * }
 */
export const insertDefaultTodosByDates = async (dto) => {
  const res = await axiosInstance.post('/default-todo/auto-insert', dto);
  return res.data;
};
