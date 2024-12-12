import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa el servicio
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  nombreusuario: string = '';
  contrasena: string = '';
  showErrorMessage: boolean = false;
  errorMessage: string = '';
  

  constructor(private authService: AuthService, 
    private router: Router, 
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController) {}

  

    async onLogin() {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
        spinner: 'circular'
      });
      await loading.present();
  
      this.authService.login(this.nombreusuario, this.contrasena).subscribe(
        (response) => {
          loading.dismiss();
          console.log('Inicio de sesión exitoso:', response);
          localStorage.setItem('token', response.token);
          this.router.navigate(['/menu']);
          this.nombreusuario = '';
          this.contrasena = '';
        },
        async (error) => {
          loading.dismiss();
          console.error('Error en el inicio de sesión:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.status === 404 ? 'Usuario no registrado' : 'Contraseña incorrecta',
            buttons: ['OK']
          });
          await alert.present();
        }
      );
  }
}
