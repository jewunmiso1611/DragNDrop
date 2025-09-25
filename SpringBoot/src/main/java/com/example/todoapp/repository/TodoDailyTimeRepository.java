package com.example.todoapp.repository;

import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository // ✅ 스프링 빈으로 등록
public interface TodoDailyTimeRepository extends JpaRepository<TodoDailyTime, Long> {

    Optional<TodoDailyTime> findByTodo_TdnoAndTargetDate(Long tdno, LocalDate targetDate);

    // 올바른 버전 ✅
    void deleteAllByTodo(Todo todo);


}