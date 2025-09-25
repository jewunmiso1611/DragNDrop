import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { errorContextRef } from '../../../context/errorContextRef';
import { useTodo } from '../../../context/TodoContext';
import { useStyle } from '../../../context/StyleContext';

const TodoEditor = ({ onAdd }) => {
  const { user } = useContext(AuthContext);
  const { newTodo, setNewTodo, unsavedTodos } = useTodo(); // ✅ unsavedTodos 가져오기
  const { title, content, grade } = newTodo;
  const { getGradeStyle } = useStyle();
  const style = getGradeStyle(grade);

  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!title.trim()) {
        errorContextRef.set('제목을 입력하세요!');
        return;
      }

      try {
        await onAdd(title, content, grade);
        setNewTodo({ title: '', content: '', grade: 1 });
        setIsOpen(false);
      } catch (err) {
        console.error('할 일 등록 실패:', err);
        errorContextRef.set('등록 중 오류가 발생했습니다.');
      }
    },
    [title, content, grade, onAdd, setNewTodo]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div
      // Main container with card-like styling
      className="notion-editor-section mb-3 p-2 border rounded-3 bg-white shadow-sm"
      style={{
        maxWidth: '400px',
        marginRight: 'auto',
        backgroundColor: style.backgroundColor, // ✅ 등급에 따른 배경색 적용
        borderColor: style.borderColor,
        color: style.textColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <h6
        className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer fw-semibold hover-bg-light transition text-sm mb-3" // Added mb-3 for spacing
        style={{ color: '#6c757d' }} // Custom color for the header text to match text-body-secondary
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>새로운 할 일 작성</span>
        <span className="ms-2 text-primary">{isOpen ? '▲' : '▼'}</span>
      </h6>

      <div className={`collapse ${isOpen ? 'show' : ''}`}>
        {/* The form background and border are now handled by the outer div */}
        <form onSubmit={handleSubmit} className="p-0"> {/* Removed p-3, border, bg-light */}
          <div className="mb-3 d-flex align-items-center">
            <label htmlFor="todoGrade" className="form-label mb-0 me-2 text-nowrap small fw-bold" style={{ color: '#495057' }}>
              중요도:
            </label>
            <select
              id="todoGrade"
              className="form-select form-select-sm bg-light border" // Added bg-light border for consistent look
              style={{
                maxWidth: '120px',
                fontSize: '0.8rem',
                lineHeight: '1.2',
                padding: '0.2rem 0.4rem',
                height: '2rem',
              }}
              value={grade}
              onChange={(e) =>
                setNewTodo((prev) => ({ ...prev, grade: Number(e.target.value) }))
              }
            >
              <option value={1}>⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={5}>⭐⭐⭐⭐⭐</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-sm border bg-light shadow-none p-2 fw-bold" // Added border, bg-light, p-2
              placeholder="제목 (필수)"
              value={title}
              onChange={(e) =>
                setNewTodo((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mb-3">
            <textarea
              className="form-control form-control-sm border bg-light shadow-none p-2" // Added border, bg-light, p-2
              placeholder="내용 (선택)"
              value={content}
              onChange={(e) =>
                setNewTodo((prev) => ({ ...prev, content: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              rows="3"
            />
          </div>

          <div className="d-grid">
            <button className="btn btn-primary btn-sm" type="submit">
              등록
            </button>
          </div>
        </form>
      </div>

      {unsavedTodos.length === 0 && (
        <p className="text-muted mt-3 small">📝 Todo 카드가 없습니다.</p> // Adjusted mt-2 to mt-3
      )}
    </div>
  );
};

export default TodoEditor;
