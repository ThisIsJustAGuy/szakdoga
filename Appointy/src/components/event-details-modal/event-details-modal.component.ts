import {AfterContentInit, Component, Input} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {EventDetails} from "../../classes/EventDetails";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  startMonth: string = '';
  endMonth: string = '';

  constructor(
    private modalService: ModalService,
    private emailService: EmailService,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = new FormGroup({});
  }

  ngAfterContentInit() {
    this.eventForm = new FormGroup({
      summary: new FormControl(''),
      description: new FormControl(''),
      start: new FormControl(this.eventDetails.calendarEvent?.startDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
      end: new FormControl(this.eventDetails.calendarEvent?.endDate?.getHours().toString().padStart(2, '0') + ":00", [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
    });

    this.startMonth = (this.eventDetails.calendarEvent?.startDate?.getMonth()! + 1).toString();
    this.endMonth = (this.eventDetails.calendarEvent?.endDate?.getMonth()! + 1).toString();
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

    // lehessen állítani, hogy be lehessen-e állítani a title-t
    // if (formValue.summary == ''){
    //   formValue.summary = "Reserved";
    // }

    this.emailService.sendMail(formValue).then((response: EmailJSResponseStatus | any) => {
      console.log('SUCCESS!', response.status, response.text);
      this.snackBar.open('Notification sent.', 'Close',  {
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
