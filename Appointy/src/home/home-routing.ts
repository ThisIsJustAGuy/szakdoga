import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home.component";
import {EventEditComponent} from "../components/event-edit/event-edit.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [],
  },
  {
    path: 'edit-event',
    component: EventEditComponent,
    canActivate: [],
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRouting {
}
