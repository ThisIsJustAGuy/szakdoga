import {Injectable} from '@angular/core';
import emailjs, {EmailJSResponseStatus} from "emailjs-com";
import {fromZonedTime} from "date-fns-tz";

@Injectable({
  providedIn: 'root'
})

export class EmailService {

  readonly serviceId: string = "service_vsa8qqp";
  readonly firstRequestTemplateId: string = "template_h0h44bn";
  readonly editedRequestTemplateId: string = "template_h0h44bn";
  readonly userId: string = "_KlycIcm2HzL4TL3v";

  readonly to_email: string = "bbalint0404@gmail.com";

  sendMail(formValue: any) {
    // configban megadni majd, ha saját backendre küldené a contentet, és onnan küldene e-mailt.
    // ha nincs megadva configban email backend url akkor menjünk az emailJS-re
    if (false) {
      // this.http.post('http://your-backend-url/send-email', emailData).subscribe(
      //   response => {
      //     console.log('Email sent successfully');
      //   },
      //   error => {
      //     console.error('Error sending email:', error);
      //   }
      // );
    } else {
      const appDate = fromZonedTime(formValue.start.dateTime, formValue.start.timeZone);
      const appDateEnd = fromZonedTime(formValue.end.dateTime, formValue.end.timeZone);

      const date: string = appDate.getFullYear() + "." + appDate.getMonth() + "." + appDate.getDate() + ".";
      const start: string = appDate.getHours() + ":" + appDate.getMinutes().toString().padStart(2, '0');
      const end: string = appDateEnd.getHours() + ":" + appDateEnd.getMinutes().toString().padStart(2, '0');

      emailjs.send(this.serviceId, this.firstRequestTemplateId, {
        to_email: this.to_email,
        reply_to: formValue.email,
        appointment_date: date,
        start_time: start,
        end_time: end,
      }, this.userId).then((response: EmailJSResponseStatus) => {
        console.log('SUCCESS!', response.status, response.text);
      }, (error) => {
        console.error('FAILED...', error);
      });
    }

  }
}
