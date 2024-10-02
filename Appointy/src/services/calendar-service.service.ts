import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class CalendarServiceService {
  API_KEY = 'AIzaSyBGYpsRXbu27SlAYE93OLs4BXz4ADI3FXc';

  constructor() { }
  initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
        }).then(() => {
          resolve();
        }).catch((error: any) => {
          reject(error);
        });
      });
    });
  }

  getCalendarEvents(calendarId: string): Observable<any> {
    return new Observable((observer) => {
      const now = new Date();
      const startOfWeek = this.getStartOfWeek(now);
      const endOfWeek = this.getEndOfWeek(now);

      gapi.client.calendar.events.list({
        'calendarId': calendarId,
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

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  }

  private getEndOfWeek(date: Date): Date {
    const end = this.getStartOfWeek(date);
    end.setDate(end.getDate() + 6);
    return end;
  }
}
