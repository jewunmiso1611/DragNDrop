package com.example.todoapp.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; // WebAuthenticationDetailsSource 추가
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Authorization 헤더가 없거나 "Bearer "로 시작하지 않으면 다음 필터로 진행
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // 여기서 필터 체인 진행을 중단하고 다음 필터로 넘어갑니다.
        }

        String token = authHeader.substring(7); // "Bearer " 제거
        String exceptionMessage = null; // 예외 메시지를 저장할 변수

        try {
            // JWT 토큰에서 userid 추출
            String userid = jwtUtil.getUseridFromToken(token);

            // userid가 존재하고, 아직 SecurityContext에 인증 정보가 없는 경우
            if (userid != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // UserDetailsService를 통해 사용자 상세 정보 로드
                UserDetails userDetails = userDetailsService.loadUserByUsername(userid);

                // JWT 토큰 유효성 검사
                if (jwtUtil.validateToken(token)) {
                    // 사용자 정보와 권한을 바탕으로 Authentication 객체 생성
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, // CustomUserDetails 객체 자체를 principal로 설정
                                    null, // 자격 증명(비밀번호)은 여기서는 필요 없으므로 null
                                    userDetails.getAuthorities()
                            );
                    // 요청 상세 정보 설정 (선택 사항이지만, 스프링 시큐리티에서 유용)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // SecurityContext에 Authentication 객체 설정
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    // 토큰 검증 실패 (유효하지 않거나 변조됨)
                    exceptionMessage = "Invalid JWT token";
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // 토큰 만료
            exceptionMessage = "Expired JWT token";
        } catch (JwtException e) {
            // 기타 JWT 오류 (예: 서명 불일치)
            exceptionMessage = "Invalid JWT token";
        } catch (IllegalArgumentException e) {
            // 토큰 문자열이 null이거나 비어있는 경우 등
            exceptionMessage = "JWT token is missing or malformed";
        }

        // 예외 메시지가 설정되었다면, 적절한 HTTP 응답을 반환하고 필터 체인 중단
        if (exceptionMessage != null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
            response.setContentType("application/json;charset=UTF-8"); // 응답 Content-Type 설정
            response.getWriter().write("{\"message\": \"" + exceptionMessage + "\"}");
            return; // 필터 체인 진행 중단
        }

        // 모든 검증을 통과했으면 다음 필터로 진행
        filterChain.doFilter(request, response);
    }
}