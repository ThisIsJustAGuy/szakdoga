import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home.component";
import {EventEditComponent} from "../components/event-edit/event-edit.component";
import {EventDeleteComponent} from "../components/event-delete/event-delete.component";

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
    path: 'accept-event',
    component: EventEditComponent,
    canActivate: [],
  },
  {
    path: 'delete-event',
    component: EventDeleteComponent,
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
