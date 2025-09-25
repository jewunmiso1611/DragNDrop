package com.example.todoapp.service;

import com.example.todoapp.domain.DefaultTodo;
import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.RecurringTodo;
import com.example.todoapp.dto.DefaultTodoDTO;
import com.example.todoapp.dto.MemberDTO;
import com.example.todoapp.exception.ApiException;
import com.example.todoapp.repository.DefaultTodoRepository;
import com.example.todoapp.repository.MemberRepository;
import com.example.todoapp.repository.RecurringTodoRepository;
import com.example.todoapp.repository.TodoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MyPageServiceImpl implements MyPageService {

    private final MemberRepository memberRepository;
    private final DefaultTodoRepository defaultTodoRepository;
    private final TodoRepository todoRepository;
    private final RecurringTodoRepository recurringTodoRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ 1. 회원정보 가져오기
    @Override
    public MemberDTO getMyInfo(String userid) {
        Member member = memberRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
        return MemberDTO.fromMember(member);
    }

    // ✅ 2. 회원정보 수정
    @Override
    public void updateInfo(MemberDTO dto) {
        Member member = memberRepository.findByUserid(dto.getUserid())
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND"));  // 코드 수정

        member.setNickname(dto.getNickname());
        member.setEmail(dto.getEmail());
        member.setGender(dto.getGender());

        // 🔐 비밀번호 변경 처리
        if (dto.getUserpw() != null && !dto.getUserpw().isBlank()) {
            // 현재 비밀번호가 일치하는지 확인
            if (!passwordEncoder.matches(dto.getUserpw(), member.getUserpw())) {
                throw new ApiException("WRONG_PASSWORD");  // 코드 수정
            }

            if (dto.getNewUserpw() != null && !dto.getNewUserpw().isBlank()) {
                member.setUserpw(passwordEncoder.encode(dto.getNewUserpw()));
            }
        }

        memberRepository.save(member);
    }

    // ✅ 3. 회원 탈퇴
    @Override
    public void deleteMember(String userid) {
        Member member = memberRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
        todoRepository.deleteByMember(member);
        defaultTodoRepository.deleteByMember(member);
        recurringTodoRepository.deleteByMember(member);
        memberRepository.delete(member);
    }

    // ✅ 4. 기본 카드 전체 조회
    @Override
    public List<DefaultTodoDTO> getAllDefaultTodos(Long uno) {
        return defaultTodoRepository.findByMemberUnoOrMemberIsNull(uno)
                .stream()
                .map(DefaultTodoDTO::fromDefaultTodo)
                .collect(Collectors.toList());
    }

    // ✅ 5. 기본 카드 제목 수정
    @Override
    public void updateDefaultTodo(Long dno, DefaultTodoDTO dto) {
        DefaultTodo todo = defaultTodoRepository.findById(dno)
                .orElseThrow(() -> new RuntimeException("기본 카드를 찾을 수 없습니다."));

        // 제목, 내용, 중요도 수정
        todo.setTitle(dto.getTitle());
        todo.setContent(dto.getContent());
        todo.setGrade(dto.getGrade());

        defaultTodoRepository.save(todo);
    }
}
