package com.example.todoapp.service;

import com.example.todoapp.domain.RecurringTodo;
import com.example.todoapp.dto.RecurringTodoDTO;
import com.example.todoapp.dto.RecurringTodoWithTdnoDTO;

import java.time.LocalDate;
import java.util.List;

public interface RecurringTodoService {

    void createRecurringTodo(RecurringTodoDTO dto);

    List<RecurringTodoDTO> getRecurringTodos(Long uno);

    void updateRecurringTodo(Long rno, RecurringTodoDTO dto);

    void deleteRecurringTodo(Long rno);

    RecurringTodoDTO getRecurringTodoById(Long rno, Long uno);

    RecurringTodoWithTdnoDTO getRecurringWithTdno(Long rno, LocalDate date);

    RecurringTodo getByRno(Long rno);

}