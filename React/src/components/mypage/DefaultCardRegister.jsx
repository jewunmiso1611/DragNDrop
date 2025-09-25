import React, { useState, useContext, useEffect } from 'react';
import { insertDefaultTodosByDates, fetchDefaultCards } from '../../api/defaultTodoApi';
import { AuthContext } from '../../context/AuthContext';
import { errorContextRef } from '../../context/errorContextRef';
import { useStyle } from '../../context/StyleContext';

const DefaultCardRegister = () => {
    const { user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedDno, setSelectedDno] = useState(null);
    const [defaultCards, setDefaultCards] = useState([]);
    const { getGradeStyle } = useStyle();

    // ✅ 시간 상태 추가
    const [startTime, setStartTime] = useState(''); // HH:mm 형식 문자열
    const [endTime, setEndTime] = useState('');   // HH:mm 형식 문자열

    const dayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDayChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // ✅ 등록 버튼 로직
    const handleRegister = async () => {
        if (!selectedDno || !startDate || !endDate || selectedDays.length === 0) {
            errorContextRef.set({ show: true, message: '카드, 날짜, 요일을 모두 선택하세요.' });
            return;
        }

        const dto = {
            dno: selectedDno,
            startDate,
            endDate,
            days: selectedDays,
            memberUno: user.uno,
            startTime: startTime === '' ? null : startTime, // ✅ 시간 값 포함 (비어있으면 null)
            endTime: endTime === '' ? null : endTime,       // ✅ 시간 값 포함 (비어있으면 null)
        };

        try {
            await insertDefaultTodosByDates(dto); // ✅ API 연결 완료
            errorContextRef.set({ show: true, message: '기본 카드가 자동 등록되었습니다.' });

            // 초기화
            setSelectedDno(null);
            setStartDate('');
            setEndDate('');
            setSelectedDays([]);
            setStartTime(''); // ✅ 시간 상태 초기화
            setEndTime('');   // ✅ 시간 상태 초기화
        } catch (err) {
            errorContextRef.set({ show: true, message: '자동 등록 실패' });
        }
    };


    useEffect(() => {
        const loadCards = async () => {
            try {
                const data = await fetchDefaultCards(); // ✅ 여기 참조
                setDefaultCards(data);
            } catch (err) {
                errorContextRef.set({ show: true, message: '기본 카드 불러오기 실패' });
            }
        };
        loadCards();
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
            <h4 className="mb-4 fw-bold">기본 카드 커스텀 등록</h4>

            <div className="row mb-3 g-2">
                <div className="col-md-6">
                    <label className="form-label">시작일</label>
                    <input
                        type="date"
                        className="form-control bg-light border"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">종료일</label>
                    <input
                        type="date"
                        className="form-control bg-light border"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {/* ✅ 시간 입력 필드 추가 */}
            <div className="row mb-3 g-2">
                <div className="col-md-6">
                    <label className="form-label">시작 시간</label>
                    <select
                        className="form-select bg-light border"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    >
                        {Array.from({ length: 48 }, (_, i) => {
                            const hour = String(Math.floor(i / 2)).padStart(2, "0");
                            const minute = i % 2 === 0 ? "00" : "30";
                            const time = `${hour}:${minute}`;
                            return (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">종료 시간</label>
                    <select
                        className="form-select bg-light border"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    >
                        {Array.from({ length: 48 }, (_, i) => {
                            const hour = String(Math.floor(i / 2)).padStart(2, "0");
                            const minute = i % 2 === 0 ? "00" : "30";
                            const time = `${hour}:${minute}`;
                            return (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* ✅ 시간 입력 필드 끝 */}

            <hr className="my-4" />

            <div className="mb-3">
                <label className="form-label">적용할 요일</label> {/* form-label 클래스 추가 */}
                <div className="d-flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                        <div key={day} className="form-check form-check-inline default-day-checkbox">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`register-day-${day}`} // id 고유성 확보 (기존 DefaultCardSection과 겹치지 않도록)
                                checked={selectedDays.includes(day)}
                                onChange={() => handleDayChange(day)}
                            />
                            <label className="form-check-label" htmlFor={`register-day-${day}`}>{day}</label>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-4" />

            {/* ✅ 기본 카드 선택 영역 추가 */}
            <div className="mb-3">
                <label className="form-label">기본 카드 선택</label>
                <div className="d-flex flex-wrap gap-2">
                    {defaultCards.map((card) => {
                        const gradeStyle = getGradeStyle(card.grade);
                        const isSelected = selectedDno === card.dno;

                        return (
                            <button
                                key={card.dno}
                                className={`btn btn-sm fw-bold ${isSelected ? 'btn-primary' : ''}`}
                                onClick={() => setSelectedDno(card.dno)}
                                style={
                                    isSelected
                                        ? {} // 선택됐을 땐 Bootstrap 기본 파랑
                                        : {
                                            borderColor: gradeStyle.borderColor,
                                            color: gradeStyle.textColor,
                                            color: '#6c757d',
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

            <div className="text-center">
                <button className="btn btn-primary mt-2" onClick={handleRegister}> {/* 버튼 스타일 통일 */}
                    등록
                </button>
            </div>
        </div>
    );
};

export default DefaultCardRegister;