import { createContext, render, createElement } from 'preact';
import { jsx, Fragment, jsxs } from 'preact/jsx-runtime';
import { useContext, useEffect, useRef, createPortal } from 'preact/compat';
import { useState, useEffect as useEffect$1 } from 'preact/hooks';
import { signal, effect, computed } from '@preact/signals';

const AppContext = createContext({});

/**
 * Can be used for generating a random id for an entity
 * Should, however, never be used in potentially resource intense loops,
 * since the performance cost of this compared to new Date().getTime() is ca x4 in v8
 * */
const randomStringId = () => 's' + Math.random().toString(36).substring(2, 11);

function AppInput() {
    var _a;
    const $app = useContext(AppContext);
    const inputId = randomStringId();
    const wrapperId = randomStringId();
    const [wrapperClasses, setWrapperClasses] = useState([]);
    useEffect(() => {
        const newClasses = ['sx__time-input-wrapper'];
        if ($app.timePickerState.isOpen.value)
            newClasses.push('sx__time-input--active');
        setWrapperClasses(newClasses);
    }, [$app.timePickerState.isOpen.value]);
    const openPopup = () => {
        if (!$app.config.teleportTo.value) {
            $app.timePickerState.isOpen.value = true;
            return;
        }
        const inputWrapperElement = document.getElementById(wrapperId);
        $app.timePickerState.inputWrapperElement.value =
            inputWrapperElement instanceof HTMLDivElement
                ? inputWrapperElement
                : undefined;
        $app.timePickerState.isOpen.value = true;
    };
    return (jsx(Fragment, { children: jsxs("div", { id: wrapperId, className: wrapperClasses.join(' '), children: [jsx("label", { htmlFor: inputId, className: "sx__time-input-label", children: (_a = $app.config.label.value) !== null && _a !== void 0 ? _a : 'Time' }), jsx("input", { value: $app.timePickerState.currentTimeDisplayedValue.value, readOnly: true, id: inputId, name: $app.config.name.value ? $app.config.name.value : 'time', className: "sx__time-picker-input", type: "text", onFocus: openPopup })] }) }));
}

/**
 * Push a task to the end of the current call stack
 * */
const nextTick = (cb) => {
    setTimeout(() => {
        cb();
    });
};

function TimeInput({ initialValue, onChange, inputRef, nextTabIndexRef, validRange, }) {
    const [inputValue, setInputValue] = useState(initialValue);
    const [tabBlocker, setTabBlocker] = useState(false);
    const handleInput = (e) => {
        if (!(e.target instanceof HTMLInputElement))
            return;
        setInputValue(e.target.value);
    };
    useEffect(() => {
        var _a;
        onChange(inputValue);
        if (tabBlocker)
            return;
        if (inputValue.length === 2 &&
            nextTabIndexRef &&
            'current' in nextTabIndexRef) {
            (_a = nextTabIndexRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            if (nextTabIndexRef.current instanceof HTMLInputElement) {
                nextTabIndexRef.current.select();
            }
        }
    }, [inputValue]);
    const handleOnBlur = () => {
        const [min, max] = validRange;
        const value = +inputValue;
        if (value < min || value > max || isNaN(value)) {
            setInputValue(min < 10 ? `0${min}` : String(min));
            return;
        }
        if (inputValue.length === 1) {
            setInputValue(`0${inputValue}`);
        }
    };
    const incrementOrDecrementOnKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const [min, max] = validRange;
            const value = +inputValue;
            const newValue = e.key === 'ArrowUp' ? value + 1 : value - 1;
            if (newValue < min || newValue > max)
                return;
            setInputValue(newValue < 10 ? `0${newValue}` : String(newValue));
            setTabBlocker(true);
            nextTick(() => setTabBlocker(false));
        }
    };
    return (jsx("input", { ref: inputRef, maxLength: 2, className: "sx__time-input", type: "text", onKeyDown: incrementOrDecrementOnKeyDown, value: inputValue, onInput: handleInput, onBlur: handleOnBlur }));
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

const convert12HourTo24HourTimeString = (hoursValue, minutesValue, $app) => {
    const hoursInt = Number(hoursValue);
    const isAM = $app.timePickerState.isAM.value;
    if (isAM && hoursInt === 12) {
        $app.timePickerState.currentTime.value = `00:${minutesValue}`;
    }
    else if (!isAM && hoursInt < 12) {
        $app.timePickerState.currentTime.value = `${hoursInt + 12}:${minutesValue}`;
    }
    else {
        $app.timePickerState.currentTime.value = `${hoursValue}:${minutesValue}`;
    }
};

function AppPopup() {
    const $app = useContext(AppContext);
    const POPUP_CLASS_NAME = 'sx__time-picker-popup';
    const INPUT_WRAPPER_CLASS_NAME = 'sx__time-input-wrapper';
    const hoursRef = useRef(null);
    const minutesRef = useRef(null);
    const OKButtonRef = useRef(null);
    const [classList, setClassList] = useState([
        POPUP_CLASS_NAME,
        $app.config.placement,
    ]);
    useEffect$1(() => {
        setClassList([
            POPUP_CLASS_NAME,
            $app.config.placement,
            $app.config.dark.value ? 'is-dark' : '',
        ]);
    }, [$app.config.dark.value, $app.config.placement.value]);
    const getInitialStart12Hour = (hours) => {
        const hoursInt = Number(hours);
        if (hoursInt === 0)
            return '12';
        if (hoursInt > 12)
            return String(hoursInt - 12);
        return hours;
    };
    const [initialStart, initialEnd] = $app.timePickerState.currentTime.value.split(':');
    const [hoursValue, setHoursValue] = useState($app.config.is12Hour.value
        ? getInitialStart12Hour(initialStart)
        : initialStart);
    const [minutesValue, setMinutesValue] = useState(initialEnd);
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (![POPUP_CLASS_NAME, INPUT_WRAPPER_CLASS_NAME].some((className) => target.closest(`.${className}`))) {
            $app.timePickerState.isOpen.value = false;
        }
    };
    const escapeKeyListener = (e) => {
        if (e.key === 'Escape') {
            if (typeof $app.config.onEscapeKeyDown.value === 'function') {
                $app.config.onEscapeKeyDown.value($app);
            }
            else {
                $app.timePickerState.isOpen.value = false;
            }
        }
    };
    useEffect$1(() => {
        var _a, _b;
        (_a = hoursRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        (_b = hoursRef.current) === null || _b === void 0 ? void 0 : _b.select();
        document.addEventListener('click', clickOutsideListener);
        document.addEventListener('keydown', escapeKeyListener);
        return () => {
            document.removeEventListener('click', clickOutsideListener);
            document.removeEventListener('keydown', escapeKeyListener);
        };
    }, []);
    const handleAccept = () => {
        if ($app.config.is12Hour.value) {
            convert12HourTo24HourTimeString(hoursValue, minutesValue, $app);
        }
        else {
            $app.timePickerState.currentTime.value = `${hoursValue}:${minutesValue}`;
        }
        $app.timePickerState.isOpen.value = false;
    };
    const remSize = Number(getComputedStyle(document.documentElement).fontSize.split('px')[0]);
    const popupHeight = 362;
    const popupWidth = 332;
    const getFixedPositionStyles = () => {
        var _a, _b, _c;
        const inputRect = (_a = $app.timePickerState.inputWrapperElement.value) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!inputRect)
            return undefined;
        return {
            top: ((_b = $app.config.placement.value) === null || _b === void 0 ? void 0 : _b.includes('bottom'))
                ? inputRect.height + inputRect.y + 1 // 1px border
                : inputRect.y - remSize - popupHeight, // subtract remsize to leave room for label text
            left: ((_c = $app.config.placement.value) === null || _c === void 0 ? void 0 : _c.includes('start'))
                ? inputRect.x
                : inputRect.x + inputRect.width - popupWidth,
            width: popupWidth,
            position: 'fixed',
        };
    };
    const [fixedPositionStyle, setFixedPositionStyle] = useState(getFixedPositionStyles());
    useEffect$1(() => {
        const inputWrapperEl = $app.timePickerState.inputWrapperElement.value;
        if (!inputWrapperEl)
            return;
        const scrollableParents = getScrollableParents(inputWrapperEl);
        scrollableParents.forEach((parent) => parent.addEventListener('scroll', () => setFixedPositionStyle(getFixedPositionStyles())));
        return () => {
            scrollableParents.forEach((parent) => parent.removeEventListener('scroll', () => setFixedPositionStyle(getFixedPositionStyles())));
        };
    }, []);
    return (jsxs("div", { className: classList.join(' '), style: $app.config.teleportTo.value ? fixedPositionStyle : undefined, children: [jsx("div", { className: "sx__time-picker-popup-label", children: "Select time" }), jsxs("div", { className: "sx__time-picker-time-inputs", children: [jsx(TimeInput, { initialValue: hoursValue, onChange: (newHours) => setHoursValue(newHours), inputRef: hoursRef, nextTabIndexRef: minutesRef, validRange: $app.config.is12Hour.value ? [1, 12] : [0, 23] }), jsx("span", { className: "sx__time-picker-colon", children: ":" }), jsx(TimeInput, { initialValue: minutesValue, onChange: (newMinutes) => setMinutesValue(newMinutes), inputRef: minutesRef, validRange: [0, 59], nextTabIndexRef: OKButtonRef }), $app.config.is12Hour.value && (jsxs("div", { className: "sx__time-picker-12-hour-switches", children: [jsx("button", { className: `sx__time-picker-12-hour-switch${$app.timePickerState.isAM.value ? ' is-selected' : ''}`, onClick: () => ($app.timePickerState.isAM.value = true), children: "AM" }), jsx("button", { className: `sx__time-picker-12-hour-switch${!$app.timePickerState.isAM.value ? ' is-selected' : ''}`, onClick: () => ($app.timePickerState.isAM.value = false), children: "PM" })] }))] }), jsxs("div", { class: "sx__time-picker-actions", children: [jsx("button", { class: "sx__time-picker-action sx__ripple sx__button-cancel", onClick: () => ($app.timePickerState.isOpen.value = false), children: "Cancel" }), jsx("button", { ref: OKButtonRef, class: "sx__time-picker-action sx__ripple sx__button-accept", onClick: handleAccept, children: "OK" })] })] }));
}

function TimePickerWrapper({ $app }) {
    const baseClassList = [
        'sx__time-picker-wrapper',
        $app.config.is12Hour.value ? 'is-12-hour' : '',
    ];
    const [classList, setClassList] = useState(baseClassList);
    useEffect$1(() => {
        setClassList([...baseClassList, $app.config.dark.value ? 'is-dark' : '']);
    }, [$app.config.dark.value]);
    let AppPopupJSX = jsx(AppPopup, {});
    if ($app.config.teleportTo.value) {
        AppPopupJSX = createPortal(AppPopupJSX, $app.config.teleportTo.value);
    }
    return (jsx(Fragment, { children: jsx("div", { className: classList.join(' '), children: jsxs(AppContext.Provider, { value: $app, children: [jsx(AppInput, {}), $app.timePickerState.isOpen.value && AppPopupJSX] }) }) }));
}

class TimePickerApp {
    constructor($app) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
    }
    render(el) {
        render(createElement(TimePickerWrapper, {
            $app: this.$app,
        }), el);
    }
    get value() {
        return this.$app.timePickerState.currentTime.value;
    }
    set value(value) {
        this.$app.timePickerState.currentTime.value = value;
    }
}

const getTimePickerState = (config, is12HourClock) => {
    var _a;
    const currentTime = signal((_a = config.initialValue) !== null && _a !== void 0 ? _a : '00:00');
    let wasInitialized = false;
    const handleCurrentTimeChanged = (config, currentTime) => {
        if (!wasInitialized)
            return (wasInitialized = true);
        if (config.onChange) {
            config.onChange(currentTime);
        }
    };
    effect(() => {
        handleCurrentTimeChanged(config, currentTime.value);
    });
    const initialIsAM = parseInt(currentTime.value.split(':')[0]) < 12;
    const isAM = signal(initialIsAM);
    return {
        isOpen: signal(false),
        currentTime,
        currentTimeDisplayedValue: computed(() => {
            const [hours, minutes] = currentTime.value.split(':');
            const parsedHours = parseInt(hours);
            let hoursInt = parsedHours;
            const minutesInt = parseInt(minutes);
            if (is12HourClock) {
                hoursInt = hoursInt === 0 ? 12 : hoursInt;
                const hours12 = hoursInt > 12 ? hoursInt - 12 : hoursInt;
                return `${hours12}:${minutesInt.toString().padStart(2, '0')} ${parsedHours >= 12 ? 'PM' : 'AM'}`;
            }
            return `${hoursInt.toString().padStart(2, '0')}:${minutesInt.toString().padStart(2, '0')}`;
        }),
        inputWrapperElement: signal(undefined),
        isAM,
    };
};
const createTimePickerAppContext = (config = {}) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return ({
        config: {
            onEscapeKeyDown: signal((_a = config.onEscapeKeyDown) !== null && _a !== void 0 ? _a : undefined),
            dark: signal((_b = config.dark) !== null && _b !== void 0 ? _b : false),
            placement: signal((_c = config.placement) !== null && _c !== void 0 ? _c : 'bottom-start'),
            teleportTo: signal((_d = config.teleportTo) !== null && _d !== void 0 ? _d : null),
            label: signal((_e = config.label) !== null && _e !== void 0 ? _e : null),
            is12Hour: signal((_f = config.is12Hour) !== null && _f !== void 0 ? _f : false),
            name: signal((_g = config.name) !== null && _g !== void 0 ? _g : ''),
        },
        timePickerState: getTimePickerState(config, (_h = config.is12Hour) !== null && _h !== void 0 ? _h : false),
    });
};
const createTimePicker = (config = {}) => {
    return new TimePickerApp(createTimePickerAppContext(config));
};

export { createTimePicker };
