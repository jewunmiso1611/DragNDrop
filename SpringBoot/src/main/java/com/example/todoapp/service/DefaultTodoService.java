package com.example.todoapp.service;

import com.example.todoapp.dto.AutoInsertDTO;
import com.example.todoapp.dto.DefaultTodoDTO;

import java.util.List;

public interface DefaultTodoService {

    List<DefaultTodoDTO> getAll(Long uno);

    void create(DefaultTodoDTO dto);

    void update(Long dno, DefaultTodoDTO dto, Long uno);

    void delete(Long dno, Long uno);

    void insertDefaultTodosByDates(AutoInsertDTO requestDTO);

}

