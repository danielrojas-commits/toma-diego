import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn() {
    return this.loggedIn$.value;
  }

  getLoggedInObservable() {
    return this.loggedIn$.asObservable();
  }

  /**
   * Guarda el token si existe y marca el estado como autenticado.
   * Acepta token null si el backend no devuelve token, pero la respuesta indica éxito.
   */
  loginWithToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      // Aunque no haya token, si llamaron a este método asumimos que
      // el login fue exitoso y marcamos al usuario como autenticado.
      this.loggedIn$.next(true);
      return true;
    } catch (e) {
      console.warn('No se pudo guardar token', e);
      this.loggedIn$.next(true);
      return true;
    }
  }

  logout() {
    try {
      localStorage.removeItem('auth_token');
    } catch (e) {
      console.warn('No se pudo eliminar token', e);
    }
    this.loggedIn$.next(false);
  }

  private hasToken(): boolean {
    try {
      const t = localStorage.getItem('auth_token');
      return !!t;
    } catch (e) {
      return false;
    }
  }

}
