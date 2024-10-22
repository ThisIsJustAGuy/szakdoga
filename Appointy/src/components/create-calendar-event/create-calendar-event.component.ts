import {Component, OnInit} from '@angular/core';
import {CalendarService} from "../../services/calendar.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CalendarEvent} from "../../classes/CalendarEvent";
import {GoogleSigninButtonModule, SocialAuthService} from "@abacritt/angularx-social-login";
import {ConstantService} from "../../services/constant.service";

@Component({
  selector: 'app-create-calendar-event',
  standalone: true,
  imports: [
    GoogleSigninButtonModule
  ],
  templateUrl: './create-calendar-event.component.html',
  styleUrl: './create-calendar-event.component.scss'
})


export class CreateCalendarEventComponent implements OnInit {

  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;
  summary: string | undefined;
  description: string | undefined;

  returnValues: CalendarEvent = new CalendarEvent();

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
    this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];

      const time_zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.returnValues = new CalendarEvent(
        this.summary ?? 'No summary',
        {dateTime: "", timeZone: ""},
        {dateTime: "", timeZone: ""},
        this.description,
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
    });

    this.authService.authState.subscribe(() => {
      this.calendarService.loadGapi(this.returnValues).subscribe(() => {
        const snackBarRef = this.snackBar.open('Event added to calendar. You will be redirected.', 'Close',  {
          duration: 8000,
        });
        snackBarRef.afterDismissed().subscribe(()=> this.router.navigateByUrl(this.constService.REDIRECT_URL));
      });
    });
  }
}
