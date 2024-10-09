import { jsx, Fragment, jsxs } from 'preact/jsx-runtime'

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506771/time
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function TimeIcon({ strokeColor }) {
  return jsx(Fragment, {
    children: jsxs('svg', {
      className: 'sx__event-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      children: [
        jsx('g', { id: 'SVGRepo_bgCarrier', 'stroke-width': '0' }),
        jsx('g', {
          id: 'SVGRepo_tracerCarrier',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
        jsxs('g', {
          id: 'SVGRepo_iconCarrier',
          children: [
            jsx('path', {
              d: 'M12 8V12L15 15',
              stroke: strokeColor,
              'stroke-width': '2',
              'stroke-linecap': 'round',
            }),
            jsx('circle', {
              cx: '12',
              cy: '12',
              r: '9',
              stroke: strokeColor,
              'stroke-width': '2',
            }),
          ],
        }),
      ],
    }),
  })
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506772/user
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function UserIcon({ strokeColor }) {
  return jsx(Fragment, {
    children: jsxs('svg', {
      className: 'sx__event-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      children: [
        jsx('g', { id: 'SVGRepo_bgCarrier', 'stroke-width': '0' }),
        jsx('g', {
          id: 'SVGRepo_tracerCarrier',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
        jsxs('g', {
          id: 'SVGRepo_iconCarrier',
          children: [
            jsx('path', {
              d: 'M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z',
              stroke: strokeColor,
              'stroke-width': '2',
            }),
            jsx('path', {
              d: 'M5 19.5C5 15.9101 7.91015 13 11.5 13H12.5C16.0899 13 19 15.9101 19 19.5V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V19.5Z',
              stroke: strokeColor,
              'stroke-width': '2',
            }),
          ],
        }),
      ],
    }),
  })
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506838/list
 * License: PD License
 * Author: Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function DescriptionIcon({ strokeColor }) {
  return jsx(Fragment, {
    children: jsxs('svg', {
      className: 'sx__event-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      children: [
        jsx('g', { id: 'SVGRepo_bgCarrier', 'stroke-width': '0' }),
        jsx('g', {
          id: 'SVGRepo_tracerCarrier',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
        jsxs('g', {
          id: 'SVGRepo_iconCarrier',
          children: [
            jsx('rect', {
              x: '4',
              y: '4',
              width: '16',
              height: '16',
              rx: '3',
              stroke: strokeColor,
              'stroke-width': '2',
            }),
            jsx('path', {
              d: 'M16 10L8 10',
              stroke: strokeColor,
              'stroke-width': '2',
              'stroke-linecap': 'round',
            }),
            jsx('path', {
              d: 'M16 14L8 14',
              stroke: strokeColor,
              'stroke-width': '2',
              'stroke-linecap': 'round',
            }),
          ],
        }),
      ],
    }),
  })
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/489502/location-pin
 * License: PD License
 * Author: Dariush Habibpour
 * Author website: https://redl.ink/dariush/links?ref=svgrepo.com
 * */
function LocationPinIcon({ strokeColor }) {
  return jsx(Fragment, {
    children: jsxs('svg', {
      className: 'sx__event-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      children: [
        jsx('g', { id: 'SVGRepo_bgCarrier', 'stroke-width': '0' }),
        jsx('g', {
          id: 'SVGRepo_tracerCarrier',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
        jsxs('g', {
          id: 'SVGRepo_iconCarrier',
          children: [
            jsxs('g', {
              'clip-path': 'url(#clip0_429_11046)',
              children: [
                jsx('rect', {
                  x: '12',
                  y: '11',
                  width: '0.01',
                  height: '0.01',
                  stroke: strokeColor,
                  'stroke-width': '2',
                  'stroke-linejoin': 'round',
                }),
                jsx('path', {
                  d: 'M12 22L17.5 16.5C20.5376 13.4624 20.5376 8.53757 17.5 5.5C14.4624 2.46244 9.53757 2.46244 6.5 5.5C3.46244 8.53757 3.46244 13.4624 6.5 16.5L12 22Z',
                  stroke: strokeColor,
                  'stroke-width': '2',
                  'stroke-linejoin': 'round',
                }),
              ],
            }),
            jsx('defs', {
              children: jsx('clipPath', {
                id: 'clip0_429_11046',
                children: jsx('rect', {
                  width: '24',
                  height: '24',
                  fill: 'white',
                }),
              }),
            }),
          ],
        }),
      ],
    }),
  })
}

const definePlugin = (name, definition) => {
  definition.name = name
  return definition
}

// regex for strings between 00:00 and 23:59
const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
const dateTimeStringRegex =
  /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
const dateStringRegex = /^(\d{4})-(\d{2})-(\d{2})$/

const DateFormats = {
  DATE_STRING: /^\d{4}-\d{2}-\d{2}$/,
  TIME_STRING: /^\d{2}:\d{2}$/,
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
  return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`
}
const toTimeString = (date) => {
  return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`
}
const toDateTimeString = (date) => {
  return `${toDateString(date)} ${toTimeString(date)}`
}

class InvalidTimeStringError extends Error {
  constructor(timeString) {
    super(`Invalid time string: ${timeString}`)
  }
}

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
  WeekDay[(WeekDay['SUNDAY'] = 0)] = 'SUNDAY'
  WeekDay[(WeekDay['MONDAY'] = 1)] = 'MONDAY'
  WeekDay[(WeekDay['TUESDAY'] = 2)] = 'TUESDAY'
  WeekDay[(WeekDay['WEDNESDAY'] = 3)] = 'WEDNESDAY'
  WeekDay[(WeekDay['THURSDAY'] = 4)] = 'THURSDAY'
  WeekDay[(WeekDay['FRIDAY'] = 5)] = 'FRIDAY'
  WeekDay[(WeekDay['SATURDAY'] = 6)] = 'SATURDAY'
})(WeekDay || (WeekDay = {}))

WeekDay.MONDAY
const DEFAULT_EVENT_COLOR_NAME = 'primary'

class CalendarEventImpl {
  constructor(
    _config,
    id,
    start,
    end,
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
    Object.defineProperty(this, '_nDaysInGrid', {
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
  }
  get _isSingleDayTimed() {
    return (
      dateTimeStringRegex.test(this.start) &&
      dateTimeStringRegex.test(this.end) &&
      dateFromDateTime(this.start) === dateFromDateTime(this.end)
    )
  }
  get _isSingleDayFullDay() {
    return (
      dateStringRegex.test(this.start) &&
      dateStringRegex.test(this.end) &&
      this.start === this.end
    )
  }
  get _isMultiDayTimed() {
    return (
      dateTimeStringRegex.test(this.start) &&
      dateTimeStringRegex.test(this.end) &&
      dateFromDateTime(this.start) !== dateFromDateTime(this.end)
    )
  }
  get _isMultiDayFullDay() {
    return (
      dateStringRegex.test(this.start) &&
      dateStringRegex.test(this.end) &&
      this.start !== this.end
    )
  }
  get _isSingleHybridDayTimed() {
    if (!this._config.isHybridDay) return false
    if (
      !dateTimeStringRegex.test(this.start) ||
      !dateTimeStringRegex.test(this.end)
    )
      return false
    const startDate = dateFromDateTime(this.start)
    const endDate = dateFromDateTime(this.end)
    const endDateMinusOneDay = toDateString(
      new Date(toJSDate(endDate).getTime() - 86400000)
    )
    if (startDate !== endDate && startDate !== endDateMinusOneDay) return false
    const dayBoundaries = this._config.dayBoundaries.value
    const eventStartTimePoints = timePointsFromString(
      timeFromDateTime(this.start)
    )
    const eventEndTimePoints = timePointsFromString(timeFromDateTime(this.end))
    return (
      (eventStartTimePoints >= dayBoundaries.start &&
        (eventEndTimePoints <= dayBoundaries.end ||
          eventEndTimePoints > eventStartTimePoints)) ||
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
      start: this.start,
      end: this.end,
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
    calendarEvent.start,
    calendarEvent.end
  )
    .withTitle(calendarEvent.title)
    .withPeople(calendarEvent.people)
    .withCalendarId(calendarEvent.calendarId)
    .withForeignProperties(
      JSON.parse(JSON.stringify(calendarEvent._getForeignProperties()))
    )
    .withLocation(calendarEvent.location)
    .withDescription(calendarEvent.description)
    .build()
  calendarEventInternal._nDaysInGrid = calendarEvent._nDaysInGrid
  return calendarEventInternal
}

const concatenatePeople = (people) => {
  return people.reduce((acc, person, index) => {
    if (index === 0) return person
    if (index === people.length - 1) return `${acc} & ${person}`
    return `${acc}, ${person}`
  }, '')
}

const dateFn = (dateTimeString, locale) => {
  const { year, month, date } = toIntegers(dateTimeString)
  return new Date(year, month, date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
const timeFn = (dateTimeString, locale) => {
  const { year, month, date, hours, minutes } = toIntegers(dateTimeString)
  return new Date(year, month, date, hours, minutes).toLocaleTimeString(
    locale,
    {
      hour: 'numeric',
      minute: 'numeric',
    }
  )
}
const getTimeStamp = (
  calendarEvent, // to facilitate testing. In reality, we will always have a full CalendarEventInternal
  locale,
  delimiter = '\u2013'
) => {
  const eventTime = { start: calendarEvent.start, end: calendarEvent.end }
  if (calendarEvent._isSingleDayFullDay) {
    return dateFn(eventTime.start, locale)
  }
  if (calendarEvent._isMultiDayFullDay) {
    return `${dateFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}`
  }
  if (calendarEvent._isSingleDayTimed) {
    return `${dateFn(eventTime.start, locale)} <span aria-hidden="true">⋅</span> ${timeFn(eventTime.start, locale)} ${delimiter} ${timeFn(eventTime.end, locale)}`
  }
  return `${dateFn(eventTime.start, locale)}, ${timeFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}, ${timeFn(eventTime.end, locale)}`
}

/**
 * Can be used for generating a random id for an entity
 * Should, however, never be used in potentially resource intense loops,
 * since the performance cost of this compared to new Date().getTime() is ca x4 in v8
 * */
const randomStringId = () => 's' + Math.random().toString(36).substring(2, 11)

const addMonths = (to, nMonths) => {
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
    return toDateTimeString(jsDate)
  }
  return toDateString(jsDate)
}
const addDays = (to, nDays) => {
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
    return toDateTimeString(jsDate)
  }
  return toDateString(jsDate)
}
const addMinutes = (to, nMinutes) => {
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
    return toDateTimeString(jsDate)
  }
  return toDateString(jsDate)
}

export {
  DescriptionIcon,
  LocationPinIcon,
  TimeIcon,
  UserIcon,
  addDays,
  addMinutes,
  addMonths,
  concatenatePeople,
  dateStringRegex,
  deepCloneEvent,
  definePlugin,
  getTimeStamp,
  randomStringId,
  toDateString,
  toDateTimeString,
  toJSDate,
  toTimeString,
}
