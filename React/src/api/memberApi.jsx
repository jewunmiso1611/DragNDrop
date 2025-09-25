import axiosInstance from './axiosInstance';

export const loginMember = async (userid, userpw) => {
    const response = await axiosInstance.post('/member/login', { userid, userpw });
    return response.data; // { token, user }
};

// 아이디 찾기 API
export const findUserIdByEmail = async (email) => {
    const response = await axiosInstance.get('/member/find-id', {
        params: { email },
    });
    return response.data; // { userids: [...] }
};

// 비밀번호 찾기 API
export const findPassword = async (userid, email) => {
    const response = await axiosInstance.get('/member/find-pw', {
        params: { userid, email },
    });
    return response.data; // 예: { message: "비밀번호를 재설정하세요." }
};

// 아이디 중복 체크
export const checkUserId = async (userid) => {
    const response = await axiosInstance.get('/member/check-id', {
        params: { userid }
    });
    return response.data; // true/false
};

// 회원가입
export const registerMember = async (formData) => {
    const response = await axiosInstance.post('/member/register', formData);
    return response.data;
};

// 비밀번호 재설정
export const resetPassword = async (userid, email, userpw) => {
    const response = await axiosInstance.post('/member/reset-pw', {
        userid,
        email,
        userpw,
    });
    return response.data;
};
