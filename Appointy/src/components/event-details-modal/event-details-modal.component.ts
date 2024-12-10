import {AfterContentInit, Component, Input} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {EventDetails} from "../../classes/EventDetails";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConstantService} from "../../services/constant.service";
import {CalendarEvent} from "../../classes/CalendarEvent";
import {disallowedTimeValidator, overlapValidator, startBeforeEndValidator} from "../../validators/validators";

@Component({
  selector: 'Appointy-event-details-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-details-modal.component.html',
  styleUrl: './event-details-modal.component.scss'
})
export class EventDetailsModalComponent implements AfterContentInit {

  @Input() eventDetails!: EventDetails;
  @Input() events!: CalendarEvent[];

  protected eventForm: FormGroup;
  startMonth: string = '';
  endMonth: string = '';

  max_attendees: number = 0;

  constructor(
    private modalService: ModalService,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    protected constService: ConstantService
  ) {
    this.eventForm = new FormGroup({});
  }

  ngAfterContentInit() {
    this.initForm();
  }

  initForm() {

    this.eventForm = new FormGroup({
      summary: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      start: new FormControl(this.eventDetails.calendarEvent?.startDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
      end: new FormControl(this.eventDetails.calendarEvent?.endDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
      location: new FormControl('no_location', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      attendees: new FormControl(''),
    }, { validators:
        [
          startBeforeEndValidator(),
          disallowedTimeValidator(this.constService.DISALLOWED_DATES, this.eventDetails.calendarEvent!.startDate!, this.eventDetails.calendarEvent!.endDate!),
          overlapValidator(this.constService.ALLOW_OVERLAPS, this.constService.LOCATIONS, this.events, this.eventDetails.calendarEvent!.startDate!, this.eventDetails.calendarEvent!.endDate!)
        ]
    });

    this.startMonth = (this.eventDetails.calendarEvent?.startDate?.getMonth()! + 1).toString();
    this.endMonth = (this.eventDetails.calendarEvent?.endDate?.getMonth()! + 1).toString();

    this.updateMaxAttendees(0);

  }

  locationChanged(event: Event) {
    const selectedIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.updateMaxAttendees(selectedIndex);
  }

  updateMaxAttendees(selectedIndex: number) {
    if (Array.isArray(this.constService.MAX_ATTENDEES))
      this.max_attendees = this.constService.MAX_ATTENDEES[selectedIndex == 0 ? 0 : selectedIndex - 1];
    else
      this.max_attendees = this.constService.MAX_ATTENDEES;
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
      endTime.setMinutes(parseInt(formValue.end.split(':')[1]));
      endTime.setSeconds(0);

      formValue.start = {dateTime: startTime.toISOString(), timeZone: timeZone};
      formValue.end = {dateTime: endTime.toISOString(), timeZone: timeZone};
    }

    //-1, mert bele lesz rakva az event kérelmezője is
    formValue.attendees = formValue.attendees.split(',').slice(0, this.max_attendees - 1);

    this.emailService.sendMail(formValue).then((response: EmailJSResponseStatus | any) => {
      console.log('SUCCESS!', response.status, response.text);
      this.snackBar.open('Notification sent.', 'Close', {
        duration: 8000,
      });
      this.closeModal();
    }, (error) => {
      console.error('FAILED...', error);
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
