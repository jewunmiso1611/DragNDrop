package com.example.todoapp.service;

import com.example.todoapp.domain.DefaultCard;
import com.example.todoapp.domain.DefaultTodo;
import com.example.todoapp.domain.Member;
import com.example.todoapp.dto.MemberDTO;
import com.example.todoapp.exception.CustomLoginException;
import com.example.todoapp.repository.DefaultCardRepository;
import com.example.todoapp.repository.DefaultTodoRepository;
import com.example.todoapp.repository.MemberRepository;
import com.example.todoapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final DefaultTodoRepository defaultTodoRepository;
    private final DefaultCardRepository defaultCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public void register(MemberDTO dto) {

        // 1. 비밀번호 암호화
        dto.setUserpw(passwordEncoder.encode(dto.getUserpw()));

        // 2. DTO → Entity 변환
        Member member = dto.toMember();

        // 3. 회원 저장 (uno 생성)
        memberRepository.save(member);
        Long userUno = member.getUno();

        // 4. 기본 카드 생성
        if (dto.isCreateDefaultCard()) {
            List<DefaultCard> templates = defaultCardRepository.findAll();

            List<DefaultTodo> userDefaults = templates.stream()
                    .map(card -> DefaultTodo.builder()
                            .title(card.getTitle())
                            .content(card.getContent())
                            .grade(card.getGrade())
                            .dayOfWeek(card.getDayOfWeek())
                            .uno(userUno)
                            .member(member)
                            .build())
                    .collect(Collectors.toList());

            defaultTodoRepository.saveAll(userDefaults);
        }
    }




    @Override
    public Map<String, Object> handleLogin(String userid, String userpw) {
        // 🔐 유효성 검사
        if (userid == null || userid.trim().isEmpty()) {
            throw new CustomLoginException("VALIDATION_ID_REQUIRED");
        }
        if (userpw == null || userpw.trim().isEmpty()) {
            throw new CustomLoginException("VALIDATION_PASSWORD_REQUIRED");
        }

        // ✅ 로그인 처리
        Member member = memberRepository.findByUserid(userid)
                .orElseThrow(() -> new CustomLoginException("USER_NOT_FOUND"));

        if (!passwordEncoder.matches(userpw, member.getUserpw())) {
            throw new CustomLoginException("WRONG_PASSWORD");
        }

        MemberDTO dto = MemberDTO.fromMember(member);
        String token = jwtUtil.generateToken(userid);

        return Map.of(
                "token", token,
                "user", dto
        );
    }

    @Override
    public MemberDTO findByUserid(String userid) {
        Member member = memberRepository.findByUserid(userid)
                .orElseThrow(() -> new CustomLoginException("USER_NOT_FOUND"));
        return MemberDTO.fromMember(member);
    }

    @Override
    public boolean isUseridDuplicate(String userid) {
        return memberRepository.existsByUserid(userid); // 중복 여부 반환
    }

    @Override
    public List<String> findUseridsByEmail(String email) {
        List<Member> members = memberRepository.findAllByEmail(email);

        if (members.isEmpty()) {
            throw new CustomLoginException("EMAIL_NOT_FOUND");
        }

        return members.stream()
                .map(Member::getUserid)
                .collect(Collectors.toList());
    }

    @Override
    public String verifyMemberForPasswordReset(String userid, String email) {
        Optional<Member> optionalMember = memberRepository.findByUseridAndEmail(userid, email);

        if (optionalMember.isEmpty()) {
            throw new CustomLoginException("MEMBER_NOT_MATCH");
        }

        return "비밀번호를 재설정하세요.";
    }

    @Override
    public void resetPassword(MemberDTO dto) {
        Member member = memberRepository.findByUseridAndEmail(dto.getUserid(), dto.getEmail())
                .orElseThrow(() -> new CustomLoginException("INVALID_USER"));

        String encodedPw = passwordEncoder.encode(dto.getUserpw()); // dto.getUserpw()는 새 비밀번호
        member.changePw(encodedPw);

        memberRepository.save(member);
    }






}
