package com.example.todoapp.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList; // ✅ 추가
import java.util.List;      // ✅ 추가

@Entity
@Table(name = "todo")
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tdno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rno", nullable = true)
    private RecurringTodo recurringTodo;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(nullable = false)
    private int grade = 1;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_done", nullable = false, columnDefinition = "CHAR(1) DEFAULT 'N'")
    private String isDone = "N";

    @Column(name = "done_date")
    private LocalDate doneDate;

    @Column(name = "rno", insertable = false, updatable = false)
    private Long rno;

    // ✅ TodoDailyTime 컬렉션 추가
    // cascade = CascadeType.ALL: Todo가 저장/삭제될 때 TodoDailyTime도 함께 처리
    // orphanRemoval = true: TodoDailyTime이 컬렉션에서 제거될 때 DB에서도 삭제
    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Builder 사용 시 기본값 설정
    private List<TodoDailyTime> dailyTimes = new ArrayList<>(); // ✅ 새로운 필드

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDate.now();
    }

    // ✅ 편의 메소드: TodoDailyTime 추가 시 양방향 관계 설정
    public void addDailyTime(TodoDailyTime dailyTime) {
        if (this.dailyTimes == null) {
            this.dailyTimes = new ArrayList<>();
        }
        this.dailyTimes.add(dailyTime);
        dailyTime.setTodo(this);
    }

    // ✅ 편의 메소드: TodoDailyTime 제거 시 양방향 관계 해제
    public void removeDailyTime(TodoDailyTime dailyTime) {
        this.dailyTimes.remove(dailyTime);
        dailyTime.setTodo(null);
    }
}