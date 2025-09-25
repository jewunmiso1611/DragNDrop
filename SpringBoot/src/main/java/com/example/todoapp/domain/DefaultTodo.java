package com.example.todoapp.domain;

import jakarta.persistence.*;
        import lombok.*;

@Entity
@Table(name = "default_todo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefaultTodo {

    @Id
    @Column(name = "dno")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dno;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(nullable = false)
    private Integer grade;

    @Column(name = "day_of_week")
    private String dayOfWeek;

    // ✅ 외래키 컬럼으로 DB에 저장될 uno (insert/update용)
    @Column(name = "uno")
    private Long uno;

    // ✅ 읽기 전용: 실제 연관된 Member 객체 조회용
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno", insertable = false, updatable = false)
    private Member member;
}

