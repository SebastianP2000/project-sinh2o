// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrlLogin = 'http://localhost:3000/api/auth/login';
  private apiUrlRegister = 'http://localhost:3000/api/auth/register';
  private apiUrlcuadrante = 'http://localhost:3000/api/cuadrantes';
  private apiUrlestanques = 'http://localhost:3000/api/estanques';
  private apiUrlsensor = 'http://localhost:3000/api/sensor';

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
