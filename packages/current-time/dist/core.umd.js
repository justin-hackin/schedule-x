(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('preact/jsx-runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', 'preact/jsx-runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SXCurrentTime = {}));
})(this, (function (exports) { 'use strict';

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
      return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`;
  };
  const toTimeString = (date) => {
      return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`;
  };
  const toDateTimeString = (date) => {
      return `${toDateString(date)} ${toTimeString(date)}`;
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
  const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

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

  const getYCoordinateInTimeGrid = (dateTimeString, dayBoundaries, pointsPerDay) => {
      return timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(dateTimeString)));
  };

  const definePlugin = (name, definition) => {
      definition.name = name;
      return definition;
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

  WeekDay.MONDAY;

  const addMinutes = (to, nMinutes) => {
      const { year, month, date, hours, minutes } = toIntegers(to);
      const isDateTimeString = hours !== undefined && minutes !== undefined;
      const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
      jsDate.setMinutes(jsDate.getMinutes() + nMinutes);
      if (isDateTimeString) {
          return toDateTimeString(jsDate);
      }
      return toDateString(jsDate);
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
          if (typeof config.timeZoneOffset === 'number') {
              if (config.timeZoneOffset < -720 || config.timeZoneOffset > 840) {
                  throw new Error(`Invalid time zone offset: ` + config.timeZoneOffset);
              }
          }
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
          const todayDateString = toDateString(new Date());
          let nowDateTimeString = toDateTimeString(new Date());
          if (this.config.timeZoneOffset) {
              nowDateTimeString = addMinutes(nowDateTimeString, this.config.timeZoneOffset);
          }
          const todayElement = this.$app.elements.calendarWrapper.querySelector(`[data-time-grid-date="${todayDateString}"]`);
          if (!todayElement)
              return;
          const existingIndicator = todayElement.querySelector('.sx__current-time-indicator');
          if (existingIndicator && isRecursion)
              existingIndicator.remove();
          if (todayElement && !existingIndicator) {
              const currentTimeIndicator = document.createElement('div');
              currentTimeIndicator.classList.add('sx__current-time-indicator');
              const top = getYCoordinateInTimeGrid(nowDateTimeString, this.$app.config.dayBoundaries.value, this.$app.config.timePointsPerDay) + '%';
              currentTimeIndicator.style.top = top;
              todayElement.appendChild(currentTimeIndicator);
              if (this.config.fullWeekWidth) {
                  this.createFullWidthIndicator(top);
              }
              setTimeout(this.setIndicator.bind(this, true), 60000 - (Date.now() % 60000));
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
      }
  }
  const createCurrentTimePlugin = (config) => {
      return definePlugin('currentTime', new CurrentTimePluginImpl(config));
  };

  exports.createCurrentTimePlugin = createCurrentTimePlugin;

}));
