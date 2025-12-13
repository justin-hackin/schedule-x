'use strict';

require('preact/jsx-runtime');

const getTimePointsPerPixel = ($app) => {
    return $app.config.timePointsPerDay / $app.config.weekOptions.value.gridHeight;
};

const minuteTimePointMultiplier = 1.6666666666666667; // 100 / 60
const addTimePointsToDateTime = (dateTime, pointsToAdd) => {
    const minutesToAdd = Math.round(pointsToAdd / minuteTimePointMultiplier);
    const newDateTime = dateTime.add({ minutes: minutesToAdd });
    return newDateTime;
};

const updateEventsList = ($app, eventCopy, oldEventEnd, newEventEnd) => {
    const rrule = eventCopy._getForeignProperties().rrule;
    if (rrule && $app.config.plugins.eventRecurrence) {
        $app.config.plugins.eventRecurrence.updateRecurrenceOnResize(eventCopy.id, oldEventEnd, newEventEnd);
        return;
    }
    const eventToUpdate = $app.calendarEvents.list.value.find((event) => event.id === eventCopy.id);
    if (!eventToUpdate)
        return;
    eventToUpdate.end = eventCopy.end;
    $app.calendarEvents.list.value = [...$app.calendarEvents.list.value];
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

class TimeGridEventResizer {
    constructor($app, eventCopy, updateCopy, initialY, CHANGE_THRESHOLD_IN_TIME_POINTS, dayBoundariesDateTime) {
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
        Object.defineProperty(this, "initialY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: initialY
        });
        Object.defineProperty(this, "CHANGE_THRESHOLD_IN_TIME_POINTS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: CHANGE_THRESHOLD_IN_TIME_POINTS
        });
        Object.defineProperty(this, "dayBoundariesDateTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dayBoundariesDateTime
        });
        Object.defineProperty(this, "originalEventEnd", {
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
        Object.defineProperty(this, "lastValidEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "handleMouseOrTouchMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                const { clientY } = getEventCoordinates(event);
                const pixelDiffY = clientY - this.initialY;
                const timePointsDiffY = pixelDiffY * getTimePointsPerPixel(this.$app);
                const currentIntervalDiff = Math.round(timePointsDiffY / this.CHANGE_THRESHOLD_IN_TIME_POINTS);
                const timeDidNotChange = currentIntervalDiff === this.lastIntervalDiff;
                if (timeDidNotChange)
                    return;
                this.lastIntervalDiff = currentIntervalDiff;
                this.setNewTimeForEventEnd(this.CHANGE_THRESHOLD_IN_TIME_POINTS * currentIntervalDiff);
            }
        });
        Object.defineProperty(this, "handleMouseUpOrTouchEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                const onBeforeEventUpdate = this.$app.config.callbacks.onBeforeEventUpdateAsync ||
                    this.$app.config.callbacks.onBeforeEventUpdate;
                if (onBeforeEventUpdate) {
                    const oldEvent = this.eventCopy._getExternalEvent();
                    oldEvent.end = this.originalEventEnd;
                    const newEvent = this.eventCopy._getExternalEvent();
                    const validationResult = await onBeforeEventUpdate(oldEvent, newEvent, this.$app);
                    if (!validationResult) {
                        this.eventCopy.end = this.originalEventEnd;
                        this.finish();
                        return;
                    }
                }
                this.setNewTimeForEventEnd(this.CHANGE_THRESHOLD_IN_TIME_POINTS * this.lastIntervalDiff);
                updateEventsList(this.$app, this.eventCopy, this.originalEventEnd, this.lastValidEnd);
                this.finish();
                if (this.$app.config.callbacks.onEventUpdate) {
                    this.$app.config.callbacks.onEventUpdate(this.eventCopy._getExternalEvent());
                }
            }
        });
        this.originalEventEnd = this.eventCopy.end;
        this.lastValidEnd = this.eventCopy.end;
        const calendarWrapper = this.$app.elements.calendarWrapper;
        if (!calendarWrapper)
            return;
        calendarWrapper.classList.add('sx__is-resizing');
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.$app.elements.calendarWrapper.addEventListener('mousemove', this.handleMouseOrTouchMove);
        document.addEventListener('mouseup', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
        this.$app.elements.calendarWrapper.addEventListener('touchmove', this.handleMouseOrTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
    }
    setNewTimeForEventEnd(pointsToAdd) {
        const newEnd = addTimePointsToDateTime(this.originalEventEnd, pointsToAdd);
        if (newEnd.epochNanoseconds >
            this.dayBoundariesDateTime.end.epochNanoseconds ||
            newEnd.epochNanoseconds <=
                this.eventCopy.start.epochNanoseconds)
            return;
        this.lastValidEnd = newEnd;
        this.eventCopy.end = this.lastValidEnd;
        this.updateCopy(this.eventCopy);
    }
    finish() {
        this.updateCopy(undefined);
        this.$app.elements.calendarWrapper.classList.remove('sx__is-resizing');
        this.$app.elements.calendarWrapper.removeEventListener('mousemove', this.handleMouseOrTouchMove);
        this.$app.elements.calendarWrapper.removeEventListener('touchmove', this.handleMouseOrTouchMove);
    }
}

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

const getTimeGridDayWidth = ($app) => {
    return $app.elements.calendarWrapper.querySelector('.sx__time-grid-day').clientWidth;
};

const definePlugin = (name, definition) => {
    definition.name = name;
    return definition;
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

const addDays = (to, nDays) => {
    if (nDays < 0) {
        return to.subtract({ days: -nDays });
    }
    return to.add({ days: nDays });
};

class DateGridEventResizer {
    constructor($app, eventCopy, updateCopy, initialX) {
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
        Object.defineProperty(this, "initialX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: initialX
        });
        Object.defineProperty(this, "dayWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "originalEventEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ORIGINAL_NDAYS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastNDaysDiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "handleMouseOrTouchMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                const { clientX } = getEventCoordinates(event);
                const xDifference = clientX - this.initialX;
                let lastNDaysDiff = Math.floor(xDifference / this.dayWidth);
                if (this.$app.config.direction === 'rtl')
                    lastNDaysDiff *= -1;
                if (lastNDaysDiff === this.lastNDaysDiff)
                    return;
                this.lastNDaysDiff = lastNDaysDiff;
                this.setNewTimeForEventEnd();
            }
        });
        Object.defineProperty(this, "handleMouseUpOrTouchEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                const onBeforeEventUpdate = this.$app.config.callbacks.onBeforeEventUpdateAsync ||
                    this.$app.config.callbacks.onBeforeEventUpdate;
                if (onBeforeEventUpdate) {
                    const oldEvent = this.eventCopy._getExternalEvent();
                    oldEvent.end = this.originalEventEnd;
                    const newEvent = this.eventCopy._getExternalEvent();
                    const validationResult = await onBeforeEventUpdate(oldEvent, newEvent, this.$app);
                    if (!validationResult) {
                        this.eventCopy.end = this.originalEventEnd;
                        this.finish();
                        return;
                    }
                }
                updateEventsList(this.$app, this.eventCopy, this.originalEventEnd, this.eventCopy.end);
                this.finish();
                if (this.$app.config.callbacks.onEventUpdate) {
                    this.$app.config.callbacks.onEventUpdate(this.eventCopy._getExternalEvent());
                }
            }
        });
        this.originalEventEnd = eventCopy.end;
        this.ORIGINAL_NDAYS = eventCopy._nDaysInGrid || 0;
        const calendarWrapper = this.$app.elements.calendarWrapper;
        if (!calendarWrapper)
            return;
        calendarWrapper.classList.add('sx__is-resizing');
        this.dayWidth = getTimeGridDayWidth(this.$app);
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.$app.elements.calendarWrapper.addEventListener('mousemove', this.handleMouseOrTouchMove);
        document.addEventListener('mouseup', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
        this.$app.elements.calendarWrapper.addEventListener('touchmove', this.handleMouseOrTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleMouseUpOrTouchEnd, {
            once: true,
        });
    }
    setNewTimeForEventEnd() {
        const newEnd = addDays(this.originalEventEnd, this.lastNDaysDiff);
        let rangeStart = this.$app.calendarState.range.value.start;
        if (newEnd instanceof Temporal.PlainDate) {
            rangeStart = Temporal.PlainDate.from(rangeStart);
        }
        if (newEnd.toString() >
            this.$app.calendarState.range.value.end.toString() ||
            newEnd.toString() < this.eventCopy.start.toString() ||
            newEnd.toString() < rangeStart.toString())
            return;
        this.eventCopy.end = newEnd;
        this.eventCopy._nDaysInGrid = this.ORIGINAL_NDAYS + this.lastNDaysDiff;
        this.updateCopy(this.eventCopy);
    }
    finish() {
        this.updateCopy(undefined);
        this.$app.elements.calendarWrapper.classList.remove('sx__is-resizing');
        this.$app.elements.calendarWrapper.removeEventListener('mousemove', this.handleMouseOrTouchMove);
        this.$app.elements.calendarWrapper.removeEventListener('touchmove', this.handleMouseOrTouchMove);
    }
}

class ResizePluginImpl {
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
            value: PluginName.Resize
        });
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.minutesPerInterval = this.validateInterval(minutesPerInterval);
    }
    onRender($app) {
        this.$app = $app;
    }
    createTimeGridEventResizer(calendarEvent, updateCopy, uiEvent, dayBoundariesDateTime) {
        if (!this.$app)
            return this.logError();
        const { clientY } = getEventCoordinates(uiEvent);
        new TimeGridEventResizer(this.$app, calendarEvent, updateCopy, clientY, this.getTimePointsForIntervalConfig(), dayBoundariesDateTime);
    }
    createDateGridEventResizer(calendarEvent, updateCopy, uiEvent) {
        if (!this.$app)
            return this.logError();
        const { clientX } = getEventCoordinates(uiEvent);
        new DateGridEventResizer(this.$app, calendarEvent, updateCopy, clientX);
    }
    getTimePointsForIntervalConfig() {
        return (100 * this.minutesPerInterval) / 60;
    }
    logError() {
        console.error('The calendar is not yet initialized. Cannot resize events.');
    }
    validateInterval(minutes) {
        if (minutes < 5) {
            console.warn(`[Schedule-X warning]: Resize plugin Interval must be at least 5 minutes. Setting to 5 minutes.`);
            return 5;
        }
        if (minutes > 60) {
            console.warn(`[Schedule-X warning]: Resize plugin Interval cannot exceed 60 minutes. Setting to 60 minutes.`);
            return 60;
        }
        return minutes;
    }
    setInterval(minutes) {
        this.minutesPerInterval = this.validateInterval(minutes);
    }
}
const createResizePlugin = (minutesPerInterval = 15) => {
    return definePlugin('resize', new ResizePluginImpl(minutesPerInterval));
};

exports.createResizePlugin = createResizePlugin;
