package com.example.todoapp.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recurring_todo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rno;

//    // ✅ 외래키 컬럼으로 DB에 저장될 uno (insert/update용)
//    @Column(name = "uno")
//    private Long uno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno", nullable = false)
    private Member member; // uno는 member 객체를 통해 관리

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "tdno", nullable = false)
//    private Todo todo;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(nullable = false)
    private Integer grade;

    @Column(name = "day_of_week", nullable = false, length = 50)
    private String dayOfWeek;

    @Column(name = "repeat_type", nullable = false, length = 20)
    private String repeatType; // DAILY, WEEKLY, MONTHLY 등

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    // ✅ 변경된 부분: boolean 대신 Integer 사용 및 columnDefinition 추가
    @Column(name = "is_active", nullable = false, columnDefinition = "NUMBER(1) DEFAULT 1")
    @Builder.Default // Builder 사용 시 기본값 설정 (선택 사항)
    private Integer isActive = 1; // 1은 TRUE, 0은 FALSE를 의미

    @OneToMany(mappedBy = "recurringTodo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Todo> todos = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDate.now();
    }

    // 편의 메서드 (선택 사항)
    public boolean getIsActiveBoolean() {
        return this.isActive != null && this.isActive == 1;
    }

    public void setIsActiveBoolean(boolean isActive) {
        this.isActive = isActive ? 1 : 0;
    }
}