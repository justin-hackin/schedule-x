import { Signal } from '@preact/signals'
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
declare const arEG: Language
declare const deDE: Language
declare const enUS: Language
declare const itIT: Language
declare const enGB: Language
declare const svSE: Language
declare const zhCN: Language
declare const zhTW: Language
declare const jaJP: Language
declare const ruRU: Language
declare const koKR: Language
declare const frFR: Language
declare const frCH: Language
declare const daDK: Language
declare const plPL: Language
declare const esES: Language
declare const nlNL: Language
declare const ptBR: Language
declare const skSK: Language
declare const mkMK: Language
declare const nbNO: Language
declare const trTR: Language
declare const kyKG: Language
declare const idID: Language
declare const csCZ: Language
declare const etEE: Language
declare const ukUA: Language
declare const srLatnRS: Language
declare const caES: Language
declare const ltLT: Language
declare const hrHR: Language
declare const slSI: Language
declare const fiFI: Language
declare const roRO: Language
declare const faIR: Language
type TranslationVariables = {
  [key: string]: string | number
}
declare const translate: (
  locale: Signal<string>,
  languages: Signal<Record<string, Language>>
) => (key: string, translationVariables?: TranslationVariables) => string
/**
 * A function which can take an endless lists of arguments, all with the type Record<string, Language>
 * and merge them into a single Record<string, Language>,
 * always going over each key and merging the values of each key by means of spread operator
 * */
declare const mergeLocales: (
  ...locales: Record<string, Language>[]
) => Record<string, Language>
declare const heIL: Language
declare const translations: {
  deDE: Language
  enUS: Language
  itIT: Language
  enGB: Language
  svSE: Language
  zhCN: Language
  zhTW: Language
  jaJP: Language
  ruRU: Language
  koKR: Language
  frFR: Language
  daDK: Language
  mkMK: Language
  nbNO: Language
  plPL: Language
  heIL: Language
  esES: Language
  nlNL: Language
  ptBR: Language
  skSK: Language
  trTR: Language
  kyKG: Language
  idID: Language
  csCZ: Language
  etEE: Language
  ukUA: Language
  caES: Language
  srLatnRS: Language
  srRS: Language
  ltLT: Language
  hrHR: Language
  slSI: Language
  fiFI: Language
  roRO: Language
  faIR: Language
  arEG: Language
}
declare const datePickerTranslations: {
  deDE: DatePickerTranslations
  enUS: DatePickerTranslations
  itIT: DatePickerTranslations
  enGB: DatePickerTranslations
  svSE: DatePickerTranslations
  zhCN: DatePickerTranslations
  zhTW: DatePickerTranslations
  jaJP: DatePickerTranslations
  ruRU: DatePickerTranslations
  koKR: DatePickerTranslations
  frFR: DatePickerTranslations
  frCH: DatePickerTranslations
  daDK: DatePickerTranslations
  mkMK: DatePickerTranslations
  nbNO: DatePickerTranslations
  plPL: DatePickerTranslations
  esES: DatePickerTranslations
  nlNL: DatePickerTranslations
  ptBR: DatePickerTranslations
  skSK: DatePickerTranslations
  trTR: DatePickerTranslations
  kyKG: DatePickerTranslations
  idID: DatePickerTranslations
  csCZ: DatePickerTranslations
  etEE: DatePickerTranslations
  ukUA: DatePickerTranslations
  caES: DatePickerTranslations
  srLatnRS: DatePickerTranslations
  srRS: DatePickerTranslations
  ltLT: DatePickerTranslations
  hrHr: DatePickerTranslations
  slSI: DatePickerTranslations
  fiFI: DatePickerTranslations
  roRO: DatePickerTranslations
  heIL: DatePickerTranslations
  faIR: DatePickerTranslations
  arEG: DatePickerTranslations
}
export {
  mergeLocales,
  translate,
  translations,
  datePickerTranslations,
  deDE,
  enUS,
  itIT,
  enGB,
  svSE,
  zhCN,
  zhTW,
  jaJP,
  ruRU,
  koKR,
  frFR,
  frCH,
  daDK,
  plPL,
  esES,
  mkMK,
  nbNO,
  nlNL,
  ptBR,
  skSK,
  trTR,
  kyKG,
  idID,
  csCZ,
  etEE,
  ukUA,
  caES,
  srLatnRS,
  ltLT,
  hrHR,
  slSI,
  fiFI,
  roRO,
  heIL,
  faIR,
  arEG,
}
