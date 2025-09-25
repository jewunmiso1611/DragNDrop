import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { errorContextRef } from '../../context/errorContextRef';
import { fetchMemberInfo, updateMemberInfo } from '../../api/mypageApi'; // ✅ API 모듈
import { errorMessages } from '../../api/errorMessages';

const InfoSection = () => {
    const { user } = useContext(AuthContext);
    const [info, setInfo] = useState({
        userid: '',
        nickname: '',
        email: '',
        gender: '',
    });

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [newPwCheck, setNewPwCheck] = useState('');
    const [newPwValid, setNewPwValid] = useState(false);
    const [newPwError, setNewPwError] = useState('');

    const loadUserInfo = async () => {
        try {
            const data = await fetchMemberInfo(user.userid); // ✅ API 호출
            setInfo(data);
        } catch (err) {
            errorContextRef.set({ show: true, message: '회원 정보 조회 실패' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        const pwRegex = /^[a-zA-Z0-9]{6,16}$/;

        if (currentPw || newPw || newPwCheck) {
            // 1️⃣ 필수 입력 체크
            if (!currentPw || !newPw || !newPwCheck) {
                errorContextRef.set({ show: true, message: '비밀번호 변경 시 모든 항목을 입력하세요.' });
                return;
            }

            // 2️⃣ 새 비밀번호 형식 체크
            if (!pwRegex.test(newPw)) {
                errorContextRef.set({ show: true, message: '새 비밀번호는 영문자+숫자 6~16자여야 합니다.' });
                return;
            }

            // 3️⃣ 비밀번호 일치 확인
            if (newPw !== newPwCheck) {
                errorContextRef.set({ show: true, message: '새 비밀번호가 일치하지 않습니다.' });
                return;
            }
        }

        try {
            await updateMemberInfo({
                ...info,
                userpw: currentPw,
                newUserpw: newPw,
            });

            errorContextRef.set({ show: true, message: '회원 정보가 수정되었습니다.' });

            // 비밀번호 필드 초기화
            setCurrentPw('');
            setNewPw('');
            setNewPwCheck('');
        } catch (err) {
            const code = err.response?.data?.code;
            if (code && errorMessages[code]) {
                errorContextRef.set({ show: true, message: errorMessages[code] });
            } else {
                errorContextRef.set({ show: true, message: '알 수 없는 오류가 발생했습니다.' });
            }
        }
    };


    useEffect(() => {
        if (user?.userid) loadUserInfo();
    }, [user]);

    useEffect(() => {
        const pwRegex = /^[a-zA-Z0-9]{6,16}$/;

        if (!newPw) {
            setNewPwError('');
            setNewPwValid(false);
        } else if (!pwRegex.test(newPw)) {
            setNewPwError('비밀번호는 영문자+숫자 6~16자여야 합니다.');
            setNewPwValid(false);
        } else {
            setNewPwError('사용 가능한 비밀번호입니다!');
            setNewPwValid(true);
        }
    }, [newPw]);

    return (
        <div
            className="mb-5"
            // ⭐ 이 부분에 스타일을 추가합니다. ⭐
            style={{
                maxWidth: '400px', // 여전히 너비는 제한
                marginLeft: 'calc(10% + 200px)', // 왼쪽 여백을 10% + 50px로 설정 (조절 가능)
                marginRight: 'auto', // 오른쪽 여백은 자동으로
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff'
            }}
        >
            <h4 className="mb-4 fw-bold">내 정보 수정</h4> {/* 제목 스타일 조정 */}
            <div className="mb-3">
                <label className="form-label">닉네임</label>
                <input type="text" className="form-control bg-light border" name="nickname" value={info.nickname} onChange={handleChange} /> {/* 입력 필드 스타일 조정 */}
            </div>

            <div className="mb-3">
                <label className="form-label">이메일</label>
                <input type="email" className="form-control bg-light border" name="email" value={info.email} onChange={handleChange} readOnly /> {/* 읽기 전용 스타일 */}
            </div>

            <div className="mb-3">
                <label className="form-label">성별</label>
                <select className="form-select bg-light border" name="gender" value={info.gender} onChange={handleChange}> {/* 드롭다운 스타일 조정 */}
                    <option value="">선택</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                </select>
            </div>

            <hr className="my-4" />
            <h5 className="mb-3 fw-bold">비밀번호 변경 (선택)</h5> {/* 비밀번호 변경 제목 스타일 */}
            <div className="mb-3">
                <label className="form-label">현재 비밀번호</label>
                <input
                    type="password"
                    className="form-control bg-light border"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">새 비밀번호</label>
                <input
                    type="password"
                    className="form-control bg-light border"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                />
                {newPw && (
                    <small className={newPwValid ? 'text-success' : 'text-danger'}>
                        {newPwError}
                    </small>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">새 비밀번호 확인</label>
                <input
                    type="password"
                    className="form-control bg-light border"
                    value={newPwCheck}
                    onChange={(e) => setNewPwCheck(e.target.value)}
                />
            </div>

            <button className="btn btn-primary me-2" onClick={handleUpdate}> {/* "수정하기" 버튼 스타일 */}
                수정하기
            </button>
            <button className="btn btn-secondary"> {/* "취소" 버튼 스타일 */}
                취소
            </button>
        </div>
    );
};


export default InfoSection;
