package com.example.todoapp.controller;

import com.example.todoapp.dto.DefaultTodoDTO;
import com.example.todoapp.dto.MemberDTO;
import com.example.todoapp.security.CustomUserDetails;
import com.example.todoapp.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    // ✅ [1] 회원 정보 조회
    @GetMapping("/info")
    public ResponseEntity<MemberDTO> getMyInfo(@RequestParam String userid) {
        return ResponseEntity.ok(myPageService.getMyInfo(userid));
    }

    // ✅ [2] 회원 정보 수정
    @PutMapping("/update")
    public ResponseEntity<Void> updateInfo(@RequestBody MemberDTO dto) {
        myPageService.updateInfo(dto);
        return ResponseEntity.ok().build();
    }

    // ✅ [3] 회원 탈퇴
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteAccount(@RequestParam String userid) {
        myPageService.deleteMember(userid);
        return ResponseEntity.ok().build();
    }

}
