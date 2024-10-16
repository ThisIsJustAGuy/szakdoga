import {Injectable} from '@angular/core';
import emailjs from "emailjs-com";
import {fromZonedTime} from "date-fns-tz";

@Injectable({
  providedIn: 'root'
})

export class EmailService {

  readonly serviceId: string = "service_vsa8qqp";
  readonly inProgressTemplateId: string = "template_h0h44bn"; //új és edited
  readonly finishedTemplateId: string = "template_99ge21g"; //deleted és accepted
  readonly userId: string = "_KlycIcm2HzL4TL3v";

  readonly base_url: string = "http://localhost:4200";
  readonly edit_route: string = "edit-event";
  readonly accept_route: string = "accept-event";
  readonly delete_route: string = "delete-event";

  readonly company_email: string = "bbalint0404@gmail.com";

  sendMail(formValue: any, to_email?: string, from_email?: string) {

    const appDate = fromZonedTime(formValue.start.dateTime, formValue.start.timeZone);
    const appDateEnd = fromZonedTime(formValue.end.dateTime, formValue.end.timeZone);

    const date: string = appDate.getFullYear() + "-" + (appDate.getMonth() + 1) + "-" + appDate.getDate();
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
    const accept_route = this.base_url + "/" + this.accept_route + "?" + params.toString();
    const delete_route = this.base_url + "/" + this.delete_route + "?" + params.toString();

    const new_request_data = {
      mail_subject: `New appointment request from ${from_email ?? formValue.email}`,
      mail_title: "New Appointment Request",
      mail_text: `A potential customer ${from_email ?? formValue.email}) wants to book a new appointment.`,
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

      if (formValue == "deleted") {

        //törölve lett

        return emailjs.send(this.serviceId, this.finishedTemplateId, {
          to_email: to_email ?? this.company_email,
          reply_to: from_email ?? formValue.email,
          appointment_date: date,
          start_time: start,
          end_time: end,
          summary: formValue.summary,
          description: formValue.description,
          mail_subject: deleted_request_data.mail_subject,
          mail_title: deleted_request_data.mail_title,
          mail_text: deleted_request_data.mail_text,
          mail_details: deleted_request_data.mail_details,
          view_link: this.base_url
        }, this.userId);

      } else if (formValue == "accepted") {

        //el lett fogadva

        //ha a from_email nem a company akkor az editesre kell vinni, a cég is fogadja el
        if (from_email != this.company_email) {

          return emailjs.send(this.serviceId, this.inProgressTemplateId, {
            to_email: to_email ?? this.company_email,
            reply_to: from_email ?? formValue.email,
            appointment_date: date,
            start_time: start,
            end_time: end,
            summary: formValue.summary,
            description: formValue.description,
            mail_subject: accepted_request_data.mail_subject,
            mail_title: accepted_request_data.mail_title,
            mail_text: accepted_request_data.mail_text,
            mail_details: accepted_request_data.mail_details,
            edit_route: edit_route,
            accept_route: accept_route,
            delete_route: delete_route,
          }, this.userId);

        } else {

          return emailjs.send(this.serviceId, this.finishedTemplateId, {
            to_email: to_email ?? this.company_email,
            reply_to: from_email ?? formValue.email,
            appointment_date: date,
            start_time: start,
            end_time: end,
            summary: formValue.summary,
            description: formValue.description,
            mail_subject: accepted_request_data.mail_subject,
            mail_title: accepted_request_data.mail_title,
            mail_text: accepted_request_data.mail_text,
            mail_details: accepted_request_data.mail_details,
            view_link: this.base_url
          }, this.userId);

        }

      } else {

        //vagy új request, vagy szerkesztett

        return emailjs.send(this.serviceId, this.inProgressTemplateId, {
          to_email: to_email ?? this.company_email,
          reply_to: from_email ?? formValue.email,
          appointment_date: date,
          start_time: start,
          end_time: end,
          summary: formValue.summary,
          description: formValue.description,
          mail_subject: (to_email ? edited_request_data.mail_subject : new_request_data.mail_subject),
          mail_title: (to_email ? edited_request_data.mail_title : new_request_data.mail_title),
          mail_text: (to_email ? edited_request_data.mail_text : new_request_data.mail_text),
          mail_details: (to_email ? edited_request_data.mail_details : new_request_data.mail_details),
          edit_route: edit_route, //szerkesztéseket végez rajta a fél, a másik utána értesítőt kap erről
          accept_route: accept_route, //bekerül a naptárba, emailt kap az igénylő, hogy bekerült
          delete_route: delete_route, //nem kerül be a naptárba, az igénylő emailt kap a másik fél, hogy el lett utasítva
        }, this.userId);
      }
    }
  }
}
