declare class CalendarHeaderPageObject {
    openViewByLabel(viewLabel: string): void;
    private openViewSelection;
    private clickViewByLabel;
}
declare const createCalendarHeaderPageObject: () => CalendarHeaderPageObject;
declare class DatePickerPageObject {
    private wrapperClass;
    constructor(wrapperClass?: string);
    goToNextMonth(): void;
    goToPreviousMonth(): void;
    toggleOpenState(): void;
    getCurrentMonthAndYearElement(): Cypress.Chainable<JQuery<HTMLElement>>;
    getCurrentMonthAndYear(): Cypress.Chainable<string>;
    openYearsView(): void;
    clickMonthByIndex(index: number): void;
    clickYear(year: number): void;
    clickDateByText(day: string): void;
    getInputValue(): Cypress.Chainable<string | number | string[] | undefined>;
}
declare const createDatePickerPageObject: (wrapperClass?: string) => DatePickerPageObject;
declare class WeekViewPageObject {
    getTimeGridEventByTitle(uniqueTitle: string): Cypress.Chainable<JQuery<HTMLElement>>;
    getDateGridEventByTitle(uniqueTitle: string): Cypress.Chainable<JQuery<HTMLElement>>;
    getEventByTitleAndDragIt(uniqueTitle: string, xPixels: number, yPixels: number): void;
    getTimeGridDayByIndex(index: number): Cypress.Chainable<JQuery<HTMLElement>>;
    getFirstDayOfWeek(): Cypress.Chainable<JQuery<HTMLElement>>;
    getLastDayOfWeek(): Cypress.Chainable<JQuery<HTMLElement>>;
    getVisibleWeekDays(): Cypress.Chainable<JQuery<HTMLElement>>;
}
declare const createWeekViewPageObject: () => WeekViewPageObject;
declare const SNAPSHOT_FAULT_TOLERANCE = 0.03;
export { createCalendarHeaderPageObject, createDatePickerPageObject, createWeekViewPageObject, SNAPSHOT_FAULT_TOLERANCE };
