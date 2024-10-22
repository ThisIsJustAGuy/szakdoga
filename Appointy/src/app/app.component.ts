import {Component, ElementRef, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConstantService} from "../services/constant.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private constantService: ConstantService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    const constsPath = this.elementRef.nativeElement.getAttribute('consts');

    if (constsPath) {
      this.constantService.setConstants(constsPath);
    }

  }
}
