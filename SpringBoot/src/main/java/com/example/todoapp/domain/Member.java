package com.example.todoapp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "member")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uno;

    @Column(nullable = false, unique = true, length = 50)
    private String userid;

    @Column(nullable = false, length = 100)
    private String userpw;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 1)
    private String gender; // 'M' or 'F'

    @Column(name = "created_at", nullable = true)  // ✅ 명시적 표시
    private LocalDate createdAt;

    @Column(name = "updated_at", nullable = true)  // ✅ 명시적 표시
    private LocalDate updatedAt;

    public void changePw(String encodedPw) {
        this.userpw = encodedPw;
    }
}
