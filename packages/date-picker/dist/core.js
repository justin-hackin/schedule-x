import { createContext, render, createElement } from 'preact';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';
import { useContext, useState, useEffect, useMemo } from 'preact/hooks';
import { useRef, createPortal } from 'preact/compat';
import { signal, effect } from '@preact/signals';

const AppContext = createContext({});

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
    const $app = useContext(AppContext);
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
            $app.datePickerState.handleInput(event.target.value);
            $app.datePickerState.close();
        }
        catch (e) {
            console.log('Error setting input value:' + e);
        }
    };
    useEffect(() => {
        const inputElement = typeof document !== 'undefined' &&
            document.getElementById(datePickerInputId);
        if (typeof HTMLElement === 'undefined' ||
            !(inputElement instanceof HTMLElement))
            return;
        inputElement.addEventListener('change', handleInputValue); // Preact onChange triggers on every input
        return () => inputElement.removeEventListener('change', handleInputValue);
    });
    useEffect(() => {
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
    return (jsx(Fragment, { children: jsxs("div", { className: wrapperClasses.join(' '), id: inputWrapperId, children: [jsx("label", { for: datePickerInputId, id: datePickerLabelId, className: "sx__date-input-label", children: $app.config.label || $app.translate('Date') }), jsx("input", { id: datePickerInputId, tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, name: $app.config.name || 'date', "aria-describedby": datePickerLabelId, value: $app.datePickerState.inputDisplayedValue.value, "data-testid": "date-picker-input", className: "sx__date-input", onClick: handleClick, onKeyUp: handleKeyUp, type: "text" }), jsx("button", { type: "button", tabIndex: $app.datePickerState.isDisabled.value ? -1 : 0, "aria-label": $app.translate('Choose Date'), onKeyDown: handleButtonKeyDown, onClick: () => $app.datePickerState.open(), className: "sx__button sx__date-input-chevron-wrapper", children: jsx("img", { className: "sx__date-input-chevron", src: img, alt: "" }) })] }) }));
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
    return (jsx("button", { type: "button", disabled: disabled, className: "sx__button sx__chevron-wrapper sx__ripple", onMouseUp: onClick, onKeyDown: handleKeyDown, tabIndex: 0, children: jsx("i", { className: `sx__chevron sx__chevron--${direction}`, children: buttonText }) }));
}

function MonthViewHeader({ setYearsView }) {
    const $app = useContext(AppContext);
    const dateStringToLocalizedMonthName = (selectedDate) => {
        return toLocalizedMonth(selectedDate, $app.config.locale.value);
    };
    const getYearFrom = (datePickerDate) => {
        return datePickerDate.year;
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
    return (jsx(Fragment, { children: jsxs("header", { className: "sx__date-picker__month-view-header", children: [jsx(Chevron, { direction: 'previous', onClick: () => setPreviousMonth(), buttonText: $app.translate('Previous month') }), jsx("button", { type: "button", className: "sx__button sx__date-picker__month-view-header__month-year", onClick: (event) => handleOpenYearsView(event), children: selectedDateMonthName + ' ' + datePickerYear }), jsx(Chevron, { direction: 'next', onClick: () => setNextMonth(), buttonText: $app.translate('Next month') })] }) }));
}

function DayNames() {
    const $app = useContext(AppContext);
    const aWeek = $app.timeUnitsImpl.getWeekFor($app.datePickerState.datePickerDate.value);
    const dayNames = getOneLetterOrShortDayNames(aWeek, $app.config.locale.value);
    return (jsx("div", { className: "sx__date-picker__day-names", children: dayNames.map((dayName) => (jsx("span", { "data-testid": "day-name", className: "sx__date-picker__day-name", children: dayName }))) }));
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

const dateFn = (dateTime, locale) => {
    return dateTime.toLocaleString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
const getLocalizedDate$1 = dateFn;

function MonthViewWeek({ week }) {
    const $app = useContext(AppContext);
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
    return (jsx(Fragment, { children: jsx("div", { "data-testid": DATE_PICKER_WEEK, className: "sx__date-picker__week", children: weekDays.map((weekDay) => (jsx("button", { type: "button", tabIndex: hasFocus(weekDay) ? 0 : -1, disabled: !isDateSelectable(weekDay.day), "aria-label": getLocalizedDate$1($app.datePickerState.datePickerDate.value, $app.config.locale.value), className: `sx__button ${weekDay.classes.join(' ')}`, "data-focus": hasFocus(weekDay) ? 'true' : undefined, onClick: () => selectDate(weekDay.day), onKeyDown: handleKeyDown, children: weekDay.day.day }))) }) }));
}

function MonthView({ seatYearsView }) {
    const elementId = randomStringId();
    const $app = useContext(AppContext);
    const [month, setMonth] = useState([]);
    const renderMonth = () => {
        const newDatePickerDate = $app.datePickerState.datePickerDate.value;
        setMonth($app.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(newDatePickerDate.year, newDatePickerDate.month));
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
        setYearAndMonth(year, month.month);
    };
    return (jsx(Fragment, { children: jsxs("li", { className: isExpanded ? 'sx__is-expanded' : '', children: [jsx("button", { type: "button", className: "sx__button sx__date-picker__years-accordion__expand-button sx__ripple--wide", onClick: () => expand(year), children: year }), isExpanded && (jsx("div", { className: "sx__date-picker__years-view-accordion__panel", children: yearWithDates.map((month) => (jsx("button", { type: "button", className: "sx__button sx__date-picker__years-view-accordion__month", onClick: (event) => handleClickOnMonth(event, month), children: toLocalizedMonth(month, $app.config.locale.value) }))) }))] }) }));
}

function YearsView({ setMonthView }) {
    const $app = useContext(AppContext);
    const minYear = $app.config.min.year;
    const maxYear = $app.config.max.year;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const selectedYear = $app.datePickerState.selectedDate.value.year;
    const [expandedYear, setExpandedYear] = useState(selectedYear);
    const setNewDatePickerDate = (year, month) => {
        $app.datePickerState.datePickerDate.value = Temporal.PlainDate.from({
            year,
            month,
            day: 1,
        });
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
function AppPopup({ wrapperEl }) {
    const $app = useContext(AppContext);
    const [datePickerView, setDatePickerView] = useState(DatePickerView.MONTH_DAYS);
    const classList = useMemo(() => {
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
    const elementRef = useRef(null);
    useEffect(() => {
        if ((elementRef === null || elementRef === void 0 ? void 0 : elementRef.current) &&
            typeof HTMLElement !== 'undefined' &&
            elementRef.current instanceof HTMLElement) {
            $app.elements = { DatePickerWrapper: elementRef.current };
        }
    }, []);
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
    let appPopupJSX = jsx(AppPopup, { wrapperEl: elementRef.current });
    if ($app.config.teleportTo)
        appPopupJSX = createPortal(appPopupJSX, $app.config.teleportTo);
    return (jsx(Fragment, { children: jsx("div", { ref: elementRef, className: classList.join(' '), children: jsxs(AppContext.Provider, { value: $app, children: [jsx(AppInput, {}), $app.datePickerState.isOpen.value && appPopupJSX] }) }) }));
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
        this.$app.datePickerState.selectedDate.value =
            Temporal.PlainDate.from(value);
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
    const isOpen = signal(false);
    const isDisabled = signal(config.disabled || false);
    const datePickerView = signal(DatePickerView.MONTH_DAYS);
    const selectedDate = signal(initialSelectedDate);
    const datePickerDate = signal(initialSelectedDate);
    const isDark = signal(((_a = config.style) === null || _a === void 0 ? void 0 : _a.dark) || false);
    const inputDisplayedValue = signal(toLocalizedDateString(initialSelectedDate, config.locale.value));
    const lastValidDisplayedValue = signal(inputDisplayedValue.value);
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
    effect(() => {
        inputDisplayedValue.value = getLocalizedDate(selectedDate.value, config.locale.value);
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
        handleInput,
        isDark,
        open: () => (isOpen.value = true),
        close: () => (isOpen.value = false),
        toggle: () => (isOpen.value = !isOpen.value),
        setView: (view) => (datePickerView.value = view),
    };
};

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
        this.locale = signal(locale);
        this.firstDayOfWeek = signal(firstDayOfWeek);
        this.timezone = signal(timezone);
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

const createAppSingleton = (config = {}) => {
    var _a;
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
        .withTimezone(config.timezone)
        .withHasPlaceholder((_a = config.hasPlaceholder) !== null && _a !== void 0 ? _a : false)
        .build();
    const timeUnitsImpl = new TimeUnitsBuilder()
        .withConfig(configInternal)
        .build();
    return new DatePickerAppSingletonBuilder()
        .withConfig(configInternal)
        .withDatePickerState(createDatePickerState(configInternal, config.selectedDate))
        .withTimeUnitsImpl(timeUnitsImpl)
        .withTranslate(translate(configInternal.locale, signal(translations)))
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
