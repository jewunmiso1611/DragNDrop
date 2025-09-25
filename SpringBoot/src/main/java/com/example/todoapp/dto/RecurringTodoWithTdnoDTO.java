package com.example.todoapp.dto;

import com.example.todoapp.domain.RecurringTodo;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class RecurringTodoWithTdnoDTO {
    private Long rno;
    private String title;
    private String content;
    private int grade;
    private String repeatType;
    private String dayOfWeek;
    private LocalDate startDate;
    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private boolean isActive;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    private Long tdno; // 🔥 오늘 생성된 Todo의 tdno (없으면 null)

    public static RecurringTodoWithTdnoDTO from(RecurringTodo entity, Long tdno) {
        return RecurringTodoWithTdnoDTO.builder()
                .rno(entity.getRno())
                .title(entity.getTitle())
                .content(entity.getContent())
                .grade(entity.getGrade())
                .repeatType(entity.getRepeatType())
                .dayOfWeek(entity.getDayOfWeek())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .isActive(entity.getIsActiveBoolean())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .tdno(tdno) // 오늘 해당 rno로 생성된 todo의 tdno
                .build();
    }
}

