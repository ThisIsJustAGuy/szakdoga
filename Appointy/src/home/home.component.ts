import {Component} from '@angular/core';
import {CalendarColumnComponent} from "../columns/calendar-column/calendar-column.component";
import {HoursColumnComponent} from "../columns/hours-column/hours-column.component";
import {CalendarServiceService} from "../services/calendar-service.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CalendarColumnComponent,
    HoursColumnComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  weekdays: string[] = [];
  dates: number[] = [];
  locale: string = "hu-HU";
  currentDate: Date;
  middleDate: Date; // Ez alapján döntjük el milyen hónap van
  currentDay: number = 0;
  startDate: number = 0;
  // lastDayOfLastMonth: number = 0;
  // lastDayOfThisMonth: number = 0;
  prevMonthUsed: boolean = false;
  clientID: string = "0bad952e0331a7207fc33d2a2289cc7567000bceaf1c509ca255f9a984814738@group.calendar.google.com";

  constructor(private calendarService: CalendarServiceService) {
    this.currentDate = new Date();
    this.middleDate = new Date();
    this.middleDate.setDate(this.currentDate.getDate() + (4 - this.currentDate.getDay()));

    this.fillWeekDays('hu-HU');
    this.fillDatesOfWeek();
    this.initCalendarClient();

  }

  async initCalendarClient(){
    await this.calendarService.initClient();
    this.calendarService.getCalendarEvents(this.clientID).subscribe(res => console.log(res));
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

    this.fillDatesOfWeek()
  }

  fillDatesOfWeek() {
    this.dates = [];
    this.prevMonthUsed = false;

    let currentDateDay: number = this.currentDate.getDate();
    this.currentDay = this.currentDate.getDay();
    this.startDate = currentDateDay - (this.currentDay != 0 ? this.currentDay : 7) + 1;

    let lastDayOfLastMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    if (this.startDate < 1) { // hét eleje még az előző hónap
      this.prevMonthUsed = true;
      this.startDate = lastDayOfLastMonth + this.startDate;
    }

    let date: number = this.startDate - 1;
    let lastDayOfThisMonth: number = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();


    for (let i = 0; i < this.weekdays.length; i++) {
      if (this.prevMonthUsed && lastDayOfLastMonth < date + 1) { // átlépünk az előző hónap végéről elsejére
        date = 1;
      } else if (lastDayOfThisMonth < date + 1) { // átlépünk az akt. hónap végéről a köv. hónap elsejére
        date = 1;
      } else {
        date++;
      }
      this.dates.push(date);
    }
  }
}
