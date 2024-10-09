import {Component, Input} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {CalendarEvent} from "../../classes/CalendarEvent";

@Component({
  selector: 'app-calendar-column',
  standalone: true,
  imports: [],
  templateUrl: './calendar-column.component.html',
  styleUrl: './calendar-column.component.scss'
})
export class CalendarColumnComponent {
  // @Input() date: number = 0;
  @Input() date: Date = new Date();

  constructor(private modalService: ModalService) {
  }

  getID(hour: number): string {
    return this.date.getDate() + "." + hour;
  }

  openNewEventModal(hour: number) {
    this.date.setHours(hour);
    const endDate = new Date(this.date);
    endDate.setHours(hour + 1);

    let calEvent = new CalendarEvent("", {dateTime: this.date.toISOString()}, {dateTime: endDate.toISOString()})
    this.modalService.openModal({inputsRequired: true, calendarEvent: calEvent})
  }
}
