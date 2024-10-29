import {RouterModule, Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../home/home.component').then((c) => c.HomeComponent),
    canActivate: [],
  },
  {
    path: 'edit-event',
    loadComponent: ()=> import('../components/event-edit/event-edit.component').then((c) => c.EventEditComponent),
    canActivate: [],
  },
  {
    path: 'accept-event',
    loadComponent: ()=> import('../components/event-accept/event-accept.component').then((c) => c.EventAcceptComponent),
    canActivate: [],
  },
  {
    path: 'delete-event',
    loadComponent: ()=> import('../components/event-delete/event-delete.component').then((c) => c.EventDeleteComponent),
    canActivate: [],
  },
  {
    path: 'create-calender-event',
    loadComponent: ()=> import('../components/create-calendar-event/create-calendar-event.component').then((c) => c.CreateCalendarEventComponent),
    canActivate: [],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
