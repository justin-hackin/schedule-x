import { Signal, ReadonlySignal } from '@preact/signals'
import { JSX } from 'preact'
import { CSSProperties } from 'preact/compat'
declare enum WeekDay {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}
type WeekWithDates = Temporal.ZonedDateTime[]
type MonthWithDates = Temporal.ZonedDateTime[][]
declare enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}
interface TimeUnits {
  firstDayOfWeek: WeekDay
  getMonthWithTrailingAndLeadingDays(year: number, month: Month): MonthWithDates
  getWeekFor(date: Temporal.ZonedDateTime | Temporal.PlainDate): WeekWithDates
  getMonthsFor(year: number): Temporal.PlainDate[]
  getMonth(year: number, month: Month): Temporal.ZonedDateTime[]
}
declare enum DatePickerView {
  MONTH_DAYS = 'month-days',
  YEARS = 'years',
}
interface DatePickerState {
  isOpen: Signal<boolean>
  isDisabled: Signal<boolean>
  selectedDate: Signal<Temporal.PlainDate>
  inputDisplayedValue: Signal<string>
  datePickerDate: Signal<Temporal.PlainDate>
  datePickerView: Signal<DatePickerView>
  inputWrapperElement: Signal<HTMLDivElement | undefined>
  isDark: Signal<boolean>
  open(): void
  close(): void
  toggle(): void
  handleInput(newInputValue: string): void
  setView(view: DatePickerView): void
}
type TranslationVariables = {
  [key: string]: string | number
}
type TranslateFn = (key: string, variables?: TranslationVariables) => string
/**
 * This interface serves as a bridge between the AppSingleton for the date picker and calendar
 * */
interface AppSingleton {
  timeUnitsImpl: TimeUnits
  datePickerState: DatePickerState
  translate: TranslateFn
}
/* eslint-disable max-lines */
declare const IANA_TIMEZONES: readonly [
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Addis_Ababa',
  'Africa/Algiers',
  'Africa/Asmara',
  'Africa/Asmera',
  'Africa/Bamako',
  'Africa/Bangui',
  'Africa/Banjul',
  'Africa/Bissau',
  'Africa/Blantyre',
  'Africa/Brazzaville',
  'Africa/Bujumbura',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Ceuta',
  'Africa/Conakry',
  'Africa/Dakar',
  'Africa/Dar_es_Salaam',
  'Africa/Djibouti',
  'Africa/Douala',
  'Africa/El_Aaiun',
  'Africa/Freetown',
  'Africa/Gaborone',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Africa/Juba',
  'Africa/Kampala',
  'Africa/Khartoum',
  'Africa/Kigali',
  'Africa/Kinshasa',
  'Africa/Lagos',
  'Africa/Libreville',
  'Africa/Lome',
  'Africa/Luanda',
  'Africa/Lubumbashi',
  'Africa/Lusaka',
  'Africa/Malabo',
  'Africa/Maputo',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Mogadishu',
  'Africa/Monrovia',
  'Africa/Nairobi',
  'Africa/Ndjamena',
  'Africa/Niamey',
  'Africa/Nouakchott',
  'Africa/Ouagadougou',
  'Africa/Porto-Novo',
  'Africa/Sao_Tome',
  'Africa/Timbuktu',
  'Africa/Tripoli',
  'Africa/Tunis',
  'Africa/Windhoek',
  'America/Adak',
  'America/Anchorage',
  'America/Anguilla',
  'America/Antigua',
  'America/Araguaina',
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Catamarca',
  'America/Argentina/ComodRivadavia',
  'America/Argentina/Cordoba',
  'America/Argentina/Jujuy',
  'America/Argentina/La_Rioja',
  'America/Argentina/Mendoza',
  'America/Argentina/Rio_Gallegos',
  'America/Argentina/Salta',
  'America/Argentina/San_Juan',
  'America/Argentina/San_Luis',
  'America/Argentina/Tucuman',
  'America/Argentina/Ushuaia',
  'America/Aruba',
  'America/Asuncion',
  'America/Atikokan',
  'America/Atka',
  'America/Bahia',
  'America/Bahia_Banderas',
  'America/Barbados',
  'America/Belem',
  'America/Belize',
  'America/Blanc-Sablon',
  'America/Boa_Vista',
  'America/Bogota',
  'America/Boise',
  'America/Buenos_Aires',
  'America/Cambridge_Bay',
  'America/Campo_Grande',
  'America/Cancun',
  'America/Caracas',
  'America/Catamarca',
  'America/Cayenne',
  'America/Cayman',
  'America/Chicago',
  'America/Chihuahua',
  'America/Ciudad_Juarez',
  'America/Coral_Harbour',
  'America/Cordoba',
  'America/Costa_Rica',
  'America/Coyhaique',
  'America/Creston',
  'America/Cuiaba',
  'America/Curacao',
  'America/Danmarkshavn',
  'America/Dawson',
  'America/Dawson_Creek',
  'America/Denver',
  'America/Detroit',
  'America/Dominica',
  'America/Edmonton',
  'America/Eirunepe',
  'America/El_Salvador',
  'America/Ensenada',
  'America/Fort_Nelson',
  'America/Fort_Wayne',
  'America/Fortaleza',
  'America/Glace_Bay',
  'America/Godthab',
  'America/Goose_Bay',
  'America/Grand_Turk',
  'America/Grenada',
  'America/Guadeloupe',
  'America/Guatemala',
  'America/Guayaquil',
  'America/Guyana',
  'America/Halifax',
  'America/Havana',
  'America/Hermosillo',
  'America/Indiana/Indianapolis',
  'America/Indiana/Knox',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Tell_City',
  'America/Indiana/Vevay',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indianapolis',
  'America/Inuvik',
  'America/Iqaluit',
  'America/Jamaica',
  'America/Jujuy',
  'America/Juneau',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Knox_IN',
  'America/Kralendijk',
  'America/La_Paz',
  'America/Lima',
  'America/Los_Angeles',
  'America/Louisville',
  'America/Lower_Princes',
  'America/Maceio',
  'America/Managua',
  'America/Manaus',
  'America/Marigot',
  'America/Martinique',
  'America/Matamoros',
  'America/Mazatlan',
  'America/Mendoza',
  'America/Menominee',
  'America/Merida',
  'America/Metlakatla',
  'America/Mexico_City',
  'America/Miquelon',
  'America/Moncton',
  'America/Monterrey',
  'America/Montevideo',
  'America/Montreal',
  'America/Montserrat',
  'America/Nassau',
  'America/New_York',
  'America/Nipigon',
  'America/Nome',
  'America/Noronha',
  'America/North_Dakota/Beulah',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/Nuuk',
  'America/Ojinaga',
  'America/Panama',
  'America/Pangnirtung',
  'America/Paramaribo',
  'America/Phoenix',
  'America/Port-au-Prince',
  'America/Port_of_Spain',
  'America/Porto_Acre',
  'America/Porto_Velho',
  'America/Puerto_Rico',
  'America/Punta_Arenas',
  'America/Rainy_River',
  'America/Rankin_Inlet',
  'America/Recife',
  'America/Regina',
  'America/Resolute',
  'America/Rio_Branco',
  'America/Rosario',
  'America/Santa_Isabel',
  'America/Santarem',
  'America/Santiago',
  'America/Santo_Domingo',
  'America/Sao_Paulo',
  'America/Scoresbysund',
  'America/Shiprock',
  'America/Sitka',
  'America/St_Barthelemy',
  'America/St_Johns',
  'America/St_Kitts',
  'America/St_Lucia',
  'America/St_Thomas',
  'America/St_Vincent',
  'America/Swift_Current',
  'America/Tegucigalpa',
  'America/Thule',
  'America/Thunder_Bay',
  'America/Tijuana',
  'America/Toronto',
  'America/Tortola',
  'America/Vancouver',
  'America/Virgin',
  'America/Whitehorse',
  'America/Winnipeg',
  'America/Yakutat',
  'America/Yellowknife',
  'Antarctica/Casey',
  'Antarctica/Davis',
  'Antarctica/DumontDUrville',
  'Antarctica/Macquarie',
  'Antarctica/Mawson',
  'Antarctica/McMurdo',
  'Antarctica/Palmer',
  'Antarctica/Rothera',
  'Antarctica/South_Pole',
  'Antarctica/Syowa',
  'Antarctica/Troll',
  'Antarctica/Vostok',
  'Arctic/Longyearbyen',
  'Asia/Aden',
  'Asia/Almaty',
  'Asia/Amman',
  'Asia/Anadyr',
  'Asia/Aqtau',
  'Asia/Aqtobe',
  'Asia/Ashgabat',
  'Asia/Ashkhabad',
  'Asia/Atyrau',
  'Asia/Baghdad',
  'Asia/Bahrain',
  'Asia/Baku',
  'Asia/Bangkok',
  'Asia/Barnaul',
  'Asia/Beirut',
  'Asia/Bishkek',
  'Asia/Brunei',
  'Asia/Calcutta',
  'Asia/Chita',
  'Asia/Choibalsan',
  'Asia/Chongqing',
  'Asia/Chungking',
  'Asia/Colombo',
  'Asia/Dacca',
  'Asia/Damascus',
  'Asia/Dhaka',
  'Asia/Dili',
  'Asia/Dubai',
  'Asia/Dushanbe',
  'Asia/Famagusta',
  'Asia/Gaza',
  'Asia/Harbin',
  'Asia/Hebron',
  'Asia/Ho_Chi_Minh',
  'Asia/Hong_Kong',
  'Asia/Hovd',
  'Asia/Irkutsk',
  'Asia/Istanbul',
  'Asia/Jakarta',
  'Asia/Jayapura',
  'Asia/Jerusalem',
  'Asia/Kabul',
  'Asia/Kamchatka',
  'Asia/Karachi',
  'Asia/Kashgar',
  'Asia/Kathmandu',
  'Asia/Katmandu',
  'Asia/Khandyga',
  'Asia/Kolkata',
  'Asia/Krasnoyarsk',
  'Asia/Kuala_Lumpur',
  'Asia/Kuching',
  'Asia/Kuwait',
  'Asia/Macao',
  'Asia/Macau',
  'Asia/Magadan',
  'Asia/Makassar',
  'Asia/Manila',
  'Asia/Muscat',
  'Asia/Nicosia',
  'Asia/Novokuznetsk',
  'Asia/Novosibirsk',
  'Asia/Omsk',
  'Asia/Oral',
  'Asia/Phnom_Penh',
  'Asia/Pontianak',
  'Asia/Pyongyang',
  'Asia/Qatar',
  'Asia/Qostanay',
  'Asia/Qyzylorda',
  'Asia/Rangoon',
  'Asia/Riyadh',
  'Asia/Saigon',
  'Asia/Sakhalin',
  'Asia/Samarkand',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Srednekolymsk',
  'Asia/Taipei',
  'Asia/Tashkent',
  'Asia/Tbilisi',
  'Asia/Tehran',
  'Asia/Tel_Aviv',
  'Asia/Thimbu',
  'Asia/Thimphu',
  'Asia/Tokyo',
  'Asia/Tomsk',
  'Asia/Ujung_Pandang',
  'Asia/Ulaanbaatar',
  'Asia/Ulan_Bator',
  'Asia/Urumqi',
  'Asia/Ust-Nera',
  'Asia/Vientiane',
  'Asia/Vladivostok',
  'Asia/Yakutsk',
  'Asia/Yangon',
  'Asia/Yekaterinburg',
  'Asia/Yerevan',
  'Atlantic/Azores',
  'Atlantic/Bermuda',
  'Atlantic/Canary',
  'Atlantic/Cape_Verde',
  'Atlantic/Faeroe',
  'Atlantic/Faroe',
  'Atlantic/Jan_Mayen',
  'Atlantic/Madeira',
  'Atlantic/Reykjavik',
  'Atlantic/South_Georgia',
  'Atlantic/St_Helena',
  'Atlantic/Stanley',
  'Australia/ACT',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Broken_Hill',
  'Australia/Canberra',
  'Australia/Currie',
  'Australia/Darwin',
  'Australia/Eucla',
  'Australia/Hobart',
  'Australia/LHI',
  'Australia/Lindeman',
  'Australia/Lord_Howe',
  'Australia/Melbourne',
  'Australia/NSW',
  'Australia/North',
  'Australia/Perth',
  'Australia/Queensland',
  'Australia/South',
  'Australia/Sydney',
  'Australia/Tasmania',
  'Australia/Victoria',
  'Australia/West',
  'Australia/Yancowinna',
  'Brazil/Acre',
  'Brazil/DeNoronha',
  'Brazil/East',
  'Brazil/West',
  'CET',
  'CST6CDT',
  'Canada/Atlantic',
  'Canada/Central',
  'Canada/Eastern',
  'Canada/Mountain',
  'Canada/Newfoundland',
  'Canada/Pacific',
  'Canada/Saskatchewan',
  'Canada/Yukon',
  'Chile/Continental',
  'Chile/EasterIsland',
  'Cuba',
  'EET',
  'EST',
  'EST5EDT',
  'Egypt',
  'Eire',
  'Etc/Greenwich',
  'Etc/UCT',
  'Etc/UTC',
  'Etc/Universal',
  'Etc/Zulu',
  'Europe/Amsterdam',
  'Europe/Andorra',
  'Europe/Astrakhan',
  'Europe/Athens',
  'Europe/Belfast',
  'Europe/Belgrade',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Busingen',
  'Europe/Chisinau',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Gibraltar',
  'Europe/Guernsey',
  'Europe/Helsinki',
  'Europe/Isle_of_Man',
  'Europe/Istanbul',
  'Europe/Jersey',
  'Europe/Kaliningrad',
  'Europe/Kiev',
  'Europe/Kirov',
  'Europe/Kyiv',
  'Europe/Lisbon',
  'Europe/Ljubljana',
  'Europe/London',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Mariehamn',
  'Europe/Minsk',
  'Europe/Monaco',
  'Europe/Moscow',
  'Europe/Nicosia',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Podgorica',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Samara',
  'Europe/San_Marino',
  'Europe/Sarajevo',
  'Europe/Saratov',
  'Europe/Simferopol',
  'Europe/Skopje',
  'Europe/Sofia',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Tirane',
  'Europe/Tiraspol',
  'Europe/Ulyanovsk',
  'Europe/Uzhgorod',
  'Europe/Vaduz',
  'Europe/Vatican',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Volgograd',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Europe/Zaporozhye',
  'Europe/Zurich',
  'Factory',
  'GB',
  'GB-Eire',
  'Greenwich',
  'HST',
  'Hongkong',
  'Iceland',
  'Indian/Antananarivo',
  'Indian/Chagos',
  'Indian/Christmas',
  'Indian/Cocos',
  'Indian/Comoro',
  'Indian/Kerguelen',
  'Indian/Mahe',
  'Indian/Maldives',
  'Indian/Mauritius',
  'Indian/Mayotte',
  'Indian/Reunion',
  'Iran',
  'Israel',
  'Jamaica',
  'Japan',
  'Kwajalein',
  'Libya',
  'MET',
  'MST',
  'MST7MDT',
  'Mexico/BajaNorte',
  'Mexico/BajaSur',
  'Mexico/General',
  'NZ',
  'NZ-CHAT',
  'Navajo',
  'PRC',
  'PST8PDT',
  'Pacific/Apia',
  'Pacific/Auckland',
  'Pacific/Bougainville',
  'Pacific/Chatham',
  'Pacific/Chuuk',
  'Pacific/Easter',
  'Pacific/Efate',
  'Pacific/Enderbury',
  'Pacific/Fakaofo',
  'Pacific/Fiji',
  'Pacific/Funafuti',
  'Pacific/Galapagos',
  'Pacific/Gambier',
  'Pacific/Guadalcanal',
  'Pacific/Guam',
  'Pacific/Honolulu',
  'Pacific/Johnston',
  'Pacific/Kanton',
  'Pacific/Kiritimati',
  'Pacific/Kosrae',
  'Pacific/Kwajalein',
  'Pacific/Majuro',
  'Pacific/Marquesas',
  'Pacific/Midway',
  'Pacific/Nauru',
  'Pacific/Niue',
  'Pacific/Norfolk',
  'Pacific/Noumea',
  'Pacific/Pago_Pago',
  'Pacific/Palau',
  'Pacific/Pitcairn',
  'Pacific/Pohnpei',
  'Pacific/Ponape',
  'Pacific/Port_Moresby',
  'Pacific/Rarotonga',
  'Pacific/Saipan',
  'Pacific/Samoa',
  'Pacific/Tahiti',
  'Pacific/Tarawa',
  'Pacific/Tongatapu',
  'Pacific/Truk',
  'Pacific/Wake',
  'Pacific/Wallis',
  'Pacific/Yap',
  'Poland',
  'Portugal',
  'ROC',
  'ROK',
  'Singapore',
  'Turkey',
  'UCT',
  'US/Alaska',
  'US/Aleutian',
  'US/Arizona',
  'US/Central',
  'US/East-Indiana',
  'US/Eastern',
  'US/Hawaii',
  'US/Indiana-Starke',
  'US/Michigan',
  'US/Mountain',
  'US/Pacific',
  'US/Samoa',
  'UTC',
  'Universal',
  'W-SU',
  'WET',
  'Zulu',
]
type IANATimezone = (typeof IANA_TIMEZONES)[number]
/**
 * This interface serves as a bridge between the config interface for the date picker amd the calendar.
 * */
interface Config {
  locale: Signal<string>
  firstDayOfWeek: Signal<WeekDay>
  timezone: Signal<IANATimezone>
}
declare enum Placement {
  TOP_START = 'top-start',
  TOP_END = 'top-end',
  BOTTOM_START = 'bottom-start',
  BOTTOM_END = 'bottom-end',
}
type DynamicPlacement =
  | Placement
  | ((calendarWrapper: HTMLDivElement) => Placement)
interface DatePickerAppSingleton extends AppSingleton {
  config: DatePickerConfigInternal
  elements: {
    DatePickerWrapper?: HTMLDivElement
  }
}
type DatePickerListeners = {
  onChange?: (date: Temporal.PlainDate) => void
  onEscapeKeyDown?: ($app: DatePickerAppSingleton) => void
}
type DatePickerStyle = {
  dark?: boolean
  fullWidth?: boolean
}
interface DatePickerConfigInternal extends Config {
  min: Temporal.PlainDate
  max: Temporal.PlainDate
  placement: DynamicPlacement
  listeners: DatePickerListeners
  style: DatePickerStyle
  teleportTo?: HTMLElement
  label?: string
  name?: string
  disabled?: boolean
  hasPlaceholder?: boolean
}
// This enum is used to represent names of all internally built views of the calendar
declare enum InternalViewName {
  Day = 'day',
  Week = 'week',
  MonthGrid = 'month-grid',
  MonthAgenda = 'month-agenda',
  List = 'list',
}
// Since implementers can use custom views, we need to have a type that combines the internal views with these custom views
type ViewName = InternalViewName | string
type DateRange = {
  start: Temporal.ZonedDateTime
  end: Temporal.ZonedDateTime
}
interface RangeSetterConfig {
  date: Temporal.PlainDate
  timeUnitsImpl: TimeUnits
  calendarConfig: CalendarConfigInternal
  range: Signal<DateRange | null>
}
type PreactViewComponent = (props: {
  $app: CalendarAppSingleton
  id: string
}) => JSX.Element
declare const addMonths: (
  to: Temporal.ZonedDateTime | Temporal.PlainDate,
  nMonths: number
) => Temporal.ZonedDateTime | Temporal.PlainDate
declare const addDays: (
  to: Temporal.ZonedDateTime | Temporal.PlainDate,
  nDays: number
) => Temporal.ZonedDateTime | Temporal.PlainDate
type ViewConfig<FrameworkComponent = PreactViewComponent> = {
  /**
   * a unique identifier for the view
   * */
  name: ViewName
  /**
   * text that will be displayed in the view dropdown
   * */
  label: string
  /**
   * function that is called when a new date is selected
   * */
  setDateRange: (config: RangeSetterConfig) => DateRange
  /**
   * should the view be displayed on small screens (< 700px calendar width)
   * */
  hasSmallScreenCompat: boolean
  /**
   * should the view be displayed on wide screens (> 700px calendar width)
   * */
  hasWideScreenCompat: boolean
  /**
   * The component you want to render
   * */
  Component: FrameworkComponent
  /**
   * function that is called when the user clicks the backward/forward button
   * */
  backwardForwardFn: typeof addDays | typeof addMonths
  /**
   * number of units to add into the backwardForwardFn function. Result behind the scenes for example:
   * backwardForwardFn = addDays
   * backwardForwardUnits = 1
   * result (behind the scenes) = addDays(date, 1)
   * */
  backwardForwardUnits: number
}
type View<FrameworkComponent = PreactViewComponent> =
  ViewConfig<FrameworkComponent> & {
    render(onElement: HTMLElement, $app: CalendarAppSingleton): void
    destroy(): void
  }
type EventId = number | string
type startDate = string
type nDays = number
type EventFragments = Record<startDate, nDays>
type CalendarEventOptions = {
  disableDND?: boolean
  disableResize?: boolean
  additionalClasses?: string[]
}
interface CalendarEventExternal {
  id: EventId
  start: Temporal.ZonedDateTime | Temporal.PlainDate
  end: Temporal.ZonedDateTime | Temporal.PlainDate
  title?: string
  people?: string[]
  location?: string
  description?: string
  calendarId?: string
  _customContent?: {
    timeGrid?: string
    dateGrid?: string
    monthGrid?: string
    monthAgenda?: string
    listEvent?: string
  }
  _options?: CalendarEventOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
interface CalendarEventInternal extends CalendarEventExternal {
  // event duration
  _isSingleDayTimed: boolean
  _isSingleDayFullDay: boolean
  _isSingleHybridDayTimed: boolean
  _isMultiDayTimed: boolean
  _isMultiDayFullDay: boolean
  // week time grid
  _previousConcurrentEvents: number | undefined
  _totalConcurrentEvents: number | undefined
  _maxConcurrentEvents: number | undefined
  // week date grid
  _nDaysInGrid: number | undefined
  // month grid
  _eventFragments: EventFragments
  _color: string
  _createdAt: Date | undefined
  _originalTimezone: IANATimezone | undefined
  _getForeignProperties(): Record<string, unknown>
  _getExternalEvent(): CalendarEventExternal
}
type DayBoundariesExternal = {
  start: string
  end: string
}
type DayBoundariesInternal = {
  start: number
  end: number
}
interface TimeGridDragHandler {}
type DayBoundariesDateTime = {
  start: Temporal.ZonedDateTime
  end: Temporal.ZonedDateTime
}
interface DateGridDragHandler {}
interface EventCoordinates {
  clientX: number
  clientY: number
}
interface DragHandlerDependencies {
  $app: CalendarAppSingleton
  eventCoordinates: EventCoordinates
  eventCopy: CalendarEventInternal
  updateCopy: (newCopy: CalendarEventInternal | undefined) => void
}
interface MonthGridDragHandler {}
interface DragAndDropPlugin extends PluginBase<string> {
  createTimeGridDragHandler(
    dependencies: DragHandlerDependencies,
    dayBoundariesDateTime: DayBoundariesDateTime
  ): TimeGridDragHandler
  createDateGridDragHandler(
    dependencies: DragHandlerDependencies
  ): DateGridDragHandler
  createMonthGridDragHandler(
    calendarEvent: CalendarEventInternal,
    $app: CalendarAppSingleton
  ): MonthGridDragHandler
  setInterval(minutes: number): void
}
type EventModalProps = {
  $app: CalendarAppSingleton
}
interface EventModalPlugin extends PluginBase<string> {
  calendarEvent: Signal<CalendarEventInternal | null>
  calendarEventDOMRect: Signal<DOMRect | null>
  calendarEventElement: Signal<HTMLElement | null>
  close(): void
  setCalendarEvent(
    event: CalendarEventInternal | null,
    eventTargetDOMRect: DOMRect | null
  ): void
  ComponentFn(props: EventModalProps): JSX.Element
}
interface CalendarCallbacks {
  onEventClick?: (event: CalendarEventExternal, e: UIEvent) => void
  onDoubleClickEvent?: (event: CalendarEventExternal, e: UIEvent) => void
  onRangeUpdate?: (range: DateRange) => void
  /**
   * Fetch events for the given date range.
   * This callback is called every time onRangeUpdate runs, and also once on render.
   * The returned events will be converted to internal events and set as $app.calendarEvents.list.value
   *
   * @param range The date range to fetch events for
   * @returns Promise resolving to an array of calendar events
   * */
  fetchEvents?: (range: DateRange) => Promise<CalendarEventExternal[]>
  onSelectedDateUpdate?: (date: Temporal.PlainDate) => void
  onClickDate?: (date: Temporal.PlainDate, e?: UIEvent) => void
  onDoubleClickDate?: (date: Temporal.PlainDate, e?: UIEvent) => void
  onClickDateTime?: (dateTime: Temporal.ZonedDateTime, e?: UIEvent) => void
  onDoubleClickDateTime?: (
    dateTime: Temporal.ZonedDateTime,
    e?: UIEvent
  ) => void
  onClickAgendaDate?: (date: Temporal.PlainDate, e?: UIEvent) => void
  onDoubleClickAgendaDate?: (date: Temporal.PlainDate, e?: UIEvent) => void
  onClickPlusEvents?: (date: Temporal.PlainDate, e?: UIEvent) => void
  onMouseDownDateTime?: (
    dateTime: Temporal.ZonedDateTime,
    mouseDownEvent: MouseEvent
  ) => void
  onMouseDownDateGridDate?: (
    date: Temporal.PlainDate,
    mouseDownEvent: MouseEvent
  ) => void
  onMouseDownMonthGridDate?: (
    date: Temporal.PlainDate,
    mouseDownEvent: MouseEvent
  ) => void
  onScrollDayIntoView?: (date: Temporal.PlainDate) => void
  /**
   * Run a validator function before updating an event.
   * Return false to prevent the event from being updated.
   * Return true to allow the event to be updated.
   *
   * @param oldEvent The event before the update
   * @param newEvent The event after the update
   * @param $app The calendar app singleton
   * */
  onBeforeEventUpdate?: (
    oldEvent: CalendarEventExternal,
    newEvent: CalendarEventExternal,
    $app: CalendarAppSingleton
  ) => boolean
  // see docs for onBeforeEventUpdate
  onBeforeEventUpdateAsync?: (
    oldEvent: CalendarEventExternal,
    newEvent: CalendarEventExternal,
    $app: CalendarAppSingleton
  ) => Promise<boolean>
  /**
   * Receive the updated event after it has been updated by for example drag & drop, resize or the interactive event modal.
   *
   * @param event The updated event
   * */
  onEventUpdate?: (event: CalendarEventExternal) => void
  beforeRender?: ($app: CalendarAppSingleton) => void
  onRender?: ($app: CalendarAppSingleton) => void
  isCalendarSmall?: ($app: CalendarAppSingleton) => boolean
}
type CustomComponentName =
  | 'timeGridEvent'
  | 'dateGridEvent'
  | 'monthGridEvent'
  | 'monthAgendaEvent'
  | 'listEvent'
  | 'listDayHeader'
  | 'listNoEvents'
  | 'eventModal'
  | 'headerContentLeftPrepend'
  | 'headerContentLeftAppend'
  | 'headerContentRightPrepend'
  | 'headerContentRightAppend'
  | 'headerContent'
  | 'interactiveModalAdditionalFields'
  | 'weekGridDate'
  | 'weekGridHour'
  | 'monthGridDayName'
  | 'monthGridDate'
  | string
type CustomComponentFns = {
  [key in CustomComponentName]?: CustomComponentFn
}
interface EventsFacade {
  get(id: EventId): CalendarEventExternal | undefined
  getAll(): CalendarEventExternal[]
  add(event: CalendarEventExternal): void
  update(event: CalendarEventExternal): void
  remove(id: EventId): void
  set(events: CalendarEventExternal[]): void
}
interface EventRecurrencePlugin extends PluginBase<string> {
  updateRecurrenceDND(
    eventId: EventId,
    oldEventStart: Temporal.ZonedDateTime | Temporal.PlainDate,
    newEventStart: Temporal.ZonedDateTime | Temporal.PlainDate
  ): void
  updateRecurrenceOnResize(
    eventId: EventId,
    oldEventEnd: Temporal.ZonedDateTime | Temporal.PlainDate,
    newEventEnd: Temporal.ZonedDateTime | Temporal.PlainDate
  ): void
  eventsFacade: EventsFacade
}
interface ResizePlugin extends PluginBase<string> {
  createTimeGridEventResizer(
    calendarEvent: CalendarEventInternal,
    updateCopy: (newCopy: CalendarEventInternal | undefined) => void,
    uiEvent: MouseEvent | TouchEvent,
    dayBoundariesDateTime: DateRange
  ): void
  createDateGridEventResizer(
    calendarEvent: CalendarEventInternal,
    updateCopy: (newCopy: CalendarEventInternal | undefined) => void,
    uiEvent: MouseEvent | TouchEvent
  ): void
  setInterval(minutes: number): void
}
type BackgroundEvent = {
  start: Temporal.PlainDate | Temporal.ZonedDateTime
  end: Temporal.PlainDate | Temporal.ZonedDateTime
  style: CSSProperties
  title?: string
  rrule?: string
  exdate?: string[]
}
interface DatePickerTranslations {
  Date: string
  'MM/DD/YYYY': string
  'Next month': string
  'Previous month': string
  'Choose Date': string
}
interface CalendarTranslations {
  Today: string
  Month: string
  Week: string
  Day: string
  List: string
  'Select View': string
  View: string
  '+ {{n}} events': string
  '+ 1 event': string
  'No events': string
  'Next period': string
  'Previous period': string
  to: string // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': string
  'Link to {{n}} more events on {{date}}': string
  'Link to 1 more event on {{date}}': string
  CW: string
}
interface TimePickerTranslations {
  Time: string // default label
  AM: string // for 12-hour clock mode
  PM: string // for 12-hour clock mode
  Cancel: string
  OK: string
  'Select time': string
}
type Language = Partial<DatePickerTranslations> &
  Partial<CalendarTranslations> &
  Partial<TimePickerTranslations> &
  Record<string, string> // enable custom & premium plugins to use the default translator
type TimezoneSelectProps = {
  $app: CalendarAppSingleton
}
interface TimezoneSelectPlugin extends PluginBase<string> {
  onRender($app: CalendarAppSingleton): void
  isEnabled: Signal<boolean>
  ComponentFn(props: TimezoneSelectProps): JSX.Element
  setEnabled(enabled: boolean): void
}
type WeekOptions = {
  gridHeight: number
  nDays: number
  eventWidth: number
  timeAxisFormatOptions: Intl.DateTimeFormatOptions
  eventOverlap: boolean
  gridStep: 60 | 30 | 15
}
type MonthGridOptions = {
  nEventsPerDay: number
}
type ColorDefinition = {
  main: string
  container: string
  onContainer: string
}
type CalendarType = {
  colorName: string
  label?: string
  lightColors?: ColorDefinition
  darkColors?: ColorDefinition
}
type Plugins = {
  dragAndDrop?: DragAndDropPlugin
  eventModal?: EventModalPlugin
  scrollController?: PluginBase<string>
  eventRecurrence?: EventRecurrencePlugin
  resize?: ResizePlugin
  timezoneSelect?: TimezoneSelectPlugin
  [key: string]: PluginBase<string> | undefined
}
type CustomComponentFn = (
  wrapperElement: HTMLElement,
  props: Record<string, unknown>
) => void
interface CalendarConfigInternal extends Config {
  theme: string | undefined
  defaultView: ViewName
  views: Signal<View[]>
  dayBoundaries: Signal<DayBoundariesInternal>
  weekOptions: Signal<WeekOptions>
  calendars: Signal<Record<string, CalendarType>>
  isDark: Signal<boolean>
  minDate: Signal<Temporal.PlainDate | undefined>
  maxDate: Signal<Temporal.PlainDate | undefined>
  monthGridOptions: Signal<MonthGridOptions>
  plugins: Plugins
  isResponsive: boolean
  showWeekNumbers: Signal<boolean>
  callbacks: CalendarCallbacks
  _customComponentFns: CustomComponentFns
  _destroyCustomComponentInstance: ((ccid: string) => void) | undefined
  translations: Signal<Record<string, Language>>
  direction: 'ltr' | 'rtl'
  // Getters
  isHybridDay: boolean
  timePointsPerDay: number
}
interface CalendarState {
  isCalendarSmall: Signal<boolean | undefined>
  view: ReadonlySignal<ViewName>
  setView: (view: ViewName, selectedDate: Temporal.PlainDate) => void
  range: Signal<DateRange | null>
  isDark: Signal<boolean>
  setRange: (date: Temporal.PlainDate) => void
}
type EventsFilterPredicate =
  | ((event: CalendarEventInternal) => boolean)
  | undefined
interface CalendarEvents {
  list: Signal<CalendarEventInternal[]>
  filterPredicate: Signal<EventsFilterPredicate>
  backgroundEvents: Signal<BackgroundEvent[]>
}
interface CalendarElements {
  calendarWrapper: HTMLDivElement | undefined
}
interface CalendarAppSingleton extends AppSingleton {
  config: CalendarConfigInternal
  datePickerConfig: DatePickerConfigInternal
  calendarState: CalendarState
  calendarEvents: CalendarEvents
  elements: CalendarElements
}
interface PluginBase<Name extends string> {
  name: Name
  /**
   * Allow implementers to dynamically add any properties to the global app object as they see fit.
   * In order to avoid conflict with future properties added to the library, we recommend
   * using the unique prefix `$` for any custom properties added to the global app object.
   * for example $app['$websocketService'] = new WebsocketService().
   * Adding properties to existing sub-objects is discouraged, since this will make your application more
   * brittle to future changes in the library.
   * */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeRender?($app: CalendarAppSingleton | any): void
  /**
   * Allow implementers to dynamically add any properties to the global app object as they see fit.
   * In order to avoid conflict with future properties added to the library, we recommend
   * using the unique prefix `$` for any custom properties added to the global app object.
   * for example $app['$websocketService'] = new WebsocketService().
   * Adding properties to existing sub-objects is discouraged, since this will make your application more
   * brittle to future changes in the library.
   * */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRender?($app: CalendarAppSingleton | any): void
  onRangeUpdate?: (range: DateRange) => void
  onTimezoneChange?: (timezone: IANATimezone) => void
  onDayBoundariesChange?: (dayBoundaries: DayBoundariesInternal) => void
  destroy?(): void
}
interface CalendarControlsPlugin extends PluginBase<string> {
  onRender($app: CalendarAppSingleton): void
  setDate(date: Temporal.PlainDate): void
  setView(view: string): void
  setFirstDayOfWeek(firstDayOfWeek: WeekDay): void
  setLocale(locale: string): void
  setViews(views: [View, ...View[]]): void
  setDayBoundaries(dayBoundaries: DayBoundariesExternal): void
  setWeekOptions(weekOptions: WeekOptions): void
  setCalendars(calendars: Record<string, CalendarType>): void
  setMinDate(minDate: Temporal.PlainDate | undefined): void
  setMaxDate(maxDate: Temporal.PlainDate | undefined): void
  setMonthGridOptions(monthGridOptions: MonthGridOptions): void
  setTimezone(timezone: IANATimezone): void
  getDate(): Temporal.PlainDate
  getView(): string
  getFirstDayOfWeek(): WeekDay
  getLocale(): string
  getViews(): View[]
  getDayBoundaries(): DayBoundariesExternal
  getWeekOptions(): WeekOptions
  getCalendars(): Record<string, CalendarType>
  getMinDate(): Temporal.PlainDate | undefined
  getMaxDate(): Temporal.PlainDate | undefined
  getMonthGridOptions(): MonthGridOptions
  getRange(): DateRange | null
}
declare enum PluginName {
  DragAndDrop = 'dragAndDrop',
  EventModal = 'eventModal',
  ScrollController = 'scrollController',
  EventRecurrence = 'eventRecurrence',
  Resize = 'resize',
  CalendarControls = 'calendarControls',
  CurrentTime = 'currentTime',
}
declare class CalendarControlsPluginImpl implements CalendarControlsPlugin {
  name: PluginName
  $app: CalendarAppSingleton
  beforeRender($app: CalendarAppSingleton): void
  onRender($app: CalendarAppSingleton): void
  setDate(date: Temporal.PlainDate): void
  setView(view: string): void
  setFirstDayOfWeek(firstDayOfWeek: WeekDay): void
  setLocale(locale: string): void
  setViews(views: [View, ...View[]]): void
  setDayBoundaries(dayBoundaries: DayBoundariesExternal): void
  setWeekOptions(weekOptions: Partial<WeekOptions>): void
  setCalendars(calendars: Record<string, CalendarType>): void
  setMinDate(minDate: Temporal.PlainDate | undefined): void
  setMaxDate(maxDate: Temporal.PlainDate | undefined): void
  setMonthGridOptions(monthGridOptions: MonthGridOptions): void
  setTimezone(timezone: IANATimezone): void
  getDate: () => Temporal.PlainDate
  getView: () => string
  getFirstDayOfWeek: () => WeekDay
  getLocale: () => string
  getViews: () => View[]
  getDayBoundaries: () => DayBoundariesExternal
  getWeekOptions: () => WeekOptions
  getCalendars: () => Record<string, CalendarType>
  getMinDate: () => Temporal.PlainDate | undefined
  getMaxDate: () => Temporal.PlainDate | undefined
  getMonthGridOptions: () => MonthGridOptions
  getRange: () => DateRange | null
}
declare const createCalendarControlsPlugin: () => CalendarControlsPluginImpl & {
  name: PluginName.CalendarControls
}
export { createCalendarControlsPlugin }
