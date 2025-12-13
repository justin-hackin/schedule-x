'use strict';

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

const toDateString = (date) => {
    return `${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)}`;
};

const timePointToPercentage = (timePointsInDay, dayBoundaries, timePoint) => {
    if (timePoint < dayBoundaries.start) {
        const firstDayTimePoints = 2400 - dayBoundaries.start;
        return ((timePoint + firstDayTimePoints) / timePointsInDay) * 100;
    }
    return ((timePoint - dayBoundaries.start) / timePointsInDay) * 100;
};

class InvalidTimeStringError extends Error {
    constructor(timeString) {
        super(`Invalid time string: ${timeString}`);
    }
}

// regex for strings between 00:00 and 23:59
const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;

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

const timeFromDateTime = (dateTime) => {
    return dateTime.slice(11);
};

const getYCoordinateInTimeGrid = (dateTime, dayBoundaries, pointsPerDay) => {
    return timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(dateTime.toString())));
};

const definePlugin = (name, definition) => {
    definition.name = name;
    return definition;
};

class CurrentTimePluginImpl {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'currentTime'
        });
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "currentTimeIndicator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    onRender($app) {
        this.$app = $app;
        this.observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    this.setIndicator();
                }
            }
        });
        const calendarWrapper = $app.elements.calendarWrapper;
        if (!calendarWrapper) {
            throw new Error('Calendar wrapper not found');
        }
        this.observer.observe(calendarWrapper, {
            childList: true,
            subtree: true,
        });
    }
    setIndicator(isRecursion = false) {
        const todayDateString = toDateString(Temporal.Now.plainDateISO(this.$app.config.timezone.value));
        const nowDateTime = Temporal.Now.zonedDateTimeISO(this.$app.config.timezone.value);
        const todayElement = this.$app.elements.calendarWrapper.querySelector(`[data-time-grid-date="${todayDateString}"]`);
        if (!todayElement)
            return;
        const existingIndicator = todayElement.querySelector('.sx__current-time-indicator');
        if (existingIndicator && isRecursion)
            existingIndicator.remove();
        if (todayElement && !existingIndicator) {
            this.currentTimeIndicator = document.createElement('div');
            this.currentTimeIndicator.classList.add('sx__current-time-indicator');
            const top = getYCoordinateInTimeGrid(nowDateTime, this.$app.config.dayBoundaries.value, this.$app.config.timePointsPerDay) + '%';
            this.currentTimeIndicator.style.top = top;
            todayElement.appendChild(this.currentTimeIndicator);
            if (this.config.fullWeekWidth) {
                this.createFullWidthIndicator(top);
            }
            this.timeout = setTimeout(this.setIndicator.bind(this, true), 60000 - (Date.now() % 60000));
        }
    }
    createFullWidthIndicator(top) {
        const fullWeekTimeIndicator = document.createElement('div');
        fullWeekTimeIndicator.classList.add('sx__current-time-indicator-full-week');
        fullWeekTimeIndicator.style.top = top;
        const weekGridWrapper = document.querySelector('.sx__week-grid');
        const existingFullWeekIndicator = weekGridWrapper === null || weekGridWrapper === void 0 ? void 0 : weekGridWrapper.querySelector('.sx__current-time-indicator-full-week');
        if (existingFullWeekIndicator) {
            existingFullWeekIndicator.remove();
        }
        if (weekGridWrapper) {
            weekGridWrapper.appendChild(fullWeekTimeIndicator);
        }
    }
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.currentTimeIndicator) {
            this.currentTimeIndicator.remove();
            this.currentTimeIndicator = null;
        }
    }
    onTimezoneChange() {
        this.resetIndicator();
    }
    onDayBoundariesChange() {
        this.resetIndicator();
    }
    resetIndicator() {
        var _a;
        (_a = this.currentTimeIndicator) === null || _a === void 0 ? void 0 : _a.remove();
        this.currentTimeIndicator = null;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.setIndicator();
    }
}
const createCurrentTimePlugin = (config) => {
    return definePlugin('currentTime', new CurrentTimePluginImpl(config));
};

exports.createCurrentTimePlugin = createCurrentTimePlugin;
