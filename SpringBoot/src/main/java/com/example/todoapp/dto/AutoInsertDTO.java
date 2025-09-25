package com.example.todoapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime; // ✅ LocalTime 임포트
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoInsertDTO {
    private Long dno;              // 기본 카드 ID
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> days;
    private Long memberUno;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime; // ✅ 새로운 필드

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;   // ✅ 새로운 필드
}