import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-calendar-column',
  standalone: true,
  imports: [],
  templateUrl: './calendar-column.component.html',
  styleUrl: './calendar-column.component.scss'
})
export class CalendarColumnComponent {
  @Input() day: string = '';
  @Input() date: number = 0;
}
