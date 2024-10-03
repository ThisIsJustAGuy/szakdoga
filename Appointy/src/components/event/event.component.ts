import {AfterContentChecked, Component, Input} from '@angular/core';
import {CalendarEvent} from "../../classes/CalendarEvent";

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements AfterContentChecked {
  @Input() calendarEvent: CalendarEvent = new CalendarEvent();

  startHour: string = "";
  startMinute: string = "";
  endHour: string = "";
  endMinute:string = "";

  ngAfterContentChecked(){
    this.startHour = this.calendarEvent.startDate.getHours().toString();
    this.startMinute = this.calendarEvent.startDate.getMinutes().toString().padStart(2, '0');
    this.endHour = this.calendarEvent.endDate.getHours().toString();
    this.endMinute = this.calendarEvent.endDate.getMinutes().toString().padStart(2, '0');
  }
}
