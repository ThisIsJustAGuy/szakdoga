import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {EventDetails} from "../classes/EventDetails";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private eventDetailsState = new BehaviorSubject<EventDetails>({showDetails: false});

  eventDetailsState$ = this.eventDetailsState.asObservable();

  openModal(eventDetails: EventDetails) {
    this.eventDetailsState.next({showDetails: true, calendarEvent: eventDetails.calendarEvent, inputsRequired: eventDetails.inputsRequired});
  }

  closeModal() {
    this.eventDetailsState.next({showDetails: false});
  }
}
