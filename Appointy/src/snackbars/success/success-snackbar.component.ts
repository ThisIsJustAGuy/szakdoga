import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-success-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './success-snackbar.component.html',
  styleUrl: './success-snackbar.component.scss'
})
export class SuccessSnackbarComponent {
  @Input() data: { title: string, details: string } = {title: '', details: ''};
}
