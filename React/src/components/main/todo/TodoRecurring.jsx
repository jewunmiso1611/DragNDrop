// src/components/recurring/TodoRecurring.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { errorContextRef } from '../../../context/errorContextRef';
// 업데이트된 API 경로
import { fetchRecurringTodos, updateRecurringTodo, deleteRecurringTodo, fetchRecurringTodoById } from '../../../api/RecurringTodoApi'; // 경로는 실제 맞게 조정

const TodoRecurring = ({ rno }) => {
    const { user } = useContext(AuthContext);
    const [recurringTodo, setRecurringTodo] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // 내부 상태로 관리하여 즉시 UI 반영 및 유효성 검사
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [grade, setGrade] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState(''); // HH:mm:ss 형식으로 관리
    const [endTime, setEndTime] = useState('');     // HH:mm:ss 형식으로 관리
    const [selectedDays, setSelectedDays] = useState([]);

    const dayOptions = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // 백엔드 enum과 프론트엔드 약어를 매핑
    const dayMap = {
        Sun: 'SUNDAY',
        Mon: 'MONDAY',
        Tue: 'TUESDAY',
        Wed: 'WEDNESDAY',
        Thu: 'THURSDAY',
        Fri: 'FRIDAY',
        Sat: 'SATURDAY',
        SUNDAY: 'Sun',
        MONDAY: 'Mon',
        TUESDAY: 'Tue',
        WEDNESDAY: 'Wed',
        THURSDAY: 'Thu',
        FRIDAY: 'Fri',
        SATURDAY: 'Sat',
    };

    useEffect(() => {
        const loadRecurringTodo = async () => {
            if (rno) {
                try {
                    // Assuming fetchRecurringTodoById exists and returns data matching RecurringTodoDTO
                    const data = await fetchRecurringTodoById(rno);
                    console.log(data);
                    setRecurringTodo(data);
                    // 상태 초기화
                    setTitle(data.title || '');
                    setContent(data.content || '');
                    setGrade(data.grade || 1);
                    setStartDate(data.startDate || '');
                    setEndDate(data.endDate || '');
                    // DTO에서 받은 LocalTime (HH:mm:ss) 값을 그대로 상태에 저장
                    setStartTime(data.startTime || '');
                    setEndTime(data.endTime || '');
                    setSelectedDays(data.dayOfWeek ? data.dayOfWeek.split(',').map(day => dayMap[day.trim()]) : []);
                } catch (err) {
                    console.error('반복 일정 불러오기 실패:', err);
                    errorContextRef.set({ show: true, message: '반복 일정을 불러오는데 실패했습니다.', type: 'error' });
                }
            }
        };
        loadRecurringTodo();
    }, [rno]);

    // HH:mm 형식의 시간을 HH:mm:00 형식으로 변환 (백엔드 전송용)
    const toTimeWithSeconds = (time) => {
        return time && time.length === 5 ? `${time}:00` : time;
    };

    // HH:mm:ss 형식의 시간을 HH:mm 형식으로 변환 (UI 표시용)
    const toTimeWithoutSeconds = (time) => {
        return time ? time.substring(0, 5) : '';
    };

    const handleDayChange = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => dayOptions.indexOf(a) - dayOptions.indexOf(b))
        );
    };

    const validateInputs = () => {
        if (!title.trim()) {
            errorContextRef.set({ show: true, message: '제목을 입력해주세요.', type: 'error' });
            return false;
        }
        if (!startDate || !endDate) {
            errorContextRef.set({ show: true, message: '시작일과 종료일을 모두 입력해주세요.', type: 'error' });
            return false;
        }
        if (startDate > endDate) {
            errorContextRef.set({ show: true, message: '시작일은 종료일보다 늦을 수 없습니다.', type: 'error' });
            return false;
        }
        if (selectedDays.length === 0) {
            errorContextRef.set({ show: true, message: '적용 요일을 하나 이상 선택해주세요.', type: 'error' });
            return false;
        }
        if (startTime && endTime) {
            // 시간 비교 시 HH:mm:ss 전체를 사용하여 비교
            const start = new Date(`2000/01/01 ${startTime}`);
            const end = new Date(`2000/01/01 ${endTime}`);
            if (end < start) {
                errorContextRef.set({ show: true, message: '종료 시간은 시작 시간보다 빠를 수 없습니다.', type: 'error' });
                return false;
            }
        }
        return true;
    };

    const handleUpdateRecurringTodo = async () => {
        if (!validateInputs()) {
            return;
        }

        errorContextRef.set({
            show: true,
            type: 'confirm',
            message: '반복 일정 변경 내용을 저장하시겠습니까?',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const dto = {
                        title,
                        content,
                        grade,
                        startDate,
                        endDate,
                        dayOfWeek: selectedDays.map((d) => dayMap[d]).join(','),
                        repeatType: 'WEEKLY', // 고정값 (DefaultCardRegisterRecurring.jsx와 동일)
                        startTime: startTime, // 상태에 이미 HH:mm:ss로 저장되어 있으므로 그대로 사용
                        endTime: endTime,     // 상태에 이미 HH:mm:ss로 저장되어 있으므로 그대로 사용
                    };
                    // rno는 DTO에 포함되지 않고 URL Path Variable로 전달되므로 rno를 사용
                    await updateRecurringTodo(rno, dto);
                    errorContextRef.set({ show: true, message: '✅ 반복 일정이 성공적으로 업데이트되었습니다.', type: 'success' });
                    // UI 상태 업데이트
                    setRecurringTodo(prev => ({ ...prev, ...dto }));
                } catch (err) {
                    console.error('반복 일정 업데이트 실패:', err);
                    errorContextRef.set({ show: true, message: '⚠️ 반복 일정 업데이트 중 오류가 발생했습니다.', type: 'error' });
                } finally {
                    setIsSaving(false);
                }
            },
        });
    };

    const handleDeleteRecurringTodo = async () => {
        errorContextRef.set({
            show: true,
            type: 'confirm',
            message: '이 반복 일정을 정말 삭제하시겠어요? 모든 관련 일정이 삭제됩니다.',
            onConfirm: async () => {
                try {
                    // rno를 사용하여 deleteRecurringTodo 호출
                    await deleteRecurringTodo(rno);
                    errorContextRef.set({ show: true, message: '✅ 반복 일정이 성공적으로 삭제되었습니다.', type: 'success' });
                    setRecurringTodo(null); // UI에서 이 컴포넌트가 사라지도록
                    // 삭제 후 상위 컴포넌트에서 rno를 null로 설정하거나 목록을 새로고침하는 등의 로직 필요
                } catch (err) {
                    console.error('반복 일정 삭제 실패:', err);
                    errorContextRef.set({ show: true, message: '⚠️ 반복 일정 삭제 중 오류가 발생했습니다.', type: 'error' });
                }
            },
        });
    };

    // 시간 선택 select 박스용 옵션 생성 헬퍼 함수
    const generateTimeOptions = () => {
        const options = [];
        options.push(<option value="" key="default-time-option">-- 선택 --</option>);
        for (let i = 0; i < 48; i++) {
            const hour = String(Math.floor(i / 2)).padStart(2, '0');
            const minute = i % 2 === 0 ? '00' : '30';
            const label = `${hour}:${minute}`;         // 사용자에게 보여줄 형식
            const value = `${hour}:${minute}:00`;      // 내부 value로 저장될 형식 (백엔드 전송용)
            options.push(
                <option key={value} value={value}>
                    {label}
                </option>
            );
        }
        return options;
    };

    const gradeOptions = {
        1: '⭐',
        2: '⭐⭐',
        3: '⭐⭐⭐',
        4: '⭐⭐⭐⭐',
        5: '⭐⭐⭐⭐⭐',
    };

    if (!recurringTodo) {
        return <div className="text-center p-4">반복 일정을 불러오는 중이거나, 해당 일정이 없습니다.</div>;
    }

    return (
        <div className="card p-3 rounded mt-2 shadow-sm">
            <h6 className="fw-bold mb-3 text-dark">📝 반복 일정 상세 정보</h6>

            {/* 제목 */}
            <div className="mb-3">
                <label htmlFor={`recurring-title-${rno}`} className="form-label mb-1 fw-semibold small text-secondary">제목</label>
                <input
                    type="text"
                    id={`recurring-title-${rno}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-control form-control-sm"
                    placeholder="반복 일정 제목"
                />
            </div>

            {/* 내용 */}
            <div className="mb-3">
                <label htmlFor={`recurring-content-${rno}`} className="form-label mb-1 fw-semibold small text-secondary">내용</label>
                <textarea
                    id={`recurring-content-${rno}`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-control form-control-sm"
                    placeholder="내용 (선택)"
                    rows="3"
                />
            </div>

            {/* 중요도 */}
            <div className="mb-3">
                <label htmlFor={`recurring-grade-${rno}`} className="form-label mb-1 fw-semibold small text-secondary">중요도</label>
                <select
                    id={`recurring-grade-${rno}`}
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="form-select form-select-sm"
                >
                    {Object.keys(gradeOptions).map((gradeKey) => (
                        <option key={gradeKey} value={gradeKey}>
                            {gradeOptions[gradeKey]}
                        </option>
                    ))}
                </select>
            </div>

            {/* 시작일 */}
            <div className="mb-3">
                <label htmlFor={`recurring-startDate-${rno}`} className="form-label mb-1 fw-semibold small text-secondary">시작일</label>
                <input
                    type="date"
                    id={`recurring-startDate-${rno}`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control form-control-sm"
                />
            </div>

            {/* 종료일 */}
            <div className="mb-3">
                <label htmlFor={`recurring-endDate-${rno}`} className="form-label mb-1 fw-semibold small text-secondary">종료일</label>
                <input
                    type="date"
                    id={`recurring-endDate-${rno}`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control form-control-sm"
                />
            </div>

            <hr className="my-3" />

            {/* 시간 설정 */}
            <h6 className="fw-bold mb-3 text-dark">⏰ 반복 시간 설정</h6>
            <div className="row g-2 mb-3">
                <div className="col-md-6">
                    <label htmlFor={`recurring-startTime-${rno}`} className="form-label mb-1 small text-secondary">
                        시작 시간
                    </label>
                    <select
                        id={`recurring-startTime-${rno}`}
                        value={startTime} // ✔ HH:mm:ss 그대로 사용
                        onChange={(e) => setStartTime(e.target.value)} // 그대로 저장
                        className="form-select form-select-sm"
                    >
                        {generateTimeOptions()}
                    </select>
                </div>
                <div className="col-md-6">
                    <label htmlFor={`recurring-endTime-${rno}`} className="form-label mb-1 small text-secondary">
                        종료 시간
                    </label>
                    <select
                        id={`recurring-endTime-${rno}`}
                        value={endTime} // ✔ HH:mm:ss 그대로 사용
                        onChange={(e) => setEndTime(e.target.value)} // 그대로 저장
                        className="form-select form-select-sm"
                    >
                        {generateTimeOptions()}
                    </select>
                </div>
            </div>

            <hr className="my-3" />

            {/* 적용 요일 */}
            <div className="mb-3">
                <label className="form-label mb-1 fw-semibold small text-secondary">적용 요일</label>
                <div className="d-flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                        <div key={day} className="form-check form-check-inline">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`recurring-day-${day}-${rno}`}
                                checked={selectedDays.includes(day)}
                                onChange={() => handleDayChange(day)}
                            />
                            <label className="form-check-label" htmlFor={`recurring-day-${day}-${rno}`}>{day}</label>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-3" />

            {/* 버튼 */}
            <div className="d-flex gap-2 mt-3 justify-content-end">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleUpdateRecurringTodo}
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장'}
                </button>

                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteRecurringTodo}
                >
                    삭제
                </button>
            </div>
        </div>
    );
};

export default TodoRecurring;