import React from 'react';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useTodo } from '../../../context/TodoContext';
import { useCalendar } from '../../../context/CalendarContext';
import { errorContextRef } from '../../../context/errorContextRef';

const TodoDetail = ({ tdno }) => {
  const { user } = useContext(AuthContext);
  const { openedMap, setOpenedMap, handleUpdate, handleDelete, isSavingMap, fetchTodoById } = useTodo();
  const { calendarRef, selectedDate, setSelectedDate } = useCalendar(); // selectedDate 가져오기
  const todo = openedMap[tdno];
  const isSaving = isSavingMap[tdno] ?? false;
  const isSameDate = todo.startDate === todo.endDate;

  const formattedSelectedDate = selectedDate ? selectedDate.toISOString().slice(0, 10) : '';


  useEffect(() => {
    if (todo && todo.dailyTimes?.length > 0 && selectedDate) {
      const matched = todo.dailyTimes.find((dt) => {
        const dtDate = dt.targetDate?.slice(0, 10);
        const selDate = selectedDate.toISOString().slice(0, 10);
        return dtDate === selDate;
      });

      if (!matched) {
        const firstTimeDate = new Date(todo.dailyTimes[0].targetDate);
        const firstDateStr = firstTimeDate.toISOString().slice(0, 10);
        const selectedDateStr = selectedDate.toISOString().slice(0, 10);

        if (firstDateStr !== selectedDateStr) {
          setSelectedDate(firstTimeDate);
        }
      }
    }
  }, [todo, selectedDate]);

  useEffect(() => {
    if (tdno && !todo) {
      console.log(`[TodoDetail useEffect] Fetching todo for tdno: ${tdno}`);
      fetchTodoById(tdno);
    }
  }, [tdno, todo, fetchTodoById]);

  const currentDailyTime = (todo.dailyTimes || []).find((dt) => {
    const dtDate = dt.targetDate.slice(0, 10); // 혹시 타임존 붙어있을 수 있으니 잘라줌
    return dtDate === formattedSelectedDate;
  });

  if (!todo) return null;


  const handleChange = (field, value) => {
    setOpenedMap((prev) => {
      const current = { ...prev[tdno] };

      // 🔐 유효성 검사: 시작일 > 종료일 ❌
      if (field === 'startDate' && current.endDate && value > current.endDate) {
        errorContextRef.set({
          show: true,
          message: '시작일은 종료일보다 늦을 수 없습니다.',
          type: 'error',
        });
        return prev; // 변경하지 않음
      }

      // 🔐 유효성 검사: 종료일 < 시작일 ❌
      if (field === 'endDate' && current.startDate && value < current.startDate) {
        errorContextRef.set({
          show: true,
          message: '종료일은 시작일보다 빠를 수 없습니다.',
          type: 'error',
        });
        return prev;
      }

      return {
        ...prev,
        [tdno]: {
          ...current,
          [field]: value,
          dailyTimes: current.dailyTimes || [],
        },
      };
    });
  };


  // ✅ 현재 날짜의 dailyTime만 직접 핸들링
  const handleCurrentDailyTimeChange = (field, value) => {
    setOpenedMap((prev) => {
      const currentTodo = { ...prev[tdno] };
      const updatedDailyTimes = (currentTodo.dailyTimes || []).map(dt => {
        if (dt.targetDate === formattedSelectedDate) {
          const newDailyTime = { ...dt, [field]: value };

          // ✅ 시간 유효성 검사 로직 추가
          if (newDailyTime.startTime && newDailyTime.endTime) {
            const start = new Date(`2000/01/01 ${newDailyTime.startTime}`);
            const end = new Date(`2000/01/01 ${newDailyTime.endTime}`);

            if (end < start) {
              errorContextRef.set({
                show: true,
                message: '종료 시간은 시작 시간보다 빠를 수 없습니다.',
                type: 'error',
              });

              return dt;
            }
          }
          return newDailyTime;
        }
        return dt;
      });

      return {
        ...prev,
        [tdno]: {
          ...currentTodo,
          dailyTimes: updatedDailyTimes,
        },
      };
    });
  };

  const addDailyTime = () => {
    if (!todo?.startDate) {
      errorContextRef.set({ show: true, message: '시작일을 먼저 입력해주세요.', type: 'error' });
      return;
    }

    const existingDates = (todo.dailyTimes || []).map((dt) => dt.targetDate);
    if (existingDates.includes(formattedSelectedDate)) {
      errorContextRef.set({ show: true, message: '해당 날짜에 이미 시간 정보가 있습니다.', type: 'error' });
      return;
    }

    setOpenedMap((prev) => ({
      ...prev,
      [tdno]: {
        ...prev[tdno],
        dailyTimes: [
          ...(prev[tdno].dailyTimes || []),
          {
            tno: null,
            targetDate: formattedSelectedDate, // ✅ 시작일 기준
            startTime: '09:00:00',
            endTime: '10:00:00',
          },
        ],
      },
    }));
  };

  const removeDailyTime = () => {
    if (!formattedSelectedDate) return; // 선택된 날짜가 없으면 삭제할 것도 없음

    setOpenedMap((prev) => ({
      ...prev,
      [tdno]: {
        ...prev[tdno],
        // 현재 날짜에 해당하는 dailyTime만 필터링하여 제거
        dailyTimes: (prev[tdno].dailyTimes || []).filter(
          (dt) => dt.targetDate !== formattedSelectedDate
        ),
      },
    }));
  };

  // 시간 선택 select 박스용 옵션 생성 헬퍼 함수
  const generateTimeOptions = () => {
    const options = [];
    options.push(<option value="" key="default-time-option">-- 선택 --</option>);
    for (let i = 0; i < 48; i++) { // 00:00부터 23:30까지 30분 단위
      const hour = String(Math.floor(i / 2)).padStart(2, '0');
      const minute = i % 2 === 0 ? '00' : '30';

      // 뷰에 보여지는 텍스트는 HH:mm
      const displayTime = `${hour}:${minute}`;

      // 실제 select 박스의 값은 HH:mm:ss (서버 전송용)
      const valueTime = `${hour}:${minute}:00`; // 🌟 여기에 ':00'을 추가합니다. 🌟

      options.push(
        <option key={valueTime} value={valueTime}>
          {displayTime} {/* 뷰에 보여지는 텍스트는 HH:mm */}
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

  return (
    <div className="card p-3 rounded mt-2 shadow-sm">
      <h6 className="fw-bold mb-3 text-dark">📝 상세 정보</h6>

      {/* 제목 */}
      <div className="mb-3">
        <label htmlFor={`title-${tdno}`} className="form-label mb-1 fw-semibold small text-secondary">제목</label>
        <input
          type="text"
          id={`title-${tdno}`}
          value={todo.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="form-control form-control-sm"
          placeholder="제목"
        />
      </div>

      {/* 내용 */}
      <div className="mb-3">
        <label htmlFor={`content-${tdno}`} className="form-label mb-1 fw-semibold small text-secondary">내용</label>
        <textarea
          id={`content-${tdno}`}
          value={todo.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          className="form-control form-control-sm"
          placeholder="내용 (선택)"
          rows="3"
        />
      </div>

      {/* 중요도 */}
      <div className="mb-3">
        <label htmlFor={`grade-${tdno}`} className="form-label mb-1 fw-semibold small text-secondary">중요도</label>
        <select
          id={`grade-${tdno}`}
          value={todo.grade || 1}
          onChange={(e) => handleChange('grade', Number(e.target.value))}
          className="form-select form-select-sm"
        >
          {Object.keys(gradeOptions).map((gradeKey) => (
            <option key={gradeKey} value={gradeKey}>
              {gradeOptions[gradeKey]}
            </option>
          ))}
        </select>
      </div>


      <hr className="my-3" />

      <h6 className="fw-bold mb-3 text-dark">⏰ 시간 설정</h6>

      {!isSameDate ? (
        <p className="text-danger small">⛔ 시작일과 종료일이 다르면 시간 설정을 할 수 없습니다.</p>
      ) : currentDailyTime ? (
        <div key={currentDailyTime.tno || `existing-${formattedSelectedDate}`} className="mb-3 p-2 border rounded bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0 fw-semibold small text-secondary">
              {currentDailyTime.targetDate}
            </label>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={removeDailyTime}
            >
              삭제
            </button>
          </div>
          <div className="row g-2">
            <div className="col-md-6">
              <label htmlFor={`dailyTime-start-${tdno}`} className="form-label mb-1 small text-secondary">
                시작 시간
              </label>
              <select
                id={`dailyTime-start-${tdno}`}
                value={currentDailyTime.startTime || ''}
                onChange={(e) => handleCurrentDailyTimeChange('startTime', e.target.value)}
                className="form-select form-select-sm"
              >
                {generateTimeOptions()}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor={`dailyTime-end-${tdno}`} className="form-label mb-1 small text-secondary">
                종료 시간
              </label>
              <select
                id={`dailyTime-end-${tdno}`}
                value={currentDailyTime.endTime || ''}
                onChange={(e) => handleCurrentDailyTimeChange('endTime', e.target.value)}
                className="form-select form-select-sm"
              >
                {generateTimeOptions()}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-secondary small">선택된 날짜에 등록된 시간 정보가 없습니다.</p>
      )}

      {/* 시간 추가 버튼 */}
      <div className="text-end mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={addDailyTime}
          disabled={!isSameDate || !!currentDailyTime || !formattedSelectedDate}
        >
          {currentDailyTime ? '생성완료' : '+ 시간 추가 (선택 날짜)'}
        </button>
      </div>

      {/* ✅ 날짜별 시간 정보 필드 끝 */}

      <hr className="my-3" />


      {/* 버튼 */}
      <div className="d-flex gap-2 mt-3 justify-content-end">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            errorContextRef.set({
              show: true,
              type: 'confirm',
              message: '변경 내용을 저장하시겠습니까?',
              onConfirm: () => {
                handleUpdate(tdno, calendarRef);
              },
            });
          }}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => {
            errorContextRef.set({
              show: true,
              type: 'confirm',
              message: '정말 삭제하시겠어요?',
              onConfirm: async () => {
                try {
                  const result = await handleDelete(tdno); // ✅ 삭제 시도 후 결과 체크

                  if (result) {
                    // ✅ FullCalendar에서도 삭제 반영
                    const calendarApi = calendarRef?.current?.getApi?.();
                    const event = calendarApi?.getEventById(String(tdno));
                    if (event) event.remove();

                    errorContextRef.set({
                      show: true,
                      type: 'success',
                      message: '할 일이 삭제되었습니다.',
                    });
                  }
                } catch (err) {
                  console.error('❌ 삭제 실패', err);
                  errorContextRef.set({
                    show: true,
                    type: 'error',
                    message: '삭제 중 오류가 발생했습니다.',
                  });
                }
              },
            });
          }}
        >
          삭제
        </button>

      </div>
    </div>
  );
};

export default TodoDetail;