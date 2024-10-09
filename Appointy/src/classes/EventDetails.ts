import {CalendarEvent} from "./CalendarEvent";

export class EventDetails {
  constructor(
    public showDetails?: boolean,
    public calendarEvent?: CalendarEvent,
    public inputsRequired?: boolean,
  ) {}

}
