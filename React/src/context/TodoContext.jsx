import { createContext, useContext, useState, useRef, useCallback } from 'react'; // useCallback 추가
import { editCalendarTodo, fetchCalendarTodoById, deleteCalendarTodo } from '../api/calendarApi'; // fetchCalendarTodoById 추가
import { errorContextRef } from './errorContextRef';
import { useStyle } from './StyleContext';
import { AuthContext } from './AuthContext';
import { buildCalendarEvent } from '../components/main/CalendarUtils';

export const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
    const [unsavedTodos, setUnsavedTodos] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [newTodo, setNewTodo] = useState({
        title: '',
        content: '',
        grade: 1,
    });

    const [calendarEvents, setCalendarEvents] = useState([]);
    const [openedMap, setOpenedMap] = useState({});
    const [todoList, setTodoList] = useState([]);
    const [defaultTodoList, setDefaultTodoList] = useState([]);
    const [isSavingMap, setIsSavingMap] = useState({});

    const { user } = useContext(AuthContext);
    const { getGradeStyle } = useStyle();
    const [todoRecurring, setTodoRecurring] = useState([]);

    // ✅ fetchTodoById 함수 추가
    const fetchTodoById = useCallback(async (tdnoToFetch) => {
        if (!user || !user.uno) {
            console.warn("User not authenticated or UNO not available for fetching todo.");
            return;
        }
        try {

            const data = await fetchCalendarTodoById(tdnoToFetch, user.uno);

            setOpenedMap(prev => ({
                ...prev,
                [tdnoToFetch]: data
            }));
            console.log(`Todo ${tdnoToFetch} fetched and updated in openedMap:`, data);

        } catch (error) {
            console.error("Error fetching todo by ID:", error);
            errorContextRef.set({ show: true, message: `할 일 상세 정보를 불러오는데 실패했습니다: ${error.message}`, type: 'error' });
        }
    }, [user, setOpenedMap]);

    // ✅ 저장 함수
    const handleUpdate = async (tdno, calendarRef) => {
        const todo = openedMap[tdno];
        console.log("[handleUpdate] todo 전달 내용:", todo);

        if (!todo?.title?.trim()) {
            errorContextRef.set('제목을 입력해주세요.');
            return;
        }

        try {
            setIsSavingMap((prev) => ({ ...prev, [tdno]: true }));

            // ✅ 날짜 차이 계산 후 dailyTimes shift
            const startDateBefore = new Date(todo.startDate);
            const startDateAfter = new Date(todo.endDate); // 또는 todo.startDate 이후 수정된 값
            const dateDiff = (startDateAfter - startDateBefore) / (1000 * 60 * 60 * 24);

            const shiftedDailyTimes = (todo.dailyTimes || []).map((dt) => {
                const oldDate = new Date(dt.targetDate);
                const newDate = new Date(oldDate);
                newDate.setDate(oldDate.getDate() + dateDiff);

                return {
                    ...dt,
                    targetDate: newDate.toISOString().slice(0, 10),
                };
            });

            // ✅ 백엔드 저장
            const updated = await editCalendarTodo({
                ...todo,
                memberUno: user.uno,
                isDone: todo.isDone ?? false,
                doneDate: todo.doneDate ?? null,
                dailyTimes: shiftedDailyTimes,
            });

            const updatedTdno = updated.tdno;

            // ✅ todoList 갱신
            setTodoList((prev) => {
                const filtered = prev.filter((t) => String(t.tdno) !== String(tdno));
                return [...filtered, updated].sort((a, b) => b.grade - a.grade);
            });

            // ✅ 반복일정 리스트도 같이 갱신
            setTodoRecurring((prev) => {
                if (!prev || !Array.isArray(prev)) return prev;
                return prev.map((item) =>
                    String(item.tdno) === String(tdno)
                        ? { ...item, isDone: updated.isDone, doneDate: updated.doneDate }
                        : item
                );
            });

            // ✅ openedMap 갱신
            setOpenedMap((prev) => {
                const copy = { ...prev };
                delete copy[tdno];
                copy[updatedTdno] = { ...updated };
                return copy;
            });

            setSelectedDate(new Date(updated.startDate));

            // ✅ FullCalendar 갱신
            const calendarApi = calendarRef?.current?.getApi?.();
            if (calendarApi) {
                // 1. 기존 이벤트 제거
                const existingEvent = calendarApi.getEventById(String(tdno)) || calendarApi.getEventById(String(updatedTdno));
                if (existingEvent) existingEvent.remove();

                // 2. buildCalendarEvent 사용하여 새 이벤트 생성
                const newEvent = buildCalendarEvent(updated, getGradeStyle);

                // 3. FullCalendar에 새 이벤트 추가
                calendarApi.addEvent(newEvent);

                console.log("[✅ 이벤트 갱신 완료] 현재 FullCalendar 이벤트 목록:");
                console.log(
                    calendarApi.getEvents().map((e) => ({
                        id: e.id,
                        title: e.title,
                        start: e.start,
                        end: e.end,
                        extendedProps: e.extendedProps,
                    }))
                );
            }

            errorContextRef.set({
                show: true,
                type: 'success',
                message: '✅ 저장되었습니다.',
            });

            return updated;

        } catch (err) {
            console.error('❌ 저장 실패', err);
            errorContextRef.set({
                show: true,
                type: 'error',
                message: '⚠️ 저장 중 오류가 발생했습니다.',
            });
        } finally {
            setIsSavingMap((prev) => ({ ...prev, [tdno]: false }));
        }
    };



    const handleDelete = async (tdnoToDelete) => {
        try {
            // API 호출: 투두 삭제
            await deleteCalendarTodo(tdnoToDelete, user.uno);

            // todoList에서 삭제
            setTodoList(prev => prev.filter(item => String(item.tdno) !== String(tdnoToDelete)));

            // openedMap에서 삭제
            setOpenedMap(prev => {
                const newMap = { ...prev };
                delete newMap[tdnoToDelete];
                return newMap;
            });
            console.log(`Todo ${tdnoToDelete} deleted.`);

            return true;

        } catch (error) {
            console.error("Error deleting todo:", error);
            errorContextRef.set({ show: true, message: `할 일 삭제에 실패했습니다: ${error.message}`, type: 'error' });
        }
    };


    return (
        <TodoContext.Provider
            value={{
                unsavedTodos,
                setUnsavedTodos,
                selectedDate,
                setSelectedDate,
                newTodo,
                setNewTodo,
                calendarEvents,
                setCalendarEvents,
                openedMap,
                setOpenedMap,
                todoList,
                setTodoList,
                defaultTodoList,
                setDefaultTodoList,
                isSavingMap,
                handleUpdate,
                handleDelete, // ✅ handleDelete도 여기에 추가했다면 전달
                fetchTodoById, // ✅ 새로 추가된 함수 전달!
                todoRecurring,
                setTodoRecurring,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

// ✅ 커스텀 훅
export const useTodo = () => useContext(TodoContext);