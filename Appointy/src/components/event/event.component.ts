import {
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';
import {CalendarEvent} from "../../classes/CalendarEvent";

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {
  @Input() calendarEvent: CalendarEvent = new CalendarEvent();
  @Input() id: string = "";

  startHour: number = 0;
  startMinute: number = 0;
  endHour: number = 0;
  endMinute: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}


  updateVariables() {
    this.startHour = this.calendarEvent.startDate.getHours();
    this.startMinute = this.calendarEvent.startDate.getMinutes();
    this.endHour = this.calendarEvent.endDate.getHours();
    this.endMinute = this.calendarEvent.endDate.getMinutes();

    this.cdr.detectChanges();

    this.updateSize();
  }

  updateSize() {
    const card = document.getElementById(this.id)!;
    const cellHeight: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-cell-height'));
    this.setMarginTop(card, cellHeight);
    this.setHeight(card, cellHeight);
  }

  setMarginTop(card: HTMLElement, cellHeight: number) {
    if (card) {
      const marginTop: number = cellHeight * (this.startMinute / 60);
      card.style.marginTop = `${marginTop}rem`;
    }
  }

  setHeight(card: HTMLElement, cellHeight: number) {
    if (card) {
      const height: number = cellHeight * (this.endHour - this.startHour) + cellHeight * ((this.endMinute - this.startMinute) / 60);
      card.style.height = `${height}rem`;
    }
  }
}
