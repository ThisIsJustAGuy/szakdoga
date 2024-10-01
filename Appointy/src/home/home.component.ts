import {Component, OnInit} from '@angular/core';
import {CalendarColumnComponent} from "../calendar-column/calendar-column.component";
import {HoursColumnComponent} from "../hours-column/hours-column.component";

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
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dates: number[] = [];
  today: Date = new Date();
  currentDay: number = 0;
  startDate: number = 0;
  lastDayOfLastMonth: number = 0;
  lastDayOfThisMonth: number = 0;
  date: number = 0;
  prevMonthUsed: boolean = false;
  nextMonthUsed: boolean = false;

  constructor() {
    this.today = new Date();
    this.getDatesOfWeek();
  }

  getDatesOfWeek() {
    let currentDate: number = this.today.getDate();
    this.currentDay = this.today.getDay();

    this.startDate = currentDate - (this.currentDay != 0 ? this.currentDay : 7) + 1;

    if (this.startDate < 1) {
      this.lastDayOfLastMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 0).getDate();
      this.prevMonthUsed = true;
      this.today.getMonth()
    }
    this.startDate = this.lastDayOfLastMonth + this.startDate;
    this.date = this.startDate - 1;
    this.lastDayOfThisMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();

    for (let i = 0; i < this.days.length; i++) {
      if (this.prevMonthUsed && this.lastDayOfLastMonth < this.date + 1) {
        this.date = 1;
      } else if (this.nextMonthUsed && this.lastDayOfThisMonth < this.date + 1) {
        this.date = 1;
      } else {
        this.date++;
      }
      this.dates.push(this.date);
    }
  }
}
