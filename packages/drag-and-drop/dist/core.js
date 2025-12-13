var PluginName;
(function (PluginName) {
    PluginName["DragAndDrop"] = "dragAndDrop";
    PluginName["EventModal"] = "eventModal";
    PluginName["ScrollController"] = "scrollController";
    PluginName["EventRecurrence"] = "eventRecurrence";
    PluginName["Resize"] = "resize";
    PluginName["CalendarControls"] = "calendarControls";
    PluginName["CurrentTime"] = "currentTime";
})(PluginName || (PluginName = {}));

class InvalidTimeStringError extends Error {
    constructor(timeString) {
        super(`Invalid time string: ${timeString}`);
    }
}

// regex for strings between 00:00 and 23:59
const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;

class NumberRangeError extends Error {
    constructor(min, max) {
        super(`Number must be between ${min} and ${max}.`);
        Object.defineProperty(this, "min", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: min
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: max
        });
    }
}

const doubleDigit = (number) => {
    if (number < 0 || number > 99)
        throw new NumberRangeError(0, 99);
    return String(number).padStart(2, '0');
};

const minuteTimePointMultiplier = 1.6666666666666667; // 100 / 60
const timePointsFromString = (timeString) => {
    if (!timeStringRegex.test(timeString) && timeString !== '24:00')
        throw new InvalidTimeStringError(timeString);
    const [hoursInt, minutesInt] = timeString
        .split(':')
        .map((time) => parseInt(time, 10));
    let minutePoints = (minutesInt * minuteTimePointMultiplier).toString();
    if (minutePoints.split('.')[0].length < 2)
        minutePoints = `0${minutePoints}`;
    return Number(hoursInt + minutePoints);
};
const addTimePointsToDateTime = (dateTime, pointsToAdd) => {
    const minutesToAdd = Math.round(pointsToAdd / minuteTimePointMultiplier);
    const newDateTime = dateTime.add({ minutes: minutesToAdd });
    return newDateTime;
};

const toDateString = (date) => {
    return `${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)}`;
};

const addDays = (to, nDays) => {
    if (nDays < 0) {
        return to.subtract({ days: -nDays });
    }
    return to.add({ days: nDays });
};

const setDateInDateTime = (dateTime, newDate) => {
    const updatedDateTime = dateTime.with({
        year: newDate.year,
        month: newDate.month,
        day: newDate.day,
    });
    return updatedDateTime;
};

const getTimeGridEventCopyElementId = (id) => {
    return 'time-grid-event-copy-' + id;
};

const updateRecurringEvent = ($app, eventCopy, startPreDrag) => {
    var _a;
    (_a = $app.config.plugins.eventRecurrence) === null || _a === void 0 ? void 0 : _a.updateRecurrenceDND(eventCopy.id, startPreDrag, eventCopy.start);
};
const updateNonRecurringEvent = ($app, eventCopy) => {
    const eventToUpdate = $app.calendarEvents.list.value.find((event) => event.id === eventCopy.id);
    if (!eventToUpdate)
        return;
    eventToUpdate.start = eventCopy.start;
    eventToUpdate.end = eventCopy.end;
    $app.calendarEvents.list.value = [...$app.calendarEvents.list.value];
};
const updateDraggedEvent = ($app, eventCopy, startPreDrag) => {
    if ('rrule' in eventCopy._getForeignProperties() &&
        $app.config.plugins.eventRecurrence) {
        updateRecurringEvent($app, eventCopy, startPreDrag);
    }
    else {
        updateNonRecurringEvent($app, eventCopy);
    }
    if ($app.config.callbacks.onEventUpdate) {
        $app.config.callbacks.onEventUpdate(eventCopy._getExternalEvent());
    }
};

const isUIEventTouchEvent = (event) => {
    return 'touches' in event && typeof event.touches === 'object';
};

const getEventCoordinates = (uiEvent) => {
    const actualEvent = isUIEventTouchEvent(uiEvent)
        ? uiEvent.touches[0]
        : uiEvent;
    return {
        clientX: actualEvent.clientX,
        clientY: actualEvent.clientY,
    };
};

const getTimePointsPerPixel = ($app) => {
    return $app.config.timePointsPerDay / $app.config.weekOptions.value.gridHeight;
};

const testIfShouldAbort = async ($app, 
/**
 * For the month grid the original event is used, since there is no copy created for dragging.
 * For other views, a copy is used, hence the name of this parameter.
 * */
eventCopyOrOriginalEvent, originalStart, originalEnd, updateCopy) => {
    const onBeforeEventUpdate = $app.config.callbacks.onBeforeEventUpdateAsync ||
        $app.config.callbacks.onBeforeEventUpdate;
    if (onBeforeEventUpdate) {
        const oldEvent = eventCopyOrOriginalEvent._getExternalEvent();
        oldEvent.start = originalStart;
        oldEvent.end = originalEnd;
        const newEvent = eventCopyOrOriginalEvent._getExternalEvent();
        const validationResult = await onBeforeEventUpdate(oldEvent, newEvent, $app);
        if (!validationResult) {
            updateCopy === null || updateCopy === void 0 ? void 0 : updateCopy(undefined);
            return true; // abort
        }
    }
    return false;
};

class TimeGridDragHandlerImpl {
    constructor($app, eventCoordinates, eventCopy, updateCopy, dayBoundariesDateTime, CHANGE_THRESHOLD_IN_TIME_POINTS) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
        Object.defineProperty(this, "eventCoordinates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventCoordinates
        });
        Object.defineProperty(this, "eventCopy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventCopy
        });
        Object.defineProperty(this, "updateCopy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: updateCopy
        });
        Object.defineProperty(this, "dayBoundariesDateTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dayBoundariesDateTime
        });
        Object.defineProperty(this, "CHANGE_THRESHOLD_IN_TIME_POINTS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: CHANGE_THRESHOLD_IN_TIME_POINTS
        });
        Object.defineProperty(this, "dayWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastIntervalDiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastDaysDiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "originalStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "handleMouseOrTouchMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (uiEvent) => {
                const { clientX, clientY } = getEventCoordinates(uiEvent);
                const pixelDiffY = clientY - this.startY;
                const timePointsDiffY = pixelDiffY * this.timePointsPerPixel();
                const currentIntervalDiff = Math.round(timePointsDiffY / this.CHANGE_THRESHOLD_IN_TIME_POINTS);
                const pixelDiffX = clientX - this.startX;
                const currentDaysDiff = Math.round(pixelDiffX / this.dayWidth);
                this.handleVerticalMouseOrTouchMove(currentIntervalDiff);
                this.handleHorizontalMouseOrTouchMove(currentDaysDiff);
            }
        });
        Object.defineProperty(this, "handleMouseUpOrTouchEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                document.removeEventListener('mousemove', this.handleMouseOrTouchMove);
                document.removeEventListener('touchmove', this.handleMouseOrTouchMove);
                document.removeEventListener('mouseup', this.handleMouseUpOrTouchEnd);
                document.removeEventListener('touchend', this.handleMouseUpOrTouchEnd);
                this.updateCopy(undefined);
                const shouldAbort = await testIfShouldAbort(this.$app, this.eventCopy, this.originalStart, this.originalEnd, this.updateCopy);
                if (shouldAbort)
                    return;
                this.updateOriginalEvent();
            }
        });
        this.dayWidth = $app.elements.calendarWrapper.querySelector('.sx__time-grid-day').clientWidth;
        this.startY = this.eventCoordinates.clientY;
        this.startX = this.eventCoordinates.clientX;
        this.originalStart = Temporal.ZonedDateTime.from(this.eventCopy.start.toString());
        this.originalEnd = Temporal.ZonedDateTime.from(this.eventCopy.end.toString());
        this.init();
    }
    init() {
        document.addEventListener('mousemove', this.handleMouseOrTouchMove);
        document.addEventListener('mouseup', this.handleMouseUpOrTouchEnd);
        document.addEventListener('touchmove', this.handleMouseOrTouchMove, {
            passive: false,
        });
        document.addEventListener('touchend', this.handleMouseUpOrTouchEnd);
    }
    timePointsPerPixel() {
        return getTimePointsPerPixel(this.$app);
    }
    handleVerticalMouseOrTouchMove(currentIntervalDiff) {
        if (currentIntervalDiff === this.lastIntervalDiff)
            return;
        const pointsToAdd = currentIntervalDiff > this.lastIntervalDiff
            ? this.CHANGE_THRESHOLD_IN_TIME_POINTS *
                (currentIntervalDiff - this.lastIntervalDiff)
            : -this.CHANGE_THRESHOLD_IN_TIME_POINTS *
                (this.lastIntervalDiff - currentIntervalDiff);
        this.setTimeForEventCopy(pointsToAdd);
        this.lastIntervalDiff = currentIntervalDiff;
    }
    setTimeForEventCopy(pointsToAdd) {
        const newStart = addTimePointsToDateTime(this.eventCopy.start, pointsToAdd);
        const newEnd = addTimePointsToDateTime(this.eventCopy.end, pointsToAdd);
        let currentDiff = this.lastDaysDiff;
        if (this.$app.config.direction === 'rtl') {
            currentDiff = -currentDiff;
        }
        if (newStart.epochNanoseconds <
            addDays(this.dayBoundariesDateTime.start, currentDiff).epochNanoseconds)
            return;
        if (newEnd.epochNanoseconds >
            addDays(this.dayBoundariesDateTime.end, currentDiff).epochNanoseconds)
            return;
        this.eventCopy.start = newStart;
        this.eventCopy.end = newEnd;
        this.updateCopy(this.eventCopy);
    }
    handleHorizontalMouseOrTouchMove(totalDaysDiff) {
        if (totalDaysDiff === this.lastDaysDiff)
            return;
        let diffToAdd = totalDaysDiff - this.lastDaysDiff;
        if (this.$app.config.direction === 'rtl')
            diffToAdd = -diffToAdd;
        const newStartDate = addDays(this.eventCopy.start, diffToAdd);
        const newEndDate = addDays(this.eventCopy.end, diffToAdd);
        const newStart = setDateInDateTime(this.eventCopy.start, newStartDate);
        const newEnd = setDateInDateTime(this.eventCopy.end, newEndDate);
        if (newStart.epochNanoseconds <
            this.$app.calendarState.range.value.start.epochNanoseconds)
            return;
        if (newEnd.epochNanoseconds >
            this.$app.calendarState.range.value.end.epochNanoseconds)
            return;
        this.setDateForEventCopy(newStart, newEnd);
        this.transformEventCopyPosition(totalDaysDiff);
        this.lastDaysDiff = totalDaysDiff;
    }
    setDateForEventCopy(newStart, newEnd) {
        this.eventCopy.start = newStart;
        this.eventCopy.end = newEnd;
        this.updateCopy(this.eventCopy);
    }
    transformEventCopyPosition(totalDaysDiff) {
        const copyElement = this.$app.elements.calendarWrapper.querySelector('#' + getTimeGridEventCopyElementId(this.eventCopy.id));
        copyElement.style.transform = `translateX(calc(${totalDaysDiff * 100}% + ${totalDaysDiff}px))`;
    }
    updateOriginalEvent() {
        if (this.lastIntervalDiff === 0 && this.lastDaysDiff === 0)
            return;
        const dayIsSame = this.lastDaysDiff === 0;
        const eventElement = document.querySelector(`[data-event-id="${this.eventCopy.id}"]`);
        const shouldHideEventToPreventFlickering = !dayIsSame && eventElement instanceof HTMLElement;
        if (shouldHideEventToPreventFlickering)
            eventElement.style.display = 'none';
        updateDraggedEvent(this.$app, this.eventCopy, this.originalStart);
    }
}

const getTimeGridDayWidth = ($app) => {
    return $app.elements.calendarWrapper.querySelector('.sx__time-grid-day').clientWidth;
};

const getDateGridEventCopy = ($app, eventCopy) => {
    return $app.elements.calendarWrapper.querySelector('#' + getTimeGridEventCopyElementId(eventCopy.id));
};

class DateGridDragHandlerImpl {
    constructor($app, eventCoordinates, eventCopy, updateCopy) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
        Object.defineProperty(this, "eventCopy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventCopy
        });
        Object.defineProperty(this, "updateCopy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: updateCopy
        });
        Object.defineProperty(this, "startX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dayWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rangeStartDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rangeEndDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastDaysDiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "handleMouseOrTouchMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (uiEvent) => {
                const { clientX } = getEventCoordinates(uiEvent);
                const pixelDiffX = clientX - this.startX;
                let currentDaysDiff = Math.round(pixelDiffX / this.dayWidth);
                if (this.$app.config.direction === 'rtl')
                    currentDaysDiff *= -1;
                if (currentDaysDiff === this.lastDaysDiff)
                    return;
                const newStart = addDays(this.originalStart, currentDaysDiff);
                const newStartDate = Temporal.PlainDate.from(newStart).toString();
                const newEnd = addDays(this.originalEnd, currentDaysDiff);
                const newEndDate = Temporal.PlainDate.from(newEnd).toString();
                if (newStartDate > this.rangeEndDate.toString())
                    return;
                if (newEndDate < this.rangeStartDate.toString())
                    return;
                this.eventCopy.start = newStart;
                this.eventCopy.end = newEnd;
                const newStartIsInWeek = newStart.toString() >= this.rangeStartDate.toString() &&
                    newStart.toString() <= this.rangeEndDate.toString();
                const firstDateInGrid = newStartIsInWeek
                    ? newStart.toString()
                    : this.rangeStartDate;
                const lastDateIsInGrid = newEnd.toString() >= this.rangeStartDate.toString() &&
                    newEnd.toString() <= this.rangeEndDate.toString();
                const lastDateInGrid = lastDateIsInGrid
                    ? newEnd.toString()
                    : this.rangeEndDate.toString();
                this.eventCopy._nDaysInGrid =
                    Math.round(Temporal.PlainDate.from(firstDateInGrid)
                        .until(Temporal.PlainDate.from(lastDateInGrid))
                        .total('days')) + 1;
                /**
                 * Transitioning the position sideways is not necessary as long as the start date is earlier than the first date in the grid.
                 * While moving an event during a state as such, it will optically look as if its position is transitioned, since the event width is increased and decreased
                 * as the event is moved.
                 * */
                if (newStart.toString() >= this.rangeStartDate.toString())
                    this.transformEventCopyPosition(newStart.toString());
                this.updateCopy(this.eventCopy);
                this.lastDaysDiff = currentDaysDiff;
            }
        });
        Object.defineProperty(this, "handleMouseUpOrTouchEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                document.removeEventListener('mousemove', this.handleMouseOrTouchMove);
                document.removeEventListener('touchmove', this.handleMouseOrTouchMove);
                const shouldAbort = await testIfShouldAbort(this.$app, this.eventCopy, this.originalStart, this.originalEnd, this.updateCopy);
                if (shouldAbort)
                    return;
                this.updateOriginalEvent();
                setTimeout(() => {
                    this.updateCopy(undefined);
                }, 10); // Timeout needed to prevent the original from being displayed for a split second, before being removed from DOM.
            }
        });
        this.startX = eventCoordinates.clientX;
        this.dayWidth = getTimeGridDayWidth(this.$app);
        this.originalStart =
            this.eventCopy.start instanceof Temporal.PlainDate
                ? Temporal.PlainDate.from(this.eventCopy.start.toString())
                : Temporal.ZonedDateTime.from(this.eventCopy.start.toString()).withTimeZone(this.$app.config.timezone.value);
        this.originalEnd =
            this.eventCopy.end instanceof Temporal.PlainDate
                ? Temporal.PlainDate.from(this.eventCopy.end.toString())
                : Temporal.ZonedDateTime.from(this.eventCopy.end.toString()).withTimeZone(this.$app.config.timezone.value);
        this.rangeStartDate = Temporal.PlainDate.from(this.$app.calendarState.range.value.start);
        this.rangeEndDate = Temporal.PlainDate.from(addDays(this.rangeStartDate, $app.config.weekOptions.value.nDays - 1));
        this.init();
    }
    init() {
        document.addEventListener('mousemove', this.handleMouseOrTouchMove);
        document.addEventListener('mouseup', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
        document.addEventListener('touchmove', this.handleMouseOrTouchMove, {
            passive: false,
        });
        document.addEventListener('touchend', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
    }
    transformEventCopyPosition(newStartDate) {
        const originalStartDate = this.originalStart.toString();
        const originalStartInGrid = originalStartDate >= this.rangeStartDate.toString()
            ? originalStartDate
            : this.rangeStartDate.toString();
        let daysToShift = Math.round(Temporal.PlainDate.from(originalStartInGrid)
            .until(Temporal.PlainDate.from(newStartDate))
            .total('days'));
        if (this.$app.config.direction === 'rtl')
            daysToShift *= -1;
        getDateGridEventCopy(this.$app, this.eventCopy).style.transform =
            `translateX(calc(${daysToShift * this.dayWidth}px + ${daysToShift}px))`;
    }
    updateOriginalEvent() {
        if (this.lastDaysDiff === 0)
            return;
        updateDraggedEvent(this.$app, this.eventCopy, this.originalStart);
    }
}

const calculateDaysDifference = (startDate, endDate) => {
    return Temporal.PlainDate.from(startDate)
        .until(Temporal.PlainDate.from(endDate))
        .total('days');
};

const dateFromDateTime = (dateTime) => {
    return dateTime.slice(0, 10);
};
const timeFromDateTime = (dateTime) => {
    return dateTime.slice(11);
};

var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["MONDAY"] = 1] = "MONDAY";
    WeekDay[WeekDay["TUESDAY"] = 2] = "TUESDAY";
    WeekDay[WeekDay["WEDNESDAY"] = 3] = "WEDNESDAY";
    WeekDay[WeekDay["THURSDAY"] = 4] = "THURSDAY";
    WeekDay[WeekDay["FRIDAY"] = 5] = "FRIDAY";
    WeekDay[WeekDay["SATURDAY"] = 6] = "SATURDAY";
    WeekDay[WeekDay["SUNDAY"] = 7] = "SUNDAY";
})(WeekDay || (WeekDay = {}));

WeekDay.MONDAY;
const DEFAULT_EVENT_COLOR_NAME = 'primary';

class CalendarEventImpl {
    constructor(_config, id, _start, _end, title, people, location, description, calendarId, _options = undefined, _customContent = {}, _foreignProperties = {}) {
        Object.defineProperty(this, "_config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _config
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "_start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _start
        });
        Object.defineProperty(this, "_end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _end
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: title
        });
        Object.defineProperty(this, "people", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: people
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: location
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarId
        });
        Object.defineProperty(this, "_options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _options
        });
        Object.defineProperty(this, "_customContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _customContent
        });
        Object.defineProperty(this, "_foreignProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _foreignProperties
        });
        Object.defineProperty(this, "_previousConcurrentEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_totalConcurrentEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_maxConcurrentEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_nDaysInGrid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_createdAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_originalTimezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_eventFragments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this._originalTimezone =
            this._start instanceof Temporal.ZonedDateTime
                ? this._start.timeZoneId
                : undefined;
    }
    get start() {
        if (this._start instanceof Temporal.PlainDate) {
            return this._start;
        }
        return this._start.withTimeZone(this._config.timezone.value);
    }
    set start(value) {
        this._start =
            value instanceof Temporal.ZonedDateTime
                ? value.withTimeZone(this._originalTimezone)
                : value;
    }
    get end() {
        if (this._end instanceof Temporal.PlainDate) {
            return this._end;
        }
        return this._end.withTimeZone(this._config.timezone.value);
    }
    set end(value) {
        this._end =
            value instanceof Temporal.ZonedDateTime
                ? value.withTimeZone(this._originalTimezone)
                : value;
    }
    get _isSingleDayTimed() {
        if (this.start instanceof Temporal.PlainDate ||
            this.end instanceof Temporal.PlainDate)
            return false;
        const localStartDate = dateFromDateTime(this.start.toString());
        const localEndDate = dateFromDateTime(this.end.toString());
        return localStartDate === localEndDate;
    }
    get _isSingleDayFullDay() {
        const startDate = dateFromDateTime(this.start.toString());
        const endDate = dateFromDateTime(this.end.toString());
        return (startDate === endDate &&
            this.start instanceof Temporal.PlainDate &&
            this.end instanceof Temporal.PlainDate);
    }
    get _isMultiDayTimed() {
        if (this.start instanceof Temporal.PlainDate ||
            this.end instanceof Temporal.PlainDate)
            return false;
        const startDate = dateFromDateTime(this.start.toString());
        const endDate = dateFromDateTime(this.end.toString());
        return startDate !== endDate;
    }
    get _isMultiDayFullDay() {
        const startDate = dateFromDateTime(this.start.toString());
        const endDate = dateFromDateTime(this.end.toString());
        return (this.start instanceof Temporal.PlainDate &&
            this.end instanceof Temporal.PlainDate &&
            startDate !== endDate);
    }
    get _isSingleHybridDayTimed() {
        if (!this._config.isHybridDay)
            return false;
        if (this.start instanceof Temporal.PlainDate ||
            this.end instanceof Temporal.PlainDate)
            return false;
        const startDate = dateFromDateTime(this.start.toString());
        const endDate = dateFromDateTime(this.end.toString());
        const endDateMinusOneDay = toDateString(Temporal.PlainDate.from(endDate).subtract({ days: 1 }));
        if (startDate !== endDate && startDate !== endDateMinusOneDay)
            return false;
        const dayBoundaries = this._config.dayBoundaries.value;
        const eventStartTimePoints = timePointsFromString(timeFromDateTime(this.start.toString()));
        const eventEndTimePoints = timePointsFromString(timeFromDateTime(this.end.toString()));
        const eventIsFullyInFirstDayOfBoundary = eventEndTimePoints > eventStartTimePoints && startDate === endDate;
        return ((eventStartTimePoints >= dayBoundaries.start &&
            (eventEndTimePoints <= dayBoundaries.end ||
                eventIsFullyInFirstDayOfBoundary)) ||
            (eventStartTimePoints < dayBoundaries.end &&
                eventEndTimePoints <= dayBoundaries.end));
    }
    get _color() {
        if (this.calendarId &&
            this._config.calendars.value &&
            this.calendarId in this._config.calendars.value) {
            return this._config.calendars.value[this.calendarId].colorName;
        }
        return DEFAULT_EVENT_COLOR_NAME;
    }
    _getForeignProperties() {
        return this._foreignProperties;
    }
    _getExternalEvent() {
        return {
            id: this.id,
            start: this._start,
            end: this._end,
            title: this.title,
            people: this.people,
            location: this.location,
            description: this.description,
            calendarId: this.calendarId,
            _options: this._options,
            ...this._getForeignProperties(),
        };
    }
}

class CalendarEventBuilder {
    constructor(_config, id, start, end) {
        Object.defineProperty(this, "_config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _config
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        Object.defineProperty(this, "people", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_foreignProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "_customContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    build() {
        return new CalendarEventImpl(this._config, this.id, this.start, this.end, this.title, this.people, this.location, this.description, this.calendarId, this._options, this._customContent, this._foreignProperties);
    }
    withTitle(title) {
        this.title = title;
        return this;
    }
    withPeople(people) {
        this.people = people;
        return this;
    }
    withLocation(location) {
        this.location = location;
        return this;
    }
    withDescription(description) {
        this.description = description;
        return this;
    }
    withForeignProperties(foreignProperties) {
        this._foreignProperties = foreignProperties;
        return this;
    }
    withCalendarId(calendarId) {
        this.calendarId = calendarId;
        return this;
    }
    withOptions(options) {
        this._options = options;
        return this;
    }
    withCustomContent(customContent) {
        this._customContent = customContent;
        return this;
    }
}

const deepCloneEvent = (calendarEvent, $app) => {
    const calendarEventInternal = new CalendarEventBuilder($app.config, calendarEvent.id, calendarEvent._start, calendarEvent._end)
        .withTitle(calendarEvent.title)
        .withPeople(calendarEvent.people)
        .withCalendarId(calendarEvent.calendarId)
        .withForeignProperties(JSON.parse(JSON.stringify(calendarEvent._getForeignProperties())))
        .withLocation(calendarEvent.location)
        .withDescription(calendarEvent.description)
        .withOptions(calendarEvent._options)
        .withCustomContent(calendarEvent._customContent)
        .build();
    calendarEventInternal._nDaysInGrid = calendarEvent._nDaysInGrid;
    return calendarEventInternal;
};

class MonthGridDragHandlerImpl {
    constructor(calendarEvent, $app) {
        Object.defineProperty(this, "calendarEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarEvent
        });
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
        Object.defineProperty(this, "allDayElements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentDragoverDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventNDays", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originalEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "MONTH_DAY_CLASS_NAME", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'sx__month-grid-day'
        });
        Object.defineProperty(this, "MONTH_DAY_SELECTOR", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `.${this.MONTH_DAY_CLASS_NAME}`
        });
        Object.defineProperty(this, "DAY_DRAGOVER_CLASS_NAME", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'sx__month-grid-day--dragover'
        });
        Object.defineProperty(this, "handleDragOver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (e) => {
                e.preventDefault();
                let dayElement = e.target;
                if (!(dayElement instanceof HTMLDivElement) ||
                    !dayElement.classList.contains(this.MONTH_DAY_CLASS_NAME))
                    dayElement = e.target.closest(this.MONTH_DAY_SELECTOR);
                if (this.currentDragoverDate === dayElement.dataset.date)
                    return;
                this.currentDragoverDate = dayElement.dataset.date;
                const newEndDate = addDays(Temporal.PlainDate.from(this.currentDragoverDate), this.eventNDays - 1);
                this.allDayElements.forEach((el) => {
                    const dayElementDate = el.dataset.date;
                    if (dayElementDate >= this.currentDragoverDate &&
                        dayElementDate <= newEndDate.toString()) {
                        el.classList.add(this.DAY_DRAGOVER_CLASS_NAME);
                    }
                    else {
                        el.classList.remove(this.DAY_DRAGOVER_CLASS_NAME);
                    }
                });
            }
        });
        Object.defineProperty(this, "handleDragEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                document.removeEventListener('mouseup', this.handleMouseUp);
                this.allDayElements.forEach((el) => {
                    el.removeEventListener('dragover', this.handleDragOver);
                    el.classList.remove(this.DAY_DRAGOVER_CLASS_NAME);
                });
                this.setCalendarEventPointerEventsTo('auto');
                const updatedEvent = this.createUpdatedEvent();
                const shouldAbort = await testIfShouldAbort(this.$app, updatedEvent, this.originalStart, this.originalEnd);
                if (shouldAbort)
                    return;
                this.updateCalendarEvent(updatedEvent);
            }
        });
        Object.defineProperty(this, "handleMouseUp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                document.removeEventListener('dragend', this.handleDragEnd);
                this.setCalendarEventPointerEventsTo('auto');
            }
        });
        Object.defineProperty(this, "setCalendarEventPointerEventsTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (pointerEvents) => {
                var _a;
                ((_a = this.$app.elements.calendarWrapper) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.sx__event')).forEach((el) => {
                    if (String(el.dataset.eventId) === String(this.calendarEvent.id))
                        return;
                    el.style.pointerEvents = pointerEvents;
                });
            }
        });
        Object.defineProperty(this, "createUpdatedEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const eventCopy = deepCloneEvent(this.calendarEvent, this.$app);
                const diffOldDateAndNewDate = calculateDaysDifference(Temporal.PlainDate.from(this.calendarEvent.start), Temporal.PlainDate.from(this.currentDragoverDate));
                eventCopy.start = addDays(eventCopy.start, diffOldDateAndNewDate);
                eventCopy.end = addDays(eventCopy.end, diffOldDateAndNewDate);
                return eventCopy;
            }
        });
        Object.defineProperty(this, "updateCalendarEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (newEvent) => {
                updateDraggedEvent(this.$app, newEvent, this.originalStart);
            }
        });
        this.originalStart = this.calendarEvent.start;
        this.originalEnd = this.calendarEvent.end;
        this.allDayElements = $app.elements.calendarWrapper.querySelectorAll(this.MONTH_DAY_SELECTOR);
        this.eventNDays =
            calculateDaysDifference(this.calendarEvent.start, this.calendarEvent.end) + 1;
        this.init();
    }
    init() {
        document.addEventListener('dragend', this.handleDragEnd, { once: true });
        document.addEventListener('mouseup', this.handleMouseUp, { once: true });
        this.allDayElements.forEach((el) => {
            el.addEventListener('dragover', this.handleDragOver);
        });
        this.setCalendarEventPointerEventsTo('none');
    }
}

const definePlugin = (name, definition) => {
    definition.name = name;
    return definition;
};

class DragAndDropPluginImpl {
    onRender($app) {
        if (!$app.elements.calendarWrapper)
            return;
        $app.elements.calendarWrapper.dataset.hasDnd = 'true';
    }
    constructor(minutesPerInterval = 15) {
        Object.defineProperty(this, "minutesPerInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: minutesPerInterval
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: PluginName.DragAndDrop
        });
        this.minutesPerInterval = this.validateInterval(minutesPerInterval);
    }
    createTimeGridDragHandler(dependencies, dayBoundariesDateTime) {
        return new TimeGridDragHandlerImpl(dependencies.$app, dependencies.eventCoordinates, dependencies.eventCopy, dependencies.updateCopy, dayBoundariesDateTime, this.getTimePointsForIntervalConfig());
    }
    getTimePointsForIntervalConfig() {
        return (100 * this.minutesPerInterval) / 60;
    }
    validateInterval(minutes) {
        if (minutes < 5) {
            console.warn(`[Schedule-X warning]: Drag and drop plugin Interval must be at least 5 minutes. Setting to 5 minutes.`);
            return 5;
        }
        if (minutes > 60) {
            console.warn(`[Schedule-X warning]: Drag and drop plugin Interval cannot exceed 60 minutes. Setting to 60 minutes.`);
            return 60;
        }
        return minutes;
    }
    setInterval(minutes) {
        this.minutesPerInterval = this.validateInterval(minutes);
    }
    createDateGridDragHandler(dependencies) {
        return new DateGridDragHandlerImpl(dependencies.$app, dependencies.eventCoordinates, dependencies.eventCopy, dependencies.updateCopy);
    }
    createMonthGridDragHandler(calendarEvent, $app) {
        return new MonthGridDragHandlerImpl(calendarEvent, $app);
    }
}
const createDragAndDropPlugin = (minutesPerInterval = 15) => {
    return definePlugin('dragAndDrop', new DragAndDropPluginImpl(minutesPerInterval));
};

export { createDragAndDropPlugin };
