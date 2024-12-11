import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from "../../services/calendar.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CalendarEvent} from "../../classes/CalendarEvent";
import {GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthService} from "@abacritt/angularx-social-login";
import {ConstantService} from "../../services/constant.service";
import {Subscription} from "rxjs";
import {StyleService} from "../../services/style.service";

declare var gapi: any

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

  to_email: string | undefined;

  returnValues: CalendarEvent = new CalendarEvent();

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: SocialAuthService,
    private constService: ConstantService,
    private styleService: StyleService
  ) {
    this.styleService.loadStyles();
  }

  ngOnInit() {
    this.subs.push(this.constService.setupFinished.subscribe((_res: boolean) => {
      this.getVariables();
    }));
    this.constService.setConstants();
  }

  getVariables() {
    this.subs.push(this.route.queryParams.subscribe(params => {
      const appointment_date = params['appointment_date'];
      const start_time = params['start_time'];
      const end_time = params['end_time'];
      const summary = params['summary'];
      const description = params['description'];
      let location = params['location'];
      if (location == "no_location") {
        location = "";
      }

      this.to_email = params['to_email'];
      const attends = params['attendees'].length > 0 ? params['attendees'].split(',') : [];
      let attendees: [{ email: string }] = [{'email': this.to_email!}];
      for (const email of attends) {
        attendees.push({'email': email});
      }


      const time_zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.returnValues = new CalendarEvent(
        summary ?? 'No summary',
        {dateTime: "", timeZone: ""},
        {dateTime: "", timeZone: ""},
        description,
        location,
        attendees,
      );

      const startTime = new Date(appointment_date!);
      startTime.setHours(parseInt(start_time!.split(':')[0]));
      startTime.setMinutes(parseInt(start_time!.split(':')[1]));
      startTime.setSeconds(0);

      const endTime = new Date(appointment_date!);
      endTime.setHours(parseInt(end_time!.split(':')[0]));
      endTime.setMinutes(parseInt(end_time!.split(':')[1]));
      endTime.setSeconds(0);

      this.returnValues.start = {dateTime: startTime.toISOString(), timeZone: time_zone};
      this.returnValues.end = {dateTime: endTime.toISOString(), timeZone: time_zone};

      this.createGoogleEvent();
    }));
  }


  createGoogleEvent() {
    this.subs.push(this.authService.authState.subscribe(() => {

      gapi.load('client', () => {
        gapi.client.init({
          apiKey: this.constService.API_KEY,
          discoveryDocs: [this.constService.DISCOVERY_DOCS],
        }).then(() => {

          this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(() => {
            this.submitEvent();
          });
        })
      });
    }));
  }

  submitEvent() {
    this.calendarService.createEvent(this.returnValues).then(() => {

      const snackBarRef = this.snackBar.open('Event added to calendar. You will be redirected.', 'Close', {
        duration: 8000,
      });

      this.subs.push(snackBarRef.afterDismissed().subscribe(() => this.router.navigateByUrl(this.constService.REDIRECT_URL)));
    });
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
