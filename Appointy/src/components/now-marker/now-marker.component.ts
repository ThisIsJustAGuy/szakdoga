import {Component, Input} from '@angular/core';

@Component({
  selector: 'Appointy-now-marker',
  standalone: true,
  imports: [],
  templateUrl: './now-marker.component.html',
  styleUrl: './now-marker.component.scss'
})
export class NowMarkerComponent {
  @Input() now: Date = new Date();

  updateMarker(): string {
    this.now = new Date();
    return this.getMarginTop();
  }

  getMarginTop(): string {
    const marker = document.getElementById("now_marker")!;
    const cellHeight: number = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-cell-height'));

    if (marker) {
      const marginTop: number = cellHeight * (this.now.getMinutes() / 60);
      return `${marginTop}rem`;
    }
    return '';
  }
}
