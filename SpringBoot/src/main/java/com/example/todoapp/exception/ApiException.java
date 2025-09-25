package com.example.todoapp.exception;

public class ApiException extends BaseCodeException {
    public ApiException(String code) {
        super(code);
    }
}
