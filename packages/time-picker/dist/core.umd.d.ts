import { Signal, ReadonlySignal } from "@preact/signals";
type TimePickerPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
interface TimePickerState {
    isOpen: Signal<boolean>;
    currentTime: Signal<string>;
    // a separate signal for the displayed value is needed, in order to support the 12-hour format
    currentTimeDisplayedValue: ReadonlySignal<string>;
    inputWrapperElement: Signal<HTMLDivElement | undefined>;
    isAM: Signal<boolean>;
}
type TranslationVariables = {
    [key: string]: string | number;
};
type TranslateFn = (key: string, variables?: TranslationVariables) => string;
interface TimePickerAppContext {
    config: TimePickerConfig;
    timePickerState: TimePickerState;
    translate: TranslateFn;
}
type TimePickerConfigExternal = {
    dark?: boolean;
    placement?: TimePickerPlacement;
    initialValue?: string;
    onChange?: (value: string) => void;
    onEscapeKeyDown?: ($app: TimePickerAppContext) => void;
    teleportTo?: HTMLElement | null;
    label?: string | null;
    name?: string;
    is12Hour?: boolean;
};
type TimePickerConfig = Omit<{
    [p in keyof TimePickerConfigExternal]-?: Signal<TimePickerConfigExternal[p]>;
}, "initialValue" | "onChange">;
declare class TimePickerApp {
    private $app;
    constructor($app: TimePickerAppContext);
    render(el: HTMLElement): void;
    get value(): string;
    set value(value: string);
}
declare const createTimePicker: (config: TimePickerConfigExternal | undefined, translateFn: TranslateFn) => TimePickerApp;
export { createTimePicker };
