import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-event-delete',
  standalone: true,
  imports: [],
  templateUrl: './event-delete.component.html',
  styleUrl: './event-delete.component.scss'
})
export class EventDeleteComponent implements OnInit {

  to_email: string | undefined;
  from_email: string | undefined;
  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;
  summary: string | undefined;
  description: string | undefined;

  redirectURL: string = "http://localhost:4200";

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router
    ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];

      this.to_email = params['to_email']; //ide küldjük vissza
      this.from_email = params['reply_to']; //innen küldjük

      this.sendEmail();
    });
  }

  sendEmail(){
    this.emailService.sendMail("deleted", this.to_email, this.from_email)
      .then((response: EmailJSResponseStatus) => {
        console.log('SUCCESS!', response.status, response.text);
        const snackBarRef = this.snackBar.open('Notification sent. You will be redirected.', 'Close',  {
          duration: 8000,
        });
        snackBarRef.afterDismissed().subscribe(()=> this.router.navigateByUrl(this.redirectURL));
      }, (error) => {
        console.error('FAILED...', error);
      });
  }
}
