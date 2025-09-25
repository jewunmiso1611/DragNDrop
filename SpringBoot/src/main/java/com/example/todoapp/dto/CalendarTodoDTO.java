package com.example.todoapp.dto;

import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarTodoDTO {

    private Long tdno;
    private String title;
    private String content;
    private int grade;

    private LocalDate startDate;
    private LocalDate endDate;

    private Long rno;

    @JsonProperty("isDone")
    private boolean isDone;

    private LocalDate doneDate;
    private Long memberUno;

    // ✅ 하루 단위 시간 정보 리스트 (요청/응답 시 포함됨)
    private List<TodoDailyTimeDTO> dailyTimes;

    // ✅ Entity → DTO 변환
    public static CalendarTodoDTO fromTodo(Todo todo) {
        return CalendarTodoDTO.builder()
                .tdno(todo.getTdno())
                .title(todo.getTitle())
                .content(todo.getContent())
                .grade(todo.getGrade())
                .rno(todo.getRecurringTodo() != null ? todo.getRecurringTodo().getRno() : null)
                .startDate(todo.getStartDate())
                .endDate(todo.getEndDate())
                .isDone("Y".equalsIgnoreCase(todo.getIsDone()))
                .doneDate(todo.getDoneDate())
                .memberUno(todo.getMember().getUno())
                .dailyTimes(todo.getDailyTimes() != null
                        ? todo.getDailyTimes().stream()
                        .map(TodoDailyTimeDTO::fromEntity)
                        .collect(Collectors.toList())
                        : null)
                .build();
    }
}
