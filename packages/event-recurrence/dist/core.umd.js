(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('preact/jsx-runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', 'preact/jsx-runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SXEventRecurrence = {}));
})(this, (function (exports) { 'use strict';

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

  const definePlugin = (name, definition) => {
      definition.name = name;
      return definition;
  };

  // regex for strings between 00:00 and 23:59
  const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  const dateTimeStringRegex = /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  const dateStringRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

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

  class InvalidTimeStringError extends Error {
      constructor(timeString) {
          super(`Invalid time string: ${timeString}`);
      }
  }

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

  const dateFromDateTime = (dateTime) => {
      return dateTime.slice(0, 10);
  };
  const timeFromDateTime = (dateTime) => {
      return dateTime.slice(11);
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
  const DEFAULT_EVENT_COLOR_NAME = 'primary';

  class CalendarEventImpl {
      constructor(_config, id, start, end, title, people, location, description, calendarId, _options = undefined, _customContent = {}, _foreignProperties = {}) {
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
          Object.defineProperty(this, "_nDaysInGrid", {
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
      }
      get _isSingleDayTimed() {
          return (dateTimeStringRegex.test(this.start) &&
              dateTimeStringRegex.test(this.end) &&
              dateFromDateTime(this.start) === dateFromDateTime(this.end));
      }
      get _isSingleDayFullDay() {
          return (dateStringRegex.test(this.start) &&
              dateStringRegex.test(this.end) &&
              this.start === this.end);
      }
      get _isMultiDayTimed() {
          return (dateTimeStringRegex.test(this.start) &&
              dateTimeStringRegex.test(this.end) &&
              dateFromDateTime(this.start) !== dateFromDateTime(this.end));
      }
      get _isMultiDayFullDay() {
          return (dateStringRegex.test(this.start) &&
              dateStringRegex.test(this.end) &&
              this.start !== this.end);
      }
      get _isSingleHybridDayTimed() {
          if (!this._config.isHybridDay)
              return false;
          if (!dateTimeStringRegex.test(this.start) ||
              !dateTimeStringRegex.test(this.end))
              return false;
          const startDate = dateFromDateTime(this.start);
          const endDate = dateFromDateTime(this.end);
          const endDateMinusOneDay = toDateString(new Date(toJSDate(endDate).getTime() - 86400000));
          if (startDate !== endDate && startDate !== endDateMinusOneDay)
              return false;
          const dayBoundaries = this._config.dayBoundaries.value;
          const eventStartTimePoints = timePointsFromString(timeFromDateTime(this.start));
          const eventEndTimePoints = timePointsFromString(timeFromDateTime(this.end));
          return ((eventStartTimePoints >= dayBoundaries.start &&
              (eventEndTimePoints <= dayBoundaries.end ||
                  eventEndTimePoints > eventStartTimePoints)) ||
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
              start: this.start,
              end: this.end,
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
      const calendarEventInternal = new CalendarEventBuilder($app.config, calendarEvent.id, calendarEvent.start, calendarEvent.end)
          .withTitle(calendarEvent.title)
          .withPeople(calendarEvent.people)
          .withCalendarId(calendarEvent.calendarId)
          .withForeignProperties(JSON.parse(JSON.stringify(calendarEvent._getForeignProperties())))
          .withLocation(calendarEvent.location)
          .withDescription(calendarEvent.description)
          .build();
      calendarEventInternal._nDaysInGrid = calendarEvent._nDaysInGrid;
      return calendarEventInternal;
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
      return toDateString(jsDate);
  };
  const addDays = (to, nDays) => {
      const { year, month, date, hours, minutes } = toIntegers(to);
      const isDateTimeString = hours !== undefined && minutes !== undefined;
      const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
      jsDate.setDate(jsDate.getDate() + nDays);
      if (isDateTimeString) {
          return toDateTimeString(jsDate);
      }
      return toDateString(jsDate);
  };
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
  const addYears = (to, nYears) => {
      const { year, month, date, hours, minutes } = toIntegers(to);
      const isDateTimeString = hours !== undefined && minutes !== undefined;
      const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
      jsDate.setFullYear(jsDate.getFullYear() + nYears);
      if (isDateTimeString) {
          return toDateTimeString(jsDate);
      }
      return toDateString(jsDate);
  };

  const calculateDaysDifference = (startDate, endDate) => {
      const { year: sYear, month: sMonth, date: sDate } = toIntegers(startDate);
      const { year: eYear, month: eMonth, date: eDate } = toIntegers(endDate);
      const startDateObj = new Date(sYear, sMonth, sDate);
      const endDateObj = new Date(eYear, eMonth, eDate);
      const timeDifference = endDateObj.getTime() - startDateObj.getTime();
      return Math.round(timeDifference / (1000 * 3600 * 24));
  };

  const getDurationInMinutes = (dtstart, dtend) => {
      const dtStartJS = toJSDate(dtstart);
      const dtEndJS = toJSDate(dtend);
      return (dtEndJS.getTime() - dtStartJS.getTime()) / 1000 / 60;
  };

  class RRuleUpdater {
      constructor(rruleOptions, dtstartOld, dtstartNew) {
          Object.defineProperty(this, "rruleOptions", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: rruleOptions
          });
          Object.defineProperty(this, "dtstartOld", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: dtstartOld
          });
          Object.defineProperty(this, "dtstartNew", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: dtstartNew
          });
          Object.defineProperty(this, "rruleOptionsNew", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          this.rruleOptionsNew = { ...rruleOptions };
          this.updateByDay();
          this.updateByMonthDay();
          this.updateUntil();
      }
      updateByDay() {
          var _a;
          if (!this.rruleOptions.byday)
              return;
          const daysDifference = calculateDaysDifference(this.dtstartOld, this.dtstartNew);
          const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
          const daysToShift = daysDifference % 7;
          if (daysToShift === 0)
              return;
          (_a = this.rruleOptionsNew.byday) === null || _a === void 0 ? void 0 : _a.forEach((day, index) => {
              const dayIndex = days.indexOf(day);
              const newIndex = dayIndex + daysToShift;
              if (newIndex >= days.length) {
                  this.rruleOptionsNew.byday[index] = days[newIndex - days.length];
              }
              else if (newIndex < 0) {
                  this.rruleOptionsNew.byday[index] = days[days.length + newIndex];
              }
              else {
                  this.rruleOptionsNew.byday[index] = days[newIndex];
              }
          });
      }
      updateByMonthDay() {
          if (!this.rruleOptions.bymonthday)
              return;
          this.rruleOptionsNew.bymonthday = toJSDate(this.dtstartNew).getDate();
      }
      updateUntil() {
          if (!this.rruleOptions.until)
              return;
          const isDateTime = dateTimeStringRegex.test(this.dtstartOld);
          this.rruleOptionsNew.until = isDateTime
              ? addMinutes(this.rruleOptionsNew.until, getDurationInMinutes(this.dtstartOld, this.dtstartNew))
              : addDays(this.rruleOptionsNew.until, calculateDaysDifference(this.dtstartOld, this.dtstartNew));
      }
      getUpdatedRRuleOptions() {
          return this.rruleOptionsNew;
      }
  }

  var RRuleFreq;
  (function (RRuleFreq) {
      RRuleFreq["YEARLY"] = "YEARLY";
      RRuleFreq["MONTHLY"] = "MONTHLY";
      RRuleFreq["WEEKLY"] = "WEEKLY";
      RRuleFreq["DAILY"] = "DAILY";
  })(RRuleFreq || (RRuleFreq = {}));

  const rruleStringToJS = (rrule) => {
      const rruleOptions = {
          freq: RRuleFreq.WEEKLY,
      };
      const rruleOptionsArray = rrule.split(';');
      rruleOptionsArray.forEach((option) => {
          const [key, value] = option.split('=');
          if (key === 'FREQ')
              rruleOptions.freq = value;
          if (key === 'BYDAY')
              rruleOptions.byday = value.split(',');
          if (key === 'BYMONTHDAY')
              rruleOptions.bymonthday = Number(value);
          if (key === 'UNTIL')
              rruleOptions.until = parseRFC5545ToSX(value);
          if (key === 'COUNT')
              rruleOptions.count = Number(value);
          if (key === 'INTERVAL')
              rruleOptions.interval = Number(value);
      });
      return rruleOptions;
  };
  const rruleJSToString = (rruleOptions) => {
      let rrule = `FREQ=${rruleOptions.freq}`;
      if (rruleOptions.until)
          rrule += `;UNTIL=${parseSXToRFC5545(rruleOptions.until)}`;
      if (rruleOptions.count)
          rrule += `;COUNT=${rruleOptions.count}`;
      if (rruleOptions.interval)
          rrule += `;INTERVAL=${rruleOptions.interval}`;
      if (rruleOptions.byday)
          rrule += `;BYDAY=${rruleOptions.byday.join(',')}`;
      if (rruleOptions.bymonthday)
          rrule += `;BYMONTHDAY=${rruleOptions.bymonthday}`;
      return rrule;
  };
  const parseSXToRFC5545 = (datetime) => {
      datetime = datetime.replace(/-/g, '');
      datetime = datetime.replace(/:/g, '');
      datetime = datetime.replace(' ', 'T');
      if (/T\d{4}$/.test(datetime))
          datetime += '00'; // add seconds if not present
      return datetime;
  };
  const parseRFC5545ToSX = (datetime) => {
      datetime = datetime.replace('T', ' ');
      datetime = datetime.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      datetime = datetime.replace(/(\d{2})(\d{2})(\d{2})$/, '$1:$2');
      return datetime;
  };

  const getWeekForDate = (date) => {
      const dateJS = toJSDate(date);
      const dayOfWeek = dateJS.getDay();
      const startOfWeek = new Date(dateJS);
      startOfWeek.setDate(dateJS.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      return Array.from({ length: 7 }).map((_, index) => {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + index);
          return toDateString(day);
      });
  };

  const bydayJSDayMap = {
      MO: 1,
      TU: 2,
      WE: 3,
      TH: 4,
      FR: 5,
      SA: 6,
      SU: 0,
  };
  const getJSDayFromByday = (byday) => {
      return bydayJSDayMap[byday];
  };

  const isDatePastUntil = (date, until) => {
      /* RFC5545: #2 */
      return until && date > until;
  };
  const isCountReached = (count, maxCount) => {
      return maxCount && count >= maxCount;
  };

  const weeklyIterator = (dtstart, rruleOptions) => {
      var _a;
      const timeInDtstart = timeFromDateTime(dtstart);
      const weekDaysJS = ((_a = rruleOptions.byday) === null || _a === void 0 ? void 0 : _a.map(getJSDayFromByday)) || [
          toJSDate(dtstart).getDay(),
      ];
      let currentDate = dtstart;
      const allDateTimes = [];
      return {
          next() {
              const week = getWeekForDate(currentDate);
              const candidatesDates = week
                  .filter((date) => weekDaysJS.includes(toJSDate(date).getDay()))
                  .map((date) => {
                  if (timeInDtstart) {
                      return `${date} ${timeInDtstart}`;
                  }
                  return date;
              });
              candidatesDates.forEach((candidate) => {
                  if (candidate >= dtstart &&
                      !isCountReached(allDateTimes.length, rruleOptions.count) &&
                      !isDatePastUntil(candidate, rruleOptions.until)) {
                      allDateTimes.push(candidate);
                  }
              });
              if (isDatePastUntil(currentDate, rruleOptions.until) ||
                  isCountReached(allDateTimes.length, rruleOptions.count)) {
                  return { done: true, value: allDateTimes };
              }
              const nextDateJS = toJSDate(currentDate);
              nextDateJS.setDate(nextDateJS.getDate() + 7 * rruleOptions.interval);
              currentDate = toDateString(nextDateJS);
              return { done: false, value: allDateTimes };
          },
      };
  };
  const weeklyIteratorResult = (dtstart, rruleOptions) => {
      const weeklyIter = weeklyIterator(dtstart, rruleOptions);
      let result = weeklyIter.next();
      while (!result.done) {
          result = weeklyIter.next();
      }
      return result.value;
  };

  const dailyIterator = (dtstart, rruleOptions) => {
      var _a;
      let currentDate = dtstart;
      const allDateTimes = [];
      const bydayNumbers = ((_a = rruleOptions.byday) === null || _a === void 0 ? void 0 : _a.map(getJSDayFromByday)) || undefined;
      return {
          next() {
              if (!isCountReached(allDateTimes.length, rruleOptions.count) &&
                  !isDatePastUntil(currentDate, rruleOptions.until)) {
                  if (bydayNumbers) {
                      const dayOfWeek = toJSDate(currentDate).getDay();
                      if (bydayNumbers.includes(dayOfWeek)) {
                          allDateTimes.push(currentDate);
                      }
                  }
                  else {
                      allDateTimes.push(currentDate);
                  }
              }
              if (isDatePastUntil(currentDate, rruleOptions.until) ||
                  isCountReached(allDateTimes.length, rruleOptions.count)) {
                  return { done: true, value: allDateTimes };
              }
              currentDate = addDays(currentDate, rruleOptions.interval);
              return { done: false, value: allDateTimes };
          },
      };
  };
  const dailyIteratorResult = (dtstart, rruleOptions) => {
      const dailyIter = dailyIterator(dtstart, rruleOptions);
      let result = dailyIter.next();
      while (!result.done) {
          result = dailyIter.next();
      }
      return result.value;
  };

  const monthlyIteratorBymonthday = (dtstart, options) => {
      let currentDate = dtstart;
      const allDateTimes = [];
      return {
          next() {
              if (!isCountReached(allDateTimes.length, options.count) &&
                  !isDatePastUntil(currentDate, options.until)) {
                  allDateTimes.push(currentDate);
              }
              if (isDatePastUntil(currentDate, options.until) ||
                  isCountReached(allDateTimes.length, options.count)) {
                  return { done: true, value: allDateTimes };
              }
              const nextCurrentDateCandidate = addMonths(currentDate, options.interval);
              let currentIntervalCandidate = options.interval;
              let { date: nextMonthDateCandidate } = toIntegers(nextCurrentDateCandidate);
              while (nextMonthDateCandidate !== options.bymonthday) {
                  currentIntervalCandidate += options.interval;
                  nextMonthDateCandidate = toIntegers(addMonths(currentDate, currentIntervalCandidate)).date;
              }
              currentDate = addMonths(currentDate, currentIntervalCandidate);
              return { done: false, value: allDateTimes };
          },
      };
  };
  const monthlyIteratorResult = (dtstart, options) => {
      if (!options.bymonthday) {
          options.bymonthday = toIntegers(dtstart).date;
      }
      const monthlyIter = monthlyIteratorBymonthday(dtstart, options);
      let result = monthlyIter.next();
      while (!result.done) {
          result = monthlyIter.next();
      }
      return result.value;
  };

  const yearlyIterator = (dtstart, rruleOptions) => {
      const allDateTimes = [];
      let currentDate = dtstart;
      return {
          next() {
              if (!isCountReached(allDateTimes.length, rruleOptions.count) &&
                  !isDatePastUntil(currentDate, rruleOptions.until)) {
                  allDateTimes.push(currentDate);
              }
              if (isDatePastUntil(currentDate, rruleOptions.until) ||
                  isCountReached(allDateTimes.length, rruleOptions.count)) {
                  return { done: true, value: allDateTimes };
              }
              currentDate = addYears(currentDate, rruleOptions.interval);
              return { done: false, value: allDateTimes };
          },
      };
  };
  const yearlyIteratorResult = (dtstart, rruleOptions) => {
      const yearlyIter = yearlyIterator(dtstart, rruleOptions);
      let result = yearlyIter.next();
      while (!result.done) {
          result = yearlyIter.next();
      }
      return result.value;
  };

  class RRule {
      constructor(options, dtstart, dtend) {
          var _a;
          Object.defineProperty(this, "dtstart", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: dtstart
          });
          Object.defineProperty(this, "options", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "durationInMinutes", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "durationInDays", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          this.options = {
              ...options,
              interval: (_a = options.interval) !== null && _a !== void 0 ? _a : 1,
          };
          const actualDTEND = dtend || dtstart; /* RFC5545: #1 */
          if (this.isDateTime) {
              this.durationInMinutes = getDurationInMinutes(this.dtstart, actualDTEND);
          }
          else {
              this.durationInDays = calculateDaysDifference(this.dtstart, actualDTEND);
          }
      }
      getRecurrences() {
          if (this.options.freq === RRuleFreq.DAILY)
              return this.getDatesForDaily();
          if (this.options.freq === RRuleFreq.WEEKLY)
              return this.getDatesForFreqWeekly();
          if (this.options.freq === RRuleFreq.MONTHLY)
              return this.getDatesForFreqMonthly();
          if (this.options.freq === RRuleFreq.YEARLY)
              return this.getDatesForFreqYearly();
          throw new Error('freq is required');
      }
      getDatesForFreqWeekly() {
          return weeklyIteratorResult(this.dtstart, this.options).map(this.getRecurrenceBasedOnStartDates.bind(this));
      }
      getDatesForDaily() {
          return dailyIteratorResult(this.dtstart, this.options).map(this.getRecurrenceBasedOnStartDates.bind(this));
      }
      getDatesForFreqMonthly() {
          return monthlyIteratorResult(this.dtstart, this.options).map(this.getRecurrenceBasedOnStartDates.bind(this));
      }
      getDatesForFreqYearly() {
          return yearlyIteratorResult(this.dtstart, this.options).map(this.getRecurrenceBasedOnStartDates.bind(this));
      }
      getRecurrenceBasedOnStartDates(date) {
          return {
              start: date,
              end: this.isDateTime
                  ? addMinutes(date, this.durationInMinutes)
                  : addDays(date, this.durationInDays),
          };
      }
      get isDateTime() {
          return dateTimeStringRegex.test(this.dtstart);
      }
  }

  class RecurrenceSet {
      constructor(options) {
          Object.defineProperty(this, "dtstart", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "dtend", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "rrule", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          this.dtstart = parseRFC5545ToSX(options.dtstart);
          this.dtend = parseRFC5545ToSX(options.dtend || options.dtstart);
          this.rrule = rruleStringToJS(options.rrule);
      }
      getRecurrences() {
          const recurrences = [];
          recurrences.push(...new RRule(this.rrule, this.dtstart, this.dtend).getRecurrences());
          return recurrences;
      }
      updateDtstart(newDtstart) {
          newDtstart = parseRFC5545ToSX(newDtstart);
          const oldDtstart = this.dtstart;
          const rruleUpdater = new RRuleUpdater(this.rrule, oldDtstart, newDtstart);
          this.rrule = rruleUpdater.getUpdatedRRuleOptions();
          this.dtstart = newDtstart;
          this.dtend = dateTimeStringRegex.test(oldDtstart)
              ? addMinutes(this.dtend, getDurationInMinutes(oldDtstart, newDtstart))
              : addDays(this.dtend, calculateDaysDifference(oldDtstart, newDtstart));
      }
      getRrule() {
          return rruleJSToString(this.rrule);
      }
      getDtstart() {
          return parseSXToRFC5545(this.dtstart);
      }
      getDtend() {
          return parseSXToRFC5545(this.dtend);
      }
  }

  class DndUpdater {
      constructor($app) {
          Object.defineProperty(this, "$app", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: $app
          });
      }
      update(eventId, oldEventStart, newEventStart) {
          const eventToUpdate = this.$app.calendarEvents.list.value.find((event) => event.id === eventId && !event.isCopy);
          if (!eventToUpdate)
              throw new Error('Tried to update a non-existing event');
          this.$app.calendarEvents.list.value =
              this.$app.calendarEvents.list.value.filter((event) => event.id !== eventId || !event.isCopy);
          const recurrenceSet = new RecurrenceSet({
              dtstart: eventToUpdate.start,
              dtend: eventToUpdate.end,
              rrule: eventToUpdate._getForeignProperties().rrule,
          });
          const newDtStart = dateTimeStringRegex.test(newEventStart)
              ? addMinutes(eventToUpdate.start, getDurationInMinutes(oldEventStart, newEventStart))
              : addDays(eventToUpdate.start, calculateDaysDifference(oldEventStart, newEventStart));
          // Update the original event
          recurrenceSet.updateDtstart(newDtStart);
          eventToUpdate.start = parseRFC5545ToSX(recurrenceSet.getDtstart());
          eventToUpdate.end = parseRFC5545ToSX(recurrenceSet.getDtend());
          eventToUpdate._getForeignProperties().rrule = recurrenceSet.getRrule();
          return { updatedEvent: eventToUpdate, recurrenceSet };
      }
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

  const createRecurrencesForEvent = ($app, calendarEvent, rrule) => {
      const recurrenceSet = new RecurrenceSet({
          dtstart: parseSXToRFC5545(calendarEvent.start),
          dtend: parseSXToRFC5545(calendarEvent.end),
          rrule,
      });
      return recurrenceSet
          .getRecurrences()
          .slice(1) // skip the first occurrence because this is the original event
          .map((recurrence) => {
          const eventCopy = deepCloneEvent(calendarEvent, $app);
          eventCopy.start = recurrence.start;
          eventCopy.end = recurrence.end;
          eventCopy.isCopy = true;
          return eventCopy;
      });
  };

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
          const newEventsList = [];
          for (const event of events) {
              const newEvent = externalEventToInternal(event, this.$app.config);
              newEventsList.push(newEvent);
              const rrule = newEvent._getForeignProperties().rrule;
              if (rrule) {
                  newEventsList.push(...createRecurrencesForEvent(this.$app, newEvent, rrule));
              }
          }
          this.$app.calendarEvents.list.value = newEventsList;
      }
      add(event) {
          const newEvent = externalEventToInternal(event, this.$app.config);
          const newEventsList = [...this.$app.calendarEvents.list.value, newEvent];
          const rrule = newEvent._getForeignProperties().rrule;
          if (rrule) {
              newEventsList.push(...createRecurrencesForEvent(this.$app, newEvent, rrule));
          }
          this.$app.calendarEvents.list.value = newEventsList;
      }
      get(id) {
          var _a;
          return (_a = this.$app.calendarEvents.list.value
              .find((event) => event.id === id && !event.isCopy)) === null || _a === void 0 ? void 0 : _a._getExternalEvent();
      }
      getAll() {
          return this.$app.calendarEvents.list.value
              .filter((event) => !event.isCopy)
              .map((event) => event._getExternalEvent());
      }
      remove(id) {
          this.$app.calendarEvents.list.value =
              this.$app.calendarEvents.list.value.filter((event) => event.id !== id);
      }
      update(event) {
          this.removeOriginalAndCopiesForId(event.id);
          const updatedEvent = externalEventToInternal(event, this.$app.config);
          const copiedEvents = [...this.$app.calendarEvents.list.value, updatedEvent];
          const rrule = updatedEvent._getForeignProperties().rrule;
          if (rrule) {
              copiedEvents.push(...createRecurrencesForEvent(this.$app, updatedEvent, rrule));
          }
          this.$app.calendarEvents.list.value = copiedEvents;
      }
      removeOriginalAndCopiesForId(eventId) {
          this.$app.calendarEvents.list.value =
              this.$app.calendarEvents.list.value.filter((e) => e.id !== eventId);
      }
  }

  class ResizeUpdater {
      constructor($app) {
          Object.defineProperty(this, "$app", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: $app
          });
      }
      update(eventId, oldEventEnd, newEventEnd) {
          this.deleteAllCopiesForEvent(eventId);
          const eventToUpdate = this.$app.calendarEvents.list.value.find((event) => event.id === eventId && !event.isCopy);
          if (!eventToUpdate)
              throw new Error('Tried to update a non-existing event');
          eventToUpdate.end = this.getNewEventEnd(newEventEnd, eventToUpdate, oldEventEnd);
          return eventToUpdate;
      }
      getNewEventEnd(newEventEnd, eventToUpdate, oldEventEnd) {
          return dateTimeStringRegex.test(newEventEnd)
              ? addMinutes(eventToUpdate.end, getDurationInMinutes(oldEventEnd, newEventEnd))
              : addDays(eventToUpdate.end, calculateDaysDifference(oldEventEnd, newEventEnd));
      }
      deleteAllCopiesForEvent(eventId) {
          this.$app.calendarEvents.list.value =
              this.$app.calendarEvents.list.value.filter((event) => event.id !== eventId || !event.isCopy);
      }
  }

  class EventRecurrencePluginImpl {
      constructor() {
          Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: PluginName.EventRecurrence
          });
          Object.defineProperty(this, "$app", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: null
          });
      }
      onRender($app) {
          this.$app = $app;
          this.createRecurrencesForEvents();
      }
      get eventsFacade() {
          console.warn('[Schedule-X warning]: the eventsFacade is deprecated and will be removed in v2. Please use the createEventsServicePlugin function from @schedule-x/event-recurrence instead. Docs: https://schedule-x.dev/docs/calendar/plugins/recurrence');
          if (!this.$app)
              throw new Error('Plugin not yet initialized. The events facade is not intended to add the initial events. For adding events upon rendering, add them directly to the configuration object passed to `createCalendar`, or `useCalendarApp` if you are using the React component');
          return new EventsFacadeImpl(this.$app);
      }
      updateRecurrenceDND(eventId, oldEventStart, newEventStart) {
          const { updatedEvent, recurrenceSet } = new DndUpdater(this.$app).update(eventId, oldEventStart, newEventStart);
          this.$app.calendarEvents.list.value = [
              ...this.$app.calendarEvents.list.value,
              ...this.createRecurrencesForEvent(updatedEvent, recurrenceSet.getRrule()),
          ];
      }
      updateRecurrenceOnResize(eventId, oldEventEnd, newEventEnd) {
          const updatedEvent = new ResizeUpdater(this.$app).update(eventId, oldEventEnd, newEventEnd);
          this.$app.calendarEvents.list.value = [
              ...this.$app.calendarEvents.list.value,
              ...this.createRecurrencesForEvent(updatedEvent, updatedEvent._getForeignProperties().rrule),
          ];
      }
      createRecurrencesForEvents() {
          const recurrencesToCreate = [];
          const $app = this.$app;
          $app.calendarEvents.list.value.forEach((event) => {
              const rrule = event._getForeignProperties().rrule;
              if (rrule) {
                  recurrencesToCreate.push(...this.createRecurrencesForEvent(event, rrule));
              }
          });
          $app.calendarEvents.list.value = [
              ...this.$app.calendarEvents.list.value,
              ...recurrencesToCreate,
          ];
      }
      createRecurrencesForEvent(calendarEvent, rrule) {
          return createRecurrencesForEvent(this.$app, calendarEvent, rrule);
      }
  }
  const createEventRecurrencePlugin = () => {
      return definePlugin('eventRecurrence', new EventRecurrencePluginImpl());
  };

  class EventsServicePluginImpl {
      constructor() {
          Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: 'eventsService'
          });
          Object.defineProperty(this, "$app", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
          Object.defineProperty(this, "eventsFacade", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: void 0
          });
      }
      beforeRender($app) {
          this.$app = $app;
          // TODO v3: move methods from events facade to here, and remove events facade
          this.eventsFacade = new EventsFacadeImpl(this.$app);
      }
      add(event) {
          if (!this.$app)
              this.throwNotInitializedError();
          this.eventsFacade.add(event);
      }
      update(event) {
          if (!this.$app)
              this.throwNotInitializedError();
          this.eventsFacade.update(event);
      }
      remove(eventId) {
          if (!this.$app)
              this.throwNotInitializedError();
          this.eventsFacade.remove(eventId);
      }
      get(eventId) {
          if (!this.$app)
              this.throwNotInitializedError();
          return this.eventsFacade.get(eventId);
      }
      getAll() {
          if (!this.$app)
              this.throwNotInitializedError();
          return this.eventsFacade.getAll();
      }
      set(events) {
          if (!this.$app)
              this.throwNotInitializedError();
          this.eventsFacade.set(events);
      }
      throwNotInitializedError() {
          throw new Error('Plugin not yet initialized. The events service plugin is not intended to add the initial events. For adding events upon rendering, add them directly to the configuration object passed to `createCalendar`, or `useCalendarApp` if you are using the React component');
      }
  }
  const createEventsServicePlugin = () => {
      return definePlugin('eventsService', new EventsServicePluginImpl());
  };

  exports.createEventRecurrencePlugin = createEventRecurrencePlugin;
  exports.createEventsServicePlugin = createEventsServicePlugin;

}));
