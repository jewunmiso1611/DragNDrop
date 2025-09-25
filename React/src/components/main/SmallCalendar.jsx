
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const SmallCalendar = ({
  selectedDate,
  onDateSelect,
  currentMonthDate,
  onMonthChange,
}) => {
  return (
    <div className="card border-0 bg-white rounded-3 shadow-sm p-3 mb-3">
      <div className="d-flex justify-content-center"> {/* 캘린더를 중앙 정렬 */}
        <div style={{ maxWidth: '200px' }}> {/* 캘린더의 최대 너비를 약 절반 정도로 설정 */}
          <Calendar
            onChange={onDateSelect}
            value={selectedDate}
            activeStartDate={currentMonthDate}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) {
                onMonthChange(activeStartDate);
              }
            }}
            calendarType="gregory"
            locale="ko-KR"
            showNavigation={true}
            formatMonthYear={(locale, date) =>
              `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
            }
            formatDay={(locale, date) => date.getDate()}
            next2Label={null}
            prev2Label={null}
            showNeighboringMonth={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SmallCalendar;