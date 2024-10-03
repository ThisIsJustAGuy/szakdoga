import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-calendar-column',
  standalone: true,
  imports: [],
  templateUrl: './calendar-column.component.html',
  styleUrl: './calendar-column.component.scss'
})
export class CalendarColumnComponent {
  @Input() date: number = 0;

  getID(hour: number): string {
    return this.date + "." + hour;
  }
}
