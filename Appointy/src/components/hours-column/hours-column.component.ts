import {AfterViewInit, Component} from '@angular/core';

@Component({
  selector: 'Appointy-hours-column',
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
    const scrollTo = document.getElementById("h7");
    const scrollable = document.getElementById('scrollable');

    if (scrollTo && scrollable) {

      const { top } = scrollTo.getBoundingClientRect(); // scrollTo helye
      const { top: scrollableTop } = scrollable.getBoundingClientRect(); // scrollable helye
      const scrollY = top - scrollableTop; // mennyit kell görgetni

      scrollable.scrollBy({
        top: scrollY,
        behavior: 'smooth'
      });
    }
  }
}
