package com.example.todoapp.dto;

import com.example.todoapp.domain.RecurringTodo;
import com.example.todoapp.domain.Member;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTodoDTO {

    private Long rno;
    private Long uno;
    private String title;
    private String content;
    private Integer grade;

    private String repeatType; // DAILY, WEEKLY, MONTHLY
    private String dayOfWeek;  // 예: "MON,WED,FRI"

    private LocalDate startDate;
    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime; // ✅ 추가됨

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;   // ✅ 추가됨

    private LocalDate createdAt;
    private LocalDate updatedAt;

    private boolean isActive;

    private Long tdno;

    // ✅ Entity → DTO 변환
    public static RecurringTodoDTO fromEntity(RecurringTodo entity) {
        return RecurringTodoDTO.builder()
                .rno(entity.getRno())
                .uno(entity.getMember().getUno())
                .title(entity.getTitle())
                .content(entity.getContent())
                .grade(entity.getGrade())
                .repeatType(entity.getRepeatType())
                .dayOfWeek(entity.getDayOfWeek())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .startTime(entity.getStartTime()) // ✅
                .endTime(entity.getEndTime())     // ✅
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .isActive(entity.getIsActiveBoolean())
//                .tdno(entity.getTodo().getTdno())
                .build();
    }

    // ✅ DTO → Entity 변환
    public RecurringTodo toEntity(Member member) {
        return RecurringTodo.builder()
                .rno(this.rno)
                .member(member)
                .title(this.title)
                .content(this.content)
                .grade(this.grade)
                .repeatType(this.repeatType)
                .dayOfWeek(this.dayOfWeek)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .startTime(this.startTime) // ✅
                .endTime(this.endTime)     // ✅
                .isActive(this.isActive ? 1 : 0)
                .build();
    }
}
