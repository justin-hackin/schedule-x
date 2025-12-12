'use strict'

const datePickerArEG = {
  Date: 'التاريخ',
  'MM/DD/YYYY': 'DD/MM/YYYY', // Keep format unchanged unless you want to localize it
  'Next month': 'الشهر القادم',
  'Previous month': 'الشهر السابق',
  'Choose Date': 'اختر التاريخ',
}

const timePickerArEG = {
  Time: 'الوقت',
  AM: 'ص',
  PM: 'م',
  Cancel: 'إلغاء',
  OK: 'موافق',
  'Select time': 'اختر الوقت',
}

const calendarArEG = {
  Today: 'اليوم',
  Month: 'الشهر',
  Week: 'الأسبوع',
  Day: 'اليوم',
  List: 'القائمة',
  'Select View': 'اختر العرض',
  '+ {{n}} events': '+ {{n}} الأحداث',
  '+ 1 event': '+ 1 حدث',
  'No events': 'لا توجد أحداث',
  'Next period': 'الفترة التالية',
  'Previous period': 'الفترة السابقة',
  to: 'إلى', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'أحداث ليوم كامل أو لعدة أيام',
  'Link to {{n}} more events on {{date}}':
    'رابط إلى {{n}} أحداث أخرى في {{date}}',
  'Link to 1 more event on {{date}}': 'رابط إلى حدث آخر في {{date}}',
  CW: 'الأسبوع {{week}}',
  View: 'عرض',
}

const arEG = {
  ...calendarArEG,
  ...datePickerArEG,
  ...timePickerArEG,
}

const datePickerDeDE = {
  Date: 'Datum',
  'MM/DD/YYYY': 'TT.MM.JJJJ',
  'Next month': 'Nächster Monat',
  'Previous month': 'Vorheriger Monat',
  'Choose Date': 'Datum auswählen',
}

const calendarDeDE = {
  Today: 'Heute',
  Month: 'Monat',
  Week: 'Woche',
  Day: 'Tag',
  List: 'Liste',
  'Select View': 'Ansicht auswählen',
  View: 'Ansicht',
  '+ {{n}} events': '+ {{n}} Ereignisse',
  '+ 1 event': '+ 1 Ereignis',
  'No events': 'Keine Ereignisse',
  'Next period': 'Nächster Zeitraum',
  'Previous period': 'Vorheriger Zeitraum',
  to: 'bis', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Ganztägige und mehrtägige Termine',
  'Link to {{n}} more events on {{date}}':
    'Link zu {{n}} weiteren Terminen am {{date}}',
  'Link to 1 more event on {{date}}': 'Link zu 1 weiterem Termin am {{date}}',
  CW: 'KW {{week}}',
}

const timePickerDeDE = {
  Time: 'Uhrzeit',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Abbrechen',
  OK: 'OK',
  'Select time': 'Uhrzeit auswählen',
}

const deDE = {
  ...datePickerDeDE,
  ...calendarDeDE,
  ...timePickerDeDE,
}

const datePickerEnUS = {
  Date: 'Date',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'Next month': 'Next month',
  'Previous month': 'Previous month',
  'Choose Date': 'Choose Date',
}

const calendarEnUS = {
  Today: 'Today',
  Month: 'Month',
  Week: 'Week',
  Day: 'Day',
  List: 'List',
  'Select View': 'Select View',
  View: 'View',
  '+ {{n}} events': '+ {{n}} events',
  '+ 1 event': '+ 1 event',
  'No events': 'No events',
  'Next period': 'Next period',
  'Previous period': 'Previous period',
  to: 'to', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Full day- and multiple day events',
  'Link to {{n}} more events on {{date}}':
    'Link to {{n}} more events on {{date}}',
  'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
  CW: 'Week {{week}}',
}

const timePickerEnUS = {
  Time: 'Time',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Cancel',
  OK: 'OK',
  'Select time': 'Select time',
}

const enUS = {
  ...datePickerEnUS,
  ...calendarEnUS,
  ...timePickerEnUS,
}

const datePickerItIT = {
  Date: 'Data',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Mese successivo',
  'Previous month': 'Mese precedente',
  'Choose Date': 'Scegli la data',
}

const calendarItIT = {
  Today: 'Oggi',
  Month: 'Mese',
  Week: 'Settimana',
  Day: 'Giorno',
  List: 'Lista',
  'Select View': 'Seleziona la vista',
  View: 'Vista',
  '+ {{n}} events': '+ {{n}} eventi',
  '+ 1 event': '+ 1 evento',
  'No events': 'Nessun evento',
  'Next period': 'Periodo successivo',
  'Previous period': 'Periodo precedente',
  to: 'a', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Eventi della giornata e plurigiornalieri',
  'Link to {{n}} more events on {{date}}':
    'Link a {{n}} eventi in più il {{date}}',
  'Link to 1 more event on {{date}}': 'Link a 1 evento in più il {{date}}',
  CW: 'Settimana {{week}}',
}

const timePickerItIT = {
  Time: 'Ora',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Annulla',
  OK: 'OK',
  'Select time': 'Seleziona ora',
}

const itIT = {
  ...datePickerItIT,
  ...calendarItIT,
  ...timePickerItIT,
}

const datePickerEnGB = {
  Date: 'Date',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Next month',
  'Previous month': 'Previous month',
  'Choose Date': 'Choose Date',
}

const calendarEnGB = {
  Today: 'Today',
  Month: 'Month',
  Week: 'Week',
  Day: 'Day',
  List: 'List',
  'Select View': 'Select View',
  '+ {{n}} events': '+ {{n}} events',
  '+ 1 event': '+ 1 event',
  'No events': 'No events',
  'Next period': 'Next period',
  'Previous period': 'Previous period',
  to: 'to', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Full day- and multiple day events',
  'Link to {{n}} more events on {{date}}':
    'Link to {{n}} more events on {{date}}',
  'Link to 1 more event on {{date}}': 'Link to 1 more event on {{date}}',
  CW: 'Week {{week}}',
  View: 'View',
}

const timePickerEnGB = {
  Time: 'Time',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Cancel',
  OK: 'OK',
  'Select time': 'Select time',
}

const enGB = {
  ...datePickerEnGB,
  ...calendarEnGB,
  ...timePickerEnGB,
}

const datePickerSvSE = {
  Date: 'Datum',
  'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
  'Next month': 'Nästa månad',
  'Previous month': 'Föregående månad',
  'Choose Date': 'Välj datum',
}

const calendarSvSE = {
  Today: 'Idag',
  Month: 'Månad',
  Week: 'Vecka',
  Day: 'Dag',
  List: 'Lista',
  'Select View': 'Välj vy',
  View: 'Vy',
  '+ {{n}} events': '+ {{n}} händelser',
  '+ 1 event': '+ 1 händelse',
  'No events': 'Inga händelser',
  'Next period': 'Nästa period',
  'Previous period': 'Föregående period',
  to: 'till', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Heldags- och flerdagshändelser',
  'Link to {{n}} more events on {{date}}':
    'Länk till {{n}} fler händelser den {{date}}',
  'Link to 1 more event on {{date}}': 'Länk till 1 händelse till den {{date}}',
  CW: 'Vecka {{week}}',
}

const timePickerSvSE = {
  Time: 'Tid',
  AM: 'FM',
  PM: 'EM',
  Cancel: 'Avbryt',
  OK: 'OK',
  'Select time': 'Välj tid',
}

const svSE = {
  ...datePickerSvSE,
  ...calendarSvSE,
  ...timePickerSvSE,
}

const datePickerZhCN = {
  Date: '日期',
  'MM/DD/YYYY': '年/月/日',
  'Next month': '下个月',
  'Previous month': '上个月',
  'Choose Date': '选择日期',
}

const calendarZhCN = {
  Today: '今天',
  Month: '月',
  Week: '周',
  Day: '日',
  List: '列表',
  'Select View': '选择视图',
  View: '视图',
  '+ {{n}} events': '+ {{n}} 场活动',
  '+ 1 event': '+ 1 活动',
  'No events': '没有活动',
  'Next period': '下一段时间',
  'Previous period': '上一段时间',
  to: '至', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': '全天和多天活动',
  'Link to {{n}} more events on {{date}}': '链接到{{date}}上的{{n}}个更多活动',
  'Link to 1 more event on {{date}}': '链接到{{date}}上的1个更多活动',
  CW: '第{{week}}周',
}

const timePickerZhCN = {
  Time: '时间',
  AM: '上午',
  PM: '下午',
  Cancel: '取消',
  OK: '确定',
  'Select time': '选择时间',
}

const zhCN = {
  ...datePickerZhCN,
  ...calendarZhCN,
  ...timePickerZhCN,
}

const datePickerZhTW = {
  Date: '日期',
  'MM/DD/YYYY': '年/月/日',
  'Next month': '下個月',
  'Previous month': '上個月',
  'Choose Date': '選擇日期',
}

const calendarZhTW = {
  Today: '今天',
  Month: '月',
  Week: '周',
  Day: '日',
  List: '列表',
  'Select View': '選擇檢視模式',
  View: '檢視',
  '+ {{n}} events': '+ {{n}} 場活動',
  '+ 1 event': '+ 1 活動',
  'No events': '沒有活動',
  'Next period': '下一段時間',
  'Previous period': '上一段時間',
  to: '到', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': '全天和多天活動',
  'Link to {{n}} more events on {{date}}': '連接到{{date}}上的{{n}}個更多活動',
  'Link to 1 more event on {{date}}': '連接到{{date}}上的1個更多活動',
  CW: '第{{week}}周',
}

const timePickerZhTW = {
  Time: '時間',
  AM: '上午',
  PM: '下午',
  Cancel: '取消',
  OK: '確定',
  'Select time': '選擇時間',
}

const zhTW = {
  ...datePickerZhTW,
  ...calendarZhTW,
  ...timePickerZhTW,
}

const datePickerJaJP = {
  Date: '日付',
  'MM/DD/YYYY': '年/月/日',
  'Next month': '次の月',
  'Previous month': '前の月',
  'Choose Date': '日付を選択',
}

const calendarJaJP = {
  Today: '今日',
  Month: '月',
  Week: '週',
  Day: '日',
  List: 'リスト',
  'Select View': 'ビューを選択',
  View: 'ビュー',
  '+ {{n}} events': '+ {{n}} イベント',
  '+ 1 event': '+ 1 イベント',
  'No events': 'イベントなし',
  'Next period': '次の期間',
  'Previous period': '前の期間',
  to: 'から', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': '終日および複数日イベント',
  'Link to {{n}} more events on {{date}}':
    '{{date}} に{{n}}件のイベントへのリンク',
  'Link to 1 more event on {{date}}': '{{date}} に1件のイベントへのリンク',
  CW: '週 {{week}}',
}

const timePickerJaJP = {
  Time: '時間',
  AM: '午前',
  PM: '午後',
  Cancel: 'キャンセル',
  OK: 'OK',
  'Select time': '時間を選択',
}

const jaJP = {
  ...datePickerJaJP,
  ...calendarJaJP,
  ...timePickerJaJP,
}

const datePickerRuRU = {
  Date: 'Дата',
  'MM/DD/YYYY': 'ММ/ДД/ГГГГ',
  'Next month': 'Следующий месяц',
  'Previous month': 'Прошлый месяц',
  'Choose Date': 'Выберите дату',
}

const calendarRuRU = {
  Today: 'Сегодня',
  Month: 'Месяц',
  Week: 'Неделя',
  Day: 'День',
  List: 'Список',
  'Select View': 'Выберите вид',
  '+ {{n}} events': '+ {{n}} события',
  '+ 1 event': '+ 1 событие',
  'No events': 'Нет событий',
  'Next period': 'Следующий период',
  'Previous period': 'Прошлый период',
  to: 'по', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'События на целый день и несколько дней подряд',
  'Link to {{n}} more events on {{date}}':
    'Ссылка на {{n}} дополнительных событий на {{date}}',
  'Link to 1 more event on {{date}}':
    'Ссылка на 1 дополнительное событие на {{date}}',
  CW: 'Неделя {{week}}',
  View: 'Вид',
}

const timePickerRuRU = {
  Time: 'Время',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Отмена',
  OK: 'ОК',
  'Select time': 'Выберите время',
}

const ruRU = {
  ...datePickerRuRU,
  ...calendarRuRU,
  ...timePickerRuRU,
}

const datePickerKoKR = {
  Date: '일자',
  'MM/DD/YYYY': '년/월/일',
  'Next month': '다음 달',
  'Previous month': '이전 달',
  'Choose Date': '날짜 선택',
}

const calendarKoKR = {
  Today: '오늘',
  Month: '월',
  Week: '주',
  Day: '일',
  List: '목록',
  'Select View': '보기 선택',
  '+ {{n}} events': '+ {{n}} 일정들',
  '+ 1 event': '+ 1 일정',
  'No events': '일정 없음',
  'Next period': '다음',
  'Previous period': '이전',
  to: '부터', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': '종일 및 복수일 일정',
  'Link to {{n}} more events on {{date}}':
    '{{date}}에 {{n}}개 이상의 이벤트로 이동',
  'Link to 1 more event on {{date}}': '{{date}}에 1개 이상의 이벤트로 이동',
  CW: '{{week}}주',
  View: '보기',
}

const timePickerKoKR = {
  Time: '시간',
  AM: '오전',
  PM: '오후',
  Cancel: '취소',
  OK: '확인',
  'Select time': '시간 선택',
}

const koKR = {
  ...datePickerKoKR,
  ...calendarKoKR,
  ...timePickerKoKR,
}

const datePickerFrFR = {
  Date: 'Date',
  'MM/DD/YYYY': 'JJ/MM/AAAA',
  'Next month': 'Mois suivant',
  'Previous month': 'Mois précédent',
  'Choose Date': 'Choisir une date',
}

const calendarFrFR = {
  Today: "Aujourd'hui",
  Month: 'Mois',
  Week: 'Semaine',
  Day: 'Jour',
  List: 'Liste',
  'Select View': 'Sélectionner la vue',
  View: 'Vue',
  '+ {{n}} events': '+ {{n}} événements',
  '+ 1 event': '+ 1 événement',
  'No events': 'Aucun événement',
  'Next period': 'Période suivante',
  'Previous period': 'Période précédente',
  to: 'au', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Événements sur une journée ou plusieurs jours',
  'Link to {{n}} more events on {{date}}':
    'Lien vers {{n}} événements supplémentaires le {{date}}',
  'Link to 1 more event on {{date}}':
    'Lien vers 1 événement supplémentaire le {{date}}',
  CW: 'S{{week}}',
}

const timePickerFrFR = {
  Time: 'Heure',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Annuler',
  OK: 'OK',
  'Select time': "Sélectionner l'heure",
}

const frFR = {
  ...datePickerFrFR,
  ...calendarFrFR,
  ...timePickerFrFR,
}

const datePickerFrCH = {
  ...datePickerFrFR,
  'MM/DD/YYYY': 'JJ.MM.AAAA',
}

const frCH = {
  ...datePickerFrCH,
  ...calendarFrFR,
  ...timePickerFrFR,
}

const datePickerDaDK = {
  Date: 'Dato',
  'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
  'Next month': 'Næste måned',
  'Previous month': 'Foregående måned',
  'Choose Date': 'Vælg dato',
}

const calendarDaDK = {
  Today: 'I dag',
  Month: 'Måned',
  Week: 'Uge',
  Day: 'Dag',
  List: 'Liste',
  'Select View': 'Vælg visning',
  '+ {{n}} events': '+ {{n}} begivenheder',
  '+ 1 event': '+ 1 begivenhed',
  'No events': 'Ingen begivenheder',
  'Next period': 'Næste periode',
  'Previous period': 'Forgående periode',
  to: 'til', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Heldagsbegivenheder og flerdagsbegivenheder',
  'Link to {{n}} more events on {{date}}':
    'Link til {{n}} flere begivenheder den {{date}}',
  'Link to 1 more event on {{date}}': 'Link til 1 mere begivenhed den {{date}}',
  CW: 'Uge {{week}}',
  View: 'Visning',
}

const timePickerDaDK = {
  Time: 'Tid',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Annuller',
  OK: 'OK',
  'Select time': 'Vælg tid',
}

const daDK = {
  ...datePickerDaDK,
  ...calendarDaDK,
  ...timePickerDaDK,
}

const datePickerPlPL = {
  Date: 'Data',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Następny miesiąc',
  'Previous month': 'Poprzedni miesiąc',
  'Choose Date': 'Wybiewrz datę',
}

const calendarPlPL = {
  Today: 'Dzisiaj',
  Month: 'Miesiąc',
  Week: 'Tydzień',
  Day: 'Dzień',
  List: 'Lista',
  'Select View': 'Wybierz widok',
  '+ {{n}} events': '+ {{n}} wydarzenia',
  '+ 1 event': '+ 1 wydarzenie',
  'No events': 'Brak wydarzeń',
  'Next period': 'Następny okres',
  'Previous period': 'Poprzedni okres',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Wydarzenia całodniowe i wielodniowe',
  'Link to {{n}} more events on {{date}}':
    'Link do {{n}} kolejnych wydarzeń w dniu {{date}}',
  'Link to 1 more event on {{date}}':
    'Link do 1 kolejnego wydarzenia w dniu {{date}}',
  CW: 'Tydzień {{week}}',
  View: 'Widok',
}

const timePickerPlPL = {
  Time: 'Godzina',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Anuluj',
  OK: 'OK',
  'Select time': 'Wybierz godzinę',
}

const plPL = {
  ...datePickerPlPL,
  ...calendarPlPL,
  ...timePickerPlPL,
}

const datePickerEsES = {
  Date: 'Fecha',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Siguiente mes',
  'Previous month': 'Mes anterior',
  'Choose Date': 'Seleccione una fecha',
}

const calendarEsES = {
  Today: 'Hoy',
  Month: 'Mes',
  Week: 'Semana',
  Day: 'Día',
  List: 'Lista',
  'Select View': 'Seleccionar vista',
  View: 'Vista',
  '+ {{n}} events': '+ {{n}} eventos',
  '+ 1 event': '+ 1 evento',
  'No events': 'No hay eventos',
  'Next period': 'Siguiente período',
  'Previous period': 'Período anterior',
  to: 'a', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Día completo y eventos de múltiples días',
  'Link to {{n}} more events on {{date}}':
    'Enlace a {{n}} eventos más el {{date}}',
  'Link to 1 more event on {{date}}': 'Enlace a 1 evento más el {{date}}',
  CW: 'Semana {{week}}',
}

const timePickerEsES = {
  Time: 'Hora',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Cancelar',
  OK: 'Aceptar',
  'Select time': 'Seleccionar hora',
}

const esES = {
  ...datePickerEsES,
  ...calendarEsES,
  ...timePickerEsES,
}

const calendarNlNL = {
  Today: 'Vandaag',
  Month: 'Maand',
  Week: 'Week',
  Day: 'Dag',
  List: 'Lijst',
  'Select View': 'Kies weergave',
  '+ {{n}} events': '+ {{n}} gebeurtenissen',
  '+ 1 event': '+ 1 gebeurtenis',
  'No events': 'Geen gebeurtenissen',
  'Next period': 'Volgende periode',
  'Previous period': 'Vorige periode',
  to: 'tot', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Evenementen van een hele dag en meerdere dagen',
  'Link to {{n}} more events on {{date}}':
    'Link naar {{n}} meer evenementen op {{date}}',
  'Link to 1 more event on {{date}}': 'Link naar 1 meer evenement op {{date}}',
  CW: 'Week {{week}}',
  View: 'Weergave',
}

const datePickerNlNL = {
  Date: 'Datum',
  'MM/DD/YYYY': 'DD-MM-JJJJ',
  'Next month': 'Volgende maand',
  'Previous month': 'Vorige maand',
  'Choose Date': 'Kies datum',
}

const timePickerNlNL = {
  Time: 'Tijd',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Annuleren',
  OK: 'OK',
  'Select time': 'Selecteer tijd',
}

const nlNL = {
  ...datePickerNlNL,
  ...calendarNlNL,
  ...timePickerNlNL,
}

const datePickerPtBR = {
  Date: 'Data',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Mês seguinte',
  'Previous month': 'Mês anterior',
  'Choose Date': 'Escolha uma data',
}

const calendarPtBR = {
  Today: 'Hoje',
  Month: 'Mês',
  Week: 'Semana',
  Day: 'Dia',
  List: 'Lista',
  'Select View': 'Selecione uma visualização',
  '+ {{n}} events': '+ {{n}} eventos',
  '+ 1 event': '+ 1 evento',
  'No events': 'Sem eventos',
  'Next period': 'Período seguinte',
  'Previous period': 'Período anterior',
  to: 'a', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Dia inteiro e eventos de vários dias',
  'Link to {{n}} more events on {{date}}':
    'Link para mais {{n}} eventos em {{date}}',
  'Link to 1 more event on {{date}}': 'Link para mais 1 evento em {{date}}',
  CW: 'Semana {{week}}',
  View: 'Visualização',
}

const timePickerPtBR = {
  Time: 'Hora',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Cancelar',
  OK: 'OK',
  'Select time': 'Selecionar hora',
}

const ptBR = {
  ...datePickerPtBR,
  ...calendarPtBR,
  ...timePickerPtBR,
}

const datePickerSkSK = {
  Date: 'Dátum',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Ďalší mesiac',
  'Previous month': 'Predchádzajúci mesiac',
  'Choose Date': 'Vyberte dátum',
}

const calendarSkSK = {
  Today: 'Dnes',
  Month: 'Mesiac',
  Week: 'Týždeň',
  Day: 'Deň',
  List: 'Zoznam',
  'Select View': 'Vyberte zobrazenie',
  '+ {{n}} events': '+ {{n}} udalosti',
  '+ 1 event': '+ 1 udalosť',
  'No events': 'Žiadne udalosti',
  'Next period': 'Ďalšie obdobie',
  'Previous period': 'Predchádzajúce obdobie',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Celodenné a viacdňové udalosti',
  'Link to {{n}} more events on {{date}}':
    'Odkaz na {{n}} ďalších udalostí dňa {{date}}',
  'Link to 1 more event on {{date}}': 'Odkaz na 1 ďalšiu udalosť dňa {{date}}',
  CW: '{{week}}. týždeň',
  View: 'Zobrazenie',
}

const timePickerSkSK = {
  Time: 'Čas',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Zrušiť',
  OK: 'OK',
  'Select time': 'Vybrať čas',
}

const skSK = {
  ...datePickerSkSK,
  ...calendarSkSK,
  ...timePickerSkSK,
}

const datePickerMkMK = {
  Date: 'Датум',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Следен месец',
  'Previous month': 'Претходен месец',
  'Choose Date': 'Избери Датум',
}

const calendarMkMK = {
  Today: 'Денес',
  Month: 'Месец',
  Week: 'Недела',
  Day: 'Ден',
  List: 'Листа',
  'Select View': 'Избери Преглед',
  '+ {{n}} events': '+ {{n}} настани',
  '+ 1 event': '+ 1 настан',
  'No events': 'Нема настани',
  'Next period': 'Следен период',
  'Previous period': 'Претходен период',
  to: 'до', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Целодневни и повеќедневни настани',
  'Link to {{n}} more events on {{date}}':
    'Линк до {{n}} повеќе настани на {{date}}',
  'Link to 1 more event on {{date}}': 'Линк до 1 повеќе настан на {{date}}',
  CW: 'Недела {{week}}',
  View: 'Преглед',
}

const timePickerMkMK = {
  Time: 'Време',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Откажи',
  OK: 'У реду',
  'Select time': 'Избери време',
}

const mkMK = {
  ...datePickerMkMK,
  ...calendarMkMK,
  ...timePickerMkMK,
}

const datePickerNbNO = {
  Date: 'Dato',
  'MM/DD/YYYY': 'DD.MM.YYYY',
  'Next month': 'Neste måned',
  'Previous month': 'Forrige måned',
  'Choose Date': 'Velg dato',
}

const calendarNbNO = {
  Today: 'I dag',
  Month: 'Måned',
  Week: 'Uke',
  Day: 'Dag',
  List: 'Liste',
  'Select View': 'Velg visning',
  View: 'Visning',
  '+ {{n}} events': '+ {{n}} hendelser',
  '+ 1 event': '+ 1 hendelse',
  'No events': 'Ingen hendelser',
  'Next period': 'Neste periode',
  'Previous period': 'Forrige periode',
  to: 'til', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Heldags- og flerdagshendelser',
  'Link to {{n}} more events on {{date}}':
    'Lenke til {{n}} flere hendelser på {{date}}',
  'Link to 1 more event on {{date}}': 'Lenke til 1 hendelse til på {{date}}',
  CW: 'Uke {{week}}',
}

const timePickerNbNO = {
  Time: 'Tid',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Avbryt',
  OK: 'OK',
  'Select time': 'Velg tid',
}

const nbNO = {
  ...datePickerNbNO,
  ...calendarNbNO,
  ...timePickerNbNO,
}

const datePickerTrTR = {
  Date: 'Tarih',
  'MM/DD/YYYY': 'GG/AA/YYYY',
  'Next month': 'Sonraki ay',
  'Previous month': 'Önceki ay',
  'Choose Date': 'Tarih Seç',
}

const calendarTrTR = {
  Today: 'Bugün',
  Month: 'Aylık',
  Week: 'Haftalık',
  Day: 'Günlük',
  List: 'Liste',
  'Select View': 'Görünüm Seç',
  '+ {{n}} events': '+ {{n}} etkinlikler',
  '+ 1 event': '+ 1 etkinlik',
  'No events': 'Etkinlik yok',
  'Next period': 'Sonraki dönem',
  'Previous period': 'Önceki dönem',
  to: 'dan', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Tüm gün ve çoklu gün etkinlikleri',
  'Link to {{n}} more events on {{date}}':
    '{{date}} tarihinde {{n}} etkinliğe bağlantı',
  'Link to 1 more event on {{date}}': '{{date}} tarihinde 1 etkinliğe bağlantı',
  CW: '{{week}}. Hafta',
  View: 'Görünüm',
}

const timePickerTrTR = {
  Time: 'Zaman',
  AM: 'ÖÖ',
  PM: 'ÖS',
  Cancel: 'İptal',
  OK: 'Tamam',
  'Select time': 'Zamanı seç',
}

const trTR = {
  ...datePickerTrTR,
  ...calendarTrTR,
  ...timePickerTrTR,
}

const datePickerKyKG = {
  Date: 'Датасы',
  'MM/DD/YYYY': 'АА/КК/ЖЖЖЖ',
  'Next month': 'Кийинки ай',
  'Previous month': 'Өткөн ай',
  'Choose Date': 'Күндү тандаңыз',
}

const calendarKyKG = {
  Today: 'Бүгүн',
  Month: 'Ай',
  Week: 'Апта',
  Day: 'Күн',
  List: 'Тизме',
  'Select View': 'Көрүнүштү тандаңыз',
  '+ {{n}} events': '+ {{n}} Окуялар',
  '+ 1 event': '+ 1 Окуя',
  'No events': 'Окуя жок',
  'Next period': 'Кийинки мезгил',
  'Previous period': 'Өткөн мезгил',
  to: 'чейин', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Күн бою жана бир нече күн катары менен болгон окуялар',
  'Link to {{n}} more events on {{date}}':
    '{{date}} күнүндө {{n}} окуяга байланыш',
  'Link to 1 more event on {{date}}': '{{date}} күнүндө 1 окуяга байланыш',
  CW: 'Апта {{week}}',
  View: 'Көрүнүш',
}

const timePickerKyKG = {
  Time: 'Убакты',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Болбой',
  OK: 'Ооба',
  'Select time': 'Убакты тандаңыз',
}

const kyKG = {
  ...datePickerKyKG,
  ...calendarKyKG,
  ...timePickerKyKG,
}

const datePickerIdID = {
  Date: 'Tanggal',
  'MM/DD/YYYY': 'DD.MM.YYYY',
  'Next month': 'Bulan depan',
  'Previous month': 'Bulan sebelumnya',
  'Choose Date': 'Pilih tanggal',
}

const calendarIdID = {
  Today: 'Hari Ini',
  Month: 'Bulan',
  Week: 'Minggu',
  Day: 'Hari',
  List: 'Daftar',
  'Select View': 'Pilih tampilan',
  '+ {{n}} events': '+ {{n}} Acara',
  '+ 1 event': '+ 1 Acara',
  'No events': 'Tidak ada acara',
  'Next period': 'Periode selanjutnya',
  'Previous period': 'Periode sebelumnya',
  to: 'sampai', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Sepanjang hari dan acara beberapa hari ',
  'Link to {{n}} more events on {{date}}':
    'Tautan ke {{n}} acara lainnya pada {{date}}',
  'Link to 1 more event on {{date}}': 'Tautan ke 1 acara lainnya pada {{date}}',
  CW: 'Minggu {{week}}',
  View: 'Tampilan',
}

const timePickerIdID = {
  Time: 'Waktu',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Batalkan',
  OK: 'OK',
  'Select time': 'Pilih waktu',
}

const idID = {
  ...datePickerIdID,
  ...calendarIdID,
  ...timePickerIdID,
}

const datePickerCsCZ = {
  Date: 'Datum',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Další měsíc',
  'Previous month': 'Předchozí měsíc',
  'Choose Date': 'Vyberte datum',
}

const calendarCsCZ = {
  Today: 'Dnes',
  Month: 'Měsíc',
  Week: 'Týden',
  Day: 'Den',
  List: 'Seznam',
  'Select View': 'Vyberte zobrazení',
  '+ {{n}} events': '+ {{n}} události',
  '+ 1 event': '+ 1 událost',
  'No events': 'Žádné události',
  'Next period': 'Příští období',
  'Previous period': 'Předchozí období',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Celodenní a vícedenní události',
  'Link to {{n}} more events on {{date}}':
    'Odkaz na {{n}} dalších událostí dne {{date}}',
  'Link to 1 more event on {{date}}': 'Odkaz na 1 další událost dne {{date}}',
  CW: 'Týden {{week}}',
  View: 'Zobrazení',
}

const timePickerCsCZ = {
  Time: 'Čas',
  AM: 'Dopoledne',
  PM: 'Odpoledne',
  Cancel: 'Zrušit',
  OK: 'OK',
  'Select time': 'Vyberte čas',
}

const csCZ = {
  ...datePickerCsCZ,
  ...calendarCsCZ,
  ...timePickerCsCZ,
}

const datePickerEtEE = {
  Date: 'Kuupäev',
  'MM/DD/YYYY': 'PP.KK.AAAA',
  'Next month': 'Järgmine kuu',
  'Previous month': 'Eelmine kuu',
  'Choose Date': 'Vali kuupäev',
}

const calendarEtEE = {
  Today: 'Täna',
  Month: 'Kuu',
  Week: 'Nädal',
  Day: 'Päev',
  List: 'Nimekiri',
  'Select View': 'Vali vaade',
  '+ {{n}} events': '+ {{n}} sündmused',
  '+ 1 event': '+ 1 sündmus',
  'No events': 'Pole sündmusi',
  'Next period': 'Järgmine periood',
  'Previous period': 'Eelmine periood',
  to: 'kuni',
  'Full day- and multiple day events': 'Täispäeva- ja mitmepäevasündmused',
  'Link to {{n}} more events on {{date}}':
    'Link {{n}} rohkematele sündmustele kuupäeval {{date}}',
  'Link to 1 more event on {{date}}':
    'Link ühele lisasündmusele kuupäeval {{date}}',
  CW: 'Nädala number {{week}}',
  View: 'Vaade',
}

const timePickerEtEE = {
  Time: 'Aeg',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Loobu',
  OK: 'OK',
  'Select time': 'Vali aeg',
}

const etEE = {
  ...datePickerEtEE,
  ...calendarEtEE,
  ...timePickerEtEE,
}

const datePickerUkUA = {
  Date: 'Дата',
  'MM/DD/YYYY': 'ММ/ДД/РРРР',
  'Next month': 'Наступний місяць',
  'Previous month': 'Минулий місяць',
  'Choose Date': 'Виберіть дату',
}

const calendarUkUA = {
  Today: 'Сьогодні',
  Month: 'Місяць',
  Week: 'Тиждень',
  Day: 'День',
  List: 'Список',
  'Select View': 'Виберіть вигляд',
  '+ {{n}} events': '+ {{n}} події',
  '+ 1 event': '+ 1 подія',
  'No events': 'Немає подій',
  'Next period': 'Наступний період',
  'Previous period': 'Минулий період',
  to: 'по', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Події на цілий день і кілька днів поспіль',
  'Link to {{n}} more events on {{date}}':
    'Посилання на {{n}} додаткові події на {{date}}',
  'Link to 1 more event on {{date}}':
    'Посилання на 1 додаткову подію на {{date}}',
  CW: 'Тиждень {{week}}',
  View: 'Вигляд',
}

const timePickerUkUA = {
  Time: 'Час',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Скасувати',
  OK: 'Гаразд',
  'Select time': 'Виберіть час',
}

const ukUA = {
  ...datePickerUkUA,
  ...calendarUkUA,
  ...timePickerUkUA,
}

const datePickerSrLatnRS = {
  Date: 'Datum',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Sledeći mesec',
  'Previous month': 'Prethodni mesec',
  'Choose Date': 'Izaberite datum',
}

const calendarSrLatnRS = {
  Today: 'Danas',
  Month: 'Mesec',
  Week: 'Nedelja',
  Day: 'Dan',
  List: 'Lista',
  'Select View': 'Odaberite pregled',
  '+ {{n}} events': '+ {{n}} Događaji',
  '+ 1 event': '+ 1 Događaj',
  'No events': 'Nema događaja',
  'Next period': 'Naredni period',
  'Previous period': 'Prethodni period',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Celodnevni i višednevni događaji',
  'Link to {{n}} more events on {{date}}':
    'Link do još {{n}} događaja na {{date}}',
  'Link to 1 more event on {{date}}': 'Link do jednog događaja na {{date}}',
  CW: 'Nedelja {{week}}',
  View: 'Pregled',
}

const timePickerSrLatnRS = {
  Time: 'Vrijeme',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Otkaži',
  OK: 'U redu',
  'Select time': 'Odaberi vrijeme',
}

const srLatnRS = {
  ...datePickerSrLatnRS,
  ...calendarSrLatnRS,
  ...timePickerSrLatnRS,
}

const datePickerCaES = {
  Date: 'Data',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Següent mes',
  'Previous month': 'Mes anterior',
  'Choose Date': 'Selecciona una data',
}

const calendarCaES = {
  Today: 'Avui',
  Month: 'Mes',
  Week: 'Setmana',
  Day: 'Dia',
  List: 'Llista',
  'Select View': 'Selecciona una vista',
  '+ {{n}} events': '+ {{n}} Esdeveniments',
  '+ 1 event': '+ 1 Esdeveniment',
  'No events': 'Sense esdeveniments',
  'Next period': 'Següent període',
  'Previous period': 'Període anterior',
  to: 'a', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Esdeveniments de dia complet i de múltiples dies',
  'Link to {{n}} more events on {{date}}':
    'Enllaç a {{n}} esdeveniments més el {{date}}',
  'Link to 1 more event on {{date}}': 'Enllaç a 1 esdeveniment més el {{date}}',
  CW: 'Setmana {{week}}',
  View: 'Vista',
}

const timePickerCaES = {
  Time: 'Hora',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Cancel·lar',
  OK: 'Acceptar',
  'Select time': 'Selecciona una hora',
}

const caES = {
  ...datePickerCaES,
  ...calendarCaES,
  ...timePickerCaES,
}

const datePickerSrRS = {
  Date: 'Датум',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Следећи месец',
  'Previous month': 'Претходни месец',
  'Choose Date': 'Изаберите Датум',
}

const calendarSrRS = {
  Today: 'Данас',
  Month: 'Месец',
  Week: 'Недеља',
  Day: 'Дан',
  List: 'Листа',
  'Select View': 'Изаберите преглед',
  '+ {{n}} events': '+ {{n}} Догађаји',
  '+ 1 event': '+ 1 Догађај',
  'No events': 'Нема догађаја',
  'Next period': 'Следећи период',
  'Previous period': 'Претходни период',
  to: 'да', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Целодневни и вишедневни догађаји',
  'Link to {{n}} more events on {{date}}':
    'Линк до још {{n}} догађаја на {{date}}',
  'Link to 1 more event on {{date}}': 'Линк до још 1 догађаја {{date}}',
  CW: 'Недеља {{week}}',
  View: 'Преглед',
}

const timePickerSrRS = {
  Time: 'Време',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Откажи',
  OK: 'У реду',
  'Select time': 'Изабери време',
}

const srRS = {
  ...datePickerSrRS,
  ...calendarSrRS,
  ...timePickerSrRS,
}

const datePickerLtLT = {
  Date: 'Data',
  'MM/DD/YYYY': 'MMMM-MM-DD',
  'Next month': 'Kitas mėnuo',
  'Previous month': 'Ankstesnis mėnuo',
  'Choose Date': 'Pasirinkite datą',
}

const calendarLtLT = {
  Today: 'Šiandien',
  Month: 'Mėnuo',
  Week: 'Savaitė',
  Day: 'Diena',
  List: 'Sąrašas',
  'Select View': 'Pasirinkite vaizdą',
  '+ {{n}} events': '+ {{n}} įvykiai',
  '+ 1 event': '+ 1 įvykis',
  'No events': 'Įvykių nėra',
  'Next period': 'Kitas laikotarpis',
  'Previous period': 'Ankstesnis laikotarpis',
  to: 'iki', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Visos dienos ir kelių dienų įvykiai',
  'Link to {{n}} more events on {{date}}':
    'Nuoroda į dar {{n}} įvykius {{date}}',
  'Link to 1 more event on {{date}}': 'Nuoroda į dar 1 vieną įvykį {{date}}',
  CW: '{{week}} savaitė',
  View: 'Vaizdas',
}

const timePickerLtLT = {
  Time: 'Laikas',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Atšaukti',
  OK: 'Gerai',
  'Select time': 'Pasirinkite laiką',
}

const ltLT = {
  ...datePickerLtLT,
  ...calendarLtLT,
  ...timePickerLtLT,
}

const datePickerHrHR = {
  Date: 'Datum',
  'MM/DD/YYYY': 'DD/MM/YYYY',
  'Next month': 'Sljedeći mjesec',
  'Previous month': 'Prethodni mjesec',
  'Choose Date': 'Izaberite datum',
}

const calendarHrHR = {
  Today: 'Danas',
  Month: 'Mjesec',
  Week: 'Nedjelja',
  Day: 'Dan',
  List: 'Lista',
  'Select View': 'Odaberite pregled',
  '+ {{n}} events': '+ {{n}} Događaji',
  '+ 1 event': '+ 1 Događaj',
  'No events': 'Nema događaja',
  'Next period': 'Sljedeći period',
  'Previous period': 'Prethodni period',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Cjelodnevni i višednevni događaji',
  'Link to {{n}} more events on {{date}}':
    'Link do još {{n}} događaja na {{date}}',
  'Link to 1 more event on {{date}}': 'Link do još jednog događaja na {{date}}',
  CW: '{{week}}. tjedan',
  View: 'Pregled',
}

const timePickerHrHR = {
  Time: 'Vrijeme',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Otkaži',
  OK: 'U redu',
  'Select time': 'Odaberi vrijeme',
}

const hrHR = {
  ...datePickerHrHR,
  ...calendarHrHR,
  ...timePickerHrHR,
}

const datePickerSlSI = {
  Date: 'Datum',
  'MM/DD/YYYY': 'MM.DD.YYYY',
  'Next month': 'Naslednji mesec',
  'Previous month': 'Prejšnji mesec',
  'Choose Date': 'Izberi datum',
}

const calendarSlSI = {
  Today: 'Danes',
  Month: 'Mesec',
  Week: 'Teden',
  Day: 'Dan',
  List: 'Seznam',
  'Select View': 'Izberi pogled',
  '+ {{n}} events': '+ {{n}} dogodki',
  '+ 1 event': '+ 1 dogodek',
  'No events': 'Ni dogodkov',
  'Next period': 'Naslednji dogodek',
  'Previous period': 'Prejšnji dogodek',
  to: 'do', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Celodnevni in večdnevni dogodki',
  'Link to {{n}} more events on {{date}}':
    'Povezava do {{n}} drugih dogodkov dne {{date}}',
  'Link to 1 more event on {{date}}':
    'Povezava do še enega dogodka dne {{date}}',
  CW: 'Teden {{week}}',
  View: 'Pogled',
}

const timePickerSlSI = {
  Time: 'Čas',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Prekliči',
  OK: 'V redu',
  'Select time': 'Izberite čas',
}

const slSI = {
  ...datePickerSlSI,
  ...calendarSlSI,
  ...timePickerSlSI,
}

const datePickerFiFI = {
  Date: 'Päivämäärä',
  'MM/DD/YYYY': 'VVVV-KK-PP',
  'Next month': 'Seuraava kuukausi',
  'Previous month': 'Edellinen kuukausi',
  'Choose Date': 'Valitse päivämäärä',
}

const calendarFiFI = {
  Today: 'Tänään',
  Month: 'Kuukausi',
  Week: 'Viikko',
  Day: 'Päivä',
  List: 'Lista',
  'Select View': 'Valitse näkymä',
  '+ {{n}} events': '+ {{n}} tapahtumaa',
  '+ 1 event': '+ 1 tapahtuma',
  'No events': 'Ei tapahtumia',
  'Next period': 'Seuraava ajanjakso',
  'Previous period': 'Edellinen ajanjakso',
  to: '-', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'Koko ja usean päivän tapahtumat',
  'Link to {{n}} more events on {{date}}':
    'Linkki {{n}} lisätapahtumaan päivämäärällä {{date}}',
  'Link to 1 more event on {{date}}':
    'Linkki 1 lisätapahtumaan päivämäärällä {{date}}',
  CW: 'Viikko {{week}}',
  View: 'Näkymä',
}

const timePickerFiFI = {
  Time: 'Aika',
  AM: 'ap.',
  PM: 'ip.',
  Cancel: 'Peruuta',
  OK: 'OK',
  'Select time': 'Valitse aika',
}

const fiFI = {
  ...datePickerFiFI,
  ...calendarFiFI,
  ...timePickerFiFI,
}

const datePickerRoRO = {
  Date: 'Data',
  'MM/DD/YYYY': 'LL/ZZ/AAAA',
  'Next month': 'Luna următoare',
  'Previous month': 'Luna anterioară',
  'Choose Date': 'Alege data',
}

const calendarRoRO = {
  Today: 'Astăzi',
  Month: 'Lună',
  Week: 'Săptămână',
  Day: 'Zi',
  List: 'Listă',
  'Select View': 'Selectează vizualizarea',
  '+ {{n}} events': '+ {{n}} evenimente',
  '+ 1 event': '+ 1 eveniment',
  'No events': 'Fără evenimente',
  'Next period': 'Perioada următoare',
  'Previous period': 'Perioada anterioară',
  to: 'până la', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events':
    'Evenimente pe durata întregii zile și pe durata mai multor zile',
  'Link to {{n}} more events on {{date}}':
    'Link către {{n}} evenimente suplimentare pe {{date}}',
  'Link to 1 more event on {{date}}':
    'Link către 1 eveniment suplimentar pe {{date}}',
  CW: 'Săptămâna {{week}}',
  View: 'Vizualizare',
}

const timePickerRoRO = {
  Time: 'Timp',
  AM: 'AM',
  PM: 'PM',
  Cancel: 'Anulează',
  OK: 'OK',
  'Select time': 'Selectați ora',
}

const roRO = {
  ...datePickerRoRO,
  ...calendarRoRO,
  ...timePickerRoRO,
}

const datePickerFaIR = {
  Date: 'تاریخ',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'Next month': 'ماه بعد',
  'Previous month': 'ماه قبل',
  'Choose Date': 'انتخاب تاریخ',
}

const calendarFaIR = {
  Today: 'امروز',
  Month: 'ماه',
  Week: 'هفته',
  Day: 'روز',
  List: 'لیست',
  'Select View': 'انتخاب نما',
  '+ {{n}} events': '+ {{n}} رویدادها',
  '+ 1 event': '+ 1 رویداد',
  'No events': 'رویدادی وجود ندارد',
  'Next period': 'دوره بعدی',
  'Previous period': 'دوره قبلی',
  to: 'تا',
  'Full day- and multiple day events': 'رویدادهای تمام روز و چند روزه',
  'Link to {{n}} more events on {{date}}':
    'لینک به {{n}} رویداد بیشتر در تاریخ {{date}}',
  'Link to 1 more event on {{date}}':
    'لینک به 1 رویداد بیشتر در تاریخ {{date}}',
  CW: 'هفته {{week}}',
  View: 'نمایش',
}

const timePickerFaIR = {
  Time: 'زمان',
  AM: 'ق.ظ',
  PM: 'ب.ظ',
  Cancel: 'لغو',
  OK: 'تایید',
  'Select time': 'انتخاب زمان',
}

const faIR = {
  ...datePickerFaIR,
  ...calendarFaIR,
  ...timePickerFaIR,
}

class InvalidLocaleError extends Error {
  constructor(locale) {
    super(`Invalid locale: ${locale}`)
  }
}

const translate = (locale, languages) => (key, translationVariables) => {
  if (
    !/^[a-z]{2}-[A-Z]{2}$/.test(locale.value) &&
    'sr-Latn-RS' !== locale.value
  ) {
    throw new InvalidLocaleError(locale.value)
  }
  const deHyphenatedLocale = locale.value.replaceAll('-', '')
  const language = languages.value[deHyphenatedLocale]
  if (!language) return key
  let translation = language[key] || key
  Object.keys(translationVariables || {}).forEach((variable) => {
    const value = String(
      translationVariables === null || translationVariables === void 0
        ? void 0
        : translationVariables[variable]
    )
    if (!value) return
    translation = translation.replace(`{{${variable}}}`, value)
  })
  return translation
}

/**
 * A function which can take an endless lists of arguments, all with the type Record<string, Language>
 * and merge them into a single Record<string, Language>,
 * always going over each key and merging the values of each key by means of spread operator
 * */
const mergeLocales = (...locales) => {
  const mergedLocales = {}
  locales.forEach((locale) => {
    Object.keys(locale).forEach((key) => {
      mergedLocales[key] = { ...mergedLocales[key], ...locale[key] }
    })
  })
  return mergedLocales
}

const datePickerHeIL = {
  Date: 'תַאֲרִיך',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'Next month': 'חודש הבא',
  'Previous month': 'חודש קודם',
  'Choose Date': 'בחר תאריך',
}

const calendarHeIL = {
  Today: 'הַיוֹם',
  Month: 'חוֹדֶשׁ',
  Week: 'שָׁבוּעַ',
  Day: 'יוֹם',
  List: 'רשימה',
  'Select View': 'בחר תצוגה',
  '+ {{n}} events': '+ {{n}} אירועים',
  '+ 1 event': '+ 1 אירוע',
  'No events': 'אין אירועים',
  'Next period': 'תקופה הבאה',
  'Previous period': 'תקופה קודמת',
  to: 'עד', // as in 2/1/2020 to 2/2/2020
  'Full day- and multiple day events': 'אירועים לכל היום ולמספר ימים',
  'Link to {{n}} more events on {{date}}':
    'קישור לעוד {{n}} אירועים ב-{{date}}',
  'Link to 1 more event on {{date}}': 'קישור לאירוע נוסף ב-{{date}}',
  CW: '{{week}} שָׁבוּעַ',
  View: 'תצוגה',
}

const timePickerHeIL = {
  Time: 'שעה',
  AM: 'לפנה"צ',
  PM: 'אחה"צ',
  Cancel: 'ביטול',
  OK: 'אישור',
  'Select time': 'בחר שעה',
}

const heIL = {
  ...datePickerHeIL,
  ...calendarHeIL,
  ...timePickerHeIL,
}

const translations = {
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
  daDK,
  mkMK,
  nbNO,
  plPL,
  heIL,
  esES,
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
  srRS,
  ltLT,
  hrHR,
  slSI,
  fiFI,
  roRO,
  faIR,
  arEG,
}
const datePickerTranslations = {
  deDE: datePickerDeDE,
  enUS: datePickerEnUS,
  itIT: datePickerItIT,
  enGB: datePickerEnGB,
  svSE: datePickerSvSE,
  zhCN: datePickerZhCN,
  zhTW: datePickerZhTW,
  jaJP: datePickerJaJP,
  ruRU: datePickerRuRU,
  koKR: datePickerKoKR,
  frFR: datePickerFrFR,
  frCH: datePickerFrCH,
  daDK: datePickerDaDK,
  mkMK: datePickerMkMK,
  nbNO: datePickerNbNO,
  plPL: datePickerPlPL,
  esES: datePickerEsES,
  nlNL: datePickerNlNL,
  ptBR: datePickerPtBR,
  skSK: datePickerSkSK,
  trTR: datePickerTrTR,
  kyKG: datePickerKyKG,
  idID: datePickerIdID,
  csCZ: datePickerCsCZ,
  etEE: datePickerEtEE,
  ukUA: datePickerUkUA,
  caES: datePickerCaES,
  srLatnRS: datePickerSrLatnRS,
  srRS: datePickerSrRS,
  ltLT: datePickerLtLT,
  hrHr: datePickerHrHR,
  slSI: datePickerSlSI,
  fiFI: datePickerFiFI,
  roRO: datePickerRoRO,
  heIL: datePickerHeIL,
  faIR: datePickerFaIR,
  arEG: datePickerArEG,
}

exports.arEG = arEG
exports.caES = caES
exports.csCZ = csCZ
exports.daDK = daDK
exports.datePickerTranslations = datePickerTranslations
exports.deDE = deDE
exports.enGB = enGB
exports.enUS = enUS
exports.esES = esES
exports.etEE = etEE
exports.faIR = faIR
exports.fiFI = fiFI
exports.frCH = frCH
exports.frFR = frFR
exports.heIL = heIL
exports.hrHR = hrHR
exports.idID = idID
exports.itIT = itIT
exports.jaJP = jaJP
exports.koKR = koKR
exports.kyKG = kyKG
exports.ltLT = ltLT
exports.mergeLocales = mergeLocales
exports.mkMK = mkMK
exports.nbNO = nbNO
exports.nlNL = nlNL
exports.plPL = plPL
exports.ptBR = ptBR
exports.roRO = roRO
exports.ruRU = ruRU
exports.skSK = skSK
exports.slSI = slSI
exports.srLatnRS = srLatnRS
exports.svSE = svSE
exports.trTR = trTR
exports.translate = translate
exports.translations = translations
exports.ukUA = ukUA
exports.zhCN = zhCN
exports.zhTW = zhTW
