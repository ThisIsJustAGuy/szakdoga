import {RouterModule, Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('../home/home.module').then((mod) => mod.HomeModule),
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
