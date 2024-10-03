export class CalendarEvent {
  public startDate: Date;
  public endDate: Date;

  constructor(
    public summary: string = "sample summary",
    public start: {dateTime: string} = {dateTime: "2000-01-01T10:00:00+02:00"},
    public end: {dateTime: string} = {dateTime: "2000-01-01T12:00:00+02:00"},
    public description?: string,
    public id?: number,
  ) {
    this.startDate = new Date(start.dateTime);
    this.endDate = new Date(end.dateTime);
    // - (this.startDate.getTimezoneOffset() / 60)
  }

}
