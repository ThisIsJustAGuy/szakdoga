import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";

declare var google: any

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  API_KEY = 'AIzaSyBGYpsRXbu27SlAYE93OLs4BXz4ADI3FXc';
  CLIENT_ID = '703772084263-ngg5a6tfdd920qh60gf694ouodr718gc.apps.googleusercontent.com';
  CALENDAR_ID = '0bad952e0331a7207fc33d2a2289cc7567000bceaf1c509ca255f9a984814738@group.calendar.google.com';

  // private accessToken: string | null = null;

  constructor(private http: HttpClient) {
    // this.initGoogle();
  }

  // initGoogle() {
  //   google.accounts.id.initialize({
  //     client_id: this.CLIENT_ID,
  //     callback: this.handleCredentialResponse.bind(this),
  //     scope: 'https://www.googleapis.com/auth/calendar',
  //   });
  //
  //   google.accounts.id.prompt();
  // }
  //
  // handleCredentialResponse(response: any) {
  //   console.log(response.credential);
  //   const idToken = response.credential;
  //
  //   // id_token az Oauth2-nek
  //   this.exchangeToken(idToken).then((token: string) => {
  //     this.accessToken = token;
  //     console.log('Access Token: ', this.accessToken);
  //   }).catch(error => console.error(error));
  // }
  //
  // exchangeToken(idToken: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const tokenUrl = 'https://oauth2.googleapis.com/token';
  //     const params = new URLSearchParams();
  //
  //     //ezzel Oauth client not found
  //     params.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  //     params.set('assertion', idToken);
  //
  //     //ezzel malformed auth code
  //     // params.set('grant_type', 'authorization_code');
  //     // params.set('code', idToken);
  //     // params.set('client_id', this.CLIENT_ID);
  //     // params.set('client_secret', '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');
  //
  //     this.http.post(tokenUrl, params.toString(), {
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       })
  //     }).subscribe({
  //       next: (response: any) => {
  //         console.log("success");
  //         resolve(response.access_token);
  //       },
  //       error: (error) => {
  //         //itt dobja el, de nem értem miért
  //         console.error("Token exchange error: ", error.error);
  //         reject(error);
  //       }
  //     });
  //   });
  // }

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

  // createCalendarEvent(event: CalendarEvent): Observable<any> {
  //   if (!this.accessToken) {
  //     console.error('No access token available');
  //   }
  //
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.accessToken}`,
  //     'Content-Type': 'application/json'
  //   });
  //
  //   return this.http.post(`https://www.googleapis.com/calendar/v3/calendars/${this.CALENDAR_ID}/events`, event, {headers});
  // }
}


