package com.example.todoapp.controller;

import com.example.todoapp.dto.AutoInsertDTO;
import com.example.todoapp.dto.DefaultTodoDTO;
import com.example.todoapp.security.CustomUserDetails;
import com.example.todoapp.service.DefaultTodoService;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/default-todo")
public class DefaultTodoController {

    private final DefaultTodoService defaultTodoService;

    // ✅ 기본 카드 조회 (공용 + 유저 카드)
    @GetMapping("/list")
    public ResponseEntity<?> getAllDefaultTodos(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getMember() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보 없음");
        }

        Long uno = user.getMember().getUno();
        List<DefaultTodoDTO> result = defaultTodoService.getAll(uno);
        return ResponseEntity.ok(result);
    }


    @PostMapping("/new")
    public ResponseEntity<?> createDefaultTodo(
            @RequestBody DefaultTodoDTO dto,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보 없음");
        }

        dto.setMemberUno(user.getMember().getUno()); // ✅ uno를 DTO에 설정
        defaultTodoService.create(dto); // ✅ uno 따로 안 넘김

        return ResponseEntity.ok().body("기본 카드가 성공적으로 생성되었습니다.");
    }

    // ✅ 기본 카드 수정
    @PutMapping("/{dno}")
    public void updateDefaultTodo(@PathVariable Long dno, @RequestBody DefaultTodoDTO dto,
                                  @AuthenticationPrincipal CustomUserDetails user) {
        Long uno = user.getMember().getUno();
        defaultTodoService.update(dno, dto, uno);
    }

    // ✅ 기본 카드 삭제
    @DeleteMapping("/{dno}")
    public void deleteDefaultTodo(@PathVariable Long dno, @AuthenticationPrincipal CustomUserDetails user) {
        Long uno = user.getMember().getUno();
        defaultTodoService.delete(dno, uno);
    }

    @PostMapping("/auto-insert")
    public ResponseEntity<?> insertDefaultTodosByDates(
            @RequestBody AutoInsertDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails user) {
        defaultTodoService.insertDefaultTodosByDates(requestDTO);
        return ResponseEntity.ok().body("✅ 기본 카드가 지정된 기간/요일에 자동 등록되었습니다.");
    }
}

