import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  public datosSubject: Subject<any> = new Subject<any>();
  sensores: any[] = [];
  estanques: any[] = [];


  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket('ws://localhost:3000'); // Cambialo si cambiaste de servidor 
    this.socket.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Datos recibidos del WebSocket:', data); // Log para verificar datos recibidos
  
      // Verifica que se reciban tanto estanques como sensores
      if (data && data.estanques && data.sensores) {
        this.estanques = data.estanques; // Almacena los estanques en el array
        this.sensores = data.sensores; // Almacena los sensores en el array

        // Emitir datos de estanques
        this.estanques.forEach((estanque) => {
          console.log('Estanque:', estanque);
          this.datosSubject.next(estanque); // Emitir los datos del estanque
        });

        // Emitir datos de sensores
        this.sensores.forEach((sensor) => {
          console.log('Sensor:', sensor);
          this.datosSubject.next(sensor); // Emitir los datos del sensor
        });
      } else {
        console.error('Datos inválidos recibidos:', data);
      }
    };
  

    this.socket.onclose = () => {
      console.log('Conexión cerrada, intentando reconectar...');
      setTimeout(() => this.connect(), 1000); // Intentar reconectar
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
  }

  sendMessage(message: string) {
    this.socket.send(message);
  }

  // Puedes agregar más métodos aquí para interactuar con el WebSocket
}



