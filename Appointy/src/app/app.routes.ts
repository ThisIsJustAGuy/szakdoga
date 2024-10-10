import {RouterModule, Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../home/home.module').then((mod) => mod.HomeModule),
  },
  { path: '**', redirectTo: '' },
];

export const AppRoutingModule = RouterModule.forRoot(routes, {});
