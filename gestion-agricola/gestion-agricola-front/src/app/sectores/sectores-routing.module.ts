import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SectoresPage } from './sectores.page';

const routes: Routes = [
  {
    path: '',
    component: SectoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SectoresPageRoutingModule {}
