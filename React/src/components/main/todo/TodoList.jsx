import React, { useCallback, useContext } from 'react';
import TodoItem from './TodoItem';
import { TodoContext } from '../../../context/TodoContext'; // ✅ Context import

const TodoList = () => {
  const { unsavedTodos, setUnsavedTodos } = useContext(TodoContext); // ✅ context에서 가져오기

  // ✅ 체크 토글
  const handleToggle = useCallback(
    (tempId, isDone) => {
      setUnsavedTodos((prev) =>
        prev.map((todo) =>
          todo.tempId === tempId ? { ...todo, isDone: !isDone } : todo
        )
      );
    },
    [setUnsavedTodos]
  );

  // ✅ 수동 삭제
  const handleDelete = useCallback(
    (tempId) => {
      setUnsavedTodos((prev) => prev.filter((todo) => todo.tempId !== tempId));
    },
    [setUnsavedTodos]
  );

  // ✅ 드래그 드롭 완료 후 제거
  const handleDragDone = useCallback(
    (tempId) => {
      setUnsavedTodos((prev) => prev.filter((todo) => todo.tempId !== tempId));
    },
    [setUnsavedTodos]
  );

  return (
    <div>

      <div id="external-events">
        {unsavedTodos.length > 0 &&
          unsavedTodos.map((todo) => (
            <TodoItem
              key={todo.tempId}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onDragDone={handleDragDone}
            />
          ))}
      </div>
    </div>
  );
};

export default TodoList;
