import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage  {

  constructor(private router: Router, private alertController: AlertController) { }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            localStorage.removeItem('token');  // Eliminar el token del localStorage
            this.router.navigate(['/login']);  // Redirigir al login
          }
        }
      ]
    });

    await alert.present();  // Mostrar el alert
  }

  navigateToSectores() {
    this.router.navigate(['/sectores']);
  }
  navigateTocreate() {
    this.router.navigate(['/crearusuario']);
  }
}
