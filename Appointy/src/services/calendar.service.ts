import {EventEmitter, Injectable} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {CalendarEvent} from "../classes/CalendarEvent";
import {GoogleLoginProvider, SocialAuthService} from "@abacritt/angularx-social-login";
import {ConstantService} from "./constant.service";

declare var gapi: any

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private http: HttpClient,
    private authService: SocialAuthService,
    private constService: ConstantService
  ) {
  }

  getCalendarEvents(date: Date = new Date()): Observable<any[]> {
    const startOfWeek = this.getStartOfWeek(date);

    const endOfWeek = this.getEndOfWeek(date);

    const startDateTime = startOfWeek.toISOString();
    const endDateTime = endOfWeek.toISOString();

    const requests: Observable<any>[] = [];

    for (let i = 0; i < this.constService.CALENDAR_IDS.length; i++) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${this.constService.CALENDAR_IDS[i]}/events?timeMin=${startDateTime}&timeMax=${endDateTime}&key=${this.constService.API_KEY}`;
      requests.push(this.http.get(url));
    }

    return forkJoin(requests).pipe(
      map(res => res.flat())
    );
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
        apiKey: this.constService.API_KEY,
        discoveryDocs: [this.constService.DISCOVERY_DOCS],
      }).then(() => {
        this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(() => {
          this.createEvent(event).then(() => e.emit(true));
        });
      })
    });
    return e;
  }

  async createEvent(event: CalendarEvent) {
    let i: number = 0;
    for (let index = 0; index < this.constService.LOCATIONS.length; index++) {
      if (this.constService.LOCATIONS[index] == event.location)
        i = index;
    }

    await gapi.client.calendar.events.insert({
      'calendarId': this.constService.CALENDAR_IDS[i],
      'resource': event,
      'sendNotifications': true
    }).execute((e: any) => console.log(e));
  }

}


