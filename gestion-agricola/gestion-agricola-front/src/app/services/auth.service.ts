// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrlLogin = `${environment.apiUrl}/auth/login`;
  private apiUrlRegister = `${environment.apiUrl}/auth/register`;
  private apiUrlcuadrante = `${environment.apiUrl}/cuadrantes`;
  private apiUrlestanques = `${environment.apiUrl}/estanques`;
  private apiUrlsensor = `${environment.apiUrl}/sensor`;
  private apiUrluser = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Métodos de autenticación
  login(nombreusuario: string, contrasena: string): Observable<any> {
    return this.http.post(this.apiUrlLogin, {
      nombreusuario,
      contrasena,
    });
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); 
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrlRegister, usuario);
  }

  // Métodos de usuario 
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrluser);
  }

  updateUser(id: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrluser}/usuarios/${id}`, usuario);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrluser}/usuarios/${id}`);
  }

  // Métodos de cuadrantes
  getCuadrantes(): Observable<any> {
    return this.http.get(this.apiUrlcuadrante);
  }

  updateCuadrante(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrlcuadrante}/${id}`, data);
  }
  

  // Métodos de estanques
  getEstanques(): Observable<any> {
    return this.http.get(this.apiUrlestanques);
  }

  // Métodos de sensores
  getSensores(sector: string): Observable<any> {
    return this.http.get(`${this.apiUrlsensor}?sector=${sector}`);
  }

  asignarSensor(idSensor: string, sector: string): Observable<any> {
    return this.http.put(`${this.apiUrlsensor}/asignarSensor/${idSensor}`, { sector });
  }

  quitarSensor(idSensor: string): Observable<any> {
    return this.http.put(`${this.apiUrlsensor}/quitarSensor/${idSensor}`, { identificador: null });
  }

  getSensoresNoAsignados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlsensor}/noAsignados`);
  }
}
