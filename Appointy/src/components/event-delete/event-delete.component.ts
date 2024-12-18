import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConstantService} from "../../services/constant.service";
import {Subscription} from "rxjs";
import {StyleService} from "../../services/style.service";

@Component({
  selector: 'Appointy-event-delete',
  standalone: true,
  imports: [],
  templateUrl: './event-delete.component.html',
  styleUrl: './event-delete.component.scss'
})
export class EventDeleteComponent implements OnInit, OnDestroy {

  to_email: string | undefined;
  from_email: string | undefined;
  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;
  summary: string | undefined;
  description: string | undefined;
  location: string | undefined;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router,
    private constService: ConstantService,
    private styleService: StyleService
    ) {
    this.styleService.loadStyles();
  }

  ngOnInit() {
    this.subs.push(this.constService.setupFinished.subscribe((_res:boolean) => this.initEmail()));
    this.constService.setConstants();
  }

  initEmail(){
    this.subs.push(this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];
      this.location = params['location'];

      this.to_email = params['to_email'];
      this.from_email = params['reply_to'];


      const time_zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let returnValues = {
        date: "",
        start: {dateTime: "", timeZone: ""},
        end: {dateTime: "", timeZone: ""},
        summary: this.summary,
        description: this.description,
        location: this.location
      };

      const startTime = new Date(this.appointment_date!);
      startTime.setHours(parseInt(this.start_time!.split(':')[0]));
      startTime.setMinutes(parseInt(this.start_time!.split(':')[1]));
      startTime.setSeconds(0);

      const endTime = new Date(this.appointment_date!);
      endTime.setHours(parseInt(this.end_time!.split(':')[0]));
      endTime.setMinutes(parseInt(this.end_time!.split(':')[1]));
      endTime.setSeconds(0);

      returnValues.start = {dateTime: startTime.toISOString(), timeZone: time_zone};
      returnValues.end = {dateTime: endTime.toISOString(), timeZone: time_zone};


      this.sendEmail(returnValues);
    }));
  }

  sendEmail(returnValues: any){
    this.emailService.sendMail(returnValues, this.to_email, this.from_email, "deleted")
      .then((response: EmailJSResponseStatus | any) => {
        console.log('SUCCESS!', response.status, response.text);
        const snackBarRef = this.snackBar.open('Notification sent. You will be redirected.', 'Close',  {
          duration: 8000,
        });
        this.subs.push(snackBarRef.afterDismissed().subscribe(()=> this.router.navigateByUrl(this.constService.REDIRECT_URL)));
      }, (error) => {
        console.error('FAILED...', error);
      });
  }

  ngOnDestroy(){
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
