import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-weekday',
  standalone: true,
  imports: [],
  templateUrl: './weekday.component.html',
  styleUrl: './weekday.component.scss'
})
export class WeekdayComponent {
  @Input() day: string = "";
  @Input() date: number = 0;
}
