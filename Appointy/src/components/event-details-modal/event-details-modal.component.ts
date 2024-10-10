import {AfterContentInit, Component, Input} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {CalendarService} from "../../services/calendar.service";
import {EventDetails} from "../../classes/EventDetails";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-event-details-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-details-modal.component.html',
  styleUrl: './event-details-modal.component.scss'
})
export class EventDetailsModalComponent implements AfterContentInit {

  @Input() eventDetails!: EventDetails;

  eventForm: FormGroup;

  constructor(
    private modalService: ModalService,
    private calendarService: CalendarService
  ) {
    this.eventForm = new FormGroup({});
  }

  ngAfterContentInit() {
    this.eventForm = new FormGroup({
      summary: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      start: new FormControl(this.eventDetails.calendarEvent?.startDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
      end: new FormControl(this.eventDetails.calendarEvent?.endDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
    });
  }

  saveChanges() {
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let formValue = this.eventForm.value;

    if (this.eventDetails.calendarEvent) {
      const startTime = new Date(this.eventDetails.calendarEvent.start.dateTime);
      startTime.setHours(parseInt(formValue.start.split(':')[0]));
      startTime.setMinutes(parseInt(formValue.start.split(':')[1]));
      startTime.setSeconds(0);

      const endTime = new Date(this.eventDetails.calendarEvent.end.dateTime);
      endTime.setHours(parseInt(formValue.end.split(':')[0]));
      endTime.setSeconds(0);
      endTime.setMinutes(parseInt(formValue.end.split(':')[1]));

      formValue.start = {dateTime: startTime.toISOString(), timeZone: timeZone};
      formValue.end = {dateTime: endTime.toISOString(), timeZone: timeZone};
    }

    this.calendarService.createCalendarEvent(formValue)      .subscribe({
      next: (response) => {
        console.log('Event created: ', response);
      },
      error: (error) => {
        console.error('Error creating event: ', error);
      }
    });
    this.closeModal();
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
