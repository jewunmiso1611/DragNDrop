package com.example.todoapp.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "MySuperSecretKeyForJwtGeneration1234567890";
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; //1시간

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // 🔹 JWT 생성
    public String generateToken(String userid) {
        return Jwts.builder()
                .setSubject(userid)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 🔹 JWT에서 userid 추출
    public String getUseridFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 🔹 JWT 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 만료 or 변조 등
            return false;
        }
    }
}
