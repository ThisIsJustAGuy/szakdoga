import {
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';
import {CalendarEvent} from "../../classes/CalendarEvent";
import {ModalService} from "../../services/modal.service";
import {SlicePipe} from "@angular/common";

@Component({
  selector: 'Appointy-event',
  standalone: true,
  imports: [
    SlicePipe
  ],
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

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: ModalService
  ) {}


  updateVariables() {
    this.startHour = this.calendarEvent.startDate.getHours();
    this.startMinute = this.calendarEvent.startDate.getMinutes();
    this.endHour = this.calendarEvent.endDate.getHours();
    this.endMinute = this.calendarEvent.endDate.getMinutes();

    this.cdr.detectChanges();

    this.updatePosition();
  }

  updatePosition() {
    const card = document.getElementById(this.id)!;
    const parent = card.parentElement!;
    const cellHeight: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-cell-height'));
    this.setMarginTop(parent, cellHeight);
    this.setHeight(card, cellHeight);
    this.setColor(card);
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

  setColor(card: HTMLElement) {
    const now: Date = new Date();

    if (this.calendarEvent.endDate < now) {
      card.classList.add("past_event");
    } else {
      card.classList.add("future_event");
    }
  }

  openEventDetails(){
    this.modalService.openModal({calendarEvent: this.calendarEvent});
  }
}
