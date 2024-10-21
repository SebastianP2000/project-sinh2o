import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearusuarioPage } from './crearusuario.page';

const routes: Routes = [
  {
    path: '',
    component: CrearusuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearusuarioPageRoutingModule {}
