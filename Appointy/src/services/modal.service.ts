import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CalendarEvent} from "../classes/CalendarEvent";
import {EventDetail} from "../classes/EventDetail";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private eventDetailsState = new BehaviorSubject<EventDetail>({showDetails: false});

  eventDetailsState$ = this.eventDetailsState.asObservable(); // Expose as observable

  openModal(calendarEvent: CalendarEvent) {
    this.eventDetailsState.next({showDetails: true, calendarEvent});
  }

  closeModal() {
    this.eventDetailsState.next({showDetails: false});
  }
}
