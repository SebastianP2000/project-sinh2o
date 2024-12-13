import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-errores',
  templateUrl: './errores.page.html',
  styleUrls: ['./errores.page.scss'],
})
export class ErroresPage implements OnInit {
  historiales: any[] = [];

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.cargarHistoriales();
  }

  navigateBack() {
    this.router.navigate(['/menu']);
  }

  cargarHistoriales() {
    this.authService.getHistoriales().subscribe(
      (data) => {
        this.historiales = data;
      },
      (error) => {
        console.error('Error al cargar historiales:', error);
      }
    );
  }

}
