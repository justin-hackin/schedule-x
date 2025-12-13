'use strict';

var preact = require('preact');
var jsxRuntime = require('preact/jsx-runtime');
var hooks = require('preact/hooks');
var compat = require('preact/compat');
var signals = require('@preact/signals');

const AppContext$1 = preact.createContext({});

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3c!-- Uploaded to: SVG Repo%2c www.svgrepo.com%2c Generator: SVG Repo Mixer Tools --%3e%3csvg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M6 9L12 15L18 9' stroke='%23B8B5B8' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

/**
 * Can be used for generating a random id for an entity
 * Should, however, never be used in potentially resource intense loops,
 * since the performance cost of this compared to new Date().getTime() is ca x4 in v8
 * */
const randomStringId = () => 's' + Math.random().toString(36).substring(2, 11);

const isKeyEnterOrSpace = (keyboardEvent) => keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ';

function AppInput() {
    const datePickerInputId = randomStringId();
    const datePickerLabelId = randomStringId();
    const inputWrapperId = randomStringId();
    const $app = hooks.useContext(AppContext$1);
    const [wrapperClasses, setWrapperClasses] = hooks.useState([]);
    const setInputElement = () => {
        const inputWrapperEl = document.getElementById(inputWrapperId);
        $app.datePickerState.inputWrapperElement.value =
            inputWrapperEl instanceof HTMLDivElement ? inputWrapperEl : undefined;
    };
    hooks.useEffect(() => {
        if ($app.config.teleportTo)
            setInputElement();
        const newClasses = ['sx__date-input-wrapper'];
        if ($app.datePickerState.isOpen.value)
            newClasses.push('sx__date-input--active');
        setWrapperClasses(newClasses);
    }, [$app.datePickerState.isOpen.value]);
    const handleKeyUp = (event) => {
        if (event.key === 'Enter')
            handleInputValue(event);
    };
    const handleInputValue = (event) => {
        event.stopPropagation(); // prevent date picker from closing
        try {
            $app.datePickerState.handleInput(event.target.value);
            $app.datePickerState.close();
        }
        catch (e) {
            console.log('Error setting input value:' + e);
        }
    };
    hooks.useEffect(() => {
        const inputElement = typeof document !== 'undefined' &&
            document.getElementById(datePickerInputId);
        if (typeof HTMLElement === 'undefined' ||
            !(inputElement instanceof HTMLElement))
            return;
        inputElement.addEventListener('change', handleInputValue); // Preact onChange triggers on every input
        return () => inputElement.removeEventListener('change', handleInputValue);
    });
    hooks.useEffect(() => {
        if ($app.config.hasPlaceholder) {
            $app.datePickerState.inputDisplayedValue.value =
                $app.translate('MM/DD/YYYY');
        }
    }, []);
    const handleClick = () => {
        $app.datePickerState.open();
    };
    const handleButtonKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent)) {
            keyboardEvent.preventDefault();
            $app.datePickerState.open();
            setTimeout(() => {
                const element = document.querySelector('[data-focus="true"]');
                if (element instanceof HTMLElement)
                    element.focus();
            }, 50);
        }
    };
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("div", { className: wrapperClasses.join(' '), id: inputWrapperId, children: [jsxRuntime.jsx("label", { for: datePickerInputId, id: datePickerLabelId, className: "sx__date-input-label", children: $app.config.label || $app.translate('Date') }), jsxRuntime.jsx("input", { id: datePickerInputId, tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, name: $app.config.name || 'date', "aria-describedby": datePickerLabelId, value: $app.datePickerState.inputDisplayedValue.value, "data-testid": "date-picker-input", className: "sx__date-input", onClick: handleClick, onKeyUp: handleKeyUp, type: "text" }), jsxRuntime.jsx("button", { type: "button", tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, "aria-label": $app.translate('Choose Date'), onKeyDown: handleButtonKeyDown, onClick: () => $app.datePickerState.open(), className: "sx__button sx__date-input-chevron-wrapper", children: jsxRuntime.jsx("img", { className: "sx__date-input-chevron", src: img, alt: "" }) })] }) }));
}

var DatePickerView;
(function (DatePickerView) {
    DatePickerView["MONTH_DAYS"] = "month-days";
    DatePickerView["YEARS"] = "years";
})(DatePickerView || (DatePickerView = {}));

const YEARS_VIEW = 'years-view';
const MONTH_VIEW = 'months-view';
const DATE_PICKER_WEEK = 'date-picker-week';

const toLocalizedMonth = (date, locale) => {
    return date.toLocaleString(locale, { month: 'long' });
};
const toLocalizedDateString = (date, locale) => {
    return date.toLocaleString(locale, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
};
const getOneLetterDayNames = (week, locale) => {
    return week.map((date) => {
        return date.toLocaleString(locale, { weekday: 'short' }).charAt(0);
    });
};
const getDayNameShort = (date, locale) => {
    if (locale === 'he-IL') {
        return date.toLocaleString(locale, { weekday: 'narrow' });
    }
    return date.toLocaleString(locale, { weekday: 'short' });
};
const getDayNamesShort = (week, locale) => {
    return week.map((date) => getDayNameShort(date, locale));
};
const getOneLetterOrShortDayNames = (week, locale) => {
    if (['zh-cn', 'zh-tw', 'ca-es', 'he-il'].includes(locale.toLowerCase())) {
        return getDayNamesShort(week, locale);
    }
    return getOneLetterDayNames(week, locale);
};

const DateFormats = {
    DATE_STRING: /^\d{4}-\d{2}-\d{2}$/,
    DATE_TIME_STRING: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
};

class InvalidDateTimeError extends Error {
    constructor(dateTimeSpecification) {
        super(`Invalid date time specification: ${dateTimeSpecification}`);
    }
}

const toJSDate = (dateTimeSpecification) => {
    if (!DateFormats.DATE_TIME_STRING.test(dateTimeSpecification) &&
        !DateFormats.DATE_STRING.test(dateTimeSpecification))
        throw new InvalidDateTimeError(dateTimeSpecification);
    return new Date(Number(dateTimeSpecification.slice(0, 4)), Number(dateTimeSpecification.slice(5, 7)) - 1, Number(dateTimeSpecification.slice(8, 10)), Number(dateTimeSpecification.slice(11, 13)), // for date strings this will be 0
    Number(dateTimeSpecification.slice(14, 16)) // for date strings this will be 0
    );
};
const toIntegers = (dateTimeSpecification) => {
    const hours = dateTimeSpecification.slice(11, 13), minutes = dateTimeSpecification.slice(14, 16);
    return {
        year: Number(dateTimeSpecification.slice(0, 4)),
        month: Number(dateTimeSpecification.slice(5, 7)) - 1,
        date: Number(dateTimeSpecification.slice(8, 10)),
        hours: hours !== '' ? Number(hours) : undefined,
        minutes: minutes !== '' ? Number(minutes) : undefined,
    };
};

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

const toDateString$1 = (date) => {
    return `${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)}`;
};
const toTimeString = (date) => {
    return `${doubleDigit(date.hour)}:${doubleDigit(date.minute)}`;
};
const toDateTimeString = (date) => {
    return `${toDateString$1(date)} ${toTimeString(date)}`;
};

const addMonths = (to, nMonths) => {
    if (nMonths < 0) {
        return to.subtract({ months: -nMonths });
    }
    return to.add({ months: nMonths });
};
const addDays = (to, nDays) => {
    if (nDays < 0) {
        return to.subtract({ days: -nDays });
    }
    return to.add({ days: nDays });
};

const getFirstDayOPreviousMonth = (date) => {
    return addMonths(date, -1).with({ day: 1 });
};
const getFirstDayOfNextMonth = (date) => {
    const nextMonth = addMonths(date, 1);
    return nextMonth.with({ day: 1 });
};

function Chevron({ direction, onClick, buttonText, disabled = false, }) {
    const handleKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent))
            onClick();
    };
    return (jsxRuntime.jsx("button", { type: "button", disabled: disabled, className: "sx__button sx__chevron-wrapper sx__ripple", onMouseUp: onClick, onKeyDown: handleKeyDown, tabIndex: 0, children: jsxRuntime.jsx("i", { className: `sx__chevron sx__chevron--${direction}`, children: buttonText }) }));
}

function MonthViewHeader({ setYearsView }) {
    const $app = hooks.useContext(AppContext$1);
    const dateStringToLocalizedMonthName = (selectedDate) => {
        return toLocalizedMonth(selectedDate, $app.config.locale.value);
    };
    const getYearFrom = (datePickerDate) => {
        return datePickerDate.year;
    };
    const [selectedDateMonthName, setSelectedDateMonthName] = hooks.useState(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
    const [datePickerYear, setDatePickerYear] = hooks.useState(getYearFrom($app.datePickerState.datePickerDate.value));
    const setPreviousMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOPreviousMonth($app.datePickerState.datePickerDate.value);
    };
    const setNextMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOfNextMonth($app.datePickerState.datePickerDate.value);
    };
    hooks.useEffect(() => {
        setSelectedDateMonthName(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
        setDatePickerYear(getYearFrom($app.datePickerState.datePickerDate.value));
    }, [$app.datePickerState.datePickerDate.value]);
    const handleOpenYearsView = (e) => {
        e.stopPropagation();
        setYearsView();
    };
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("header", { className: "sx__date-picker__month-view-header", children: [jsxRuntime.jsx(Chevron, { direction: 'previous', onClick: () => setPreviousMonth(), buttonText: $app.translate('Previous month') }), jsxRuntime.jsx("button", { type: "button", className: "sx__button sx__date-picker__month-view-header__month-year", onClick: (event) => handleOpenYearsView(event), children: selectedDateMonthName + ' ' + datePickerYear }), jsxRuntime.jsx(Chevron, { direction: 'next', onClick: () => setNextMonth(), buttonText: $app.translate('Next month') })] }) }));
}

function DayNames() {
    const $app = hooks.useContext(AppContext$1);
    const aWeek = $app.timeUnitsImpl.getWeekFor($app.datePickerState.datePickerDate.value);
    const dayNames = getOneLetterOrShortDayNames(aWeek, $app.config.locale.value);
    return (jsxRuntime.jsx("div", { className: "sx__date-picker__day-names", children: dayNames.map((dayName) => (jsxRuntime.jsx("span", { "data-testid": "day-name", className: "sx__date-picker__day-name", children: dayName }))) }));
}

const isToday = (date, timezone) => {
    const today = Temporal.Now.zonedDateTimeISO(timezone);
    return (date.day === today.day &&
        date.month === today.month &&
        date.year === today.year);
};
const isSameMonth = (date1, date2) => {
    return date1.month === date2.month && date1.year === date2.year;
};
const isSameDay = (date1, date2) => {
    return (date1.day === date2.day &&
        date1.month === date2.month &&
        date1.year === date2.year);
};

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506771/time
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function TimeIcon({ strokeColor }) {
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("svg", { className: "sx__event-icon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsxRuntime.jsx("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }), jsxRuntime.jsx("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }), jsxRuntime.jsxs("g", { id: "SVGRepo_iconCarrier", children: [jsxRuntime.jsx("path", { d: "M12 8V12L15 15", stroke: strokeColor, "stroke-width": "2", "stroke-linecap": "round" }), jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "9", stroke: strokeColor, "stroke-width": "2" })] })] }) }));
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506772/user
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function UserIcon({ strokeColor }) {
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("svg", { className: "sx__event-icon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsxRuntime.jsx("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }), jsxRuntime.jsx("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }), jsxRuntime.jsxs("g", { id: "SVGRepo_iconCarrier", children: [jsxRuntime.jsx("path", { d: "M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z", stroke: strokeColor, "stroke-width": "2" }), jsxRuntime.jsx("path", { d: "M5 19.5C5 15.9101 7.91015 13 11.5 13H12.5C16.0899 13 19 15.9101 19 19.5V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V19.5Z", stroke: strokeColor, "stroke-width": "2" })] })] }) }));
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/489502/location-pin
 * License: PD License
 * Author: Dariush Habibpour
 * Author website: https://redl.ink/dariush/links?ref=svgrepo.com
 * */
function LocationPinIcon({ strokeColor }) {
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("svg", { className: "sx__event-icon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsxRuntime.jsx("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }), jsxRuntime.jsx("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }), jsxRuntime.jsxs("g", { id: "SVGRepo_iconCarrier", children: [jsxRuntime.jsxs("g", { "clip-path": "url(#clip0_429_11046)", children: [jsxRuntime.jsx("rect", { x: "12", y: "11", width: "0.01", height: "0.01", stroke: strokeColor, "stroke-width": "2", "stroke-linejoin": "round" }), jsxRuntime.jsx("path", { d: "M12 22L17.5 16.5C20.5376 13.4624 20.5376 8.53757 17.5 5.5C14.4624 2.46244 9.53757 2.46244 6.5 5.5C3.46244 8.53757 3.46244 13.4624 6.5 16.5L12 22Z", stroke: strokeColor, "stroke-width": "2", "stroke-linejoin": "round" })] }), jsxRuntime.jsx("defs", { children: jsxRuntime.jsx("clipPath", { id: "clip0_429_11046", children: jsxRuntime.jsx("rect", { width: "24", height: "24", fill: "white" }) }) })] })] }) }));
}

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
const timeStringFromTimePoints = (timePoints) => {
    const hours = Math.floor(timePoints / 100);
    const minutes = Math.round((timePoints % 100) / minuteTimePointMultiplier);
    return `${doubleDigit(hours)}:${doubleDigit(minutes)}`;
};
const addTimePointsToDateTime = (dateTime, pointsToAdd) => {
    const minutesToAdd = Math.round(pointsToAdd / minuteTimePointMultiplier);
    const newDateTime = dateTime.add({ minutes: minutesToAdd });
    return newDateTime;
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

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_FIRST_DAY_OF_WEEK = WeekDay.MONDAY;
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
        const endDateMinusOneDay = toDateString$1(Temporal.PlainDate.from(endDate).subtract({ days: 1 }));
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

const concatenatePeople = (people) => {
    return people.reduce((acc, person, index) => {
        if (index === 0)
            return person;
        if (index === people.length - 1)
            return `${acc} & ${person}`;
        return `${acc}, ${person}`;
    }, '');
};

const dateFn = (dateTime, locale) => {
    return dateTime.toLocaleString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
const getLocalizedDate$1 = dateFn;
const timeFn = (dateTime, locale) => {
    const dateTimeString = dateTime.toString();
    const { year, month, date, hours, minutes } = toIntegers(dateTimeString);
    return new Date(year, month, date, hours, minutes).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: 'numeric',
    });
};
const getTimeStamp = (calendarEvent, // to facilitate testing. In reality, we will always have a full CalendarEventInternal
locale, delimiter = '\u2013') => {
    var _a, _b, _c, _d;
    const eventTime = { start: calendarEvent.start, end: calendarEvent.end };
    if (calendarEvent._isSingleDayFullDay) {
        return dateFn(eventTime.start, locale);
    }
    if (calendarEvent._isMultiDayFullDay) {
        return `${dateFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}`;
    }
    if (calendarEvent._isSingleDayTimed &&
        ((_a = eventTime.start) === null || _a === void 0 ? void 0 : _a.toString()) !== ((_b = eventTime.end) === null || _b === void 0 ? void 0 : _b.toString())) {
        return `${dateFn(eventTime.start, locale)} <span aria-hidden="true">⋅</span> ${timeFn(eventTime.start, locale)} ${delimiter} ${timeFn(eventTime.end, locale)}`;
    }
    if (calendarEvent._isSingleDayTimed &&
        ((_c = calendarEvent.start) === null || _c === void 0 ? void 0 : _c.toString()) === ((_d = calendarEvent.end) === null || _d === void 0 ? void 0 : _d.toString())) {
        return `${dateFn(eventTime.start, locale)}, ${timeFn(eventTime.start, locale)}`;
    }
    return `${dateFn(eventTime.start, locale)}, ${timeFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}, ${timeFn(eventTime.end, locale)}`;
};

function MonthViewWeek({ week }) {
    const $app = hooks.useContext(AppContext$1);
    const weekDays = week.map((day) => {
        const classes = ['sx__date-picker__day'];
        if (isToday(day, $app.config.timezone.value))
            classes.push('sx__date-picker__day--today');
        if (isSameDay(day, $app.datePickerState.selectedDate.value))
            classes.push('sx__date-picker__day--selected');
        if (!isSameMonth(day, $app.datePickerState.datePickerDate.value))
            classes.push('is-leading-or-trailing');
        return {
            day: day.toPlainDate(),
            classes,
        };
    });
    const isDateSelectable = (date) => {
        return (date.toString() >= $app.config.min.toString() &&
            date.toString() <= $app.config.max.toString());
    };
    const selectDate = (date) => {
        $app.datePickerState.selectedDate.value = date;
        $app.datePickerState.close();
    };
    const hasFocus = (weekDay) => isSameDay(weekDay.day, $app.datePickerState.datePickerDate.value);
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            $app.datePickerState.selectedDate.value =
                $app.datePickerState.datePickerDate.value;
            $app.datePickerState.close();
            return;
        }
        const keyMapDaysToAdd = new Map([
            ['ArrowDown', 7],
            ['ArrowUp', -7],
            ['ArrowLeft', -1],
            ['ArrowRight', 1],
        ]);
        $app.datePickerState.datePickerDate.value = addDays($app.datePickerState.datePickerDate.value, keyMapDaysToAdd.get(event.key) || 0);
    };
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { "data-testid": DATE_PICKER_WEEK, className: "sx__date-picker__week", children: weekDays.map((weekDay) => (jsxRuntime.jsx("button", { type: "button", tabIndex: hasFocus(weekDay) ? 0 : -1, disabled: !isDateSelectable(weekDay.day), "aria-label": getLocalizedDate$1($app.datePickerState.datePickerDate.value, $app.config.locale.value), className: `sx__button ${weekDay.classes.join(' ')}`, "data-focus": hasFocus(weekDay) ? 'true' : undefined, onClick: () => selectDate(weekDay.day), onKeyDown: handleKeyDown, children: weekDay.day.day }))) }) }));
}

function MonthView({ seatYearsView }) {
    const elementId = randomStringId();
    const $app = hooks.useContext(AppContext$1);
    const [month, setMonth] = hooks.useState([]);
    const renderMonth = () => {
        const newDatePickerDate = $app.datePickerState.datePickerDate.value;
        setMonth($app.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(newDatePickerDate.year, newDatePickerDate.month));
    };
    hooks.useEffect(() => {
        renderMonth();
    }, [$app.datePickerState.datePickerDate.value]);
    hooks.useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const mutatedElement = mutation.target;
                if (mutatedElement.dataset.focus === 'true')
                    mutatedElement.focus();
            });
        });
        const monthViewElement = document.getElementById(elementId);
        observer.observe(monthViewElement, {
            childList: true,
            subtree: true,
            attributes: true,
        });
        return () => observer.disconnect();
    }, []);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("div", { id: elementId, "data-testid": MONTH_VIEW, className: "sx__date-picker__month-view", children: [jsxRuntime.jsx(MonthViewHeader, { setYearsView: seatYearsView }), jsxRuntime.jsx(DayNames, {}), month.map((week) => (jsxRuntime.jsx(MonthViewWeek, { week: week })))] }) }));
}

function YearsViewAccordion({ year, setYearAndMonth, isExpanded, expand, }) {
    const $app = hooks.useContext(AppContext$1);
    const yearWithDates = $app.timeUnitsImpl.getMonthsFor(year);
    const handleClickOnMonth = (event, month) => {
        event.stopPropagation();
        setYearAndMonth(year, month.month);
    };
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("li", { className: isExpanded ? 'sx__is-expanded' : '', children: [jsxRuntime.jsx("button", { type: "button", className: "sx__button sx__date-picker__years-accordion__expand-button sx__ripple--wide", onClick: () => expand(year), children: year }), isExpanded && (jsxRuntime.jsx("div", { className: "sx__date-picker__years-view-accordion__panel", children: yearWithDates.map((month) => (jsxRuntime.jsx("button", { type: "button", className: "sx__button sx__date-picker__years-view-accordion__month", onClick: (event) => handleClickOnMonth(event, month), children: toLocalizedMonth(month, $app.config.locale.value) }))) }))] }) }));
}

function YearsView({ setMonthView }) {
    const $app = hooks.useContext(AppContext$1);
    const minYear = $app.config.min.year;
    const maxYear = $app.config.max.year;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const selectedYear = $app.datePickerState.selectedDate.value.year;
    const [expandedYear, setExpandedYear] = hooks.useState(selectedYear);
    const setNewDatePickerDate = (year, month) => {
        $app.datePickerState.datePickerDate.value = Temporal.PlainDate.from({
            year,
            month,
            day: 1,
        });
        setMonthView();
    };
    hooks.useEffect(() => {
        var _a;
        const initiallyExpandedYear = (_a = document
            .querySelector('.sx__date-picker__years-view')) === null || _a === void 0 ? void 0 : _a.querySelector('.sx__is-expanded');
        if (!initiallyExpandedYear)
            return;
        initiallyExpandedYear.scrollIntoView({
            block: 'center',
        });
    }, []);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("ul", { className: "sx__date-picker__years-view", "data-testid": YEARS_VIEW, children: years.map((year) => (jsxRuntime.jsx(YearsViewAccordion, { year: year, setYearAndMonth: (year, month) => setNewDatePickerDate(year, month), isExpanded: expandedYear === year, expand: (year) => setExpandedYear(year) }))) }) }));
}

const isScrollable = (el) => {
    if (el) {
        const hasScrollableContent = el.scrollHeight > el.clientHeight;
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;
        return hasScrollableContent && !isOverflowHidden;
    }
    return true;
};
const getScrollableParents = (el, acc = []) => {
    if (!el ||
        el === document.body ||
        el.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        acc.push(window);
        return acc;
    }
    if (isScrollable(el)) {
        acc.push(el);
    }
    return getScrollableParents((el.assignedSlot
        ? el.assignedSlot.parentNode
        : el.parentNode), acc);
};

const POPUP_CLASS_NAME = 'sx__date-picker-popup';
function AppPopup({ wrapperEl }) {
    const $app = hooks.useContext(AppContext$1);
    const [datePickerView, setDatePickerView] = hooks.useState(DatePickerView.MONTH_DAYS);
    const classList = hooks.useMemo(() => {
        const returnValue = [
            POPUP_CLASS_NAME,
            $app.datePickerState.isDark.value ? 'is-dark' : '',
            $app.config.teleportTo ? 'is-teleported' : '',
        ];
        if ($app.config.placement && !$app.config.teleportTo && wrapperEl) {
            const placement = $app.config.placement instanceof Function
                ? $app.config.placement(wrapperEl)
                : $app.config.placement;
            returnValue.push(placement);
        }
        return returnValue;
    }, [
        $app.datePickerState.isDark.value,
        $app.config.placement,
        $app.config.teleportTo,
    ]);
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (!target.closest(`.${POPUP_CLASS_NAME}`))
            $app.datePickerState.close();
    };
    const escapeKeyListener = (e) => {
        if (e.key === 'Escape') {
            if ($app.config.listeners.onEscapeKeyDown)
                $app.config.listeners.onEscapeKeyDown($app);
            else
                $app.datePickerState.close();
        }
    };
    hooks.useEffect(() => {
        document.addEventListener('click', clickOutsideListener);
        document.addEventListener('keydown', escapeKeyListener);
        return () => {
            document.removeEventListener('click', clickOutsideListener);
            document.removeEventListener('keydown', escapeKeyListener);
        };
    }, []);
    const remSize = Number(getComputedStyle(document.documentElement).fontSize.split('px')[0]);
    const popupHeight = 362;
    const popupWidth = 332;
    const getFixedPositionStyles = () => {
        const inputWrapperEl = $app.datePickerState.inputWrapperElement.value;
        const inputRect = inputWrapperEl === null || inputWrapperEl === void 0 ? void 0 : inputWrapperEl.getBoundingClientRect();
        if (inputWrapperEl === undefined || !(inputRect instanceof DOMRect))
            return undefined;
        const resolvedPlacement = typeof $app.config.placement === 'function'
            ? wrapperEl
                ? $app.config.placement(wrapperEl)
                : 'bottom-end'
            : $app.config.placement;
        if (!resolvedPlacement)
            return undefined;
        return {
            top: resolvedPlacement.includes('bottom')
                ? inputRect.height + inputRect.y + 1 // 1px border
                : inputRect.y - remSize - popupHeight, // subtract remsize to leave room for label text
            left: resolvedPlacement.includes('start')
                ? inputRect.x
                : inputRect.x + inputRect.width - popupWidth,
            width: popupWidth,
            position: 'fixed',
        };
    };
    const [fixedPositionStyle, setFixedPositionStyle] = hooks.useState(getFixedPositionStyles());
    hooks.useEffect(() => {
        const inputWrapper = $app.datePickerState.inputWrapperElement.value;
        if (inputWrapper === undefined)
            return;
        const scrollableParents = getScrollableParents(inputWrapper);
        const scrollListener = () => setFixedPositionStyle(getFixedPositionStyles());
        scrollableParents.forEach((parent) => parent.addEventListener('scroll', scrollListener));
        return () => scrollableParents.forEach((parent) => parent.removeEventListener('scroll', scrollListener));
    }, []);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { style: $app.config.teleportTo ? fixedPositionStyle : undefined, "data-testid": "date-picker-popup", className: classList.join(' '), children: datePickerView === DatePickerView.MONTH_DAYS ? (jsxRuntime.jsx(MonthView, { seatYearsView: () => setDatePickerView(DatePickerView.YEARS) })) : (jsxRuntime.jsx(YearsView, { setMonthView: () => setDatePickerView(DatePickerView.MONTH_DAYS) })) }) }));
}

function AppWrapper({ $app }) {
    const initialClassList = ['sx__date-picker-wrapper'];
    const [classList, setClassList] = hooks.useState(initialClassList);
    const elementRef = compat.useRef(null);
    hooks.useEffect(() => {
        if ((elementRef === null || elementRef === void 0 ? void 0 : elementRef.current) &&
            typeof HTMLElement !== 'undefined' &&
            elementRef.current instanceof HTMLElement) {
            $app.elements = { DatePickerWrapper: elementRef.current };
        }
    }, []);
    hooks.useEffect(() => {
        var _a;
        const list = [...initialClassList];
        if ($app.datePickerState.isDark.value)
            list.push('is-dark');
        if ((_a = $app.config.style) === null || _a === void 0 ? void 0 : _a.fullWidth)
            list.push('has-full-width');
        if ($app.datePickerState.isDisabled.value)
            list.push('is-disabled');
        setClassList(list);
    }, [$app.datePickerState.isDark.value, $app.datePickerState.isDisabled.value]);
    let appPopupJSX = jsxRuntime.jsx(AppPopup, { wrapperEl: elementRef.current });
    if ($app.config.teleportTo)
        appPopupJSX = compat.createPortal(appPopupJSX, $app.config.teleportTo);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { ref: elementRef, className: classList.join(' '), children: jsxRuntime.jsxs(AppContext$1.Provider, { value: $app, children: [jsxRuntime.jsx(AppInput, {}), $app.datePickerState.isOpen.value && appPopupJSX] }) }) }));
}

const AppContext = preact.createContext({});

class DatePickerAppSingletonImpl {
    constructor(datePickerState, config, timeUnitsImpl, translate, elements = {}) {
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerState
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: timeUnitsImpl
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: translate
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: elements
        });
    }
}

class DatePickerAppSingletonBuilder {
    constructor() {
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new DatePickerAppSingletonImpl(this.datePickerState, this.config, this.timeUnitsImpl, this.translate);
    }
    withDatePickerState(datePickerState) {
        this.datePickerState = datePickerState;
        return this;
    }
    withConfig(config) {
        this.config = config;
        return this;
    }
    withTimeUnitsImpl(timeUnitsImpl) {
        this.timeUnitsImpl = timeUnitsImpl;
        return this;
    }
    withTranslate(translate) {
        this.translate = translate;
        return this;
    }
}

// This enum is used to represent names of all internally built views of the calendar
var InternalViewName;
(function (InternalViewName) {
    InternalViewName["Day"] = "day";
    InternalViewName["Week"] = "week";
    InternalViewName["MonthGrid"] = "month-grid";
    InternalViewName["MonthAgenda"] = "month-agenda";
    InternalViewName["List"] = "list";
})(InternalViewName || (InternalViewName = {}));

const getLocaleStringMonthArgs = ($app) => {
    return [$app.config.locale.value, { month: 'long' }];
};
const getLocaleStringYearArgs = ($app) => {
    return [$app.config.locale.value, { year: 'numeric' }];
};
const getMonthAndYearForDateRange = ($app, rangeStart, rangeEnd) => {
    const startDateMonth = rangeStart.toLocaleString(...getLocaleStringMonthArgs($app));
    const startDateYear = rangeStart.toLocaleString(...getLocaleStringYearArgs($app));
    const endDateMonth = rangeEnd.toLocaleString(...getLocaleStringMonthArgs($app));
    const endDateYear = rangeEnd.toLocaleString(...getLocaleStringYearArgs($app));
    if (startDateMonth === endDateMonth && startDateYear === endDateYear) {
        return `${startDateMonth} ${startDateYear}`;
    }
    else if (startDateMonth !== endDateMonth && startDateYear === endDateYear) {
        return `${startDateMonth} – ${endDateMonth} ${startDateYear}`;
    }
    return `${startDateMonth} ${startDateYear} – ${endDateMonth} ${endDateYear}`;
};
const getMonthAndYearForSelectedDate = ($app) => {
    const dateMonth = $app.datePickerState.selectedDate.value.toLocaleString(...getLocaleStringMonthArgs($app));
    const dateYear = $app.datePickerState.selectedDate.value.toLocaleString(...getLocaleStringYearArgs($app));
    return `${dateMonth} ${dateYear}`;
};

function RangeHeading() {
    const $app = hooks.useContext(AppContext);
    const [currentHeading, setCurrentHeading] = hooks.useState('');
    signals.useSignalEffect(() => {
        if ($app.calendarState.view.value === InternalViewName.Week) {
            setCurrentHeading(getMonthAndYearForDateRange($app, $app.calendarState.range.value.start, $app.calendarState.range.value.end));
        }
        if ($app.calendarState.view.value === InternalViewName.MonthGrid ||
            $app.calendarState.view.value === InternalViewName.Day ||
            $app.calendarState.view.value === InternalViewName.MonthAgenda) {
            setCurrentHeading(getMonthAndYearForSelectedDate($app));
        }
    });
    return jsxRuntime.jsx("span", { className: 'sx__range-heading', children: currentHeading });
}

function TodayButton() {
    const $app = hooks.useContext(AppContext);
    const setToday = () => {
        $app.datePickerState.selectedDate.value = Temporal.PlainDate.from(Temporal.Now.plainDateISO($app.config.timezone.value));
    };
    return (jsxRuntime.jsx("button", { type: "button", className: 'sx__button sx__today-button sx__ripple', onClick: setToday, children: $app.translate('Today') }));
}

function ViewSelection() {
    const $app = hooks.useContext(AppContext);
    const viewSelectId = randomStringId();
    const viewLabelId = randomStringId();
    const [availableViews, setAvailableViews] = hooks.useState([]);
    signals.useSignalEffect(() => {
        if ($app.calendarState.isCalendarSmall.value) {
            setAvailableViews($app.config.views.value.filter((view) => view.hasSmallScreenCompat));
        }
        else {
            setAvailableViews($app.config.views.value.filter((view) => view.hasWideScreenCompat));
        }
    });
    // Get initial selected view label to prevent layout shift
    const getInitialSelectedViewLabel = () => {
        const selectedView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
        return selectedView ? $app.translate(selectedView.label) : '';
    };
    const [selectedViewLabel, setSelectedViewLabel] = hooks.useState(getInitialSelectedViewLabel());
    signals.useSignalEffect(() => {
        const selectedView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
        if (!selectedView)
            return;
        setSelectedViewLabel($app.translate(selectedView.label));
    });
    const [isOpen, setIsOpen] = hooks.useState(false);
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (target instanceof HTMLElement &&
            !target.closest('.sx__view-selection')) {
            setIsOpen(false);
        }
    };
    hooks.useEffect(() => {
        document.addEventListener('click', clickOutsideListener);
        return () => document.removeEventListener('click', clickOutsideListener);
    }, []);
    const handleClickOnSelectionItem = (viewName) => {
        setIsOpen(false);
        $app.calendarState.setView(viewName, $app.datePickerState.selectedDate.value);
    };
    const [viewSelectionItems, setViewSelectionItems] = hooks.useState();
    const [focusedViewIndex, setFocusedViewIndex] = hooks.useState(0);
    const handleSelectedViewKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent)) {
            setIsOpen(!isOpen);
        }
        setTimeout(() => {
            var _a;
            const allOptions = (_a = $app.elements.calendarWrapper) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.sx__view-selection-item');
            if (!allOptions)
                return;
            setViewSelectionItems(allOptions);
            const firstOption = allOptions[0];
            if (firstOption instanceof HTMLElement) {
                setFocusedViewIndex(0);
                firstOption.focus();
            }
        }, 50);
    };
    const navigateUpOrDown = (keyboardEvent, viewName) => {
        if (!viewSelectionItems)
            return;
        if (keyboardEvent.key === 'ArrowDown') {
            const nextOption = viewSelectionItems[focusedViewIndex + 1];
            if (nextOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex + 1);
                nextOption.focus();
            }
        }
        else if (keyboardEvent.key === 'ArrowUp') {
            const prevOption = viewSelectionItems[focusedViewIndex - 1];
            if (prevOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex - 1);
                prevOption.focus();
            }
        }
        else if (isKeyEnterOrSpace(keyboardEvent)) {
            handleClickOnSelectionItem(viewName);
        }
    };
    return (jsxRuntime.jsxs("div", { className: `sx__view-selection ${isOpen ? 'is-open' : ''}`, children: [jsxRuntime.jsx("label", { for: viewSelectId, id: viewLabelId, className: "sx__view-selection-label", children: $app.translate('View') }), jsxRuntime.jsxs("div", { id: viewSelectId, tabIndex: 0, role: "button", "aria-describedby": viewLabelId, "aria-label": $app.translate('Select View'), className: "sx__view-selection-selected-item sx__ripple", onClick: () => setIsOpen(!isOpen), onKeyDown: handleSelectedViewKeyDown, children: [selectedViewLabel, jsxRuntime.jsx("img", { className: "sx__view-selection-chevron", src: img, alt: "" })] }), isOpen && (jsxRuntime.jsx("ul", { "data-testid": "view-selection-items", className: "sx__view-selection-items", children: availableViews.map((view) => (jsxRuntime.jsx("li", { "aria-label": $app.translate('Select View') + ' ' + $app.translate(view.label), tabIndex: -1, role: "button", onKeyDown: (keyboardEvent) => navigateUpOrDown(keyboardEvent, view.name), onClick: () => handleClickOnSelectionItem(view.name), className: 'sx__view-selection-item' +
                        (view.name === $app.calendarState.view.value
                            ? ' is-selected'
                            : ''), children: $app.translate(view.label) }))) }))] }));
}

function ForwardBackwardNavigation() {
    var _a;
    const $app = hooks.useContext(AppContext);
    const navigate = (direction) => {
        const currentView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
        if (!currentView)
            return;
        $app.datePickerState.selectedDate.value = currentView.backwardForwardFn($app.datePickerState.selectedDate.value, direction === 'forwards'
            ? currentView.backwardForwardUnits
            : -currentView.backwardForwardUnits);
    };
    const [localizedRange, setLocalizedRange] = hooks.useState('');
    signals.useSignalEffect(() => {
        setLocalizedRange(`${getLocalizedDate$1($app.calendarState.range.value.start, $app.config.locale.value)} ${$app.translate('to')} ${getLocalizedDate$1($app.calendarState.range.value.end, $app.config.locale.value)}`);
    });
    const [rangeEndMinusOneRange, setRangeEndMinusOneRange] = hooks.useState(null);
    const [rangeStartPlusOneRange, setRangeStartPlusOneRange] = hooks.useState(null);
    signals.useSignalEffect(() => {
        const selectedView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
        if (!selectedView)
            return;
        setRangeEndMinusOneRange(selectedView.setDateRange({
            range: $app.calendarState.range,
            calendarConfig: $app.config,
            timeUnitsImpl: $app.timeUnitsImpl,
            date: (() => {
                const result = selectedView.backwardForwardFn($app.datePickerState.selectedDate.value, -selectedView.backwardForwardUnits);
                return result instanceof Temporal.ZonedDateTime
                    ? result.toPlainDate()
                    : result;
            })(),
        }).end);
        setRangeStartPlusOneRange(selectedView.setDateRange({
            range: $app.calendarState.range,
            calendarConfig: $app.config,
            timeUnitsImpl: $app.timeUnitsImpl,
            date: (() => {
                const result = selectedView.backwardForwardFn($app.datePickerState.selectedDate.value, selectedView.backwardForwardUnits);
                return result instanceof Temporal.ZonedDateTime
                    ? result.toPlainDate()
                    : result;
            })(),
        }).start);
    });
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("div", { className: "sx__forward-backward-navigation", "aria-label": localizedRange, "aria-live": "polite", children: [jsxRuntime.jsx(Chevron, { disabled: !!($app.config.minDate.value &&
                        dateFromDateTime((_a = rangeEndMinusOneRange === null || rangeEndMinusOneRange === void 0 ? void 0 : rangeEndMinusOneRange.toString()) !== null && _a !== void 0 ? _a : '') <
                            $app.config.minDate.value.toString()), onClick: () => navigate('backwards'), direction: 'previous', buttonText: $app.translate('Previous period') }), jsxRuntime.jsx(Chevron, { disabled: !!($app.config.maxDate.value &&
                        rangeStartPlusOneRange &&
                        dateFromDateTime(rangeStartPlusOneRange.toString()) >
                            $app.config.maxDate.value.toString()), onClick: () => navigate('forwards'), direction: 'next', buttonText: $app.translate('Next period') })] }) }));
}

/**
 * Get an element in the DOM by their custom component id
 * */
const getElementByCCID = (customComponentId) => document.querySelector(`[data-ccid="${customComponentId}"]`);

class PreactView {
    constructor(config) {
        Object.defineProperty(this, "randomId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: randomStringId()
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "Component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "setDateRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hasSmallScreenCompat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hasWideScreenCompat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "backwardForwardFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "backwardForwardUnits", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = config.name;
        this.label = config.label;
        this.Component = config.Component;
        this.setDateRange = config.setDateRange;
        this.hasSmallScreenCompat = config.hasSmallScreenCompat;
        this.hasWideScreenCompat = config.hasWideScreenCompat;
        this.backwardForwardFn = config.backwardForwardFn;
        this.backwardForwardUnits = config.backwardForwardUnits;
    }
    render(onElement, $app) {
        preact.render(preact.createElement(this.Component, { $app, id: this.randomId }), onElement);
    }
    destroy() {
        const el = document.getElementById(this.randomId);
        if (el) {
            el.remove();
        }
    }
}
const createPreactView = (config) => {
    return new PreactView(config);
};

const timePointToPercentage = (timePointsInDay, dayBoundaries, timePoint) => {
    if (timePoint < dayBoundaries.start) {
        const firstDayTimePoints = 2400 - dayBoundaries.start;
        return ((timePoint + firstDayTimePoints) / timePointsInDay) * 100;
    }
    return ((timePoint - dayBoundaries.start) / timePointsInDay) * 100;
};

const getEventHeight = (start, end, dayBoundaries, pointsPerDay) => {
    if (start === end) {
        return (timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(addTimePointsToDateTime(end, 50).toString()))) -
            timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(start.toString()))));
    }
    return (timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(end.toString()))) -
        timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(start.toString()))));
};
const getInlineStartRule = (calendarEvent, eventWidth) => {
    if (!calendarEvent._totalConcurrentEvents ||
        !calendarEvent._previousConcurrentEvents)
        return 0;
    return (((calendarEvent._previousConcurrentEvents || 0) /
        (calendarEvent._totalConcurrentEvents || 0)) *
        eventWidth);
};
const getWidthRule = (leftRule, eventWidth, maxConcurrentEvents, eventOverlap) => {
    if (eventOverlap || !maxConcurrentEvents)
        return eventWidth - leftRule;
    return eventWidth / maxConcurrentEvents;
};
const getBorderRule = (calendarEvent) => {
    if (!calendarEvent._previousConcurrentEvents)
        return 0;
    return '1px solid #fff';
};

const getTimeGridEventCopyElementId = (id) => {
    return 'time-grid-event-copy-' + id;
};

const isUIEventTouchEvent = (event) => {
    return 'touches' in event && typeof event.touches === 'object';
};

function useEventInteractions($app) {
    const [eventCopy, setEventCopy] = hooks.useState();
    const updateCopy = (newCopy) => {
        if (!newCopy)
            return setEventCopy(undefined);
        setEventCopy(deepCloneEvent(newCopy, $app));
    };
    const [dragStartTimeout, setDragStartTimeout] = hooks.useState();
    const createDragStartTimeout = (callback, uiEvent) => {
        setDragStartTimeout(setTimeout(() => callback(uiEvent), 150));
    };
    const setClickedEvent = (uiEvent, calendarEvent) => {
        // For some reason, an event without touches is being triggered on touchend
        if (isUIEventTouchEvent(uiEvent) &&
            uiEvent.touches.length === 0)
            return;
        if (!$app.config.plugins.eventModal)
            return;
        const eventTarget = uiEvent.target;
        if (!(eventTarget instanceof HTMLElement))
            return;
        const calendarEventElement = eventTarget.classList.contains('sx__event')
            ? eventTarget
            : eventTarget.closest('.sx__event');
        if (calendarEventElement instanceof HTMLElement) {
            $app.config.plugins.eventModal.calendarEventElement.value =
                calendarEventElement;
            $app.config.plugins.eventModal.setCalendarEvent(calendarEvent, calendarEventElement.getBoundingClientRect());
        }
    };
    const setClickedEventIfNotDragging = (calendarEvent, uiEvent) => {
        if (dragStartTimeout) {
            clearTimeout(dragStartTimeout);
            setClickedEvent(uiEvent, calendarEvent);
        }
        setDragStartTimeout(undefined);
    };
    return {
        eventCopy,
        updateCopy,
        createDragStartTimeout,
        setClickedEventIfNotDragging,
        setClickedEvent,
    };
}

const getCCID = (customComponent, isCopy) => {
    let customComponentId = customComponent
        ? 'custom-time-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined;
    if (customComponentId && isCopy)
        customComponentId += '-' + 'copy';
    return customComponentId;
};

const invokeOnEventClickCallback = ($app, calendarEvent, e) => {
    if ($app.config.callbacks.onEventClick) {
        $app.config.callbacks.onEventClick(calendarEvent._getExternalEvent(), e);
    }
};

const invokeOnEventDoubleClickCallback = ($app, calendarEvent, e) => {
    if ($app.config.callbacks.onDoubleClickEvent) {
        $app.config.callbacks.onDoubleClickEvent(calendarEvent._getExternalEvent(), e);
    }
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

const getYCoordinateInTimeGrid = (dateTime, dayBoundaries, pointsPerDay) => {
    return timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(dateTime.toString())));
};

/**
 * Push a task to the end of the current call stack
 * */
const nextTick = (cb) => {
    setTimeout(() => {
        cb();
    });
};

const focusModal = ($app) => {
    const calendarWrapper = $app.elements.calendarWrapper;
    if (!(calendarWrapper instanceof HTMLElement))
        return;
    const eventModal = calendarWrapper.querySelector('.sx__event-modal');
    if (!(eventModal instanceof HTMLElement))
        return;
    setTimeout(() => {
        eventModal.focus();
    }, 100);
};

const wasEventAddedInLastSecond = (calendarEvent) => {
    return (calendarEvent._createdAt &&
        Date.now() - calendarEvent._createdAt.getTime() < 1000);
};

function TimeGridEvent({ calendarEvent, dayBoundariesDateTime, isCopy, setMouseDown, }) {
    var _a, _b, _c, _d;
    const $app = hooks.useContext(AppContext);
    const eventRef = hooks.useRef(null);
    const [isCompact, setIsCompact] = hooks.useState(false);
    const { eventCopy, updateCopy, createDragStartTimeout, setClickedEventIfNotDragging, setClickedEvent, } = useEventInteractions($app);
    const localizeArgs = [
        $app.config.locale.value,
        { hour: 'numeric', minute: 'numeric' },
    ];
    const getEventTime = (start, end) => {
        const localizedStartTime = start.toLocaleString(...localizeArgs);
        if (start === end) {
            return localizedStartTime;
        }
        const localizedEndTime = end.toLocaleString(...localizeArgs);
        return `${localizedStartTime} – ${localizedEndTime}`;
    };
    const eventCSSVariables = {
        borderInlineStart: `4px solid var(--sx-color-${calendarEvent._color})`,
        textColor: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        iconStroke: `var(--sx-color-on-${calendarEvent._color}-container)`,
    };
    const insetInlineStart = getInlineStartRule(calendarEvent, $app.config.weekOptions.value.eventWidth);
    const handleStartDrag = (uiEvent) => {
        var _a;
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        if (isCopy)
            return;
        if (!uiEvent.target)
            return;
        if (!$app.config.plugins.dragAndDrop)
            return;
        if ((_a = calendarEvent._options) === null || _a === void 0 ? void 0 : _a.disableDND)
            return;
        if (realStartIsBeforeDayBoundaryStart)
            return; // Don't allow dragging events that start before the day boundary; it would require a bunch of adjustments in drag & drop plugin in order to look nice
        const newEventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(newEventCopy);
        $app.config.plugins.dragAndDrop.createTimeGridDragHandler({
            $app,
            eventCoordinates: getEventCoordinates(uiEvent),
            updateCopy,
            eventCopy: newEventCopy,
        }, dayBoundariesDateTime);
    };
    const customComponent = $app.config._customComponentFns.timeGridEvent;
    const customComponentId = hooks.useRef(getCCID(customComponent, isCopy));
    hooks.useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId.current), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, customComponentId.current);
        };
    }, [calendarEvent, eventCopy]);
    // ResizeObserver to detect when event height changes
    hooks.useEffect(() => {
        if (!eventRef.current)
            return;
        const checkHeight = () => {
            const element = eventRef.current;
            if (!element)
                return;
            const height = element.offsetHeight;
            const shouldBeCompact = height < 36;
            setIsCompact(shouldBeCompact);
        };
        checkHeight();
        const resizeObserver = new ResizeObserver(checkHeight);
        resizeObserver.observe(eventRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, [calendarEvent, eventCopy]);
    const handleOnClick = (e) => {
        e.stopPropagation();
        invokeOnEventClickCallback($app, calendarEvent, e);
    };
    const handleOnDoubleClick = (e) => {
        e.stopPropagation();
        invokeOnEventDoubleClickCallback($app, calendarEvent, e);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setClickedEvent(e, calendarEvent);
            invokeOnEventClickCallback($app, calendarEvent, e);
            nextTick(() => {
                focusModal($app);
            });
        }
    };
    const startResize = (e) => {
        setMouseDown(true);
        e.stopPropagation();
        if (isCopy)
            return;
        if ($app.config.plugins.resize) {
            const eventCopy = deepCloneEvent(calendarEvent, $app);
            updateCopy(eventCopy);
            $app.config.plugins.resize.createTimeGridEventResizer(eventCopy, updateCopy, e, dayBoundariesDateTime);
        }
    };
    const borderRule = getBorderRule(calendarEvent);
    const classNames = ['sx__time-grid-event', 'sx__event'];
    if (wasEventAddedInLastSecond(calendarEvent))
        classNames.push('is-event-new');
    if (isCopy)
        classNames.push('is-event-copy');
    if (!$app.config.weekOptions.value.eventOverlap &&
        calendarEvent._maxConcurrentEvents &&
        calendarEvent._maxConcurrentEvents > 1)
        classNames.push('is-event-overlap');
    if ((_a = calendarEvent._options) === null || _a === void 0 ? void 0 : _a.additionalClasses)
        classNames.push(...calendarEvent._options.additionalClasses);
    const handlePointerDown = (e) => {
        setMouseDown(true);
        createDragStartTimeout(handleStartDrag, e);
    };
    const handlePointerUp = (e) => {
        nextTick(() => setMouseDown(false));
        setClickedEventIfNotDragging(calendarEvent, e);
    };
    const hasCustomContent = (_b = calendarEvent._customContent) === null || _b === void 0 ? void 0 : _b.timeGrid;
    const realStartIsBeforeDayBoundaryStart = dayBoundariesDateTime &&
        calendarEvent.start.toString() < dayBoundariesDateTime.start.toString() &&
        calendarEvent.end.toString() >= dayBoundariesDateTime.start.toString();
    const relativeStartWithinDayBoundary = realStartIsBeforeDayBoundaryStart
        ? dayBoundariesDateTime === null || dayBoundariesDateTime === void 0 ? void 0 : dayBoundariesDateTime.start
        : calendarEvent.start;
    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { ref: eventRef, id: isCopy ? getTimeGridEventCopyElementId(calendarEvent.id) : undefined, "data-event-id": calendarEvent.id, onClick: handleOnClick, onDblClick: handleOnDoubleClick, onKeyDown: handleKeyDown, onMouseDown: handlePointerDown, onMouseUp: handlePointerUp, onTouchStart: handlePointerDown, onTouchEnd: handlePointerUp, className: classNames.join(' '), tabIndex: 0, role: "button", style: {
                    top: `${getYCoordinateInTimeGrid(relativeStartWithinDayBoundary, $app.config.dayBoundaries.value, $app.config.timePointsPerDay)}%`,
                    height: `${getEventHeight(relativeStartWithinDayBoundary, calendarEvent.end, $app.config.dayBoundaries.value, $app.config.timePointsPerDay)}%`,
                    insetInlineStart: `${insetInlineStart}%`,
                    width: `${getWidthRule(insetInlineStart, isCopy ? 100 : $app.config.weekOptions.value.eventWidth, calendarEvent._maxConcurrentEvents, $app.config.weekOptions.value.eventOverlap)}%`,
                    backgroundColor: customComponent
                        ? undefined
                        : eventCSSVariables.backgroundColor,
                    color: customComponent ? undefined : eventCSSVariables.textColor,
                    borderTop: borderRule,
                    borderInlineEnd: borderRule,
                    borderBottom: borderRule,
                    borderInlineStart: customComponent
                        ? undefined
                        : eventCSSVariables.borderInlineStart,
                    padding: customComponent ? '0' : undefined,
                }, children: jsxRuntime.jsxs("div", { "data-ccid": customComponentId.current, className: "sx__time-grid-event-inner", children: [!customComponent && !hasCustomContent && (jsxRuntime.jsxs(preact.Fragment, { children: [isCompact && calendarEvent.title && (jsxRuntime.jsxs("div", { className: "sx__title-and-time-compact", children: [jsxRuntime.jsx("div", { className: "sx__time-grid-event-title", children: calendarEvent.title }), jsxRuntime.jsx("div", { className: "sx__time-grid-event-time", children: timeFn(calendarEvent.start, $app.config.locale.value) })] })), !isCompact && calendarEvent.title && (jsxRuntime.jsx("div", { className: "sx__time-grid-event-title", children: calendarEvent.title })), (!isCompact || (isCompact && !calendarEvent.title)) && (jsxRuntime.jsxs("div", { className: "sx__time-grid-event-time", children: [jsxRuntime.jsx(TimeIcon, { strokeColor: eventCSSVariables.iconStroke }), getEventTime(calendarEvent.start, calendarEvent.end)] })), calendarEvent.people && calendarEvent.people.length > 0 && (jsxRuntime.jsxs("div", { className: "sx__time-grid-event-people", children: [jsxRuntime.jsx(UserIcon, { strokeColor: eventCSSVariables.iconStroke }), concatenatePeople(calendarEvent.people)] })), calendarEvent.location && (jsxRuntime.jsxs("div", { className: "sx__time-grid-event-location", children: [jsxRuntime.jsx(LocationPinIcon, { strokeColor: eventCSSVariables.iconStroke }), calendarEvent.location] }))] })), hasCustomContent && (jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                                __html: ((_c = calendarEvent._customContent) === null || _c === void 0 ? void 0 : _c.timeGrid) || '',
                            } })), $app.config.plugins.resize &&
                            !((_d = calendarEvent._options) === null || _d === void 0 ? void 0 : _d.disableResize) && (jsxRuntime.jsx("div", { className: 'sx__time-grid-event-resize-handle', onMouseDown: startResize, onTouchStart: startResize }))] }) }), eventCopy && (jsxRuntime.jsx(TimeGridEvent, { calendarEvent: eventCopy, isCopy: true, setMouseDown: setMouseDown, dayBoundariesDateTime: dayBoundariesDateTime }))] }));
}

const sortEventsByStartAndEnd = (a, b) => {
    if (a.start.toString() === b.start.toString()) {
        if (a.end.toString() < b.end.toString())
            return 1;
        if (a.end.toString() > b.end.toString())
            return -1;
        return 0;
    }
    if (a.start.toString() < b.start.toString())
        return -1;
    if (a.start.toString() > b.start.toString())
        return 1;
    return 0;
};
const sortEventsForMonthGrid = (a, b) => {
    const aStartDate = dateFromDateTime(a.start.toString());
    const bStartDate = dateFromDateTime(b.start.toString());
    const aEndDate = dateFromDateTime(a.end.toString());
    const bEndDate = dateFromDateTime(b.end.toString());
    /**
     * For events that start and end at the same day, sort them by their start time.
     * If they only start on the same day but end on different days, the function needs to move on;
     * an event that starts on 5am today, but ends in 5 days, needs to be placed before an event that starts
     * today at 1am and ends later today. That way we avoid empty gaps in the grid.
     * */
    if (aStartDate === bStartDate && aEndDate === bEndDate) {
        if (a.start.toString() < b.start.toString())
            return -1;
    }
    if (aStartDate === bStartDate) {
        if (aEndDate < bEndDate)
            return 1;
        if (aEndDate > bEndDate)
            return -1;
        return 0;
    }
    if (aStartDate < bStartDate)
        return -1;
    if (aStartDate > bStartDate)
        return 1;
    return 0;
};

const areSameMinute = (start, end) => {
    return (start.year === end.year &&
        start.month === end.month &&
        start.day === end.day &&
        start.hour === end.hour &&
        start.minute === end.minute);
};
const isEvent0Minutes = (e) => {
    return ((e === null || e === void 0 ? void 0 : e.start) instanceof Temporal.ZonedDateTime &&
        (e === null || e === void 0 ? void 0 : e.end) instanceof Temporal.ZonedDateTime &&
        areSameMinute(e.start, e.end));
};
const areEvents0MinutesAndConcurrent = (e1, e2) => {
    return (isEvent0Minutes(e1) &&
        isEvent0Minutes(e2) &&
        (e1 === null || e1 === void 0 ? void 0 : e1.start) instanceof Temporal.ZonedDateTime &&
        (e2 === null || e2 === void 0 ? void 0 : e2.start) instanceof Temporal.ZonedDateTime &&
        areSameMinute(e1.start, e2.start));
};

const handleEventConcurrency = (sortedEvents, concurrentEventsCache = [], currentIndex = 0) => {
    for (let i = currentIndex; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        const nextEvent = sortedEvents[i + 1];
        const areBothEventsZeroMinutes = areEvents0MinutesAndConcurrent(event, nextEvent);
        if (concurrentEventsCache.length &&
            (!nextEvent ||
                (concurrentEventsCache.every((e) => e.end.epochNanoseconds <=
                    nextEvent.start.epochNanoseconds) &&
                    !areBothEventsZeroMinutes))) {
            concurrentEventsCache.push(event);
            for (let ii = 0; ii < concurrentEventsCache.length; ii++) {
                const currentEvent = concurrentEventsCache[ii];
                const NpreviousConcurrentEvents = concurrentEventsCache.filter((cachedEvent, index) => {
                    if (cachedEvent === currentEvent || index > ii)
                        return false;
                    if (areEvents0MinutesAndConcurrent(cachedEvent, currentEvent))
                        return true;
                    return (cachedEvent.start.epochNanoseconds <=
                        currentEvent.start
                            .epochNanoseconds &&
                        cachedEvent.end.epochNanoseconds >
                            currentEvent.start.epochNanoseconds);
                }).length;
                const NupcomingConcurrentEvents = concurrentEventsCache.filter((cachedEvent, index) => {
                    if (cachedEvent === currentEvent || index < ii)
                        return false;
                    if (areEvents0MinutesAndConcurrent(cachedEvent, currentEvent))
                        return true;
                    return (cachedEvent.start.epochNanoseconds <
                        currentEvent.end.epochNanoseconds &&
                        cachedEvent.end.epochNanoseconds >=
                            currentEvent.start.epochNanoseconds);
                }).length;
                currentEvent._totalConcurrentEvents =
                    NpreviousConcurrentEvents + NupcomingConcurrentEvents + 1;
                currentEvent._previousConcurrentEvents = NpreviousConcurrentEvents;
                // TODO v3: try to use _maxConcurrentEvents for both overlap/no overlap mode, and remove _totalConcurrentEvents
                let maxOverlappingEvents = 0;
                const timePoints = [];
                concurrentEventsCache.forEach((cachedEvent) => {
                    if ((cachedEvent.end.epochNanoseconds >
                        currentEvent.start.epochNanoseconds &&
                        cachedEvent.start.epochNanoseconds <
                            currentEvent.end
                                .epochNanoseconds) ||
                        areEvents0MinutesAndConcurrent(cachedEvent, currentEvent)) {
                        timePoints.push({
                            time: cachedEvent.start.toString(),
                            type: 'start',
                        });
                        timePoints.push({ time: cachedEvent.end.toString(), type: 'end' });
                    }
                });
                timePoints.sort((a, b) => a.time.localeCompare(b.time) || (a.type === 'end' ? -1 : 1));
                let currentOverlap = 0;
                timePoints.forEach((point) => {
                    if (point.type === 'start') {
                        currentOverlap++;
                        maxOverlappingEvents = Math.max(maxOverlappingEvents, currentOverlap);
                    }
                    else {
                        currentOverlap--;
                    }
                });
                currentEvent._maxConcurrentEvents = maxOverlappingEvents;
            }
            concurrentEventsCache = [];
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1);
        }
        if ((nextEvent &&
            event.end.epochNanoseconds >
                nextEvent.start.epochNanoseconds) ||
            concurrentEventsCache.some((e) => e.end.epochNanoseconds >
                event.start.epochNanoseconds) ||
            areBothEventsZeroMinutes) {
            concurrentEventsCache.push(event);
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1);
        }
        event._totalConcurrentEvents = 1;
        event._previousConcurrentEvents = 0;
        event._maxConcurrentEvents = 1;
    }
    return sortedEvents;
};

const getClickDateTime = (e, $app, dayStartDateTime) => {
    if (!(e.target instanceof HTMLElement))
        return;
    const DAY_GRID_CLASS_NAME = 'sx__time-grid-day';
    const dayGridElement = e.target.classList.contains(DAY_GRID_CLASS_NAME)
        ? e.target
        : e.target.closest('.' + DAY_GRID_CLASS_NAME);
    const clientY = e.clientY - dayGridElement.getBoundingClientRect().top;
    const clickPercentageOfDay = (clientY / dayGridElement.getBoundingClientRect().height) * 100;
    const clickTimePointsIntoDay = Math.round(($app.config.timePointsPerDay / 100) * clickPercentageOfDay);
    return addTimePointsToDateTime(dayStartDateTime, clickTimePointsIntoDay);
};

const getClassNameForWeekday = (weekday) => {
    switch (weekday) {
        case 1:
            return 'sx__monday';
        case 2:
            return 'sx__tuesday';
        case 3:
            return 'sx__wednesday';
        case 4:
            return 'sx__thursday';
        case 5:
            return 'sx__friday';
        case 6:
            return 'sx__saturday';
        case 7:
            return 'sx__sunday';
        default:
            throw new Error(`Invalid weekday ${weekday}`);
    }
};

function TimeGridBackgroundEvent({ backgroundEvent, date, }) {
    const $app = hooks.useContext(AppContext);
    let start = backgroundEvent.start;
    let end = backgroundEvent.end;
    const startIsAnotherDate = !isSameDay(start, Temporal.PlainDate.from(date));
    const endIsAnotherDate = !isSameDay(end, Temporal.PlainDate.from(date));
    // get YYYY-MM-DD from start and end and add 00:00 or 23:59, if the date is not the same as the date of the background event
    // or if it's a full-day event
    if (startIsAnotherDate || start instanceof Temporal.PlainDate) {
        start = Temporal.ZonedDateTime.from({
            year: Temporal.PlainDate.from(date).year,
            month: Temporal.PlainDate.from(date).month,
            day: Temporal.PlainDate.from(date).day,
            hour: 0,
            minute: 0,
            second: 0,
            timeZone: $app.config.timezone.value,
        });
    }
    if (endIsAnotherDate || end instanceof Temporal.PlainDate) {
        end = Temporal.ZonedDateTime.from({
            year: Temporal.PlainDate.from(date).year,
            month: Temporal.PlainDate.from(date).month,
            day: Temporal.PlainDate.from(date).day,
            hour: 23,
            minute: 59,
            second: 59,
            timeZone: $app.config.timezone.value,
        });
    }
    // adjust the start time according to the day boundaries
    // otherwise the background event `top` is calculated incorrectly
    const startHour = start.hour;
    const startMinute = start.minute;
    const formattedStart = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    const startTimePoints = timePointsFromString(formattedStart);
    if (startTimePoints < $app.config.dayBoundaries.value.start) {
        const updatedStart = timeStringFromTimePoints($app.config.dayBoundaries.value.start);
        const updatedStartHour = updatedStart.split(':')[0];
        const updatedStartMinute = updatedStart.split(':')[1];
        start = Temporal.ZonedDateTime.from({
            year: Temporal.PlainDate.from(date).year,
            month: Temporal.PlainDate.from(date).month,
            day: Temporal.PlainDate.from(date).day,
            hour: +updatedStartHour,
            minute: +updatedStartMinute,
            second: 0,
            timeZone: $app.config.timezone.value,
        });
    }
    // when start and end datetimes are equal, the rendering of the background event can be skipped completely.
    // otherwise, `height` is calculated as 5% (by `getEventHeight`) and this is misleading for a background event like "out-of-office" hours.
    // This comparison is safe also for full-day background events, because earlier in code we add time (00:00 - 23:59) to full-day events, making start and end no longer equal in full-day event case.
    if (start.toString() === end.toString()) {
        return null;
    }
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { class: "sx__time-grid-background-event", title: backgroundEvent.title, style: {
                ...backgroundEvent.style,
                position: 'absolute',
                zIndex: 0,
                top: `${getYCoordinateInTimeGrid(start, $app.config.dayBoundaries.value, $app.config.timePointsPerDay)}%`,
                height: `${getEventHeight(start, end, $app.config.dayBoundaries.value, $app.config.timePointsPerDay)}%`,
                width: '100%',
            } }) }));
}

function TimeGridDay({ calendarEvents, date, backgroundEvents, }) {
    /**
     * The time grid day needs to keep track of whether the mousedown event happened on a calendar event, in order to prevent
     * click events from firing when dragging an event.
     * */
    const [mouseDownOnChild, setMouseDownOnChild] = hooks.useState(false);
    const $app = hooks.useContext(AppContext);
    const timeStringFromDayBoundary = timeStringFromTimePoints($app.config.dayBoundaries.value.start);
    const timeStringFromDayBoundaryEnd = timeStringFromTimePoints($app.config.dayBoundaries.value.end);
    const dayStartDateTime = date.with({
        hour: +timeStringFromDayBoundary.split(':')[0],
        minute: +timeStringFromDayBoundary.split(':')[1],
    });
    const endHour = +timeStringFromDayBoundaryEnd.split(':')[0];
    const endWithAdjustedTime = date.with({
        hour: endHour === 24 ? 23 : endHour,
        minute: endHour === 24 ? 59 : +timeStringFromDayBoundaryEnd.split(':')[1],
        second: endHour === 24 ? 59 : 0,
    });
    const dayEndDateTime = $app.config.isHybridDay
        ? addDays(endWithAdjustedTime, 1)
        : endWithAdjustedTime;
    const dayBoundariesDateTime = {
        start: dayStartDateTime,
        end: dayEndDateTime,
    };
    const eventsWithConcurrency = hooks.useMemo(() => {
        const sortedEvents = calendarEvents.sort(sortEventsByStartAndEnd);
        return handleEventConcurrency(sortedEvents);
    }, [calendarEvents]);
    const handleOnClick = (e, callback) => {
        if (!callback || mouseDownOnChild)
            return;
        const clickDateTime = getClickDateTime(e, $app, dayStartDateTime);
        if (clickDateTime) {
            callback(clickDateTime, e);
        }
    };
    const handleMouseDown = (e) => {
        const callback = $app.config.callbacks.onMouseDownDateTime;
        if (!callback || mouseDownOnChild)
            return;
        const clickDateTime = getClickDateTime(e, $app, dayStartDateTime);
        if (clickDateTime) {
            callback(clickDateTime, e);
        }
    };
    const handlePointerUp = () => {
        const msWaitToEnsureThatClickEventWasDispatched = 10;
        setTimeout(() => {
            setMouseDownOnChild(false);
        }, msWaitToEnsureThatClickEventWasDispatched);
    };
    const baseClasses = [
        'sx__time-grid-day',
        getClassNameForWeekday(date.dayOfWeek),
    ];
    const classNames = signals.useComputed(() => {
        const newClassNames = [...baseClasses];
        if (isSameDay($app.datePickerState.selectedDate.value, date))
            newClassNames.push('is-selected');
        return newClassNames;
    });
    return (jsxRuntime.jsxs("div", { className: classNames.value.join(' '), "data-time-grid-date": toDateString$1(date), onClick: (e) => handleOnClick(e, $app.config.callbacks.onClickDateTime), onDblClick: (e) => handleOnClick(e, $app.config.callbacks.onDoubleClickDateTime), "aria-label": getLocalizedDate$1(date, $app.config.locale.value), onMouseLeave: () => setMouseDownOnChild(false), onMouseUp: handlePointerUp, onTouchEnd: handlePointerUp, onMouseDown: handleMouseDown, children: [backgroundEvents.map((event) => (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx(TimeGridBackgroundEvent, { backgroundEvent: event, date: date.toString() }) }))), eventsWithConcurrency.map((event) => (jsxRuntime.jsx(TimeGridEvent, { calendarEvent: event, dayBoundariesDateTime: dayBoundariesDateTime, setMouseDown: setMouseDownOnChild }, event.id)))] }));
}

const getTimeAxisHours = ({ start, end }, isHybridDay) => {
    const hours = [];
    let hour = Math.floor(start / 100);
    if (isHybridDay) {
        while (hour < 24) {
            hours.push(hour);
            hour += 1;
        }
        hour = 0;
    }
    const lastHour = end === 0 ? 24 : Math.ceil(end / 100);
    while (hour < lastHour) {
        hours.push(hour);
        hour += 1;
    }
    return hours;
};

function TimeAxis() {
    const $app = hooks.useContext(AppContext);
    const [gridSteps, setGridSteps] = hooks.useState([]);
    signals.useSignalEffect(() => {
        const hourSteps = getTimeAxisHours($app.config.dayBoundaries.value, $app.config.isHybridDay);
        const result = [];
        hourSteps.forEach((hour) => {
            if ($app.config.weekOptions.value.gridStep === 60) {
                result.push({ hour: hour, minute: 0 });
            }
            if ($app.config.weekOptions.value.gridStep === 30) {
                result.push({ hour: hour, minute: 0 }, { hour: hour, minute: 30 });
            }
            if ($app.config.weekOptions.value.gridStep === 15) {
                result.push({ hour: hour, minute: 0 }, { hour: hour, minute: 15 }, { hour: hour, minute: 30 }, { hour: hour, minute: 45 });
            }
        });
        setGridSteps(result);
        const pixelsPerGridStep = $app.config.weekOptions.value.gridHeight / result.length;
        // TODO v4: rename --sx-week-grid-hour-height to --sx-week-grid-grid-step-height
        document.documentElement.style.setProperty('--sx-week-grid-hour-height', `${pixelsPerGridStep}px`);
    });
    const formatter = new Intl.DateTimeFormat($app.config.locale.value, $app.config.weekOptions.value.timeAxisFormatOptions);
    const hourCustomComponentFn = $app.config._customComponentFns.weekGridHour;
    const hourCCIDs = hooks.useMemo(() => {
        if (!hourCustomComponentFn)
            return [];
        return gridSteps.map(() => `custom-week-grid-hour-${randomStringId()}`);
    }, [gridSteps]);
    hooks.useEffect(() => {
        if (hourCustomComponentFn && hourCCIDs.length) {
            gridSteps.forEach((gridStep, idx) => {
                const el = document.querySelector(`[data-ccid="${hourCCIDs[idx]}"]`);
                if (!(el instanceof HTMLElement)) {
                    return console.warn('Could not find element for custom component weekGridHour');
                }
                hourCustomComponentFn(el, { hour: gridStep.hour, gridStep });
            });
        }
    }, [gridSteps, hourCCIDs]);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { className: "sx__week-grid__time-axis", children: gridSteps.map((gridStep, index) => (jsxRuntime.jsxs("div", { className: "sx__week-grid__hour", children: [hourCustomComponentFn && hourCCIDs.length && (jsxRuntime.jsx("div", { "data-ccid": hourCCIDs[index] })), !hourCustomComponentFn && (jsxRuntime.jsx("span", { className: "sx__week-grid__hour-text", children: formatter.format(new Date(0, 0, 0, gridStep.hour, gridStep.minute)) }))] }))) }) }));
}

function DateAxis({ week }) {
    const $app = hooks.useContext(AppContext);
    const getClassNames = (date) => {
        const classNames = [
            'sx__week-grid__date',
            getClassNameForWeekday(date.dayOfWeek),
        ];
        if (isToday(date, $app.config.timezone.value)) {
            classNames.push('sx__week-grid__date--is-today');
        }
        return classNames.join(' ');
    };
    const weekGridDateCustomComponentFn = $app.config._customComponentFns.weekGridDate;
    const weekGridDateCCIDs = hooks.useState(() => Array.from({ length: 7 }, () => `custom-week-grid-date-${randomStringId()}`));
    hooks.useEffect(() => {
        if (weekGridDateCustomComponentFn) {
            week.forEach((date, idx) => {
                const el = document.querySelector(`[data-ccid="${weekGridDateCCIDs[0][idx]}"]`);
                if (!(el instanceof HTMLElement)) {
                    return console.warn('Could not find element for custom component weekGridDate');
                }
                weekGridDateCustomComponentFn(el, {
                    date: toDateString$1(date),
                });
            });
        }
    }, [week]);
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { className: "sx__week-grid__date-axis", children: week.map((date, idx) => (jsxRuntime.jsxs("div", { className: getClassNames(date), "data-date": toDateString$1(date), children: [weekGridDateCustomComponentFn && (jsxRuntime.jsx("div", { "data-ccid": weekGridDateCCIDs[0][idx] })), !weekGridDateCustomComponentFn && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { className: "sx__week-grid__day-name", children: getDayNameShort(date, $app.config.locale.value) }), jsxRuntime.jsx("div", { className: "sx__week-grid__date-number", children: date.day })] }))] }))) }) }));
}

const sortEventsForWeekView = (allCalendarEvents) => {
    const dateGridEvents = [];
    const timeGridEvents = [];
    for (const event of allCalendarEvents) {
        if (event._isSingleDayTimed || event._isSingleHybridDayTimed) {
            timeGridEvents.push(event);
            continue;
        }
        if (event._isSingleDayFullDay ||
            event._isMultiDayFullDay ||
            event._isMultiDayTimed) {
            dateGridEvents.push(event);
        }
    }
    return { timeGridEvents, dateGridEvents };
};

const createOneDay = (week, date) => {
    const dateString = toDateString$1(date);
    week[dateString] = {
        date: dateString,
        timeGridEvents: [],
        dateGridEvents: {},
        backgroundEvents: [],
    };
    return week;
};
const createWeek = ($app) => {
    if ($app.calendarState.view.value === InternalViewName.Day)
        return createOneDay({}, $app.calendarState.range.value.start);
    // Week mode
    return $app.timeUnitsImpl
        .getWeekFor($app.datePickerState.selectedDate.value)
        .slice(0, $app.config.weekOptions.value.nDays)
        .reduce(createOneDay, {});
};

const positionInTimeGrid = (timeGridEvents, week, $app) => {
    var _a;
    for (const event of timeGridEvents) {
        const range = $app.calendarState.range.value;
        if (event.start.epochNanoseconds >=
            range.start.epochNanoseconds &&
            event.end.epochNanoseconds <=
                range.end.epochNanoseconds) {
            let date = dateFromDateTime(event.start.toString());
            if ($app.config.isHybridDay) {
                const { year, month, date: day } = toIntegers(date);
                const previousDayStart = `${addDays(Temporal.PlainDate.from({ year, month: month + 1, day }), -1)} ${timeStringFromTimePoints($app.config.dayBoundaries.value.start)}`;
                const previousDayEnd = `${date} ${timeStringFromTimePoints($app.config.dayBoundaries.value.end)}`;
                const actualDayStart = `${date} ${timeStringFromTimePoints($app.config.dayBoundaries.value.start)}`;
                const eventStartZDT = event.start;
                const eventStartFloating = `${eventStartZDT.year}-${doubleDigit(eventStartZDT.month)}-${doubleDigit(eventStartZDT.day)} ${doubleDigit(eventStartZDT.hour)}:${doubleDigit(eventStartZDT.minute)}`;
                if (eventStartFloating > previousDayStart &&
                    eventStartFloating < previousDayEnd &&
                    eventStartFloating < actualDayStart) {
                    const { year, month, date: day } = toIntegers(date);
                    date = dateFromDateTime(addDays(Temporal.PlainDate.from({ year, month: month + 1, day }), -1).toString());
                }
            }
            (_a = week[date]) === null || _a === void 0 ? void 0 : _a.timeGridEvents.push(event);
        }
    }
    return week;
};

InternalViewName.Week;
const DEFAULT_DAY_BOUNDARIES = {
    start: 0,
    end: 2400,
};
const DEFAULT_WEEK_GRID_HEIGHT = 1600;
const DATE_GRID_BLOCKER = 'blocker';

/**
 * Create a table-like representation of the week, where each cell can hold a full-day event or multiple-day-timed event.
 * If an event lasts more than one day, it creates blockers in the grid for its subsequent days, so that events don't collide.
 * For example:
 *
 * |  Mo    | Tue    |   We   |  Thu   |  Fri   | Sat    | Sun    |
 * | e1     | blocker| blocker| blocker| blocker| blocker| blocker|
 * |        |  e2    | blocker|        |  e4    |        |        |
 * |        |        |  e3    |        |        |        |        |
 * */
const positionInDateGrid = (sortedDateGridEvents, week) => {
    const weekDates = Object.keys(week).sort();
    const firstDateOfWeek = weekDates[0];
    const lastDateOfWeek = weekDates[weekDates.length - 1];
    const occupiedLevels = new Set();
    for (const event of sortedDateGridEvents) {
        const eventOriginalStartDate = dateFromDateTime(event.start.toString());
        const eventOriginalEndDate = dateFromDateTime(event.end.toString());
        const isEventStartInWeek = !!week[eventOriginalStartDate];
        let isEventInWeek = isEventStartInWeek;
        if (!isEventStartInWeek &&
            eventOriginalStartDate < firstDateOfWeek &&
            eventOriginalEndDate >= firstDateOfWeek) {
            isEventInWeek = true;
        }
        if (!isEventInWeek)
            continue;
        const firstDateOfEvent = isEventStartInWeek
            ? eventOriginalStartDate
            : firstDateOfWeek;
        const lastDateOfEvent = eventOriginalEndDate <= lastDateOfWeek
            ? eventOriginalEndDate
            : lastDateOfWeek;
        const eventDays = Object.values(week).filter((day) => {
            return day.date >= firstDateOfEvent && day.date <= lastDateOfEvent;
        });
        let levelInWeekForEvent;
        let testLevel = 0;
        while (levelInWeekForEvent === undefined) {
            const isLevelFree = eventDays.every((day) => {
                return !day.dateGridEvents[testLevel];
            });
            if (isLevelFree) {
                levelInWeekForEvent = testLevel;
                occupiedLevels.add(testLevel);
            }
            else
                testLevel++;
        }
        for (const [eventDayIndex, eventDay] of eventDays.entries()) {
            if (eventDayIndex === 0) {
                event._nDaysInGrid = eventDays.length;
                eventDay.dateGridEvents[levelInWeekForEvent] = event;
            }
            else {
                eventDay.dateGridEvents[levelInWeekForEvent] = DATE_GRID_BLOCKER;
            }
        }
    }
    for (const level of Array.from(occupiedLevels)) {
        for (const [, day] of Object.entries(week)) {
            if (!day.dateGridEvents[level]) {
                day.dateGridEvents[level] = undefined;
            }
        }
    }
    return week;
};

const getWidthToSubtract = (hasOverflowLeft, hasOverflowRight, enableOverflowSubtraction) => {
    let widthToSubtract = 2; // 2px for all events, to leave some space between them
    const eventOverflowMargin = 10; // CORRELATION ID: 1
    if (hasOverflowLeft && enableOverflowSubtraction)
        widthToSubtract += eventOverflowMargin;
    if (hasOverflowRight && enableOverflowSubtraction)
        widthToSubtract += eventOverflowMargin;
    return widthToSubtract;
};
const getBorderRadius = (hasOverflowLeft, hasOverflowRight, forceZeroRule) => {
    return {
        borderBottomLeftRadius: hasOverflowLeft || forceZeroRule ? 0 : undefined,
        borderTopLeftRadius: hasOverflowLeft || forceZeroRule ? 0 : undefined,
        borderBottomRightRadius: hasOverflowRight || forceZeroRule ? 0 : undefined,
        borderTopRightRadius: hasOverflowRight || forceZeroRule ? 0 : undefined,
    };
};

function DateGridEvent({ calendarEvent, gridRow, isCopy, }) {
    var _a, _b, _c, _d;
    const $app = hooks.useContext(AppContext);
    const { eventCopy, updateCopy, createDragStartTimeout, setClickedEventIfNotDragging, setClickedEvent, } = useEventInteractions($app);
    const eventCSSVariables = {
        borderInlineStart: `4px solid var(--sx-color-${calendarEvent._color})`,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
    };
    const handleStartDrag = (uiEvent) => {
        var _a;
        if (!$app.config.plugins.dragAndDrop)
            return;
        if ((_a = calendarEvent._options) === null || _a === void 0 ? void 0 : _a.disableDND)
            return;
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        const newEventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(newEventCopy);
        $app.config.plugins.dragAndDrop.createDateGridDragHandler({
            eventCoordinates: getEventCoordinates(uiEvent),
            eventCopy: newEventCopy,
            updateCopy,
            $app,
        });
    };
    const rangeStartForComparison = calendarEvent.start instanceof Temporal.ZonedDateTime
        ? $app.calendarState.range.value.start.toString()
        : Temporal.PlainDate.from({
            year: $app.calendarState.range.value.start.year,
            month: $app.calendarState.range.value.start.month,
            day: $app.calendarState.range.value.start.day,
        }).toString();
    const rangeEndForComparison = calendarEvent.end instanceof Temporal.ZonedDateTime
        ? $app.calendarState.range.value.end.toString()
        : Temporal.PlainDate.from({
            year: $app.calendarState.range.value.end.year,
            month: $app.calendarState.range.value.end.month,
            day: $app.calendarState.range.value.end.day,
        }).toString();
    const startsBeforeWeek = calendarEvent.start.toString() < rangeStartForComparison;
    const endsAfterWeek = calendarEvent.end.toString() > rangeEndForComparison;
    const hasOverflowLeft = hooks.useMemo(() => {
        if ($app.config.direction === 'ltr') {
            return startsBeforeWeek;
        }
        return endsAfterWeek;
    }, [startsBeforeWeek, endsAfterWeek]);
    const hasOverflowRight = hooks.useMemo(() => {
        if ($app.config.direction === 'ltr') {
            return endsAfterWeek;
        }
        return startsBeforeWeek;
    }, [startsBeforeWeek, endsAfterWeek]);
    const overflowStyles = { backgroundColor: eventCSSVariables.backgroundColor };
    const customComponent = $app.config._customComponentFns.dateGridEvent;
    const customComponentId = hooks.useRef(customComponent
        ? 'custom-date-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined);
    if (isCopy && customComponentId.current)
        customComponentId.current += '-copy';
    hooks.useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId.current), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, customComponentId.current);
        };
    }, [calendarEvent, eventCopy]);
    const startResize = (mouseEvent) => {
        mouseEvent.stopPropagation();
        const eventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(eventCopy);
        $app.config.plugins.resize.createDateGridEventResizer(eventCopy, updateCopy, mouseEvent);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setClickedEvent(e, calendarEvent);
            invokeOnEventClickCallback($app, calendarEvent, e);
            nextTick(() => {
                focusModal($app);
            });
        }
    };
    const eventClasses = [
        'sx__event',
        'sx__date-grid-event',
        'sx__date-grid-cell',
    ];
    if (isCopy)
        eventClasses.push('sx__date-grid-event--copy');
    if (wasEventAddedInLastSecond(calendarEvent))
        eventClasses.push('is-event-new');
    if (hasOverflowLeft)
        eventClasses.push('sx__date-grid-event--overflow-left');
    if (hasOverflowRight)
        eventClasses.push('sx__date-grid-event--overflow-right');
    if ((_a = calendarEvent._options) === null || _a === void 0 ? void 0 : _a.additionalClasses)
        eventClasses.push(...calendarEvent._options.additionalClasses);
    const borderInlineStartNonCustom = startsBeforeWeek
        ? 'none'
        : eventCSSVariables.borderInlineStart;
    const hasCustomContent = (_b = calendarEvent._customContent) === null || _b === void 0 ? void 0 : _b.dateGrid;
    return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("div", { id: isCopy ? getTimeGridEventCopyElementId(calendarEvent.id) : undefined, tabIndex: 0, "aria-label": calendarEvent.title +
                    ' ' +
                    getTimeStamp(calendarEvent, $app.config.locale.value, $app.translate('to')), role: "button", "data-ccid": customComponentId.current, "data-event-id": calendarEvent.id, onMouseDown: (e) => createDragStartTimeout(handleStartDrag, e), onMouseUp: (e) => setClickedEventIfNotDragging(calendarEvent, e), onTouchStart: (e) => createDragStartTimeout(handleStartDrag, e), onTouchEnd: (e) => setClickedEventIfNotDragging(calendarEvent, e), onClick: (e) => invokeOnEventClickCallback($app, calendarEvent, e), onDblClick: (e) => invokeOnEventDoubleClickCallback($app, calendarEvent, e), onKeyDown: handleKeyDown, className: eventClasses.join(' '), style: {
                    width: `calc(${calendarEvent._nDaysInGrid * 100}% - ${getWidthToSubtract(hasOverflowLeft, hasOverflowRight, !customComponent)}px)`,
                    gridRow,
                    display: eventCopy ? 'none' : 'flex',
                    padding: customComponent ? '0px' : undefined,
                    borderInlineStart: customComponent
                        ? undefined
                        : borderInlineStartNonCustom,
                    color: customComponent ? undefined : eventCSSVariables.color,
                    backgroundColor: customComponent
                        ? undefined
                        : eventCSSVariables.backgroundColor,
                    ...getBorderRadius(hasOverflowLeft, hasOverflowRight, !!customComponent),
                }, children: [!customComponent && !hasCustomContent && (jsxRuntime.jsxs(preact.Fragment, { children: [hasOverflowLeft && (jsxRuntime.jsx("div", { className: 'sx__date-grid-event--left-overflow', style: overflowStyles })), jsxRuntime.jsxs("span", { className: "sx__date-grid-event-text", children: [calendarEvent.title, " \u00A0", calendarEvent.start instanceof Temporal.ZonedDateTime && (jsxRuntime.jsx("span", { className: "sx__date-grid-event-time", children: timeFn(calendarEvent.start, $app.config.locale.value) }))] }), hasOverflowRight && (jsxRuntime.jsx("div", { className: 'sx__date-grid-event--right-overflow', style: overflowStyles }))] })), hasCustomContent && (jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                            __html: ((_c = calendarEvent._customContent) === null || _c === void 0 ? void 0 : _c.dateGrid) || '',
                        } })), $app.config.plugins.resize &&
                        !((_d = calendarEvent._options) === null || _d === void 0 ? void 0 : _d.disableResize) &&
                        !endsAfterWeek && (jsxRuntime.jsx("div", { className: "sx__date-grid-event-resize-handle", onMouseDown: startResize, onTouchStart: startResize }))] }), eventCopy && (jsxRuntime.jsx(DateGridEvent, { calendarEvent: eventCopy, gridRow: gridRow, isCopy: true }))] }));
}

function DateGridDay({ calendarEvents, date, backgroundEvents, }) {
    const $app = hooks.useContext(AppContext);
    const dateStart = Temporal.ZonedDateTime.from({
        year: Temporal.PlainDate.from(date).year,
        month: Temporal.PlainDate.from(date).month,
        day: Temporal.PlainDate.from(date).day,
        hour: $app.config.dayBoundaries.value.start === 0
            ? 0
            : $app.config.dayBoundaries.value.start / 100,
        minute: 0,
        second: 0,
        timeZone: $app.config.timezone.value,
    });
    let dateEnd = Temporal.ZonedDateTime.from({
        year: Temporal.PlainDate.from(date).year,
        month: Temporal.PlainDate.from(date).month,
        day: Temporal.PlainDate.from(date).day,
        hour: $app.config.dayBoundaries.value.end === 2400
            ? 23
            : $app.config.dayBoundaries.value.end / 100,
        minute: $app.config.dayBoundaries.value.end === 2400 ? 59 : 0,
        second: $app.config.dayBoundaries.value.end === 2400 ? 59 : 0,
        timeZone: $app.config.timezone.value,
    });
    if ($app.config.isHybridDay) {
        dateEnd = dateEnd.add({ days: 1 });
    }
    const fullDayBackgroundEvent = backgroundEvents.find((event) => {
        const eventStartWithTime = event.start instanceof Temporal.PlainDate
            ? event.start.toZonedDateTime($app.config.timezone.value)
            : event.start;
        const eventEndWithTime = event.end instanceof Temporal.PlainDate
            ? event.end.toZonedDateTime($app.config.timezone.value).with({
                hour: 23,
                minute: 59,
                second: 59,
            })
            : event.end;
        return (eventStartWithTime.toString() <= dateStart.toString() &&
            eventEndWithTime.toString() >= dateEnd.toString());
    });
    const handleMouseDown = (e) => {
        const callback = $app.config.callbacks.onMouseDownDateGridDate;
        if (!callback)
            return;
        callback(Temporal.PlainDate.from(date), e);
    };
    return (jsxRuntime.jsxs("div", { className: "sx__date-grid-day", "data-date-grid-date": date, children: [fullDayBackgroundEvent && (jsxRuntime.jsx("div", { className: "sx__date-grid-background-event", title: fullDayBackgroundEvent.title, style: {
                    ...fullDayBackgroundEvent.style,
                } })), Object.values(calendarEvents).map((event, index) => {
                if (event === DATE_GRID_BLOCKER || !event)
                    return (jsxRuntime.jsx("div", { className: "sx__date-grid-cell", style: { gridRow: index + 1 }, onMouseDown: handleMouseDown }));
                return (jsxRuntime.jsx(DateGridEvent, { calendarEvent: event, gridRow: index + 1 }, event.start.toString() + event.end.toString() + index));
            }), jsxRuntime.jsx("div", { className: 'sx__spacer', onMouseDown: handleMouseDown })] }));
}

const filterByRange = (events, range, timezone) => {
    return events.filter((event) => {
        const rangeStart = range.start;
        const rangeEnd = range.end;
        let eventStart = event.start;
        let eventEnd = event.end;
        // Convert PlainDate to ZonedDateTime with start time 00:00:00
        if (eventStart instanceof Temporal.PlainDate) {
            eventStart = eventStart.toZonedDateTime(timezone);
        }
        // Convert PlainDate to ZonedDateTime with end time 23:59:59
        if (eventEnd instanceof Temporal.PlainDate) {
            eventEnd = eventEnd.toZonedDateTime(timezone).with({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 999,
                microsecond: 999,
                nanosecond: 999,
            });
        }
        const eventStartsInRange = eventStart.epochNanoseconds >= rangeStart.epochNanoseconds &&
            eventStart.epochNanoseconds <= rangeEnd.epochNanoseconds;
        const eventEndInRange = eventEnd.epochNanoseconds >= rangeStart.epochNanoseconds &&
            eventEnd.epochNanoseconds <= rangeEnd.epochNanoseconds;
        const eventStartBeforeAndEventEndAfterRange = eventStart.epochNanoseconds < rangeStart.epochNanoseconds &&
            eventEnd.epochNanoseconds > rangeEnd.epochNanoseconds;
        return (eventStartsInRange ||
            eventEndInRange ||
            eventStartBeforeAndEventEndAfterRange);
    });
};

const WeekWrapper = ({ $app, id }) => {
    document.documentElement.style.setProperty('--sx-week-grid-height', `${$app.config.weekOptions.value.gridHeight}px`);
    const week = signals.useComputed(() => {
        var _a, _b;
        const rangeStart = (_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start;
        const rangeEnd = (_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.end;
        if (!rangeStart || !rangeEnd)
            return {};
        let newWeek = createWeek($app);
        const filteredEvents = $app.calendarEvents.filterPredicate.value
            ? $app.calendarEvents.list.value.filter($app.calendarEvents.filterPredicate.value)
            : $app.calendarEvents.list.value;
        const { dateGridEvents, timeGridEvents } = sortEventsForWeekView(filteredEvents);
        newWeek = positionInDateGrid(dateGridEvents.sort(sortEventsByStartAndEnd), newWeek);
        Object.entries(newWeek).forEach(([date, day]) => {
            const plainDate = Temporal.PlainDate.from(date);
            const rangeStartDateTime = Temporal.ZonedDateTime.from({
                year: plainDate.year,
                month: plainDate.month,
                day: plainDate.day,
                hour: $app.config.dayBoundaries.value.start === 0
                    ? 0
                    : $app.config.dayBoundaries.value.start / 100,
                minute: 0,
                second: 0,
                timeZone: $app.config.timezone.value,
            });
            let rangeEndDateTime = Temporal.ZonedDateTime.from({
                year: plainDate.year,
                month: plainDate.month,
                day: plainDate.day,
                hour: $app.config.dayBoundaries.value.end === 2400
                    ? 23
                    : $app.config.dayBoundaries.value.end / 100,
                minute: $app.config.dayBoundaries.value.end === 2400 ? 59 : 0,
                second: $app.config.dayBoundaries.value.end === 2400 ? 59 : 0,
                timeZone: $app.config.timezone.value,
            });
            if ($app.config.isHybridDay) {
                rangeEndDateTime = rangeEndDateTime.add({ days: 1 });
            }
            day.backgroundEvents = filterByRange($app.calendarEvents.backgroundEvents.value, {
                start: rangeStartDateTime,
                end: rangeEndDateTime,
            }, $app.config.timezone.value);
        });
        newWeek = positionInTimeGrid(timeGridEvents, newWeek, $app);
        return newWeek;
    });
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx(AppContext.Provider, { value: $app, children: jsxRuntime.jsxs("div", { className: "sx__week-wrapper", id: id, children: [jsxRuntime.jsx("div", { className: "sx__week-header", children: jsxRuntime.jsxs("div", { className: "sx__week-header-content", children: [jsxRuntime.jsx(DateAxis, { week: Object.values(week.value).map((day) => {
                                        const plainDate = Temporal.PlainDate.from(day.date);
                                        return Temporal.ZonedDateTime.from({
                                            year: plainDate.year,
                                            month: plainDate.month,
                                            day: plainDate.day,
                                            timeZone: $app.config.timezone.value,
                                        });
                                    }) }), jsxRuntime.jsx("div", { className: "sx__date-grid", "aria-label": $app.translate('Full day- and multiple day events'), children: Object.values(week.value).map((day) => (jsxRuntime.jsx(DateGridDay, { date: day.date, calendarEvents: day.dateGridEvents, backgroundEvents: day.backgroundEvents }, day.date))) }), jsxRuntime.jsx("div", { className: "sx__week-header-border" })] }) }), jsxRuntime.jsxs("div", { className: "sx__week-grid", children: [jsxRuntime.jsx(TimeAxis, {}), Object.values(week.value).map((day) => {
                                const { year, month, date } = toIntegers(day.date);
                                const zonedDateTime = Temporal.ZonedDateTime.from({
                                    year,
                                    month: month + 1,
                                    day: date,
                                    timeZone: $app.config.timezone.value,
                                });
                                return (jsxRuntime.jsx(TimeGridDay, { calendarEvents: day.timeGridEvents, backgroundEvents: day.backgroundEvents, date: zonedDateTime }, day.date));
                            })] })] }) }) }));
};

const getRangeStartGivenDayBoundaries = (calendarConfig, date) => {
    const timeString = timeStringFromTimePoints(calendarConfig.dayBoundaries.value.start);
    return Temporal.ZonedDateTime.from({
        year: date.year,
        month: date.month,
        day: date.day,
        hour: +timeString.split(':')[0],
        minute: +timeString.split(':')[1],
        timeZone: calendarConfig.timezone.value,
    });
};
const getRangeEndGivenDayBoundaries = (calendarConfig, date) => {
    let dayEndTimeString = timeStringFromTimePoints(calendarConfig.dayBoundaries.value.end);
    let newRangeEndDate = date;
    if (calendarConfig.isHybridDay) {
        newRangeEndDate = addDays(newRangeEndDate, 1);
    }
    if (calendarConfig.dayBoundaries.value.end === 2400) {
        dayEndTimeString = '23:59';
    }
    return Temporal.ZonedDateTime.from({
        year: newRangeEndDate.year,
        month: newRangeEndDate.month,
        day: newRangeEndDate.day,
        hour: +dayEndTimeString.split(':')[0],
        minute: +dayEndTimeString.split(':')[1],
        timeZone: calendarConfig.timezone.value,
    });
};
const setRangeForWeek = (config) => {
    const weekForDate = config.timeUnitsImpl
        .getWeekFor(config.date)
        .slice(0, config.calendarConfig.weekOptions.value.nDays);
    return {
        start: getRangeStartGivenDayBoundaries(config.calendarConfig, weekForDate[0]),
        end: getRangeEndGivenDayBoundaries(config.calendarConfig, weekForDate[weekForDate.length - 1]),
    };
};
const setRangeForMonth = (config) => {
    const monthForDate = config.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(config.date.year, config.date.month);
    return {
        start: monthForDate[0][0],
        end: monthForDate[monthForDate.length - 1][monthForDate[monthForDate.length - 1].length - 1].with({ hour: 23, minute: 59 }),
    };
};
const setRangeForDay = (config) => {
    let date = config.date;
    if (date instanceof Temporal.PlainDate) {
        date = date.toZonedDateTime({
            timeZone: config.calendarConfig.timezone.value,
        });
    }
    return {
        start: getRangeStartGivenDayBoundaries(config.calendarConfig, date),
        end: getRangeEndGivenDayBoundaries(config.calendarConfig, date),
    };
};

const config$4 = {
    name: InternalViewName.Week,
    label: 'Week',
    Component: WeekWrapper,
    setDateRange: setRangeForWeek,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
    backwardForwardFn: addDays,
    backwardForwardUnits: 7,
};
const viewWeek = createPreactView(config$4);
const createViewWeek = () => createPreactView(config$4);

const DayWrapper = ({ $app, id }) => {
    return jsxRuntime.jsx(WeekWrapper, { "$app": $app, id: id });
};

const config$3 = {
    name: InternalViewName.Day,
    label: 'Day',
    setDateRange: setRangeForDay,
    hasWideScreenCompat: true,
    hasSmallScreenCompat: true,
    Component: DayWrapper,
    backwardForwardFn: addDays,
    backwardForwardUnits: 1,
};
const viewDay = createPreactView(config$3);
const createViewDay = () => createPreactView(config$3);

const getWeekNumber = (d, firstDayOfWeek) => {
    // Convert to ZonedDateTime if it's a PlainDate
    const zonedDate = d instanceof Temporal.PlainDate
        ? d.toZonedDateTime('UTC')
        : d.toInstant().toZonedDateTimeISO('UTC');
    // Adjust the date to the nearest desired first day of the week
    const dayOffset = (zonedDate.dayOfWeek - firstDayOfWeek + 7) % 7;
    const adjustedDate = zonedDate.subtract({ days: dayOffset - 3 });
    // Get first day of year adjusted for firstDayOfWeek
    const yearStart = Temporal.ZonedDateTime.from({
        year: adjustedDate.year,
        month: 1,
        day: 1,
        timeZone: 'UTC',
    });
    const yearStartOffset = (yearStart.dayOfWeek - firstDayOfWeek + 7) % 7;
    const adjustedYearStart = yearStart.subtract({ days: yearStartOffset });
    // Calculate full weeks from adjusted start of the year
    const daysDiff = adjustedDate.until(adjustedYearStart, {
        largestUnit: 'days',
    }).days;
    const weekNo = Math.ceil((Math.abs(daysDiff) + 1) / 7);
    // Handle edge case for the last days of the year falling into week 53
    const nextYearStart = Temporal.ZonedDateTime.from({
        year: adjustedDate.year + 1,
        month: 1,
        day: 1,
        timeZone: 'UTC',
    });
    const nextYearStartOffset = (nextYearStart.dayOfWeek - firstDayOfWeek + 7) % 7;
    const adjustedNextYearStart = nextYearStart.subtract({
        days: nextYearStartOffset,
    });
    if (Temporal.ZonedDateTime.compare(adjustedDate, adjustedNextYearStart) >= 0) {
        return 1;
    }
    return weekNo;
};

function WeekNumber() {
    const $app = hooks.useContext(AppContext);
    return (jsxRuntime.jsx("div", { className: "sx__calendar-header__week-number", children: $app.translate('CW', {
            week: getWeekNumber($app.datePickerState.selectedDate.value, $app.config.firstDayOfWeek.value),
        }) }));
}

function CalendarHeader() {
    const $app = hooks.useContext(AppContext);
    const datePickerAppSingleton = new DatePickerAppSingletonBuilder()
        .withDatePickerState($app.datePickerState)
        .withConfig($app.datePickerConfig)
        .withTranslate($app.translate)
        .withTimeUnitsImpl($app.timeUnitsImpl)
        .build();
    const headerContent = $app.config._customComponentFns.headerContent;
    const headerContentId = hooks.useState(headerContent ? randomStringId() : undefined)[0];
    const headerContentLeftPrepend = $app.config._customComponentFns.headerContentLeftPrepend;
    const headerContentLeftPrependId = hooks.useState(headerContentLeftPrepend ? randomStringId() : undefined)[0];
    const headerContentLeftAppend = $app.config._customComponentFns.headerContentLeftAppend;
    const headerContentLeftAppendId = hooks.useState(headerContentLeftAppend ? randomStringId() : undefined)[0];
    const headerContentRightPrepend = $app.config._customComponentFns.headerContentRightPrepend;
    const headerContentRightPrependId = hooks.useState(headerContentRightPrepend ? randomStringId() : undefined)[0];
    const headerContentRightAppend = $app.config._customComponentFns.headerContentRightAppend;
    const headerContentRightAppendId = hooks.useState(headerContentRightAppend ? randomStringId() : undefined)[0];
    hooks.useEffect(() => {
        if (headerContent) {
            headerContent(getElementByCCID(headerContentId), { $app });
        }
        if (headerContentLeftPrepend && headerContentLeftPrependId) {
            headerContentLeftPrepend(getElementByCCID(headerContentLeftPrependId), {
                $app,
            });
        }
        if (headerContentLeftAppend) {
            headerContentLeftAppend(getElementByCCID(headerContentLeftAppendId), {
                $app,
            });
        }
        if (headerContentRightPrepend) {
            headerContentRightPrepend(getElementByCCID(headerContentRightPrependId), {
                $app,
            });
        }
        if (headerContentRightAppend) {
            headerContentRightAppend(getElementByCCID(headerContentRightAppendId), {
                $app,
            });
        }
    }, [
        $app.datePickerState.selectedDate.value,
        $app.calendarState.range.value,
        $app.calendarState.isDark.value,
        $app.calendarState.isCalendarSmall.value,
    ]);
    const keyForRerenderingOnLocaleChange = $app.config.locale.value;
    const isDayOrWeekView = hooks.useMemo(() => {
        return [viewWeek.name, viewDay.name].includes($app.calendarState.view.value);
    }, [$app.calendarState.view.value]);
    return (jsxRuntime.jsx("header", { className: 'sx__calendar-header', "data-ccid": headerContentId, children: !headerContent && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("div", { className: 'sx__calendar-header-content', children: [headerContentLeftPrependId && (jsxRuntime.jsx("div", { "data-ccid": headerContentLeftPrependId })), jsxRuntime.jsx(TodayButton, {}), jsxRuntime.jsx(ForwardBackwardNavigation, {}), jsxRuntime.jsx(RangeHeading, {}, $app.config.locale.value), $app.config.showWeekNumbers.value && isDayOrWeekView && (jsxRuntime.jsx(WeekNumber, {})), headerContentLeftAppendId && (jsxRuntime.jsx("div", { "data-ccid": headerContentLeftAppendId }))] }), jsxRuntime.jsxs("div", { className: 'sx__calendar-header-content', children: [headerContentRightPrependId && (jsxRuntime.jsx("div", { "data-ccid": headerContentRightPrependId })), $app.config.plugins.timezoneSelect &&
                            $app.config.plugins.timezoneSelect.isEnabled.value && (jsxRuntime.jsx($app.config.plugins.timezoneSelect.ComponentFn, { "$app": $app })), $app.config.views.value.length > 1 && (jsxRuntime.jsx(ViewSelection, {}, keyForRerenderingOnLocaleChange + '-view-selection')), jsxRuntime.jsx(AppWrapper, { "$app": datePickerAppSingleton }), headerContentRightAppendId && (jsxRuntime.jsx("div", { "data-ccid": headerContentRightAppendId }))] })] })) }));
}

const setWrapperElement = ($app, calendarId) => {
    $app.elements.calendarWrapper = document.getElementById(calendarId);
};

const setScreenSizeCompatibleView = ($app, isSmall) => {
    const currentView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
    if (isSmall) {
        if (currentView.hasSmallScreenCompat)
            return;
        const smallScreenCompatibleView = $app.config.views.value.find((view) => view.hasSmallScreenCompat);
        if (smallScreenCompatibleView) {
            $app.calendarState.setView(smallScreenCompatibleView.name, $app.datePickerState.selectedDate.value);
        }
    }
    else {
        if (currentView.hasWideScreenCompat)
            return;
        const wideScreenCompatibleView = $app.config.views.value.find((view) => view.hasWideScreenCompat);
        if (wideScreenCompatibleView) {
            $app.calendarState.setView(wideScreenCompatibleView.name, $app.datePickerState.selectedDate.value);
        }
    }
};
const handleWindowResize = ($app) => {
    const documentRoot = document.documentElement;
    const calendarRoot = $app.elements.calendarWrapper;
    const documentFontSize = +window
        .getComputedStyle(documentRoot)
        .fontSize.split('p')[0];
    const breakPointFor1RemEquals16px = 700;
    const multiplier = 16 / documentFontSize;
    const smallCalendarBreakpoint = breakPointFor1RemEquals16px / multiplier; // For 16px root font-size, break point is at 43.75rem
    if (!calendarRoot)
        return;
    const isSmall = $app.config.callbacks.isCalendarSmall
        ? $app.config.callbacks.isCalendarSmall($app)
        : calendarRoot.clientWidth < smallCalendarBreakpoint;
    const didIsSmallScreenChange = isSmall !== $app.calendarState.isCalendarSmall.value;
    if (!didIsSmallScreenChange)
        return;
    $app.calendarState.isCalendarSmall.value = isSmall;
    setScreenSizeCompatibleView($app, isSmall);
};

const getClassForView = ($app) => {
    return `is-${$app.calendarState.view.value}-view`;
};
function useWrapperClasses($app) {
    const calendarWrapperClass = 'sx__calendar-wrapper';
    const [wrapperClasses, setWrapperClasses] = hooks.useState([
        calendarWrapperClass,
        getClassForView($app),
    ]);
    signals.useSignalEffect(() => {
        const classes = [calendarWrapperClass];
        if ($app.calendarState.isCalendarSmall.value)
            classes.push('sx__is-calendar-small');
        if ($app.calendarState.isDark.value)
            classes.push('is-dark');
        if ($app.config.theme === 'shadcn')
            classes.push('is-shadcn');
        classes.push(getClassForView($app));
        setWrapperClasses(classes);
    });
    return wrapperClasses;
}

const externalEventToInternal = (event, config) => {
    const { id, start, end, title, description, location, people, _options, ...foreignProperties } = event;
    return new CalendarEventBuilder(config, id, start, end)
        .withTitle(title)
        .withDescription(description)
        .withLocation(location)
        .withPeople(people)
        .withCalendarId(event.calendarId)
        .withOptions(_options)
        .withForeignProperties(foreignProperties)
        .withCustomContent(event._customContent)
        .build();
};

const rangeToString = (range) => {
    if (!range) {
        return null;
    }
    return `${range.start.toString()}-${range.end.toString()}`;
};

function useFetchEvents($app) {
    const hasCalledFetchEventsOnRenderRef = hooks.useRef(false);
    const initialRangeRef = hooks.useRef(rangeToString($app.calendarState.range.value));
    const fetchAndSetEvents = async () => {
        var _a;
        if (!((_a = $app.config.callbacks) === null || _a === void 0 ? void 0 : _a.fetchEvents) ||
            !$app.calendarState.range.value) {
            return;
        }
        const events = await $app.config.callbacks.fetchEvents($app.calendarState.range.value);
        $app.calendarEvents.list.value = events.map((event) => externalEventToInternal(event, $app.config));
    };
    hooks.useEffect(() => {
        var _a;
        if (((_a = $app.config.callbacks) === null || _a === void 0 ? void 0 : _a.fetchEvents) &&
            $app.calendarState.range.value &&
            !hasCalledFetchEventsOnRenderRef.current) {
            hasCalledFetchEventsOnRenderRef.current = true;
            void fetchAndSetEvents();
        }
    }, []);
    // Call fetchEvents every time the range changes (same as onRangeUpdate)
    // Skip on initial render since we already call it in useEffect
    signals.useSignalEffect(() => {
        var _a;
        if (!((_a = $app.config.callbacks) === null || _a === void 0 ? void 0 : _a.fetchEvents) ||
            !$app.calendarState.range.value ||
            !hasCalledFetchEventsOnRenderRef.current) {
            return;
        }
        // Skip if this is the initial range (already handled in useEffect)
        const currentRangeString = rangeToString($app.calendarState.range.value);
        if (currentRangeString === initialRangeRef.current) {
            return;
        }
        void fetchAndSetEvents();
    });
}

const initPlugins = ($app) => {
    Object.values($app.config.plugins).forEach((plugin) => {
        if (plugin === null || plugin === void 0 ? void 0 : plugin.onRender) {
            plugin.onRender($app);
        }
    });
};
const destroyPlugins = ($app) => {
    Object.values($app.config.plugins).forEach((plugin) => {
        if (plugin === null || plugin === void 0 ? void 0 : plugin.destroy)
            plugin.destroy();
    });
};
const invokePluginsBeforeRender = ($app) => {
    Object.values($app.config.plugins).forEach((plugin) => {
        if (plugin === null || plugin === void 0 ? void 0 : plugin.beforeRender)
            plugin.beforeRender($app);
    });
};

function CalendarWrapper({ $app }) {
    var _a;
    const calendarId = randomStringId();
    const viewContainerId = randomStringId();
    useFetchEvents($app);
    hooks.useEffect(() => {
        var _a;
        setWrapperElement($app, calendarId);
        initPlugins($app);
        if ((_a = $app.config.callbacks) === null || _a === void 0 ? void 0 : _a.onRender) {
            $app.config.callbacks.onRender($app);
        }
        return () => destroyPlugins($app);
    }, []);
    const onResize = () => {
        handleWindowResize($app);
    };
    hooks.useEffect(() => {
        if ($app.config.isResponsive) {
            onResize();
            window.addEventListener('resize', onResize);
            return () => window.removeEventListener('resize', onResize);
        }
    }, []);
    const wrapperClasses = useWrapperClasses($app);
    const [currentView, setCurrentView] = hooks.useState();
    signals.useSignalEffect(() => {
        const newView = $app.config.views.value.find((view) => view.name === $app.calendarState.view.value);
        const viewElement = document.getElementById(viewContainerId);
        if (!newView || !viewElement || newView.name === (currentView === null || currentView === void 0 ? void 0 : currentView.name))
            return;
        if (currentView)
            currentView.destroy();
        setCurrentView(newView);
        newView.render(viewElement, $app);
    });
    const [previousRangeStart, setPreviousRangeStart] = hooks.useState('');
    const [transitionClass, setTransitionClass] = hooks.useState('');
    signals.useSignalEffect(() => {
        var _a, _b;
        // There is no reason to transition sideways, because the list view is expanded vertically, unlike the other views
        if ($app.calendarState.view.value === InternalViewName.List)
            return;
        const newRangeStartIsLaterThanPrevious = (((_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start.toString()) || '') >
            previousRangeStart;
        // Use requestAnimationFrame to ensure smooth animation timing
        requestAnimationFrame(() => {
            setTransitionClass(newRangeStartIsLaterThanPrevious ? 'sx__slide-left' : 'sx__slide-right');
            setTimeout(() => {
                setTransitionClass('');
            }, 300); // CORRELATION ID: 3
        });
        setPreviousRangeStart(((_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.start.toString()) || '');
    });
    signals.useSignalEffect(() => {
        $app.datePickerConfig.locale.value = $app.config.locale.value;
    });
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { className: wrapperClasses.join(' '), id: calendarId, children: jsxRuntime.jsx("div", { className: 'sx__calendar', children: jsxRuntime.jsxs(AppContext.Provider, { value: $app, children: [jsxRuntime.jsx(CalendarHeader, {}), jsxRuntime.jsx("div", { className: ['sx__view-container', transitionClass].join(' '), id: viewContainerId }), $app.config.plugins.eventModal &&
                            $app.config.plugins.eventModal.calendarEvent.value && (jsxRuntime.jsx($app.config.plugins.eventModal.ComponentFn, { "$app": $app }, (_a = $app.config.plugins.eventModal.calendarEvent.value) === null || _a === void 0 ? void 0 : _a.id))] }) }) }) }));
}

class EventsFacadeImpl {
    constructor($app) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
    }
    set(events) {
        this.$app.calendarEvents.list.value = events.map((event) => externalEventToInternal(event, this.$app.config));
    }
    add(event) {
        const newEvent = externalEventToInternal(event, this.$app.config);
        newEvent._createdAt = new Date();
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.push(newEvent);
        this.$app.calendarEvents.list.value = copiedEvents;
    }
    get(id) {
        var _a;
        return (_a = this.$app.calendarEvents.list.value
            .find((event) => event.id === id)) === null || _a === void 0 ? void 0 : _a._getExternalEvent();
    }
    getAll() {
        return this.$app.calendarEvents.list.value.map((event) => event._getExternalEvent());
    }
    remove(id) {
        const index = this.$app.calendarEvents.list.value.findIndex((event) => event.id === id);
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.splice(index, 1);
        this.$app.calendarEvents.list.value = copiedEvents;
    }
    update(event) {
        const index = this.$app.calendarEvents.list.value.findIndex((e) => e.id === event.id);
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.splice(index, 1, externalEventToInternal(event, this.$app.config));
        this.$app.calendarEvents.list.value = copiedEvents;
    }
}

class CalendarApp {
    constructor($app) {
        var _a;
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarContainerEl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.events = new EventsFacadeImpl(this.$app);
        invokePluginsBeforeRender(this.$app);
        Object.values(this.$app.config.plugins).forEach((plugin) => {
            if (!(plugin === null || plugin === void 0 ? void 0 : plugin.name))
                return;
            // "hack" for enabling accessing plugins via calendarApp[pluginName]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this[plugin.name] = plugin;
        });
        if ((_a = $app.config.callbacks) === null || _a === void 0 ? void 0 : _a.beforeRender) {
            $app.config.callbacks.beforeRender($app);
        }
    }
    render(el) {
        this.calendarContainerEl = el;
        preact.render(preact.createElement(CalendarWrapper, { $app: this.$app }), el);
    }
    destroy() {
        Object.values(this.$app.config.plugins || {}).forEach((plugin) => {
            if (!plugin || !plugin.destroy)
                return;
            plugin.destroy();
        });
        if (this.calendarContainerEl) {
            preact.render(null, this.calendarContainerEl);
        }
    }
    setTheme(theme) {
        this.$app.calendarState.isDark.value = theme === 'dark';
    }
    getTheme() {
        return this.$app.calendarState.isDark.value ? 'dark' : 'light';
    }
    /**
     * @internal
     * Purpose: To be consumed by framework adapters for custom component rendering.
     * */
    _setCustomComponentFn(fnId, fn) {
        this.$app.config._customComponentFns[fnId] = fn;
    }
    _setDestroyCustomComponentInstance(cb) {
        this.$app.config._destroyCustomComponentInstance = cb;
    }
}

class CalendarAppSingletonImpl {
    constructor(config, timeUnitsImpl, calendarState, datePickerState, translate, datePickerConfig, calendarEvents, elements = { calendarWrapper: undefined }) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: timeUnitsImpl
        });
        Object.defineProperty(this, "calendarState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarState
        });
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerState
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: translate
        });
        Object.defineProperty(this, "datePickerConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerConfig
        });
        Object.defineProperty(this, "calendarEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarEvents
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: elements
        });
    }
}

class CalendarAppSingletonBuilder {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datePickerConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new CalendarAppSingletonImpl(this.config, this.timeUnitsImpl, this.calendarState, this.datePickerState, this.translate, this.datePickerConfig, this.calendarEvents);
    }
    withConfig(config) {
        this.config = config;
        return this;
    }
    withTimeUnitsImpl(timeUnitsImpl) {
        this.timeUnitsImpl = timeUnitsImpl;
        return this;
    }
    withDatePickerState(datePickerState) {
        this.datePickerState = datePickerState;
        return this;
    }
    withCalendarState(calendarState) {
        this.calendarState = calendarState;
        return this;
    }
    withTranslate(translate) {
        this.translate = translate;
        return this;
    }
    withDatePickerConfig(datePickerConfig) {
        this.datePickerConfig = datePickerConfig;
        return this;
    }
    withCalendarEvents(calendarEvents) {
        this.calendarEvents = calendarEvents;
        return this;
    }
}

var DateFormatDelimiter;
(function (DateFormatDelimiter) {
    DateFormatDelimiter["SLASH"] = "/";
    DateFormatDelimiter["DASH"] = "-";
    DateFormatDelimiter["PERIOD"] = ".";
})(DateFormatDelimiter || (DateFormatDelimiter = {}));
var DateFormatOrder;
(function (DateFormatOrder) {
    DateFormatOrder["DMY"] = "DMY";
    DateFormatOrder["MDY"] = "MDY";
    DateFormatOrder["YMD"] = "YMD";
})(DateFormatOrder || (DateFormatOrder = {}));

const formatRules = {
    slashMDY: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.MDY,
    },
    slashDMY: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.DMY,
    },
    slashYMD: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.YMD,
    },
    periodDMY: {
        delimiter: DateFormatDelimiter.PERIOD,
        order: DateFormatOrder.DMY,
    },
    dashYMD: {
        delimiter: DateFormatDelimiter.DASH,
        order: DateFormatOrder.YMD,
    },
    dashDMY: {
        delimiter: DateFormatDelimiter.DASH,
        order: DateFormatOrder.DMY,
    },
};
const dateFormatLocalizedRules = new Map([
    ['ca-ES', formatRules.slashDMY],
    ['cs-CZ', formatRules.periodDMY],
    ['da-DK', formatRules.periodDMY],
    ['de-DE', formatRules.periodDMY],
    ['en-GB', formatRules.slashDMY],
    ['en-US', formatRules.slashMDY],
    ['es-ES', formatRules.slashDMY],
    ['et-EE', formatRules.periodDMY],
    ['fi-FI', formatRules.periodDMY],
    ['fr-FR', formatRules.slashDMY],
    ['fr-CH', formatRules.periodDMY],
    ['hr-HR', formatRules.periodDMY],
    ['id-ID', formatRules.slashDMY],
    ['it-IT', formatRules.slashDMY],
    ['ja-JP', formatRules.slashYMD],
    ['ko-KR', formatRules.slashYMD],
    ['ky-KG', formatRules.slashDMY],
    ['lt-LT', formatRules.dashYMD],
    ['mk-MK', formatRules.periodDMY],
    ['nl-NL', formatRules.dashDMY],
    ['pl-PL', formatRules.periodDMY],
    ['pt-BR', formatRules.slashDMY],
    ['ro-RO', formatRules.periodDMY],
    ['ru-RU', formatRules.periodDMY],
    ['sk-SK', formatRules.periodDMY],
    ['sl-SI', formatRules.periodDMY],
    ['sr-Latn-RS', formatRules.periodDMY],
    ['sr-RS', formatRules.periodDMY],
    ['sv-SE', formatRules.dashYMD],
    ['tr-TR', formatRules.periodDMY],
    ['uk-UA', formatRules.periodDMY],
    ['zh-CN', formatRules.slashYMD],
    ['zh-TW', formatRules.slashYMD],
]);

class LocaleNotSupportedError extends Error {
    constructor(locale) {
        super(`Locale not supported: ${locale}`);
    }
}

class InvalidDateFormatError extends Error {
    constructor(dateFormat, locale) {
        super(`Invalid date format: ${dateFormat} for locale: ${locale}`);
    }
}

const _getMatchesOrThrow = (format, matcher, locale) => {
    const matches = format.match(matcher);
    if (!matches)
        throw new InvalidDateFormatError(format, locale);
    return matches;
};
const toDateString = (format, locale) => {
    const internationalFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (internationalFormat.test(format))
        return format; // allow international format regardless of locale
    const localeDateFormatRule = dateFormatLocalizedRules.get(locale);
    if (!localeDateFormatRule)
        throw new LocaleNotSupportedError(locale);
    const { order, delimiter } = localeDateFormatRule;
    const pattern224Slashed = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const pattern224Dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const pattern442Slashed = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    if (order === DateFormatOrder.DMY && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern224Slashed, locale);
        const [, day, month, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.MDY && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern224Slashed, locale);
        const [, month, day, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.YMD && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern442Slashed, locale);
        const [, year, month, day] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.DMY && delimiter === DateFormatDelimiter.PERIOD) {
        const matches = _getMatchesOrThrow(format, pattern224Dotted, locale);
        const [, day, month, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    throw new InvalidDateFormatError(format, locale);
};

const getLocalizedDate = (date, locale) => {
    return toLocalizedDateString(date, locale);
};
const createDatePickerState = (config, selectedDateParam) => {
    var _a;
    const initialSelectedDate = selectedDateParam instanceof Temporal.PlainDate
        ? selectedDateParam
        : Temporal.Now.plainDateISO();
    const isOpen = signals.signal(false);
    const isDisabled = signals.signal(config.disabled || false);
    const datePickerView = signals.signal(DatePickerView.MONTH_DAYS);
    const selectedDate = signals.signal(initialSelectedDate);
    const datePickerDate = signals.signal(initialSelectedDate);
    const isDark = signals.signal(((_a = config.style) === null || _a === void 0 ? void 0 : _a.dark) || false);
    const inputDisplayedValue = signals.signal(toLocalizedDateString(initialSelectedDate, config.locale.value));
    const lastValidDisplayedValue = signals.signal(inputDisplayedValue.value);
    const handleInput = (newInputValue) => {
        try {
            const newValue = toDateString(newInputValue, config.locale.value);
            if (newValue < config.min.toString() ||
                newValue > config.max.toString()) {
                inputDisplayedValue.value = lastValidDisplayedValue.value;
                return;
            }
            const { year, month, date: day } = toIntegers(newValue);
            const newPlainDate = Temporal.PlainDate.from({
                year,
                month: month + 1,
                day,
            });
            selectedDate.value = newPlainDate;
            datePickerDate.value = newPlainDate;
            lastValidDisplayedValue.value = inputDisplayedValue.value;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (_e) {
            // Nothing to do here. We don't want to log errors when users are typing invalid formats
        }
    };
    signals.effect(() => {
        inputDisplayedValue.value = getLocalizedDate(selectedDate.value, config.locale.value);
    });
    let wasInitialized = false;
    const handleOnChange = (selectedDate) => {
        if (!wasInitialized)
            return (wasInitialized = true);
        config.listeners.onChange(selectedDate);
    };
    signals.effect(() => {
        var _a;
        if ((_a = config.listeners) === null || _a === void 0 ? void 0 : _a.onChange)
            handleOnChange(selectedDate.value);
    });
    return {
        inputWrapperElement: signals.signal(undefined),
        isOpen,
        isDisabled,
        datePickerView,
        selectedDate,
        datePickerDate,
        inputDisplayedValue,
        handleInput,
        isDark,
        open: () => (isOpen.value = true),
        close: () => (isOpen.value = false),
        toggle: () => (isOpen.value = !isOpen.value),
        setView: (view) => (datePickerView.value = view),
    };
};

const datePickerArEG = {
    Date: 'التاريخ',
    'MM/DD/YYYY': 'DD/MM/YYYY', // Keep format unchanged unless you want to localize it
    'Next month': 'الشهر القادم',
    'Previous month': 'الشهر السابق',
    'Choose Date': 'اختر التاريخ',
};

const timePickerArEG = {
    Time: 'الوقت',
    AM: 'ص',
    PM: 'م',
    Cancel: 'إلغاء',
    OK: 'موافق',
    'Select time': 'اختر الوقت',
};

const calendarArEG = {
    Today: 'اليوم',
    Month: 'الشهر',
    Week: 'الأسبوع',
    Day: 'اليوم',
    List: 'القائمة',
    'Select View': 'اختر العرض',
    '+ {{n}} events': '+ {{n}} الأحداث',
    '+ 1 event': '+ 1 حدث',
    'No events': 'لا توجد أحداث',
    'Next period': 'الفترة التالية',
    'Previous period': 'الفترة السابقة',
    to: 'إلى', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'أحداث ليوم كامل أو لعدة أيام',
    'Link to {{n}} more events on {{date}}': 'رابط إلى {{n}} أحداث أخرى في {{date}}',
    'Link to 1 more event on {{date}}': 'رابط إلى حدث آخر في {{date}}',
    CW: 'الأسبوع {{week}}',
    View: 'عرض',
};

const arEG = {
    ...calendarArEG,
    ...datePickerArEG,
    ...timePickerArEG,
};

const datePickerDeDE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'TT.MM.JJJJ',
    'Next month': 'Nächster Monat',
    'Previous month': 'Vorheriger Monat',
    'Choose Date': 'Datum auswählen',
};

const calendarDeDE = {
    Today: 'Heute',
    Month: 'Monat',
    Week: 'Woche',
    Day: 'Tag',
    List: 'Liste',
    'Select View': 'Ansicht auswählen',
    View: 'Ansicht',
    '+ {{n}} events': '+ {{n}} Ereignisse',
    '+ 1 event': '+ 1 Ereignis',
    'No events': 'Keine Ereignisse',
    'Next period': 'Nächster Zeitraum',
    'Previous period': 'Vorheriger Zeitraum',
    to: 'bis', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Ganztägige und mehrtägige Termine',
    'Link to {{n}} more events on {{date}}': 'Link zu {{n}} weiteren Terminen am {{date}}',
    'Link to 1 more event on {{date}}': 'Link zu 1 weiterem Termin am {{date}}',
    CW: 'KW {{week}}',
};

const timePickerDeDE = {
    Time: 'Uhrzeit',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Abbrechen',
    OK: 'OK',
    'Select time': 'Uhrzeit auswählen',
};

const deDE = {
    ...datePickerDeDE,
    ...calendarDeDE,
    ...timePickerDeDE,
};

const datePickerEnUS = {
    Date: 'Date',
    'MM/DD/YYYY': 'MM/DD/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
};

const calendarEnUS = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    List: 'List',
    'Select View': 'Select View',
    View: 'View',
    '+ {{n}} events': '+ {{n}} events',
    '+ 1 event': '+ 1 event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
    'Link to {{n}} more events on {{date}}': 'Link to {{n}} more events on {{date}}',
    'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
    CW: 'Week {{week}}',
};

const timePickerEnUS = {
    Time: 'Time',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Cancel',
    OK: 'OK',
    'Select time': 'Select time',
};

const enUS = {
    ...datePickerEnUS,
    ...calendarEnUS,
    ...timePickerEnUS,
};

const datePickerItIT = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mese successivo',
    'Previous month': 'Mese precedente',
    'Choose Date': 'Scegli la data',
};

const calendarItIT = {
    Today: 'Oggi',
    Month: 'Mese',
    Week: 'Settimana',
    Day: 'Giorno',
    List: 'Lista',
    'Select View': 'Seleziona la vista',
    View: 'Vista',
    '+ {{n}} events': '+ {{n}} eventi',
    '+ 1 event': '+ 1 evento',
    'No events': 'Nessun evento',
    'Next period': 'Periodo successivo',
    'Previous period': 'Periodo precedente',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Eventi della giornata e plurigiornalieri',
    'Link to {{n}} more events on {{date}}': 'Link a {{n}} eventi in più il {{date}}',
    'Link to 1 more event on {{date}}': 'Link a 1 evento in più il {{date}}',
    CW: 'Settimana {{week}}',
};

const timePickerItIT = {
    Time: 'Ora',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Annulla',
    OK: 'OK',
    'Select time': 'Seleziona ora',
};

const itIT = {
    ...datePickerItIT,
    ...calendarItIT,
    ...timePickerItIT,
};

const datePickerEnGB = {
    Date: 'Date',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
};

const calendarEnGB = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    List: 'List',
    'Select View': 'Select View',
    '+ {{n}} events': '+ {{n}} events',
    '+ 1 event': '+ 1 event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
    'Link to {{n}} more events on {{date}}': 'Link to {{n}} more events on {{date}}',
    'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
    CW: 'Week {{week}}',
    View: 'View',
};

const timePickerEnGB = {
    Time: 'Time',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Cancel',
    OK: 'OK',
    'Select time': 'Select time',
};

const enGB = {
    ...datePickerEnGB,
    ...calendarEnGB,
    ...timePickerEnGB,
};

const datePickerSvSE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Nästa månad',
    'Previous month': 'Föregående månad',
    'Choose Date': 'Välj datum',
};

const calendarSvSE = {
    Today: 'Idag',
    Month: 'Månad',
    Week: 'Vecka',
    Day: 'Dag',
    List: 'Lista',
    'Select View': 'Välj vy',
    View: 'Vy',
    '+ {{n}} events': '+ {{n}} händelser',
    '+ 1 event': '+ 1 händelse',
    'No events': 'Inga händelser',
    'Next period': 'Nästa period',
    'Previous period': 'Föregående period',
    to: 'till', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldags- och flerdagshändelser',
    'Link to {{n}} more events on {{date}}': 'Länk till {{n}} fler händelser den {{date}}',
    'Link to 1 more event on {{date}}': 'Länk till 1 händelse till den {{date}}',
    CW: 'Vecka {{week}}',
};

const timePickerSvSE = {
    Time: 'Tid',
    AM: 'FM',
    PM: 'EM',
    Cancel: 'Avbryt',
    OK: 'OK',
    'Select time': 'Välj tid',
};

const svSE = {
    ...datePickerSvSE,
    ...calendarSvSE,
    ...timePickerSvSE,
};

const datePickerZhCN = {
    Date: '日期',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '下个月',
    'Previous month': '上个月',
    'Choose Date': '选择日期',
};

const calendarZhCN = {
    Today: '今天',
    Month: '月',
    Week: '周',
    Day: '日',
    List: '列表',
    'Select View': '选择视图',
    View: '视图',
    '+ {{n}} events': '+ {{n}} 场活动',
    '+ 1 event': '+ 1 活动',
    'No events': '没有活动',
    'Next period': '下一段时间',
    'Previous period': '上一段时间',
    to: '至', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '全天和多天活动',
    'Link to {{n}} more events on {{date}}': '链接到{{date}}上的{{n}}个更多活动',
    'Link to 1 more event on {{date}}': '链接到{{date}}上的1个更多活动',
    CW: '第{{week}}周',
};

const timePickerZhCN = {
    Time: '时间',
    AM: '上午',
    PM: '下午',
    Cancel: '取消',
    OK: '确定',
    'Select time': '选择时间',
};

const zhCN = {
    ...datePickerZhCN,
    ...calendarZhCN,
    ...timePickerZhCN,
};

const datePickerZhTW = {
    Date: '日期',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '下個月',
    'Previous month': '上個月',
    'Choose Date': '選擇日期',
};

const calendarZhTW = {
    Today: '今天',
    Month: '月',
    Week: '周',
    Day: '日',
    List: '列表',
    'Select View': '選擇檢視模式',
    View: '檢視',
    '+ {{n}} events': '+ {{n}} 場活動',
    '+ 1 event': '+ 1 活動',
    'No events': '沒有活動',
    'Next period': '下一段時間',
    'Previous period': '上一段時間',
    to: '到', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '全天和多天活動',
    'Link to {{n}} more events on {{date}}': '連接到{{date}}上的{{n}}個更多活動',
    'Link to 1 more event on {{date}}': '連接到{{date}}上的1個更多活動',
    CW: '第{{week}}周',
};

const timePickerZhTW = {
    Time: '時間',
    AM: '上午',
    PM: '下午',
    Cancel: '取消',
    OK: '確定',
    'Select time': '選擇時間',
};

const zhTW = {
    ...datePickerZhTW,
    ...calendarZhTW,
    ...timePickerZhTW,
};

const datePickerJaJP = {
    Date: '日付',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '次の月',
    'Previous month': '前の月',
    'Choose Date': '日付を選択',
};

const calendarJaJP = {
    Today: '今日',
    Month: '月',
    Week: '週',
    Day: '日',
    List: 'リスト',
    'Select View': 'ビューを選択',
    View: 'ビュー',
    '+ {{n}} events': '+ {{n}} イベント',
    '+ 1 event': '+ 1 イベント',
    'No events': 'イベントなし',
    'Next period': '次の期間',
    'Previous period': '前の期間',
    to: 'から', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '終日および複数日イベント',
    'Link to {{n}} more events on {{date}}': '{{date}} に{{n}}件のイベントへのリンク',
    'Link to 1 more event on {{date}}': '{{date}} に1件のイベントへのリンク',
    CW: '週 {{week}}',
};

const timePickerJaJP = {
    Time: '時間',
    AM: '午前',
    PM: '午後',
    Cancel: 'キャンセル',
    OK: 'OK',
    'Select time': '時間を選択',
};

const jaJP = {
    ...datePickerJaJP,
    ...calendarJaJP,
    ...timePickerJaJP,
};

const datePickerRuRU = {
    Date: 'Дата',
    'MM/DD/YYYY': 'ММ/ДД/ГГГГ',
    'Next month': 'Следующий месяц',
    'Previous month': 'Прошлый месяц',
    'Choose Date': 'Выберите дату',
};

const calendarRuRU = {
    Today: 'Сегодня',
    Month: 'Месяц',
    Week: 'Неделя',
    Day: 'День',
    List: 'Список',
    'Select View': 'Выберите вид',
    '+ {{n}} events': '+ {{n}} события',
    '+ 1 event': '+ 1 событие',
    'No events': 'Нет событий',
    'Next period': 'Следующий период',
    'Previous period': 'Прошлый период',
    to: 'по', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'События на целый день и несколько дней подряд',
    'Link to {{n}} more events on {{date}}': 'Ссылка на {{n}} дополнительных событий на {{date}}',
    'Link to 1 more event on {{date}}': 'Ссылка на 1 дополнительное событие на {{date}}',
    CW: 'Неделя {{week}}',
    View: 'Вид',
};

const timePickerRuRU = {
    Time: 'Время',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Отмена',
    OK: 'ОК',
    'Select time': 'Выберите время',
};

const ruRU = {
    ...datePickerRuRU,
    ...calendarRuRU,
    ...timePickerRuRU,
};

const datePickerKoKR = {
    Date: '일자',
    'MM/DD/YYYY': '년/월/일',
    'Next month': '다음 달',
    'Previous month': '이전 달',
    'Choose Date': '날짜 선택',
};

const calendarKoKR = {
    Today: '오늘',
    Month: '월',
    Week: '주',
    Day: '일',
    List: '목록',
    'Select View': '보기 선택',
    '+ {{n}} events': '+ {{n}} 일정들',
    '+ 1 event': '+ 1 일정',
    'No events': '일정 없음',
    'Next period': '다음',
    'Previous period': '이전',
    to: '부터', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '종일 및 복수일 일정',
    'Link to {{n}} more events on {{date}}': '{{date}}에 {{n}}개 이상의 이벤트로 이동',
    'Link to 1 more event on {{date}}': '{{date}}에 1개 이상의 이벤트로 이동',
    CW: '{{week}}주',
    View: '보기',
};

const timePickerKoKR = {
    Time: '시간',
    AM: '오전',
    PM: '오후',
    Cancel: '취소',
    OK: '확인',
    'Select time': '시간 선택',
};

const koKR = {
    ...datePickerKoKR,
    ...calendarKoKR,
    ...timePickerKoKR,
};

const datePickerFrFR = {
    Date: 'Date',
    'MM/DD/YYYY': 'JJ/MM/AAAA',
    'Next month': 'Mois suivant',
    'Previous month': 'Mois précédent',
    'Choose Date': 'Choisir une date',
};

const calendarFrFR = {
    Today: "Aujourd'hui",
    Month: 'Mois',
    Week: 'Semaine',
    Day: 'Jour',
    List: 'Liste',
    'Select View': 'Sélectionner la vue',
    View: 'Vue',
    '+ {{n}} events': '+ {{n}} événements',
    '+ 1 event': '+ 1 événement',
    'No events': 'Aucun événement',
    'Next period': 'Période suivante',
    'Previous period': 'Période précédente',
    to: 'au', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Événements sur une journée ou plusieurs jours',
    'Link to {{n}} more events on {{date}}': 'Lien vers {{n}} événements supplémentaires le {{date}}',
    'Link to 1 more event on {{date}}': 'Lien vers 1 événement supplémentaire le {{date}}',
    CW: 'S{{week}}',
};

const timePickerFrFR = {
    Time: 'Heure',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Annuler',
    OK: 'OK',
    'Select time': "Sélectionner l'heure",
};

const frFR = {
    ...datePickerFrFR,
    ...calendarFrFR,
    ...timePickerFrFR,
};

const datePickerDaDK = {
    Date: 'Dato',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Næste måned',
    'Previous month': 'Foregående måned',
    'Choose Date': 'Vælg dato',
};

const calendarDaDK = {
    Today: 'I dag',
    Month: 'Måned',
    Week: 'Uge',
    Day: 'Dag',
    List: 'Liste',
    'Select View': 'Vælg visning',
    '+ {{n}} events': '+ {{n}} begivenheder',
    '+ 1 event': '+ 1 begivenhed',
    'No events': 'Ingen begivenheder',
    'Next period': 'Næste periode',
    'Previous period': 'Forgående periode',
    to: 'til', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldagsbegivenheder og flerdagsbegivenheder',
    'Link to {{n}} more events on {{date}}': 'Link til {{n}} flere begivenheder den {{date}}',
    'Link to 1 more event on {{date}}': 'Link til 1 mere begivenhed den {{date}}',
    CW: 'Uge {{week}}',
    View: 'Visning',
};

const timePickerDaDK = {
    Time: 'Tid',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Annuller',
    OK: 'OK',
    'Select time': 'Vælg tid',
};

const daDK = {
    ...datePickerDaDK,
    ...calendarDaDK,
    ...timePickerDaDK,
};

const datePickerPlPL = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Następny miesiąc',
    'Previous month': 'Poprzedni miesiąc',
    'Choose Date': 'Wybiewrz datę',
};

const calendarPlPL = {
    Today: 'Dzisiaj',
    Month: 'Miesiąc',
    Week: 'Tydzień',
    Day: 'Dzień',
    List: 'Lista',
    'Select View': 'Wybierz widok',
    '+ {{n}} events': '+ {{n}} wydarzenia',
    '+ 1 event': '+ 1 wydarzenie',
    'No events': 'Brak wydarzeń',
    'Next period': 'Następny okres',
    'Previous period': 'Poprzedni okres',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Wydarzenia całodniowe i wielodniowe',
    'Link to {{n}} more events on {{date}}': 'Link do {{n}} kolejnych wydarzeń w dniu {{date}}',
    'Link to 1 more event on {{date}}': 'Link do 1 kolejnego wydarzenia w dniu {{date}}',
    CW: 'Tydzień {{week}}',
    View: 'Widok',
};

const timePickerPlPL = {
    Time: 'Godzina',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Anuluj',
    OK: 'OK',
    'Select time': 'Wybierz godzinę',
};

const plPL = {
    ...datePickerPlPL,
    ...calendarPlPL,
    ...timePickerPlPL,
};

const datePickerEsES = {
    Date: 'Fecha',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Siguiente mes',
    'Previous month': 'Mes anterior',
    'Choose Date': 'Seleccione una fecha',
};

const calendarEsES = {
    Today: 'Hoy',
    Month: 'Mes',
    Week: 'Semana',
    Day: 'Día',
    List: 'Lista',
    'Select View': 'Seleccionar vista',
    View: 'Vista',
    '+ {{n}} events': '+ {{n}} eventos',
    '+ 1 event': '+ 1 evento',
    'No events': 'No hay eventos',
    'Next period': 'Siguiente período',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Día completo y eventos de múltiples días',
    'Link to {{n}} more events on {{date}}': 'Enlace a {{n}} eventos más el {{date}}',
    'Link to 1 more event on {{date}}': 'Enlace a 1 evento más el {{date}}',
    CW: 'Semana {{week}}',
};

const timePickerEsES = {
    Time: 'Hora',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Cancelar',
    OK: 'Aceptar',
    'Select time': 'Seleccionar hora',
};

const esES = {
    ...datePickerEsES,
    ...calendarEsES,
    ...timePickerEsES,
};

const calendarNlNL = {
    Today: 'Vandaag',
    Month: 'Maand',
    Week: 'Week',
    Day: 'Dag',
    List: 'Lijst',
    'Select View': 'Kies weergave',
    '+ {{n}} events': '+ {{n}} gebeurtenissen',
    '+ 1 event': '+ 1 gebeurtenis',
    'No events': 'Geen gebeurtenissen',
    'Next period': 'Volgende periode',
    'Previous period': 'Vorige periode',
    to: 'tot', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Evenementen van een hele dag en meerdere dagen',
    'Link to {{n}} more events on {{date}}': 'Link naar {{n}} meer evenementen op {{date}}',
    'Link to 1 more event on {{date}}': 'Link naar 1 meer evenement op {{date}}',
    CW: 'Week {{week}}',
    View: 'Weergave',
};

const datePickerNlNL = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD-MM-JJJJ',
    'Next month': 'Volgende maand',
    'Previous month': 'Vorige maand',
    'Choose Date': 'Kies datum',
};

const timePickerNlNL = {
    Time: 'Tijd',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Annuleren',
    OK: 'OK',
    'Select time': 'Selecteer tijd',
};

const nlNL = {
    ...datePickerNlNL,
    ...calendarNlNL,
    ...timePickerNlNL,
};

const datePickerPtBR = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mês seguinte',
    'Previous month': 'Mês anterior',
    'Choose Date': 'Escolha uma data',
};

const calendarPtBR = {
    Today: 'Hoje',
    Month: 'Mês',
    Week: 'Semana',
    Day: 'Dia',
    List: 'Lista',
    'Select View': 'Selecione uma visualização',
    '+ {{n}} events': '+ {{n}} eventos',
    '+ 1 event': '+ 1 evento',
    'No events': 'Sem eventos',
    'Next period': 'Período seguinte',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Dia inteiro e eventos de vários dias',
    'Link to {{n}} more events on {{date}}': 'Link para mais {{n}} eventos em {{date}}',
    'Link to 1 more event on {{date}}': 'Link para mais 1 evento em {{date}}',
    CW: 'Semana {{week}}',
    View: 'Visualização',
};

const timePickerPtBR = {
    Time: 'Hora',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Cancelar',
    OK: 'OK',
    'Select time': 'Selecionar hora',
};

const ptBR = {
    ...datePickerPtBR,
    ...calendarPtBR,
    ...timePickerPtBR,
};

const datePickerSkSK = {
    Date: 'Dátum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Ďalší mesiac',
    'Previous month': 'Predchádzajúci mesiac',
    'Choose Date': 'Vyberte dátum',
};

const calendarSkSK = {
    Today: 'Dnes',
    Month: 'Mesiac',
    Week: 'Týždeň',
    Day: 'Deň',
    List: 'Zoznam',
    'Select View': 'Vyberte zobrazenie',
    '+ {{n}} events': '+ {{n}} udalosti',
    '+ 1 event': '+ 1 udalosť',
    'No events': 'Žiadne udalosti',
    'Next period': 'Ďalšie obdobie',
    'Previous period': 'Predchádzajúce obdobie',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodenné a viacdňové udalosti',
    'Link to {{n}} more events on {{date}}': 'Odkaz na {{n}} ďalších udalostí dňa {{date}}',
    'Link to 1 more event on {{date}}': 'Odkaz na 1 ďalšiu udalosť dňa {{date}}',
    CW: '{{week}}. týždeň',
    View: 'Zobrazenie',
};

const timePickerSkSK = {
    Time: 'Čas',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Zrušiť',
    OK: 'OK',
    'Select time': 'Vybrať čas',
};

const skSK = {
    ...datePickerSkSK,
    ...calendarSkSK,
    ...timePickerSkSK,
};

const datePickerMkMK = {
    Date: 'Датум',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Следен месец',
    'Previous month': 'Претходен месец',
    'Choose Date': 'Избери Датум',
};

const calendarMkMK = {
    Today: 'Денес',
    Month: 'Месец',
    Week: 'Недела',
    Day: 'Ден',
    List: 'Листа',
    'Select View': 'Избери Преглед',
    '+ {{n}} events': '+ {{n}} настани',
    '+ 1 event': '+ 1 настан',
    'No events': 'Нема настани',
    'Next period': 'Следен период',
    'Previous period': 'Претходен период',
    to: 'до', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Целодневни и повеќедневни настани',
    'Link to {{n}} more events on {{date}}': 'Линк до {{n}} повеќе настани на {{date}}',
    'Link to 1 more event on {{date}}': 'Линк до 1 повеќе настан на {{date}}',
    CW: 'Недела {{week}}',
    View: 'Преглед',
};

const timePickerMkMK = {
    Time: 'Време',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Откажи',
    OK: 'У реду',
    'Select time': 'Избери време',
};

const mkMK = {
    ...datePickerMkMK,
    ...calendarMkMK,
    ...timePickerMkMK,
};

const datePickerNbNO = {
    Date: 'Dato',
    'MM/DD/YYYY': 'DD.MM.YYYY',
    'Next month': 'Neste måned',
    'Previous month': 'Forrige måned',
    'Choose Date': 'Velg dato',
};

const calendarNbNO = {
    Today: 'I dag',
    Month: 'Måned',
    Week: 'Uke',
    Day: 'Dag',
    List: 'Liste',
    'Select View': 'Velg visning',
    View: 'Visning',
    '+ {{n}} events': '+ {{n}} hendelser',
    '+ 1 event': '+ 1 hendelse',
    'No events': 'Ingen hendelser',
    'Next period': 'Neste periode',
    'Previous period': 'Forrige periode',
    to: 'til', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldags- og flerdagshendelser',
    'Link to {{n}} more events on {{date}}': 'Lenke til {{n}} flere hendelser på {{date}}',
    'Link to 1 more event on {{date}}': 'Lenke til 1 hendelse til på {{date}}',
    CW: 'Uke {{week}}',
};

const timePickerNbNO = {
    Time: 'Tid',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Avbryt',
    OK: 'OK',
    'Select time': 'Velg tid',
};

const nbNO = {
    ...datePickerNbNO,
    ...calendarNbNO,
    ...timePickerNbNO,
};

const datePickerTrTR = {
    Date: 'Tarih',
    'MM/DD/YYYY': 'GG/AA/YYYY',
    'Next month': 'Sonraki ay',
    'Previous month': 'Önceki ay',
    'Choose Date': 'Tarih Seç',
};

const calendarTrTR = {
    Today: 'Bugün',
    Month: 'Aylık',
    Week: 'Haftalık',
    Day: 'Günlük',
    List: 'Liste',
    'Select View': 'Görünüm Seç',
    '+ {{n}} events': '+ {{n}} etkinlikler',
    '+ 1 event': '+ 1 etkinlik',
    'No events': 'Etkinlik yok',
    'Next period': 'Sonraki dönem',
    'Previous period': 'Önceki dönem',
    to: 'dan', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Tüm gün ve çoklu gün etkinlikleri',
    'Link to {{n}} more events on {{date}}': '{{date}} tarihinde {{n}} etkinliğe bağlantı',
    'Link to 1 more event on {{date}}': '{{date}} tarihinde 1 etkinliğe bağlantı',
    CW: '{{week}}. Hafta',
    View: 'Görünüm',
};

const timePickerTrTR = {
    Time: 'Zaman',
    AM: 'ÖÖ',
    PM: 'ÖS',
    Cancel: 'İptal',
    OK: 'Tamam',
    'Select time': 'Zamanı seç',
};

const trTR = {
    ...datePickerTrTR,
    ...calendarTrTR,
    ...timePickerTrTR,
};

const datePickerKyKG = {
    Date: 'Датасы',
    'MM/DD/YYYY': 'АА/КК/ЖЖЖЖ',
    'Next month': 'Кийинки ай',
    'Previous month': 'Өткөн ай',
    'Choose Date': 'Күндү тандаңыз',
};

const calendarKyKG = {
    Today: 'Бүгүн',
    Month: 'Ай',
    Week: 'Апта',
    Day: 'Күн',
    List: 'Тизме',
    'Select View': 'Көрүнүштү тандаңыз',
    '+ {{n}} events': '+ {{n}} Окуялар',
    '+ 1 event': '+ 1 Окуя',
    'No events': 'Окуя жок',
    'Next period': 'Кийинки мезгил',
    'Previous period': 'Өткөн мезгил',
    to: 'чейин', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Күн бою жана бир нече күн катары менен болгон окуялар',
    'Link to {{n}} more events on {{date}}': '{{date}} күнүндө {{n}} окуяга байланыш',
    'Link to 1 more event on {{date}}': '{{date}} күнүндө 1 окуяга байланыш',
    CW: 'Апта {{week}}',
    View: 'Көрүнүш',
};

const timePickerKyKG = {
    Time: 'Убакты',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Болбой',
    OK: 'Ооба',
    'Select time': 'Убакты тандаңыз',
};

const kyKG = {
    ...datePickerKyKG,
    ...calendarKyKG,
    ...timePickerKyKG,
};

const datePickerIdID = {
    Date: 'Tanggal',
    'MM/DD/YYYY': 'DD.MM.YYYY',
    'Next month': 'Bulan depan',
    'Previous month': 'Bulan sebelumnya',
    'Choose Date': 'Pilih tanggal',
};

const calendarIdID = {
    Today: 'Hari Ini',
    Month: 'Bulan',
    Week: 'Minggu',
    Day: 'Hari',
    List: 'Daftar',
    'Select View': 'Pilih tampilan',
    '+ {{n}} events': '+ {{n}} Acara',
    '+ 1 event': '+ 1 Acara',
    'No events': 'Tidak ada acara',
    'Next period': 'Periode selanjutnya',
    'Previous period': 'Periode sebelumnya',
    to: 'sampai', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Sepanjang hari dan acara beberapa hari ',
    'Link to {{n}} more events on {{date}}': 'Tautan ke {{n}} acara lainnya pada {{date}}',
    'Link to 1 more event on {{date}}': 'Tautan ke 1 acara lainnya pada {{date}}',
    CW: 'Minggu {{week}}',
    View: 'Tampilan',
};

const timePickerIdID = {
    Time: 'Waktu',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Batalkan',
    OK: 'OK',
    'Select time': 'Pilih waktu',
};

const idID = {
    ...datePickerIdID,
    ...calendarIdID,
    ...timePickerIdID,
};

const datePickerCsCZ = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Další měsíc',
    'Previous month': 'Předchozí měsíc',
    'Choose Date': 'Vyberte datum',
};

const calendarCsCZ = {
    Today: 'Dnes',
    Month: 'Měsíc',
    Week: 'Týden',
    Day: 'Den',
    List: 'Seznam',
    'Select View': 'Vyberte zobrazení',
    '+ {{n}} events': '+ {{n}} události',
    '+ 1 event': '+ 1 událost',
    'No events': 'Žádné události',
    'Next period': 'Příští období',
    'Previous period': 'Předchozí období',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodenní a vícedenní události',
    'Link to {{n}} more events on {{date}}': 'Odkaz na {{n}} dalších událostí dne {{date}}',
    'Link to 1 more event on {{date}}': 'Odkaz na 1 další událost dne {{date}}',
    CW: 'Týden {{week}}',
    View: 'Zobrazení',
};

const timePickerCsCZ = {
    Time: 'Čas',
    AM: 'Dopoledne',
    PM: 'Odpoledne',
    Cancel: 'Zrušit',
    OK: 'OK',
    'Select time': 'Vyberte čas',
};

const csCZ = {
    ...datePickerCsCZ,
    ...calendarCsCZ,
    ...timePickerCsCZ,
};

const datePickerEtEE = {
    Date: 'Kuupäev',
    'MM/DD/YYYY': 'PP.KK.AAAA',
    'Next month': 'Järgmine kuu',
    'Previous month': 'Eelmine kuu',
    'Choose Date': 'Vali kuupäev',
};

const calendarEtEE = {
    Today: 'Täna',
    Month: 'Kuu',
    Week: 'Nädal',
    Day: 'Päev',
    List: 'Nimekiri',
    'Select View': 'Vali vaade',
    '+ {{n}} events': '+ {{n}} sündmused',
    '+ 1 event': '+ 1 sündmus',
    'No events': 'Pole sündmusi',
    'Next period': 'Järgmine periood',
    'Previous period': 'Eelmine periood',
    to: 'kuni',
    'Full day- and multiple day events': 'Täispäeva- ja mitmepäevasündmused',
    'Link to {{n}} more events on {{date}}': 'Link {{n}} rohkematele sündmustele kuupäeval {{date}}',
    'Link to 1 more event on {{date}}': 'Link ühele lisasündmusele kuupäeval {{date}}',
    CW: 'Nädala number {{week}}',
    View: 'Vaade',
};

const timePickerEtEE = {
    Time: 'Aeg',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Loobu',
    OK: 'OK',
    'Select time': 'Vali aeg',
};

const etEE = {
    ...datePickerEtEE,
    ...calendarEtEE,
    ...timePickerEtEE,
};

const datePickerUkUA = {
    Date: 'Дата',
    'MM/DD/YYYY': 'ММ/ДД/РРРР',
    'Next month': 'Наступний місяць',
    'Previous month': 'Минулий місяць',
    'Choose Date': 'Виберіть дату',
};

const calendarUkUA = {
    Today: 'Сьогодні',
    Month: 'Місяць',
    Week: 'Тиждень',
    Day: 'День',
    List: 'Список',
    'Select View': 'Виберіть вигляд',
    '+ {{n}} events': '+ {{n}} події',
    '+ 1 event': '+ 1 подія',
    'No events': 'Немає подій',
    'Next period': 'Наступний період',
    'Previous period': 'Минулий період',
    to: 'по', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Події на цілий день і кілька днів поспіль',
    'Link to {{n}} more events on {{date}}': 'Посилання на {{n}} додаткові події на {{date}}',
    'Link to 1 more event on {{date}}': 'Посилання на 1 додаткову подію на {{date}}',
    CW: 'Тиждень {{week}}',
    View: 'Вигляд',
};

const timePickerUkUA = {
    Time: 'Час',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Скасувати',
    OK: 'Гаразд',
    'Select time': 'Виберіть час',
};

const ukUA = {
    ...datePickerUkUA,
    ...calendarUkUA,
    ...timePickerUkUA,
};

const datePickerSrLatnRS = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Sledeći mesec',
    'Previous month': 'Prethodni mesec',
    'Choose Date': 'Izaberite datum',
};

const calendarSrLatnRS = {
    Today: 'Danas',
    Month: 'Mesec',
    Week: 'Nedelja',
    Day: 'Dan',
    List: 'Lista',
    'Select View': 'Odaberite pregled',
    '+ {{n}} events': '+ {{n}} Događaji',
    '+ 1 event': '+ 1 Događaj',
    'No events': 'Nema događaja',
    'Next period': 'Naredni period',
    'Previous period': 'Prethodni period',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodnevni i višednevni događaji',
    'Link to {{n}} more events on {{date}}': 'Link do još {{n}} događaja na {{date}}',
    'Link to 1 more event on {{date}}': 'Link do jednog događaja na {{date}}',
    CW: 'Nedelja {{week}}',
    View: 'Pregled',
};

const timePickerSrLatnRS = {
    Time: 'Vrijeme',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Otkaži',
    OK: 'U redu',
    'Select time': 'Odaberi vrijeme',
};

const srLatnRS = {
    ...datePickerSrLatnRS,
    ...calendarSrLatnRS,
    ...timePickerSrLatnRS,
};

const datePickerCaES = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Següent mes',
    'Previous month': 'Mes anterior',
    'Choose Date': 'Selecciona una data',
};

const calendarCaES = {
    Today: 'Avui',
    Month: 'Mes',
    Week: 'Setmana',
    Day: 'Dia',
    List: 'Llista',
    'Select View': 'Selecciona una vista',
    '+ {{n}} events': '+ {{n}} Esdeveniments',
    '+ 1 event': '+ 1 Esdeveniment',
    'No events': 'Sense esdeveniments',
    'Next period': 'Següent període',
    'Previous period': 'Període anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Esdeveniments de dia complet i de múltiples dies',
    'Link to {{n}} more events on {{date}}': 'Enllaç a {{n}} esdeveniments més el {{date}}',
    'Link to 1 more event on {{date}}': 'Enllaç a 1 esdeveniment més el {{date}}',
    CW: 'Setmana {{week}}',
    View: 'Vista',
};

const timePickerCaES = {
    Time: 'Hora',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Cancel·lar',
    OK: 'Acceptar',
    'Select time': 'Selecciona una hora',
};

const caES = {
    ...datePickerCaES,
    ...calendarCaES,
    ...timePickerCaES,
};

const datePickerSrRS = {
    Date: 'Датум',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Следећи месец',
    'Previous month': 'Претходни месец',
    'Choose Date': 'Изаберите Датум',
};

const calendarSrRS = {
    Today: 'Данас',
    Month: 'Месец',
    Week: 'Недеља',
    Day: 'Дан',
    List: 'Листа',
    'Select View': 'Изаберите преглед',
    '+ {{n}} events': '+ {{n}} Догађаји',
    '+ 1 event': '+ 1 Догађај',
    'No events': 'Нема догађаја',
    'Next period': 'Следећи период',
    'Previous period': 'Претходни период',
    to: 'да', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Целодневни и вишедневни догађаји',
    'Link to {{n}} more events on {{date}}': 'Линк до још {{n}} догађаја на {{date}}',
    'Link to 1 more event on {{date}}': 'Линк до још 1 догађаја {{date}}',
    CW: 'Недеља {{week}}',
    View: 'Преглед',
};

const timePickerSrRS = {
    Time: 'Време',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Откажи',
    OK: 'У реду',
    'Select time': 'Изабери време',
};

const srRS = {
    ...datePickerSrRS,
    ...calendarSrRS,
    ...timePickerSrRS,
};

const datePickerLtLT = {
    Date: 'Data',
    'MM/DD/YYYY': 'MMMM-MM-DD',
    'Next month': 'Kitas mėnuo',
    'Previous month': 'Ankstesnis mėnuo',
    'Choose Date': 'Pasirinkite datą',
};

const calendarLtLT = {
    Today: 'Šiandien',
    Month: 'Mėnuo',
    Week: 'Savaitė',
    Day: 'Diena',
    List: 'Sąrašas',
    'Select View': 'Pasirinkite vaizdą',
    '+ {{n}} events': '+ {{n}} įvykiai',
    '+ 1 event': '+ 1 įvykis',
    'No events': 'Įvykių nėra',
    'Next period': 'Kitas laikotarpis',
    'Previous period': 'Ankstesnis laikotarpis',
    to: 'iki', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Visos dienos ir kelių dienų įvykiai',
    'Link to {{n}} more events on {{date}}': 'Nuoroda į dar {{n}} įvykius {{date}}',
    'Link to 1 more event on {{date}}': 'Nuoroda į dar 1 vieną įvykį {{date}}',
    CW: '{{week}} savaitė',
    View: 'Vaizdas',
};

const timePickerLtLT = {
    Time: 'Laikas',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Atšaukti',
    OK: 'Gerai',
    'Select time': 'Pasirinkite laiką',
};

const ltLT = {
    ...datePickerLtLT,
    ...calendarLtLT,
    ...timePickerLtLT,
};

const datePickerHrHR = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Sljedeći mjesec',
    'Previous month': 'Prethodni mjesec',
    'Choose Date': 'Izaberite datum',
};

const calendarHrHR = {
    Today: 'Danas',
    Month: 'Mjesec',
    Week: 'Nedjelja',
    Day: 'Dan',
    List: 'Lista',
    'Select View': 'Odaberite pregled',
    '+ {{n}} events': '+ {{n}} Događaji',
    '+ 1 event': '+ 1 Događaj',
    'No events': 'Nema događaja',
    'Next period': 'Sljedeći period',
    'Previous period': 'Prethodni period',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Cjelodnevni i višednevni događaji',
    'Link to {{n}} more events on {{date}}': 'Link do još {{n}} događaja na {{date}}',
    'Link to 1 more event on {{date}}': 'Link do još jednog događaja na {{date}}',
    CW: '{{week}}. tjedan',
    View: 'Pregled',
};

const timePickerHrHR = {
    Time: 'Vrijeme',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Otkaži',
    OK: 'U redu',
    'Select time': 'Odaberi vrijeme',
};

const hrHR = {
    ...datePickerHrHR,
    ...calendarHrHR,
    ...timePickerHrHR,
};

const datePickerSlSI = {
    Date: 'Datum',
    'MM/DD/YYYY': 'MM.DD.YYYY',
    'Next month': 'Naslednji mesec',
    'Previous month': 'Prejšnji mesec',
    'Choose Date': 'Izberi datum',
};

const calendarSlSI = {
    Today: 'Danes',
    Month: 'Mesec',
    Week: 'Teden',
    Day: 'Dan',
    List: 'Seznam',
    'Select View': 'Izberi pogled',
    '+ {{n}} events': '+ {{n}} dogodki',
    '+ 1 event': '+ 1 dogodek',
    'No events': 'Ni dogodkov',
    'Next period': 'Naslednji dogodek',
    'Previous period': 'Prejšnji dogodek',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodnevni in večdnevni dogodki',
    'Link to {{n}} more events on {{date}}': 'Povezava do {{n}} drugih dogodkov dne {{date}}',
    'Link to 1 more event on {{date}}': 'Povezava do še enega dogodka dne {{date}}',
    CW: 'Teden {{week}}',
    View: 'Pogled',
};

const timePickerSlSI = {
    Time: 'Čas',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Prekliči',
    OK: 'V redu',
    'Select time': 'Izberite čas',
};

const slSI = {
    ...datePickerSlSI,
    ...calendarSlSI,
    ...timePickerSlSI,
};

const datePickerFiFI = {
    Date: 'Päivämäärä',
    'MM/DD/YYYY': 'VVVV-KK-PP',
    'Next month': 'Seuraava kuukausi',
    'Previous month': 'Edellinen kuukausi',
    'Choose Date': 'Valitse päivämäärä',
};

const calendarFiFI = {
    Today: 'Tänään',
    Month: 'Kuukausi',
    Week: 'Viikko',
    Day: 'Päivä',
    List: 'Lista',
    'Select View': 'Valitse näkymä',
    '+ {{n}} events': '+ {{n}} tapahtumaa',
    '+ 1 event': '+ 1 tapahtuma',
    'No events': 'Ei tapahtumia',
    'Next period': 'Seuraava ajanjakso',
    'Previous period': 'Edellinen ajanjakso',
    to: '-', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Koko ja usean päivän tapahtumat',
    'Link to {{n}} more events on {{date}}': 'Linkki {{n}} lisätapahtumaan päivämäärällä {{date}}',
    'Link to 1 more event on {{date}}': 'Linkki 1 lisätapahtumaan päivämäärällä {{date}}',
    CW: 'Viikko {{week}}',
    View: 'Näkymä',
};

const timePickerFiFI = {
    Time: 'Aika',
    AM: 'ap.',
    PM: 'ip.',
    Cancel: 'Peruuta',
    OK: 'OK',
    'Select time': 'Valitse aika',
};

const fiFI = {
    ...datePickerFiFI,
    ...calendarFiFI,
    ...timePickerFiFI,
};

const datePickerRoRO = {
    Date: 'Data',
    'MM/DD/YYYY': 'LL/ZZ/AAAA',
    'Next month': 'Luna următoare',
    'Previous month': 'Luna anterioară',
    'Choose Date': 'Alege data',
};

const calendarRoRO = {
    Today: 'Astăzi',
    Month: 'Lună',
    Week: 'Săptămână',
    Day: 'Zi',
    List: 'Listă',
    'Select View': 'Selectează vizualizarea',
    '+ {{n}} events': '+ {{n}} evenimente',
    '+ 1 event': '+ 1 eveniment',
    'No events': 'Fără evenimente',
    'Next period': 'Perioada următoare',
    'Previous period': 'Perioada anterioară',
    to: 'până la', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Evenimente pe durata întregii zile și pe durata mai multor zile',
    'Link to {{n}} more events on {{date}}': 'Link către {{n}} evenimente suplimentare pe {{date}}',
    'Link to 1 more event on {{date}}': 'Link către 1 eveniment suplimentar pe {{date}}',
    CW: 'Săptămâna {{week}}',
    View: 'Vizualizare',
};

const timePickerRoRO = {
    Time: 'Timp',
    AM: 'AM',
    PM: 'PM',
    Cancel: 'Anulează',
    OK: 'OK',
    'Select time': 'Selectați ora',
};

const roRO = {
    ...datePickerRoRO,
    ...calendarRoRO,
    ...timePickerRoRO,
};

const datePickerFaIR = {
    Date: 'تاریخ',
    'MM/DD/YYYY': 'MM/DD/YYYY',
    'Next month': 'ماه بعد',
    'Previous month': 'ماه قبل',
    'Choose Date': 'انتخاب تاریخ',
};

const calendarFaIR = {
    Today: 'امروز',
    Month: 'ماه',
    Week: 'هفته',
    Day: 'روز',
    List: 'لیست',
    'Select View': 'انتخاب نما',
    '+ {{n}} events': '+ {{n}} رویدادها',
    '+ 1 event': '+ 1 رویداد',
    'No events': 'رویدادی وجود ندارد',
    'Next period': 'دوره بعدی',
    'Previous period': 'دوره قبلی',
    to: 'تا',
    'Full day- and multiple day events': 'رویدادهای تمام روز و چند روزه',
    'Link to {{n}} more events on {{date}}': 'لینک به {{n}} رویداد بیشتر در تاریخ {{date}}',
    'Link to 1 more event on {{date}}': 'لینک به 1 رویداد بیشتر در تاریخ {{date}}',
    CW: 'هفته {{week}}',
    View: 'نمایش',
};

const timePickerFaIR = {
    Time: 'زمان',
    AM: 'ق.ظ',
    PM: 'ب.ظ',
    Cancel: 'لغو',
    OK: 'تایید',
    'Select time': 'انتخاب زمان',
};

const faIR = {
    ...datePickerFaIR,
    ...calendarFaIR,
    ...timePickerFaIR,
};

class InvalidLocaleError extends Error {
    constructor(locale) {
        super(`Invalid locale: ${locale}`);
    }
}

const translate = (locale, languages) => (key, translationVariables) => {
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale.value) &&
        'sr-Latn-RS' !== locale.value) {
        throw new InvalidLocaleError(locale.value);
    }
    const deHyphenatedLocale = locale.value.replaceAll('-', '');
    const language = languages.value[deHyphenatedLocale];
    if (!language)
        return key;
    let translation = language[key] || key;
    Object.keys(translationVariables || {}).forEach((variable) => {
        const value = String(translationVariables === null || translationVariables === void 0 ? void 0 : translationVariables[variable]);
        if (!value)
            return;
        translation = translation.replace(`{{${variable}}}`, value);
    });
    return translation;
};

const datePickerHeIL = {
    Date: 'תַאֲרִיך',
    'MM/DD/YYYY': 'MM/DD/YYYY',
    'Next month': 'חודש הבא',
    'Previous month': 'חודש קודם',
    'Choose Date': 'בחר תאריך',
};

const calendarHeIL = {
    Today: 'הַיוֹם',
    Month: 'חוֹדֶשׁ',
    Week: 'שָׁבוּעַ',
    Day: 'יוֹם',
    List: 'רשימה',
    'Select View': 'בחר תצוגה',
    '+ {{n}} events': '+ {{n}} אירועים',
    '+ 1 event': '+ 1 אירוע',
    'No events': 'אין אירועים',
    'Next period': 'תקופה הבאה',
    'Previous period': 'תקופה קודמת',
    to: 'עד', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'אירועים לכל היום ולמספר ימים',
    'Link to {{n}} more events on {{date}}': 'קישור לעוד {{n}} אירועים ב-{{date}}',
    'Link to 1 more event on {{date}}': 'קישור לאירוע נוסף ב-{{date}}',
    CW: '{{week}} שָׁבוּעַ',
    View: 'תצוגה',
};

const timePickerHeIL = {
    Time: 'שעה',
    AM: 'לפנה"צ',
    PM: 'אחה"צ',
    Cancel: 'ביטול',
    OK: 'אישור',
    'Select time': 'בחר שעה',
};

const heIL = {
    ...datePickerHeIL,
    ...calendarHeIL,
    ...timePickerHeIL,
};

const translations = {
    deDE,
    enUS,
    itIT,
    enGB,
    svSE,
    zhCN,
    zhTW,
    jaJP,
    ruRU,
    koKR,
    frFR,
    daDK,
    mkMK,
    nbNO,
    plPL,
    heIL,
    esES,
    nlNL,
    ptBR,
    skSK,
    trTR,
    kyKG,
    idID,
    csCZ,
    etEE,
    ukUA,
    caES,
    srLatnRS,
    srRS,
    ltLT,
    hrHR,
    slSI,
    fiFI,
    roRO,
    faIR,
    arEG,
};

class EventColors {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
    }
    setLight() {
        Object.entries(this.config.calendars.value || {}).forEach(([calendarName, calendar]) => {
            if (!calendar.lightColors) {
                console.warn(`No light colors defined for calendar ${calendarName}`);
                return;
            }
            this.setColors(calendar.colorName, calendar.lightColors);
        });
    }
    setDark() {
        Object.entries(this.config.calendars.value || {}).forEach(([calendarName, calendar]) => {
            if (!calendar.darkColors) {
                console.warn(`No dark colors defined for calendar ${calendarName}`);
                return;
            }
            this.setColors(calendar.colorName, calendar.darkColors);
        });
    }
    setColors(colorName, colorDefinition) {
        document.documentElement.style.setProperty(`--sx-color-${colorName}`, colorDefinition.main);
        document.documentElement.style.setProperty(`--sx-color-${colorName}-container`, colorDefinition.container);
        document.documentElement.style.setProperty(`--sx-color-on-${colorName}-container`, colorDefinition.onContainer);
    }
}

const createCalendarState = (calendarConfig, timeUnitsImpl, selectedDate) => {
    var _a;
    const _view = signals.signal(((_a = calendarConfig.views.value.find((view) => view.name === calendarConfig.defaultView)) === null || _a === void 0 ? void 0 : _a.name) || calendarConfig.views.value[0].name);
    const view = signals.computed(() => {
        return _view.value;
    });
    const range = signals.signal(null);
    let wasInitialized = false;
    let lastRangeEmitted__NEEDED_TO_PREVENT_RECURSION_IN_EVENT_RECURRENCE_PACKAGE_WHICH_CAUSES_RANGE_TO_UPDATE_AND_THUS_CAUSES_A_CYCLE = null;
    const callOnRangeUpdate = (_range) => {
        const lastRange = lastRangeEmitted__NEEDED_TO_PREVENT_RECURSION_IN_EVENT_RECURRENCE_PACKAGE_WHICH_CAUSES_RANGE_TO_UPDATE_AND_THUS_CAUSES_A_CYCLE;
        if (!_range.value)
            return;
        if ((lastRange === null || lastRange === void 0 ? void 0 : lastRange.start.toString()) === _range.value.start.toString() &&
            (lastRange === null || lastRange === void 0 ? void 0 : lastRange.end.toString()) === _range.value.end.toString())
            return;
        if (!wasInitialized)
            return (wasInitialized = true);
        if (calendarConfig.callbacks.onRangeUpdate && _range.value) {
            calendarConfig.callbacks.onRangeUpdate(_range.value);
        }
        Object.values(calendarConfig.plugins || {}).forEach((plugin) => {
            var _a;
            (_a = plugin === null || plugin === void 0 ? void 0 : plugin.onRangeUpdate) === null || _a === void 0 ? void 0 : _a.call(plugin, _range.value);
            lastRangeEmitted__NEEDED_TO_PREVENT_RECURSION_IN_EVENT_RECURRENCE_PACKAGE_WHICH_CAUSES_RANGE_TO_UPDATE_AND_THUS_CAUSES_A_CYCLE =
                _range.value;
        });
    };
    signals.effect(() => {
        if (range.value) {
            callOnRangeUpdate(range);
        }
    });
    const setRange = (date) => {
        var _a, _b;
        const selectedView = calendarConfig.views.value.find((availableView) => availableView.name === _view.value);
        const newRange = selectedView.setDateRange({
            calendarConfig,
            date,
            range,
            timeUnitsImpl,
        });
        if (newRange.start.toString() === ((_a = range.value) === null || _a === void 0 ? void 0 : _a.start.toString()) &&
            newRange.end.toString() === ((_b = range.value) === null || _b === void 0 ? void 0 : _b.end.toString()))
            return;
        range.value = newRange;
    };
    // one initial call for setting the range
    setRange(selectedDate ||
        Temporal.PlainDate.from(Temporal.Now.plainDateISO(calendarConfig.timezone.value)));
    const isCalendarSmall = signals.signal(undefined);
    const isDark = signals.signal(calendarConfig.isDark.value || false);
    signals.effect(() => {
        const eventColors = new EventColors(calendarConfig);
        if (isDark.value) {
            eventColors.setDark();
        }
        else {
            eventColors.setLight();
        }
    });
    return {
        view,
        isDark,
        setRange,
        range,
        isCalendarSmall,
        setView: (newView, selectedDate) => {
            signals.batch(() => {
                _view.value = newView;
                setRange(selectedDate);
            });
        },
    };
};

const createCalendarEventsImpl = (events, backgroundEvents, config) => {
    const list = signals.signal(events.map((event) => {
        return externalEventToInternal(event, config);
    }));
    const filterPredicate = signals.signal(undefined);
    return {
        list,
        filterPredicate,
        backgroundEvents: signals.signal(backgroundEvents),
    };
};

const timePointsPerDay = (dayStart, dayEnd, isHybridDay) => {
    if (dayStart === dayEnd)
        return 2400;
    if (isHybridDay)
        return 2400 - dayStart + dayEnd;
    return dayEnd - dayStart;
};

const getDirection = () => {
    const html = document.querySelector('html');
    if (!html) {
        return 'ltr';
    }
    const direction = html.getAttribute('dir');
    if (direction === 'rtl') {
        return 'rtl';
    }
    return 'ltr';
};

class CalendarConfigImpl {
    constructor(locale = DEFAULT_LOCALE, firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK, defaultView = InternalViewName.Week, views = [], dayBoundaries = DEFAULT_DAY_BOUNDARIES, weekOptions, calendars = {}, plugins = {}, isDark = false, isResponsive = true, callbacks = {}, _customComponentFns = {}, minDate = undefined, maxDate = undefined, monthGridOptions = {
        nEventsPerDay: 4,
    }, theme = undefined, translations = {}, showWeekNumbers = false, timezone = 'UTC') {
        Object.defineProperty(this, "defaultView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultView
        });
        Object.defineProperty(this, "plugins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: plugins
        });
        Object.defineProperty(this, "isResponsive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: isResponsive
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: callbacks
        });
        Object.defineProperty(this, "_customComponentFns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _customComponentFns
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "views", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dayBoundaries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "weekOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isDark", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "minDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "monthGridOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: signals.signal(DEFAULT_LOCALE)
        });
        Object.defineProperty(this, "theme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "translations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "showWeekNumbers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: signals.signal(false)
        });
        Object.defineProperty(this, "direction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ltr'
        });
        Object.defineProperty(this, "timezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_destroyCustomComponentInstance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.locale = signals.signal(locale);
        this.firstDayOfWeek = signals.signal(firstDayOfWeek);
        this.views = signals.signal(views);
        this.dayBoundaries = signals.signal(dayBoundaries);
        this.weekOptions = signals.signal(weekOptions);
        this.calendars = signals.signal(calendars);
        this.isDark = signals.signal(isDark);
        this.minDate = signals.signal(minDate);
        this.maxDate = signals.signal(maxDate);
        this.monthGridOptions = signals.signal(monthGridOptions);
        this.theme = theme;
        this.translations = signals.signal(translations);
        this.showWeekNumbers = signals.signal(showWeekNumbers);
        this.direction = getDirection();
        this.timezone = signals.signal(timezone);
    }
    get isHybridDay() {
        return (this.dayBoundaries.value.start > this.dayBoundaries.value.end ||
            (this.dayBoundaries.value.start !== 0 &&
                this.dayBoundaries.value.start === this.dayBoundaries.value.end));
    }
    get timePointsPerDay() {
        return timePointsPerDay(this.dayBoundaries.value.start, this.dayBoundaries.value.end, this.isHybridDay);
    }
}

class CalendarConfigBuilder {
    constructor() {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "views", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dayBoundaries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "weekOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                gridHeight: DEFAULT_WEEK_GRID_HEIGHT,
                nDays: 7,
                eventWidth: 100,
                timeAxisFormatOptions: { hour: 'numeric' },
                eventOverlap: true,
                gridStep: 60,
            }
        });
        Object.defineProperty(this, "monthGridOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "plugins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "isDark", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isResponsive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "minDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "backgroundEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "theme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // TODO: Change for V3. Should only be configured from outside
        Object.defineProperty(this, "translations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "showWeekNumbers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        const minDate = this.minDate
            ? Temporal.PlainDate.from(this.minDate)
            : undefined;
        const maxDate = this.maxDate
            ? Temporal.PlainDate.from(this.maxDate)
            : undefined;
        return new CalendarConfigImpl(this.locale || DEFAULT_LOCALE, typeof this.firstDayOfWeek === 'number'
            ? this.firstDayOfWeek
            : DEFAULT_FIRST_DAY_OF_WEEK, this.defaultView || InternalViewName.Week, this.views || [], this.dayBoundaries || DEFAULT_DAY_BOUNDARIES, this.weekOptions, this.calendars, this.plugins, this.isDark, this.isResponsive, this.callbacks, {}, minDate, maxDate, this.monthGridOptions, this.theme, this.translations, this.showWeekNumbers, this.timezone);
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withTranslations(translation) {
        this.translations = translation;
        return this;
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
        return this;
    }
    withDefaultView(defaultView) {
        this.defaultView = defaultView;
        return this;
    }
    withViews(views) {
        this.views = views;
        return this;
    }
    withDayBoundaries(dayBoundaries) {
        if (!dayBoundaries)
            return this;
        this.dayBoundaries = {
            start: timePointsFromString(dayBoundaries.start),
            end: timePointsFromString(dayBoundaries.end),
        };
        return this;
    }
    withWeekOptions(userDefinedWeekOptions) {
        this.weekOptions = {
            ...this.weekOptions,
            ...userDefinedWeekOptions,
        };
        if (this.weekOptions.gridStep !== 60 &&
            (userDefinedWeekOptions === null || userDefinedWeekOptions === void 0 ? void 0 : userDefinedWeekOptions.timeAxisFormatOptions) === undefined) {
            this.weekOptions.timeAxisFormatOptions = {
                hour: 'numeric',
                minute: 'numeric',
            };
        }
        return this;
    }
    withCalendars(calendars) {
        this.calendars = calendars;
        return this;
    }
    withPlugins(plugins) {
        if (!plugins)
            return this;
        plugins.forEach((plugin) => {
            this.plugins[plugin.name] = plugin;
        });
        return this;
    }
    withIsDark(isDark) {
        this.isDark = isDark;
        return this;
    }
    withIsResponsive(isResponsive) {
        this.isResponsive = isResponsive;
        return this;
    }
    withCallbacks(listeners) {
        this.callbacks = listeners;
        return this;
    }
    withMinDate(minDate) {
        this.minDate = minDate;
        return this;
    }
    withMaxDate(maxDate) {
        this.maxDate = maxDate;
        return this;
    }
    withMonthGridOptions(monthOptions) {
        this.monthGridOptions = monthOptions;
        return this;
    }
    withBackgroundEvents(backgroundEvents) {
        this.backgroundEvents = backgroundEvents;
        return this;
    }
    withTheme(theme) {
        this.theme = theme;
        return this;
    }
    withWeekNumbers(showWeekNumbers) {
        this.showWeekNumbers = showWeekNumbers;
        return this;
    }
    withTimezone(timezone) {
        this.timezone = timezone;
        return this;
    }
}

const createInternalConfig = (config, plugins) => {
    return new CalendarConfigBuilder()
        .withLocale(config.locale)
        .withFirstDayOfWeek(config.firstDayOfWeek)
        .withDefaultView(config.defaultView)
        .withViews(config.views)
        .withDayBoundaries(config.dayBoundaries)
        .withWeekOptions(config.weekOptions)
        .withCalendars(config.calendars)
        .withPlugins(plugins)
        .withIsDark(config.isDark)
        .withIsResponsive(config.isResponsive)
        .withCallbacks(config.callbacks)
        .withMinDate(config.minDate ? config.minDate.toString() : undefined)
        .withMaxDate(config.maxDate ? config.maxDate.toString() : undefined)
        .withMonthGridOptions(config.monthGridOptions)
        .withBackgroundEvents(config.backgroundEvents)
        .withTheme(config.theme)
        .withTranslations(config.translations || translations)
        .withWeekNumbers(config.showWeekNumbers)
        .withTimezone(config.timezone)
        .build();
};

var Month;
(function (Month) {
    Month[Month["JANUARY"] = 1] = "JANUARY";
    Month[Month["FEBRUARY"] = 2] = "FEBRUARY";
    Month[Month["MARCH"] = 3] = "MARCH";
    Month[Month["APRIL"] = 4] = "APRIL";
    Month[Month["MAY"] = 5] = "MAY";
    Month[Month["JUNE"] = 6] = "JUNE";
    Month[Month["JULY"] = 7] = "JULY";
    Month[Month["AUGUST"] = 8] = "AUGUST";
    Month[Month["SEPTEMBER"] = 9] = "SEPTEMBER";
    Month[Month["OCTOBER"] = 10] = "OCTOBER";
    Month[Month["NOVEMBER"] = 11] = "NOVEMBER";
    Month[Month["DECEMBER"] = 12] = "DECEMBER";
})(Month || (Month = {}));

class NoYearZeroError extends Error {
    constructor() {
        super('Year zero does not exist in the Gregorian calendar.');
    }
}

class TimeUnitsImpl {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
    }
    get firstDayOfWeek() {
        return this.config.firstDayOfWeek.value;
    }
    set firstDayOfWeek(firstDayOfWeek) {
        this.config.firstDayOfWeek.value = firstDayOfWeek;
    }
    getMonth(year, month) {
        if (year === 0)
            throw new NoYearZeroError();
        const firstDateOfMonth = Temporal.PlainDate.from({
            year,
            month: month,
            day: 1,
        });
        const lastDateOfMonth = firstDateOfMonth
            .toPlainYearMonth()
            .toPlainDate({ day: firstDateOfMonth.toPlainYearMonth().daysInMonth });
        const dates = [];
        let currentDate = firstDateOfMonth;
        while (Temporal.PlainDate.compare(currentDate, lastDateOfMonth) <= 0) {
            dates.push(currentDate.toZonedDateTime(this.config.timezone.value));
            currentDate = currentDate.add({ days: 1 });
        }
        return dates;
    }
    getMonthWithTrailingAndLeadingDays(year, month) {
        if (year === 0)
            throw new NoYearZeroError();
        const firstDateOfMonth = Temporal.PlainDate.from({
            year,
            month: month,
            day: 1,
        });
        const monthWithDates = [this.getWeekForTemporal(firstDateOfMonth)];
        let isInMonth = true;
        let currentWeekStart = monthWithDates[0][0]; // first day of first week of month
        while (isInMonth) {
            const nextWeekStart = currentWeekStart.add({ days: 7 });
            // Check if the next week contains any dates from the target month
            const nextWeekDates = this.getWeekForTemporal(nextWeekStart);
            const hasDatesInTargetMonth = nextWeekDates.some((date) => date.month === month);
            if (hasDatesInTargetMonth) {
                monthWithDates.push(nextWeekDates);
                currentWeekStart = nextWeekStart;
            }
            else {
                isInMonth = false;
            }
        }
        // Convert Temporal.PlainDate arrays to Temporal.ZonedDateTime arrays
        return monthWithDates.map((week) => week.map((plainDate) => plainDate.toZonedDateTime(this.config.timezone.value)));
    }
    getWeekFor(date) {
        const plainDate = date instanceof Temporal.PlainDate ? date : date.toPlainDate();
        const week = [
            this.getFirstDateOfWeekTemporal(plainDate).toZonedDateTime(this.config.timezone.value),
        ];
        while (week.length < 7) {
            const lastDateOfWeek = week[week.length - 1];
            const nextDateOfWeek = lastDateOfWeek.add({ days: 1 });
            week.push(nextDateOfWeek);
        }
        return week;
    }
    getMonthsFor(year) {
        if (year === 0)
            throw new NoYearZeroError();
        return Object.values(Month)
            .filter((month) => !isNaN(Number(month)))
            .map((month) => Temporal.PlainDate.from({ year, month: Number(month), day: 1 }));
    }
    getWeekForTemporal(date) {
        const week = [this.getFirstDateOfWeekTemporal(date)];
        while (week.length < 7) {
            const lastDateOfWeek = week[week.length - 1];
            const nextDateOfWeek = lastDateOfWeek.add({ days: 1 });
            week.push(nextDateOfWeek);
        }
        return week;
    }
    getFirstDateOfWeekTemporal(date) {
        const dateIsNthDayOfWeek = date.dayOfWeek - this.firstDayOfWeek;
        if (dateIsNthDayOfWeek === 0) {
            return date;
        }
        else if (dateIsNthDayOfWeek > 0) {
            return date.subtract({ days: dateIsNthDayOfWeek });
        }
        else {
            return date.subtract({ days: 7 + dateIsNthDayOfWeek });
        }
    }
}

class TimeUnitsBuilder {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new TimeUnitsImpl(this.config);
    }
    withConfig(config) {
        this.config = config;
        return this;
    }
}

const createTimeUnitsImpl = (internalConfig) => {
    return new TimeUnitsBuilder().withConfig(internalConfig).build();
};

var Placement;
(function (Placement) {
    Placement["TOP_START"] = "top-start";
    Placement["TOP_END"] = "top-end";
    Placement["BOTTOM_START"] = "bottom-start";
    Placement["BOTTOM_END"] = "bottom-end";
})(Placement || (Placement = {}));

class ConfigImpl {
    constructor(locale = DEFAULT_LOCALE, firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK, timezone = 'UTC', min = Temporal.PlainDate.from({
        year: 1970,
        month: 1,
        day: 1,
    }), max = Temporal.PlainDate.from({
        year: new Date().getFullYear() + 50,
        month: 11,
        day: 31,
    }), placement = Placement.BOTTOM_START, listeners = {}, style = {}, teleportTo, label, name, disabled, hasPlaceholder) {
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
        Object.defineProperty(this, "placement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: placement
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: listeners
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: style
        });
        Object.defineProperty(this, "teleportTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: teleportTo
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: label
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: disabled
        });
        Object.defineProperty(this, "hasPlaceholder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: hasPlaceholder
        });
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.locale = signals.signal(locale);
        this.firstDayOfWeek = signals.signal(firstDayOfWeek);
        this.timezone = signals.signal(timezone);
    }
}

class ConfigBuilder {
    constructor() {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timezone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "min", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "placement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "teleportTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hasPlaceholder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new ConfigImpl(this.locale, this.firstDayOfWeek, this.timezone, this.min, this.max, this.placement, this.listeners, this.style, this.teleportTo, this.label, this.name, this.disabled, this.hasPlaceholder);
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
        return this;
    }
    withTimezone(timezone) {
        this.timezone = timezone;
        return this;
    }
    withMin(min) {
        this.min = min;
        return this;
    }
    withMax(max) {
        this.max = max;
        return this;
    }
    withPlacement(placement) {
        this.placement = placement;
        return this;
    }
    withListeners(listeners) {
        this.listeners = listeners;
        return this;
    }
    withStyle(style) {
        this.style = style;
        return this;
    }
    withTeleportTo(teleportTo) {
        this.teleportTo = teleportTo;
        return this;
    }
    withLabel(label) {
        this.label = label;
        return this;
    }
    withName(name) {
        this.name = name;
        return this;
    }
    withDisabled(disabled) {
        this.disabled = disabled;
        return this;
    }
    withHasPlaceholder(hasPlaceholder) {
        this.hasPlaceholder = hasPlaceholder;
        return this;
    }
}

const createDatePickerConfig = (config, dateSelectionCallback) => {
    var _a, _b;
    let teleportTo;
    if ((_a = config.datePicker) === null || _a === void 0 ? void 0 : _a.teleportTo) {
        teleportTo = config.datePicker.teleportTo;
    }
    const dynamicPlacement = (datePickerWrapper) => {
        if (datePickerWrapper) {
            const rect = datePickerWrapper.getBoundingClientRect();
            const viewportCenterX = window.innerWidth / 2;
            const isMoreOnLeftSide = rect.x + rect.width / 2 <= viewportCenterX;
            return isMoreOnLeftSide ? Placement.BOTTOM_START : Placement.BOTTOM_END;
        }
        return Placement.BOTTOM_END;
    };
    return new ConfigBuilder()
        .withLocale(config.locale)
        .withFirstDayOfWeek(config.firstDayOfWeek)
        .withTimezone(config.timezone)
        .withMin(config.minDate)
        .withMax(config.maxDate)
        .withTeleportTo(teleportTo)
        .withStyle((_b = config.datePicker) === null || _b === void 0 ? void 0 : _b.style)
        .withPlacement(dynamicPlacement)
        .withListeners({ onChange: dateSelectionCallback })
        .build();
};

const createDateSelectionCallback = (calendarState, config) => {
    let lastEmittedDate = null;
    return (date) => {
        var _a;
        calendarState.setRange(date);
        if (((_a = config.callbacks) === null || _a === void 0 ? void 0 : _a.onSelectedDateUpdate) &&
            date.toString() !== (lastEmittedDate === null || lastEmittedDate === void 0 ? void 0 : lastEmittedDate.toString())) {
            lastEmittedDate = date;
            config.callbacks.onSelectedDateUpdate(date);
        }
    };
};

/**
 * TODO v3: remove this when removing plugin over the config object
 * */
const validatePlugins = (configPlugins, pluginArg) => {
    if (configPlugins && pluginArg) {
        throw new Error('You cannot provide plugins over the config object and as an argument to createCalendar.');
    }
};

const validateConfig = (config) => {
    var _a, _b, _c, _d;
    if (config.selectedDate &&
        !(config.selectedDate instanceof Temporal.PlainDate)) {
        throw new Error('[Schedule-X error]: selectedDate must have the format YYYY-MM-DD');
    }
    if (config.minDate && !(config.minDate instanceof Temporal.PlainDate)) {
        throw new Error('[Schedule-X error]: minDate must be a temporal plain date');
    }
    if (config.maxDate && !(config.maxDate instanceof Temporal.PlainDate)) {
        throw new Error('[Schedule-X error]: maxDate must be a temporal plain date');
    }
    if (typeof config.firstDayOfWeek !== 'undefined' &&
        (config.firstDayOfWeek < 1 || config.firstDayOfWeek > 7)) {
        throw new Error('[Schedule-X error]: firstDayOfWeek must be a number between 1 and 7');
    }
    if (typeof ((_a = config.weekOptions) === null || _a === void 0 ? void 0 : _a.gridHeight) !== 'undefined' &&
        config.weekOptions.gridHeight < 0) {
        throw new Error('[Schedule-X error]: weekOptions.gridHeight must be a positive number');
    }
    if (typeof ((_b = config.weekOptions) === null || _b === void 0 ? void 0 : _b.nDays) !== 'undefined' &&
        (config.weekOptions.nDays < 1 || config.weekOptions.nDays > 7)) {
        throw new Error('[Schedule-X error]: weekOptions.nDays must be a number between 1 and 7');
    }
    if (typeof ((_c = config.weekOptions) === null || _c === void 0 ? void 0 : _c.eventWidth) !== 'undefined' &&
        (config.weekOptions.eventWidth < 1 || config.weekOptions.eventWidth > 100)) {
        throw new Error('[Schedule-X error]: weekOptions.eventWidth must be an integer between 1 and 100');
    }
    if (typeof ((_d = config.monthGridOptions) === null || _d === void 0 ? void 0 : _d.nEventsPerDay) !== 'undefined' &&
        config.monthGridOptions.nEventsPerDay < 0) {
        throw new Error('[Schedule-X error]: monthGridOptions.nEventsPerDay must be a positive number');
    }
    const dayBoundaryPattern = /^\d{2}:00$/;
    if (typeof config.dayBoundaries !== 'undefined') {
        const startFormatIsInvalid = !dayBoundaryPattern.test(config.dayBoundaries.start);
        const endFormatIsInvalid = !dayBoundaryPattern.test(config.dayBoundaries.end);
        if (startFormatIsInvalid || endFormatIsInvalid) {
            throw new Error('[Schedule-X error]: dayBoundaries must be an object with "start"- and "end" properties, each with the format HH:mm');
        }
    }
};

const validateEvents = (events = []) => {
    events === null || events === void 0 ? void 0 : events.forEach((event) => {
        if (!(event.start instanceof Temporal.ZonedDateTime) &&
            !(event.start instanceof Temporal.PlainDate)) {
            throw new Error(`[Schedule-X error]: Event start time needs to be a Temporal.ZonedDateTime or Temporal.PlainDate.`);
        }
        if (!(event.end instanceof Temporal.ZonedDateTime) &&
            !(event.end instanceof Temporal.PlainDate)) {
            throw new Error(`[Schedule-X error]: Event end time needs to be a Temporal.ZonedDateTime or Temporal.PlainDate.`);
        }
        const isIdDecimalNumber = typeof event.id === 'number' && event.id % 1 !== 0;
        if (isIdDecimalNumber) {
            throw new Error(`[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`);
        }
        // only allow non-unicode characters that can be used by document.querySelector: https://developer.mozilla.org/en-US/docs/Web/CSS/ident
        if (typeof event.id === 'string' && !/^[a-zA-Z0-9_-]*$/.test(event.id)) {
            throw new Error(`[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`);
        }
        if (typeof event.id !== 'string' && typeof event.id !== 'number') {
            throw new Error(`[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`);
        }
    });
};

const createCalendarAppSingleton = (config, plugins) => {
    var _a;
    const internalConfig = createInternalConfig(config, plugins);
    const timeUnitsImpl = createTimeUnitsImpl(internalConfig);
    const calendarState = createCalendarState(internalConfig, timeUnitsImpl, config.selectedDate);
    const dateSelectionCallback = createDateSelectionCallback(calendarState, config);
    const datePickerConfig = createDatePickerConfig(config, (date) => dateSelectionCallback(date));
    const datePickerState = createDatePickerState(datePickerConfig, config.selectedDate || ((_a = config.datePicker) === null || _a === void 0 ? void 0 : _a.selectedDate));
    const calendarEvents = createCalendarEventsImpl(config.events || [], config.backgroundEvents || [], internalConfig);
    return new CalendarAppSingletonBuilder()
        .withConfig(internalConfig)
        .withTimeUnitsImpl(timeUnitsImpl)
        .withDatePickerState(datePickerState)
        .withCalendarEvents(calendarEvents)
        .withDatePickerConfig(datePickerConfig)
        .withCalendarState(calendarState)
        .withTranslate(translate(internalConfig.locale, internalConfig.translations))
        .build();
};
const createCalendar = (config, plugins) => {
    validatePlugins(config.plugins, plugins);
    if (config.skipValidation !== true) {
        validateEvents(config.events);
        validateConfig(config);
    }
    return new CalendarApp(createCalendarAppSingleton(config, plugins || config.plugins || []));
};

const createWeekForMonth = (week, day) => {
    week.push({
        date: Temporal.ZonedDateTime.from(day.toString()).toPlainDate(),
        events: {},
        backgroundEvents: [],
    });
    return week;
};
const createMonth = (date, timeUnitsImpl) => {
    const monthWithDates = timeUnitsImpl.getMonthWithTrailingAndLeadingDays(date.year, date.month);
    const month = [];
    for (const week of monthWithDates) {
        month.push(week.reduce(createWeekForMonth, []));
    }
    return month;
};

function MonthGridEvent({ gridRow, calendarEvent, date, isFirstWeek, isLastWeek, }) {
    var _a, _b, _c, _d, _e;
    const $app = hooks.useContext(AppContext);
    const hasOverflowLeft = isFirstWeek &&
        ((_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start) &&
        calendarEvent.start.toString() <
            $app.calendarState.range.value.start.toString();
    const hasOverflowRight = isLastWeek &&
        ((_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.end) &&
        calendarEvent.end.toString() > $app.calendarState.range.value.end.toString();
    const { createDragStartTimeout, setClickedEventIfNotDragging, setClickedEvent, } = useEventInteractions($app);
    const plainDate = Temporal.PlainDate.from(date).toString();
    const hasStartDate = dateFromDateTime(calendarEvent.start.toString()) === plainDate;
    const nDays = calendarEvent._eventFragments[date];
    const eventCSSVariables = {
        borderInlineStart: hasStartDate
            ? `4px solid var(--sx-color-${calendarEvent._color})`
            : undefined,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        // CORRELATION ID: 2 (10px subtracted from width)
        // nDays * 100% for the width of each day + 1px for border - 10 px for horizontal gap between events
        width: `calc(${nDays * 100 + '%'} + ${nDays}px - 10px)`,
    };
    const handleStartDrag = (uiEvent) => {
        var _a;
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        if (!uiEvent.target)
            return;
        if (!$app.config.plugins.dragAndDrop || ((_a = calendarEvent._options) === null || _a === void 0 ? void 0 : _a.disableDND))
            return;
        $app.config.plugins.dragAndDrop.createMonthGridDragHandler(calendarEvent, $app);
    };
    const customComponent = $app.config._customComponentFns.monthGridEvent;
    const customComponentId = hooks.useRef(customComponent
        ? 'custom-month-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined);
    hooks.useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId.current), {
            calendarEvent: calendarEvent._getExternalEvent(),
            hasStartDate,
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, customComponentId.current);
        };
    }, [calendarEvent]);
    const handleOnClick = (e) => {
        e.stopPropagation(); // prevent the click from bubbling up to the day element
        invokeOnEventClickCallback($app, calendarEvent, e);
    };
    const handleOnDoubleClick = (e) => {
        e.stopPropagation(); // prevent the click from bubbling up to the day element
        invokeOnEventDoubleClickCallback($app, calendarEvent, e);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setClickedEvent(e, calendarEvent);
            invokeOnEventClickCallback($app, calendarEvent, e);
            nextTick(() => {
                focusModal($app);
            });
        }
    };
    const classNames = [
        'sx__event',
        'sx__month-grid-event',
        'sx__month-grid-cell',
    ];
    if ((_c = calendarEvent._options) === null || _c === void 0 ? void 0 : _c.additionalClasses) {
        classNames.push(...calendarEvent._options.additionalClasses);
    }
    if (wasEventAddedInLastSecond(calendarEvent))
        classNames.push('is-event-new');
    if (hasOverflowLeft)
        classNames.push('sx__month-grid-event--overflow-left');
    if (hasOverflowRight)
        classNames.push('sx__month-grid-event--overflow-right');
    const hasCustomContent = (_d = calendarEvent._customContent) === null || _d === void 0 ? void 0 : _d.monthGrid;
    return (jsxRuntime.jsxs("div", { draggable: !!$app.config.plugins.dragAndDrop, "data-event-id": calendarEvent.id, "data-ccid": customComponentId.current, onMouseDown: (e) => createDragStartTimeout(handleStartDrag, e), onMouseUp: (e) => setClickedEventIfNotDragging(calendarEvent, e), onTouchStart: (e) => createDragStartTimeout(handleStartDrag, e), onTouchEnd: (e) => setClickedEventIfNotDragging(calendarEvent, e), onClick: handleOnClick, onDblClick: handleOnDoubleClick, onKeyDown: handleKeyDown, className: classNames.join(' '), style: {
            gridRow,
            width: eventCSSVariables.width,
            padding: customComponent ? '0px' : undefined,
            borderInlineStart: customComponent
                ? undefined
                : eventCSSVariables.borderInlineStart,
            color: customComponent ? undefined : eventCSSVariables.color,
            backgroundColor: customComponent
                ? undefined
                : eventCSSVariables.backgroundColor,
        }, tabIndex: 0, role: "button", children: [!customComponent && !hasCustomContent && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [calendarEvent.start instanceof Temporal.ZonedDateTime && (jsxRuntime.jsx("div", { className: "sx__month-grid-event-time", children: timeFn(calendarEvent.start, $app.config.locale.value) })), jsxRuntime.jsx("div", { className: "sx__month-grid-event-title", children: calendarEvent.title })] })), hasCustomContent && (jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                    __html: ((_e = calendarEvent._customContent) === null || _e === void 0 ? void 0 : _e.monthGrid) || '',
                } }))] }));
}

function MonthGridDay({ day, isFirstWeek, isLastWeek }) {
    const $app = hooks.useContext(AppContext);
    const nEventsInDay = Object.values(day.events).filter((event) => typeof event === 'object' || event === DATE_GRID_BLOCKER).length;
    const getEventTranslationSingularOrPlural = (nOfAdditionalEvents) => {
        if (nOfAdditionalEvents === 1)
            return $app.translate('+ 1 event');
        return $app.translate('+ {{n}} events', { n: nOfAdditionalEvents });
    };
    const getAriaLabelSingularOrPlural = (nOfAdditionalEvents) => {
        if (nOfAdditionalEvents === 1) {
            return $app.translate('Link to 1 more event on {{date}}', {
                date: getLocalizedDate$1(day.date, $app.config.locale.value),
            });
        }
        return $app.translate('Link to {{n}} more events on {{date}}', {
            date: getLocalizedDate$1(day.date, $app.config.locale.value),
            n: nEventsInDay - $app.config.monthGridOptions.value.nEventsPerDay,
        });
    };
    const handleClickAdditionalEvents = (e) => {
        e.stopPropagation();
        if ($app.config.callbacks.onClickPlusEvents)
            $app.config.callbacks.onClickPlusEvents(day.date, e);
        if (!$app.config.views.value.find((view) => view.name === InternalViewName.Day))
            return;
        // Timeout to display the ripple effect
        setTimeout(() => {
            $app.datePickerState.selectedDate.value = day.date;
            $app.calendarState.setView(InternalViewName.Day, day.date);
        }, 250);
    };
    const dateClassNames = ['sx__month-grid-day__header-date'];
    const dayDate = day.date;
    if (isToday(dayDate.toZonedDateTime($app.config.timezone.value), $app.config.timezone.value))
        dateClassNames.push('sx__is-today');
    const selectedDateMonth = $app.datePickerState.selectedDate.value.month;
    const dayMonth = day.date.month;
    const baseClasses = [
        'sx__month-grid-day',
        getClassNameForWeekday(dayDate.dayOfWeek),
    ];
    const [wrapperClasses, setWrapperClasses] = hooks.useState(baseClasses);
    hooks.useEffect(() => {
        const classes = [...baseClasses];
        if (dayMonth !== selectedDateMonth)
            classes.push('is-leading-or-trailing');
        if (isSameDay($app.datePickerState.selectedDate.value, day.date))
            classes.push('is-selected');
        setWrapperClasses(classes);
    }, [$app.datePickerState.selectedDate.value]);
    const getNumberOfNonDisplayedEvents = () => {
        return Object.values(day.events)
            .slice($app.config.monthGridOptions.value.nEventsPerDay)
            .filter((event) => event === DATE_GRID_BLOCKER || typeof event === 'object').length;
    };
    const numberOfNonDisplayedEvents = getNumberOfNonDisplayedEvents();
    const dayStartDateTime = Temporal.ZonedDateTime.from({
        year: day.date.year,
        month: day.date.month,
        day: day.date.day,
        hour: 0,
        minute: 0,
        second: 0,
        timeZone: $app.config.timezone.value,
    });
    const dayEndDateTime = Temporal.ZonedDateTime.from({
        year: day.date.year,
        month: day.date.month,
        day: day.date.day,
        hour: 23,
        minute: 59,
        second: 59,
        timeZone: $app.config.timezone.value,
    });
    const fullDayBackgroundEvent = day.backgroundEvents.find((event) => {
        const eventStartWithTime = event.start instanceof Temporal.PlainDate
            ? event.start.toZonedDateTime($app.config.timezone.value)
            : event.start;
        const eventEndWithTime = event.end instanceof Temporal.PlainDate
            ? event.end.toZonedDateTime($app.config.timezone.value).with({
                hour: 23,
                minute: 59,
                second: 59,
            })
            : event.end;
        return (eventStartWithTime.toString() <= dayStartDateTime.toString() &&
            eventEndWithTime.toString() >= dayEndDateTime.toString());
    });
    const handleMouseDown = (e) => {
        const target = e.target;
        if (!target.classList.contains('sx__month-grid-day'))
            return;
        const callback = $app.config.callbacks.onMouseDownMonthGridDate;
        if (callback)
            callback(day.date, e);
    };
    const monthGridDayNameCustomComponent = $app.config._customComponentFns.monthGridDayName;
    const monthGridDayNameCCID = hooks.useState(monthGridDayNameCustomComponent ? randomStringId() : '')[0];
    hooks.useEffect(() => {
        if (!monthGridDayNameCustomComponent)
            return;
        const dayNameEl = document.querySelector(`[data-ccid="${monthGridDayNameCCID}"]`);
        if (!(dayNameEl instanceof HTMLElement)) {
            return;
        }
        monthGridDayNameCustomComponent(dayNameEl, {
            day: toJSDate(day.date.toString()).getDay(),
        });
    }, [day]);
    const monthGridDateCustomComponent = $app.config._customComponentFns.monthGridDate;
    const monthGridDateCCID = hooks.useState(monthGridDateCustomComponent ? randomStringId() : '')[0];
    hooks.useEffect(() => {
        if (!monthGridDateCustomComponent)
            return;
        const dateEl = document.querySelector(`[data-ccid="${monthGridDateCCID}"]`);
        if (!(dateEl instanceof HTMLElement))
            return;
        monthGridDateCustomComponent(dateEl, {
            date: toJSDate(day.date.toString()).getDate(),
            jsDate: toJSDate(day.date.toString()),
        });
    }, [day]);
    return (jsxRuntime.jsxs("div", { className: wrapperClasses.join(' '), "data-date": toDateString$1(day.date), onClick: (e) => $app.config.callbacks.onClickDate &&
            $app.config.callbacks.onClickDate(day.date, e), "aria-label": getLocalizedDate$1(day.date, $app.config.locale.value), onDblClick: (e) => { var _a, _b; return (_b = (_a = $app.config.callbacks).onDoubleClickDate) === null || _b === void 0 ? void 0 : _b.call(_a, day.date, e); }, onMouseDown: handleMouseDown, children: [fullDayBackgroundEvent && (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsx("div", { className: "sx__month-grid-background-event", title: fullDayBackgroundEvent.title, style: {
                        ...fullDayBackgroundEvent.style,
                    } }) })), jsxRuntime.jsxs("div", { className: "sx__month-grid-day__header", children: [isFirstWeek ? (jsxRuntime.jsx(jsxRuntime.Fragment, { children: monthGridDayNameCustomComponent ? (jsxRuntime.jsx("div", { "data-ccid": monthGridDayNameCCID })) : (jsxRuntime.jsx("div", { className: "sx__month-grid-day__header-day-name", children: getDayNameShort(dayDate, $app.config.locale.value) })) })) : null, monthGridDateCCID ? (jsxRuntime.jsx("div", { "data-ccid": monthGridDateCCID })) : (jsxRuntime.jsx("div", { className: dateClassNames.join(' '), children: dayDate.day }))] }), jsxRuntime.jsx("div", { className: "sx__month-grid-day__events", children: Object.values(day.events)
                    .slice(0, $app.config.monthGridOptions.value.nEventsPerDay)
                    .map((event, index) => {
                    if (typeof event !== 'object')
                        return (jsxRuntime.jsx("div", { className: "sx__month-grid-blocker sx__month-grid-cell", style: { gridRow: index + 1 } }));
                    return (jsxRuntime.jsx(MonthGridEvent, { gridRow: index + 1, calendarEvent: event, date: day.date.toString(), isFirstWeek: isFirstWeek, isLastWeek: isLastWeek }));
                }) }), numberOfNonDisplayedEvents > 0 ? (jsxRuntime.jsx("button", { type: "button", className: "sx__button sx__month-grid-day__events-more sx__ripple--wide", "aria-label": getAriaLabelSingularOrPlural(numberOfNonDisplayedEvents), onClick: handleClickAdditionalEvents, children: getEventTranslationSingularOrPlural(numberOfNonDisplayedEvents) })) : null] }));
}

function MonthGridWeek({ week, isFirstWeek, isLastWeek, }) {
    const $app = hooks.useContext(AppContext);
    return (jsxRuntime.jsxs("div", { className: "sx__month-grid-week", children: [$app.config.showWeekNumbers.value && (jsxRuntime.jsx("div", { className: "sx__month-grid-week__week-number", children: getWeekNumber(week[0].date, $app.config.firstDayOfWeek.value) })), week.map((day) => {
                /**
                 * The day component keeps internal state, and needs to be thrown away once the day changes.
                 * */
                return (jsxRuntime.jsx(MonthGridDay, { day: day, isFirstWeek: isFirstWeek, isLastWeek: isLastWeek }, toDateString$1(day.date)));
            })] }));
}

const positionInMonthWeek = (sortedEvents, week) => {
    const weekDates = Object.keys(week).sort();
    const firstDateOfWeek = weekDates[0];
    const lastDateOfWeek = weekDates[weekDates.length - 1];
    const occupiedLevels = new Set();
    for (const event of sortedEvents) {
        const eventOriginalStartDate = dateFromDateTime(event.start.toString());
        const eventOriginalEndDate = dateFromDateTime(event.end.toString());
        const isEventStartInWeek = !!week[eventOriginalStartDate];
        let isEventInWeek = isEventStartInWeek;
        if (!isEventStartInWeek &&
            eventOriginalStartDate < firstDateOfWeek &&
            eventOriginalEndDate >= firstDateOfWeek) {
            isEventInWeek = true;
        }
        if (!isEventInWeek)
            continue;
        const firstDateOfEvent = isEventStartInWeek
            ? eventOriginalStartDate
            : firstDateOfWeek;
        const lastDateOfEvent = eventOriginalEndDate <= lastDateOfWeek
            ? eventOriginalEndDate
            : lastDateOfWeek;
        const eventDays = Object.values(week).filter((day) => {
            const plainDate = Temporal.PlainDate.from(day.date).toString();
            return plainDate >= firstDateOfEvent && plainDate <= lastDateOfEvent;
        });
        let levelInWeekForEvent;
        let testLevel = 0;
        while (levelInWeekForEvent === undefined) {
            const isLevelFree = eventDays.every((day) => {
                return !day.events[testLevel];
            });
            if (isLevelFree) {
                levelInWeekForEvent = testLevel;
                occupiedLevels.add(testLevel);
            }
            else
                testLevel++;
        }
        for (const [eventDayIndex, eventDay] of eventDays.entries()) {
            if (eventDayIndex === 0) {
                event._eventFragments[firstDateOfEvent] = eventDays.length;
                eventDay.events[levelInWeekForEvent] = event;
            }
            else {
                eventDay.events[levelInWeekForEvent] = DATE_GRID_BLOCKER;
            }
        }
    }
    for (const level of Array.from(occupiedLevels)) {
        for (const [, day] of Object.entries(week)) {
            if (!day.events[level]) {
                day.events[level] = undefined;
            }
        }
    }
    return week;
};
const positionInMonth = (month, sortedEvents) => {
    const weeks = [];
    month.forEach((week) => {
        const weekMap = {};
        week.forEach((day) => {
            const plainDate = Temporal.PlainDate.from(day.date);
            weekMap[plainDate.toString()] = day;
        });
        weeks.push(weekMap);
    });
    weeks.forEach((week) => positionInMonthWeek(sortedEvents, week));
    return month;
};

const MonthGridWrapper = ({ $app, id }) => {
    const [month, setMonth] = hooks.useState([]);
    signals.useSignalEffect(() => {
        $app.calendarEvents.list.value.forEach((event) => {
            event._eventFragments = {};
        });
        const newMonth = createMonth(Temporal.PlainDate.from($app.datePickerState.selectedDate.value), $app.timeUnitsImpl);
        newMonth.forEach((week) => {
            week.forEach((day) => {
                const plainDate = Temporal.PlainDate.from(day.date);
                const rangeStartDateTime = Temporal.ZonedDateTime.from({
                    year: plainDate.year,
                    month: plainDate.month,
                    day: plainDate.day,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    timeZone: $app.config.timezone.value,
                });
                const rangeEndDateTime = Temporal.ZonedDateTime.from({
                    year: plainDate.year,
                    month: plainDate.month,
                    day: plainDate.day,
                    hour: 23,
                    minute: 59,
                    second: 59,
                    timeZone: $app.config.timezone.value,
                });
                day.backgroundEvents = filterByRange($app.calendarEvents.backgroundEvents.value, {
                    start: rangeStartDateTime,
                    end: rangeEndDateTime,
                }, $app.config.timezone.value);
            });
        });
        const filteredEvents = $app.calendarEvents.filterPredicate.value
            ? $app.calendarEvents.list.value.filter($app.calendarEvents.filterPredicate.value)
            : $app.calendarEvents.list.value;
        setMonth(positionInMonth(newMonth, filteredEvents.sort(sortEventsForMonthGrid)));
    });
    return (jsxRuntime.jsx(AppContext.Provider, { value: $app, children: jsxRuntime.jsx("div", { id: id, className: "sx__month-grid-wrapper", children: month.map((week, index) => (jsxRuntime.jsx(MonthGridWeek, { week: week, isFirstWeek: index === 0, isLastWeek: index === month.length - 1 }, index))) }) }));
};

const config$2 = {
    name: InternalViewName.MonthGrid,
    label: 'Month',
    setDateRange: setRangeForMonth,
    Component: MonthGridWrapper,
    hasWideScreenCompat: true,
    hasSmallScreenCompat: false,
    backwardForwardFn: addMonths,
    backwardForwardUnits: 1,
};
const viewMonthGrid = createPreactView(config$2);
const createViewMonthGrid = () => createPreactView(config$2);

const createAgendaMonth = (date, timeUnitsImpl) => {
    const monthWithDates = timeUnitsImpl.getMonthWithTrailingAndLeadingDays(date.year, date.month);
    return {
        weeks: monthWithDates.map((week) => {
            return week.map((date) => {
                return {
                    date: Temporal.PlainDate.from(date),
                    events: [],
                };
            });
        }),
    };
};

function MonthAgendaDay({ day, isActive, setActiveDate, }) {
    const $app = hooks.useContext(AppContext);
    const monthSelected = $app.datePickerState.selectedDate.value.month;
    const monthOfDay = day.date.month;
    const dayClasses = [
        'sx__month-agenda-day',
        getClassNameForWeekday(day.date.dayOfWeek),
    ];
    if (isActive)
        dayClasses.push('sx__month-agenda-day--active');
    if (monthOfDay !== monthSelected)
        dayClasses.push('is-leading-or-trailing');
    const handleClick = (e, callback) => {
        setActiveDate(day.date);
        if (!callback)
            return;
        callback(day.date, e);
    };
    const hasFocus = (weekDay) => weekDay.date.toString() ===
        $app.datePickerState.selectedDate.value.toString();
    const handleKeyDown = (event) => {
        const keyMapDaysToAdd = new Map([
            ['ArrowDown', 7],
            ['ArrowUp', -7],
            ['ArrowLeft', -1],
            ['ArrowRight', 1],
        ]);
        $app.datePickerState.selectedDate.value = Temporal.PlainDate.from(addDays($app.datePickerState.selectedDate.value, keyMapDaysToAdd.get(event.key) || 0));
    };
    const isBeforeMinDate = !!($app.config.minDate.value &&
        day.date.toString() < $app.config.minDate.value.toString());
    const isPastMaxDate = !!($app.config.maxDate.value &&
        day.date.toString() > $app.config.maxDate.value.toString());
    return (jsxRuntime.jsxs("button", { type: "button", className: `sx__button ${dayClasses.join(' ')}`, onClick: (e) => handleClick(e, $app.config.callbacks.onClickAgendaDate), onDblClick: (e) => handleClick(e, $app.config.callbacks.onDoubleClickAgendaDate), disabled: isBeforeMinDate || isPastMaxDate, "aria-label": getLocalizedDate$1(day.date, $app.config.locale.value), tabIndex: hasFocus(day) ? 0 : -1, "data-agenda-focus": hasFocus(day) ? 'true' : undefined, onKeyDown: handleKeyDown, children: [jsxRuntime.jsx("div", { children: day.date.day }), jsxRuntime.jsx("div", { className: "sx__month-agenda-day__event-icons", children: day.events.slice(0, 3).map((event) => (jsxRuntime.jsx("div", { style: { backgroundColor: `var(--sx-color-${event._color})` }, className: "sx__month-agenda-day__event-icon" }))) })] }));
}

function MonthAgendaWeek({ week, setActiveDate, activeDate, }) {
    const $app = hooks.useContext(AppContext);
    return (jsxRuntime.jsxs("div", { className: "sx__month-agenda-week", children: [$app.config.showWeekNumbers.value && (jsxRuntime.jsx("div", { className: "sx__month-agenda-week__week-number", children: getWeekNumber(Temporal.PlainDate.from(week[0].date), $app.config.firstDayOfWeek.value) })), week.map((day, index) => (jsxRuntime.jsx(MonthAgendaDay, { setActiveDate: setActiveDate, day: day, isActive: isSameDay(activeDate, day.date) }, index + day.date.toString())))] }));
}

function MonthAgendaDayNames({ week }) {
    const $app = hooks.useContext(AppContext);
    const localizedShortDayNames = getOneLetterOrShortDayNames(week.map((day) => day.date), $app.config.locale.value);
    const classNames = hooks.useMemo(() => {
        const ret = ['sx__month-agenda-day-names'];
        if ($app.config.showWeekNumbers.value) {
            ret.push('sx__has-week-numbers');
        }
        return ret.join(' ');
    }, [$app.config.showWeekNumbers.value]);
    return (jsxRuntime.jsx("div", { className: classNames, children: localizedShortDayNames.map((oneLetterDayName) => (jsxRuntime.jsx("div", { className: "sx__month-agenda-day-name", children: oneLetterDayName }))) }));
}

const getAllEventDates = (startDate, endDate) => {
    let currentDate = startDate;
    const dates = [currentDate];
    while (currentDate < endDate) {
        currentDate = addDays(Temporal.PlainDate.from(currentDate), 1).toString();
        dates.push(currentDate);
    }
    return dates;
};
const placeEventInDay = (allDaysMap) => (event) => {
    getAllEventDates(dateFromDateTime(event.start.toString()), dateFromDateTime(event.end.toString())).forEach((date) => {
        if (allDaysMap[date]) {
            allDaysMap[date].events.push(event);
        }
    });
};
const positionEventsInAgenda = (agendaMonth, eventsSortedByStart) => {
    const allDaysMap = agendaMonth.weeks.reduce((acc, week) => {
        week.forEach((day) => {
            acc[day.date.toString()] = day;
        });
        return acc;
    }, {});
    eventsSortedByStart.forEach(placeEventInDay(allDaysMap));
    return agendaMonth;
};

function MonthAgendaEvent({ calendarEvent }) {
    var _a, _b;
    const $app = hooks.useContext(AppContext);
    const { setClickedEvent } = useEventInteractions($app);
    const eventCSSVariables = {
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        borderInlineStart: `4px solid var(--sx-color-${calendarEvent._color})`,
    };
    const customComponent = $app.config._customComponentFns.monthAgendaEvent;
    const customComponentId = hooks.useRef(customComponent
        ? 'custom-month-agenda-event-' + randomStringId()
        : undefined);
    hooks.useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId.current), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, customComponentId.current);
        };
    }, [calendarEvent]);
    const onClick = (e) => {
        setClickedEvent(e, calendarEvent);
        invokeOnEventClickCallback($app, calendarEvent, e);
    };
    const onDoubleClick = (e) => {
        setClickedEvent(e, calendarEvent);
        invokeOnEventDoubleClickCallback($app, calendarEvent, e);
    };
    const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setClickedEvent(e, calendarEvent);
            invokeOnEventClickCallback($app, calendarEvent, e);
            nextTick(() => {
                focusModal($app);
            });
        }
    };
    const hasCustomContent = (_a = calendarEvent._customContent) === null || _a === void 0 ? void 0 : _a.monthAgenda;
    const classNames = ['sx__event', 'sx__month-agenda-event'];
    if (wasEventAddedInLastSecond(calendarEvent))
        classNames.push('is-event-new');
    return (jsxRuntime.jsxs("div", { className: classNames.join(' '), "data-ccid": customComponentId.current, "data-event-id": calendarEvent.id, style: {
            backgroundColor: customComponent
                ? undefined
                : eventCSSVariables.backgroundColor,
            color: customComponent ? undefined : eventCSSVariables.color,
            borderInlineStart: customComponent
                ? undefined
                : eventCSSVariables.borderInlineStart,
            padding: customComponent ? '0px' : undefined,
        }, onClick: (e) => onClick(e), onDblClick: (e) => onDoubleClick(e), onKeyDown: onKeyDown, tabIndex: 0, role: "button", children: [!customComponent && !hasCustomContent && (jsxRuntime.jsxs(preact.Fragment, { children: [jsxRuntime.jsx("div", { className: "sx__month-agenda-event__title", children: calendarEvent.title }), jsxRuntime.jsxs("div", { className: "sx__month-agenda-event__time sx__month-agenda-event__has-icon", children: [jsxRuntime.jsx(TimeIcon, { strokeColor: `var(--sx-color-on-${calendarEvent._color}-container)` }), jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                                    __html: getTimeStamp(calendarEvent, $app.config.locale.value),
                                } })] })] })), hasCustomContent && (jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                    __html: ((_b = calendarEvent._customContent) === null || _b === void 0 ? void 0 : _b.monthAgenda) || '',
                } }))] }));
}

function MonthAgendaEvents({ events }) {
    const $app = hooks.useContext(AppContext);
    return (jsxRuntime.jsx("div", { className: "sx__month-agenda-events", children: events.length ? (events.map((event) => (jsxRuntime.jsx(MonthAgendaEvent, { calendarEvent: event }, event.id)))) : (jsxRuntime.jsx("div", { className: "sx__month-agenda-events__empty", children: $app.translate('No events') })) }));
}

const MonthAgendaWrapper = ({ $app, id }) => {
    var _a;
    const getMonth = () => {
        const filteredEvents = $app.calendarEvents.filterPredicate.value
            ? $app.calendarEvents.list.value.filter($app.calendarEvents.filterPredicate.value)
            : $app.calendarEvents.list.value;
        return positionEventsInAgenda(createAgendaMonth($app.datePickerState.selectedDate.value.toZonedDateTime($app.config.timezone.value), $app.timeUnitsImpl), filteredEvents.sort(sortEventsByStartAndEnd));
    };
    const [agendaMonth, setAgendaMonth] = hooks.useState(getMonth());
    hooks.useEffect(() => {
        setAgendaMonth(getMonth());
    }, [
        $app.datePickerState.selectedDate.value,
        $app.calendarEvents.list.value,
        $app.calendarEvents.filterPredicate.value,
    ]);
    hooks.useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const mutatedElement = mutation.target;
                if (mutatedElement.dataset.agendaFocus === 'true')
                    mutatedElement.focus();
            });
        });
        const monthViewElement = document.getElementById(id);
        observer.observe(monthViewElement, {
            childList: true,
            subtree: true,
            attributes: true,
        });
        return () => observer.disconnect();
    }, []);
    return (jsxRuntime.jsx(AppContext.Provider, { value: $app, children: jsxRuntime.jsxs("div", { id: id, className: "sx__month-agenda-wrapper", children: [jsxRuntime.jsx(MonthAgendaDayNames, { week: agendaMonth.weeks[0] }), jsxRuntime.jsx("div", { className: "sx__month-agenda-weeks", children: agendaMonth.weeks.map((week, index) => (jsxRuntime.jsx(MonthAgendaWeek, { week: week, setActiveDate: (date) => ($app.datePickerState.selectedDate.value = date), activeDate: $app.datePickerState.selectedDate.value }, index))) }), jsxRuntime.jsx(MonthAgendaEvents, { events: ((_a = agendaMonth.weeks
                        .flat()
                        .find((day) => isSameDay(day.date, $app.datePickerState.selectedDate.value))) === null || _a === void 0 ? void 0 : _a.events) || [] }, $app.datePickerState.selectedDate.value)] }) }));
};

const config$1 = {
    name: InternalViewName.MonthAgenda,
    label: 'Month',
    setDateRange: setRangeForMonth,
    Component: MonthAgendaWrapper,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: false,
    backwardForwardFn: addMonths,
    backwardForwardUnits: 1,
};
const viewMonthAgenda = createPreactView(config$1);
const createViewMonthAgenda = () => createPreactView(config$1);

const scrollOnDateSelection = ($app, wrapperRef) => {
    if (!wrapperRef.current)
        return;
    const selectedDate = $app.datePickerState.selectedDate.value;
    const selectedDayElement = wrapperRef.current.querySelector(`.sx__list-day[data-date="${selectedDate}"]`);
    if (typeof HTMLElement !== 'undefined' &&
        selectedDayElement instanceof HTMLElement) {
        requestAnimationFrame(() => {
            selectedDayElement.scrollIntoView({
                behavior: 'instant',
                block: 'start',
            });
        });
    }
};

/**
 * Checks if there are any infinite recurring events (events with RRULE that has no COUNT or UNTIL)
 */
const hasInfiniteRecurringEvents = (events) => {
    // Only check original events, not copies (recurrences)
    return events.some((event) => {
        var _a;
        // Skip recurrence copies
        if (event.isCopy)
            return false;
        const rrule = (_a = event._getForeignProperties()) === null || _a === void 0 ? void 0 : _a.rrule;
        if (!rrule || typeof rrule !== 'string')
            return false;
        return !rrule.includes('COUNT') && !rrule.includes('UNTIL');
    });
};
/**
 * Performs the actual range expansion for infinite recurring events.
 * This is the shared logic used by both visibility detection methods.
 */
const performRangeExpansion = ({ $app, wrapperRef, lastDateInList, lastRangeExpansionRef, isExpandingRangeRef, scrollPositionBeforeExpansionRef, }) => {
    const currentRange = $app.calendarState.range.value;
    if (!currentRange)
        return;
    const lastDate = Temporal.PlainDate.from(lastDateInList);
    const lastDateZDT = lastDate.toZonedDateTime({
        timeZone: $app.config.timezone.value,
        plainTime: Temporal.PlainTime.from({
            hour: 23,
            minute: 59,
        }),
    });
    const oneYearFromLast = lastDateZDT.add({ years: 1 });
    const rangeEndString = oneYearFromLast.toString();
    // Only expand if we haven't expanded to this date recently
    if (oneYearFromLast.epochNanoseconds > currentRange.end.epochNanoseconds &&
        lastRangeExpansionRef.current !== rangeEndString) {
        // Save scroll position before expanding
        if (wrapperRef.current) {
            scrollPositionBeforeExpansionRef.current = wrapperRef.current.scrollTop;
            isExpandingRangeRef.current = true;
        }
        const extendedRange = {
            start: currentRange.start,
            end: oneYearFromLast,
        };
        lastRangeExpansionRef.current = rangeEndString;
        $app.calendarState.range.value = extendedRange;
    }
};
/**
 * Expands the calendar range if we're at the bottom of the list and have infinite recurring events.
 * This allows the recurrence plugin to generate more occurrences.
 * Uses DOM-based visibility checking (getBoundingClientRect).
 */
const expandInfiniteRecurringEventsIfNeeded = ({ $app, wrapperRef, filteredEvents, lastRangeExpansionRef, isExpandingRangeRef, scrollPositionBeforeExpansionRef, }) => {
    if (!hasInfiniteRecurringEvents(filteredEvents) ||
        filteredEvents.length === 0) {
        return;
    }
    if (!wrapperRef.current)
        return;
    const allDayElements = Array.from(wrapperRef.current.querySelectorAll('.sx__list-day'));
    if (allDayElements.length === 0)
        return;
    // Check if the last day element is visible
    const lastDayElement = allDayElements[allDayElements.length - 1];
    const rect = lastDayElement.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    // If last element is visible (within viewport)
    if (rect.top >= wrapperRect.top &&
        rect.bottom <= wrapperRect.bottom &&
        rect.top < wrapperRect.bottom) {
        const lastDate = lastDayElement.getAttribute('data-date');
        if (lastDate) {
            const allDates = filteredEvents
                .map((e) => dateFromDateTime(e.end.toString()))
                .sort();
            const lastDateInList = allDates[allDates.length - 1];
            // Only expand if the visible last date matches the actual last date in the list
            if (lastDate === lastDateInList) {
                performRangeExpansion({
                    $app,
                    wrapperRef,
                    lastDateInList,
                    lastRangeExpansionRef,
                    isExpandingRangeRef,
                    scrollPositionBeforeExpansionRef,
                });
            }
        }
    }
};
/**
 * Checks if we need to expand infinite recurring events based on visible days in the viewport.
 * Used by IntersectionObserver callback.
 * Uses IntersectionObserver's visibleDates Set for visibility checking.
 */
const checkAndExpandInfiniteRecurringEvents = ({ $app, wrapperRef, filteredEvents, visibleDates, lastRangeExpansionRef, isExpandingRangeRef, scrollPositionBeforeExpansionRef, }) => {
    if (!hasInfiniteRecurringEvents(filteredEvents) || visibleDates.size === 0) {
        return;
    }
    // Get all dates in the list, sorted
    const allDates = filteredEvents
        .map((e) => dateFromDateTime(e.end.toString()))
        .sort();
    if (allDates.length === 0)
        return;
    // Find the last visible date from the sorted list
    const visibleDatesArray = Array.from(visibleDates).sort();
    const lastVisibleDate = visibleDatesArray[visibleDatesArray.length - 1];
    const lastDateInList = allDates[allDates.length - 1];
    // If the last visible date is one of the last two dates in the entire list, expand
    const lastTwoDates = allDates.slice(-2);
    if (lastTwoDates.includes(lastVisibleDate)) {
        performRangeExpansion({
            $app,
            wrapperRef,
            lastDateInList,
            lastRangeExpansionRef,
            isExpandingRangeRef,
            scrollPositionBeforeExpansionRef,
        });
    }
};

const EventTimes = ({ isFirstDay, isLastDay, isMultiDay, endLocaleString, startLocaleString, }) => {
    if (!isMultiDay) {
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { className: "sx__list-event-start-time", children: startLocaleString }), endLocaleString && (jsxRuntime.jsx("div", { className: "sx__list-event-end-time", children: endLocaleString }))] }));
    }
    if (isFirstDay) {
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { className: "sx__list-event-start-time", children: startLocaleString }), jsxRuntime.jsx("div", { className: "sx__list-event-arrow", children: "\u2192" })] }));
    }
    if (isLastDay) {
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { className: "sx__list-event-arrow", children: "\u2190" }), jsxRuntime.jsx("div", { className: "sx__list-event-end-time", children: endLocaleString })] }));
    }
    return jsxRuntime.jsx("div", { className: "sx__list-event-arrow", children: "\u2194" });
};

function ListEvent({ calendarEvent, eventInstanceInfo, onEventClick, onEventDoubleClick, onEventKeyDown, }) {
    var _a, _b, _c;
    const $app = hooks.useContext(AppContext);
    const customListEventComponent = $app.config._customComponentFns.listEvent;
    const customComponentId = hooks.useRef(customListEventComponent
        ? 'custom-list-event-' + randomStringId()
        : undefined);
    hooks.useEffect(() => {
        if (!customListEventComponent)
            return;
        customListEventComponent(getElementByCCID(customComponentId.current), {
            calendarEvent: calendarEvent._getExternalEvent(),
            eventInstanceInfo,
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, customComponentId.current);
        };
    }, [calendarEvent, eventInstanceInfo]);
    const hasCustomContent = (_a = calendarEvent._customContent) === null || _a === void 0 ? void 0 : _a.listEvent;
    const classNames = ['sx__event', 'sx__list-event'];
    if ((_b = calendarEvent._options) === null || _b === void 0 ? void 0 : _b.additionalClasses) {
        classNames.push(...calendarEvent._options.additionalClasses);
    }
    return (jsxRuntime.jsxs("div", { className: classNames.join(' '), "data-ccid": customComponentId.current, "data-event-id": calendarEvent.id, style: {
            padding: customListEventComponent ? '0px' : undefined,
        }, onClick: (e) => onEventClick(e, calendarEvent), onDblClick: (e) => onEventDoubleClick(e, calendarEvent), onKeyDown: (e) => onEventKeyDown(e, calendarEvent), tabIndex: 0, role: "button", children: [!customListEventComponent && !hasCustomContent && (jsxRuntime.jsxs(preact.Fragment, { children: [jsxRuntime.jsx("div", { className: `sx__list-event-color-line`, style: {
                            backgroundColor: `var(--sx-color-${calendarEvent._color})`,
                        } }), jsxRuntime.jsxs("div", { className: "sx__list-event-content", children: [jsxRuntime.jsx("div", { className: "sx__list-event-title", children: calendarEvent.title }), jsxRuntime.jsx("div", { className: "sx__list-event-times", children: jsxRuntime.jsx(EventTimes, { ...eventInstanceInfo }) })] })] })), hasCustomContent && (jsxRuntime.jsx("div", { dangerouslySetInnerHTML: {
                    __html: ((_c = calendarEvent._customContent) === null || _c === void 0 ? void 0 : _c.listEvent) || '',
                } }))] }));
}

const getEventInstanceInfo = (event, forDayOf, locale, timeZone) => {
    const eventStartDate = dateFromDateTime(event.start.toString());
    const eventEndDate = dateFromDateTime(event.end.toString());
    const isFirstDay = eventStartDate === forDayOf;
    const isLastDay = eventEndDate === forDayOf;
    const isMultiDay = eventStartDate !== eventEndDate;
    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: locale === 'en-US',
    };
    const startZDT = Temporal.ZonedDateTime.from({
        year: event.start.year,
        month: event.start.month,
        day: event.start.day,
        hour: event.start instanceof Temporal.ZonedDateTime ? event.start.hour : 0,
        minute: event.start instanceof Temporal.ZonedDateTime ? event.start.minute : 0,
        timeZone,
    });
    const endZDT = Temporal.ZonedDateTime.from({
        year: event.end.year,
        month: event.end.month,
        day: event.end.day,
        hour: event.end instanceof Temporal.ZonedDateTime ? event.end.hour : 0,
        minute: event.end instanceof Temporal.ZonedDateTime ? event.end.minute : 0,
        timeZone,
    });
    const startLocaleString = startZDT.toLocaleString(locale, timeOptions);
    const endLocaleString = event.end
        ? endZDT.toLocaleString(locale, timeOptions)
        : undefined;
    return {
        isFirstDay,
        isLastDay,
        isMultiDay,
        startLocaleString,
        endLocaleString,
        forDayOf,
    };
};
const ListWrapper = ({ $app, id, }) => {
    const [daysWithEvents, setDaysWithEvents] = hooks.useState([]);
    const wrapperRef = hooks.useRef(null);
    const { setClickedEvent } = useEventInteractions($app);
    const listDayHeaderCustomComponentFn = $app.config._customComponentFns.listDayHeader;
    const listNoEventsCustomComponentFn = $app.config._customComponentFns.listNoEvents;
    const listNoEventsCCID = hooks.useRef(listNoEventsCustomComponentFn
        ? 'custom-list-no-events-' + randomStringId()
        : undefined);
    const dayHeaderCCIDsRef = hooks.useRef({});
    /**
     * "hack" for preventing the onScrollDayIntoView callback from being called just after events have changed
     * any ideas for how to improve this are welcome
     * */
    const blockOnScrollDayIntoViewCallback = hooks.useRef(false);
    const blockTimeoutRef = hooks.useRef(null);
    const lastRangeExpansionRef = hooks.useRef(null);
    const isExpandingRangeRef = hooks.useRef(false);
    const scrollPositionBeforeExpansionRef = hooks.useRef(null);
    const minDate = $app.config.minDate.value
        ? dateFromDateTime($app.config.minDate.value.toString())
        : null;
    const maxDate = $app.config.maxDate.value
        ? dateFromDateTime($app.config.maxDate.value.toString())
        : null;
    const updateDaysWithEvents = (events) => {
        const daysWithEventsMap = events.reduce((acc, event) => {
            const startDate = dateFromDateTime(event.start.toString());
            const endDate = dateFromDateTime(event.end.toString());
            let currentDate = startDate;
            while (currentDate <= endDate) {
                if (!acc[currentDate]) {
                    acc[currentDate] = [];
                }
                acc[currentDate].push(event);
                currentDate = addDays(Temporal.PlainDate.from(currentDate), 1).toString();
            }
            return acc;
        }, {});
        const sortedDays = Object.entries(daysWithEventsMap)
            .map(([date, events]) => ({
            date,
            events: events.sort((a, b) => a.start.toString().localeCompare(b.start.toString())),
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
        setDaysWithEvents(sortedDays);
        if (blockTimeoutRef.current) {
            clearTimeout(blockTimeoutRef.current);
        }
        blockTimeoutRef.current = setTimeout(() => {
            blockOnScrollDayIntoViewCallback.current = false;
            blockTimeoutRef.current = null;
        }, 100);
    };
    hooks.useEffect(() => {
        const filteredEvents = $app.calendarEvents.list.value.filter((event) => {
            const startDate = dateFromDateTime(event.start.toString());
            const endDate = dateFromDateTime(event.end.toString());
            if (minDate && endDate < minDate)
                return false;
            if (maxDate && startDate > maxDate)
                return false;
            return true;
        });
        /**
         * onScrollDayIntoView can never be allowed to be called as a side effect of events changing.
         * Otherwise, implementers will have to write custom logic to prevent infinite recursion.
         *
         * Open to any ideas for how to improve this and make do without a timeout.
         * */
        blockOnScrollDayIntoViewCallback.current = true;
        updateDaysWithEvents(filteredEvents);
        // After updating days, check if we need to expand infinite recurring events
        // This handles the case where the user is already at the bottom
        nextTick(() => {
            expandInfiniteRecurringEventsIfNeeded({
                $app,
                wrapperRef,
                filteredEvents,
                lastRangeExpansionRef,
                isExpandingRangeRef,
                scrollPositionBeforeExpansionRef,
            });
        });
    }, [$app.calendarEvents.list.value]);
    hooks.useEffect(() => {
        const handleScroll = () => {
            if (blockTimeoutRef.current) {
                clearTimeout(blockTimeoutRef.current);
                blockTimeoutRef.current = null;
                blockOnScrollDayIntoViewCallback.current = false;
            }
        };
        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.addEventListener('scroll', handleScroll);
            return () => {
                wrapper.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);
    const [interSectionObserver, setIntersectionObserver] = hooks.useState(null);
    hooks.useEffect(() => {
        if (!wrapperRef.current)
            return;
        // Disconnect existing observer to set up a new one with updated elements
        if (interSectionObserver) {
            interSectionObserver.disconnect();
        }
        const _observer = new IntersectionObserver((entries) => {
            // Track which days are currently visible
            const visibleDates = new Set();
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    const date = entry.target.getAttribute('data-date');
                    if (date) {
                        visibleDates.add(date);
                    }
                }
            });
            // Call onScrollDayIntoView callback if provided
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    const date = entry.target.getAttribute('data-date');
                    if (date &&
                        $app.config.callbacks.onScrollDayIntoView &&
                        !blockOnScrollDayIntoViewCallback.current) {
                        $app.config.callbacks.onScrollDayIntoView(Temporal.PlainDate.from(date));
                    }
                }
            });
            // If we have infinite recurring events, check if we need to expand
            if (visibleDates.size > 0 && daysWithEvents.length > 0) {
                checkAndExpandInfiniteRecurringEvents({
                    $app,
                    wrapperRef,
                    filteredEvents: $app.calendarEvents.list.value.filter((event) => {
                        const startDate = dateFromDateTime(event.start.toString());
                        const endDate = dateFromDateTime(event.end.toString());
                        if (minDate && endDate < minDate)
                            return false;
                        if (maxDate && startDate > maxDate)
                            return false;
                        return true;
                    }),
                    visibleDates,
                    lastRangeExpansionRef,
                    isExpandingRangeRef,
                    scrollPositionBeforeExpansionRef,
                });
            }
        }, {
            root: wrapperRef.current,
            rootMargin: '0px',
            threshold: [0, 0.1, 1.0],
        });
        const dayElements = wrapperRef.current.querySelectorAll('.sx__list-day');
        dayElements.forEach((dayElement) => {
            _observer.observe(dayElement);
        });
        setIntersectionObserver(_observer);
        return () => {
            _observer.disconnect();
        };
    }, [daysWithEvents]);
    hooks.useEffect(() => {
        // If we're expanding the range for infinite recurring events, restore scroll position
        // instead of scrolling to selected date
        if (isExpandingRangeRef.current &&
            scrollPositionBeforeExpansionRef.current !== null) {
            nextTick(() => {
                if (wrapperRef.current &&
                    scrollPositionBeforeExpansionRef.current !== null) {
                    wrapperRef.current.scrollTop =
                        scrollPositionBeforeExpansionRef.current;
                    scrollPositionBeforeExpansionRef.current = null;
                    isExpandingRangeRef.current = false;
                }
            });
        }
        else {
            scrollOnDateSelection($app, wrapperRef);
        }
    }, [daysWithEvents, $app.datePickerState.selectedDate.value]);
    const handleEventClick = (e, event) => {
        setClickedEvent(e, event);
        invokeOnEventClickCallback($app, event, e);
    };
    const handleEventDoubleClick = (e, event) => {
        setClickedEvent(e, event);
        invokeOnEventDoubleClickCallback($app, event, e);
    };
    hooks.useEffect(() => {
        if (!listNoEventsCustomComponentFn || daysWithEvents.length > 0)
            return;
        const el = getElementByCCID(listNoEventsCCID.current);
        if (!el)
            return;
        listNoEventsCustomComponentFn(el, {
            $app,
        });
        return () => {
            var _a, _b;
            (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, listNoEventsCCID.current);
        };
    }, [daysWithEvents.length, listNoEventsCustomComponentFn]);
    hooks.useEffect(() => {
        if (!listDayHeaderCustomComponentFn)
            return;
        daysWithEvents.forEach((day) => {
            const ccid = dayHeaderCCIDsRef.current[day.date];
            if (!ccid)
                return;
            const el = getElementByCCID(ccid);
            if (!el)
                return;
            listDayHeaderCustomComponentFn(el, {
                date: day.date,
            });
        });
        return () => {
            Object.values(dayHeaderCCIDsRef.current).forEach((ccid) => {
                var _a, _b;
                (_b = (_a = $app.config)._destroyCustomComponentInstance) === null || _b === void 0 ? void 0 : _b.call(_a, ccid);
            });
        };
    }, [daysWithEvents, listDayHeaderCustomComponentFn]);
    const handleEventKeyDown = (e, event) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setClickedEvent(e, event);
            invokeOnEventClickCallback($app, event, e);
            nextTick(() => {
                focusModal($app);
            });
        }
    };
    return (jsxRuntime.jsx(AppContext.Provider, { value: $app, children: jsxRuntime.jsx("div", { id: id, className: "sx__list-wrapper", ref: wrapperRef, children: daysWithEvents.length === 0 ? (listNoEventsCustomComponentFn ? (jsxRuntime.jsx("div", { "data-ccid": listNoEventsCCID.current })) : (jsxRuntime.jsx("div", { className: "sx__list-no-events", children: $app.translate('No events') }))) : (daysWithEvents.map((day) => {
                if (!dayHeaderCCIDsRef.current[day.date]) {
                    dayHeaderCCIDsRef.current[day.date] =
                        `custom-list-day-header-${randomStringId()}`;
                }
                const dayHeaderCCID = dayHeaderCCIDsRef.current[day.date];
                return (jsxRuntime.jsxs("div", { className: "sx__list-day", "data-date": day.date, children: [listDayHeaderCustomComponentFn ? (jsxRuntime.jsx("div", { "data-ccid": dayHeaderCCID })) : (jsxRuntime.jsx("div", { className: "sx__list-day-header", children: jsxRuntime.jsx("div", { className: "sx__list-day-date", children: toJSDate(day.date).toLocaleDateString($app.config.locale.value, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) }) })), jsxRuntime.jsx("div", { className: "sx__list-day-events", children: day.events.map((event) => (jsxRuntime.jsx(ListEvent, { calendarEvent: event, dayDate: day.date, eventInstanceInfo: getEventInstanceInfo(event, day.date, $app.config.locale.value, $app.config.timezone.value), onEventClick: handleEventClick, onEventDoubleClick: handleEventDoubleClick, onEventKeyDown: handleEventKeyDown }, event.id))) }), jsxRuntime.jsx("div", { className: "sx__list-day-margin" })] }, day.date));
            })) }) }));
};

const config = {
    name: InternalViewName.List,
    label: 'List',
    setDateRange: setRangeForMonth,
    Component: ListWrapper,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: true,
    backwardForwardFn: addMonths,
    backwardForwardUnits: 1,
};
const viewList = createPreactView(config);
const createViewList = () => createPreactView(config);

exports.AppContext = AppContext;
exports.CalendarApp = CalendarApp;
exports.DateGridDay = DateGridDay;
exports.TimeAxis = TimeAxis;
exports.TimeGridDay = TimeGridDay;
exports.createCalendar = createCalendar;
exports.createPreactView = createPreactView;
exports.createViewDay = createViewDay;
exports.createViewList = createViewList;
exports.createViewMonthAgenda = createViewMonthAgenda;
exports.createViewMonthGrid = createViewMonthGrid;
exports.createViewWeek = createViewWeek;
exports.externalEventToInternal = externalEventToInternal;
exports.setRangeForDay = setRangeForDay;
exports.setRangeForMonth = setRangeForMonth;
exports.setRangeForWeek = setRangeForWeek;
exports.sortEventsForWeekView = sortEventsForWeekView;
exports.toDateString = toDateString$1;
exports.toDateTimeString = toDateTimeString;
exports.toJSDate = toJSDate;
exports.toTimeString = toTimeString;
exports.viewDay = viewDay;
exports.viewList = viewList;
exports.viewMonthAgenda = viewMonthAgenda;
exports.viewMonthGrid = viewMonthGrid;
exports.viewWeek = viewWeek;
