package com.example.todoapp.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "default_card")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DefaultCard {

    @Id
    @Column(name = "cdno")
    private Long cdno;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(nullable = false)
    private Integer grade;

    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek;


}