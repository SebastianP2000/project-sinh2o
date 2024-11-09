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

  constructor(private http: HttpClient) {}

  login(nombreusuario: string, contrasena: string): Observable<any> {
    return this.http.post(this.apiUrlLogin, {
      nombreusuario,
      contrasena,
    });
  }
  isAuthenticated(): boolean {
    // Lógica para determinar si el usuario está autenticado
    return !!localStorage.getItem('token'); // O la lógica que estés usando para manejar el token
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrlRegister, usuario);
  }

  getCuadrantes(): Observable<any> {
    return this.http.get(this.apiUrlcuadrante);
  }

  getEstanques(): Observable<any> {
    return this.http.get(this.apiUrlestanques);
  }

  getSensor(sector: string): Observable<any> {
    return this.http.get(`${this.apiUrlsensor}?sector=${sector}`);
  }

}
