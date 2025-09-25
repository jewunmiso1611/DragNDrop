package com.example.todoapp.service;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.RecurringTodo;
import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import com.example.todoapp.dto.RecurringTodoDTO;
import com.example.todoapp.dto.RecurringTodoWithTdnoDTO;
import com.example.todoapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecurringTodoServiceImpl implements RecurringTodoService {

    private final RecurringTodoRepository recurringTodoRepository;
    private final MemberRepository memberRepository;
    private final TodoRepository todoRepository;
    private final TodoDailyTimeRepository todoDailyTimeRepository;

    @Override
    @Transactional
    public void createRecurringTodo(RecurringTodoDTO dto) {
        Member member = memberRepository.findById(dto.getUno())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        RecurringTodo recurringTodo = dto.toEntity(member);
        recurringTodo.setIsActive(1);
        recurringTodoRepository.save(recurringTodo);

        // 🧠 일정 생성 로직
        List<LocalDate> dates = generateDates(recurringTodo.getStartDate(), recurringTodo.getEndDate(), recurringTodo.getRepeatType(), recurringTodo.getDayOfWeek());
        for (LocalDate date : dates) {
            Todo todo = Todo.builder()
                    .member(member)
                    .title(dto.getTitle())
                    .content(dto.getContent())
                    .grade(dto.getGrade())
                    .startDate(date)
                    .endDate(date)
                    .isDone("N")
                    .recurringTodo(recurringTodo)
                    .build();
            todoRepository.save(todo);

            // 시간 설정 있으면 생성
            if (dto.getStartTime() != null && dto.getEndTime() != null) {
                TodoDailyTime time = TodoDailyTime.builder()
                        .todo(todo)
                        .targetDate(date)
                        .startTime(dto.getStartTime())
                        .endTime(dto.getEndTime())
                        .build();
                todoDailyTimeRepository.save(time);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecurringTodoDTO> getRecurringTodos(Long uno) {
        return recurringTodoRepository.findAllByMember_UnoAndIsActive(uno, 1).stream()
                .map(RecurringTodoDTO::fromEntity)
                .toList();
    }

    @Override
    public RecurringTodoDTO getRecurringTodoById(Long rno, Long uno) {
        RecurringTodo recurringTodo = recurringTodoRepository.findByRnoAndMember_Uno(rno, uno)
                .orElseThrow(() -> new RuntimeException("해당 반복 일정을 찾을 수 없습니다."));

        RecurringTodoDTO dto = RecurringTodoDTO.fromEntity(recurringTodo);

        // ✅ 오늘 날짜 기준으로 해당 rno로 생성된 Todo가 있는지 확인
        LocalDate today = LocalDate.now();
        Optional<Todo> todayTodo = todoRepository.findByRecurringTodo_RnoAndStartDate(rno, today);

        todayTodo.ifPresent(todo -> dto.setTdno(todo.getTdno())); // ✅ tdno 설정

        return dto;
    }

    @Override
    public RecurringTodoWithTdnoDTO getRecurringWithTdno(Long rno, LocalDate date) {
        RecurringTodo recurring = getByRno(rno);

        Long tdno = todoRepository.findTdnoByRecurringTodoAndTargetDate(rno, date);

        return RecurringTodoWithTdnoDTO.from(recurring, tdno);
    }

    @Override
    @Transactional
    public void updateRecurringTodo(Long rno, RecurringTodoDTO dto) {
        deleteRecurringTodo(rno); // 기존 일정 삭제
        createRecurringTodo(dto); // 새로 생성
    }

    @Override
    @Transactional
    public void deleteRecurringTodo(Long rno) {
        RecurringTodo target = recurringTodoRepository.findById(rno)
                .orElseThrow(() -> new IllegalArgumentException("해당 반복일정이 없습니다."));

        // 연결된 todo + 시간 삭제
        List<Todo> linkedTodos = todoRepository.findAllByRecurringTodo_Rno(rno);
        for (Todo todo : linkedTodos) {
            todoDailyTimeRepository.deleteAllByTodo(todo);
        }
        todoRepository.deleteAll(linkedTodos);

        target.setIsActiveBoolean(false);
        recurringTodoRepository.delete(target);
    }

    // 🔁 반복 날짜 생성
    private List<LocalDate> generateDates(LocalDate start, LocalDate end, String repeatType, String dayOfWeekStr) {
        List<LocalDate> result = new ArrayList<>();
        Set<DayOfWeek> daySet = parseDayOfWeek(dayOfWeekStr);

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (repeatType.equalsIgnoreCase("DAILY") ||
                    (repeatType.equalsIgnoreCase("WEEKLY") && daySet.contains(date.getDayOfWeek()))) {
                result.add(date);
            }
        }
        return result;
    }

    private Set<DayOfWeek> parseDayOfWeek(String str) {
        if (str == null) return Set.of();
        Set<DayOfWeek> set = new HashSet<>();
        for (String s : str.split(",")) {
            set.add(DayOfWeek.valueOf(s.trim().toUpperCase()));
        }
        return set;
    }

    @Override
    public RecurringTodo getByRno(Long rno) {
        return recurringTodoRepository.findById(rno)
                .orElseThrow(() -> new RuntimeException("해당 반복일정이 존재하지 않습니다. rno = " + rno));
    }



}
