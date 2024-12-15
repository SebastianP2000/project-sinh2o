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
  private apiUrlsensor = `${environment.apiUrl}/sensores`;
  private apiUrluser = `${environment.apiUrl}/auth`;
  private apiUrlHistorial = `${environment.apiUrl}/historial`;
  private apiUrlPredicciones = `${environment.apiUrl}/prediction`;

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

  crearCuadrante(cuadrante: any): Observable<any> {
    return this.http.post(`${this.apiUrlcuadrante}/crear`, cuadrante);
  }

  deleteCuadrante(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrlcuadrante}/${id}`);
  }
  
  //Metodos de historial
  getHistoriales(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlHistorial);
  }

  // Métodos de estanques
  getEstanques(): Observable<any> {
    return this.http.get(this.apiUrlestanques);
  }

  // Métodos de sensores

  getSensores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlsensor);
  }

  getSensoresPorSector(sector: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlsensor}?sector=${sector}`);
  }

  asignarSensor(idSensor: string, sector: string): Observable<any> {
    return this.http.put(`${this.apiUrlsensor}/asignarSensor/${idSensor}`, { identificador: sector });
  }

  quitarSensor(idSensor: string): Observable<any> {
    return this.http.put(`${this.apiUrlsensor}/quitarSensor/${idSensor}`, { identificador: null });
  }

  getSensoresNoAsignados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlsensor}/noAsignados`);
  }

  // Métodos de predicciones

  getPredictionsTH(): Observable<any> {
    return this.http.post(`${this.apiUrlPredicciones}/predictTH`, {});
  }

  getPredictionsW(): Observable<any> {
    return this.http.post(`${this.apiUrlPredicciones}/predictW`, {});
  }
}
