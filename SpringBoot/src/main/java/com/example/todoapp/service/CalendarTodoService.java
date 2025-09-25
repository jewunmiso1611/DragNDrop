package com.example.todoapp.service;

import com.example.todoapp.dto.CalendarTodoDTO;
import com.example.todoapp.dto.TodoDTO;
import com.example.todoapp.dto.TodoDailyTimeDTO;

import java.time.LocalDate;
import java.util.List;

public interface CalendarTodoService {

    // 드래그된 todo 저장
    CalendarTodoDTO register(CalendarTodoDTO dto);

    // 특정 날짜에 배치된 todo 목록 조회
    List<CalendarTodoDTO> getByDate(Long memberUno, LocalDate date);

    public List<CalendarTodoDTO> getListByMember(Long uno);

    void updateTargetDate(Long tdno, LocalDate startDate, LocalDate endDate, List<TodoDailyTimeDTO> dailyTimes);

    CalendarTodoDTO editCalendarTodo(CalendarTodoDTO dto);

    void delete(Long tdno);

    void markDone(Long tdno, boolean done);

}
