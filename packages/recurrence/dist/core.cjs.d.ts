type Recurrence = {
    start: string;
    end: string;
};
type RecurrenceSetOptions = {
    dtstart: string;
    dtend?: string;
    rrule: string;
    exdate?: string[] | undefined;
};
declare class RecurrenceSet {
    private dtstart;
    dtend: string;
    private rrule;
    private exdate?;
    constructor(options: RecurrenceSetOptions);
    getRecurrences(): Recurrence[];
    updateDtstartAndDtend(newDtstart: string, newDtend: string): void;
    private mapExdate;
    private filterExdate;
    getRrule(): string;
    getDtstart(): string;
    getDtend(): string;
    getExdate(): Map<string, boolean> | undefined;
}
export { RecurrenceSet };
