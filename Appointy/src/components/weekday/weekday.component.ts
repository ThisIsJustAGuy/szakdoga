import {Component, Input} from '@angular/core';

@Component({
  selector: 'Appointy-weekday',
  standalone: true,
  imports: [],
  templateUrl: './weekday.component.html',
  styleUrl: './weekday.component.scss'
})
export class WeekdayComponent {
  @Input() day: string = "";
  @Input() date: number = 0;
}
