package com.example.todoapp.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "todo_daily_time")
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TodoDailyTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tno; // 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tdno", nullable = false)
    private Todo todo; // Todo 엔티티와의 N:1 관계 (하나의 Todo는 여러 TodoDailyTime을 가질 수 있음)

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate; // 이 시간 정보가 적용되는 특정 날짜

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // ✅ 생성일 필드 추가
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;

    // ✅ 수정일 필드 추가
    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

    // ✅ 엔티티가 영속화되기 전 호출 (생성 시점 기록)
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    // ✅ 엔티티가 업데이트되기 전 호출 (수정 시점 기록)
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDate.now();
        this.targetDate = LocalDate.now();
    }
}