package com.example.todoapp.service;

import com.example.todoapp.domain.Member;
import com.example.todoapp.domain.Todo;
import com.example.todoapp.domain.TodoDailyTime;
import com.example.todoapp.dto.CalendarTodoDTO;
import com.example.todoapp.dto.TodoDailyTimeDTO;
import com.example.todoapp.repository.CalendarTodoRepository;
import com.example.todoapp.repository.MemberRepository;
import com.example.todoapp.repository.TodoDailyTimeRepository;
import com.example.todoapp.repository.TodoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;
import java.util.Map; // Map 임포트
import java.util.function.Function; // Function 임포트 (toMap 사용용)
import java.util.ArrayList; // ArrayList 임포트

@Service
@RequiredArgsConstructor
public class CalendarTodoServiceImpl implements CalendarTodoService {

    private final CalendarTodoRepository calendarTodoRepository;
    private final MemberRepository memberRepository;
    private final TodoDailyTimeRepository todoDailyTimeRepository;
    private final TodoRepository todoRepository;

    @Override
    @Transactional
    public CalendarTodoDTO register(CalendarTodoDTO dto) {
        Optional<Member> optionalMember = memberRepository.findById(dto.getMemberUno());
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("해당 Member 없음");
        }
        Member member = optionalMember.get();

        Todo todo;
        if (dto.getTdno() == null) {
            // ✅ 새 Todo 등록
            todo = Todo.builder()
                    .title(dto.getTitle())
                    .content(dto.getContent())
                    .grade(dto.getGrade())
                    .startDate(dto.getStartDate())
                    .endDate(dto.getEndDate())
                    .member(member)
                    .isDone(dto.isDone() ? "Y" : "N")
                    .doneDate(dto.isDone() ? (dto.getDoneDate() != null ? dto.getDoneDate() : LocalDate.now()) : null)
                    .build();

            // ✅ Todo 저장 (먼저 저장해야 tdno가 생성되어 TodoDailyTime에서 참조 가능)
            Todo savedTodo = calendarTodoRepository.save(todo);

            // ✅ TodoDailyTime 정보 처리: updateTodoDailyTimes 헬퍼 메소드에 모든 로직 위임
            updateTodoDailyTimes(savedTodo, dto.getDailyTimes());

            todo = savedTodo; // 업데이트된 todo (dailyTimes 컬렉션 포함)

        } else {
            // ✅ 기존 Todo 수정
            todo = calendarTodoRepository.findById(dto.getTdno())
                    .orElseThrow(() -> new IllegalArgumentException("해당 Todo 없음"));

            todo.setStartDate(dto.getStartDate());
            todo.setEndDate(dto.getEndDate());
            todo.setTitle(dto.getTitle());
            todo.setContent(dto.getContent());
            todo.setGrade(dto.getGrade());
            todo.setIsDone(dto.isDone() ? "Y" : "N");
            todo.setDoneDate(dto.isDone() ? (dto.getDoneDate() != null ? dto.getDoneDate() : LocalDate.now()) : null);

            updateTodoDailyTimes(todo, dto.getDailyTimes());
        }

        return CalendarTodoDTO.fromTodo(todo);
    }

    @Override
    public List<CalendarTodoDTO> getByDate(Long memberUno, LocalDate date) {
        List<Todo> result = calendarTodoRepository
                .findByMember_UnoAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndRnoIsNull(memberUno, date, date);

        return result.stream()
                .map(CalendarTodoDTO::fromTodo)
                .toList();
    }

    @Override
    public List<CalendarTodoDTO> getListByMember(Long uno) {
        List<Todo> entityList = calendarTodoRepository.findByMember_Uno(uno);

        return entityList.stream()
                .map(CalendarTodoDTO::fromTodo)
                .toList();
    }

    @Override
    @Transactional
    public void updateTargetDate(Long tdno, LocalDate startDate, LocalDate endDate, List<TodoDailyTimeDTO> dailyTimes) {
        Todo todo = calendarTodoRepository.findById(tdno)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다: " + tdno));

        todo.setStartDate(startDate);
        todo.setEndDate(endDate);

        // ✅ 새로 받은 시간 정보도 반영
        updateTodoDailyTimes(todo, dailyTimes);
    }

    @Override
    @Transactional
    public CalendarTodoDTO editCalendarTodo(CalendarTodoDTO dto) {
        Todo todo = calendarTodoRepository.findById(dto.getTdno())
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다: " + dto.getTdno()));

        // 기존 Todo 필드 업데이트
        todo.setTitle(dto.getTitle());
        todo.setContent(dto.getContent());
        todo.setGrade(dto.getGrade());
        todo.setStartDate(dto.getStartDate());
        todo.setEndDate(dto.getEndDate());
        todo.setIsDone(dto.isDone() ? "Y" : "N");
        todo.setDoneDate(dto.isDone() ? (dto.getDoneDate() != null ? dto.getDoneDate() : LocalDate.now()) : null);

        // ✅ TodoDailyTime 업데이트 및 제약조건 검사
        updateTodoDailyTimes(todo, dto.getDailyTimes());

        Todo updatedTodo = calendarTodoRepository.save(todo);

        return CalendarTodoDTO.fromTodo(updatedTodo);
    }

    @Override
    @Transactional
    public void delete(Long tdno) {
        if (!calendarTodoRepository.existsById(tdno)) {
            throw new IllegalArgumentException("해당 일정이 존재하지 않습니다: " + tdno);
        }
        calendarTodoRepository.deleteById(tdno);
    }

    // ✅ 체크박스 전용 완료 상태 변경 (RightPanel에서 즉시 반영용)
    @Override
    @Transactional
    public void markDone(Long tdno, boolean done) {
        Todo todo = calendarTodoRepository.findById(tdno)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다: " + tdno));

        todo.setIsDone(done ? "Y" : "N");
        todo.setDoneDate(done ? LocalDate.now() : null);

        calendarTodoRepository.save(todo);
    }

    private void updateTodoDailyTimes(Todo todo, List<TodoDailyTimeDTO> dailyTimeDTOs) {
        // 기존 dailyTimes 초기화
        todo.getDailyTimes().clear();

        if (dailyTimeDTOs != null && !dailyTimeDTOs.isEmpty()) {
            Set<LocalDate> uniqueDates = new HashSet<>();

            for (TodoDailyTimeDTO dailyTimeDTO : dailyTimeDTOs) {
                LocalDate targetDate = dailyTimeDTO.getTargetDate();

                if (!uniqueDates.add(targetDate)) {
                    throw new IllegalArgumentException("같은 날짜(" + targetDate + ")에 중복된 시간 정보가 있습니다.");
                }

                TodoDailyTime newDailyTime = TodoDailyTime.builder()
                        .targetDate(targetDate)
                        .startTime(dailyTimeDTO.getStartTime())
                        .endTime(dailyTimeDTO.getEndTime())
                        .build();

                // ✅ 양방향 관계 설정
                todo.addDailyTime(newDailyTime);
            }
        }
        // ✅ 마지막에 한 번 저장
        todoRepository.save(todo);
    }


}