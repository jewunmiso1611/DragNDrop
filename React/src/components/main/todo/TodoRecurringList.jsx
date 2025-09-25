// src/components/recurring/TodoRecurring.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { errorContextRef } from '../../../context/errorContextRef';
import { fetchRecurringTodos, deleteRecurringTodo } from '../../../api/RecurringTodoApi';
import { useCalendar } from '../../../context/CalendarContext';

const TodoRecurring = ({ rno, onDeleted }) => {
    const { user } = useContext(AuthContext);
    const [recurringTodoList, setRecurringTodoList] = useState([]);
    const { calendarRef } = useCalendar();

    const dayMap = {
        MONDAY: '월',
        TUESDAY: '화',
        WEDNESDAY: '수',
        THURSDAY: '목',
        FRIDAY: '금',
        SATURDAY: '토',
        SUNDAY: '일',
    };

    useEffect(() => {
        if (user && rno) {
            loadRecurringInstances();
        }
    }, [user, rno]);

    const loadRecurringInstances = async () => {
        try {
            const result = await fetchRecurringTodos(user.uno);
            const filtered = result.filter(todo => todo.rno === rno); // 해당 반복 일정을 기준으로 필터링
            setRecurringTodoList(filtered);
        } catch (error) {
            console.error("⛔ 반복 일정 조회 실패", error);
            errorContextRef.set({
                show: true,
                message: "반복 일정 조회 중 오류가 발생했습니다.",
                type: "error",
            });
        }
    };

    const handleDelete = () => {
        errorContextRef.set({
            show: true,
            type: 'confirm',
            message: '이 반복 일정을 삭제하시겠습니까?\n관련된 일정도 모두 삭제됩니다.',
            onConfirm: async () => {
                try {
                    await deleteRecurringTodo(rno);

                    // ✅ 1. 모달
                    errorContextRef.set({
                        show: true,
                        message: "✅ 반복 일정이 삭제되었습니다.",
                        type: "success",
                    });

                    // ✅ 2. FullCalendar에서 삭제
                    const calendarApi = calendarRef.current?.getApi?.();
                    calendarApi?.getEvents()
                        .filter(e => e.extendedProps?.rno === rno)
                        .forEach(e => e.remove());

                    // ✅ 3. RightPanel 목록 갱신
                    onDeleted?.(rno); // 부모에 알림

                    // ✅ 4. 내부 목록 초기화
                    setRecurringTodoList([]);
                } catch (err) {
                    errorContextRef.set({
                        show: true,
                        message: "⚠️ 삭제 중 오류가 발생했습니다.",
                        type: "error",
                    });
                }
            },
        });
    };


    return (
        <div className="todo-recurring-list">
            <ul className="list-group">
                {recurringTodoList.map((todo) => (
                    <li
                        key={todo.tdno}
                        className="list-group-item non-clickable"
                    >
                        <div className="text-muted small">
                            제목 : {todo.title}</div>
                        <div className="text-muted small">
                            내용 : {todo.content}</div>
                        <div className="text-muted small">
                            중요도 : {todo.grade}</div>
                        <div className="text-muted small">
                            기간 : {todo.startDate} ~ {todo.endDate}
                        </div>
                        <div className="text-muted small">
                            시간 : {todo.startTime} ~ {todo.endTime} &nbsp;
                        </div>
                        <div className="text-muted small">
                            요일 :  {Array.isArray(todo.dayOfWeek)
                                ? todo.dayOfWeek.map(d => dayMap[d.trim()] || d).join(', ')
                                : todo.dayOfWeek.split(',').map(d => dayMap[d.trim()] || d).join(', ')
                            }
                        </div>

                        <div className="d-flex justify-content-end mb-2">
                            <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                                삭제
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoRecurring;
