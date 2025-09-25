import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { errorContextRef } from '../../context/errorContextRef';
import { deleteMember } from '../../api/mypageApi';

const DeleteAccount = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDelete = () => {
    errorContextRef.set({
      show: true,
      type: 'confirm',
      message: '정말로 탈퇴하시겠습니까? 복구할 수 없습니다.',
      onConfirm: async () => {
        try {
          await deleteMember(user.userid); // ✅ API 호출
          logout(); // ✅ 로그아웃 처리
          errorContextRef.set({
            show: true,
            type: 'alert',
            message: '탈퇴가 완료되었습니다.',
          });
          navigate('/login');
        } catch (err) {
          console.error('❌ 탈퇴 실패:', err);
          const msg = err?.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.';
          errorContextRef.set({
            show: true,
            type: 'alert',
            message: `❌ ${msg}`,
          });
        }
      },
    });
  };

  return (
    <div className="mt-4 text-end">
      <button className="btn btn-outline-danger" onClick={handleDelete}>
        회원 탈퇴
      </button>
    </div>
  );
};

export default DeleteAccount;
