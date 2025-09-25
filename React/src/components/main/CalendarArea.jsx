import React, { useRef, useState, useContext, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useTodo } from '../../context/TodoContext';
import { useCalendar } from '../../context/CalendarContext';
import { errorContextRef } from '../../context/errorContextRef';
import { useStyle } from '../../context/StyleContext';
import {
    fetchTodoByDate,
    postCalendarTodo,
    fetchCalendarTodoList,
    updateCalendarTodo,
    deleteCalendarTodo,
} from '../../api/calendarApi';
import { buildCalendarEvent, sortCalendarTodos } from './CalendarUtils'; // Import the utility function
import './CalendarArea.css';

const CalendarArea = () => {
    const [loadedMonths, setLoadedMonths] = useState([]);
    const inputRef = useRef(null);
    const { user } = useContext(AuthContext);
    const { selectedDate, setSelectedDate, currentMonthDate, setCurrentMonthDate, calendarRef } = useCalendar();
    const { unsavedTodos, setUnsavedTodos, calendarEvents, setCalendarEvents, setTodoList, setOpenedMap } = useTodo();
    const [isDragging, setIsDragging] = useState(false);
    const processedSetRef = useRef(new Set());
    const { getGradeStyle } = useStyle();
    const [isUpdatingCalendar, setIsUpdatingCalendar] = useState(false);
    const handleEventChange = async (info) => {
        const tdno = info.event.extendedProps?.tdno || info.event.id;

        if (!tdno) {
            console.warn('❌ tdno 없음, DB에 반영 불가');
            info.revert();
            return;
        }

        const event = info.event;
        const isEventAllDay = event.allDay;

        let startDate;
        let endDate;
        let originalStartTime;
        let originalEndTime;
        let dailyTimes = [];

        startDate = event.start.toLocaleDateString('sv-SE');

        if (isEventAllDay) {
            endDate = event.end
                ? new Date(event.end.getTime() - 86400000).toLocaleDateString('sv-SE')
                : startDate;

            originalStartTime = '00:00:00';
            originalEndTime = '00:00:00';

        } else {

            endDate = event.end
                ? event.end.toLocaleDateString('sv-SE')
                : startDate;


            const currentStartHour = String(event.start.getHours()).padStart(2, '0');
            const currentStartMinute = String(event.start.getMinutes()).padStart(2, '0');
            const currentStartSecond = String(event.start.getSeconds()).padStart(2, '0');
            originalStartTime = `${currentStartHour}:${currentStartMinute}:${currentStartSecond}`;

            const currentEndHour = String(event.end ? event.end.getHours() : event.start.getHours()).padStart(2, '0');
            const currentEndMinute = String(event.end ? event.end.getMinutes() : event.start.getMinutes()).padStart(2, '0');
            const currentEndSecond = String(event.end ? event.end.getSeconds() : event.start.getSeconds()).padStart(2, '0');
            originalEndTime = `${currentEndHour}:${currentEndMinute}:${currentEndSecond}`;

            dailyTimes = [{
                targetDate: startDate,
                startTime: originalStartTime,
                endTime: originalEndTime,
            }];
        }

        try {
            const payload = {
                tdno,
                startDate,
                endDate,
                memberUno: user.uno,
                dailyTimes: dailyTimes,
            };
            console.log('📦 updateCalendarTodo 전달 객체:', payload);

            await updateCalendarTodo(payload);

            setSelectedDate(new Date(startDate));

            const calendarApi = calendarRef.current?.getApi();

            if (calendarApi) {
                const existingEvent = calendarApi.getEventById(String(tdno));
                if (existingEvent) existingEvent.remove();

                const updatedDto = {
                    tdno,
                    title: event.title,
                    content: event.extendedProps?.content,
                    grade: event.extendedProps?.grade,
                    startDate,
                    endDate,
                    isDone: event.extendedProps?.isDone,
                    doneDate: event.extendedProps?.doneDate,
                    dailyTimes,
                };

                const newEvent = buildCalendarEvent(updatedDto, getGradeStyle);
                calendarApi.addEvent(newEvent); // 🔥 FullCalendar에 직접 추가
            }

            if (calendarApi) {
                console.log("[🧪 check] 현재 FullCalendar에 등록된 이벤트 목록:");
                console.log(
                    calendarApi.getEvents().map((e) => ({
                        id: e.id,
                        title: e.title,
                        start: e.start,
                        end: e.end,
                        allDay: e.allDay,
                        extendedProps: e.extendedProps,
                    }))
                );
            }

            if (selectedDate && user?.uno) {
                const formatted = new Date(selectedDate).toLocaleDateString('sv-SE');
                const result = await fetchTodoByDate(user.uno, formatted);
                const sorted = sortCalendarTodos(result); // ⬅️ 변경된 부분
                setTodoList(sorted);
            }
        } catch (err) {
            console.error('❌ 일정 변경 실패', err);
            if (info.revert && typeof info.revert === 'function') {
                info.revert();
            }
        }
    };

    const handleDateChange = (e) => {
        const value = e.target.value;
        if (!value) return;

        const selected = new Date(value);
        if (isNaN(selected.getTime())) return;

        setSelectedDate(selected);
        setCurrentMonthDate(selected);

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.gotoDate(selected);
        }
    };

    const isSameDate = (d1, d2) =>
        d1?.getFullYear() === d2?.getFullYear() &&
        d1?.getMonth() === d2?.getMonth() &&
        d1?.getDate() === d2?.getDate();

    const openNativePicker = () => {
        if (inputRef.current?.showPicker) inputRef.current.showPicker();
        else inputRef.current.click();
    };

    const fetchNextMonthEvents = async (year, month) => {
        if (loadedMonths.includes(`${year}-${month}`)) return;

        try {
            const list = await fetchCalendarTodoList(user.uno);
            const nextMonthEvents = list.filter((dto) => {
                const eventDate = new Date(dto.startDate);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month;
            });

            const newEvents = nextMonthEvents.map((dto) => buildCalendarEvent(dto, getGradeStyle));

            setCalendarEvents((prev) => [...prev, ...newEvents]);
            setLoadedMonths((prev) => [...prev, `${year}-${month}`]);

        } catch (err) {
            console.error('❌ 다음달 이벤트 로딩 실패', err);
        }
    };

    const handleNextMonth = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
        const newDate = calendarApi.getDate();
        fetchNextMonthEvents(newDate.getFullYear(), newDate.getMonth());
        setCurrentMonthDate(newDate);
    };

    const handlePrevMonth = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
        const newDate = calendarApi.getDate();
        fetchNextMonthEvents(newDate.getFullYear(), newDate.getMonth());
        setCurrentMonthDate(newDate);
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonthDate(today);
        calendarRef.current?.getApi().gotoDate(today);
    };

    useEffect(() => {
        const draggableEl = document.getElementById('external-events');
        if (draggableEl) {
            if (draggableEl.fcDraggable) {
                draggableEl.fcDraggable.destroy();
            }

            const draggable = new Draggable(draggableEl, {
                itemSelector: '.todo-card',
                eventData: (el) => {
                    try {
                        const todo = JSON.parse(el.dataset.todo);
                        console.log("🐛 Draggable todo 데이터:", todo);
                        return buildCalendarEvent(todo, getGradeStyle);
                    } catch (e) {
                        console.error("Draggable eventData 파싱 오류:", e);
                        return { title: '오류 발생' };
                    }
                },

                revert: true,
                drop: (info) => {
                    const trashEl = document.getElementById('calendar-trash');
                    const { clientX, clientY } = info.jsEvent;

                    if (trashEl) {
                        const rect = trashEl.getBoundingClientRect();
                        const inTrash =
                            clientX >= rect.left &&
                            clientX <= rect.right &&
                            clientY >= rect.top &&
                            clientY <= rect.bottom;

                        if (inTrash) {
                            const todoData = JSON.parse(info.draggedEl.dataset.todo);
                            setUnsavedTodos(prev => prev.filter(todo => todo.tempId !== todoData.tempId));
                            info.revert = false;
                        }
                    }
                },
            });
            draggableEl.fcDraggable = draggable;
            return () => {
                if (draggableEl.fcDraggable) {
                    draggableEl.fcDraggable.destroy();
                    draggableEl.fcDraggable = null;
                }
            };
        }
    }, [unsavedTodos, setUnsavedTodos]);

    useEffect(() => {
        if (!user?.uno) return;

        const loadEvents = async () => {
            try {
                const list = await fetchCalendarTodoList(user.uno);
                const events = list.map((dto) => buildCalendarEvent(dto, getGradeStyle));
                setCalendarEvents(events);

                const now = new Date();
                const key = `${now.getFullYear()}-${now.getMonth()}`;
                setLoadedMonths([key]);

            } catch (err) {
                console.error('❌ 일정 불러오기 실패', err);
            }
        };
        loadEvents();
    }, [user, setCalendarEvents, getGradeStyle]);

    return (
        <div className="notion-calendar-container panel">
            <Row className="calendar-header-bootstrap align-items-center mb-3">
                <Col className="d-flex align-items-center">
                    <input
                        ref={inputRef}
                        type="date"
                        onChange={handleDateChange}
                        className="native-date-input"
                        value={selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : ''}
                    />
                </Col>

                <Col xs="auto" className="d-flex align-items-center gap-2">

                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            onClick={handlePrevMonth}
                        >
                            &lt;
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={handleNextMonth}
                        >
                            &gt;
                        </Button>
                    </ButtonGroup>

                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleTodayClick}
                    >
                        오늘
                    </Button>

                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            className={calendarRef.current?.getApi().view.type === 'dayGridMonth' ? 'active' : ''}
                            onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
                        >
                            월
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className={calendarRef.current?.getApi().view.type === 'timeGridWeek' ? 'active' : ''}
                            onClick={() => {
                                const calendarApi = calendarRef.current?.getApi();
                                if (calendarApi) {
                                    const focusDate = selectedDate ?? new Date(); // 선택된 날짜 없으면 오늘
                                    calendarApi.changeView('timeGridWeek', focusDate);
                                }
                            }}
                        >
                            주
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>


            <input
                ref={inputRef}
                type="date"
                onChange={handleDateChange}
                className="native-date-input"
                value={selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : ''}
            />

            {isDragging && <div className="calendar-trash-zone" id="calendar-trash">🗑️</div>}

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: 'title',
                    center: '',
                    right: '',
                }}
                initialView="dayGridMonth"
                locale="ko"
                height="auto"
                droppable={true}
                editable={true}
                eventStartEditable={true}
                eventDurationEditable={true}
                eventAllow={(dropInfo, draggedEvent) => {
                    // 반복 일정이면 드래그 불가 (예: 반복 일정에는 rno가 있음)
                    const isRecurring = draggedEvent.extendedProps.rno !== undefined && draggedEvent.extendedProps.rno !== null;
                    return !isRecurring;
                }}
                events={calendarEvents}
                eventOrder={(a, b) => {
                    const aTime = a.extendedProps?.dailyTimes?.[0]?.startTime ?? null;
                    const bTime = b.extendedProps?.dailyTimes?.[0]?.startTime ?? null;

                    const aHasTime = !!aTime && aTime !== '00:00:00';
                    const bHasTime = !!bTime && bTime !== '00:00:00';

                    if (aHasTime && !bHasTime) return -1;
                    if (!aHasTime && bHasTime) return 1;

                    if (aHasTime && bHasTime) {
                        if (aTime < bTime) return -1;
                        if (aTime > bTime) return 1;
                        return b.extendedProps.grade - a.extendedProps.grade;
                    }

                    return b.extendedProps.grade - a.extendedProps.grade;
                }}
                eventOrderStrict={true}

                eventDidMount={(info) => {
                    const event = info.event;


                    const content = event.extendedProps?.content || '내용 없음';
                    info.el.setAttribute('title', content);

                    const titleEl = info.el.querySelector('.fc-event-title');
                    if (titleEl) {
                        titleEl.setAttribute('title', content);
                    }

                    if (!event.extendedProps.originalStartTime && event.extendedProps.dailyTimes?.length > 0) {
                        const time = event.extendedProps.dailyTimes[0];
                        event.setExtendedProp('originalStartTime', time.startTime);
                        event.setExtendedProp('originalEndTime', time.endTime);
                    }
                }}

                eventReceive={async (info) => {
                    const event = info.event;
                    const tempId = event.extendedProps.tempId;

                    if (processedSetRef.current.has(tempId)) {
                        event.remove();
                        return;
                    }
                    processedSetRef.current.add(tempId);

                    const date = event.startStr.slice(0, 10);
                    const startTime = event.extendedProps.originalStartTime || '00:00:00';
                    const endTime = event.extendedProps.originalEndTime || startTime;

                    let dailyTimes = [];
                    if (startTime && startTime !== '00:00:00') {
                        dailyTimes = [
                            {
                                targetDate: date,
                                startTime: startTime,
                                endTime: endTime,
                            },
                        ];
                    }

                    try {
                        const dtoToSend = {
                            title: event.title,
                            content: event.extendedProps.content,
                            grade: event.extendedProps.grade ?? 1,
                            startDate: date,
                            endDate: date, // For new events dropped on a single day
                            memberUno: user.uno,
                            dailyTimes,
                        };


                        const saved = await postCalendarTodo(dtoToSend);

                        const newFullCalendarEventProps = buildCalendarEvent(saved, getGradeStyle);

                        const newFullCalendarEvent = buildCalendarEvent(saved, getGradeStyle);

                        event.setProp('id', newFullCalendarEvent.id);
                        event.setProp('title', newFullCalendarEvent.title);
                        event.setDates(newFullCalendarEventProps.start, newFullCalendarEventProps.end, { allDay: newFullCalendarEventProps.allDay });
                        event.setProp('backgroundColor', newFullCalendarEvent.backgroundColor);
                        event.setProp('borderColor', newFullCalendarEvent.borderColor);
                        event.setProp('textColor', newFullCalendarEvent.textColor);
                        event.setProp('classNames', newFullCalendarEvent.classNames);
                        event.setExtendedProp('tdno', newFullCalendarEvent.extendedProps.tdno);
                        event.setExtendedProp('grade', newFullCalendarEvent.extendedProps.grade);
                        event.setExtendedProp('isDone', newFullCalendarEvent.extendedProps.isDone);
                        event.setExtendedProp('content', newFullCalendarEvent.extendedProps.content);
                        event.setExtendedProp('originalStartTime', newFullCalendarEvent.extendedProps.originalStartTime);
                        event.setExtendedProp('originalEndTime', newFullCalendarEvent.extendedProps.originalEndTime);
                        event.setExtendedProp('dailyTimes', newFullCalendarEvent.extendedProps.dailyTimes);


                        setUnsavedTodos((prev) => prev.filter((t) => t.tempId !== tempId));

                        setSelectedDate(new Date(saved.startDate)); // 상세 보기 날짜 업데이트
                        const selectedFormatted = new Date(selectedDate).toLocaleDateString('sv-SE');
                        const savedFormatted = new Date(saved.startDate).toLocaleDateString('sv-SE');

                        if (savedFormatted === selectedFormatted) {
                            setTodoList((prev) =>
                                sortCalendarTodos([...prev, saved])
                            );
                        }

                        console.log('✅ 할 일 등록 성공 및 캘린더 업데이트:', saved);

                    } catch (err) {
                        console.error('❌ 서버 저장 실패 또는 캘린더 업데이트 오류:', err);
                        errorContextRef.set('일정 등록 중 오류가 발생했습니다.');
                        event.remove();
                        processedSetRef.current.delete(tempId);
                    }
                }}

                eventDrop={handleEventChange}
                eventResize={handleEventChange}
                eventDragStart={() => setIsDragging(true)}


                eventDragStop={async (info) => {
                    setIsDragging(false); // 드래그 상태 해제
                    const trashEl = document.getElementById('calendar-trash');
                    const { clientX, clientY } = info.jsEvent;
                    const tdno = info.event.extendedProps?.tdno;
                    const event = info.event; // 현재 드래그된 캘린더 이벤트 객체
                    const rno = event.extendedProps.rno;

                    const revertEventOnCalendar = () => {
                        console.log("Revert functionality called for:", tdno);
                        if (event) {

                            const calendarApi = calendarRef.current?.getApi();
                            if (calendarApi && event.source) { // source가 있으면 드래그된 원본 이벤트가 있을 가능성
                                const existingEvent = calendarApi.getEventById(String(tdno));
                                if (!existingEvent) {
                                    calendarApi.addEvent(event.toPlainObject());
                                }
                            } else if (calendarApi && !tdno) { // 임시 이벤트였다면 제거
                                event.remove();
                            }
                        }
                    };

                    if (rno !== undefined && rno !== null) {
                        console.warn("❌ 반복 일정은 삭제할 수 없습니다.");
                        info.revert?.(); // 위치 복귀
                        return;
                    }

                    if (trashEl) {
                        const rect = trashEl.getBoundingClientRect();
                        const inTrash =
                            clientX >= rect.left &&
                            clientX <= rect.right &&
                            clientY >= rect.top &&
                            clientY <= rect.bottom;

                        if (inTrash) { // 휴지통에 드롭된 경우
                            if (!tdno) {
                                errorContextRef.set('일정이 아직 저장되지 않아 삭제할 수 없습니다.');
                                event.remove(); // 저장되지 않은 임시 이벤트는 바로 제거
                                return;
                            }

                            errorContextRef.set({
                                show: true,
                                type: 'confirm',
                                message: '정말 삭제하시겠어요?',
                                onConfirm: async () => {
                                    if (isUpdatingCalendar) {
                                        console.warn('⚡️ 캘린더 업데이트가 이미 진행 중입니다. 중복 호출 방지.');
                                        return;
                                    }
                                    setIsUpdatingCalendar(true); // 처리 시작
                                    try {
                                        await deleteCalendarTodo(tdno);

                                        // ✅ 성공 시: FullCalendar에서 이벤트 영구 삭제
                                        event.remove();

                                        // FullCalendar에서 제거
                                        const calendarApi = calendarRef.current?.getApi();
                                        const ghost = calendarApi.getEventById(String(tdno));
                                        if (ghost) ghost.remove();
                                        setCalendarEvents((prev) =>
                                            prev.filter((e) => String(e.id) !== String(tdno))
                                        );
                                        setTodoList((prev) =>
                                            sortCalendarTodos(prev.filter((todo) => String(todo.tdno) !== String(tdno)))
                                        );
                                        setOpenedMap((prev) => {
                                            const copy = { ...prev };
                                            delete copy[tdno];
                                            return copy;
                                        });
                                        console.log('✅ 일정 삭제 성공:', tdno);
                                    } catch (err) {
                                        console.error('❌ 삭제 실패', err);
                                        errorContextRef.set('일정 삭제 중 오류가 발생했습니다.');

                                        revertEventOnCalendar(); // ⬅️ 여기서 새롭게 정의된 롤백 함수 호출
                                    } finally {
                                        setIsUpdatingCalendar(false); // 처리 완료
                                    }
                                },
                                onCancel: () => {
                                    revertEventOnCalendar(); // ⬅️ 여기서 새롭게 정의된 롤백 함수 호출
                                },
                            });
                        } else {
                            console.log("Event dropped outside trash zone, not reverting here.");

                        }
                    } else {
                        console.warn('Calendar trash zone element not found. Not performing trash logic.');

                    }
                }}

                dateClick={(info) => setSelectedDate(new Date(info.dateStr))}
                eventClick={(info) => {
                    const event = info.event;
                    const tdno = event.extendedProps?.tdno;
                    const targetDate = event.start?.toLocaleDateString('sv-SE');

                    // 1. 날짜만 갱신
                    if (targetDate) {
                        setSelectedDate(new Date(targetDate));
                    }

                    // 2. 상세보기는 열려 있던 것을 유지 (변경 X)
                    // ❌ 새로 setOpenedMap 하지 않기!
                }}



                datesSet={(arg) => {
                    if (!isSameDate(currentMonthDate, arg.view.currentStart)) {
                        setCurrentMonthDate(arg.view.currentStart);
                    }
                }}

                dayCellClassNames={(arg) => {
                    const classNames = [];

                    const date = arg.date;
                    const today = new Date();

                    if (isSameDate(date, today)) {
                        classNames.push('day-today');
                    }

                    if (selectedDate && isSameDate(date, selectedDate)) {
                        classNames.push('day-selected');
                    }

                    if (date.getDay() === 0) { // Sunday
                        classNames.push('day-sunday');
                    }
                    if (date.getDay() === 6) { // Saturday
                        classNames.push('day-saturday');
                    }
                    return classNames;
                }}
            />
        </div>
    );
};

export default CalendarArea;