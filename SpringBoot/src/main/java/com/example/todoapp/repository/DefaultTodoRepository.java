
package com.example.todoapp.repository;

import com.example.todoapp.domain.DefaultTodo;
import com.example.todoapp.domain.Member;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DefaultTodoRepository extends JpaRepository<DefaultTodo, Long> {

    // ✅ 요일로 기본 카드 찾기
    List<DefaultTodo> findByDayOfWeek(String dayOfWeek);

    // ✅ 공용 카드 (member가 null)
    List<DefaultTodo> findByMemberIsNull();

    // ✅ 유저의 카드 + 공용 카드 모두 조회
    List<DefaultTodo> findByMemberUnoOrMemberIsNull(Long uno);

    // ✅ 특정 유저의 기본 카드만 조회
    List<DefaultTodo> findByMemberUno(Long uno);

    // ✅ 특정 유저의 기본 카드 개수
    long countByMemberUno(Long uno);

    void deleteByMember(Member member);


}
