import {AfterContentInit, Component, Input, OnDestroy} from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {EventDetails} from "../../classes/EventDetails";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConstantService} from "../../services/constant.service";
import {isSameDay} from "date-fns";
import {Subscription} from "rxjs";

@Component({
  selector: 'Appointy-event-details-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-details-modal.component.html',
  styleUrl: './event-details-modal.component.scss'
})
export class EventDetailsModalComponent implements AfterContentInit, OnDestroy {

  @Input() eventDetails!: EventDetails;

  eventForm: FormGroup;
  startMonth: string = '';
  endMonth: string = '';

  max_attendees: number = 0;

  private subs: (Subscription | undefined)[] = [];
  controlsUpdating: boolean = false;

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
      location: new FormControl('No location'),
      email: new FormControl('', [Validators.required, Validators.email]),
      attendees: new FormControl(''),
      day_before: new FormControl(false),
      that_day: new FormControl(false),
      hour_before: new FormControl(false),
    });
    this.checkForTimeClashes();

    this.startMonth = (this.eventDetails.calendarEvent?.startDate?.getMonth()! + 1).toString();
    this.endMonth = (this.eventDetails.calendarEvent?.endDate?.getMonth()! + 1).toString();

    this.updateMaxAttendees(0);

    this.subscribeToTimeChanges();
  }

  checkForTimeClashes(newValue?: string, isStart?: boolean) {
    //egész naposra nem kell checkelni, ott alapból nem kattinthat
    let start: Date = new Date(this.eventDetails.calendarEvent!.startDate!);
    const start_time = isStart ? newValue!.split(':') : this.eventForm.value.start.split(':');
    start.setHours(start_time[0]);
    start.setMinutes(start_time[1]);

    let end: Date = new Date(this.eventDetails.calendarEvent!.endDate!);
    const end_time = isStart === false ? newValue!.split(':') : this.eventForm.value.end.split(':');
    end.setHours(end_time[0]);
    end.setMinutes(end_time[1]);

    for (const d_date of this.constService.DISALLOWED_DATES) {
      if (Array.isArray(d_date)) {

        const d_start: Date = new Date(d_date[0]);
        const d_end: Date = new Date(d_date[1]);

        if (start < d_end && start > d_start) { //start a disallowed-on belül
          if (isSameDay(start, d_end)) {
            start = new Date(d_end);
            if (start > end) {
              end = new Date(start);
            }
          } else { //ha nem az end napján van, akkor fixen a startén
            start = new Date(d_start);
            if (start > end) {
              end = new Date(start);
            }
          }
        }
        if (end < d_end && end > d_start) { //end a disallowed-on belül
          end = new Date(start);
        }
        if (start < d_start && end > d_end) { // start és end közrefogja a disallowed intervallumot
          end = new Date(d_start);
        }

      }
    }

    this.controlsUpdating = true;

    const start_time_text = start.getHours().toString().padStart(2, '0') + ':' + start.getMinutes().toString().padStart(2, '0');
    this.eventForm.patchValue({start: start_time_text});
    const end_time_text = end.getHours().toString().padStart(2, '0') + ':' + end.getMinutes().toString().padStart(2, '0');
    this.eventForm.patchValue({end: end_time_text});

    this.controlsUpdating = false;

  }

  subscribeToTimeChanges() {
    this.subs.push(this.eventForm.get('start')?.valueChanges.subscribe((newValue: string) => {
      if (!this.controlsUpdating)
        this.checkForTimeClashes(newValue, true);
    }));
    this.subs.push(this.eventForm.get('end')?.valueChanges.subscribe((newValue: string) => {
      if (!this.controlsUpdating)
        this.checkForTimeClashes(newValue, false);
    }));
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

  ngOnDestroy() {
    for (const sub of this.subs) {
      if (sub instanceof Subscription) {
        sub.unsubscribe();
      }
    }
  }
}
