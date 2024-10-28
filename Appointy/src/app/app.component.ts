import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConstantService} from "../services/constant.service";

@Component({
  selector: 'Appointy',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private constantService: ConstantService,) {
  }

  ngOnInit() {
    this.constantService.setConstants();
  }
}
