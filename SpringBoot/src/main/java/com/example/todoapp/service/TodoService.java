package com.example.todoapp.service;

import com.example.todoapp.domain.Todo;
import com.example.todoapp.dto.TodoDTO;

import java.util.List;

public interface TodoService {

    // 할 일 등록
    TodoDTO createTodo(TodoDTO dto, Long uno);

    // 사용자별 할 일 전체 조회
    List<TodoDTO> getTodoList(Long uno);

    // 단일 할 일 조회
    TodoDTO getTodo(Long tdno, Long uno);  // ✅ 추가된 메서드

    // 할 일 수정
    TodoDTO updateTodo(TodoDTO dto, Long uno);

    // 할 일 삭제
    void deleteTodo(Long tdno, Long uno);

    // 할 일 완료 처리
    void completeTodo(Long tdno, Long uno);

    // 완료 해제
    void cancelComplete(Long tdno, Long uno);

    Todo saveWithDailyTimes(TodoDTO dto);
}
