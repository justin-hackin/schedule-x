import { createContext, render, createElement } from 'preact';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';
import { useContext, useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { signal, effect } from '@preact/signals';

const AppContext = createContext({});

const DateFormats = {
    DATE_STRING: /^\d{4}-\d{2}-\d{2}$/,
    TIME_STRING: /^\d{2}:\d{2}$/,
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
const getDayNameShort = (date, locale) => date.toLocaleString(locale, { weekday: 'short' });
const getDayNamesShort = (week, locale) => {
    return week.map((date) => getDayNameShort(date, locale));
};
const getOneLetterOrShortDayNames = (week, locale) => {
    if (['zh-cn', 'ca-es'].includes(locale.toLowerCase())) {
        return getDayNamesShort(week, locale);
    }
    return getOneLetterDayNames(week, locale);
};

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3c!-- Uploaded to: SVG Repo%2c www.svgrepo.com%2c Generator: SVG Repo Mixer Tools --%3e%3csvg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M6 9L12 15L18 9' stroke='%23DED8E1' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

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
    const $app = useContext(AppContext);
    const getLocalizedDate = (dateString) => {
        if (dateString === '')
            return $app.translate('MM/DD/YYYY');
        return toLocalizedDateString(toJSDate(dateString), $app.config.locale.value);
    };
    useEffect(() => {
        $app.datePickerState.inputDisplayedValue.value = getLocalizedDate($app.datePickerState.selectedDate.value);
    }, [$app.datePickerState.selectedDate.value, $app.config.locale.value]);
    const [wrapperClasses, setWrapperClasses] = useState([]);
    const setInputElement = () => {
        const inputWrapperEl = document.getElementById(inputWrapperId);
        $app.datePickerState.inputWrapperElement.value =
            inputWrapperEl instanceof HTMLDivElement ? inputWrapperEl : undefined;
    };
    useEffect(() => {
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
            $app.datePickerState.inputDisplayedValue.value = event.target.value;
            $app.datePickerState.close();
        }
        catch (e) {
            // nothing to do
        }
    };
    useEffect(() => {
        const inputElement = document.getElementById(datePickerInputId);
        if (inputElement === null)
            return;
        inputElement.addEventListener('change', handleInputValue); // Preact onChange triggers on every input
        return () => inputElement.removeEventListener('change', handleInputValue);
    });
    const handleClick = (event) => {
        handleInputValue(event);
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
    return (jsx(Fragment, { children: jsxs("div", { className: wrapperClasses.join(' '), id: inputWrapperId, children: [jsx("label", { for: datePickerInputId, id: datePickerLabelId, className: "sx__date-input-label", children: $app.config.label || $app.translate('Date') }), jsx("input", { id: datePickerInputId, tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, name: $app.config.name || 'date', "aria-describedby": datePickerLabelId, value: $app.datePickerState.inputDisplayedValue.value, "data-testid": "date-picker-input", className: "sx__date-input", onClick: handleClick, onKeyUp: handleKeyUp, type: "text" }), jsx("button", { tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, "aria-label": $app.translate('Choose Date'), onKeyDown: handleButtonKeyDown, onClick: () => $app.datePickerState.open(), className: "sx__date-input-chevron-wrapper", children: jsx("img", { className: "sx__date-input-chevron", src: img, alt: "" }) })] }) }));
}

var DatePickerView;
(function (DatePickerView) {
    DatePickerView["MONTH_DAYS"] = "month-days";
    DatePickerView["YEARS"] = "years";
})(DatePickerView || (DatePickerView = {}));

const YEARS_VIEW = 'years-view';
const MONTH_VIEW = 'months-view';
const DATE_PICKER_WEEK = 'date-picker-week';

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
    return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`;
};
const toTimeString = (date) => {
    return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`;
};
const toDateTimeString = (date) => {
    return `${toDateString$1(date)} ${toTimeString(date)}`;
};

const addMonths = (to, nMonths) => {
    const { year, month, date, hours, minutes } = toIntegers(to);
    const isDateTimeString = hours !== undefined && minutes !== undefined;
    const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
    let expectedMonth = (jsDate.getMonth() + nMonths) % 12;
    if (expectedMonth < 0)
        expectedMonth += 12;
    jsDate.setMonth(jsDate.getMonth() + nMonths);
    // handle date overflow and underflow
    if (jsDate.getMonth() > expectedMonth) {
        jsDate.setDate(0);
    }
    else if (jsDate.getMonth() < expectedMonth) {
        jsDate.setMonth(jsDate.getMonth() + 1);
        jsDate.setDate(0);
    }
    if (isDateTimeString) {
        return toDateTimeString(jsDate);
    }
    return toDateString$1(jsDate);
};
const addDays = (to, nDays) => {
    const { year, month, date, hours, minutes } = toIntegers(to);
    const isDateTimeString = hours !== undefined && minutes !== undefined;
    const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
    jsDate.setDate(jsDate.getDate() + nDays);
    if (isDateTimeString) {
        return toDateTimeString(jsDate);
    }
    return toDateString$1(jsDate);
};

const setDateOfMonth = (dateString, date) => {
    dateString = dateString.slice(0, 8) + doubleDigit(date) + dateString.slice(10);
    return dateString;
};
const getFirstDayOPreviousMonth = (dateString) => {
    dateString = addMonths(dateString, -1);
    return setDateOfMonth(dateString, 1);
};
const getFirstDayOfNextMonth = (dateString) => {
    dateString = addMonths(dateString, 1);
    return setDateOfMonth(dateString, 1);
};

function Chevron({ direction, onClick, buttonText, disabled = false, }) {
    const handleKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent))
            onClick();
    };
    return (jsx("button", { disabled: disabled, className: "sx__chevron-wrapper sx__ripple", onMouseUp: onClick, onKeyDown: handleKeyDown, tabIndex: 0, children: jsx("i", { className: `sx__chevron sx__chevron--${direction}`, children: buttonText }) }));
}

function MonthViewHeader({ setYearsView }) {
    const $app = useContext(AppContext);
    const dateStringToLocalizedMonthName = (selectedDate) => {
        const selectedDateJS = toJSDate(selectedDate);
        return toLocalizedMonth(selectedDateJS, $app.config.locale.value);
    };
    const getYearFrom = (datePickerDate) => {
        return toIntegers(datePickerDate).year;
    };
    const [selectedDateMonthName, setSelectedDateMonthName] = useState(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
    const [datePickerYear, setDatePickerYear] = useState(getYearFrom($app.datePickerState.datePickerDate.value));
    const setPreviousMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOPreviousMonth($app.datePickerState.datePickerDate.value);
    };
    const setNextMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOfNextMonth($app.datePickerState.datePickerDate.value);
    };
    useEffect(() => {
        setSelectedDateMonthName(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
        setDatePickerYear(getYearFrom($app.datePickerState.datePickerDate.value));
    }, [$app.datePickerState.datePickerDate.value]);
    const handleOpenYearsView = (e) => {
        e.stopPropagation();
        setYearsView();
    };
    return (jsx(Fragment, { children: jsxs("header", { className: "sx__date-picker__month-view-header", children: [jsx(Chevron, { direction: 'previous', onClick: () => setPreviousMonth(), buttonText: $app.translate('Previous month') }), jsx("button", { className: "sx__date-picker__month-view-header__month-year", onClick: (event) => handleOpenYearsView(event), children: selectedDateMonthName + ' ' + datePickerYear }), jsx(Chevron, { direction: 'next', onClick: () => setNextMonth(), buttonText: $app.translate('Next month') })] }) }));
}

function DayNames() {
    const $app = useContext(AppContext);
    const aWeek = $app.timeUnitsImpl.getWeekFor(toJSDate($app.datePickerState.datePickerDate.value));
    const dayNames = getOneLetterOrShortDayNames(aWeek, $app.config.locale.value);
    return (jsx("div", { className: "sx__date-picker__day-names", children: dayNames.map((dayName) => (jsx("span", { "data-testid": "day-name", className: "sx__date-picker__day-name", children: dayName }))) }));
}

const isToday = (date) => {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear());
};
const isSameMonth = (date1, date2) => {
    return (date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
};

var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["SUNDAY"] = 0] = "SUNDAY";
    WeekDay[WeekDay["MONDAY"] = 1] = "MONDAY";
    WeekDay[WeekDay["TUESDAY"] = 2] = "TUESDAY";
    WeekDay[WeekDay["WEDNESDAY"] = 3] = "WEDNESDAY";
    WeekDay[WeekDay["THURSDAY"] = 4] = "THURSDAY";
    WeekDay[WeekDay["FRIDAY"] = 5] = "FRIDAY";
    WeekDay[WeekDay["SATURDAY"] = 6] = "SATURDAY";
})(WeekDay || (WeekDay = {}));

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_FIRST_DAY_OF_WEEK = WeekDay.MONDAY;

const dateFn = (dateTimeString, locale) => {
    const { year, month, date } = toIntegers(dateTimeString);
    return new Date(year, month, date).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
const getLocalizedDate = dateFn;

function MonthViewWeek({ week }) {
    const $app = useContext(AppContext);
    const weekDays = week.map((day) => {
        const classes = ['sx__date-picker__day'];
        if (isToday(day))
            classes.push('sx__date-picker__day--today');
        if (toDateString$1(day) === $app.datePickerState.selectedDate.value)
            classes.push('sx__date-picker__day--selected');
        if (!isSameMonth(day, toJSDate($app.datePickerState.datePickerDate.value)))
            classes.push('is-leading-or-trailing');
        return {
            day,
            classes,
        };
    });
    const isDateSelectable = (date) => {
        const dateString = toDateString$1(date);
        return dateString >= $app.config.min && dateString <= $app.config.max;
    };
    const selectDate = (date) => {
        $app.datePickerState.selectedDate.value = toDateString$1(date);
        $app.datePickerState.close();
    };
    const hasFocus = (weekDay) => toDateString$1(weekDay.day) === $app.datePickerState.datePickerDate.value;
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
    return (jsx(Fragment, { children: jsx("div", { "data-testid": DATE_PICKER_WEEK, className: "sx__date-picker__week", children: weekDays.map((weekDay) => (jsx("button", { tabIndex: hasFocus(weekDay) ? 0 : -1, disabled: !isDateSelectable(weekDay.day), "aria-label": getLocalizedDate($app.datePickerState.datePickerDate.value, $app.config.locale.value), className: weekDay.classes.join(' '), "data-focus": hasFocus(weekDay) ? 'true' : undefined, onClick: () => selectDate(weekDay.day), onKeyDown: handleKeyDown, children: weekDay.day.getDate() }))) }) }));
}

function MonthView({ seatYearsView }) {
    const elementId = randomStringId();
    const $app = useContext(AppContext);
    const [month, setMonth] = useState([]);
    const renderMonth = () => {
        const newDatePickerDate = toJSDate($app.datePickerState.datePickerDate.value);
        setMonth($app.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(newDatePickerDate.getFullYear(), newDatePickerDate.getMonth()));
    };
    useEffect(() => {
        renderMonth();
    }, [$app.datePickerState.datePickerDate.value]);
    useEffect(() => {
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
    return (jsx(Fragment, { children: jsxs("div", { id: elementId, "data-testid": MONTH_VIEW, className: "sx__date-picker__month-view", children: [jsx(MonthViewHeader, { setYearsView: seatYearsView }), jsx(DayNames, {}), month.map((week) => (jsx(MonthViewWeek, { week: week })))] }) }));
}

function YearsViewAccordion({ year, setYearAndMonth, isExpanded, expand, }) {
    const $app = useContext(AppContext);
    const yearWithDates = $app.timeUnitsImpl.getMonthsFor(year);
    const handleClickOnMonth = (event, month) => {
        event.stopPropagation();
        setYearAndMonth(year, month.getMonth());
    };
    return (jsx(Fragment, { children: jsxs("li", { className: isExpanded ? 'sx__is-expanded' : '', children: [jsx("button", { className: "sx__date-picker__years-accordion__expand-button sx__ripple--wide", onClick: () => expand(year), children: year }), isExpanded && (jsx("div", { className: "sx__date-picker__years-view-accordion__panel", children: yearWithDates.map((month) => (jsx("button", { className: "sx__date-picker__years-view-accordion__month", onClick: (event) => handleClickOnMonth(event, month), children: toLocalizedMonth(month, $app.config.locale.value) }))) }))] }) }));
}

function YearsView({ setMonthView }) {
    const $app = useContext(AppContext);
    const minYear = toJSDate($app.config.min).getFullYear();
    const maxYear = toJSDate($app.config.max).getFullYear();
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const { year: selectedYear } = toIntegers($app.datePickerState.selectedDate.value);
    const [expandedYear, setExpandedYear] = useState(selectedYear);
    const setNewDatePickerDate = (year, month) => {
        $app.datePickerState.datePickerDate.value = toDateString$1(new Date(year, month, 1));
        setMonthView();
    };
    useEffect(() => {
        var _a;
        const initiallyExpandedYear = (_a = document
            .querySelector('.sx__date-picker__years-view')) === null || _a === void 0 ? void 0 : _a.querySelector('.sx__is-expanded');
        if (!initiallyExpandedYear)
            return;
        initiallyExpandedYear.scrollIntoView({
            block: 'center',
        });
    }, []);
    return (jsx(Fragment, { children: jsx("ul", { className: "sx__date-picker__years-view", "data-testid": YEARS_VIEW, children: years.map((year) => (jsx(YearsViewAccordion, { year: year, setYearAndMonth: (year, month) => setNewDatePickerDate(year, month), isExpanded: expandedYear === year, expand: (year) => setExpandedYear(year) }))) }) }));
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
function AppPopup() {
    const $app = useContext(AppContext);
    const [datePickerView, setDatePickerView] = useState(DatePickerView.MONTH_DAYS);
    const basePopupClasses = [POPUP_CLASS_NAME, $app.config.placement];
    const [classList, setClassList] = useState(basePopupClasses);
    useEffect(() => {
        setClassList([
            ...basePopupClasses,
            $app.datePickerState.isDark.value ? 'is-dark' : '',
        ]);
    }, [$app.datePickerState.isDark.value]);
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
    useEffect(() => {
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
        return {
            top: $app.config.placement.includes('bottom')
                ? inputRect.height + inputRect.y + 1 // 1px border
                : inputRect.y - remSize - popupHeight, // subtract remsize to leave room for label text
            left: $app.config.placement.includes('start')
                ? inputRect.x
                : inputRect.x + inputRect.width - popupWidth,
            width: popupWidth,
            position: 'fixed',
        };
    };
    const [fixedPositionStyle, setFixedPositionStyle] = useState(getFixedPositionStyles());
    useEffect(() => {
        const inputWrapper = $app.datePickerState.inputWrapperElement.value;
        if (inputWrapper === undefined)
            return;
        const scrollableParents = getScrollableParents(inputWrapper);
        const scrollListener = () => setFixedPositionStyle(getFixedPositionStyles());
        scrollableParents.forEach((parent) => parent.addEventListener('scroll', scrollListener));
        return () => scrollableParents.forEach((parent) => parent.removeEventListener('scroll', scrollListener));
    }, []);
    return (jsx(Fragment, { children: jsx("div", { style: $app.config.teleportTo ? fixedPositionStyle : undefined, "data-testid": "date-picker-popup", className: classList.join(' '), children: datePickerView === DatePickerView.MONTH_DAYS ? (jsx(MonthView, { seatYearsView: () => setDatePickerView(DatePickerView.YEARS) })) : (jsx(YearsView, { setMonthView: () => setDatePickerView(DatePickerView.MONTH_DAYS) })) }) }));
}

function AppWrapper({ $app }) {
    const initialClassList = ['sx__date-picker-wrapper'];
    const [classList, setClassList] = useState(initialClassList);
    useEffect(() => {
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
    let appPopupJSX = jsx(AppPopup, {});
    if ($app.config.teleportTo)
        appPopupJSX = createPortal(appPopupJSX, $app.config.teleportTo);
    return (jsx(Fragment, { children: jsx("div", { className: classList.join(' '), children: jsxs(AppContext.Provider, { value: $app, children: [jsx(AppInput, {}), $app.datePickerState.isOpen.value && appPopupJSX] }) }) }));
}

class DatePickerApp {
    constructor($app) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
    }
    render(el) {
        render(createElement(AppWrapper, {
            $app: this.$app,
        }), el);
    }
    get value() {
        return this.$app.datePickerState.selectedDate.value;
    }
    set value(value) {
        this.$app.datePickerState.selectedDate.value = value;
    }
    get disabled() {
        return this.$app.datePickerState.isDisabled.value;
    }
    set disabled(value) {
        this.$app.datePickerState.isDisabled.value = value;
    }
    setTheme(theme) {
        this.$app.datePickerState.isDark.value = theme === 'dark';
    }
    getTheme() {
        return this.$app.datePickerState.isDark.value ? 'dark' : 'light';
    }
}

var Month;
(function (Month) {
    Month[Month["JANUARY"] = 0] = "JANUARY";
    Month[Month["FEBRUARY"] = 1] = "FEBRUARY";
    Month[Month["MARCH"] = 2] = "MARCH";
    Month[Month["APRIL"] = 3] = "APRIL";
    Month[Month["MAY"] = 4] = "MAY";
    Month[Month["JUNE"] = 5] = "JUNE";
    Month[Month["JULY"] = 6] = "JULY";
    Month[Month["AUGUST"] = 7] = "AUGUST";
    Month[Month["SEPTEMBER"] = 8] = "SEPTEMBER";
    Month[Month["OCTOBER"] = 9] = "OCTOBER";
    Month[Month["NOVEMBER"] = 10] = "NOVEMBER";
    Month[Month["DECEMBER"] = 11] = "DECEMBER";
})(Month || (Month = {}));

class NoYearZeroError extends Error {
    constructor() {
        super('Year zero does not exist in the Gregorian calendar.');
    }
}

class ExtendedDateImpl extends Date {
    constructor(yearArg, monthArg, dateArg) {
        super(yearArg, monthArg, dateArg);
        if (yearArg === 0)
            throw new NoYearZeroError();
        this.setFullYear(yearArg); // Overwrite the behavior of JS-Date, whose constructor does not allow years 0-99
    }
    get year() {
        return this.getFullYear();
    }
    get month() {
        return this.getMonth();
    }
    get date() {
        return this.getDate();
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
    getMonthWithTrailingAndLeadingDays(year, month) {
        if (year === 0)
            throw new NoYearZeroError();
        const firstDateOfMonth = new Date(year, month, 1);
        const monthWithDates = [this.getWeekFor(firstDateOfMonth)];
        let isInMonth = true;
        let first = monthWithDates[0][0]; // first day of first week of month
        while (isInMonth) {
            const newFirstDayOfWeek = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 7);
            if (newFirstDayOfWeek.getMonth() === month) {
                monthWithDates.push(this.getWeekFor(newFirstDayOfWeek));
                first = newFirstDayOfWeek;
            }
            else {
                isInMonth = false;
            }
        }
        return monthWithDates;
    }
    getWeekFor(date) {
        const week = [this.getFirstDateOfWeek(date)];
        while (week.length < 7) {
            const lastDateOfWeek = week[week.length - 1];
            const nextDateOfWeek = new Date(lastDateOfWeek);
            nextDateOfWeek.setDate(lastDateOfWeek.getDate() + 1);
            week.push(nextDateOfWeek);
        }
        return week;
    }
    getMonthsFor(year) {
        return Object.values(Month)
            .filter((month) => !isNaN(Number(month)))
            .map((month) => new ExtendedDateImpl(year, Number(month), 1));
    }
    getFirstDateOfWeek(date) {
        const dateIsNthDayOfWeek = date.getDay() - this.firstDayOfWeek;
        const firstDateOfWeek = date;
        if (dateIsNthDayOfWeek === 0) {
            return firstDateOfWeek;
        }
        else if (dateIsNthDayOfWeek > 0) {
            firstDateOfWeek.setDate(date.getDate() - dateIsNthDayOfWeek);
        }
        else {
            firstDateOfWeek.setDate(date.getDate() - (7 + dateIsNthDayOfWeek));
        }
        return firstDateOfWeek;
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
};
const dateFormatLocalizedRules = new Map([
    ['en-US', formatRules.slashMDY],
    ['en-GB', formatRules.slashDMY],
    ['zh-CN', formatRules.slashYMD],
    ['de-DE', formatRules.periodDMY],
    ['sv-SE', formatRules.dashYMD],
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

const createDatePickerState = (config, selectedDateParam) => {
    var _a;
    const currentDayDateString = toDateString$1(new Date());
    const initialSelectedDate = typeof selectedDateParam === 'string'
        ? selectedDateParam
        : currentDayDateString;
    const isOpen = signal(false);
    const isDisabled = signal(config.disabled || false);
    const datePickerView = signal(DatePickerView.MONTH_DAYS);
    const selectedDate = signal(initialSelectedDate);
    const datePickerDate = signal(initialSelectedDate || currentDayDateString);
    const isDark = signal(((_a = config.style) === null || _a === void 0 ? void 0 : _a.dark) || false);
    const inputDisplayedValue = signal(selectedDateParam || '');
    const lastValidDisplayedValue = signal(selectedDateParam || '');
    effect(() => {
        try {
            const newValue = toDateString(inputDisplayedValue.value, config.locale.value);
            if (newValue < config.min || newValue > config.max) {
                inputDisplayedValue.value = lastValidDisplayedValue.value;
                return;
            }
            selectedDate.value = newValue;
            datePickerDate.value = newValue;
            lastValidDisplayedValue.value = inputDisplayedValue.value;
        }
        catch (e) {
            // nothing to do
        }
    });
    let wasInitialized = false;
    const handleOnChange = (selectedDate) => {
        if (!wasInitialized)
            return (wasInitialized = true);
        config.listeners.onChange(selectedDate);
    };
    effect(() => {
        var _a;
        if ((_a = config.listeners) === null || _a === void 0 ? void 0 : _a.onChange)
            handleOnChange(selectedDate.value);
    });
    return {
        inputWrapperElement: signal(undefined),
        isOpen,
        isDisabled,
        datePickerView,
        selectedDate,
        datePickerDate,
        inputDisplayedValue,
        isDark,
        open: () => (isOpen.value = true),
        close: () => (isOpen.value = false),
        toggle: () => (isOpen.value = !isOpen.value),
        setView: (view) => (datePickerView.value = view),
    };
};

class DatePickerAppSingletonImpl {
    constructor(datePickerState, config, timeUnitsImpl, translate) {
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

var Placement;
(function (Placement) {
    Placement["TOP_START"] = "top-start";
    Placement["TOP_END"] = "top-end";
    Placement["BOTTOM_START"] = "bottom-start";
    Placement["BOTTOM_END"] = "bottom-end";
})(Placement || (Placement = {}));

class ConfigImpl {
    constructor(locale = DEFAULT_LOCALE, firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK, min = toDateString$1(new Date(1970, 0, 1)), max = toDateString$1(new Date(new Date().getFullYear() + 1, 11, 31)), placement = Placement.BOTTOM_START, listeners = {}, style = {}, teleportTo, label, name, disabled) {
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
        this.locale = signal(locale);
        this.firstDayOfWeek = signal(firstDayOfWeek);
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
    }
    build() {
        return new ConfigImpl(this.locale, this.firstDayOfWeek, this.min, this.max, this.placement, this.listeners, this.style, this.teleportTo, this.label, this.name, this.disabled);
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
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
}

const datePickerDeDE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'TT.MM.JJJJ',
    'Next month': 'Nächster Monat',
    'Previous month': 'Vorheriger Monat',
    'Choose Date': 'Datum auswählen',
    'Select View': 'Ansicht auswählen',
};

const calendarDeDE = {
    Today: 'Heute',
    Month: 'Monat',
    Week: 'Woche',
    Day: 'Tag',
    events: 'Ereignisse',
    event: 'Ereignis',
    'No events': 'Keine Ereignisse',
    'Next period': 'Nächster Zeitraum',
    'Previous period': 'Vorheriger Zeitraum',
    to: 'bis', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Ganztägige und mehrtägige Ereignisse',
    'Link to {{n}} more events on {{date}}': 'Link zu {{n}} weiteren Ereignissen am {{date}}',
    'Link to 1 more event on {{date}}': 'Link zu 1 weiteren Ereignis am {{date}}',
};

const deDE = {
    ...datePickerDeDE,
    ...calendarDeDE,
};

const datePickerEnUS = {
    Date: 'Date',
    'MM/DD/YYYY': 'MM/DD/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
    'Select View': 'Select View',
};

const calendarEnUS = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    events: 'events',
    event: 'event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
    'Link to {{n}} more events on {{date}}': 'Link to {{n}} more events on {{date}}',
    'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
};

const enUS = {
    ...datePickerEnUS,
    ...calendarEnUS,
};

const datePickerItIT = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mese successivo',
    'Previous month': 'Mese precedente',
    'Choose Date': 'Scegli la data',
    'Select View': 'Seleziona la vista',
};

const calendarItIT = {
    Today: 'Oggi',
    Month: 'Mese',
    Week: 'Settimana',
    Day: 'Giorno',
    events: 'eventi',
    event: 'evento',
    'No events': 'Nessun evento',
    'Next period': 'Periodo successivo',
    'Previous period': 'Periodo precedente',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Eventi della giornata e plurigiornalieri',
    'Link to {{n}} more events on {{date}}': 'Link a {{n}} eventi in più il {{date}}',
    'Link to 1 more event on {{date}}': 'Link a 1 evento in più il {{date}}',
};

const itIT = {
    ...datePickerItIT,
    ...calendarItIT,
};

const datePickerEnGB = {
    Date: 'Date',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
    'Select View': 'Select View',
};

const calendarEnGB = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    events: 'events',
    event: 'event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
    'Link to {{n}} more events on {{date}}': 'Link to {{n}} more events on {{date}}',
    'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
};

const enGB = {
    ...datePickerEnGB,
    ...calendarEnGB,
};

const datePickerSvSE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Nästa månad',
    'Previous month': 'Föregående månad',
    'Choose Date': 'Välj datum',
    'Select View': 'Välj vy',
};

const calendarSvSE = {
    Today: 'Idag',
    Month: 'Månad',
    Week: 'Vecka',
    Day: 'Dag',
    events: 'händelser',
    event: 'händelse',
    'No events': 'Inga händelser',
    'Next period': 'Nästa period',
    'Previous period': 'Föregående period',
    to: 'till', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldags- och flerdagshändelser',
    'Link to {{n}} more events on {{date}}': 'Länk till {{n}} fler händelser den {{date}}',
    'Link to 1 more event on {{date}}': 'Länk till 1 händelse till den {{date}}',
};

const svSE = {
    ...datePickerSvSE,
    ...calendarSvSE,
};

const datePickerZhCN = {
    Date: '日期',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '下个月',
    'Previous month': '上个月',
    'Choose Date': '选择日期',
    'Select View': '选择视图',
};

const calendarZhCN = {
    Today: '今天',
    Month: '月',
    Week: '周',
    Day: '日',
    events: '场活动',
    event: '活动',
    'No events': '没有活动',
    'Next period': '下一段时间',
    'Previous period': '上一段时间',
    to: '至', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '全天和多天活动',
    'Link to {{n}} more events on {{date}}': '链接到{{date}}上的{{n}}个更多活动',
    'Link to 1 more event on {{date}}': '链接到{{date}}上的1个更多活动',
};

const zhCN = {
    ...datePickerZhCN,
    ...calendarZhCN,
};

const datePickerJaJP = {
    Date: '日付',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '次の月',
    'Previous month': '前の月',
    'Choose Date': '日付を選択',
    'Select View': 'ビューを選択',
};

const calendarJaJP = {
    Today: '今日',
    Month: '月',
    Week: '週',
    Day: '日',
    events: 'イベント',
    event: 'イベント',
    'No events': 'イベントなし',
    'Next period': '次の期間',
    'Previous period': '前の期間',
    to: 'から', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '終日および複数日イベント',
    'Link to {{n}} more events on {{date}}': '{{date}} に{{n}}件のイベントへのリンク',
    'Link to 1 more event on {{date}}': '{{date}} に1件のイベントへのリンク',
};

const jaJP = {
    ...datePickerJaJP,
    ...calendarJaJP,
};

const datePickerRuRU = {
    Date: 'Дата',
    'MM/DD/YYYY': 'ММ/ДД/ГГГГ',
    'Next month': 'Следующий месяц',
    'Previous month': 'Прошлый месяц',
    'Choose Date': 'Выберите дату',
    'Select View': 'Выберите вид',
};

const calendarRuRU = {
    Today: 'Сегодня',
    Month: 'Месяц',
    Week: 'Неделя',
    Day: 'День',
    events: 'события',
    event: 'событие',
    'No events': 'Нет событий',
    'Next period': 'Следующий период',
    'Previous period': 'Прошлый период',
    to: 'по', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'События на целый день и несколько дней подряд',
    'Link to {{n}} more events on {{date}}': 'Ссылка на {{n}} дополнительных событий на {{date}}',
    'Link to 1 more event on {{date}}': 'Ссылка на 1 дополнительное событие на {{date}}',
};

const ruRU = {
    ...datePickerRuRU,
    ...calendarRuRU,
};

const datePickerKoKR = {
    Date: '일자',
    'MM/DD/YYYY': '년/월/일',
    'Next month': '다음 달',
    'Previous month': '이전 달',
    'Choose Date': '날짜 선택',
    'Select View': '보기 선택',
};

const calendarKoKR = {
    Today: '오늘',
    Month: '월',
    Week: '주',
    Day: '일',
    events: '일정들',
    event: '일정',
    'No events': '일정 없음',
    'Next period': '다음',
    'Previous period': '이전',
    to: '부터', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '종일 및 복수일 일정',
    'Link to {{n}} more events on {{date}}': '{{date}}에 {{n}}개 이상의 이벤트로 이동',
    'Link to 1 more event on {{date}}': '{{date}}에 1개 이상의 이벤트로 이동',
};

const koKR = {
    ...datePickerKoKR,
    ...calendarKoKR,
};

const datePickerFrFR = {
    Date: 'Date',
    'MM/DD/YYYY': 'JJ/MM/AAAA',
    'Next month': 'Mois suivant',
    'Previous month': 'Mois précédent',
    'Choose Date': 'Choisir une date',
    'Select View': 'Choisir la vue',
};

const calendarFrFR = {
    Today: "Aujourd'hui",
    Month: 'Mois',
    Week: 'Semaine',
    Day: 'Jour',
    events: 'événements',
    event: 'événement',
    'No events': 'Aucun événement',
    'Next period': 'Période suivante',
    'Previous period': 'Période précédente',
    to: 'à', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': "Événements d'une ou plusieurs journées",
    'Link to {{n}} more events on {{date}}': 'Lien vers {{n}} autres événements le {{date}}',
    'Link to 1 more event on {{date}}': 'Lien vers 1 autre événement le {{date}}',
};

const frFR = {
    ...datePickerFrFR,
    ...calendarFrFR,
};

const datePickerDaDK = {
    Date: 'Dato',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Næste måned',
    'Previous month': 'Foregående måned',
    'Choose Date': 'Vælg dato',
    'Select View': 'Vælg visning',
};

const calendarDaDK = {
    Today: 'I dag',
    Month: 'Måned',
    Week: 'Uge',
    Day: 'Dag',
    events: 'begivenheder',
    event: 'begivenhed',
    'No events': 'Ingen begivenheder',
    'Next period': 'Næste periode',
    'Previous period': 'Forgående periode',
    to: 'til', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldagsbegivenheder og flerdagsbegivenheder',
    'Link to {{n}} more events on {{date}}': 'Link til {{n}} flere begivenheder den {{date}}',
    'Link to 1 more event on {{date}}': 'Link til 1 mere begivenhed den {{date}}',
};

const daDK = {
    ...datePickerDaDK,
    ...calendarDaDK,
};

const datePickerPlPL = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Następny miesiąc',
    'Previous month': 'Poprzedni miesiąc',
    'Choose Date': 'Wybiewrz datę',
    'Select View': 'Wybierz widok',
};

const calendarPlPL = {
    Today: 'Dzisiaj',
    Month: 'Miesiąc',
    Week: 'Tydzień',
    Day: 'Dzień',
    events: 'wydarzenia',
    event: 'wydarzenie',
    'No events': 'Brak wydarzeń',
    'Next period': 'Następny okres',
    'Previous period': 'Poprzedni okres',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Wydarzenia całodniowe i wielodniowe',
    'Link to {{n}} more events on {{date}}': 'Link do {{n}} kolejnych wydarzeń w dniu {{date}}',
    'Link to 1 more event on {{date}}': 'Link do 1 kolejnego wydarzenia w dniu {{date}}',
};

const plPL = {
    ...datePickerPlPL,
    ...calendarPlPL,
};

const datePickerEsES = {
    Date: 'Fecha',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Siguiente mes',
    'Previous month': 'Mes anterior',
    'Choose Date': 'Seleccione una fecha',
    'Select View': 'Seleccione una vista',
};

const calendarEsES = {
    Today: 'Hoy',
    Month: 'Mes',
    Week: 'Semana',
    Day: 'Día',
    events: 'eventos',
    event: 'evento',
    'No events': 'Sin eventos',
    'Next period': 'Siguiente período',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Día completo y eventos de múltiples días',
    'Link to {{n}} more events on {{date}}': 'Enlace a {{n}} eventos más el {{date}}',
    'Link to 1 more event on {{date}}': 'Enlace a 1 evento más el {{date}}',
};

const esES = {
    ...datePickerEsES,
    ...calendarEsES,
};

const calendarNlNL = {
    Today: 'Vandaag',
    Month: 'Maand',
    Week: 'Week',
    Day: 'Dag',
    events: 'gebeurtenissen',
    event: 'gebeurtenis',
    'No events': 'Geen gebeurtenissen',
    'Next period': 'Volgende periode',
    'Previous period': 'Vorige periode',
    to: 'tot', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Evenementen van een hele dag en meerdere dagen',
    'Link to {{n}} more events on {{date}}': 'Link naar {{n}} meer evenementen op {{date}}',
    'Link to 1 more event on {{date}}': 'Link naar 1 meer evenement op {{date}}',
};

const datePickerNlNL = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD-MM-JJJJ',
    'Next month': 'Vorige maand',
    'Previous month': 'Volgende maand',
    'Choose Date': 'Datum kiezen',
    'Select View': 'Weergave kiezen',
};

const nlNL = {
    ...datePickerNlNL,
    ...calendarNlNL,
};

const datePickerPtBR = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mês seguinte',
    'Previous month': 'Mês anterior',
    'Choose Date': 'Escolha uma data',
    'Select View': 'Selecione uma visualização',
};

const calendarPtBR = {
    Today: 'Hoje',
    Month: 'Mês',
    Week: 'Semana',
    Day: 'Dia',
    events: 'eventos',
    event: 'evento',
    'No events': 'Sem eventos',
    'Next period': 'Período seguinte',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Dia inteiro e eventos de vários dias',
    'Link to {{n}} more events on {{date}}': 'Link para mais {{n}} eventos em {{date}}',
    'Link to 1 more event on {{date}}': 'Link para mais 1 evento em {{date}}',
};

const ptBR = {
    ...datePickerPtBR,
    ...calendarPtBR,
};

const datePickerSkSK = {
    Date: 'Dátum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Ďalší mesiac',
    'Previous month': 'Predchádzajúci mesiac',
    'Choose Date': 'Vyberte dátum',
    'Select View': 'Vyberte zobrazenie',
};

const calendarSkSK = {
    Today: 'Dnes',
    Month: 'Mesiac',
    Week: 'Týždeň',
    Day: 'Deň',
    events: 'udalosti',
    event: 'udalosť',
    'No events': 'Žiadne udalosti',
    'Next period': 'Ďalšie obdobie',
    'Previous period': 'Predchádzajúce obdobie',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodenné a viacdňové udalosti',
    'Link to {{n}} more events on {{date}}': 'Odkaz na {{n}} ďalších udalostí dňa {{date}}',
    'Link to 1 more event on {{date}}': 'Odkaz na 1 ďalšiu udalosť dňa {{date}}',
};

const skSK = {
    ...datePickerSkSK,
    ...calendarSkSK,
};

const datePickerMkMK = {
    Date: 'Датум',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Следен месец',
    'Previous month': 'Претходен месец',
    'Choose Date': 'Избери Датум',
    'Select View': 'Избери Преглед',
};

const calendarMkMK = {
    Today: 'Денес',
    Month: 'Месец',
    Week: 'Недела',
    Day: 'Ден',
    events: 'настани',
    event: 'настан',
    'No events': 'Нема настани',
    'Next period': 'Следен период',
    'Previous period': 'Претходен период',
    to: 'до', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Целодневни и повеќедневни настани',
    'Link to {{n}} more events on {{date}}': 'Линк до {{n}} повеќе настани на {{date}}',
    'Link to 1 more event on {{date}}': 'Линк до 1 повеќе настан на {{date}}',
};

const mkMK = {
    ...datePickerMkMK,
    ...calendarMkMK,
};

const datePickerTrTR = {
    Date: 'Tarih',
    'MM/DD/YYYY': 'GG/AA/YYYY',
    'Next month': 'Sonraki ay',
    'Previous month': 'Önceki ay',
    'Choose Date': 'Tarih Seç',
    'Select View': 'Görünüm Seç',
};

const calendarTrTR = {
    Today: 'Bugün',
    Month: 'Aylık',
    Week: 'Haftalık',
    Day: 'Günlük',
    events: 'etkinlikler',
    event: 'etkinlik',
    'No events': 'Etkinlik yok',
    'Next period': 'Sonraki dönem',
    'Previous period': 'Önceki dönem',
    to: 'dan', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Tüm gün ve çoklu gün etkinlikleri',
    'Link to {{n}} more events on {{date}}': '{{date}} tarihinde {{n}} etkinliğe bağlantı',
    'Link to 1 more event on {{date}}': '{{date}} tarihinde 1 etkinliğe bağlantı',
};

const trTR = {
    ...datePickerTrTR,
    ...calendarTrTR,
};

const datePickerKyKG = {
    Date: 'Датасы',
    'MM/DD/YYYY': 'АА/КК/ЖЖЖЖ',
    'Next month': 'Кийинки ай',
    'Previous month': 'Өткөн ай',
    'Choose Date': 'Күндү тандаңыз',
    'Select View': 'Көрүнүштү тандаңыз',
};

const calendarKyKG = {
    Today: 'Бүгүн',
    Month: 'Ай',
    Week: 'Апта',
    Day: 'Күн',
    events: 'Окуялар',
    event: 'Окуя',
    'No events': 'Окуя жок',
    'Next period': 'Кийинки мезгил',
    'Previous period': 'Өткөн мезгил',
    to: 'чейин', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Күн бою жана бир нече күн катары менен болгон окуялар',
    'Link to {{n}} more events on {{date}}': '{{date}} күнүндө {{n}} окуяга байланыш',
    'Link to 1 more event on {{date}}': '{{date}} күнүндө 1 окуяга байланыш',
};

const kyKG = {
    ...datePickerKyKG,
    ...calendarKyKG,
};

const datePickerIdID = {
    Date: 'Tanggal',
    'MM/DD/YYYY': 'DD.MM.YYYY',
    'Next month': 'Bulan depan',
    'Previous month': 'Bulan sebelumnya',
    'Choose Date': 'Pilih tanggal',
    'Select View': 'Pilih tampilan',
};

const calendarIdID = {
    Today: 'Hari Ini',
    Month: 'Bulan',
    Week: 'Minggu',
    Day: 'Hari',
    events: 'Acara',
    event: 'Acara',
    'No events': 'Tidak ada acara',
    'Next period': 'Periode selanjutnya',
    'Previous period': 'Periode sebelumnya',
    to: 'sampai', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Sepanjang hari dan acara beberapa hari ',
    'Link to {{n}} more events on {{date}}': 'Tautan ke {{n}} acara lainnya pada {{date}}',
    'Link to 1 more event on {{date}}': 'Tautan ke 1 acara lainnya pada {{date}}',
};

const idID = {
    ...datePickerIdID,
    ...calendarIdID,
};

const datePickerCsCZ = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Další měsíc',
    'Previous month': 'Předchozí měsíc',
    'Choose Date': 'Vyberte datum',
    'Select View': 'Vyberte zobrazení',
};

const calendarCsCZ = {
    Today: 'Dnes',
    Month: 'Měsíc',
    Week: 'Týden',
    Day: 'Den',
    events: 'události',
    event: 'událost',
    'No events': 'Žádné události',
    'Next period': 'Příští období',
    'Previous period': 'Předchozí období',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodenní a vícedenní události',
    'Link to {{n}} more events on {{date}}': 'Odkaz na {{n}} dalších událostí dne {{date}}',
    'Link to 1 more event on {{date}}': 'Odkaz na 1 další událost dne {{date}}',
};

const csCZ = {
    ...datePickerCsCZ,
    ...calendarCsCZ,
};

const datePickerEtEE = {
    Date: 'Kuupäev',
    'MM/DD/YYYY': 'PP.KK.AAAA',
    'Next month': 'Järgmine kuu',
    'Previous month': 'Eelmine kuu',
    'Choose Date': 'Vali kuupäev',
    'Select View': 'Vali vaade',
};

const calendarEtEE = {
    Today: 'Täna',
    Month: 'Kuu',
    Week: 'Nädal',
    Day: 'Päev',
    events: 'sündmused',
    event: 'sündmus',
    'No events': 'Pole sündmusi',
    'Next period': 'Järgmine periood',
    'Previous period': 'Eelmine periood',
    to: 'kuni',
    'Full day- and multiple day events': 'Täispäeva- ja mitmepäevasündmused',
    'Link to {{n}} more events on {{date}}': 'Link {{n}} rohkematele sündmustele kuupäeval {{date}}',
    'Link to 1 more event on {{date}}': 'Link ühele lisasündmusele kuupäeval {{date}}',
};

const etEE = {
    ...datePickerEtEE,
    ...calendarEtEE,
};

const datePickerUkUA = {
    Date: 'Дата',
    'MM/DD/YYYY': 'ММ/ДД/РРРР',
    'Next month': 'Наступний місяць',
    'Previous month': 'Минулий місяць',
    'Choose Date': 'Виберіть дату',
    'Select View': 'Виберіть вигляд',
};

const calendarUkUA = {
    Today: 'Сьогодні',
    Month: 'Місяць',
    Week: 'Тиждень',
    Day: 'День',
    events: 'події',
    event: 'подія',
    'No events': 'Немає подій',
    'Next period': 'Наступний період',
    'Previous period': 'Минулий період',
    to: 'по', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Події на цілий день і кілька днів поспіль',
    'Link to {{n}} more events on {{date}}': 'Посилання на {{n}} додаткові події на {{date}}',
    'Link to 1 more event on {{date}}': 'Посилання на 1 додаткову подію на {{date}}',
};

const ukUA = {
    ...datePickerUkUA,
    ...calendarUkUA,
};

const datePickerSrRs = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Sledeći mesec',
    'Previous month': 'Prethodni mesec',
    'Choose Date': 'Izaberite datum',
    'Select View': 'Odaberite pregled',
};

const calendarSrRs = {
    Today: 'Danas',
    Month: 'Mesec',
    Week: 'Nedelja',
    Day: 'Dan',
    events: 'Događaji',
    event: 'Događaj',
    'No events': 'Nema događaja',
    'Next period': 'Naredni period',
    'Previous period': 'Prethodni period',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodnevni i višednevni događaji',
    'Link to {{n}} more events on {{date}}': 'Link do još {{n}} događaja na {{date}}',
    'Link to 1 more event on {{date}}': 'Link do jednog događaja na {{date}}',
};

const srRs = {
    ...datePickerSrRs,
    ...calendarSrRs,
};

class InvalidLocaleError extends Error {
    constructor(locale) {
        super(`Invalid locale: ${locale}`);
    }
}

const translate = (locale, languages) => (key, translationVariables) => {
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale.value))
        throw new InvalidLocaleError(locale.value);
    const deHyphenatedLocale = locale.value.replace('-', '');
    const language = languages[deHyphenatedLocale];
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

const datePickerCaES = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Següent mes',
    'Previous month': 'Mes anterior',
    'Choose Date': 'Selecciona una data',
    'Select View': 'Selecciona una vista',
};

const calendarCaES = {
    Today: 'Avui',
    Month: 'Mes',
    Week: 'Setmana',
    Day: 'Dia',
    events: 'Esdeveniments',
    event: 'Esdeveniment',
    'No events': 'Sense esdeveniments',
    'Next period': 'Següent període',
    'Previous period': 'Període anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Esdeveniments de dia complet i de múltiples dies',
    'Link to {{n}} more events on {{date}}': 'Enllaç a {{n}} esdeveniments més el {{date}}',
    'Link to 1 more event on {{date}}': 'Enllaç a 1 esdeveniment més el {{date}}',
};

const caES = {
    ...datePickerCaES,
    ...calendarCaES,
};

const translations = {
    deDE,
    enUS,
    itIT,
    enGB,
    svSE,
    zhCN,
    jaJP,
    ruRU,
    koKR,
    frFR,
    daDK,
    mkMK,
    plPL,
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
    srRs,
};

const createAppSingleton = (config = {}) => {
    const configInternal = new ConfigBuilder()
        .withFirstDayOfWeek(config.firstDayOfWeek)
        .withLocale(config.locale)
        .withMin(config.min)
        .withMax(config.max)
        .withPlacement(config.placement)
        .withListeners(config.listeners)
        .withStyle(config.style)
        .withTeleportTo(config.teleportTo)
        .withLabel(config.label)
        .withName(config.name)
        .withDisabled(config.disabled)
        .build();
    const timeUnitsImpl = new TimeUnitsBuilder()
        .withConfig(configInternal)
        .build();
    return new DatePickerAppSingletonBuilder()
        .withConfig(configInternal)
        .withDatePickerState(createDatePickerState(configInternal, config.selectedDate))
        .withTimeUnitsImpl(timeUnitsImpl)
        .withTranslate(translate(configInternal.locale, translations))
        .build();
};
const createDatePicker = (config) => {
    const $app = createAppSingleton(config);
    return new DatePickerApp($app);
};
const createDatePickerInternal = ($app) => {
    return new DatePickerApp($app);
};

export { createDatePicker, createDatePickerInternal };
