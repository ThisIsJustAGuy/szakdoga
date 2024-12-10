import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {CalendarEvent} from "../../classes/CalendarEvent";

@Component({
  selector: 'Appointy-calendar-column',
  standalone: true,
  imports: [],
  templateUrl: './calendar-column.component.html',
  styleUrl: './calendar-column.component.scss'
})
export class CalendarColumnComponent implements OnChanges{
  @Input() date: Date = new Date();
  @Input() events: CalendarEvent[] = [];
  @Output() loaded: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(private modalService: ModalService) {
  }

  ngOnChanges(changes:SimpleChanges) {
    if (changes['date']) // alapból 2x fut a 2 input miatt
      this.loaded.emit(true);
  }

  getID(hour: number): string {
    return 'i' + this.date.getFullYear() + "." + this.date.getMonth() + "." + this.date.getDate() + "." + hour;
  }

  openNewEventModal(hour: number) {
    this.date.setHours(hour);
    const endDate = new Date(this.date);
    endDate.setHours(hour + 1);

    const time_zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let calEvent = new CalendarEvent("", {
      dateTime: this.date.toISOString(),
      timeZone: time_zone
    }, {dateTime: endDate.toISOString(), timeZone: time_zone})
    this.modalService.openModal({inputsRequired: true, calendarEvent: calEvent});
  }
}
