package com.example.todoapp.security;

import com.example.todoapp.domain.Member;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    // 권한은 없다고 가정하고 빈 리스트 반환
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return member.getUserpw(); // 🔑 인증 시 비밀번호
    }

    @Override
    public String getUsername() {
        return member.getUserid(); // 🔑 인증 시 ID
    }

    // 아래 값들은 모두 true로 설정 (계정 상태 확인 관련)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
