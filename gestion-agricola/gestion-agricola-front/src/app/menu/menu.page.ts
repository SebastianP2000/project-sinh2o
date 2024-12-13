import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController  } from '@ionic/angular';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage  {

  constructor(private router: Router, private alertController: AlertController, private loadingController: LoadingController) { }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cerrando sesión...',
              spinner: 'circular'
            });
            await loading.present();
            
            setTimeout(() => {
              localStorage.removeItem('token');
              loading.dismiss();
              this.router.navigate(['/login']);
            }, 800);
          }
        }
      ]
    });

    await alert.present();
  }

  async navigateToSectores() {
    const loading = await this.loadingController.create({
      message: 'Cargando sectores...',
      spinner: 'circular'
    });
    await loading.present();
    
    setTimeout(() => {
      loading.dismiss();
      this.router.navigate(['/sectores']);
    }, 800);
  }

  async navigateTocreate() {
    const loading = await this.loadingController.create({
      spinner: 'circular'
    });
    await loading.present();
    
    setTimeout(() => {
      loading.dismiss();
      this.router.navigate(['/crearusuario']);
    }, 800);
  }

  async navigateTouser() {
    const loading = await this.loadingController.create({
      message: 'Cargando usuarios...',
      spinner: 'circular'
    });
    await loading.present();
    
    setTimeout(() => {
      loading.dismiss();
      this.router.navigate(['/usuarios']);
    }, 800);
  }

  async navigateToerrores() {
    const loading = await this.loadingController.create({
      message: 'Identificando errores...',
      spinner: 'circular'
    });
    await loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.router.navigate(['/errores']);
    }, 800);
  }

  async navigateToinstalacion() {
    const loading = await this.loadingController.create({
      message: 'Cargando sensores...',
      spinner: 'circular'
    });
    await loading.present();
    
    setTimeout(() => {
      loading.dismiss();
      this.router.navigate(['/instalacion']);
    }, 800);
  }

}
