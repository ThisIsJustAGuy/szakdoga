import {Injectable} from '@angular/core';
import emailjs from "emailjs-com";
import {fromZonedTime} from "date-fns-tz";

@Injectable({
  providedIn: 'root'
})

export class EmailService {

  readonly serviceId: string = "service_vsa8qqp";
  readonly firstRequestTemplateId: string = "template_h0h44bn";
  readonly editedRequestTemplateId: string = "";
  readonly deletedRequestTemplateId: string = "";
  readonly acceptedRequestTemplateId: string = "";
  readonly userId: string = "_KlycIcm2HzL4TL3v";
  readonly edit_route: string = "edit-event";
  readonly base_url: string = "http://localhost:4200";

  readonly company_email: string = "bbalint0404@gmail.com";

  sendMail(formValue: any, to_email?: string, from_email?: string) {

      const appDate = fromZonedTime(formValue.start.dateTime, formValue.start.timeZone);
      const appDateEnd = fromZonedTime(formValue.end.dateTime, formValue.end.timeZone);

      const date: string = appDate.getFullYear() + "-" + (appDate.getMonth()+1) + "-" + appDate.getDate();
      const start: string = appDate.getHours() + ":" + appDate.getMinutes().toString().padStart(2, '0');
      const end: string = appDateEnd.getHours() + ":" + appDateEnd.getMinutes().toString().padStart(2, '0');

      const params = new URLSearchParams({
        to_email: from_email ?? formValue.email,
        reply_to: to_email ?? this.company_email,
        appointment_date: date,
        start_time: start,
        end_time: end,
        edit_route: this.edit_route,
        summary: formValue.summary,
        description: formValue.description,
      });

      const edit_route = this.base_url + "/" + this.edit_route + "?" + params.toString();
      // const accept_route = this.base_url + "/" + this.accept_route + "?" + params.toString();
      // const delete_route = this.base_url + "/" + this.delete_route + "?" + params.toString();

    // configban megadni majd, ha saját backendre küldené a contentet, és onnan küldene e-mailt.
    // nyilván dokumentálni kell milyen paramétereket vár a fogadó route
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
      return emailjs.send(this.serviceId, this.firstRequestTemplateId, {
        to_email: to_email ?? this.company_email,
        reply_to: from_email ?? formValue.email,
        appointment_date: date,
        start_time: start,
        end_time: end,
        summary: formValue.summary,
        description: formValue.description,
        edit_route: edit_route, //szerkesztéseket végez rajta a fél, a másik utána értesítőt kap erről
        accept_route: 'accept_route', //bekerül a naptárba, emailt kap az igénylő, hogy bekerült
        delete_route: 'delete_route', //nem kerül be a naptárba, az igénylő emailt kap a másik fél, hogy el lett utasítva
      }, this.userId);
    }

  }
}
