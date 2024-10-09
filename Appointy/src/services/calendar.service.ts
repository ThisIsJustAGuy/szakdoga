import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CalendarEvent} from "../classes/CalendarEvent";

declare var gapi: any;
declare var google: any

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  API_KEY = 'AIzaSyBGYpsRXbu27SlAYE93OLs4BXz4ADI3FXc';
  CLIENT_ID = '703772084263-ngg5a6tfdd920qh60gf694ouodr718gc.apps.googleusercontent.com';
  CALENDAR_ID = '0bad952e0331a7207fc33d2a2289cc7567000bceaf1c509ca255f9a984814738@group.calendar.google.com';

  initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load("client:auth2", () => {
        gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
        }).then(() => {
          resolve();
        }).catch((error: any) => {
          reject(error);
        });
      })
    })
    // return new Promise((resolve, reject) => {
    //   gapi.load('client:auth2', () => {
    //     gapi.auth2.init({
    //       clientId: clientId,
    //       apiKey: this.API_KEY,
    //       discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    //     }).then(() => {
    //       resolve();
    //     }).catch((error: any) => {
    //       reject(error);
    //     });
    //   });
    // });
  }

  authenticate(): Observable<string> {
    return new Observable((observer) => {
      google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        callback: (response: any) => {
          if (response.credential) {
            observer.next(response.credential);
            observer.complete();
          } else {
            console.log('no token');
            observer.error('No credential found');
          }
        }
      });


      google.accounts.id.prompt();
    });

    // return gapi.auth2.getAuthInstance()
    //   .signIn({prompt: 'select_account'})
    //   .then(() => {
    //     console.log("Sign-in successful");
    //     return gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    //   })
    //   .catch((error: any) => {
    //     console.error("Error signing in", error);
    //     throw error;
    //   });
  }

  getCalendarEvents(date: Date = new Date()): Observable<CalendarEvent[]> {
    return new Observable((observer) => {
      const startOfWeek = this.getStartOfWeek(date);
      const endOfWeek = this.getEndOfWeek(date);

      gapi.client.calendar.events.list({
        'calendarId': this.CALENDAR_ID,
        'timeMin': startOfWeek.toISOString(),
        'timeMax': endOfWeek.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
      }).then((response: any) => {
        observer.next(response.result.items);
        observer.complete();
      }, (error: any) => {
        observer.error(error);
      });
    });
  }

  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const end = this.getStartOfWeek(date);
    end.setDate(end.getDate() + 6);
    return end;
  }

  createCalendarEvent(event: CalendarEvent, token: string): Observable<any> {
    gapi.client.setToken({access_token: token});
    return new Observable((observer) => {
      gapi.client.calendar.events.insert({
        'calendarId': this.CALENDAR_ID,
        'resource': event
      }).then((response: any) => {
        console.log("lefutott");
        console.log(response);
        observer.next(response.result);
        observer.complete();
      }, (error: any) => {
        console.log(error);
        observer.error(error);
      });
    });
  }
}
