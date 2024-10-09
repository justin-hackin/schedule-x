type Recurrence = {
    start: string;
    end: string;
};
type RecurrenceSetOptions = {
    dtstart: string;
    dtend?: string;
    rrule: string;
};
declare class RecurrenceSet {
    private dtstart;
    private dtend;
    private rrule;
    constructor(options: RecurrenceSetOptions);
    getRecurrences(): Recurrence[];
    updateDtstart(newDtstart: string): void;
    getRrule(): string;
    getDtstart(): string;
    getDtend(): string;
}
export { RecurrenceSet };
