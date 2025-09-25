package com.example.todoapp.service;

import com.example.todoapp.dto.MemberDTO;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MemberService {

    void register(MemberDTO dto);

    Map<String, Object> handleLogin(String userid, String userpw);

    MemberDTO findByUserid(String userid);


    boolean isUseridDuplicate(String userid);

    List<String> findUseridsByEmail(String email);

    String verifyMemberForPasswordReset(String userid, String email);

    void resetPassword(MemberDTO dto);
}
