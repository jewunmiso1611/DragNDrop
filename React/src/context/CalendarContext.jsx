import { createContext, useContext, useRef, useState } from 'react';

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const calendarRef = useRef(null);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        currentMonthDate,
        setCurrentMonthDate,
        calendarRef,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
