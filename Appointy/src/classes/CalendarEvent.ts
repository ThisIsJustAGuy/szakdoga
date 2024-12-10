export class CalendarEvent {
  public startDate: Date;
  public endDate: Date;

  constructor(
    public summary: string = "sample summary",
    public start: {dateTime: string, timeZone: string} = {dateTime: "2000-01-01T10:00:00+02:00", timeZone: ''},
    public end: {dateTime: string, timeZone: string} = {dateTime: "2000-01-01T12:00:00+02:00", timeZone: ''},
    public description?: string,
    public location?: string,
    public attendees?: [{email: string}],
  ) {
    this.startDate = new Date(start.dateTime);
    this.endDate = new Date(end.dateTime);
  }
}
