import {AfterContentInit, Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConstantService} from "../../services/constant.service";
import {Subscription} from "rxjs";
import {isSameDay} from "date-fns";
import {StyleService} from "../../services/style.service";

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

  day_before: boolean = false;
  that_day: boolean = false;
  hour_before: boolean = false;

  eventForm: FormGroup;

  private subs: (Subscription | undefined)[] = [];

  controlsUpdating: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router,
    protected constService: ConstantService,
    private styleService: StyleService
  ) {
    this.styleService.loadStyles();
    this.eventForm = new FormGroup({});
  }

  ngAfterContentInit(): void {
    this.subs.push(this.constService.setupFinished.subscribe());
    this.constService.setConstants();
    this.initForm();
  }

  initForm() {
    this.subs.push(this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];
      this.location = params['location'];
      this.attendees = params['attendees'];
      this.day_before = params['day_before'] == "true";
      this.that_day = params['that_day'] == "true";
      this.hour_before = params['hour_before'] == "true";

      this.to_email = params['to_email']; //ide küldjük vissza
      this.from_email = params['reply_to']; //innen küldjük
      this.edit_route = params['edit_route'];
      this.accept_route = params['accept_route'];
      this.delete_route = params['delete_route'];


      this.eventForm = new FormGroup({
        summary: new FormControl(this.summary),
        description: new FormControl(this.description),
        date: new FormControl(this.appointment_date, [Validators.required]),
        start: new FormControl(this.start_time, [Validators.required]),
        end: new FormControl(this.end_time, [Validators.required]),
        location: new FormControl(this.location),
      });
    }));

    this.subscribeToTimeChanges();
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

  checkForTimeClashes(newValue?: string, isStart?: boolean) {
    //egész naposra nem kell checkelni, ott alapból nem kattinthat
    let start: Date = new Date(this.appointment_date!);
    const start_time = isStart ? newValue!.split(':') : this.eventForm.value.start.split(':');
    start.setHours(start_time[0]);
    start.setMinutes(start_time[1]);

    let end: Date = new Date(this.appointment_date!);
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
    formValue.day_before = this.day_before;
    formValue.that_day = this.that_day;
    formValue.hour_before = this.hour_before;

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
