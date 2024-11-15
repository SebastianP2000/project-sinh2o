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
        showDetails: false,
        temperatura: null, // Asignar temperatura y humedad a null por defecto
        humedad: null,
      }));
    });
  }

  cargarEstanques() {
    this.authService.getEstanques().subscribe((data) => {
      this.estanques = data.map((estanque: any) => ({ ...estanque, showDetails: false }));
    });
  }

  showDetails(nombreCuadrante: string) {
    const cuadrante = this.cuadrantes.find(c => c.identificador === nombreCuadrante);
    if (cuadrante) {
      this.selectedCuadrante = cuadrante;
      console.log('Cuadrante seleccionado:', this.selectedCuadrante); // Verifica el cuadrante seleccionado
      this.websocketService.startListeningForCuadrante(); // Comienza a escuchar datos para este cuadrante
    } else {
      this.selectedCuadrante = { identificador: nombreCuadrante, ultima_irrigacion: null, fecha_sensor_agregado: null, tipo_planta: null };
      this.websocketService.stopListening(); // Detén la escucha si no hay cuadrante
    }
  }

  toggleEstanqueDetails(nombreEstanque: string) {
    const estanque = this.estanques.find(e => e.nombre === nombreEstanque);
    if (estanque) {
      this.selectedEstanque = estanque;
      console.log('Estanque seleccionado:', this.selectedEstanque); // Verifica el estanque seleccionado
      this.websocketService.startListeningForEstanque(); // Comienza a escuchar datos para este estanque
    } else {
      this.selectedEstanque = { nombre: nombreEstanque, capacidad_actual: null, capacidad_maxima: null };
      this.websocketService.stopListening(); // Detener la escucha si no hay estanque
    }
  }

  closeDetails() {
    this.selectedCuadrante = null;
    this.websocketService.stopListening(); // Detener la escucha cuando ya no hay cuadrante seleccionado
  }

  closeDetailsE() {
    this.selectedEstanque = null;
    this.websocketService.stopListening(); // Detener la escucha cuando ya no hay estanque seleccionado
  }

  listenForUpdates() {
    this.websocketService.datosSubject.subscribe((data) => {
      console.log('Datos recibidos del WebSocket:', data); // Verificar los datos completos
  
      // Asegurarnos de que los datos del sensor sean manejados correctamente para cuadrantes
      if (this.selectedCuadrante && data.identificador === this.selectedCuadrante.identificador) {
        // Actualizar valores de temperatura y humedad del sensor
        if (data.temperatura !== undefined) {
          this.selectedCuadrante.sensor = this.selectedCuadrante.sensor || {};  // Asegurarse de que existe un objeto para el sensor
          this.selectedCuadrante.sensor.temperatura = data.temperatura;
          console.log('Temperatura del sensor actualizada:', this.selectedCuadrante.sensor.temperatura);
        } else {
          // Si no hay datos, se puede establecer en null o 'N/D'
          if (!this.selectedCuadrante.sensor) this.selectedCuadrante.sensor = {};
          this.selectedCuadrante.sensor.temperatura = null;
        }
  
        if (data.humedad !== undefined) {
          this.selectedCuadrante.sensor = this.selectedCuadrante.sensor || {};  // Asegurarse de que existe un objeto para el sensor
          this.selectedCuadrante.sensor.humedad = data.humedad;
          console.log('Humedad del sensor actualizada:', this.selectedCuadrante.sensor.humedad);
        } else {
          // Si no hay datos, se puede establecer en null o 'N/D'
          if (!this.selectedCuadrante.sensor) this.selectedCuadrante.sensor = {};
          this.selectedCuadrante.sensor.humedad = null;
        }
      }

      // Asegurarnos de que los datos del estanque sean manejados correctamente
      if (this.selectedEstanque && data.nombre === this.selectedEstanque.nombre) {
        // Si el estanque tiene datos para la capacidad
        if (data.capacidad_actual !== undefined) {
          this.selectedEstanque.capacidad_actual = data.capacidad_actual;
          console.log('Capacidad actual del estanque actualizada:', this.selectedEstanque.capacidad_actual);
        } else {
          this.selectedEstanque.capacidad_actual = null;
        }
        if (data.capacidad_maxima !== undefined) {
          this.selectedEstanque.capacidad_maxima = data.capacidad_maxima;
          console.log('Capacidad máxima del estanque actualizada:', this.selectedEstanque.capacidad_maxima);
        } else {
          this.selectedEstanque.capacidad_maxima = null;
        }
      }
    });
  }
}
