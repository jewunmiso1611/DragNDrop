// calendarUtils.js
export const buildCalendarEvent = (dto, getGradeStyle) => {
    const style = getGradeStyle(dto.grade || 1);

    // DTO에 startDate가 없거나 유효하지 않으면 기본값으로 '오늘 날짜'를 사용 (안전한 기본값)
    const safeStartDate = dto.startDate && !isNaN(new Date(dto.startDate).getTime())
        ? dto.startDate
        : new Date().toISOString().slice(0, 10); // 임시로 오늘 날짜 사용

    // DTO에 endDate가 없거나 유효하지 않으면 startDate와 동일하게 설정 (안전한 기본값)
    const safeEndDate = dto.endDate && !isNaN(new Date(dto.endDate).getTime())
        ? dto.endDate
        : safeStartDate;

    const startTime = dto.dailyTimes?.[0]?.startTime ?? '00:00:00';
    const endTime = dto.dailyTimes?.[0]?.endTime ?? startTime;
    const hasTime = startTime !== '00:00:00';

    // start와 end를 계산할 때 안전한 날짜 값을 사용
    const startDateTime = hasTime ? `${safeStartDate}T${startTime}` : safeStartDate;

    let endDateTime;
    if (hasTime) {
        endDateTime = `${safeEndDate}T${endTime}`;
    } else {
        const calculatedEndDate = new Date(safeEndDate);
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 1); // FullCalendar allDay 특성
        endDateTime = calculatedEndDate.toISOString().slice(0, 10);
    }

    const isRecurring = dto.rno !== null && dto.rno !== undefined;
    const hasPrefix = dto.title?.startsWith('🔁') || dto.title?.startsWith('📌');
    const titlePrefix = isRecurring ? '🔁' : '📌';

    const safeTitle = hasPrefix ? dto.title : `${titlePrefix} ${dto.title}`;

    return {
        id: dto.tdno || dto.tempId,
        title: safeTitle,
        start: startDateTime,
        end: endDateTime,
        allDay: !hasTime,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        textColor: style.textColor,
        classNames: dto.isDone === true || dto.isDone === 'Y' ? ['fc-event-done'] : [],
        extendedProps: {
            tdno: dto.tdno,
            tempId: dto.tempId,
            grade: Number(dto.grade ?? 1),
            isDone: dto.isDone,
            content: dto.content,
            originalStartTime: startTime,
            originalEndTime: endTime,
            dailyTimes: dto.dailyTimes ?? [],
            // 드래그 시에는 날짜/시간이 아직 확정되지 않았음을 나타내는 플래그 추가 (선택 사항)
            isTemporaryDragEvent: !dto.startDate, // startDate가 없으면 임시 이벤트로 간주
            rno: dto.rno ?? null,
        },
    };
};

export const sortCalendarTodos = (todoList) => {
    return [...todoList].sort((a, b) => {
        const aTime = a.dailyTimes?.[0]?.startTime ?? null;
        const bTime = b.dailyTimes?.[0]?.startTime ?? null;

        const aHasTime = !!aTime && aTime !== '00:00:00';
        const bHasTime = !!bTime && bTime !== '00:00:00';

        if (aHasTime && !bHasTime) return -1;
        if (!aHasTime && bHasTime) return 1;

        if (aHasTime && bHasTime) {
            if (aTime < bTime) return -1;
            if (aTime > bTime) return 1;
            return b.grade - a.grade;
        }

        return b.grade - a.grade;
    });
};

export const sortRecurringTodosByStartTime = (list) => {
    return [...list].sort((a, b) => {
        const aTime = a.startTime ?? null;
        const bTime = b.startTime ?? null;

        const aHasTime = !!aTime && aTime !== '00:00:00';
        const bHasTime = !!bTime && bTime !== '00:00:00';

        if (aHasTime && !bHasTime) return -1;
        if (!aHasTime && bHasTime) return 1;

        if (aHasTime && bHasTime) {
            if (aTime < bTime) return -1;
            if (aTime > bTime) return 1;
        }

        // 같은 시간이거나 둘 다 시간 없음 → grade 높은 순
        return b.grade - a.grade;
    });
};