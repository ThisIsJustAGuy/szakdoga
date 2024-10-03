import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'app-hours-column',
  standalone: true,
  imports: [],
  templateUrl: './hours-column.component.html',
  styleUrl: './hours-column.component.scss'
})
export class HoursColumnComponent implements AfterViewInit{
  ngAfterViewInit() {
    this.scrollToStart()
  }

  scrollToStart(){
    const scrollStart = document.getElementById("7");
    const scrollable = document.getElementById('scrollable');

    if (scrollStart && scrollable) {

      const { top } = scrollStart.getBoundingClientRect(); // scrollStart helye
      const { top: scrollableTop } = scrollable.getBoundingClientRect(); // scrollable helye
      const scrollY = top - scrollableTop; // mennyit kell scrollolni

      scrollable.scrollBy({
        top: scrollY,
        behavior: 'smooth'
      });
    }
  }
}
