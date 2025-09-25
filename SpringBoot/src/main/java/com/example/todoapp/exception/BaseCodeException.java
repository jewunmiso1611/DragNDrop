package com.example.todoapp.exception;

public abstract class BaseCodeException extends RuntimeException {
    protected final String code;

    protected BaseCodeException(String code) {
        super(code);  // 예외 메시지로도 사용
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
