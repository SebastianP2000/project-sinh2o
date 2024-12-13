import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErroresPage } from './errores.page';

const routes: Routes = [
  {
    path: '',
    component: ErroresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErroresPageRoutingModule {}
