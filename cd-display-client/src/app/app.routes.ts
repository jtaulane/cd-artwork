import { Routes } from '@angular/router';
import { Control } from './pages/control/control';
import { Display } from './pages/display/display';

export const routes: Routes = [
  { path: '', redirectTo: 'display', pathMatch: 'full' },
  { path: 'control', component: Control },
  { path: 'display', component: Display },
];
