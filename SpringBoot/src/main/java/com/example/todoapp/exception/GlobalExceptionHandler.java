package com.example.todoapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ✅ 공통 코드 예외 처리 (CustomLoginException, ApiException 등 모두 처리)
    @ExceptionHandler(BaseCodeException.class)
    public ResponseEntity<Map<String, String>> handleBaseCodeException(BaseCodeException ex) {
        HttpStatus status = (ex instanceof CustomLoginException)
                ? HttpStatus.UNAUTHORIZED
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(Map.of("code", ex.getCode()));
    }

    // ✅ 유효성 검사 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String field = ex.getBindingResult().getFieldErrors()
                .stream()
                .findFirst()
                .map(FieldError::getField)
                .orElse("unknown");

        String code = switch (field) {
            case "userid" -> "VALIDATION_ID_REQUIRED";
            case "userpw" -> "VALIDATION_PASSWORD_REQUIRED";
            default -> "VALIDATION_ERROR";
        };

        return ResponseEntity.badRequest().body(Map.of("code", code));
    }

    // ✅ 알 수 없는 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleServer(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("code", "SERVER_ERROR"));
    }
}
