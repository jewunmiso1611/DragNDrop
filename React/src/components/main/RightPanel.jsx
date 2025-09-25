import React, { useEffect, useContext, useState } from 'react';
import { fetchTodoByDate, updateTodoDone } from '../../api/calendarApi';
import { fetchRecurringTodos, fetchRecurringTodoById, fetchRecurringTodoWithTdno } from '../../api/RecurringTodoApi'; // 🔹 반복 일정 API
import { AuthContext } from '../../context/AuthContext';
import { useTodo } from '../../context/TodoContext';
import { errorContextRef } from '../../context/errorContextRef';
import { useCalendar } from '../../context/CalendarContext';
import { useStyle } from '../../context/StyleContext';
import TodoDetail from './todo/TodoDetail';
import TodoRecurringList from './todo/TodoRecurringList'; // 🔁 TodoRecurring 컴포넌트 임포트
import { sortCalendarTodos, sortRecurringTodosByStartTime } from './CalendarUtils';

const RightPanel = () => {
    const { selectedDate, calendarRef } = useCalendar();
    const { getGradeStyle } = useStyle();
    const { user } = useContext(AuthContext);
    const {
        todoList,
        setTodoList,
        openedMap,
        setOpenedMap,
    } = useTodo();
    const { todoRecurring, setTodoRecurring } = useTodo();
    const [recurringTodoTodayList, setRecurringTodoTodayList] = useState([]);
    const [recurringList, setRecurringList] = useState([]);
    // 🔁 열린 반복 일정을 추적하는 상태 (단일 선택)
    const [openedRecurringRno, setOpenedRecurringRno] = useState(null);

    // 일반 할 일 상세 보기 토글
    const toggleTodo = (todo) => {
        const { tdno } = todo;
        setOpenedMap((prev) => {
            const copy = { ...prev };
            if (copy[tdno]) delete copy[tdno];
            else copy[tdno] = { ...todo };
            return copy;
        });
        // 🔁 일반 할 일 열면 반복 일정 닫기
        setOpenedRecurringRno(null);
    };

    // 🔁 반복 일정 상세 보기 토글
    const toggleRecurringTodo = (rno) => {
        setOpenedRecurringRno((prevRno) => (prevRno === rno ? null : rno));
        // 🔁 반복 일정 열면 일반 할 일 상세 창 모두 닫기
        setOpenedMap({});
    };

    const applyToggleDone = async (tdno, newDone, doneDate) => {
        setTodoList((prev) =>
            prev.map((t) =>
                t.tdno === tdno ? { ...t, isDone: newDone, doneDate } : t
            )
        );

        setRecurringTodoTodayList((prev) =>
            prev.map((t) =>
                t.tdno === tdno ? { ...t, isDone: newDone, doneDate } : t
            )
        );


        setOpenedMap((prev) => {
            if (!prev[tdno]) return prev;
            return {
                ...prev,
                [tdno]: {
                    ...prev[tdno],
                    isDone: newDone,
                    doneDate,
                },
            };
        });

        const calendarApi = calendarRef?.current?.getApi?.();
        const event = calendarApi?.getEventById(String(tdno));
        if (event) {
            event.setProp('classNames', newDone ? ['fc-event-done'] : []);
            event.setExtendedProp('isDone', newDone);
            event.setExtendedProp('doneDate', doneDate);
        }

        try {
            await updateTodoDone(tdno, newDone);
        } catch (err) {
            console.error('❌ 완료 상태 업데이트 실패', err);
            errorContextRef.set('❌ 완료 상태 업데이트 실패');

            // 에러 발생 시 원래 상태로 롤백
            setTodoList((prev) =>
                prev.map((t) =>
                    t.tdno === tdno ? { ...t, isDone: !newDone, doneDate: null } : t
                )
            );

            // 반복 일정 롤백
            setRecurringTodoTodayList((prev) =>
                prev.map((t) =>
                    t.tdno === tdno ? { ...t, isDone: !newDone, doneDate: null } : t
                )
            );

            setOpenedMap((prev) => {
                if (!prev[tdno]) return prev;
                return {
                    ...prev,
                    [tdno]: {
                        ...prev[tdno],
                        isDone: !newDone,
                        doneDate: null,
                    },
                };
            });
            if (event) {
                event.setProp('classNames', !newDone ? ['fc-event-done'] : []);
                event.setExtendedProp('isDone', !newDone);
                event.setExtendedProp('doneDate', null);
            }
        }
    };

    const handleToggleDone = (tdno) => {

        setRecurringTodoTodayList(prev =>
            prev.map(todo =>
                todo.tdno === tdno
                    ? { ...todo, isDone: newDone, doneDate }
                    : todo
            )
        );

        // 일반 일정 먼저 찾기
        let current = todoList.find((t) => t.tdno === tdno);

        // 없으면 반복 일정에서 찾기
        if (!current) {
            current = recurringTodoTodayList.find((t) => t.tdno === tdno);
        }

        if (!current) return;

        const newDone = !current.isDone;
        const doneDate = newDone ? new Date().toISOString().split("T")[0] : null;

        if (!newDone) {
            errorContextRef.set({
                show: true,
                type: 'confirm',
                message: `"${current.title}" 항목의 완료를 해제할까요?`,
                onConfirm: () => {
                    applyToggleDone(tdno, newDone, doneDate);
                },
                onCancel: () => {
                    // 사용자가 취소하면, UI를 다시 완료된 상태로 되돌립니다.
                    setTodoList((prev) =>
                        prev.map((t) =>
                            t.tdno === tdno ? { ...t, isDone: true, doneDate: new Date().toISOString().split("T")[0] } : t
                        )
                    );

                    // 반복 일정
                    setRecurringTodoTodayList((prev) =>
                        prev.map((t) =>
                            t.tdno === tdno ? { ...t, isDone: true, doneDate: doneDate } : t
                        )
                    );

                    setOpenedMap((prev) => {
                        if (!prev[tdno]) return prev;
                        return {
                            ...prev,
                            [tdno]: {
                                ...prev[tdno],
                                isDone: true,
                                doneDate: new Date().toISOString().split("T")[0],
                            },
                        };
                    });
                    const calendarApi = calendarRef?.current?.getApi?.();
                    const event = calendarApi?.getEventById(String(tdno));
                    if (event) {
                        event.setProp('classNames', ['fc-event-done']);
                        event.setExtendedProp('isDone', true);
                        event.setExtendedProp('doneDate', new Date().toISOString().split("T")[0]);
                    }
                },
            });
        } else {
            applyToggleDone(tdno, newDone, doneDate);
        }
    };

    const handleDeleteRecurring = (rno) => {
        // ✅ 반복일정 리스트에서 해당 rno 제거
        setRecurringList(prev => prev.filter(r => r.rno !== rno));

        // 2. 오늘의 반복 일정 목록에서도 제거
        setRecurringTodoTodayList(prev => prev.filter(t => t.rno !== rno));

        // ✅ (선택) 펼쳐진 패널도 닫아주기
        if (openedRecurringRno === rno) {
            setOpenedRecurringRno(null);
        }
    };

    // 일반 일정 불러오기
    useEffect(() => {
        if (!selectedDate || !user?.uno) return;

        const fetchData = async () => {
            try {
                const formattedDate = new Date(selectedDate).toLocaleDateString('sv-SE');
                const result = await fetchTodoByDate(user.uno, formattedDate);

                // ✅ rno가 없는 할 일만 일반 todoList에 포함시키도록 필터링 추가
                const filteredResult = result.filter(todo => !todo.rno);

                setTodoList(sortCalendarTodos(filteredResult));
                // 날짜가 변경되면 열린 상세 정보 모두 닫기
                setOpenedMap({});
                setOpenedRecurringRno(null); // 🔁 반복 일정도 닫기
            } catch (err) {
                console.error('❌ 날짜별 할 일 조회 실패', err);
                errorContextRef.set({ show: true, message: '날짜별 할 일 조회 실패', type: 'error' });
            }
        };

        fetchData();
    }, [selectedDate, user?.uno]);

    useEffect(() => {
        if (!selectedDate || !user || !recurringList.length) return;

        const selectedDateStr = selectedDate.toISOString().slice(0, 10);
        const selectedDay = selectedDate.toLocaleDateString("en-US", { weekday: 'long' }).toUpperCase();

        const matchedRnos = recurringList
            .filter(r =>
                r.startDate <= selectedDateStr &&
                r.endDate >= selectedDateStr &&
                r.dayOfWeek?.split(',').includes(selectedDay)
            )
            .map(r => r.rno);

        const loadTodayRecurringTodos = async () => {
            const today = new Date().toISOString().slice(0, 10);
            const promises = matchedRnos.map((rno) => fetchRecurringTodoWithTdno(rno, today));
            const results = await Promise.all(promises);
            setRecurringTodoTodayList(results); // ✅ 오늘 반복 일정 목록 저장
        };

        loadTodayRecurringTodos();
    }, [selectedDate, recurringList, user]);

    // 반복 일정 전체 불러오기 (초기 로드 또는 필요시 리로드)
    useEffect(() => {
        const loadRecurring = async () => {
            try {
                const data = await fetchRecurringTodos();
                console.log("✅ fetchRecurringTodos 응답 (모든 반복 일정):", data); // 1. 모든 반복 일정 확인
                setRecurringList(data);
            } catch (err) {
                console.error('🔁 반복 일정 불러오기 실패', err);
                errorContextRef.set({ show: true, message: '반복 일정 불러오기 실패', type: 'error' });
            }
        };
        loadRecurring();
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행



    // ✅ 선택한 날짜에 해당하는 반복 일정 필터링
    const filteredRecurringList = recurringList.filter((r) => {
        if (!selectedDate) return false;
        const sel = new Date(selectedDate);
        const dateStr = sel.toISOString().split("T")[0]; // YYYY-MM-DD

        return (
            r.startDate <= dateStr &&
            r.endDate >= dateStr
        );
    });

    return (
        <div className="p-4 bg-white border-start min-vh-100 d-flex flex-column">
            <h5 className="mb-3 fw-bold text-dark">
                {selectedDate
                    ? `📅 ${new Date(selectedDate).toLocaleDateString('ko-KR')}의 할 일`
                    : '날짜를 선택하세요'}
            </h5>
            <hr className="my-4" />

            {/* 일반 할 일 목록 */}
            <h6 className="fw-bold text-dark mb-2">오늘의 할 일</h6>
            {todoList.length === 0 ? (
                <p className="text-secondary small">오늘 할 일이 없습니다.</p>
            ) : (
                <ul className="list-unstyled mb-4">
                    {todoList.map((todo) => {
                        const itemStyle = getGradeStyle(todo.grade);
                        const isOpened = openedMap[todo.tdno];
                        // dailyTimes 배열에서 selectedDate에 해당하는 dailyTime 찾기
                        const currentDailyTime = (todo.dailyTimes || []).find(dt =>
                            dt.targetDate === new Date(selectedDate).toISOString().split("T")[0]
                        );
                        const displayTime = (currentDailyTime?.startTime && currentDailyTime.startTime !== '00:00:00')
                            ? `${currentDailyTime.startTime.substring(0, 5)} `
                            : '';

                        return (
                            <li key={todo.tdno} className="mb-2">
                                <div
                                    className={`card card-body p-2 cursor-pointer transition ${isOpened ? `border border-primary` : 'hover-shadow-sm'}`}
                                    style={{
                                        backgroundColor: itemStyle.backgroundColor,
                                        borderColor: itemStyle.borderColor,
                                        color: itemStyle.textColor,
                                    }}
                                    onClick={() => toggleTodo(todo)}
                                >
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={todo.isDone ?? false}
                                            onChange={(e) => {
                                                console.log("✅ 체크 시도:", todo.tdno);
                                                // e.stopPropagation();
                                                handleToggleDone(todo.tdno);
                                            }}
                                            onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 상세 창 열림 방지
                                        />
                                        <small className={`fw-semibold ${todo.isDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                            {displayTime && <span className="text-secondary me-1">📌 {displayTime}</span>}
                                            {todo.title}
                                        </small>
                                    </div>
                                </div>
                                {/* TodoDetail은 일반 할 일 항목 아래에 배치 */}
                                {isOpened && <TodoDetail tdno={todo.tdno} />}
                            </li>
                        );
                    })}
                </ul>
            )}

            <hr className="my-4" />

            <h6 className="fw-bold text-dark mb-2">오늘의 반복 일정</h6>
            {recurringTodoTodayList.length === 0 ? (
                <p className="text-secondary small">오늘은 반복 일정이 없습니다.</p>
            ) : (
                <ul className="list-unstyled mb-4">
                    {sortRecurringTodosByStartTime(recurringTodoTodayList).map((todo) => {
                        const itemStyle = getGradeStyle(todo.grade);
                        const isDone = todo.isDone === true || todo.isDone === 'Y' || todo.isDone === 'true';
                        const displayTime = (todo.startTime && todo.startTime !== '00:00:00')
                            ? `${todo.startTime.substring(0, 5)} `
                            : '';

                        return (
                            <li key={todo.rno} className="mb-2">
                                <div
                                    className={`card card-body p-2 cursor-pointer transition ${isDone ? 'border border-primary' : 'hover-shadow-sm'}`}
                                    style={{
                                        backgroundColor: itemStyle.backgroundColor,
                                        borderColor: itemStyle.borderColor,
                                        color: itemStyle.textColor,
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <small className={`fw-semibold ${isDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                            {displayTime && <span className="text-secondary me-1">🔁 {displayTime}</span>}
                                            {todo.title}
                                        </small>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}


            {/* --- */}
            <hr className="my-4" />

            {/* 🔁 반복 일정 목록 */}
            <h6 className="fw-bold text-dark mb-3">🔁 반복 일정 관리</h6>
            {filteredRecurringList.length === 0 ? (
                <p className="text-secondary small">반복 일정이 없습니다.</p>
            ) : (
                <ul className="list-unstyled mb-0">
                    {sortRecurringTodosByStartTime(filteredRecurringList).map((r) => {
                        const isRecurringOpened = openedRecurringRno === r.rno;
                        const itemStyle = getGradeStyle(r.grade); // 🔹 우선순위 색상 적용

                        return (
                            <li key={r.rno} className="mb-2">
                                <div
                                    className={`card card-body p-2 cursor-pointer transition ${isRecurringOpened ? `border border-info` : 'hover-shadow-sm'}`}
                                    onClick={() => toggleRecurringTodo(r.rno)}
                                    style={{
                                        backgroundColor: itemStyle.backgroundColor,
                                        borderColor: itemStyle.borderColor,
                                        color: itemStyle.textColor,
                                    }} // 🔹 스타일 반영
                                >
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-arrow-repeat me-2 text-info"></i>
                                        <small className="fw-semibold">
                                            {r.title}
                                            {r.startTime && r.endTime && ` (${r.startTime.substring(0, 5)} ~ ${r.endTime.substring(0, 5)})`}
                                            <span className="text-muted ms-2">매주 {r.dayOfWeek?.split(',').map(d => {
                                                const dayFrontendMap = {
                                                    'SUNDAY': '일', 'MONDAY': '월', 'TUESDAY': '화', 'WEDNESDAY': '수',
                                                    'THURSDAY': '목', 'FRIDAY': '금', 'SATURDAY': '토'
                                                };
                                                return dayFrontendMap[d.trim()];
                                            }).join(', ')}</span>
                                        </small>
                                    </div>
                                </div>
                                {isRecurringOpened && <TodoRecurringList rno={r.rno} onDeleted={handleDeleteRecurring} />}
                            </li>
                        );
                    })}
                </ul>
            )}

        </div>
    );
};

export default RightPanel;