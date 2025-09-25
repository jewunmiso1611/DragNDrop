package com.example.todoapp.repository;

import com.example.todoapp.domain.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph; // ✅ EntityGraph 임포트

import java.time.LocalDate;
import java.util.List;

public interface CalendarTodoRepository extends JpaRepository<Todo, Long> {

    // ✅ 특정 날짜에 해당하는 일정들 (startDate <= date <= endDate)을 조회하면서 dailyTimes도 함께 로드
    @EntityGraph(attributePaths = "dailyTimes") // ✅ 추가: dailyTimes 컬렉션을 즉시 로딩
    List<Todo> findByMember_UnoAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long memberUno, LocalDate start, LocalDate end);

    @EntityGraph(attributePaths = "dailyTimes")
    List<Todo> findByMember_UnoAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndRnoIsNull(
            Long memberUno,
            LocalDate startDate,
            LocalDate endDate
    );

    // ✅ 멤버 전체 일정 (캘린더에 표시용)을 조회하면서 dailyTimes도 함께 로드
    @EntityGraph(attributePaths = "dailyTimes") // ✅ 추가: dailyTimes 컬렉션을 즉시 로딩
    List<Todo> findByMember_Uno(Long uno);

}