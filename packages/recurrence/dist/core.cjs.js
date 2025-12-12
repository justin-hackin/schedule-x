'use strict'

require('preact/jsx-runtime')

const calculateDaysDifference = (startDate, endDate) => {
  return Temporal.PlainDate.from(startDate)
    .until(Temporal.PlainDate.from(endDate))
    .total('days')
}

// regex for strings between 00:00 and 23:59
const sxDateTimeStringRegex =
  /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/

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

const getDurationInMinutes = (dtstart, dtend) => {
  const dtStartJS = toJSDate(dtstart)
  const dtEndJS = toJSDate(dtend)
  return (dtEndJS.getTime() - dtStartJS.getTime()) / 1000 / 60
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
  if (rruleOptions.bymonthday) rrule += `;BYMONTHDAY=${rruleOptions.bymonthday}`
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
    if (parsedPosition === 0 || parsedPosition > 366 || parsedPosition < -366) {
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
      const nextCurrentDateCandidate = __deprecated__addMonthsToDateOrDatetime(
        currentDate,
        options.interval
      )
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
        const candidates = getMonthlyBydayCandidates(currentDate, options.byday)
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
          candidates.push(formatDateTimeFromString(dateTime, year, month, day))
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
    return formatDateTime(nextYear, targetMonth - 1, targetDay, hours, minutes)
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
        currentDate = __deprecated__addYears(currentDate, rruleOptions.interval)
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

exports.RecurrenceSet = RecurrenceSet
