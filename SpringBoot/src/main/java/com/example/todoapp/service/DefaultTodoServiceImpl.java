package com.example.todoapp.service;

import com.example.todoapp.domain.*;
import com.example.todoapp.dto.AutoInsertDTO;
import com.example.todoapp.dto.DefaultTodoDTO;
import com.example.todoapp.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DefaultTodoServiceImpl implements DefaultTodoService {

    private final DefaultTodoRepository defaultTodoRepository;
    private final MemberRepository memberRepository;
    private final TodoRepository todoRepository;
    private final TodoDailyTimeRepository todoDailyTimeRepository;


    // ✅ 기본 카드 조회 (공용 + 유저 카드)
    @Override
    public List<DefaultTodoDTO> getAll(Long uno) {
        return defaultTodoRepository.findByMemberUno(uno) // ✅ uno만 기준
                .stream()
                .map(DefaultTodoDTO::fromDefaultTodo)
                .collect(Collectors.toList());
    }

    // ✅ 기본 카드 생성 (최대 10개 제한)
    @Override
    public void create(DefaultTodoDTO dto) {
        Long uno = dto.getMemberUno(); // ✅ dto에서 꺼냄

        long count = defaultTodoRepository.countByMemberUno(uno);
        if (count >= 10) {
            throw new RuntimeException("기본 카드는 최대 10개까지만 생성할 수 있습니다.");
        }

        Member member = memberRepository.findById(uno)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        DefaultTodo todo = DefaultTodo.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .grade(dto.getGrade())
                .dayOfWeek(dto.getDayOfWeek())
                .member(member)
                .uno(uno)
                .build();

        defaultTodoRepository.save(todo);
    }


    // ✅ 기본 카드 수정 (유저 확인 포함)
    @Override
    public void update(Long dno, DefaultTodoDTO dto, Long uno) {
        DefaultTodo todo = defaultTodoRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("기본 카드를 찾을 수 없습니다."));

        if (todo.getMember() == null || !todo.getMember().getUno().equals(uno)) {
            throw new SecurityException("해당 카드에 대한 수정 권한이 없습니다.");
        }

        todo.setTitle(dto.getTitle());
        todo.setContent(dto.getContent());
        todo.setGrade(dto.getGrade());
        todo.setDayOfWeek(dto.getDayOfWeek());
        // 저장은 @Transactional 로 자동 처리
    }

    // ✅ 기본 카드 삭제 (유저 확인 포함)
    @Override
    public void delete(Long dno, Long uno) {
        DefaultTodo todo = defaultTodoRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("기본 카드를 찾을 수 없습니다."));

        if (todo.getMember() == null || !todo.getMember().getUno().equals(uno)) {
            throw new SecurityException("해당 카드에 대한 삭제 권한이 없습니다.");
        }

        defaultTodoRepository.delete(todo);
    }

    // ✅ 새로운 메소드 구현 (수정됨)
    @Override
    @Transactional
    public void insertDefaultTodosByDates(AutoInsertDTO requestDTO) {
        Member member = memberRepository.findById(requestDTO.getMemberUno())
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다: " + requestDTO.getMemberUno()));
        DefaultTodo selectedDefaultCard = defaultTodoRepository.findById(requestDTO.getDno())
                .orElseThrow(() -> new IllegalArgumentException("선택된 기본 카드를 찾을 수 없습니다: " + requestDTO.getDno()));
        List<DayOfWeek> targetDayOfWeeks = requestDTO.getDays().stream()
                .map(dayStr -> {
                    switch (dayStr) {
                        case "Sun": return DayOfWeek.SUNDAY;
                        case "Mon": return DayOfWeek.MONDAY;
                        case "Tue": return DayOfWeek.TUESDAY;
                        case "Wed": return DayOfWeek.WEDNESDAY;
                        case "Thu": return DayOfWeek.THURSDAY;
                        case "Fri": return DayOfWeek.FRIDAY;
                        case "Sat": return DayOfWeek.SATURDAY;
                        default: throw new IllegalArgumentException("유효하지 않은 요일입니다: " + dayStr);
                    }
                })
                .collect(Collectors.toList());

        // DTO에서 시작/종료 시간 가져오기 (null일 수 있음)
        LocalTime defaultStartTime = requestDTO.getStartTime();
        LocalTime defaultEndTime = requestDTO.getEndTime();

        LocalDate currentDate = requestDTO.getStartDate();
        while (!currentDate.isAfter(requestDTO.getEndDate())) {
            DayOfWeek currentDayOfWeek = currentDate.getDayOfWeek();

            if (targetDayOfWeeks.contains(currentDayOfWeek)) {
                Todo newTodo = Todo.builder()
                        .title(selectedDefaultCard.getTitle())
                        .content(selectedDefaultCard.getContent())
                        .grade(selectedDefaultCard.getGrade())
                        .member(member)
                        .startDate(currentDate) // 현재 반복 중인 날짜를 시작일로
                        .endDate(currentDate)   // 현재 반복 중인 날짜를 종료일로
                        .isDone("N")
                        .doneDate(null)
                        // .dailyTimes(new ArrayList<>()) // Todo 엔티티에서 @Builder.Default로 초기화되므로 명시적 설정 필요 없음
                        .build();

                // ✅ Todo 저장 (먼저 저장하여 tdno를 얻어야 TodoDailyTime에서 참조 가능)
                Todo savedTodo = todoRepository.save(newTodo);

                // ✅ TodoDailyTime 생성 및 연결
                // DTO에 startTime과 endTime이 있을 경우에만 TodoDailyTime 생성
                if (defaultStartTime != null && defaultEndTime != null) {
                    TodoDailyTime dailyTime = TodoDailyTime.builder()
                            .todo(savedTodo)
                            .targetDate(currentDate)
                            .startTime(defaultStartTime)
                            .endTime(defaultEndTime)
                            .build();

                    // Todo 엔티티의 dailyTimes 컬렉션에 추가 (양방향 관계 설정)
                    // Todo.addDailyTime() 메소드를 사용하면 더 깔끔합니다.
                    savedTodo.addDailyTime(dailyTime); // Todo 엔티티에 addDailyTime 메소드가 정의되어 있다고 가정

                    // Todo 엔티티에 cascade = ALL이 설정되어 있다면 명시적 save는 필요 없을 수 있습니다.
                    // todoDailyTimeRepository.save(dailyTime);
                }
            }
            currentDate = currentDate.plusDays(1);
        }
    }
}

