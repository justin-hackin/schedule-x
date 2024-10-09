'use strict';

var CalendarHeaderPageObject = /** @class */ (function () {
    function CalendarHeaderPageObject() {
    }
    Object.defineProperty(CalendarHeaderPageObject.prototype, "openViewByLabel", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (viewLabel) {
            this.openViewSelection();
            this.clickViewByLabel(viewLabel);
        }
    });
    Object.defineProperty(CalendarHeaderPageObject.prototype, "openViewSelection", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            cy.get('.sx__view-selection-selected-item').click();
        }
    });
    Object.defineProperty(CalendarHeaderPageObject.prototype, "clickViewByLabel", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (viewLabel) {
            cy.contains('.sx__view-selection-item', viewLabel).click();
        }
    });
    return CalendarHeaderPageObject;
}());
var createCalendarHeaderPageObject = function () {
    return new CalendarHeaderPageObject();
};

var DatePickerPageObject = /** @class */ (function () {
    function DatePickerPageObject(wrapperClass) {
        if (wrapperClass === void 0) { wrapperClass = ''; }
        Object.defineProperty(this, "wrapperClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: wrapperClass
        });
    }
    Object.defineProperty(DatePickerPageObject.prototype, "goToNextMonth", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var selector = '.sx__date-picker__month-view-header .sx__chevron--next';
            if (this.wrapperClass) {
                cy.get(this.wrapperClass).find(selector).click();
                return;
            }
            cy.get(selector).click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "goToPreviousMonth", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var selector = '.sx__date-picker__month-view-header .sx__chevron--previous';
            if (this.wrapperClass) {
                cy.get(this.wrapperClass).find(selector).click();
                return;
            }
            cy.get(selector).click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "toggleOpenState", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var selector = '.sx__date-input-wrapper';
            if (this.wrapperClass) {
                cy.get(this.wrapperClass).find(selector).click();
                return;
            }
            cy.get(selector).click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "getCurrentMonthAndYearElement", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var selector = '.sx__date-picker__month-view-header__month-year';
            if (this.wrapperClass) {
                return cy.get(this.wrapperClass).find(selector);
            }
            return cy.get(selector);
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "getCurrentMonthAndYear", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return this.getCurrentMonthAndYearElement().invoke('text');
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "openYearsView", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.getCurrentMonthAndYearElement().click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "clickMonthByIndex", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (index) {
            var selector = '.sx__date-picker__years-view-accordion__month';
            if (this.wrapperClass) {
                cy.get(this.wrapperClass).find(selector).eq(index).click();
                return;
            }
            cy.get(selector).eq(index).click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "clickYear", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (year) {
            cy.get('.sx__date-picker__years-accordion__expand-button')
                .contains(year)
                .click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "clickDateByText", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (day) {
            cy.get('.sx__date-picker__day').contains(day).click();
        }
    });
    Object.defineProperty(DatePickerPageObject.prototype, "getInputValue", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return cy.get('.sx__date-input').invoke('val');
        }
    });
    return DatePickerPageObject;
}());
var createDatePickerPageObject = function (wrapperClass) {
    if (wrapperClass === void 0) { wrapperClass = ''; }
    return new DatePickerPageObject(wrapperClass);
};

var WeekViewPageObject = /** @class */ (function () {
    function WeekViewPageObject() {
    }
    Object.defineProperty(WeekViewPageObject.prototype, "getTimeGridEventByTitle", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (uniqueTitle) {
            return cy.contains('.sx__time-grid-event', uniqueTitle);
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getDateGridEventByTitle", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (uniqueTitle) {
            return cy.contains('.sx__date-grid-event', uniqueTitle);
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getEventByTitleAndDragIt", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (uniqueTitle, xPixels, yPixels) {
            cy.get('.sx__view-container').scrollTo(0, 0);
            cy.contains('.sx__time-grid-event', uniqueTitle)
                .trigger('mousedown', { which: 1 })
                .trigger('mousemove', { clientX: xPixels, clientY: yPixels, force: true })
                .trigger('mouseup', { force: true });
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getTimeGridDayByIndex", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (index) {
            return cy.get('.sx__time-grid-day').eq(index);
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getFirstDayOfWeek", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return cy.get('.sx__week-grid__date-axis').children().first();
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getLastDayOfWeek", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return cy.get('.sx__week-grid__date-axis').children().last();
        }
    });
    Object.defineProperty(WeekViewPageObject.prototype, "getVisibleWeekDays", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return cy.get('.sx__week-grid__date-axis').children();
        }
    });
    return WeekViewPageObject;
}());
var createWeekViewPageObject = function () { return new WeekViewPageObject(); };

var SNAPSHOT_FAULT_TOLERANCE = 0.03;

exports.SNAPSHOT_FAULT_TOLERANCE = SNAPSHOT_FAULT_TOLERANCE;
exports.createCalendarHeaderPageObject = createCalendarHeaderPageObject;
exports.createDatePickerPageObject = createDatePickerPageObject;
exports.createWeekViewPageObject = createWeekViewPageObject;
