import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  public datosSubject: Subject<any> = new Subject<any>();
  sensores: any[] = [];
  estanques: any[] = [];
  isConnected: boolean = false; 
  private listeningForCuadrante: boolean = false;
  private listeningForEstanque: boolean = false;

  constructor() {}

  private connect() {
    const wsUrl = environment.production ? 'wss://project-sinh2o.onrender.com' : 'ws://localhost:3000';
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      this.isConnected = true;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Datos recibidos del WebSocket:', data); // Log para verificar datos recibidos
  
      if (data && data.estanques && data.sensores) {
        this.estanques = data.estanques; // Almacena los estanques en el array
        this.sensores = data.sensores; // Almacena los sensores en el array

        // Emitir datos de estanques
        this.estanques.forEach((estanque) => {
          console.log('Estanque:', estanque);
          if (this.isConnected && this.listeningForEstanque) {
            this.datosSubject.next(estanque);
          }
        });

        // Emitir datos de sensores
        this.sensores.forEach((sensor) => {
          if (sensor.identificador && this.isConnected && this.listeningForCuadrante) {
            this.datosSubject.next(sensor);
          }
        });
      } else {
        console.error('Datos inválidos recibidos:', data);
      }
    };

    this.socket.onclose = () => {
      console.log('Conexión cerrada, intentando reconectar...');
      this.isConnected = false;
      // Solo reconectar si es necesario
      if (this.listeningForCuadrante || this.listeningForEstanque) {
        setTimeout(() => this.connect(), 1000);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
  }

  startListeningForCuadrante() {
    if (!this.isConnected) {
      this.connect(); // Solo conectar si no estamos conectados
    }
    this.listeningForCuadrante = true;
    this.listeningForEstanque = false;
  }

  startListeningForEstanque() {
    if (!this.isConnected) {
      this.connect(); // Solo conectar si no estamos conectados
    }
    this.listeningForEstanque = true;
    this.listeningForCuadrante = false;
  }

  stopListening() {
    this.isConnected = false; // Detener la emisión de datos
    this.listeningForCuadrante = false;
    this.listeningForEstanque = false;

    // Cerrar la conexión WebSocket si no se está escuchando
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      console.log('Conexión WebSocket cerrada.');
    }
  }

  sendMessage(message: string) {
    if (this.isConnected) {
      this.socket.send(message);
    } else {
      console.warn('No está conectado al WebSocket.');
    }
  }
}
