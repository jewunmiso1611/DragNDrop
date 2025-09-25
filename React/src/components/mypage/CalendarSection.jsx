import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { errorContextRef } from '../../context/errorContextRef';
import { fetchCalendarTodos } from '../../api/mypageApi'; // ✅ API 모듈에서 가져옴

const CalendarSection = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  const loadCalendarEvents = async () => {
    try {
      const data = await fetchCalendarTodos(user.uno); // ✅ API 호출
      setEvents(data);
    } catch (err) {
      errorContextRef.set({ show: true, message: '일정 조회 실패' });
    }
  };

  useEffect(() => {
    if (user?.uno) loadCalendarEvents();
  }, [user]);

  return (
    <div className="mb-5">
      <h4>내 주요 일정</h4>
      {events.length === 0 ? (
        <p>등록된 일정이 없습니다.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>제목</th>
                <th>중요도</th>
                <th>시작일</th>
                <th>종료일</th>
                <th>완료 여부</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.tdno}>
                  <td>{event.title}</td>
                  <td>{'⭐'.repeat(event.grade)}</td>
                  <td>{event.startDate}</td>
                  <td>{event.endDate}</td>
                  <td>{event.isDone ? '✅ 완료' : '❌ 미완료'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CalendarSection;
