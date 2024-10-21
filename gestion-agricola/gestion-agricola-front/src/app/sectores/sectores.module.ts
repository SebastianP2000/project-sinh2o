import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SectoresPageRoutingModule } from './sectores-routing.module';

import { SectoresPage } from './sectores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SectoresPageRoutingModule
  ],
  declarations: [SectoresPage]
})
export class SectoresPageModule {}
