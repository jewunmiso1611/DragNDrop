package com.example.todoapp.controller;

import com.example.todoapp.dto.RecurringTodoDTO;
import com.example.todoapp.dto.RecurringTodoWithTdnoDTO;
import com.example.todoapp.security.CustomUserDetails;
import com.example.todoapp.service.RecurringTodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recurring-todo")
public class RecurringTodoController {

    private final RecurringTodoService recurringTodoService;

    // ✅ 반복 일정 생성
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails user,
                                    @RequestBody RecurringTodoDTO dto) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(401).body("⛔ 인증되지 않은 사용자입니다.");
        }

        dto.setUno(user.getMember().getUno());
        recurringTodoService.createRecurringTodo(dto);
        return ResponseEntity.ok("✅ 반복 일정이 생성되었습니다.");
    }

    // ✅ 반복 일정 조회
    @GetMapping
    public ResponseEntity<List<RecurringTodoDTO>> list(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(401).build();
        }

        List<RecurringTodoDTO> result = recurringTodoService.getRecurringTodos(user.getMember().getUno());
        return ResponseEntity.ok(result);
    }

    // ✅ 특정 반복 일정 단건 조회
    @GetMapping("/{rno}")
    public ResponseEntity<?> getOne(@PathVariable Long rno,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(401).body("⛔ 인증되지 않은 사용자입니다.");
        }

        RecurringTodoDTO dto = recurringTodoService.getRecurringTodoById(rno, user.getMember().getUno());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{rno}/with-tdno")
    public ResponseEntity<RecurringTodoWithTdnoDTO> getRecurringWithTdno(
            @PathVariable Long rno,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        RecurringTodoWithTdnoDTO dto = recurringTodoService.getRecurringWithTdno(rno, date);
        return ResponseEntity.ok(dto);
    }


    // ✅ 반복 일정 수정
    @PutMapping("/{rno}")
    public ResponseEntity<?> update(@PathVariable Long rno,
                                    @AuthenticationPrincipal CustomUserDetails user,
                                    @RequestBody RecurringTodoDTO dto) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(401).body("⛔ 인증되지 않은 사용자입니다.");
        }

        dto.setUno(user.getMember().getUno());
        recurringTodoService.updateRecurringTodo(rno, dto);
        return ResponseEntity.ok("🔄 반복 일정이 수정되었습니다.");
    }

    // ✅ 반복 일정 삭제
    @DeleteMapping("/{rno}")
    public ResponseEntity<?> delete(@PathVariable Long rno,
                                    @AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(401).body("⛔ 인증되지 않은 사용자입니다.");
        }

        recurringTodoService.deleteRecurringTodo(rno);
        return ResponseEntity.ok("🗑 반복 일정이 삭제되었습니다.");
    }
}
