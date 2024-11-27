import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subject, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConstantService implements OnDestroy {

  private subs: Subscription[] = [];

  private _REDIRECT_URL: string = "";
  get REDIRECT_URL(): string {
    return this._REDIRECT_URL;
  }

  private _LOCALE: string = "en-US";
  get LOCALE(): string {
    return this._LOCALE;
  }

  // Google
  private _API_KEY = '';
  get API_KEY(): string {
    return this._API_KEY;
  }

  private _CLIENT_ID = '';
  get CLIENT_ID(): string {
    return this._CLIENT_ID;
  }

  private _CALENDAR_IDS: string[] = [];
  get CALENDAR_IDS(): string[] {
    return this._CALENDAR_IDS;
  }

  private _DISCOVERY_DOCS = '';
  get DISCOVERY_DOCS(): string {
    return this._DISCOVERY_DOCS;
  }

  private _SCOPE: string = '';
  get SCOPE(): string {
    return this._SCOPE;
  }

  // saját email szerver
  private _EMAIL_BACKEND_URL: string = '';
  get EMAIL_BACKEND_URL(): string {
    return this._EMAIL_BACKEND_URL;
  }

  // emailjs
  private _EMAILJS_PUBLIC_KEY: string = "";
  get EMAILJS_PUBLIC_KEY(): string {
    return this._EMAILJS_PUBLIC_KEY
  }

  private _SERVICE_ID: string = "";
  get SERVICE_ID(): string {
    return this._SERVICE_ID;
  }

  private _IN_PROGRESS_TEMPLATE_ID: string = ""; //új és edited
  get IN_PROGRESS_TEMPLATE_ID(): string {
    return this._IN_PROGRESS_TEMPLATE_ID;
  }

  private _FINISHED_TEMPLATE_ID: string = ""; //deleted és accepted
  get FINISHED_TEMPLATE_ID(): string {
    return this._FINISHED_TEMPLATE_ID;
  }

  private _BASE_URL: string = "";
  get BASE_URL(): string {
    return this._BASE_URL;
  }

  private _EDIT_ROUTE: string = "";
  get EDIT_ROUTE(): string {
    return this._EDIT_ROUTE;
  }

  private _ACCEPT_ROUTE: string = "";
  get ACCEPT_ROUTE(): string {
    return this._ACCEPT_ROUTE;
  }

  private _DELETE_ROUTE: string = "";
  get DELETE_ROUTE(): string {
    return this._DELETE_ROUTE;
  }

  private _CREATE_EVENT_ROUTE: string = ""; // új felvételnél
  get CREATE_EVENT_ROUTE(): string {
    return this._CREATE_EVENT_ROUTE;
  }

  private _COMPANY_EMAIL: string = "";
  get COMPANY_EMAIL(): string {
    return this._COMPANY_EMAIL;
  }

  private _LOCATIONS: string[] = [];
  get LOCATIONS(): string[] {
    return this._LOCATIONS;
  }

  private _MAX_ATTENDEES: number | number[] = 100;
  get MAX_ATTENDEES(): number | number[] {
    return this._MAX_ATTENDEES;
  }

  private _DISALLOWED_DATES: (string | string[])[] = [];
  get DISALLOWED_DATES(): (string | string[])[] {
    return this._DISALLOWED_DATES
  }

  private _ALLOW_OVERLAPS: boolean | boolean[] = true;
  get ALLOW_OVERLAPS(): boolean | boolean[] {
    return this._ALLOW_OVERLAPS;
  }

  private _PATH = "appointy.json";

  public setupFinished: Subject<boolean> = new Subject<boolean>();


  constructor(private http: HttpClient) {
  }

  setConstants() {
    this.subs.push(this.http.get(this._PATH).subscribe((data: any) => {
      this._REDIRECT_URL = data.redirectURL ?? "";
      this._LOCALE = data.locale ?? "en-US";
      this._API_KEY = data.apiKey ?? "";
      this._CLIENT_ID = data.clientID ?? "";
      this._SCOPE = data.scope ?? "";
      this._CALENDAR_IDS = data.calendarIDs ?? [];
      this._DISCOVERY_DOCS = data.discoveryDocs ?? "";
      this._EMAIL_BACKEND_URL = data.emailBackendURL ?? ""; //ez nincs a jsonben
      this._EMAILJS_PUBLIC_KEY = data.emailjsPublicKey ?? "";
      this._SERVICE_ID = data.serviceID ?? "";
      this._IN_PROGRESS_TEMPLATE_ID = data.inProgressTemplateID ?? "";
      this._FINISHED_TEMPLATE_ID = data.finishedTemplateID ?? "";
      this._COMPANY_EMAIL = data.companyEmail ?? "";
      this._BASE_URL = data.baseURL ?? "";
      this._EDIT_ROUTE = data.editRoute ?? "";
      this._ACCEPT_ROUTE = data.acceptRoute ?? "";
      this._DELETE_ROUTE = data.deleteRoute ?? "";
      this._CREATE_EVENT_ROUTE = data.createEventRoute ?? "";
      this._LOCATIONS = data.locations ?? [];
      this._MAX_ATTENDEES = data.maxAttendees ?? 100; // ha egy szám akkor global, ha tömb, akkor az adott indexű calendarra vonatkozik
      this._DISALLOWED_DATES = data.disallowedDates ?? []; //a tömb elemei: ha string egész nap, ha tömb intervallum
      this._ALLOW_OVERLAPS = data.allowOverlaps ?? true; // ha egy szám akkor global, ha tömb, akkor az adott indexű locationra vonatkozik

      this.setupFinished.next(true);
    }));
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
