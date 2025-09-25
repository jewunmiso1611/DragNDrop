package com.example.todoapp.controller;

import com.example.todoapp.domain.Member;
import com.example.todoapp.dto.MemberDTO;
import com.example.todoapp.exception.CustomLoginException;
import com.example.todoapp.security.JwtUtil;
import com.example.todoapp.service.DefaultTodoService;
import com.example.todoapp.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;
    private final DefaultTodoService defaultTodoService;


    // 🔹 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody MemberDTO dto) {
        memberService.register(dto);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 🔹 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String userid = request.get("userid");
        String userpw = request.get("userpw");

        // ✅ 전체 로그인 처리 책임은 Service로 위임
        Map<String, Object> result = memberService.handleLogin(userid, userpw);

        return ResponseEntity.ok(result);
    }

    // 🔹 아이디로 유저 정보 조회 (마이페이지용 등)
    @GetMapping("/{userid}")
    public ResponseEntity<MemberDTO> getMember(@PathVariable String userid) {
        MemberDTO dto = memberService.findByUserid(userid);
        return ResponseEntity.ok(dto);
    }

    // 🔹 이메일로 아이디 찾기
    @GetMapping("/find-id")
    public ResponseEntity<?> findUserids(@RequestParam String email) {
        List<String> userids = memberService.findUseridsByEmail(email);
        return ResponseEntity.ok(Map.of("userids", userids));
    }

    // 🔹 pw변경전 아이디, 이메일 확인
    @GetMapping("/find-pw")
    public ResponseEntity<?> findPassword(@RequestParam String userid, @RequestParam String email) {
        String message = memberService.verifyMemberForPasswordReset(userid, email);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/reset-pw")
    public ResponseEntity<?> resetPassword(@RequestBody MemberDTO dto) {
        memberService.resetPassword(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/info")
    public ResponseEntity<?> getMemberInfo(Principal principal) {
        // 🔍 principal이 null일 수 있으므로 반드시 체크!
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or missing token");
        }

        String userid = principal.getName();
        MemberDTO dto = memberService.findByUserid(userid);
        return ResponseEntity.ok(dto);
    }

    // ✅ 아이디 중복 확인 API
    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkDuplicateUserid(@RequestParam String userid) {
        boolean isDuplicate = memberService.isUseridDuplicate(userid);
        return ResponseEntity.ok(isDuplicate);  // true면 중복됨
    }

}
