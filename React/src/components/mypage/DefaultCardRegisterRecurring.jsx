// src/components/default/DefaultCardRegisterRecurring.jsx
import React, { useState, useEffect, useContext } from 'react';
import { fetchDefaultCards } from '../../api/defaultTodoApi';
import { createRecurringTodo } from '../../api/RecurringTodoApi'; // 오타가 있었네요, RecurringTodoApi (r 대문자)로 수정
import { AuthContext } from '../../context/AuthContext';
import { errorContextRef } from '../../context/errorContextRef';
import { useStyle } from '../../context/StyleContext';

const DefaultCardRegisterRecurring = () => {
    const { user } = useContext(AuthContext);
    const { getGradeStyle } = useStyle();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedDno, setSelectedDno] = useState(null);
    const [defaultCards, setDefaultCards] = useState([]);

    const dayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDayChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => dayOptions.indexOf(a) - dayOptions.indexOf(b))
        );
    };

    const toTimeWithSeconds = (time) => {
        return time && time.length === 5 ? `${time}:00` : time;
    };

    const dayMap = {
        Sun: 'SUNDAY',
        Mon: 'MONDAY',
        Tue: 'TUESDAY',
        Wed: 'WEDNESDAY',
        Thu: 'THURSDAY',
        Fri: 'FRIDAY',
        Sat: 'SATURDAY',
    };

    const handleRegister = async () => {
        if (!selectedDno || !startDate || !endDate || selectedDays.length === 0) {
            errorContextRef.set({ show: true, message: '카드, 날짜, 요일을 모두 선택하세요.' });
            return;
        }

        const card = defaultCards.find((c) => c.dno === selectedDno);
        if (!card) {
            errorContextRef.set({ show: true, message: '선택된 기본 카드 정보를 찾을 수 없습니다.' });
            return;
        }

        const dto = {
            title: card.title,
            content: card.content,
            grade: card.grade,
            startDate,
            endDate,
            dayOfWeek: selectedDays.map((d) => dayMap[d]).join(','),
            repeatType: 'WEEKLY',
            startTime: toTimeWithSeconds(startTime),
            endTime: toTimeWithSeconds(endTime),
            // ✅ IS_ACTIVE를 1로 설정하기 위해 isActive: true 추가
            isActive: true,
        };

        try {
            await createRecurringTodo(dto);
            errorContextRef.set({ show: true, message: '✅ 반복 일정이 등록되었습니다.' });
            // 성공 후 입력 필드 초기화
            setStartDate('');
            setEndDate('');
            setStartTime('');
            setEndTime('');
            setSelectedDays([]);
            setSelectedDno(null);
        } catch (err) {
            console.error("반복 일정 등록 오류:", err); // 상세 오류 로깅
            errorContextRef.set({ show: true, message: '⚠️ 등록 중 오류가 발생했습니다.' });
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchDefaultCards();
                setDefaultCards(data);
            } catch (err) {
                console.error("기본 카드 불러오기 실패:", err); // 상세 오류 로깅
                errorContextRef.set({ show: true, message: '기본 카드 불러오기 실패' });
            }
        };
        load();
    }, []);

    const selectedCard = defaultCards.find((c) => c.dno === selectedDno);
    const style = selectedCard ? getGradeStyle(selectedCard.grade) : {};

    return (
        <div
            className="mb-5 default-card-register-container"
            style={{
                maxWidth: '800px',
                marginLeft: 'calc(100px)',
                marginRight: 'auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
            }}
        >
            <div className="container mt-4">
                <h4 className="fw-bold mb-4">반복 일정 등록</h4>

                <div className="row mb-3 g-2">
                    <div className="col-md-6">
                        <label className="form-label">시작일</label>
                        <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">종료일</label>
                        <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="row mb-3 g-2">
                    <div className="col-md-6">
                        <label className="form-label">시작 시간</label>
                        <select className="form-select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                            <option value="">선택</option>
                            {Array.from({ length: 48 }, (_, i) => {
                                const hour = String(Math.floor(i / 2)).padStart(2, '0');
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour}:${minute}`;
                                return <option key={time} value={time}>{time}</option>;
                            })}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">종료 시간</label>
                        <select className="form-select" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                            <option value="">선택</option>
                            {Array.from({ length: 48 }, (_, i) => {
                                const hour = String(Math.floor(i / 2)).padStart(2, '0');
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour}:${minute}`;
                                return <option key={time} value={time}>{time}</option>;
                            })}
                        </select>
                    </div>
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                    <label className="form-label">적용 요일</label>
                    <div className="d-flex flex-wrap gap-2">
                        {dayOptions.map((day) => (
                            <div key={day} className="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`day-${day}`}
                                    checked={selectedDays.includes(day)}
                                    onChange={() => handleDayChange(day)}
                                />
                                <label className="form-check-label" htmlFor={`day-${day}`}>{day}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                    <label className="form-label">기본 카드 선택</label>
                    <div className="d-flex flex-wrap gap-2">
                        {defaultCards.map((card) => {
                            const isSelected = selectedDno === card.dno;
                            const cardStyle = getGradeStyle(card.grade);

                            return (
                                <button
                                    key={card.dno}
                                    className={`btn btn-sm fw-bold ${isSelected ? 'btn-primary' : ''}`}
                                    onClick={() => setSelectedDno(card.dno)}
                                    style={
                                        isSelected
                                            ? {}
                                            : {
                                                borderColor: cardStyle.borderColor,
                                                color: cardStyle.textColor,
                                                borderWidth: '2px',
                                                borderStyle: 'solid',
                                            }
                                    }
                                >
                                    {card.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <hr className="my-4" />

                <div className="text-center mt-4">
                    <button className="btn btn-primary" onClick={handleRegister}>반복 일정 등록</button>
                </div>
            </div>
        </div>
    );
};

export default DefaultCardRegisterRecurring;