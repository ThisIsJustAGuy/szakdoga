import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from "../../services/calendar.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CalendarEvent} from "../../classes/CalendarEvent";
import {GoogleSigninButtonModule, SocialAuthService} from "@abacritt/angularx-social-login";
import {ConstantService} from "../../services/constant.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-create-calendar-event',
  standalone: true,
  imports: [
    GoogleSigninButtonModule
  ],
  templateUrl: './create-calendar-event.component.html',
  styleUrl: './create-calendar-event.component.scss'
})


export class CreateCalendarEventComponent implements OnInit, OnDestroy {

  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;
  summary: string | undefined;
  description: string | undefined;
  location: string | undefined;
  attendees: [{ email: string }] | undefined;
  reminders: {
    useDefault: false,
    overrides: { method: 'email'; minutes: number }[]
  } = {useDefault: false, overrides: []};

  to_email: string | undefined;

  returnValues: CalendarEvent = new CalendarEvent();

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: SocialAuthService,
    private constService: ConstantService
  ) {
  }

  ngOnInit() {
    this.subs.push(this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];
      this.location = params['location'];

      this.to_email = params['to_email'];
      const attends = params['attendees'].length > 0 ? params['attendees'].split(',') : [];
      this.attendees = [{'email': this.to_email!}];
      for (const email of attends) {
        this.attendees.push({'email': email});
      }

      const checkboxes = [
        {day_before: params['day_before'] == "true"},
        {that_day: params['that_day'] == "true"},
        {hour_before: params['hour_before'] == "true"}
      ];
      for (const box of checkboxes) {
        const [key, value] = Object.entries(box)[0];
        if (value) {
          if (key == "day_before")
            this.reminders.overrides.push({method: 'email', minutes: 24 * 60});
          if (key == "that_day"){
            let mins: number = 0;
            const time_parts = this.start_time!.split(":");
            mins = +time_parts[0]*60 + +time_parts[1];
            this.reminders.overrides.push({method: 'email', minutes: mins});
          }
          if (key == "hour_before")
            this.reminders.overrides.push({method: 'email', minutes: 60});
        }
      }


      const time_zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.returnValues = new CalendarEvent(
        this.summary ?? 'No summary',
        {dateTime: "", timeZone: ""},
        {dateTime: "", timeZone: ""},
        this.description,
        this.location,
        this.attendees,
        this.reminders
      );

      const startTime = new Date(this.appointment_date!);
      startTime.setHours(parseInt(this.start_time!.split(':')[0]));
      startTime.setMinutes(parseInt(this.start_time!.split(':')[1]));
      startTime.setSeconds(0);

      const endTime = new Date(this.appointment_date!);
      endTime.setHours(parseInt(this.end_time!.split(':')[0]));
      endTime.setMinutes(parseInt(this.end_time!.split(':')[1]));
      endTime.setSeconds(0);

      this.returnValues.start = {dateTime: startTime.toISOString(), timeZone: time_zone};
      this.returnValues.end = {dateTime: endTime.toISOString(), timeZone: time_zone};
    }));

    this.subs.push(this.authService.authState.subscribe(() => {
      this.subs.push(this.calendarService.loadGapi(this.returnValues).subscribe(() => {
        const snackBarRef = this.snackBar.open('Event added to calendar. You will be redirected.', 'Close', {
          duration: 8000,
        });
        this.subs.push(snackBarRef.afterDismissed().subscribe(() => this.router.navigateByUrl(this.constService.REDIRECT_URL)));
      }));
    }));
  }

  ngOnDestroy(){
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
