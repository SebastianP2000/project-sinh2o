import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WebsocketService } from '../services/websocket.service';


@Component({
  selector: 'app-sectores',
  templateUrl: './sectores.page.html',
  styleUrls: ['./sectores.page.scss'],
})
export class SectoresPage implements OnInit {
  cuadrantes: any[] = [];
  estanques: any[] = [];
  selectedCuadrante: any;
  selectedEstanque: any;

  letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  filas = [1, 2, 3, 4];

  temperatura: number | null = null;
  humedad: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit() {
    this.cargarCuadrantes();
    this.cargarEstanques();
    this.listenForUpdates();
  }

  navigateBack() {
    this.router.navigate(['/menu']);
  }

  cargarCuadrantes() {
    this.authService.getCuadrantes().subscribe((data) => {
      this.cuadrantes = data.map((cuadrante: any) => ({
        ...cuadrante,
        showDetails: false
      }));
    });
  }

  cargarEstanques() {
    this.authService.getEstanques().subscribe((data) => {
      this.estanques = data.map((estanque: any) => ({ ...estanque, showDetails: false }));
    });
  }

  showDetails(nombreCuadrante: string) {
    const cuadrante = this.cuadrantes.find(c => c.nombre === nombreCuadrante);
    if (cuadrante) {
      this.selectedCuadrante = cuadrante;
    } else {
      this.selectedCuadrante = { nombre: nombreCuadrante, ultima_irrigacion: null, fecha_sensor_agregado: null, tipo_planta: null };
    }
  }

  toggleEstanqueDetails(nombreEstanque: string) {
    const estanque = this.estanques.find(e => e.nombre === nombreEstanque);
    if (estanque) {
      this.selectedEstanque = estanque;
    } else {
      this.selectedEstanque = { nombre: nombreEstanque, capacidad_maxima: null, capacidad_actual: null};
    }
  }

  closeDetails() {
    this.selectedCuadrante = null;
  }

  closeDetailsE() {
    this.selectedEstanque = null;
  }




  listenForUpdates() {
    this.websocketService.datosSubject.subscribe((data) => {
        if (data.capacidad_actual !== undefined) {
            // Actualiza el estanque correspondiente con la capacidad actual
            const estanqueActualizado = this.estanques.find(e => e.nombre === data.nombre); // Busca el estanque por nombre
            if (estanqueActualizado) {
                estanqueActualizado.capacidad_actual = data.capacidad_actual; // Actualiza la capacidad actual
                console.log('Capacidad actualizada:', estanqueActualizado); // Log para verificar la actualización
            }
        }
        if (data.temperatura !== undefined) {
          this.temperatura = data.temperatura; // Actualiza la temperatura
          console.log('Temperatura actualizada:', this.temperatura); // Log para verificar la actualización
      }

      if (data.humedad !== undefined) {
          this.humedad = data.humedad; // Actualiza la humedad
          console.log('Humedad actualizada:', this.humedad); // Log para verificar la actualización
      }
    });
  }



}
