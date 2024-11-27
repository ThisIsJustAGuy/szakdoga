import {Injectable} from '@angular/core';
import emailjs from "emailjs-com";
import {fromZonedTime} from "date-fns-tz";
import {ConstantService} from "./constant.service";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class EmailService {

  constructor(
    private constService: ConstantService,
    private http: HttpClient
  ) {
    this.initEmailjs();
  }

  initEmailjs() {
    if (this.constService.EMAIL_BACKEND_URL == "") {
      emailjs.init(this.constService.EMAILJS_PUBLIC_KEY);
    }
  }

  sendMail(formValue: any, to_email?: string, from_email?: string, finishState: string = "inProgress") {
    const appDate = fromZonedTime(formValue.start?.dateTime, formValue.start?.timeZone);
    const appDateEnd = fromZonedTime(formValue.end?.dateTime, formValue.end?.timeZone);

    const date: string = appDate.getFullYear() + "-" + (appDate.getMonth() + 1).toString().padStart(2, '0') + "-" + appDate.getDate().toString().padStart(2, '0');
    const start: string = appDate.getHours().toString().padStart(2, '0') + ":" + appDate.getMinutes().toString().padStart(2, '0');
    const end: string = appDateEnd.getHours().toString().padStart(2, '0') + ":" + appDateEnd.getMinutes().toString().padStart(2, '0');

    const params = new URLSearchParams({
      to_email: from_email ?? formValue.email,
      reply_to: to_email ?? this.constService.COMPANY_EMAIL,
      appointment_date: date,
      start_time: start,
      end_time: end,
      edit_route: this.constService.EDIT_ROUTE,
      summary: formValue.summary,
      description: formValue.description,
      location: formValue.location,
      attendees: formValue.attendees,
    });

    const edit_route = this.constService.BASE_URL + "/" + this.constService.EDIT_ROUTE + "?" + params.toString();
    const accept_route = this.constService.BASE_URL + "/" + this.constService.ACCEPT_ROUTE + "?" + params.toString();
    const delete_route = this.constService.BASE_URL + "/" + this.constService.DELETE_ROUTE + "?" + params.toString();
    const create_event_route = this.constService.BASE_URL + "/" + this.constService.CREATE_EVENT_ROUTE + "?" + params.toString();

    const new_request_data = {
      mail_subject: `New appointment request from ${from_email ?? formValue.email}`,
      mail_title: "New Appointment Request",
      mail_text: `A potential customer (${from_email ?? formValue.email}) wants to book a new appointment.`,
      mail_details: "Appointment details:"
    }
    const edited_request_data = {
      mail_subject: `Appointment edited by ${from_email ?? formValue.email}`,
      mail_title: "Appointment Request Edited",
      mail_text: "Your potential appointment had some details edited.",
      mail_details: "New details:"
    }
    const deleted_request_data = {
      mail_subject: `Appointment deleted by ${from_email}`,
      mail_title: "Appointment Request Deleted",
      mail_text: "This appointment has been deleted by the other party.",
      mail_details: "Details of deleted appointment:"
    }
    const accepted_request_data = {
      mail_subject: `Appointment accepted by ${from_email}`,
      mail_title: "Appointment Request Accepted",
      mail_text: "This appointment has been accepted by the other party.",
      mail_details: "Details of accepted appointment:"
    }

    let request_data: any = {
      to_email: to_email ?? this.constService.COMPANY_EMAIL,
      reply_to: from_email ?? formValue.email,
      appointment_date: date,
      start_time: start,
      end_time: end,
      summary: formValue.summary,
      description: formValue.description,
      location: formValue.location,
      attendees: formValue.attendees
    };
    let template_id;

    if (finishState == "deleted") {

      //törölve lett

      request_data.mail_subject = deleted_request_data.mail_subject;
      request_data.mail_title = deleted_request_data.mail_title;
      request_data.mail_text = deleted_request_data.mail_text;
      request_data.mail_details = deleted_request_data.mail_details;
      request_data.view_link = this.constService.BASE_URL;

      template_id = this.constService.FINISHED_TEMPLATE_ID;

    } else if (finishState == "accepted") {

      //el lett fogadva

      //ha a from_email nem a company akkor az editesre kell vinni, a cég is fogadja el
      if (from_email != this.constService.COMPANY_EMAIL) {

        request_data.mail_subject = accepted_request_data.mail_subject;
        request_data.mail_title = accepted_request_data.mail_title;
        request_data.mail_text = accepted_request_data.mail_text;
        request_data.mail_details = accepted_request_data.mail_details;
        request_data.edit_route = edit_route;
        request_data.accept_route = create_event_route; // ez különbözik, felveszi az eventet
        request_data.delete_route = delete_route;

        template_id = this.constService.IN_PROGRESS_TEMPLATE_ID;

      } else {

        request_data.mail_subject = accepted_request_data.mail_subject;
        request_data.mail_title = accepted_request_data.mail_title;
        request_data.mail_text = accepted_request_data.mail_text;
        request_data.mail_details = accepted_request_data.mail_details;
        request_data.view_link = this.constService.BASE_URL;

        template_id = this.constService.FINISHED_TEMPLATE_ID;

      }

    } else {

      //vagy új request, vagy szerkesztett

      request_data.mail_subject = (to_email ? edited_request_data.mail_subject : new_request_data.mail_subject);
      request_data.mail_title = (to_email ? edited_request_data.mail_title : new_request_data.mail_title);
      request_data.mail_text = (to_email ? edited_request_data.mail_text : new_request_data.mail_text);
      request_data.mail_details = (to_email ? edited_request_data.mail_details : new_request_data.mail_details);
      request_data.edit_route = edit_route; // szerkesztéseket végez rajta a fél, a másik utána értesítőt kap erről, ő is szerkeszthet
      request_data.accept_route = (!to_email || to_email == this.constService.COMPANY_EMAIL) ? create_event_route : accept_route; // bekerül a naptárba, emailt kap az igénylő, hogy bekerült
      request_data.delete_route = delete_route; // nem kerül be a naptárba, emailt kap a másik fél, hogy el lett utasítva

      template_id = this.constService.IN_PROGRESS_TEMPLATE_ID;

    }

    // configban megadni, ha saját backendre küldené a contentet, és onnan küldene e-mailt.
    // ha nincs megadva configban email backend url akkor menjünk az emailJS-re
    if (this.constService.EMAIL_BACKEND_URL && this.constService.EMAIL_BACKEND_URL != "") {
      return lastValueFrom(this.http.post(this.constService.EMAIL_BACKEND_URL, request_data));
    } else {
      return emailjs.send(this.constService.SERVICE_ID, template_id, request_data, this.constService.EMAILJS_PUBLIC_KEY);
    }
  }
}
