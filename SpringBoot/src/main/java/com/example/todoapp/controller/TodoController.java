package com.example.todoapp.controller;

import com.example.todoapp.domain.Todo;
import com.example.todoapp.dto.TodoDTO;
import com.example.todoapp.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/todo")
public class TodoController {

    private final TodoService todoService;

    // ✅ 전체 목록 조회
    @GetMapping("/list/{uno}")
    public ResponseEntity<List<TodoDTO>> getTodoList(@PathVariable Long uno) {
        return ResponseEntity.ok(todoService.getTodoList(uno));
    }

    // ✅ 단건 조회
    @GetMapping("/{tdno}")
    public ResponseEntity<TodoDTO> getTodo(@PathVariable Long tdno, @RequestParam Long uno) {
        return ResponseEntity.ok(todoService.getTodo(tdno, uno));
    }

    // ✅ 등록
    @PostMapping
    public ResponseEntity<TodoDTO> create(@RequestBody TodoDTO dto, @RequestParam Long uno) {
        dto.setMemberUno(uno);
        Todo saved = todoService.saveWithDailyTimes(dto);
        return ResponseEntity.ok(TodoDTO.fromTodo(saved, saved.getDailyTimes()));
    }

    // ✅ 수정
    @PutMapping
    public ResponseEntity<TodoDTO> update(@RequestBody TodoDTO dto, @RequestParam Long uno) {
        return ResponseEntity.ok(todoService.updateTodo(dto, uno));
    }

    // ✅ 삭제
    @DeleteMapping("/{tdno}")
    public ResponseEntity<Void> delete(@PathVariable Long tdno, @RequestParam Long uno) {
        todoService.deleteTodo(tdno, uno);
        return ResponseEntity.noContent().build();
    }

    // ✅ 완료 처리
    @PostMapping("/{tdno}/complete")
    public ResponseEntity<Void> complete(@PathVariable Long tdno, @RequestParam Long uno) {
        todoService.completeTodo(tdno, uno);
        return ResponseEntity.ok().build();
    }

    // ✅ 완료 해제
    @DeleteMapping("/{tdno}/complete")
    public ResponseEntity<Void> cancelComplete(@PathVariable Long tdno, @RequestParam Long uno) {
        todoService.cancelComplete(tdno, uno);
        return ResponseEntity.noContent().build();
    }
}
