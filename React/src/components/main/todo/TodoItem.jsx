import React, { useRef } from 'react';
import { useStyle } from '../../../context/StyleContext';

const TodoItem = ({ todo, onDelete }) => {
  const { tempId, title, grade, content } = todo;
  const itemRef = useRef(null);

  const { getGradeStyle } = useStyle();
  const style = getGradeStyle(grade ?? 1);

  const gradeText = {
    1: '⭐',
    2: '⭐⭐',
    3: '⭐⭐⭐',
    4: '⭐⭐⭐⭐',
    5: '⭐⭐⭐⭐⭐',
  }[grade] || '⭐';

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.setData("todo", JSON.stringify(todo));
    e.dataTransfer.effectAllowed = 'move';

    if (itemRef.current) {

      e.dataTransfer.setDragImage(new Image(), 0, 0);
      itemRef.current.style.opacity = '0.5';
    }

    const handleDragEnd = () => {
      if (itemRef.current) {
        itemRef.current.style.opacity = '1';
      }
      e.currentTarget.removeEventListener('dragend', handleDragEnd);
    };
    e.currentTarget.addEventListener('dragend', handleDragEnd);
  };

  return (
    <div
      ref={itemRef}
      className="todo-card card card-body p-2 mb-3 cursor-move d-flex align-items-start"
      draggable
      onDragStart={handleDragStart}
      style={{
        // backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.textColor,
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
      data-todo={JSON.stringify({
        tempId: tempId,
        title: title ?? '제목 없음',
        content: content ?? '내용 없음',
        grade: grade ?? 1,
      })}
      data-event={JSON.stringify({
        title: title ?? '제목 없음',
        duration: "01:00",
        extendedProps: {
          tempId: tempId,
          content: content ?? '내용 없음',
          grade: grade ?? 1,
        }
      })}
    >
      <button
        onClick={() => onDelete(tempId)}
        className="btn-close position-absolute top-0 end-0 mt-2 me-2"
        aria-label="삭제"
      ></button>

      <div className="d-flex flex-column flex-grow-1 me-4">
        <div className="text-warning small mb-1">
          {gradeText}
        </div>

        <div className="text-dark small break-words fw-bold">
          {title}
        </div>

        {content && <div className="text-muted small mt-1">{content}</div>}
      </div>
    </div>
  );
};

export default TodoItem;