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
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 5; // Limite de intentos de reconexión

  constructor() {}

  private connect() {
    const wsUrl = environment.production ? 'wss://project-sinh2o.onrender.com' : 'ws://localhost:3000';
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('Conectado al servidor WebSocket');
      this.isConnected = true;
      this.reconnectionAttempts = 0; // Restablecer el contador de intentos
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Datos recibidos del WebSocket:', data);
  
      if (data && data.estanques && data.sensores) {
        this.estanques = data.estanques;
        this.sensores = data.sensores;

        this.emitData();
      } else {
        console.error('Datos inválidos recibidos:', data);
      }
    };

    this.socket.onclose = () => {
      console.log('Conexión cerrada, intentando reconectar...');
      this.isConnected = false;
      if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
        this.reconnectionAttempts++;
        setTimeout(() => this.connect(), 1000);
      } else {
        console.warn('Máximo número de intentos de reconexión alcanzado');
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };
  }

  private emitData() {
    if (this.isConnected) {
      this.estanques.forEach((estanque) => {
        if (this.listeningForEstanque) {
          this.datosSubject.next(estanque);
        }
      });

      this.sensores.forEach((sensor) => {
        if (sensor.identificador && this.listeningForCuadrante) {
          this.datosSubject.next(sensor);
        }
      });
    }
  }

  startListeningForCuadrante() {
    this.listeningForCuadrante = true;
    this.listeningForEstanque = false;
    if (!this.isConnected) {
      this.connect(); // Conectar si no estamos conectados
    }
  }

  startListeningForEstanque() {
    this.listeningForEstanque = true;
    this.listeningForCuadrante = false;
    if (!this.isConnected) {
      this.connect(); // Conectar si no estamos conectados
    }
  }

  stopListening() {
    this.isConnected = false;
    this.listeningForCuadrante = false;
    this.listeningForEstanque = false;

    // Cerrar la conexión solo si no estamos escuchando
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      console.log('Conexión WebSocket cerrada.');
    }
  }

  sendMessage(message: string) {
    this.checkConnection(() => {
      this.socket.send(message);
    });
  }

  sendUpdatedCuadranteData(cuadrante: any): void {
    this.checkConnection(() => {
      const message = {
        type: 'cuadranteActualizado',
        cuadrante: cuadrante,
      };
      this.socket.send(JSON.stringify(message));
      console.log('Enviado al WebSocket:', message);
    });
  }

  private checkConnection(callback: () => void) {
    if (this.isConnected) {
      callback();
    } else {
      console.warn('No está conectado al WebSocket. Intentando reconectar...');
      // Intentar reconectar con un retraso
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
          this.checkConnection(callback);  // Volver a comprobar la conexión después de intentar reconectar
        }
      }, 1000);
    }
  }
}