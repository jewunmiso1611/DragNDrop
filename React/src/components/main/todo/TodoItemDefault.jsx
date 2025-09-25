import React, { useEffect, useState } from 'react';
import { useTodo } from '../../../context/TodoContext';
import { fetchDefaultCards } from '../../../api/defaultTodoApi';
import { useStyle } from '../../../context/StyleContext';

const TodoItemDefault = () => {
  const [defaultList, setDefaultList] = useState([]);
  const [showDefaultCards, setShowDefaultCards] = useState(false);
  const { setUnsavedTodos } = useTodo();
  const { getGradeStyle } = useStyle();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDefaultCards();
        setDefaultList(data);
      } catch (err) {
        console.error('기본 할 일 카드 불러오기 실패:', err);
      }
    };
    load();
  }, []);

  const handleSelect = (todo) => {
    const newTodo = {
      tempId: Date.now().toString(),
      title: todo.title,
      content: todo.content,
      grade: todo.grade ?? 1,
      isDone: false,
    };
    setUnsavedTodos((prev) => [newTodo, ...prev]);
  };

  return (
    <div
      className="notion-default-templates-section mb-3 p-2 border rounded-3 bg-white shadow-sm"
      style={{
        maxWidth: '400px',
        marginRight: 'auto',
      }}
    >
      <h6
        className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer fw-semibold transition text-sm mb-3"
        style={{ color: '#6c757d' }}
        onClick={() => setShowDefaultCards((prev) => !prev)}
      >
        <span>기본 카드 템플릿</span>
        <span className="ms-2 text-primary">{showDefaultCards ? '▲' : '▼'}</span>
      </h6>

      <div className={`collapse ${showDefaultCards ? 'show' : ''}`}>
        <div
          className="d-flex flex-column gap-2 mt-2"
          style={{ maxHeight: '360px', overflowY: 'auto' }}
        >
          {defaultList.map((todo) => {
            const style = getGradeStyle(todo.grade || 1); // ✅ 등급별 스타일 적용
            return (
              <div
                key={todo.dno}
                className="card shadow-none p-3 cursor-pointer default-template-card"
                onClick={() => handleSelect(todo)}
                style={{
                  backgroundColor: style.backgroundColor,
                  borderColor: style.borderColor,
                  color: style.textColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                <div className="text-warning small mb-1">
                  {'⭐'.repeat(todo.grade || 1)}
                </div>
                <p className="card-title fw-medium mb-1 text-xs">{todo.title}</p>
                <p
                  className="card-text text-muted mb-0 text-xs"
                  style={{ fontSize: '0.6rem' }}
                >
                  {todo.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoItemDefault;