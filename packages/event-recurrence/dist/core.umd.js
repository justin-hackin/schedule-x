;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(
        exports,
        require('preact/jsx-runtime'),
        require('@preact/signals')
      )
    : typeof define === 'function' && define.amd
      ? define(['exports', 'preact/jsx-runtime', '@preact/signals'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.SXEventRecurrence = {}), null, global.preactSignals))
})(this, function (exports, jsxRuntime, signals) {
  'use strict'

  var PluginName
  ;(function (PluginName) {
    PluginName['DragAndDrop'] = 'dragAndDrop'
    PluginName['EventModal'] = 'eventModal'
    PluginName['ScrollController'] = 'scrollController'
    PluginName['EventRecurrence'] = 'eventRecurrence'
    PluginName['Resize'] = 'resize'
    PluginName['CalendarControls'] = 'calendarControls'
    PluginName['CurrentTime'] = 'currentTime'
  })(PluginName || (PluginName = {}))

  const definePlugin = (name, definition) => {
    definition.name = name
    return definition
  }

  class NumberRangeError extends Error {
    constructor(min, max) {
      super(`Number must be between ${min} and ${max}.`)
      Object.defineProperty(this, 'min', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: min,
      })
      Object.defineProperty(this, 'max', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: max,
      })
    }
  }

  const doubleDigit = (number) => {
    if (number < 0 || number > 99) throw new NumberRangeError(0, 99)
    return String(number).padStart(2, '0')
  }

  const toDateString = (date) => {
    return `${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)}`
  }
  const jsDateToTimeString = (date) => {
    return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__jsDateToDateString = (date) => {
    return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__jsDatetToDateTimeString = (date) => {
    return `${__deprecated__jsDateToDateString(date)} ${jsDateToTimeString(date)}`
  }

  class InvalidTimeStringError extends Error {
    constructor(timeString) {
      super(`Invalid time string: ${timeString}`)
    }
  }

  // regex for strings between 00:00 and 23:59
  const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/
  const sxDateTimeStringRegex =
    /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/

  const minuteTimePointMultiplier = 1.6666666666666667 // 100 / 60
  const timePointsFromString = (timeString) => {
    if (!timeStringRegex.test(timeString) && timeString !== '24:00')
      throw new InvalidTimeStringError(timeString)
    const [hoursInt, minutesInt] = timeString
      .split(':')
      .map((time) => parseInt(time, 10))
    let minutePoints = (minutesInt * minuteTimePointMultiplier).toString()
    if (minutePoints.split('.')[0].length < 2) minutePoints = `0${minutePoints}`
    return Number(hoursInt + minutePoints)
  }

  const dateFromDateTime = (dateTime) => {
    return dateTime.slice(0, 10)
  }
  const timeFromDateTime = (dateTime) => {
    return dateTime.slice(11)
  }

  var WeekDay
  ;(function (WeekDay) {
    WeekDay[(WeekDay['MONDAY'] = 1)] = 'MONDAY'
    WeekDay[(WeekDay['TUESDAY'] = 2)] = 'TUESDAY'
    WeekDay[(WeekDay['WEDNESDAY'] = 3)] = 'WEDNESDAY'
    WeekDay[(WeekDay['THURSDAY'] = 4)] = 'THURSDAY'
    WeekDay[(WeekDay['FRIDAY'] = 5)] = 'FRIDAY'
    WeekDay[(WeekDay['SATURDAY'] = 6)] = 'SATURDAY'
    WeekDay[(WeekDay['SUNDAY'] = 7)] = 'SUNDAY'
  })(WeekDay || (WeekDay = {}))

  WeekDay.MONDAY
  const DEFAULT_EVENT_COLOR_NAME = 'primary'

  class CalendarEventImpl {
    constructor(
      _config,
      id,
      _start,
      _end,
      title,
      people,
      location,
      description,
      calendarId,
      _options = undefined,
      _customContent = {},
      _foreignProperties = {}
    ) {
      Object.defineProperty(this, '_config', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _config,
      })
      Object.defineProperty(this, 'id', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: id,
      })
      Object.defineProperty(this, '_start', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _start,
      })
      Object.defineProperty(this, '_end', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _end,
      })
      Object.defineProperty(this, 'title', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: title,
      })
      Object.defineProperty(this, 'people', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: people,
      })
      Object.defineProperty(this, 'location', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: location,
      })
      Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: description,
      })
      Object.defineProperty(this, 'calendarId', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: calendarId,
      })
      Object.defineProperty(this, '_options', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _options,
      })
      Object.defineProperty(this, '_customContent', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _customContent,
      })
      Object.defineProperty(this, '_foreignProperties', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _foreignProperties,
      })
      Object.defineProperty(this, '_previousConcurrentEvents', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_totalConcurrentEvents', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_maxConcurrentEvents', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_nDaysInGrid', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_createdAt', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_originalTimezone', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_eventFragments', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: {},
      })
      this._originalTimezone =
        this._start instanceof Temporal.ZonedDateTime
          ? this._start.timeZoneId
          : undefined
    }
    get start() {
      if (this._start instanceof Temporal.PlainDate) {
        return this._start
      }
      return this._start.withTimeZone(this._config.timezone.value)
    }
    set start(value) {
      this._start =
        value instanceof Temporal.ZonedDateTime
          ? value.withTimeZone(this._originalTimezone)
          : value
    }
    get end() {
      if (this._end instanceof Temporal.PlainDate) {
        return this._end
      }
      return this._end.withTimeZone(this._config.timezone.value)
    }
    set end(value) {
      this._end =
        value instanceof Temporal.ZonedDateTime
          ? value.withTimeZone(this._originalTimezone)
          : value
    }
    get _isSingleDayTimed() {
      if (
        this.start instanceof Temporal.PlainDate ||
        this.end instanceof Temporal.PlainDate
      )
        return false
      const localStartDate = dateFromDateTime(this.start.toString())
      const localEndDate = dateFromDateTime(this.end.toString())
      return localStartDate === localEndDate
    }
    get _isSingleDayFullDay() {
      const startDate = dateFromDateTime(this.start.toString())
      const endDate = dateFromDateTime(this.end.toString())
      return (
        startDate === endDate &&
        this.start instanceof Temporal.PlainDate &&
        this.end instanceof Temporal.PlainDate
      )
    }
    get _isMultiDayTimed() {
      if (
        this.start instanceof Temporal.PlainDate ||
        this.end instanceof Temporal.PlainDate
      )
        return false
      const startDate = dateFromDateTime(this.start.toString())
      const endDate = dateFromDateTime(this.end.toString())
      return startDate !== endDate
    }
    get _isMultiDayFullDay() {
      const startDate = dateFromDateTime(this.start.toString())
      const endDate = dateFromDateTime(this.end.toString())
      return (
        this.start instanceof Temporal.PlainDate &&
        this.end instanceof Temporal.PlainDate &&
        startDate !== endDate
      )
    }
    get _isSingleHybridDayTimed() {
      if (!this._config.isHybridDay) return false
      if (
        this.start instanceof Temporal.PlainDate ||
        this.end instanceof Temporal.PlainDate
      )
        return false
      const startDate = dateFromDateTime(this.start.toString())
      const endDate = dateFromDateTime(this.end.toString())
      const endDateMinusOneDay = toDateString(
        Temporal.PlainDate.from(endDate).subtract({ days: 1 })
      )
      if (startDate !== endDate && startDate !== endDateMinusOneDay)
        return false
      const dayBoundaries = this._config.dayBoundaries.value
      const eventStartTimePoints = timePointsFromString(
        timeFromDateTime(this.start.toString())
      )
      const eventEndTimePoints = timePointsFromString(
        timeFromDateTime(this.end.toString())
      )
      const eventIsFullyInFirstDayOfBoundary =
        eventEndTimePoints > eventStartTimePoints && startDate === endDate
      return (
        (eventStartTimePoints >= dayBoundaries.start &&
          (eventEndTimePoints <= dayBoundaries.end ||
            eventIsFullyInFirstDayOfBoundary)) ||
        (eventStartTimePoints < dayBoundaries.end &&
          eventEndTimePoints <= dayBoundaries.end)
      )
    }
    get _color() {
      if (
        this.calendarId &&
        this._config.calendars.value &&
        this.calendarId in this._config.calendars.value
      ) {
        return this._config.calendars.value[this.calendarId].colorName
      }
      return DEFAULT_EVENT_COLOR_NAME
    }
    _getForeignProperties() {
      return this._foreignProperties
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
      }
    }
  }

  class CalendarEventBuilder {
    constructor(_config, id, start, end) {
      Object.defineProperty(this, '_config', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _config,
      })
      Object.defineProperty(this, 'id', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: id,
      })
      Object.defineProperty(this, 'start', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: start,
      })
      Object.defineProperty(this, 'end', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: end,
      })
      Object.defineProperty(this, 'people', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'location', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'title', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'calendarId', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, '_foreignProperties', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: {},
      })
      Object.defineProperty(this, '_options', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined,
      })
      Object.defineProperty(this, '_customContent', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: {},
      })
    }
    build() {
      return new CalendarEventImpl(
        this._config,
        this.id,
        this.start,
        this.end,
        this.title,
        this.people,
        this.location,
        this.description,
        this.calendarId,
        this._options,
        this._customContent,
        this._foreignProperties
      )
    }
    withTitle(title) {
      this.title = title
      return this
    }
    withPeople(people) {
      this.people = people
      return this
    }
    withLocation(location) {
      this.location = location
      return this
    }
    withDescription(description) {
      this.description = description
      return this
    }
    withForeignProperties(foreignProperties) {
      this._foreignProperties = foreignProperties
      return this
    }
    withCalendarId(calendarId) {
      this.calendarId = calendarId
      return this
    }
    withOptions(options) {
      this._options = options
      return this
    }
    withCustomContent(customContent) {
      this._customContent = customContent
      return this
    }
  }

  const deepCloneEvent = (calendarEvent, $app) => {
    const calendarEventInternal = new CalendarEventBuilder(
      $app.config,
      calendarEvent.id,
      calendarEvent._start,
      calendarEvent._end
    )
      .withTitle(calendarEvent.title)
      .withPeople(calendarEvent.people)
      .withCalendarId(calendarEvent.calendarId)
      .withForeignProperties(
        JSON.parse(JSON.stringify(calendarEvent._getForeignProperties()))
      )
      .withLocation(calendarEvent.location)
      .withDescription(calendarEvent.description)
      .withOptions(calendarEvent._options)
      .withCustomContent(calendarEvent._customContent)
      .build()
    calendarEventInternal._nDaysInGrid = calendarEvent._nDaysInGrid
    return calendarEventInternal
  }

  const DateFormats = {
    DATE_STRING: /^\d{4}-\d{2}-\d{2}$/,
    DATE_TIME_STRING: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
  }

  class InvalidDateTimeError extends Error {
    constructor(dateTimeSpecification) {
      super(`Invalid date time specification: ${dateTimeSpecification}`)
    }
  }

  const toJSDate = (dateTimeSpecification) => {
    if (
      !DateFormats.DATE_TIME_STRING.test(dateTimeSpecification) &&
      !DateFormats.DATE_STRING.test(dateTimeSpecification)
    )
      throw new InvalidDateTimeError(dateTimeSpecification)
    return new Date(
      Number(dateTimeSpecification.slice(0, 4)),
      Number(dateTimeSpecification.slice(5, 7)) - 1,
      Number(dateTimeSpecification.slice(8, 10)),
      Number(dateTimeSpecification.slice(11, 13)), // for date strings this will be 0
      Number(dateTimeSpecification.slice(14, 16)) // for date strings this will be 0
    )
  }
  const toIntegers = (dateTimeSpecification) => {
    const hours = dateTimeSpecification.slice(11, 13),
      minutes = dateTimeSpecification.slice(14, 16)
    return {
      year: Number(dateTimeSpecification.slice(0, 4)),
      month: Number(dateTimeSpecification.slice(5, 7)) - 1,
      date: Number(dateTimeSpecification.slice(8, 10)),
      hours: hours !== '' ? Number(hours) : undefined,
      minutes: minutes !== '' ? Number(minutes) : undefined,
    }
  }

  const addDays = (to, nDays) => {
    if (nDays < 0) {
      return to.subtract({ days: -nDays })
    }
    return to.add({ days: nDays })
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__addMinutes = (to, nMinutes) => {
    const { year, month, date, hours, minutes } = toIntegers(to)
    const isDateTimeString = hours !== undefined && minutes !== undefined
    const jsDate = new Date(
      year,
      month,
      date,
      hours !== null && hours !== void 0 ? hours : 0,
      minutes !== null && minutes !== void 0 ? minutes : 0
    )
    jsDate.setMinutes(jsDate.getMinutes() + nMinutes)
    if (isDateTimeString) {
      return __deprecated__jsDatetToDateTimeString(jsDate)
    }
    return __deprecated__jsDateToDateString(jsDate)
  }
  const addMinutesToTemporal = (to, nMinutes) => {
    if (nMinutes < 0) {
      return to.subtract({ minutes: -nMinutes })
    }
    return to.add({ minutes: nMinutes })
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__addYears = (to, nYears) => {
    const { year, month, date, hours, minutes } = toIntegers(to)
    const isDateTimeString = hours !== undefined && minutes !== undefined
    const jsDate = new Date(
      year,
      month,
      date,
      hours !== null && hours !== void 0 ? hours : 0,
      minutes !== null && minutes !== void 0 ? minutes : 0
    )
    jsDate.setFullYear(jsDate.getFullYear() + nYears)
    if (isDateTimeString) {
      return __deprecated__jsDatetToDateTimeString(jsDate)
    }
    return __deprecated__jsDateToDateString(jsDate)
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__addDaysToDateOrDateTime = (to, nDays) => {
    const { year, month, date, hours, minutes } = toIntegers(to)
    const isDateTimeString = hours !== undefined && minutes !== undefined
    const jsDate = new Date(
      year,
      month,
      date,
      hours !== null && hours !== void 0 ? hours : 0,
      minutes !== null && minutes !== void 0 ? minutes : 0
    )
    jsDate.setDate(jsDate.getDate() + nDays)
    if (isDateTimeString) {
      return __deprecated__jsDatetToDateTimeString(jsDate)
    }
    return __deprecated__jsDateToDateString(jsDate)
  }
  /**
   * @deprecated
   *
   * was kept during Temporal migration, to reduce risk in recurrence package, which internally still uses non-Temporal formats
   */
  const __deprecated__addMonthsToDateOrDatetime = (to, nMonths) => {
    const { year, month, date, hours, minutes } = toIntegers(to)
    const isDateTimeString = hours !== undefined && minutes !== undefined
    const jsDate = new Date(
      year,
      month,
      date,
      hours !== null && hours !== void 0 ? hours : 0,
      minutes !== null && minutes !== void 0 ? minutes : 0
    )
    let expectedMonth = (jsDate.getMonth() + nMonths) % 12
    if (expectedMonth < 0) expectedMonth += 12
    jsDate.setMonth(jsDate.getMonth() + nMonths)
    // handle date overflow and underflow
    if (jsDate.getMonth() > expectedMonth) {
      jsDate.setDate(0)
    } else if (jsDate.getMonth() < expectedMonth) {
      jsDate.setMonth(jsDate.getMonth() + 1)
      jsDate.setDate(0)
    }
    if (isDateTimeString) {
      return __deprecated__jsDatetToDateTimeString(jsDate)
    }
    return __deprecated__jsDateToDateString(jsDate)
  }

  const calculateDaysDifference = (startDate, endDate) => {
    return Temporal.PlainDate.from(startDate)
      .until(Temporal.PlainDate.from(endDate))
      .total('days')
  }

  const getDurationInMinutes = (dtstart, dtend) => {
    const dtStartJS = toJSDate(dtstart)
    const dtEndJS = toJSDate(dtend)
    return (dtEndJS.getTime() - dtStartJS.getTime()) / 1000 / 60
  }
  const getDurationInMinutesTemporal = (dtstart, dtend) => {
    return (dtend.epochMilliseconds - dtstart.epochMilliseconds) / 1000 / 60
  }

  class RRuleUpdater {
    constructor(rruleOptions, dtstartOld, dtstartNew) {
      Object.defineProperty(this, 'rruleOptions', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: rruleOptions,
      })
      Object.defineProperty(this, 'dtstartOld', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dtstartOld,
      })
      Object.defineProperty(this, 'dtstartNew', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dtstartNew,
      })
      Object.defineProperty(this, 'rruleOptionsNew', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      this.rruleOptionsNew = { ...rruleOptions }
      this.updateByDay()
      this.updateByMonthDay()
      this.updateUntil()
    }
    updateByDay() {
      var _a
      if (!this.rruleOptions.byday) return
      const daysDifference = calculateDaysDifference(
        Temporal.PlainDate.from(this.dtstartOld),
        Temporal.PlainDate.from(this.dtstartNew)
      )
      const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
      const daysToShift = daysDifference % 7
      if (daysToShift === 0) return
      ;(_a = this.rruleOptionsNew.byday) === null || _a === void 0
        ? void 0
        : _a.forEach((day, index) => {
            const dayIndex = days.indexOf(day)
            const newIndex = dayIndex + daysToShift
            if (newIndex >= days.length) {
              this.rruleOptionsNew.byday[index] = days[newIndex - days.length]
            } else if (newIndex < 0) {
              this.rruleOptionsNew.byday[index] = days[days.length + newIndex]
            } else {
              this.rruleOptionsNew.byday[index] = days[newIndex]
            }
          })
    }
    updateByMonthDay() {
      if (!this.rruleOptions.bymonthday) return
      this.rruleOptionsNew.bymonthday = toJSDate(this.dtstartNew).getDate()
    }
    updateUntil() {
      if (!this.rruleOptions.until) return
      const dtstartOld = this.dtstartOld
      const isDateTime = sxDateTimeStringRegex.test(dtstartOld)
      this.rruleOptionsNew.until = isDateTime
        ? __deprecated__addMinutes(
            this.rruleOptionsNew.until,
            getDurationInMinutes(this.dtstartOld, this.dtstartNew)
          ).toString()
        : addDays(
            Temporal.PlainDate.from(this.rruleOptionsNew.until),
            calculateDaysDifference(
              Temporal.PlainDate.from(this.dtstartOld),
              Temporal.PlainDate.from(this.dtstartNew)
            )
          ).toString()
    }
    getUpdatedRRuleOptions() {
      return this.rruleOptionsNew
    }
  }

  var RRuleFreq
  ;(function (RRuleFreq) {
    RRuleFreq['YEARLY'] = 'YEARLY'
    RRuleFreq['MONTHLY'] = 'MONTHLY'
    RRuleFreq['WEEKLY'] = 'WEEKLY'
    RRuleFreq['DAILY'] = 'DAILY'
  })(RRuleFreq || (RRuleFreq = {}))

  const rfc5455Weekdays = Object.freeze([
    'SU',
    'MO',
    'TU',
    'WE',
    'TH',
    'FR',
    'SA',
  ])

  const rruleStringToJS = (rrule) => {
    const rruleOptions = {
      freq: RRuleFreq.WEEKLY,
    }
    const rruleOptionsArray = rrule.split(';')
    rruleOptionsArray.forEach((option) => {
      const [key, value] = option.split('=')
      if (key === 'FREQ') rruleOptions.freq = value
      if (key === 'BYDAY') rruleOptions.byday = value.split(',')
      if (key === 'BYMONTHDAY') rruleOptions.bymonthday = Number(value)
      if (key === 'UNTIL') rruleOptions.until = parseRFC5545ToSX(value)
      if (key === 'COUNT') rruleOptions.count = Number(value)
      if (key === 'INTERVAL') rruleOptions.interval = Number(value)
      if (key === 'WKST') {
        if (!rfc5455Weekdays.includes(value)) {
          throw new Error(`Invalid WKST value: ${value}`)
        }
        rruleOptions.wkst = value
      }
    })
    return rruleOptions
  }
  const rruleJSToString = (rruleOptions) => {
    let rrule = `FREQ=${rruleOptions.freq}`
    if (rruleOptions.until)
      rrule += `;UNTIL=${parseSXToRFC5545(rruleOptions.until)}`
    if (rruleOptions.count) rrule += `;COUNT=${rruleOptions.count}`
    if (rruleOptions.interval) rrule += `;INTERVAL=${rruleOptions.interval}`
    if (rruleOptions.byday) rrule += `;BYDAY=${rruleOptions.byday.join(',')}`
    if (rruleOptions.bymonthday)
      rrule += `;BYMONTHDAY=${rruleOptions.bymonthday}`
    if (rruleOptions.wkst) rrule += `;WKST=${rruleOptions.wkst}`
    return rrule
  }
  const parseSXToRFC5545 = (datetime) => {
    datetime = datetime.replace(/-/g, '')
    datetime = datetime.replace(/:/g, '')
    datetime = datetime.replace(' ', 'T')
    if (/T\d{4}$/.test(datetime)) datetime += '00' // add seconds if not present
    return datetime
  }
  const parseTemporalToRFC5545 = (dateOrDatetime) => {
    const year = dateOrDatetime.year.toString().padStart(4, '0')
    const month = dateOrDatetime.month.toString().padStart(2, '0')
    const day = dateOrDatetime.day.toString().padStart(2, '0')
    if (dateOrDatetime instanceof Temporal.ZonedDateTime) {
      const hour = dateOrDatetime.hour.toString().padStart(2, '0')
      const minute = dateOrDatetime.minute.toString().padStart(2, '0')
      const second = dateOrDatetime.second.toString().padStart(2, '0')
      return `${year}${month}${day}T${hour}${minute}${second}`
    }
    if (dateOrDatetime instanceof Temporal.PlainDate) {
      return `${year}${month}${day}`
    }
    throw new Error(`Invalid datetime format: ${dateOrDatetime}`)
  }
  const parseRFC5545ToTemporal = (dateOrDatetime, timezone) => {
    if (dateOrDatetime.length === 15) {
      // given YYYYMMDDThhmmss format
      const year = dateOrDatetime.substring(0, 4)
      const month = dateOrDatetime.substring(4, 6)
      const day = dateOrDatetime.substring(6, 8)
      const hour = dateOrDatetime.substring(9, 11)
      const minute = dateOrDatetime.substring(11, 13)
      const second = dateOrDatetime.substring(13, 15)
      return Temporal.ZonedDateTime.from({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second),
        timeZone: timezone,
      })
    }
    if (dateOrDatetime.length === 8) {
      // given YYYYMMDD format
      const year = dateOrDatetime.substring(0, 4)
      const month = dateOrDatetime.substring(4, 6)
      const day = dateOrDatetime.substring(6, 8)
      return Temporal.PlainDate.from({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
      })
    }
    throw new Error(`Invalid RFC5545 format: ${dateOrDatetime}`)
  }
  const parseRFC5545ToSX = (datetime) => {
    datetime = datetime.replace('T', ' ')
    datetime = datetime.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    datetime = datetime.replace(/(\d{2})(\d{2})(\d{2})$/, '$1:$2')
    return datetime
  }

  function getFirstDateOfWeek(date, firstDayOfWeek) {
    const dateIsNthDayOfWeek = date.getDay() - firstDayOfWeek
    const firstDateOfWeek = date
    if (dateIsNthDayOfWeek === 0) {
      return firstDateOfWeek
    } else if (dateIsNthDayOfWeek > 0) {
      firstDateOfWeek.setDate(date.getDate() - dateIsNthDayOfWeek)
    } else {
      firstDateOfWeek.setDate(date.getDate() - (7 + dateIsNthDayOfWeek))
    }
    return firstDateOfWeek
  }
  const getWeekForDate = (date, firstDayOfWeek = 0) => {
    const dateJS = toJSDate(date)
    const startOfWeek = getFirstDateOfWeek(dateJS, firstDayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + index)
      return __deprecated__jsDateToDateString(day)
    })
  }

  const bydayJSDayMap = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  }
  const getJSDayFromByday = (byday) => {
    return bydayJSDayMap[byday]
  }

  const isDatePastUntil = (date, until) => {
    /* RFC5545: #2 */
    return until && date > until
  }
  const isCountReached = (count, maxCount) => {
    return maxCount && count >= maxCount
  }

  const weeklyIterator = (dtstart, rruleOptions) => {
    var _a
    const timeInDtstart = timeFromDateTime(dtstart)
    const weekDaysJS = ((_a = rruleOptions.byday) === null || _a === void 0
      ? void 0
      : _a.map(getJSDayFromByday)) || [toJSDate(dtstart).getDay()]
    let currentDate = dtstart
    const allDateTimes = []
    const firstDayOfWeek = rruleOptions.wkst
      ? ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(rruleOptions.wkst)
      : 0
    return {
      next() {
        const week = getWeekForDate(currentDate, firstDayOfWeek)
        const candidatesDates = week
          .filter((date) => weekDaysJS.includes(toJSDate(date).getDay()))
          .map((date) => {
            if (timeInDtstart) {
              return `${date} ${timeInDtstart}`
            }
            return date
          })
        candidatesDates.forEach((candidate) => {
          if (
            candidate >= dtstart &&
            !isCountReached(allDateTimes.length, rruleOptions.count) &&
            !isDatePastUntil(candidate, rruleOptions.until)
          ) {
            allDateTimes.push(candidate)
          }
        })
        if (
          isDatePastUntil(currentDate, rruleOptions.until) ||
          isCountReached(allDateTimes.length, rruleOptions.count)
        ) {
          return { done: true, value: allDateTimes }
        }
        const nextDateJS = toJSDate(currentDate)
        nextDateJS.setDate(nextDateJS.getDate() + 7 * rruleOptions.interval)
        currentDate = __deprecated__jsDateToDateString(nextDateJS)
        return { done: false, value: allDateTimes }
      },
    }
  }
  const weeklyIteratorResult = (dtstart, rruleOptions) => {
    const weeklyIter = weeklyIterator(dtstart, rruleOptions)
    let result = weeklyIter.next()
    while (!result.done) {
      result = weeklyIter.next()
    }
    return result.value
  }

  const dailyIterator = (dtstart, rruleOptions) => {
    var _a
    let currentDate = dtstart
    const allDateTimes = []
    const bydayNumbers =
      ((_a = rruleOptions.byday) === null || _a === void 0
        ? void 0
        : _a.map(getJSDayFromByday)) || undefined
    return {
      next() {
        if (
          !isCountReached(allDateTimes.length, rruleOptions.count) &&
          !isDatePastUntil(currentDate, rruleOptions.until)
        ) {
          if (bydayNumbers) {
            const dayOfWeek = toJSDate(currentDate).getDay()
            if (bydayNumbers.includes(dayOfWeek)) {
              allDateTimes.push(currentDate)
            }
          } else {
            allDateTimes.push(currentDate)
          }
        }
        if (
          isDatePastUntil(currentDate, rruleOptions.until) ||
          isCountReached(allDateTimes.length, rruleOptions.count)
        ) {
          return { done: true, value: allDateTimes }
        }
        currentDate = __deprecated__addDaysToDateOrDateTime(
          currentDate,
          rruleOptions.interval
        )
        return { done: false, value: allDateTimes }
      },
    }
  }
  const dailyIteratorResult = (dtstart, rruleOptions) => {
    const dailyIter = dailyIterator(dtstart, rruleOptions)
    let result = dailyIter.next()
    while (!result.done) {
      result = dailyIter.next()
    }
    return result.value
  }

  const DATE_PADDING_LENGTH = 2
  const TIME_PADDING_CHAR = '0'
  const formatDateTime = (year, month, day, hours, minutes) => {
    const monthStr = String(month + 1).padStart(
      DATE_PADDING_LENGTH,
      TIME_PADDING_CHAR
    )
    const dayStr = String(day).padStart(DATE_PADDING_LENGTH, TIME_PADDING_CHAR)
    if (hours !== undefined && minutes !== undefined) {
      const hoursStr = String(hours).padStart(
        DATE_PADDING_LENGTH,
        TIME_PADDING_CHAR
      )
      const minutesStr = String(minutes).padStart(
        DATE_PADDING_LENGTH,
        TIME_PADDING_CHAR
      )
      return `${year}-${monthStr}-${dayStr} ${hoursStr}:${minutesStr}`
    }
    return `${year}-${monthStr}-${dayStr}`
  }
  const formatDateTimeFromString = (dateTime, year, month, day) => {
    const { hours, minutes } = toIntegers(dateTime)
    return formatDateTime(year, month, day, hours, minutes)
  }

  const parseBydaySpec = (daySpec) => {
    // Validate input format: optional position followed by two-letter day code
    const match = daySpec.match(/^([+-]?\d*)([A-Z]{2})$/)
    if (!match) return null
    const [, positionStr, dayCode] = match
    let position
    if (positionStr === '') {
      position = undefined
    } else {
      // Use Number for strict parsing so malformed specs (e.g. "1X") produce NaN
      const parsedPosition = Number(positionStr)
      if (Number.isNaN(parsedPosition)) {
        return null
      }
      // RFC 5545 allows positions from -366 to -1 and 1 to 366
      if (
        parsedPosition === 0 ||
        parsedPosition > 366 ||
        parsedPosition < -366
      ) {
        return null
      }
      position = parsedPosition
    }
    const weekday = getJSDayFromByday(dayCode)
    if (weekday === undefined) return null
    return {
      position,
      weekday,
      dayCode,
    }
  }
  const getWeekdayOccurrencesInMonth = (year, month, weekday) => {
    const occurrences = []
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day)
      if (date.getDay() === weekday) {
        occurrences.push(day)
      }
    }
    return occurrences
  }
  const getNthWeekdayOfMonth = (year, month, weekday, position) => {
    const occurrences = getWeekdayOccurrencesInMonth(year, month, weekday)
    if (position > 0) {
      return position <= occurrences.length ? occurrences[position - 1] : -1
    } else if (position < 0) {
      const index = occurrences.length + position
      return index >= 0 ? occurrences[index] : -1
    }
    return -1
  }

  const monthlyIteratorBymonthday = (dtstart, options) => {
    let currentDate = dtstart
    const allDateTimes = []
    return {
      next() {
        if (
          !isCountReached(allDateTimes.length, options.count) &&
          !isDatePastUntil(currentDate, options.until)
        ) {
          allDateTimes.push(currentDate)
        }
        if (
          isDatePastUntil(currentDate, options.until) ||
          isCountReached(allDateTimes.length, options.count)
        ) {
          return { done: true, value: allDateTimes }
        }
        const nextCurrentDateCandidate =
          __deprecated__addMonthsToDateOrDatetime(currentDate, options.interval)
        let currentIntervalCandidate = options.interval
        let { date: nextMonthDateCandidate } = toIntegers(
          nextCurrentDateCandidate
        )
        while (nextMonthDateCandidate !== options.bymonthday) {
          currentIntervalCandidate += options.interval
          nextMonthDateCandidate = toIntegers(
            __deprecated__addMonthsToDateOrDatetime(
              currentDate,
              currentIntervalCandidate
            )
          ).date
        }
        currentDate = __deprecated__addMonthsToDateOrDatetime(
          currentDate,
          currentIntervalCandidate
        )
        return { done: false, value: allDateTimes }
      },
    }
  }
  const monthlyIteratorByday = (dtstart, options) => {
    let currentDate = dtstart
    const allDateTimes = []
    return {
      next() {
        if (
          !isCountReached(allDateTimes.length, options.count) &&
          !isDatePastUntil(currentDate, options.until)
        ) {
          const candidates = getMonthlyBydayCandidates(
            currentDate,
            options.byday
          )
          for (const candidate of candidates) {
            if (
              candidate >= dtstart &&
              !isDatePastUntil(candidate, options.until)
            ) {
              allDateTimes.push(candidate)
              if (isCountReached(allDateTimes.length, options.count)) {
                return { done: true, value: allDateTimes }
              }
            }
          }
        }
        if (
          isDatePastUntil(currentDate, options.until) ||
          isCountReached(allDateTimes.length, options.count)
        ) {
          return { done: true, value: allDateTimes }
        }
        currentDate = __deprecated__addMonthsToDateOrDatetime(
          currentDate,
          options.interval
        )
        return { done: false, value: allDateTimes }
      },
    }
  }
  const getMonthlyBydayCandidates = (dateTime, byday) => {
    const candidates = []
    const { year, month } = toIntegers(dateTime)
    // Group byday specs by weekday for efficient processing
    const weekdaySpecs = new Map()
    for (const daySpec of byday) {
      const parsed = parseBydaySpec(daySpec)
      if (!parsed) continue
      if (!weekdaySpecs.has(parsed.weekday)) {
        weekdaySpecs.set(parsed.weekday, [])
      }
      if (parsed.position === undefined) {
        // No position means all occurrences
        weekdaySpecs.set(parsed.weekday, [-999]) // Special marker for all occurrences
      } else {
        weekdaySpecs.get(parsed.weekday).push(parsed.position)
      }
    }
    // Process each weekday only once
    for (const [weekday, positions] of weekdaySpecs) {
      const occurrences = getWeekdayOccurrencesInMonth(year, month, weekday)
      if (positions.includes(-999)) {
        // Add all occurrences
        for (const day of occurrences) {
          candidates.push(formatDateTimeFromString(dateTime, year, month, day))
        }
      } else {
        // Add specific positions
        for (const position of positions) {
          if (position > 0 && position <= occurrences.length) {
            const day = occurrences[position - 1]
            candidates.push(
              formatDateTimeFromString(dateTime, year, month, day)
            )
          } else if (position < 0) {
            const index = occurrences.length + position
            if (index >= 0 && index < occurrences.length) {
              const day = occurrences[index]
              candidates.push(
                formatDateTimeFromString(dateTime, year, month, day)
              )
            }
          }
        }
      }
    }
    return candidates.sort()
  }
  const monthlyIteratorResult = (dtstart, options) => {
    if (options.byday && options.byday.length > 0) {
      const monthlyIter = monthlyIteratorByday(dtstart, options)
      let result = monthlyIter.next()
      while (!result.done) {
        result = monthlyIter.next()
      }
      return result.value
    } else {
      if (!options.bymonthday) {
        options.bymonthday = toIntegers(dtstart).date
      }
      const monthlyIter = monthlyIteratorBymonthday(dtstart, options)
      let result = monthlyIter.next()
      while (!result.done) {
        result = monthlyIter.next()
      }
      return result.value
    }
  }

  const calculateNextYearlyBydayOccurrence = (currentDate, rruleOptions) => {
    const byDayValue = rruleOptions.byday[0]
    const parsed = parseBydaySpec(byDayValue)
    if (!parsed) {
      return __deprecated__addYears(currentDate, rruleOptions.interval)
    }
    const { year, month, hours, minutes } = toIntegers(currentDate)
    const nextYear = year + rruleOptions.interval
    // Use bymonth if specified, otherwise use the month from the start date
    const targetMonth = rruleOptions.bymonth || month + 1 // toIntegers returns 0-based month
    // Default to first occurrence if no position specified
    const position = parsed.position || 1
    // Calculate the nth weekday for the target month in the next year
    // Note: getNthWeekdayOfMonth expects 0-based month
    const targetDay = getNthWeekdayOfMonth(
      nextYear,
      targetMonth - 1,
      parsed.weekday,
      position
    )
    if (targetDay > 0) {
      return formatDateTime(
        nextYear,
        targetMonth - 1,
        targetDay,
        hours,
        minutes
      )
    }
    // If nth occurrence doesn't exist, skip this year
    return __deprecated__addYears(currentDate, rruleOptions.interval)
  }
  const yearlyIterator = (dtstart, rruleOptions) => {
    const allDateTimes = []
    let currentDate = dtstart
    return {
      next() {
        if (
          !isCountReached(allDateTimes.length, rruleOptions.count) &&
          !isDatePastUntil(currentDate, rruleOptions.until)
        ) {
          allDateTimes.push(currentDate)
        }
        if (
          isDatePastUntil(currentDate, rruleOptions.until) ||
          isCountReached(allDateTimes.length, rruleOptions.count)
        ) {
          return { done: true, value: allDateTimes }
        }
        // Calculate next occurrence
        if (rruleOptions.byday && rruleOptions.byday.length > 0) {
          currentDate = calculateNextYearlyBydayOccurrence(
            currentDate,
            rruleOptions
          )
        } else {
          // Default behavior: add years to the same date
          currentDate = __deprecated__addYears(
            currentDate,
            rruleOptions.interval
          )
        }
        return { done: false, value: allDateTimes }
      },
    }
  }
  const yearlyIteratorResult = (dtstart, rruleOptions) => {
    const yearlyIter = yearlyIterator(dtstart, rruleOptions)
    let result = yearlyIter.next()
    while (!result.done) {
      result = yearlyIter.next()
    }
    return result.value
  }

  class RRule {
    constructor(options, dtstart, dtend) {
      var _a
      Object.defineProperty(this, 'dtstart', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: dtstart,
      })
      Object.defineProperty(this, 'options', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'durationInMinutes', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'durationInDays', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      this.options = {
        ...options,
        interval: (_a = options.interval) !== null && _a !== void 0 ? _a : 1,
      }
      const actualDTEND = dtend || dtstart /* RFC5545: #1 */
      if (this.isDateTime) {
        this.durationInMinutes = getDurationInMinutes(this.dtstart, actualDTEND)
      } else {
        this.durationInDays = calculateDaysDifference(
          Temporal.PlainDate.from(this.dtstart),
          Temporal.PlainDate.from(actualDTEND)
        )
      }
    }
    getRecurrences() {
      if (this.options.freq === RRuleFreq.DAILY) return this.getDatesForDaily()
      if (this.options.freq === RRuleFreq.WEEKLY)
        return this.getDatesForFreqWeekly()
      if (this.options.freq === RRuleFreq.MONTHLY)
        return this.getDatesForFreqMonthly()
      if (this.options.freq === RRuleFreq.YEARLY)
        return this.getDatesForFreqYearly()
      throw new Error('freq is required')
    }
    getDatesForFreqWeekly() {
      return weeklyIteratorResult(this.dtstart, this.options).map(
        this.getRecurrenceBasedOnStartDates.bind(this)
      )
    }
    getDatesForDaily() {
      return dailyIteratorResult(this.dtstart, this.options).map(
        this.getRecurrenceBasedOnStartDates.bind(this)
      )
    }
    getDatesForFreqMonthly() {
      return monthlyIteratorResult(this.dtstart, this.options).map(
        this.getRecurrenceBasedOnStartDates.bind(this)
      )
    }
    getDatesForFreqYearly() {
      return yearlyIteratorResult(this.dtstart, this.options).map(
        this.getRecurrenceBasedOnStartDates.bind(this)
      )
    }
    getRecurrenceBasedOnStartDates(date) {
      return {
        start: date,
        end: this.isDateTime
          ? __deprecated__addMinutes(date, this.durationInMinutes)
          : __deprecated__addDaysToDateOrDateTime(date, this.durationInDays),
      }
    }
    get isDateTime() {
      return sxDateTimeStringRegex.test(this.dtstart)
    }
  }

  class RecurrenceSet {
    constructor(options) {
      Object.defineProperty(this, 'dtstart', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'dtend', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'rrule', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'exdate', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      this.dtstart = parseRFC5545ToSX(options.dtstart)
      this.dtend = parseRFC5545ToSX(options.dtend || options.dtstart)
      this.rrule = rruleStringToJS(options.rrule)
      this.exdate = this.mapExdate(options.exdate)
    }
    getRecurrences() {
      const recurrences = new RRule(
        this.rrule,
        this.dtstart,
        this.dtend
      ).getRecurrences()
      return this.filterExdate(recurrences)
    }
    updateDtstartAndDtend(newDtstart, newDtend) {
      newDtstart = parseRFC5545ToSX(newDtstart)
      const oldDtstart = this.dtstart
      const rruleUpdater = new RRuleUpdater(this.rrule, oldDtstart, newDtstart)
      this.rrule = rruleUpdater.getUpdatedRRuleOptions()
      this.dtstart = newDtstart
      this.dtend = newDtend
    }
    mapExdate(exdate) {
      if (!(exdate === null || exdate === void 0 ? void 0 : exdate.length))
        return undefined
      const exdateMap = new Map()
      exdate.forEach((date) => {
        const parsedDate = parseRFC5545ToSX(date)
        /**
         * If the exdate is the same as the dtstart,
         * we can't remove it anyways.
         */
        if (parsedDate === this.dtstart) {
          return
        }
        exdateMap.set(parsedDate, true)
      })
      return exdateMap
    }
    filterExdate(recurrences) {
      if (!this.exdate) return recurrences
      return recurrences.filter((recurrence) => {
        var _a
        return !((_a = this.exdate) === null || _a === void 0
          ? void 0
          : _a.has(recurrence.start))
      })
    }
    getRrule() {
      return rruleJSToString(this.rrule)
    }
    getDtstart() {
      return parseSXToRFC5545(this.dtstart)
    }
    getDtend() {
      return parseSXToRFC5545(this.dtend)
    }
    getExdate() {
      return this.exdate
    }
  }

  class DndUpdater {
    constructor($app) {
      Object.defineProperty(this, '$app', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: $app,
      })
    }
    update(eventId, oldEventStart, newEventStart) {
      const eventToUpdate = this.$app.calendarEvents.list.value.find(
        (event) => event.id === eventId && !event.isCopy
      )
      if (!eventToUpdate)
        throw new Error('Tried to update a non-existing event')
      this.$app.calendarEvents.list.value =
        this.$app.calendarEvents.list.value.filter(
          (event) => event.id !== eventId || !event.isCopy
        )
      const recurrenceSet = new RecurrenceSet({
        dtstart: parseTemporalToRFC5545(eventToUpdate.start),
        dtend: parseTemporalToRFC5545(eventToUpdate.end),
        rrule: eventToUpdate._getForeignProperties().rrule,
      })
      const newDtStart =
        oldEventStart instanceof Temporal.ZonedDateTime
          ? addMinutesToTemporal(
              eventToUpdate.start,
              getDurationInMinutesTemporal(oldEventStart, newEventStart)
            )
          : addDays(
              eventToUpdate.start,
              calculateDaysDifference(
                Temporal.PlainDate.from(oldEventStart),
                Temporal.PlainDate.from(newEventStart)
              )
            )
      const newDtEnd =
        oldEventStart instanceof Temporal.ZonedDateTime
          ? addMinutesToTemporal(
              eventToUpdate.end,
              getDurationInMinutesTemporal(oldEventStart, newEventStart)
            )
          : addDays(
              eventToUpdate.end,
              calculateDaysDifference(
                Temporal.PlainDate.from(oldEventStart),
                Temporal.PlainDate.from(newEventStart)
              )
            )
      // Update the original event
      recurrenceSet.updateDtstartAndDtend(
        parseTemporalToRFC5545(newDtStart),
        parseTemporalToRFC5545(newDtEnd)
      )
      eventToUpdate.start = parseRFC5545ToTemporal(
        recurrenceSet.getDtstart(),
        this.$app.config.timezone.value
      )
      eventToUpdate.end = parseRFC5545ToTemporal(
        recurrenceSet.getDtend(),
        this.$app.config.timezone.value
      )
      eventToUpdate._getForeignProperties().rrule = recurrenceSet.getRrule()
      return { updatedEvent: eventToUpdate, recurrenceSet }
    }
  }

  const externalEventToInternal = (event, config) => {
    const {
      id,
      start,
      end,
      title,
      description,
      location,
      people,
      _options,
      ...foreignProperties
    } = event
    return new CalendarEventBuilder(config, id, start, end)
      .withTitle(title)
      .withDescription(description)
      .withLocation(location)
      .withPeople(people)
      .withCalendarId(event.calendarId)
      .withOptions(_options)
      .withForeignProperties(foreignProperties)
      .withCustomContent(event._customContent)
      .build()
  }

  const createRecurrencesForEvent = (
    $app,
    calendarEvent,
    rrule,
    range,
    exdate
  ) => {
    // if there is no count or until in the rrule, set an until date to range.end but in rfc string format
    if (!rrule.includes('COUNT') && !rrule.includes('UNTIL')) {
      if (!rrule.endsWith(';')) rrule += ';'
      rrule += `UNTIL=${parseTemporalToRFC5545(range.end)};`
    }
    const recurrenceSet = new RecurrenceSet({
      dtstart: parseTemporalToRFC5545(calendarEvent.start),
      dtend: parseTemporalToRFC5545(calendarEvent.end),
      rrule,
      exdate,
    }).getRecurrences()
    if (!recurrenceSet || recurrenceSet.length === 0) return []
    if (
      recurrenceSet[0].start ===
      parseRFC5545ToSX(parseTemporalToRFC5545(calendarEvent.start))
    ) {
      recurrenceSet.splice(0, 1) // skip the first occurrence because this is the original event
    }
    return recurrenceSet.map((recurrence) => {
      const eventCopy = deepCloneEvent(calendarEvent, $app)
      eventCopy.start = parseRFC5545ToTemporal(
        parseSXToRFC5545(recurrence.start),
        $app.config.timezone.value
      )
      eventCopy.end = parseRFC5545ToTemporal(
        parseSXToRFC5545(recurrence.end),
        $app.config.timezone.value
      )
      eventCopy.isCopy = true
      return eventCopy
    })
  }
  const createRecurrencesForBackgroundEvent = (
    $app,
    backgroundEvent,
    rrule,
    range,
    exdate
  ) => {
    // if there is no count or until in the rrule, set an until date to range.end but in rfc string format
    if (!rrule.includes('COUNT') && !rrule.includes('UNTIL')) {
      if (!rrule.endsWith(';')) rrule += ';'
      rrule += `UNTIL=${parseTemporalToRFC5545(range.end)};`
    }
    const recurrenceSet = new RecurrenceSet({
      dtstart: parseTemporalToRFC5545(backgroundEvent.start),
      dtend: parseTemporalToRFC5545(backgroundEvent.end),
      rrule,
      exdate,
    }).getRecurrences()
    if (!recurrenceSet || recurrenceSet.length === 0) return []
    if (
      parseSXToRFC5545(recurrenceSet[0].start) ===
      parseTemporalToRFC5545(backgroundEvent.start)
    ) {
      recurrenceSet.splice(0, 1) // skip the first occurrence because this is the original event
    }
    return recurrenceSet.map((recurrence) => {
      const eventCopy = structuredClone(backgroundEvent)
      eventCopy.start = parseRFC5545ToTemporal(
        parseSXToRFC5545(recurrence.start),
        $app.config.timezone.value
      )
      eventCopy.end = parseRFC5545ToTemporal(
        parseSXToRFC5545(recurrence.end),
        $app.config.timezone.value
      )
      eventCopy.isCopy = true
      return eventCopy
    })
  }

  class EventsFacadeImpl {
    constructor($app) {
      Object.defineProperty(this, '$app', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: $app,
      })
    }
    set(events) {
      const newEventsList = []
      for (const event of events) {
        const newEvent = externalEventToInternal(event, this.$app.config)
        newEventsList.push(newEvent)
        const rrule = newEvent._getForeignProperties().rrule
        const exdate = newEvent._getForeignProperties().exdate
        if (
          rrule &&
          typeof rrule === 'string' &&
          this.$app.calendarState.range.value
        ) {
          newEventsList.push(
            ...createRecurrencesForEvent(
              this.$app,
              newEvent,
              rrule,
              this.$app.calendarState.range.value,
              exdate
            )
          )
        }
      }
      this.$app.calendarEvents.list.value = newEventsList
    }
    add(event) {
      const newEvent = externalEventToInternal(event, this.$app.config)
      newEvent._createdAt = new Date()
      const newEventsList = [...this.$app.calendarEvents.list.value, newEvent]
      const rrule = newEvent._getForeignProperties().rrule
      const exdate = newEvent._getForeignProperties().exdate
      if (
        rrule &&
        typeof rrule === 'string' &&
        this.$app.calendarState.range.value
      ) {
        newEventsList.push(
          ...createRecurrencesForEvent(
            this.$app,
            newEvent,
            rrule,
            this.$app.calendarState.range.value,
            exdate
          )
        )
      }
      this.$app.calendarEvents.list.value = newEventsList
    }
    get(id) {
      var _a
      return (_a = this.$app.calendarEvents.list.value.find(
        (event) => event.id === id && !event.isCopy
      )) === null || _a === void 0
        ? void 0
        : _a._getExternalEvent()
    }
    getAll() {
      return this.$app.calendarEvents.list.value
        .filter((event) => !event.isCopy)
        .map((event) => event._getExternalEvent())
    }
    remove(id) {
      this.$app.calendarEvents.list.value =
        this.$app.calendarEvents.list.value.filter((event) => event.id !== id)
    }
    update(event) {
      this.removeOriginalAndCopiesForId(event.id)
      const updatedEvent = externalEventToInternal(event, this.$app.config)
      const copiedEvents = [
        ...this.$app.calendarEvents.list.value,
        updatedEvent,
      ]
      const rrule = updatedEvent._getForeignProperties().rrule
      const exdate = updatedEvent._getForeignProperties().exdate
      if (
        rrule &&
        typeof rrule === 'string' &&
        this.$app.calendarState.range.value
      ) {
        copiedEvents.push(
          ...createRecurrencesForEvent(
            this.$app,
            updatedEvent,
            rrule,
            this.$app.calendarState.range.value,
            exdate
          )
        )
      }
      this.$app.calendarEvents.list.value = copiedEvents
    }
    removeOriginalAndCopiesForId(eventId) {
      this.$app.calendarEvents.list.value =
        this.$app.calendarEvents.list.value.filter((e) => e.id !== eventId)
    }
  }

  class ResizeUpdater {
    constructor($app) {
      Object.defineProperty(this, '$app', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: $app,
      })
    }
    update(eventId, oldEventEnd, newEventEnd) {
      this.deleteAllCopiesForEvent(eventId)
      const eventToUpdate = this.$app.calendarEvents.list.value.find(
        (event) => event.id === eventId && !event.isCopy
      )
      if (!eventToUpdate)
        throw new Error('Tried to update a non-existing event')
      eventToUpdate.end = this.getNewEventEnd(
        newEventEnd,
        eventToUpdate,
        oldEventEnd
      )
      return eventToUpdate
    }
    getNewEventEnd(newEventEnd, eventToUpdate, oldEventEnd) {
      return newEventEnd instanceof Temporal.ZonedDateTime
        ? addMinutesToTemporal(
            eventToUpdate.end,
            getDurationInMinutesTemporal(oldEventEnd, newEventEnd)
          )
        : addDays(
            eventToUpdate.end,
            calculateDaysDifference(oldEventEnd, newEventEnd)
          )
    }
    deleteAllCopiesForEvent(eventId) {
      this.$app.calendarEvents.list.value =
        this.$app.calendarEvents.list.value.filter(
          (event) => event.id !== eventId || !event.isCopy
        )
    }
  }

  class EventRecurrencePluginImpl {
    constructor() {
      Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: PluginName.EventRecurrence,
      })
      Object.defineProperty(this, '$app', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: null,
      })
      Object.defineProperty(this, 'range', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: null,
      })
    }
    /**
     * Must be before render, because if we run it onRender, we will create recurrences for the recurrences that were added
     * by people using the callbacks.beforeRender hook to add events.
     * */
    beforeRender($app) {
      this.$app = $app
      this.range = $app.calendarState.range.value
      this.createRecurrencesForEvents()
      this.createRecurrencesForBackgroundEvents()
    }
    onRangeUpdate(range) {
      this.range = range
      this.removeAllEventRecurrences()
      signals.batch(() => {
        this.createRecurrencesForEvents()
        this.createRecurrencesForBackgroundEvents()
      })
    }
    get eventsFacade() {
      console.warn(
        '[Schedule-X warning]: the eventsFacade is deprecated and will be removed in v2. Please use the createEventsServicePlugin function from @schedule-x/event-recurrence instead. Docs: https://schedule-x.dev/docs/calendar/plugins/recurrence'
      )
      if (!this.$app)
        throw new Error(
          'Plugin not yet initialized. The events facade is not intended to add the initial events. For adding events upon rendering, add them directly to the configuration object passed to `createCalendar`, or `useCalendarApp` if you are using the React component'
        )
      return new EventsFacadeImpl(this.$app)
    }
    updateRecurrenceDND(eventId, oldEventStart, newEventStart) {
      const { updatedEvent, recurrenceSet } = new DndUpdater(this.$app).update(
        eventId,
        oldEventStart,
        newEventStart
      )
      this.$app.calendarEvents.list.value = [
        ...this.$app.calendarEvents.list.value,
        ...this.createRecurrencesForEvent(
          updatedEvent,
          recurrenceSet.getRrule()
        ),
      ]
    }
    updateRecurrenceOnResize(eventId, oldEventEnd, newEventEnd) {
      const updatedEvent = new ResizeUpdater(this.$app).update(
        eventId,
        oldEventEnd,
        newEventEnd
      )
      this.$app.calendarEvents.list.value = [
        ...this.$app.calendarEvents.list.value,
        ...this.createRecurrencesForEvent(
          updatedEvent,
          updatedEvent._getForeignProperties().rrule
        ),
      ]
    }
    createRecurrencesForEvents() {
      const recurrencesToCreate = []
      const $app = this.$app
      $app.calendarEvents.list.value.forEach((event) => {
        const rrule = event._getForeignProperties().rrule
        const exdate = event._getForeignProperties().exdate
        if (rrule && this.validateRrule(event, rrule)) {
          recurrencesToCreate.push(
            ...this.createRecurrencesForEvent(event, rrule, exdate)
          )
        }
      })
      $app.calendarEvents.list.value = [
        ...this.$app.calendarEvents.list.value,
        ...recurrencesToCreate,
      ]
    }
    createRecurrencesForBackgroundEvents() {
      const recurrencesToCreate = []
      const $app = this.$app
      if (!this.range) return
      $app.calendarEvents.backgroundEvents.value.forEach((event) => {
        const rrule = event.rrule
        const exdate = event.exdate
        if (rrule && this.validateRrule(event, rrule)) {
          let rangeToUse = this.range
          // For infinite recurring events, ensure minimum expansion
          if (this.isInfiniteRecurringEvent(rrule)) {
            rangeToUse = this.getExpandedRangeForInfiniteEvent(
              this.range,
              rrule,
              event.start,
              $app
            )
          }
          recurrencesToCreate.push(
            ...createRecurrencesForBackgroundEvent(
              $app,
              event,
              rrule,
              rangeToUse,
              exdate
            )
          )
        }
      })
      $app.calendarEvents.backgroundEvents.value = [
        ...$app.calendarEvents.backgroundEvents.value,
        ...recurrencesToCreate,
      ]
    }
    /**
     * The "DTSTART" property value SHOULD match the pattern of the recurrence rule, if
     * specified. The recurrence set generated with a "DTSTART" property value that
     * doesn't match the pattern of the rule is undefined.
     *
     * https://datatracker.ietf.org/doc/html/rfc5545#section-3.8.5.1
     */
    validateRrule(event, rrule) {
      const rruleOptions = rruleStringToJS(rrule)
      const logValidationFailure = (message) => {
        if ('id' in event) {
          console.warn(
            `[Schedule-X warning]: Recurrence set could not be created for event with id ${event.id}, because ${message}`
          )
        } else {
          console.warn(
            `[Schedule-X warning]: Recurrence set could not be created for background event with start ${event.start.toString()}, because ${message}`
          )
        }
      }
      if (rruleOptions.bymonthday) {
        if (event.start.day !== rruleOptions.bymonthday) {
          logValidationFailure("rrule pattern doesn't match event.start")
          return false
        }
      }
      if (rruleOptions.byday && rruleOptions.byday.length > 0) {
        for (const daySpec of rruleOptions.byday) {
          if (!parseBydaySpec(daySpec)) {
            logValidationFailure(
              `rrule contains invalid BYDAY value ${daySpec}`
            )
            return false
          }
        }
      }
      return true
    }
    isInfiniteRecurringEvent(rrule) {
      return !rrule.includes('COUNT') && !rrule.includes('UNTIL')
    }
    isYearlyEvent(rrule) {
      return rrule.includes('FREQ=YEARLY')
    }
    /***
     * This is a "hack" to ensure that enough event recurrences are created for infinite recurring events when displayed in list view.
     * If there would only be one occurrence of the event initially, and no other events following it, the list view wouldn't know of any further events it needs to display.
     */
    getExpandedRangeForInfiniteEvent(range, rrule, eventStart, $app) {
      const isYearly = this.isYearlyEvent(rrule)
      const minExpansionYears = isYearly ? 10 : 1
      // Convert event start to ZonedDateTime if needed
      const eventStartZDT =
        eventStart instanceof Temporal.ZonedDateTime
          ? eventStart
          : eventStart.toZonedDateTime({
              timeZone: $app.config.timezone.value,
              plainTime: Temporal.PlainTime.from({ hour: 0, minute: 0 }),
            })
      // Calculate minimum end date: event start + minimum expansion years
      const minEndDate = eventStartZDT.add({ years: minExpansionYears })
      // Use the later of: current range end or minimum end date
      const endDate =
        minEndDate.epochNanoseconds > range.end.epochNanoseconds
          ? minEndDate
          : range.end
      return {
        start: range.start,
        end: endDate,
      }
    }
    createRecurrencesForEvent(calendarEvent, rrule, exdate) {
      if (!this.range) {
        console.warn(
          'No date range found in event recurrence plugin. Aborting creation of recurrences to prevent infinite recursion.'
        )
        return []
      }
      const $app = this.$app
      let rangeToUse = this.range
      // For infinite recurring events, ensure minimum expansion
      if (this.isInfiniteRecurringEvent(rrule)) {
        rangeToUse = this.getExpandedRangeForInfiniteEvent(
          this.range,
          rrule,
          calendarEvent.start,
          $app
        )
      }
      return createRecurrencesForEvent(
        $app,
        calendarEvent,
        rrule,
        rangeToUse,
        exdate
      )
    }
    removeAllEventRecurrences() {
      this.$app.calendarEvents.list.value = [
        ...this.$app.calendarEvents.list.value.filter((event) => !event.isCopy),
      ]
      this.$app.calendarEvents.backgroundEvents.value = [
        ...this.$app.calendarEvents.backgroundEvents.value.filter(
          (event) => !event.isCopy
        ),
      ]
    }
  }
  const createEventRecurrencePlugin = () => {
    return definePlugin('eventRecurrence', new EventRecurrencePluginImpl())
  }

  const validateEvents = (events = []) => {
    events === null || events === void 0
      ? void 0
      : events.forEach((event) => {
          if (
            !(event.start instanceof Temporal.ZonedDateTime) &&
            !(event.start instanceof Temporal.PlainDate)
          ) {
            throw new Error(
              `[Schedule-X error]: Event start time needs to be a Temporal.ZonedDateTime or Temporal.PlainDate.`
            )
          }
          if (
            !(event.end instanceof Temporal.ZonedDateTime) &&
            !(event.end instanceof Temporal.PlainDate)
          ) {
            throw new Error(
              `[Schedule-X error]: Event end time needs to be a Temporal.ZonedDateTime or Temporal.PlainDate.`
            )
          }
          const isIdDecimalNumber =
            typeof event.id === 'number' && event.id % 1 !== 0
          if (isIdDecimalNumber) {
            throw new Error(
              `[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`
            )
          }
          // only allow non-unicode characters that can be used by document.querySelector: https://developer.mozilla.org/en-US/docs/Web/CSS/ident
          if (
            typeof event.id === 'string' &&
            !/^[a-zA-Z0-9_-]*$/.test(event.id)
          ) {
            throw new Error(
              `[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`
            )
          }
          if (typeof event.id !== 'string' && typeof event.id !== 'number') {
            throw new Error(
              `[Schedule-X error]: Event id ${event.id} is not a valid id. Only non-unicode characters that can be used by document.querySelector is allowed, see: https://developer.mozilla.org/en-US/docs/Web/CSS/ident. We recommend using uuids or integers.`
            )
          }
        })
  }

  class EventsServicePluginImpl {
    constructor() {
      Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 'eventsService',
      })
      Object.defineProperty(this, '$app', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
      Object.defineProperty(this, 'eventsFacade', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0,
      })
    }
    beforeRender($app) {
      this.$app = $app
      // TODO v3: move methods from events facade to here, and remove events facade
      this.eventsFacade = new EventsFacadeImpl(this.$app)
    }
    add(event) {
      if (!this.$app) this.throwNotInitializedError()
      validateEvents([event])
      this.eventsFacade.add(event)
    }
    update(event) {
      if (!this.$app) this.throwNotInitializedError()
      validateEvents([event])
      this.eventsFacade.update(event)
    }
    remove(eventId) {
      if (!this.$app) this.throwNotInitializedError()
      this.eventsFacade.remove(eventId)
    }
    get(eventId) {
      if (!this.$app) this.throwNotInitializedError()
      return this.eventsFacade.get(eventId)
    }
    getAll() {
      if (!this.$app) this.throwNotInitializedError()
      return this.eventsFacade.getAll()
    }
    set(events) {
      if (!this.$app) this.throwNotInitializedError()
      validateEvents(events)
      this.eventsFacade.set(events)
    }
    throwNotInitializedError() {
      throw new Error(
        'Plugin not yet initialized. The events service plugin is not intended to add the initial events. For adding events upon rendering, add them directly to the configuration object passed to `createCalendar`, or `useCalendarApp` if you are using the React component'
      )
    }
    setBackgroundEvents(backgroundEvents) {
      if (!this.$app) this.throwNotInitializedError()
      const newBackgroundEvents = []
      for (const event of backgroundEvents) {
        newBackgroundEvents.push({
          ...event,
        })
        const rrule = event.rrule
        const exdate = event.exdate
        if (rrule && this.$app.calendarState.range.value) {
          newBackgroundEvents.push(
            ...createRecurrencesForBackgroundEvent(
              this.$app,
              event,
              rrule,
              this.$app.calendarState.range.value,
              exdate
            )
          )
        }
      }
      this.$app.calendarEvents.backgroundEvents.value = newBackgroundEvents
    }
  }
  const createEventsServicePlugin = () => {
    return definePlugin('eventsService', new EventsServicePluginImpl())
  }

  exports.createEventRecurrencePlugin = createEventRecurrencePlugin
  exports.createEventsServicePlugin = createEventsServicePlugin
})
