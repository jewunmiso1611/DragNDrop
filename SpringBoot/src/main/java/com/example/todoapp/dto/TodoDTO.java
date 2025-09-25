package com.example.todoapp.dto;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoDTO {

    private Long tdno;

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    private String content;

    private int grade;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    private boolean isDone;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate doneDate;

    private Long memberUno;
    private String memberNickname;

    private LocalDate startDate;
    private LocalDate endDate;

    private List<TodoDailyTimeDTO> dailyTimes;

    // DTO → Entity
    public Todo toTodo(Member member) {
        return Todo.builder()
                .tdno(this.tdno)
                .title(this.title)
                .content(this.content)
                .grade(this.grade)
                .member(member)
                .startDate(startDate)
                .endDate(endDate)
                .isDone(this.isDone ? "Y" : "N")
                .doneDate(this.doneDate)
                .build();
    }

    // Entity → DTO
    public static TodoDTO fromTodo(Todo todo, List<TodoDailyTime> dailyTimes) {
        return TodoDTO.builder()
                .tdno(todo.getTdno())
                .title(todo.getTitle())
                .content(todo.getContent())
                .grade(todo.getGrade())
                .memberUno(todo.getMember().getUno())
                .memberNickname(todo.getMember().getNickname())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .isDone("Y".equals(todo.getIsDone()))
                .doneDate(todo.getDoneDate())
                .startDate(todo.getStartDate())
                .endDate(todo.getEndDate())
                .dailyTimes(
                        dailyTimes == null ? List.of() :
                                dailyTimes.stream()
                                        .map(TodoDailyTimeDTO::fromEntity)
                                        .collect(Collectors.toList())
                )
                .build();
    }

    public static TodoDTO fromTodo(Todo todo) {
        return fromTodo(todo, null); // 또는 todo.getDailyTimes()로 연결도 가능
    }
}
