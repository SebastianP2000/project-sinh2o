import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-crearusuario',
  templateUrl: './crearusuario.page.html',
  styleUrls: ['./crearusuario.page.scss'],
})
export class CrearusuarioPage {

  usuario = {
    nombreusuario: '',
    email: '',
    contrasena: '',
  };

  constructor(private authService: AuthService, private router: Router, private alertController: AlertController, private loadingController: LoadingController) {}

  async crearUsuario() {
    console.log('Datos del usuario:', this.usuario);

    const loading = await this.loadingController.create({
      message: 'Creando usuario...',
      spinner: 'circular'
    });
    await loading.present();

    this.authService.crearUsuario(this.usuario).subscribe(
      async (response) => {
        loading.dismiss();
        console.log('Usuario creado:', response);
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Usuario creado correctamente',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/menu']);
      },
      async (error) => {
        loading.dismiss();
        console.error('Error al crear usuario:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'El usuario ya existe en el sistema',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  navigateBack() {
    this.router.navigate(['/menu']);
  }
}
