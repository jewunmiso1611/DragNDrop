package com.example.todoapp.service;

import com.example.todoapp.dto.DefaultTodoDTO;
import com.example.todoapp.dto.MemberDTO;

import java.util.List;

public interface MyPageService {

    // 회원정보 관련
    MemberDTO getMyInfo(String userid);// 로그인한 유저 정보 가져오기
    void updateInfo(MemberDTO dto);                 // 회원정보 수정
    void deleteMember(String userid);               // 회원 탈퇴

    // Default 카드 관련
    List<DefaultTodoDTO> getAllDefaultTodos(Long uno);               // 전체 기본 카드 조회
    void updateDefaultTodo(Long dno, DefaultTodoDTO dto);  // 기본 카드 제목 수정

}
