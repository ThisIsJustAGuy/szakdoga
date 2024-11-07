import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import {CalendarColumnComponent} from "../components/calendar-column/calendar-column.component";
import {HoursColumnComponent} from "../components/hours-column/hours-column.component";
import {CalendarService} from "../services/calendar.service";
import {WeekdayComponent} from "../components/weekday/weekday.component";
import {EventComponent} from "../components/event/event.component";
import {CalendarEvent} from "../classes/CalendarEvent";
import {Subject, Subscription} from "rxjs";
import {NowMarkerComponent} from "../components/now-marker/now-marker.component";
import {EventDetailsModalComponent} from "../components/event-details-modal/event-details-modal.component";
import {ModalService} from "../services/modal.service";
import {NgClass, NgIf} from "@angular/common";
import {EventDetails} from "../classes/EventDetails";
import {ConstantService} from "../services/constant.service";
import {isSameDay} from "date-fns";
import {StyleService} from "../services/style.service";

@Component({
  selector: 'Appointy-home',
  standalone: true,
  imports: [
    CalendarColumnComponent,
    HoursColumnComponent,
    WeekdayComponent,
    EventComponent,
    EventDetailsModalComponent,
    NgIf,
    NgClass,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  weekdays: string[] = [];
  dates: Date[] = [];

  currentDate: Date;
  now: Date;
  middleDate: Date; // Ez alapján döntjük el milyen hónap van

  startDate: number = 0;

  componentRefs: ComponentRef<EventComponent>[] = [];
  nowMarkerRef: ComponentRef<NowMarkerComponent> | null = null;
  disabledRefs: HTMLDivElement[][] = [];

  eventDetailsVisible: boolean = false;
  eventDetails!: EventDetails;

  constsLoaded: boolean = false;

  private subs: Subscription[] = [];
  private calendarColumnLoaded: Subject<boolean> = new Subject<boolean>();
  completedColumnLoads: number = 0;

  ngOnInit() {
    this.initEventDetailsModal();
  }

  constructor(
    private calendarService: CalendarService,
    private appRef: ApplicationRef,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    protected constService: ConstantService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private styleService: StyleService
  ) {
    this.styleService.loadStyles();

    this.currentDate = new Date();
    this.middleDate = new Date();
    this.now = new Date();
    this.middleDate.setDate(this.currentDate.getDate() + (4 - this.currentDate.getDay()));

    this.fillWeekDays('hu-HU');
    this.fillDatesOfWeek();

    this.subs.push(this.constService.setupFinished.subscribe((_val: boolean) => {
      this.initCalendar();
      this.constsLoaded = true;
      this.calendarColumnLoaded.next(true);
    }));
    this.constService.setConstants();

    this.calendarColumnLoaded.subscribe({
      next: () => {
        this.completedColumnLoads++;
        if (this.completedColumnLoads === 8 || (this.completedColumnLoads === 7 && this.constsLoaded)) {
          this.allColumnsLoaded();
          this.completedColumnLoads = 0;
        }
      }
    });
  }

  initEventDetailsModal() {
    this.subs.push(this.modalService.eventDetailsState$.subscribe(state => {
      if (state.calendarEvent || state.inputsRequired) {
        this.eventDetails = state;
      }
      this.eventDetailsVisible = state.showDetails ?? false;

      this.cdr.detectChanges();
    }))
  }

  initCalendar() {
    this.subs.push(this.calendarService.getCalendarEvents()
      .subscribe((res) => {
        for (let i = 1; i < res.length; i++) {
          res[0].items = [...res[0].items, ...res[i].items];
        }
        this.displayEvents(res[0].items);
      }))
  }

  displayEvents(results: CalendarEvent[]) {
    // Számított mezők létrejöjjenek
    const calendarEvents: CalendarEvent[] = []
    for (const res of results) {
      calendarEvents.push(new CalendarEvent(res.summary, res.start, res.end, res.description, res.location));
    }

    let startElement: HTMLElement | null;

    for (let i = 0; i < calendarEvents.length; i++) {
      // helyes id-val rendelkező kocka megtalálása
      startElement = document.getElementById(calendarEvents[i].startDate.getFullYear() + "." + calendarEvents[i].startDate.getMonth() + "." + calendarEvents[i].startDate.getDate() + "." + calendarEvents[i].startDate.getHours());

      if (startElement) {
        // calendarEvents[i] = new CalendarEvent(events[i].summary, events[i].start, events[i].end, events[i].description, events[i].location);
        // ne írják egymást felül, ha egy kockába kell többet tenni
        const eventContainer = document.createElement('div');
        eventContainer.classList.add("event_container");
        startElement.appendChild(eventContainer);

        // berakjuk a helyére
        this.componentRefs[i] = this.appRef.bootstrap(EventComponent, eventContainer);
        // utólag inputot kap
        this.componentRefs[i].instance.calendarEvent = calendarEvents[i];
        this.componentRefs[i].instance.id = `card${i}`;

        // Angular vegye észre az új adatokat
        this.componentRefs[i].instance.updateVariables();
      }
    }

    this.now = new Date();
    this.setNowMarker();
  }

  destroyEvents() {
    if (this.componentRefs) {
      for (const ref of this.componentRefs) {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
      }
    }
    if (this.nowMarkerRef) {
      this.nowMarkerRef.destroy();
    }
  }

  destroyDisabled() {
    if (this.disabledRefs.length > 0) {
      for (let refs of this.disabledRefs) {
        this.renderer.removeChild(refs[1], refs[0]);
      }
      this.disabledRefs = [];
    }
  }

  fillWeekDays(locale: string) {
    let baseDate: Date = new Date(Date.UTC(2017, 0, 2)); //csak egy hétfői nap
    for (let i: number = 0; i < 7; i++) {
      let day: string = baseDate.toLocaleDateString(locale, {weekday: 'long'});
      day = day[0].toUpperCase() + day.slice(1);
      this.weekdays.push(day);
      baseDate.setDate(baseDate.getDate() + 1);
    }
  }

  prevWeek() {
    this.stepWeek(-1);
  }

  nextWeek() {
    this.stepWeek(1);
  }

  stepWeek(amount: number) {
    amount *= 7;
    this.currentDate.setDate(this.currentDate.getDate() + amount);
    this.middleDate.setDate(this.middleDate.getDate() + amount);

    this.fillDatesOfWeek();
    this.destroyEvents();
    this.destroyDisabled();

    this.subs.push(this.calendarService.getCalendarEvents(this.currentDate)
      .subscribe((res) => {
        for (let i = 1; i < res.length; i++) {
          res[0].items = [...res[0].items, ...res[i].items];
        }
        this.displayEvents(res[0].items);
      }));
  }

  fillDatesOfWeek() {
    this.dates = [];
    let prevMonthUsed: boolean = false;
    let nextMonthUsed: boolean = false;

    const currentDateDay: number = this.currentDate.getDate();
    const currentDay = this.currentDate.getDay();
    this.startDate = currentDateDay - (currentDay != 0 ? currentDay : 7) + 1;

    const lastDayOfLastMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    if (this.startDate < 1) { // hét eleje még az előző hónap
      prevMonthUsed = true;
      this.startDate = lastDayOfLastMonth + this.startDate;
    }

    let date: number = this.startDate - 1;
    const lastDayOfThisMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();


    for (let i = 0; i < this.weekdays.length; i++) {
      if (prevMonthUsed && lastDayOfLastMonth < date + 1) { // átlépünk az előző hónap végéről elsejére
        date = 1;
      } else if (lastDayOfThisMonth < date + 1) { // átlépünk az akt. hónap végéről a köv. hónap elsejére
        nextMonthUsed = true;
        date = 1;
      } else {
        date++;
      }

      let copiedDate: Date = new Date(this.currentDate);
      copiedDate.setDate(date);

      if (date < 23 && nextMonthUsed) { //kövi hónapba lépünk
        copiedDate.setMonth(copiedDate.getMonth() + 1);
        this.dates.push(copiedDate);
      } else if (date > 6 && prevMonthUsed) {
        copiedDate.setMonth(copiedDate.getMonth() - 1);
        this.dates.push(copiedDate);
      } else {
        this.dates.push(copiedDate);
      }
    }

  }

  handleColumnLoad(value: boolean, _index: number) {
    this.calendarColumnLoaded.next(value);
  }

  allColumnsLoaded() {
    this.configDisabledDates();
  }

  configDisabledDates() {
    for (const date of this.dates) {
      for (const disallowedDate of this.constService.DISALLOWED_DATES) {
        if (!Array.isArray(disallowedDate) && isSameDay(date, disallowedDate)) {
          //egész napos
          this.createDisabledOverlay(date);
        } else if (Array.isArray(disallowedDate) && isSameDay(date, disallowedDate[0]) && !isSameDay(date, disallowedDate[1])) {
          //kezdő- és végpont, több napos
          this.createDisabledOverlay(date, disallowedDate, true);
        } else if (Array.isArray(disallowedDate) && isSameDay(date, disallowedDate[0])) {
          //kezdő- és végpont, 1 napos
          this.createDisabledOverlay(date, disallowedDate);
        }
      }
    }
  }

  createDisabledOverlay(date: Date, disallowedDates?: string[], multipleDays: boolean = false) {

    const div: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(div, 'disallowed_date');

    this.renderer.setStyle(div, 'width', '100%');
    //1 egész napos; vagy több napos, de nem ma van sem az eleje, sem a vége
    this.renderer.setStyle(div, 'height', '100%');

    // if (!disallowedDates || (multipleDays && !isSameDay(date, disallowedDates[1]) && !isSameDay(date, disallowedDates[0]))) {

    if (disallowedDates) {
      //intervallum
      const cellHeight: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-cell-height'));
      const start: Date = new Date(disallowedDates[0]);
      const end: Date = new Date(disallowedDates[1]);

      if (!multipleDays) {
        //egy nap
        this.renderer.setStyle(div, 'top', start.getHours() * cellHeight + (start.getMinutes() / 60) * cellHeight + "rem");
        this.renderer.setStyle(div, 'height', cellHeight * (end.getHours() - start.getHours()) + cellHeight * ((end.getMinutes() - start.getMinutes()) / 60) + "rem");

      } else if (isSameDay(date, start)) {
        //több nap, ma van az eleje
        this.renderer.setStyle(div, 'top', start.getHours() * cellHeight + (start.getMinutes() / 60) * cellHeight + "rem");
        this.renderer.setStyle(div, 'height', cellHeight * (24 - start.getHours()) - cellHeight * (start.getMinutes() / 60) + "rem");
        this.nextOverlayIteration(date, disallowedDates);

      } else if (isSameDay(date, end)) {
        //több nap, ma van a vége
        this.renderer.setStyle(div, 'top', '0');
        this.renderer.setStyle(div, 'height', cellHeight * end.getHours() + cellHeight * (end.getMinutes() / 60) + "rem");

      } else {
        //több nap, nem ma van sem az eleje, sem a vége
        this.nextOverlayIteration(date, disallowedDates);
      }
    }

    const parent: HTMLDivElement = this.elementRef.nativeElement.querySelector(`#calendarColumn${date.getDate()}`);
    this.renderer.appendChild(parent, div);
    this.disabledRefs.push([div, parent]);
  }

  nextOverlayIteration(date: Date, disallowedDates: string[]) {
    const tomorrow: Date = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    this.createDisabledOverlay(tomorrow, disallowedDates, true);
  }


  setNowMarker() {
    if (this.nowMarkerRef) {
      this.nowMarkerRef?.destroy();
    }

    const startElement: HTMLElement | null = document.getElementById(this.now.getFullYear() + "." + this.now.getMonth() + "." + this.now.getDate() + "." + this.now.getHours());

    if (startElement) {
      const nowContainer = document.createElement('div');
      nowContainer.classList.add("now_container");
      startElement.appendChild(nowContainer);

      this.nowMarkerRef = this.appRef.bootstrap(NowMarkerComponent, nowContainer);

      this.nowMarkerRef.instance.now = this.now;

      this.updateNowMarker(nowContainer);
      setInterval(() => {
        this.updateNowMarker(nowContainer);
      }, 29000);

    }
  }

  updateNowMarker(nowContainer: HTMLDivElement) {
    if (this.nowMarkerRef) {
      nowContainer.style.marginTop = this.nowMarkerRef.instance.updateMarker();
    }
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
