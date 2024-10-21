import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearusuarioPageRoutingModule } from './crearusuario-routing.module';

import { CrearusuarioPage } from './crearusuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearusuarioPageRoutingModule
  ],
  declarations: [CrearusuarioPage]
})
export class CrearusuarioPageModule {}
