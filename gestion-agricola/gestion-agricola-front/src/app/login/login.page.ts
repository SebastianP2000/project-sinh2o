import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa el servicio
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  nombreusuario: string = '';
  contrasena: string = '';
  

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.nombreusuario, this.contrasena).subscribe(
      (response) => {
        console.log('Inicio de sesión exitoso:', response);
        localStorage.setItem('token', response.token); // Guardar el token en el localStorage
        // Redirigir al menú principal si la autenticación es exitosa
        this.router.navigate(['/menu']);
        this.nombreusuario = '';
        this.contrasena = '';
      },
      (error) => {
        console.error('Error en el inicio de sesión:', error);
        // Aquí puedes manejar los errores (mostrar mensajes al usuario, etc.)
      }
    );
  }
}
