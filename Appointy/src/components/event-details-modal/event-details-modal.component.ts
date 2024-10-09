import {Component, Input} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {CalendarEvent} from "../../classes/CalendarEvent";

@Component({
  selector: 'app-event-details-modal',
  standalone: true,
  imports: [],
  templateUrl: './event-details-modal.component.html',
  styleUrl: './event-details-modal.component.scss'
})
export class EventDetailsModalComponent {

  @Input() eventDetails?: CalendarEvent;

  constructor(
    private modalService: ModalService
  ) {}

  closeModal(){
    this.modalService.closeModal();
  }
}
