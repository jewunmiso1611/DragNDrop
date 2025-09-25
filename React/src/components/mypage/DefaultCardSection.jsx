import React, { useEffect, useState, useContext } from 'react';
import { errorContextRef } from '../../context/errorContextRef';
import { AuthContext } from '../../context/AuthContext';
import { useStyle } from '../../context/StyleContext';
import {
    fetchDefaultCards,
    updateDefaultCards,
    deleteDefaultCards,
    createDefaultCards,
} from '../../api/defaultTodoApi';

const DefaultCardSection = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [newCardVisible, setNewCardVisible] = useState(false);
    const { getGradeStyle } = useStyle();
    const [newCard, setNewCard] = useState({
        title: '',
        content: '',
        grade: 1,
        dayOfWeek: '',
    });

    const getStarRating = (grade) => '⭐'.repeat(grade);

    const showError = (msg) => {
        errorContextRef.set({ show: true, message: msg });
    };

    const loadCards = async () => {
        try {
            const data = await fetchDefaultCards();
            setCards(data);
        } catch (err) {
            console.error('❌ 기본 카드 조회 실패:', err);
            showError('기본 카드 목록을 불러오는 데 실패했습니다.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 submit 방지
            handleCreate();     // 카드 등록 실행
        }
    };

    const handleCreate = async () => {
        if (!user || !user.uno) {
            showError('⛔ 로그인 정보를 확인할 수 없습니다.');
            return;
        }

        // ✅ 기본 카드 10개 초과 시 제한
        if (cards.length >= 10) {
            showError('⚠️ 기본 카드는 최대 10개까지 \n 등록할 수 있습니다.');
            return;
        }

        // ✅ 제목 필수 검사 (프론트에서 선제 처리)
        if (!newCard.title.trim()) {
            showError('⚠️ 제목은 필수입니다.');
            return;
        }

        try {
            const payload = {
                ...newCard,
                memberUno: user.uno,
            };

            console.log('💬 등록 요청 데이터:', payload);
            await createDefaultCards(payload);

            // 성공 후 초기화 및 다시 불러오기
            setNewCard({ title: '', content: '', grade: 1, dayOfWeek: '' });
            loadCards();
        } catch (err) {
            console.error('❌ 등록 실패:', err);

            // ✅ 서버 응답 메시지가 있을 경우
            const msg = err?.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
            showError(`❌ ${msg}`);
        }
    };


    const handleDelete = (dno) => {
        errorContextRef.set({
            show: true,
            message: '정말 삭제하시겠습니까?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await deleteDefaultCards(dno);
                    await loadCards(); // ✅ 삭제 후 목록 갱신
                } catch (err) {
                    console.error('❌ 삭제 실패:', err);
                    const msg = err?.response?.data?.message || '카드 삭제 중 오류가 발생했습니다.';
                    errorContextRef.set({
                        show: true,
                        message: `❌ ${msg}`,
                        type: 'alert',
                    });
                }
            },
        });
    };

    const handleChange = (index, e, isNew = false) => {
        const { name, value } = e.target;

        if (isNew) {
            setNewCard((prev) => ({
                ...prev,
                [name]: name === 'grade' ? Number(value) : value,
            }));
            return;
        }

        setCards((prev) => {
            const newCards = [...prev];
            newCards[index] = {
                ...newCards[index],
                [name]: name === 'grade' ? Number(value) : value,
            };
            return newCards;
        });
    };

    const handleSave = async (dno, updatedCard) => {
        try {
            await updateDefaultCards(dno, updatedCard);
            showError('✅ 카드가 수정되었습니다.');
        } catch (err) {
            console.error('❌ 수정 실패:', err);
            const msg = err?.response?.data?.message || '카드 수정 중 오류가 발생했습니다.';
            showError(`❌ ${msg}`);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    return (
        <div
            className="mb-5 default-card-section-container"
            style={{
                maxWidth: '1500px',
                marginLeft: 'calc(100px)',
                marginRight: 'auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
            }}
        >
            <h4 className="mb-4 fw-bold">기본 카드 목록</h4>

            <div className="text-end mb-3">
                <button
                    className={`btn ${newCardVisible ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setNewCardVisible((prev) => !prev)}
                >
                    + 기본 카드 추가
                </button>
            </div>

            {newCardVisible && (
                <>
                    {/* ✅ 구분 텍스트 추가 */}
                    <div
                        className="mb-2 text-muted fw-semibold small"
                        style={{
                            paddingLeft: '4px',
                            fontSize: '1.1rem',
                            fontweight: '600',
                            color: '#495057',
                        }}
                    >
                        카드 정보 입력
                    </div>

                    <div
                        className="card mb-3 p-3"
                        style={{
                            backgroundColor: getGradeStyle(newCard.grade).backgroundColor,
                            borderColor: getGradeStyle(newCard.grade).borderColor,
                            color: getGradeStyle(newCard.grade).textColor,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                        }}
                    >
                        <div className="row g-2">
                            <div className="col-md-2 mb-2">
                                <label className="form-label">제목</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={newCard.title}
                                    onChange={(e) => handleChange(0, e, true)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label">내용</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="content"
                                    value={newCard.content}
                                    onChange={(e) => handleChange(0, e, true)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <label className="form-label">중요도</label>
                                <select
                                    className="form-select"
                                    name="grade"
                                    value={newCard.grade}
                                    onChange={(e) => handleChange(0, e, true)}
                                    onKeyDown={handleKeyDown}
                                >
                                    {[1, 2, 3, 4, 5].map((g) => (
                                        <option key={g} value={g}>
                                            {'⭐'.repeat(g)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2 mb-2 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={handleCreate}>
                                    등록
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                </>
            )}

            {cards
                .filter((card) => card && card.title !== undefined)
                .map((card, index) => {
                    const style = getGradeStyle(card.grade); // ✅ 중요도에 따른 색상 스타일 추출

                    return (
                        <div
                            className="card mb-3 p-3 default-card-item"
                            key={card.dno}
                            style={{
                                backgroundColor: style.backgroundColor,
                                borderColor: style.borderColor,
                                color: style.textColor,
                                borderWidth: '1px',
                                borderStyle: 'solid',
                            }}
                        >
                            <div className="row g-2">
                                <div className="col-md-2 mb-2">
                                    <label className="form-label">제목</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={card.title || ''}
                                        onChange={(e) => handleChange(index, e)}
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">내용</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="content"
                                        value={card.content || ''}
                                        onChange={(e) => handleChange(index, e)}
                                    />
                                </div>
                                <div className="col-md-2 mb-2">
                                    <label className="form-label">중요도</label>
                                    <select
                                        className="form-select"
                                        name="grade"
                                        value={card.grade || 1}
                                        onChange={(e) => handleChange(index, e)}
                                    >
                                        {[1, 2, 3, 4, 5].map((g) => (
                                            <option key={g} value={g}>
                                                {'⭐'.repeat(g)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2 mb-2 d-flex gap-2 align-items-end">
                                    <button
                                        className="btn btn-primary w-50"
                                        onClick={() => handleSave(card.dno, card)}
                                    >
                                        수정
                                    </button>
                                    <button
                                        className="btn btn-outline-danger w-50"
                                        onClick={() => handleDelete(card.dno)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default DefaultCardSection;
