import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}

  crearUsuario() {
    console.log('Datos del usuario:', this.usuario); // Para depuración

    this.authService.crearUsuario(this.usuario).subscribe(
      (response) => {
        console.log('Usuario creado:', response);
        this.router.navigate(['/menu']); // Redirige al menú después de crear el usuario
      },
      (error) => {
        console.error('Error al crear usuario:', error);
      }
    );
  }

  navigateBack() {
    this.router.navigate(['/menu']); // Cambia a la ruta de la página anterior
  }
}
