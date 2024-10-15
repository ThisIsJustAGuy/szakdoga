import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmailService} from "../../services/email.service";
import {EmailJSResponseStatus} from "emailjs-com";
import {MatSnackBar} from '@angular/material/snack-bar';
import {SuccessSnackbarComponent} from "../../snackbars/success/success-snackbar.component";

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.scss'
})
export class EventEditComponent implements OnInit {

  to_email: string | undefined;
  from_email: string | undefined;
  appointment_date: string | undefined;
  start_time: string | undefined;
  end_time: string | undefined;
  edit_route: string | undefined;
  summary: string | undefined;
  description: string | undefined;

  eventForm: FormGroup;

  redirectURL: string = "http://localhost:4200";

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.eventForm = new FormGroup({});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.appointment_date = params['appointment_date'];
      this.start_time = params['start_time'];
      this.end_time = params['end_time'];
      this.summary = params['summary'];
      this.description = params['description'];

      this.to_email = params['to_email']; //ide küldjük vissza
      this.from_email = params['reply_to']; //innen küldjük
      this.edit_route = params['edit_route'];

      this.eventForm = new FormGroup({
        summary: new FormControl(this.summary),
        description: new FormControl(this.description),
        date: new FormControl(this.appointment_date, [Validators.required]),
        start: new FormControl(this.start_time, [Validators.required]),
        end: new FormControl(this.end_time, [Validators.required]),
      });
    });
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

    this.emailService.sendMail(this.eventForm.value, this.to_email, this.from_email)
      .then((response: EmailJSResponseStatus) => {
        console.log('SUCCESS!', response.status, response.text);
        // const snackBarRef = this.snackBar.openFromComponent(SuccessSnackbarComponent,  {
        //   // duration: 8000,
        //   data: {
        //     title: 'Edit successfully sent',
        //     details: 'You will be redirected',
        //   },
        // });
        const snackBarRef = this.snackBar.open('Edit successful. You will be redirected.', 'Close',  {
          duration: 8000,
        });
        snackBarRef.afterDismissed().subscribe(()=> this.router.navigateByUrl(this.redirectURL));
      }, (error) => {
        console.error('FAILED...', error);
      });
  }
}
