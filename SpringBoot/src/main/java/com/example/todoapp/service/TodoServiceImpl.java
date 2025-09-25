package com.example.todoapp.service;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import com.example.todoapp.dto.TodoDTO;
import com.example.todoapp.repository.MemberRepository;
import com.example.todoapp.repository.TodoDailyTimeRepository;
import com.example.todoapp.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TodoServiceImpl implements TodoService {

    private final TodoRepository todoRepository;
    private final MemberRepository memberRepository;
    private final TodoDailyTimeRepository todoDailyTimeRepository;

    @Override
    public TodoDTO createTodo(TodoDTO dto, Long uno) {
        Member member = memberRepository.findById(uno).orElseThrow();
        Todo todo = dto.toTodo(member);
        Todo saved = todoRepository.save(todo);
        return TodoDTO.fromTodo(saved);
    }

    @Override
    public List<TodoDTO> getTodoList(Long uno) {
        return todoRepository.findAllByMember_Uno(uno).stream()
                .map(TodoDTO::fromTodo)
                .collect(Collectors.toList());
    }

    @Override
    public TodoDTO getTodo(Long tdno, Long uno) {
        Todo todo = todoRepository.findById(tdno).orElseThrow();
        if (!todo.getMember().getUno().equals(uno)) {
            throw new IllegalArgumentException("조회 권한이 없습니다.");
        }
        return TodoDTO.fromTodo(todo);
    }

    @Override
    public TodoDTO updateTodo(TodoDTO dto, Long uno) {
        Todo todo = todoRepository.findById(dto.getTdno())
                .orElseThrow(() -> new RuntimeException("할 일을 찾을 수 없습니다."));

        if (!todo.getMember().getUno().equals(uno)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // ✅ 모든 수정 가능한 필드 반영
        todo.setTitle(dto.getTitle());
        todo.setContent(dto.getContent());
        todo.setGrade(dto.getGrade());
        todo.setStartDate(dto.getStartDate());
        todo.setEndDate(dto.getEndDate());
        todo.setIsDone(dto.isDone() ? "Y" : "N");
        todo.setDoneDate(dto.getDoneDate());

        Todo updated = todoRepository.save(todo);
        return TodoDTO.fromTodo(updated);
    }

    @Override
    public void deleteTodo(Long tdno, Long uno) {
        Todo todo = todoRepository.findById(tdno).orElseThrow();

        if (!todo.getMember().getUno().equals(uno)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        todoRepository.delete(todo);
    }

    @Override
    public void completeTodo(Long tdno, Long uno) {
        Todo todo = todoRepository.findById(tdno).orElseThrow();
        if (!todo.getMember().getUno().equals(uno)) {
            throw new IllegalArgumentException("완료 권한이 없습니다.");
        }

        todo.setIsDone("Y");
        todo.setDoneDate(LocalDate.now());
        todoRepository.save(todo);
    }

    @Override
    public void cancelComplete(Long tdno, Long uno) {
        Todo todo = todoRepository.findById(tdno).orElseThrow();
        if (!todo.getMember().getUno().equals(uno)) {
            throw new IllegalArgumentException("취소 권한이 없습니다.");
        }

        todo.setIsDone("N");
        todo.setDoneDate(null);
        todoRepository.save(todo);
    }

    @Override
    @Transactional
    public Todo saveWithDailyTimes(TodoDTO dto) {
        Member member = memberRepository.findById(dto.getMemberUno())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Todo todo = dto.toTodo(member);
        Todo savedTodo = todoRepository.save(todo);

        // ✅ dailyTimes 처리
        if (dto.getDailyTimes() != null && !dto.getDailyTimes().isEmpty()) {
            List<TodoDailyTime> dailyTimes = dto.getDailyTimes().stream()
                    .map(d -> TodoDailyTime.builder()
                            .todo(savedTodo)
                            .targetDate(d.getTargetDate())
                            .startTime(d.getStartTime())
                            .endTime(d.getEndTime())
                            .build())
                    .toList();

            todoDailyTimeRepository.saveAll(dailyTimes);
            savedTodo.setDailyTimes(dailyTimes); // 연관 엔티티로 세팅
        }

        return savedTodo;
    }



}
