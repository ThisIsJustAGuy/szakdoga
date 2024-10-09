import {CalendarEvent} from "./CalendarEvent";

export class EventDetail {
  constructor(
    public showDetails: boolean,
    public calendarEvent?: CalendarEvent
  ) {}

}
