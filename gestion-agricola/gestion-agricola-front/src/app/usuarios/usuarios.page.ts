import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  users: any[]= [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  navigateBack() {
    this.router.navigate(['/menu']);
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading = false;
      },
    });
  }
  // Método para eliminar un usuario
  async deleteUser(userId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.authService.deleteUser(userId).subscribe({
              next: () => {
                this.users = this.users.filter((user) => user._id !== userId);
                this.showToast('Usuario eliminado con éxito.');
              },
              error: (err) => {
                console.error('Error al eliminar usuario:', err);
                this.showToast('Error al eliminar el usuario.');
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para actualizar los datos de un usuario
  async updateUser(userId: string, userData: any) {
    const alert = await this.alertCtrl.create({
      header: 'Actualizar Usuario',
      inputs: [
        {
          name: 'nombreusuario',
          type: 'text',
          placeholder: 'Nombre de usuario',
          value: userData.nombreusuario,
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          value: userData.email,
        },
        {
          name: 'contrasena',
          type: 'password',
          placeholder: 'Contraseña',
          value: userData.contrasena,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            const updatedUser = { ...userData, ...data };
            this.authService.updateUser(userId, updatedUser).subscribe({
              next: (updatedUser) => {
                // Actualizar el usuario en el arreglo local
                const index = this.users.findIndex((user) => user._id === userId);
                if (index !== -1) {
                  this.users[index] = updatedUser;
                }
                this.showToast('Usuario actualizado con éxito.');
              },
              error: (err) => {
                console.error('Error al actualizar usuario:', err);
                this.showToast('Error al actualizar el usuario.');
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para mostrar mensajes de Toast
  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

}
