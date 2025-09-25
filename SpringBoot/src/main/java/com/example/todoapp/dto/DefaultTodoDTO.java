package com.example.todoapp.dto;

import com.example.todoapp.domain.DefaultTodo;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefaultTodoDTO {

    private Long dno;

    private String title;

    private String content;

    private Integer grade;

    private String dayOfWeek;

    // ✅ 멤버 식별자 (uno)
    private Long memberUno;

    // 🔁 Entity → DTO
    public static DefaultTodoDTO fromDefaultTodo(DefaultTodo entity) {
        return DefaultTodoDTO.builder()
                .dno(entity.getDno())
                .title(entity.getTitle())
                .content(entity.getContent())
                .dayOfWeek(entity.getDayOfWeek())
                .grade(entity.getGrade())
                .memberUno(entity.getUno()) // ✅ uno 필드에서 직접 꺼냄
                .build();
    }

    // 🔁 DTO → Entity
    public DefaultTodo toDefaultTodo() {
        return DefaultTodo.builder()
                .dno(this.dno)
                .title(this.title)
                .content(this.content)
                .dayOfWeek(this.dayOfWeek)
                .grade(this.grade)
                .uno(this.memberUno) // ✅ DTO → Entity로 uno 반영
                .build();
    }
}
