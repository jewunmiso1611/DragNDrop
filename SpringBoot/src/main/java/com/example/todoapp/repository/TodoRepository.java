package com.example.todoapp.repository;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.Todo;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    // ✅ 해당 회원의 전체 할 일
    List<Todo> findAllByMember_Uno(Long uno);

    List<Todo> findAllByRecurringTodo_Rno(Long rno);

    // ✅ 해당 회원의 완료된 할 일
    List<Todo> findAllByMember_UnoAndIsDone(Long uno, String isDone);

    // ✅ 해당 회원의 완료일 기준 정렬 (선택)
    List<Todo> findAllByMember_UnoAndIsDoneOrderByDoneDateDesc(Long uno, String isDone);

    Optional<Todo> findByRecurringTodo_RnoAndStartDate(Long rno, LocalDate startDate);

    @Query("SELECT t.tdno FROM Todo t WHERE t.recurringTodo.rno = :rno AND t.startDate = :targetDate")
    Long findTdnoByRecurringTodoAndTargetDate(@Param("rno") Long rno, @Param("targetDate") LocalDate targetDate);

    void deleteByMember(Member member);
}
