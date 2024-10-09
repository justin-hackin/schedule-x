(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('preact/jsx-runtime')) :
  typeof define === 'function' && define.amd ? define(['exports', 'preact/jsx-runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SXRecurrence = {}));
})(this, (function (exports) { 'use strict';

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

  const calculateDaysDifference = (startDate, endDate) => {
      const { year: sYear, month: sMonth, date: sDate } = toIntegers(startDate);
      const { year: eYear, month: eMonth, date: eDate } = toIntegers(endDate);
      const startDateObj = new Date(sYear, sMonth, sDate);
      const endDateObj = new Date(eYear, eMonth, eDate);
      const timeDifference = endDateObj.getTime() - startDateObj.getTime();
      return Math.round(timeDifference / (1000 * 3600 * 24));
  };

  // regex for strings between 00:00 and 23:59
  const dateTimeStringRegex = /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

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

  exports.RecurrenceSet = RecurrenceSet;

}));
