package com.example.todoapp.dto;

import com.example.todoapp.domain.Member;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDTO {

    private Long uno;

    @NotBlank(message = "아이디는 필수입니다.")
    private String userid;

    @NotBlank(message = "비밀번호는 필수입니다.") // 👉 현재 비밀번호
    private String userpw;

    private String newUserpw; // ✅ 새 비밀번호 (확인용은 프론트에서만 처리)

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    @Email(message = "유효한 이메일 형식이 아닙니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    @Pattern(regexp = "^[MF]$", message = "성별은 'M' 또는 'F'여야 합니다.")
    private String gender;

    private String createdAt;
    private String updatedAt;

    // ✅ 기본 카드 생성 여부
    private boolean createDefaultCard;

    public Member toMember() {
        return Member.builder()
                .uno(uno)
                .userid(userid)
                .userpw(userpw)
                .nickname(nickname)
                .email(email)
                .gender(gender)
                .build();
    }

    public static MemberDTO fromMember(Member member) {
        return MemberDTO.builder()
                .uno(member.getUno())
                .userid(member.getUserid())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .gender(member.getGender())
                .createdAt(member.getCreatedAt() != null ? member.getCreatedAt().toString() : null)
                .updatedAt(member.getUpdatedAt() != null ? member.getUpdatedAt().toString() : null)
                .build();
    }
}

