// src/components/common/Header.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TodoContext } from '../../context/TodoContext';
import TodoEditor from './todo/TodoEditor';
import TodoList from './todo/TodoList';
import SmallCalendar from './SmallCalendar';
import { useCalendar } from '../../context/CalendarContext';
import TodoItemDefault from './todo/TodoItemDefault';
import { v4 as uuidv4 } from 'uuid';
import { useStyle } from '../../context/StyleContext';

const LeftPanel = () => {
  const { user } = useContext(AuthContext);
  const { unsavedTodos, setUnsavedTodos } = useContext(TodoContext);
  const { getGradeStyle } = useStyle();
  const {
    selectedDate,
    setSelectedDate,
    currentMonthDate,
    setCurrentMonthDate,
    calendarRef,
  } = useCalendar();

  const handleAddTodo = (title, content, grade = 1) => {
    const newTodo = {
      tempId: uuidv4(),
      title,
      content,
      grade,
      isDone: false,
    };
    setUnsavedTodos((prev) => [newTodo, ...prev]);
  };

  const handleDragDone = (tempId) => {
    setUnsavedTodos((prev) => prev.filter((todo) => todo.tempId !== tempId));
  };

  const handleMonthChange = (monthDate) => {
    setCurrentMonthDate(monthDate);
    if (calendarRef?.current) {
      calendarRef.current.getApi().gotoDate(monthDate);
    }
  };

  return (
    <div className="left-panel notion-style p-2 bg-light border-end vh-100 overflow-auto">
      <div className="notion-section mb-3"> 
        <SmallCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
          currentMonthDate={currentMonthDate}
          onMonthChange={handleMonthChange}
        />
      </div>

      <div className="notion-section mb-3"> 
        <TodoEditor onAdd={handleAddTodo} />
      </div>

      <div className="notion-section mb-3">
        {unsavedTodos.length > 0 && ( 
          <TodoList onDragDone={handleDragDone} />
        )}
      </div>

      <div className="notion-section mb-3"> 
        <TodoItemDefault />
      </div>

      {/* 하단 여백 */}
      <div style={{ height: '50px' }}></div>
    </div>
  );
};

export default LeftPanel;