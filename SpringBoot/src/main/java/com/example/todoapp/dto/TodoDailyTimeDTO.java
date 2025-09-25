package com.example.todoapp.dto;

import com.example.todoapp.domain.TodoDailyTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime; // LocalTime 임포트

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoDailyTimeDTO {
    private Long tno; // TodoDailyTime의 고유 ID (선택 사항이지만, 수정/삭제 시 필요)

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private LocalDate targetDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    // 엔티티 -> DTO 변환 메소드
    public static TodoDailyTimeDTO fromEntity(TodoDailyTime entity) {
        return TodoDailyTimeDTO.builder()
                .tno(entity.getTno())
                .targetDate(entity.getTargetDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .build();
    }
}