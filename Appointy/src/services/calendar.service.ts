import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {CalendarEvent} from "../classes/CalendarEvent";
import {GoogleLoginProvider, SocialAuthService} from "@abacritt/angularx-social-login";

declare var gapi: any

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  API_KEY = 'AIzaSyBGYpsRXbu27SlAYE93OLs4BXz4ADI3FXc';
  CLIENT_ID = '703772084263-ngg5a6tfdd920qh60gf694ouodr718gc.apps.googleusercontent.com';
  CALENDAR_ID = '0bad952e0331a7207fc33d2a2289cc7567000bceaf1c509ca255f9a984814738@group.calendar.google.com';

  constructor(
    private http: HttpClient,
    private authService: SocialAuthService
  ) {
  }

  getCalendarEvents(date: Date = new Date()): Observable<any> {
    const startOfWeek = this.getStartOfWeek(date);

    const endOfWeek = this.getEndOfWeek(date);

    const startDateTime = startOfWeek.toISOString();
    const endDateTime = endOfWeek.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${this.CALENDAR_ID}/events?timeMin=${startDateTime}&timeMax=${endDateTime}&key=${this.API_KEY}`;

    return this.http.get(url);
  }

  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return start;
  }

  getEndOfWeek(date: Date): Date {
    const end = this.getStartOfWeek(date);
    end.setDate(end.getDate() + 6);
    return end;
  }


  loadGapi(event: CalendarEvent) {

    let e = new EventEmitter<boolean>;

    gapi.load('client', () => {
      gapi.client.init({
        apiKey: this.API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      }).then(() => {
        this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(() => {
          this.createEvent(event).then(() => e.emit(true) );
        });
      })
    });
    return e;
  }

  async createEvent(event: CalendarEvent) {
    // Végre felveszi
    await gapi.client.calendar.events.insert({
      'calendarId': this.CALENDAR_ID,
      'resource': event,
    }).execute((e: any) => console.log(e));
  }

}


