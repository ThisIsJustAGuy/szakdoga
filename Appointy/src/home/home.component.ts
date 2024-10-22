import {
  ApplicationRef, ChangeDetectorRef,
  Component,
  ComponentRef, OnInit,
} from '@angular/core';
import {CalendarColumnComponent} from "../components/calendar-column/calendar-column.component";
import {HoursColumnComponent} from "../components/hours-column/hours-column.component";
import {CalendarService} from "../services/calendar.service";
import {WeekdayComponent} from "../components/weekday/weekday.component";
import {EventComponent} from "../components/event/event.component";
import {CalendarEvent} from "../classes/CalendarEvent";
import {Subscription} from "rxjs";
import {NowMarkerComponent} from "../components/now-marker/now-marker.component";
import {EventDetailsModalComponent} from "../components/event-details-modal/event-details-modal.component";
import {ModalService} from "../services/modal.service";
import {NgIf} from "@angular/common";
import {EventDetails} from "../classes/EventDetails";
import {ConstantService} from "../services/constant.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CalendarColumnComponent,
    HoursColumnComponent,
    WeekdayComponent,
    EventComponent,
    EventDetailsModalComponent,
    NgIf,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  weekdays: string[] = [];
  dates: Date[] = [];

  currentDate: Date;
  now: Date;
  middleDate: Date; // Ez alapján döntjük el milyen hónap van

  currentDay: number = 0;
  startDate: number = 0;
  prevMonthUsed: boolean = false;

  componentRefs: ComponentRef<EventComponent>[] = [];
  nowMarkerRef: ComponentRef<NowMarkerComponent> | null = null;

  eventDetailsVisible: boolean = false;
  eventDetails!: EventDetails;

  ngOnInit() {
    this.initEventDetailsModal();
  }

  constructor(
    private calendarService: CalendarService,
    private appRef: ApplicationRef,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    protected constService: ConstantService
  ) {
    this.initCalendar();
    this.currentDate = new Date();
    this.middleDate = new Date();
    this.now = new Date();
    this.middleDate.setDate(this.currentDate.getDate() + (4 - this.currentDate.getDay()));

    this.fillWeekDays('hu-HU');
    this.fillDatesOfWeek();
  }

  initEventDetailsModal() {
    this.modalService.eventDetailsState$.subscribe(state => {
      if (state.calendarEvent || state.inputsRequired) {
        this.eventDetails = state;
      }
      this.eventDetailsVisible = state.showDetails ?? false;

      this.cdr.detectChanges();
    })
  }

  initCalendar() {
    const sub: Subscription = this.calendarService.getCalendarEvents()
      .subscribe((res) => {
        this.displayEvents(res.items);
        sub.unsubscribe();
      })
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
      startElement = document.getElementById(calendarEvents[i].startDate.getDate() + "." + calendarEvents[i].startDate.getHours());

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

    const sub: Subscription = this.calendarService.getCalendarEvents(this.currentDate)
      .subscribe((res) => {
        this.displayEvents(res.items);
        sub.unsubscribe();
      })
  }

  fillDatesOfWeek() {
    this.dates = [];
    this.prevMonthUsed = false;

    const currentDateDay: number = this.currentDate.getDate();
    this.currentDay = this.currentDate.getDay();
    this.startDate = currentDateDay - (this.currentDay != 0 ? this.currentDay : 7) + 1;

    const lastDayOfLastMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    if (this.startDate < 1) { // hét eleje még az előző hónap
      this.prevMonthUsed = true;
      this.startDate = lastDayOfLastMonth + this.startDate;
    }

    let date: number = this.startDate - 1;
    const lastDayOfThisMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();


    for (let i = 0; i < this.weekdays.length; i++) {
      if (this.prevMonthUsed && lastDayOfLastMonth < date + 1) { // átlépünk az előző hónap végéről elsejére
        date = 1;
      } else if (lastDayOfThisMonth < date + 1) { // átlépünk az akt. hónap végéről a köv. hónap elsejére
        date = 1;
      } else {
        date++;
      }

      let copiedDate: Date = new Date(this.middleDate);
      copiedDate.setDate(date);
      if (date < 4) { //middleDate után
        copiedDate.setMonth(copiedDate.getMonth() + 1);
        this.dates.push(copiedDate);
      } else {
        this.dates.push(copiedDate);
      }
    }
  }

  setNowMarker() {
    if (this.nowMarkerRef) {
      this.nowMarkerRef?.destroy();
    }

    const startElement: HTMLElement | null = document.getElementById(this.now.getDate() + "." + this.now.getHours());

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
}
