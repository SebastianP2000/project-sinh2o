import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  public datosSubject: Subject<any> = new Subject<any>();

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
  
      // Verifica que los datos sean un array
      if (Array.isArray(data)) {
          data.forEach(estanque => {
              if (estanque && estanque.capacidad_actual !== undefined) { // Verifica cada estanque
                  console.log('Datos válidos recibidos:', estanque);
                  this.datosSubject.next(estanque); // Emitir los datos de cada estanque si son válidos
              } else {
                  console.error('Datos inválidos recibidos para un estanque:', estanque);
              }
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



