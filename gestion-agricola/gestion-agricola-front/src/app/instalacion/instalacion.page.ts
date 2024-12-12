import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-instalacion',
  templateUrl: './instalacion.page.html',
  styleUrls: ['./instalacion.page.scss'],
})
export class InstalacionPage implements OnInit {
  cuadrantes: any[] = [];
  estanques: any[] = [];
  sensoresSinAsignar: any[] = [];
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
    this.obtenerSensoresSinAsignar();
  }

  navigateBack() {
    this.router.navigate(['/menu']);
  }

  cargarCuadrantes() {
    this.authService.getCuadrantes().subscribe((data) => {
      this.cuadrantes = data.map((cuadrante: any) => ({
        ...cuadrante,
        showDetails: false,
        sensor_id: cuadrante.sensor_id || null, // Asegurarse que el sensor_id esté correctamente asignado
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
    const estanque = this.estanques.find((e) => e.nombre === nombreEstanque);
  
    if (estanque) {
      this.selectedEstanque = estanque;
      console.log('Estanque seleccionado:', this.selectedEstanque);
  
      // Verificar capacidad actual y máxima antes de actualizar las baterías
      const capacidadActual = estanque.capacidad_actual || 0;
      const capacidadMaxima = estanque.capacidad_maxima || 1; // Evitar división por 0
  
      this.actualizarBateria(capacidadActual, capacidadMaxima);
      this.websocketService.startListeningForEstanque();
    } else {
      this.selectedEstanque = {
        nombre: nombreEstanque,
        capacidad_actual: null,
        capacidad_maxima: null,
      };
      this.websocketService.stopListening();
    }
  }

  actualizarBateria(capacidadActual: number, capacidadMaxima: number) {
    if (!capacidadActual || !capacidadMaxima) return; // Manejo de valores nulos o indefinidos
  
    const nivelBateria = (capacidadActual / capacidadMaxima) * 100;
  
    // Referencias para la batería de escritorio
    const barrasEscritorio = [
      document.getElementById('barra1-escritorio'),
      document.getElementById('barra2-escritorio'),
      document.getElementById('barra3-escritorio'),
      document.getElementById('barra4-escritorio'),
    ];
  
    // Referencias para la batería de móvil
    const barrasMovil = [
      document.getElementById('barra1-movil'),
      document.getElementById('barra2-movil'),
      document.getElementById('barra3-movil'),
      document.getElementById('barra4-movil'),
    ];
  
    // Función genérica para actualizar las barras
    const actualizarBarras = (barras: (HTMLElement | null)[], nivel: number) => {
      barras.forEach((barra, index) => {
        if (barra) {
          barra.style.backgroundColor = 'gray'; // Restablecer color por defecto
          barra.style.display = index < nivel / 25 ? 'block' : 'none'; // Mostrar barras según el nivel
  
          // Cambiar el color según el nivel de batería
          if (nivel > 75) barra.style.backgroundColor = 'green';
          else if (nivel > 50) barra.style.backgroundColor = 'yellow';
          else if (nivel > 25) barra.style.backgroundColor = 'orange';
          else barra.style.backgroundColor = 'red';
        }
      });
    };
  
    // Actualizar las barras de ambas baterías
    actualizarBarras(barrasEscritorio, nivelBateria);
    actualizarBarras(barrasMovil, nivelBateria);
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
      console.log('Datos recibidos del WebSocket:', data);
  
      // Manejar datos del sensor para cuadrantes
      if (this.selectedCuadrante && data.identificador === this.selectedCuadrante.identificador) {
        this.selectedCuadrante.sensor = this.selectedCuadrante.sensor || {}; // Asegurarse de que existe un objeto para el sensor
  
        // Asignar sensor_id
        if (data.sensor_id) {
          this.selectedCuadrante.sensor.sensor_id = data.sensor_id;
          console.log('sensor_id actualizado:', this.selectedCuadrante.sensor.sensor_id); // Verifica si el sensor_id se asigna
        }
      }
  
      // Manejar datos de los estanques
      if (data.nombre) {
        const estanqueActualizado = this.estanques.find((e) => e.nombre === data.nombre);
  
        if (estanqueActualizado) {
          if (data.capacidad_actual !== undefined) {
            estanqueActualizado.capacidad_actual = data.capacidad_actual;
            console.log('Capacidad actual del estanque actualizada:', estanqueActualizado.capacidad_actual);
          } else {
            estanqueActualizado.capacidad_actual = null;
          }
  
          if (data.capacidad_maxima !== undefined) {
            estanqueActualizado.capacidad_maxima = data.capacidad_maxima;
            console.log('Capacidad máxima del estanque actualizada:', estanqueActualizado.capacidad_maxima);
          } else {
            estanqueActualizado.capacidad_maxima = null;
          }
  
          // Actualizar batería si se tienen datos de capacidad
          if (estanqueActualizado.capacidad_actual !== undefined && estanqueActualizado.capacidad_maxima !== undefined) {
            this.actualizarBateria(estanqueActualizado.capacidad_actual, estanqueActualizado.capacidad_maxima);
          }
        }
      }
    });
  }

  
guardarTipoPlanta(cuadrante: any): void {
  if (cuadrante && cuadrante.tipo_planta) {
    this.authService.updateCuadrante(cuadrante._id, { tipo_planta: cuadrante.tipo_planta })
      .subscribe(
        (response) => {
          console.log('Cuadrante actualizado:', response);
          alert('Tipo de planta actualizado exitosamente.');
        },
        (error) => {
          console.error('Error al actualizar el cuadrante:', error);
          alert('No se pudo actualizar el tipo de planta.');
        }
      );
  } else {
    alert('Por favor, ingrese un tipo de planta válido.');
  }
}

assignSensorToCuadrante(cuadrante: any, sensor: any): void {
  if (cuadrante && sensor && cuadrante.identificador && sensor.sensor_id) {
    // Asignar el sensor al cuadrante
    console.log('Asignando sensor al cuadrante:', cuadrante.identificador);

    // Llamar al servicio de asignación
    this.authService.asignarSensor(sensor.sensor_id, cuadrante.identificador)
      .subscribe(
        (response) => {
          console.log('Cuadrante actualizado después de asignar el sensor:', response);
          alert('Sensor asignado exitosamente.');

          // Emitir los datos actualizados al WebSocket
          this.websocketService.sendUpdatedCuadranteData(cuadrante); // Emite los datos al WebSocket
        },
        (error) => {
          console.error('Error al asignar el sensor al cuadrante:', error);
          alert('No se pudo asignar el sensor.');
        }
      );
  } else {
    console.error('Error: cuadrante o sensor no válidos');
    alert('Faltan datos para asignar el sensor.');
  }
}

crearCuadrante(cuadranteData: any) {
  const nuevoCuadrante = {
    identificador: cuadranteData.identificador,
    tipo_planta: "Sin asignar",  // Valor por defecto
    sensor_id: null
  };

  this.authService.crearCuadrante(nuevoCuadrante).subscribe(
    (response) => {
      console.log('Cuadrante creado:', response);
      this.selectedCuadrante = response;
      this.cargarCuadrantes();
      alert('Cuadrante creado exitosamente');
    },
    (error) => {
      console.error('Error al crear cuadrante:', error);
      alert('Error al crear el cuadrante: ' + error.error.message);
    }
  );
}

  loadCuadrantes() {
    this.authService.getCuadrantes().subscribe(
      (cuadrantes) => {
        this.cuadrantes = cuadrantes;
        console.log('Cuadrantes cargados:', cuadrantes);
      },
      (error) => {
        console.error('Error al cargar cuadrantes:', error);
      }
    );
  }
  removeSensorFromCuadrante(cuadrante: any): void {
    if (!cuadrante.sensor || !cuadrante.sensor.sensor_id) {
      alert('No hay un sensor asignado al cuadrante.');
      return; 
    }
  
    this.authService.quitarSensor(cuadrante.sensor.sensor_id).subscribe(
      (response) => {
        console.log('Sensor desasignado exitosamente:', response);
        cuadrante.sensor = null;
        this.websocketService.sendUpdatedCuadranteData(cuadrante);
      },
      (error) => {
        console.error('Error al desasignar el sensor:', error);
        alert('No se pudo desasignar el sensor.');
      }
    );
  }
  obtenerSensoresSinAsignar(): void {
    this.authService.getSensoresNoAsignados().subscribe(
      (sensores) => {
        this.sensoresSinAsignar = sensores; // Guarda los sensores sin asignar
        console.log('Sensores sin asignar:', this.sensoresSinAsignar); // Verifica los sensores
      },
      (error) => {
        console.error('Error al obtener sensores sin asignar:', error);
      }
    );
  }

}
