package com.example.todoapp.controller;

import com.example.todoapp.dto.CalendarTodoDTO;
import com.example.todoapp.dto.TodoDailyTimeDTO;
import com.example.todoapp.service.CalendarTodoService;
import com.example.todoapp.service.RecurringTodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class CalendarTodoController {

    private final CalendarTodoService calendarTodoService;
    private final RecurringTodoService recurringTodoService;

    // ✅ 드래그된 Todo 저장
    @PostMapping
    public ResponseEntity<CalendarTodoDTO> register(@RequestBody CalendarTodoDTO dto) {
        CalendarTodoDTO saved = calendarTodoService.register(dto);
        return ResponseEntity.ok(saved);
    }

    // ✅ 특정 날짜의 할 일 조회
    @GetMapping("/todo")
    public ResponseEntity<List<CalendarTodoDTO>> getByDate(
            @RequestParam Long memberUno,
            @RequestParam String targetDate) {

        LocalDate date = LocalDate.parse(targetDate);

        List<CalendarTodoDTO> result = calendarTodoService.getByDate(memberUno, date);
        return ResponseEntity.ok(result);
    }

    // ✅ 전체 일정 조회
    @GetMapping("/list/{uno}")
    public ResponseEntity<List<CalendarTodoDTO>> getList(@PathVariable Long uno) {
        List<CalendarTodoDTO> list = calendarTodoService.getListByMember(uno);
        return ResponseEntity.ok(list);
    }

    // ✅ 날짜 이동 (드래그 처리)
    @PutMapping("/update")
    public ResponseEntity<Void> updateCalendarTodo(@RequestBody CalendarTodoDTO dto) {
        System.out.println("🟡 받은 날짜: start=" + dto.getStartDate() + ", end=" + dto.getEndDate());

        if (dto.getDailyTimes() != null && !dto.getDailyTimes().isEmpty()) {
            TodoDailyTimeDTO timeDTO = dto.getDailyTimes().get(0);
            System.out.println("🟡 받은 시간 정보: " + timeDTO.getTargetDate()
                    + " / " + timeDTO.getStartTime() + " ~ " + timeDTO.getEndTime());
        } else {
            System.out.println("🟡 받은 시간 정보: (없음)");
        }

        calendarTodoService.updateTargetDate(dto.getTdno(), dto.getStartDate(), dto.getEndDate(), dto.getDailyTimes());
        return ResponseEntity.ok().build();
    }

    // ✅ 일정 수정
    @PutMapping("/edit")
    public ResponseEntity<CalendarTodoDTO> editCalendarTodo(@RequestBody CalendarTodoDTO dto) {
        CalendarTodoDTO updated = calendarTodoService.editCalendarTodo(dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tdno}")
    public ResponseEntity<Void> delete(@PathVariable Long tdno) {
        System.out.println("🧹 삭제 요청 tdno: " + tdno);
        calendarTodoService.delete(tdno);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/done/{tdno}")
    public ResponseEntity<Void> updateDoneState(@PathVariable Long tdno, @RequestParam boolean done) {
        calendarTodoService.markDone(tdno, done);
        return ResponseEntity.ok().build();
    }
}