package com.example.todoapp.repository;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.RecurringTodo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecurringTodoRepository extends JpaRepository<RecurringTodo, Long> {

    // 특정 회원의 활성 반복 일정만 가져오기
    List<RecurringTodo> findAllByMember_UnoAndIsActive(Long uno, Integer isActive);

    Optional<RecurringTodo> findByRnoAndMember_Uno(Long rno, Long uno);

    void deleteByMember(Member member);

}
