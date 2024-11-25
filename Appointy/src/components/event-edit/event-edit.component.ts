import {AfterContentInit, Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConstantService} from "../../services/constant.service";
import {Subscription} from "rxjs";
import {StyleService} from "../../services/style.service";
import {disallowedTimeValidator, overlapValidator, startBeforeEndValidator} from "../../validators/validators";
import {CalendarEvent} from "../../classes/CalendarEvent";
import {CalendarService} from "../../services/calendar.service";

@Component({
  selector: 'Appointy-event-edit',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.scss'
})
export class EventEditComponent implements AfterContentInit, OnDestroy {

  to_email: string | undefined;
  from_email: string | undefined;

  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;

  summary: string | undefined;
  description: string | undefined;

  edit_route: string | undefined;
  accept_route: string | undefined;
  delete_route: string | undefined;

  location: string | undefined;
  attendees: string | undefined;

  eventForm: FormGroup;

  events: CalendarEvent[] = [];

  private subs: (Subscription | undefined)[] = [];

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router,
    protected constService: ConstantService,
    private styleService: StyleService,
    private calendarService: CalendarService
  ) {
    this.styleService.loadStyles();
    this.eventForm = new FormGroup({});
  }

  ngAfterContentInit(): void {
    this.subs.push(this.constService.setupFinished.subscribe(()=> {
      this.eventForm.addValidators(disallowedTimeValidator(this.constService.DISALLOWED_DATES));

      this.fetchDailyEvents();
      this.subs.push(this.eventForm.get('date')?.valueChanges.subscribe((newValue: string)=> {
        this.fetchDailyEvents(new Date(newValue));
      }));
    }));
    this.constService.setConstants();
    this.initForm();
  }

  initForm() {
    this.subs.push(this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date']; //itt le kellene kerni
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];
      this.location = params['location'];
      this.attendees = params['attendees'];

      this.to_email = params['to_email']; //ide küldjük vissza
      this.from_email = params['reply_to']; //innen küldjük
      this.edit_route = params['edit_route'];
      this.accept_route = params['accept_route'];
      this.delete_route = params['delete_route'];

      this.eventForm = new FormGroup({
        summary: new FormControl(this.summary, [Validators.required]),
        description: new FormControl(this.description),
        date: new FormControl(this.appointment_date, [Validators.required]),
        start: new FormControl(this.start_time, [Validators.required]),
        end: new FormControl(this.end_time, [Validators.required]),
        location: new FormControl(this.location, [Validators.required]),
      }, {
        validators:
          [
            startBeforeEndValidator()
          ]
      });
    }));
  }

  attachOverlapValidator() {
    this.eventForm.addValidators(overlapValidator(this.constService.ALLOW_OVERLAPS, this.constService.LOCATIONS, this.events));
    this.eventForm.updateValueAndValidity();
  }

  fetchDailyEvents(reqDate: Date = new Date(this.appointment_date!)) {
    this.events = [];
    this.subs.push(this.calendarService.getCalendarEventsThisDay(reqDate)
      .subscribe((res) => {
      for (let i = 1; i < res.length; i++) {
        res[0].items = [...res[0].items, ...res[i].items];
      }
      for (const r of res[0].items) {
        this.events.push(new CalendarEvent(r.summary, r.start, r.end, r.description, r.location));
      }
      this.attachOverlapValidator();
    }));
  }

  saveChanges() {
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let formValue = this.eventForm.value;

    const startTime = new Date(formValue.date);
    startTime.setHours(parseInt(formValue.start.split(':')[0]));
    startTime.setMinutes(parseInt(formValue.start.split(':')[1]));
    startTime.setSeconds(0);

    const endTime = new Date(formValue.date);
    endTime.setHours(parseInt(formValue.end.split(':')[0]));
    endTime.setMinutes(parseInt(formValue.end.split(':')[1]));
    endTime.setSeconds(0);

    formValue.start = {dateTime: startTime.toISOString(), timeZone: timeZone};
    formValue.end = {dateTime: endTime.toISOString(), timeZone: timeZone};
    formValue.attendees = this.attendees;

    this.emailService.sendMail(formValue, this.to_email, this.from_email)
      .then((response: EmailJSResponseStatus | any) => {
        console.log('SUCCESS!', response.status, response.text);
        const snackBarRef = this.snackBar.open('Edit successful. You will be redirected.', 'Close', {
          duration: 8000,
        });
        this.subs.push(snackBarRef.afterDismissed().subscribe(() => this.router.navigateByUrl(this.constService.REDIRECT_URL)));
      }, (error) => {
        console.error('FAILED...', error);
      });
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      if (sub instanceof Subscription)
        sub.unsubscribe();
    }
  }
}
