import { Injectable, inject } from '@angular/core';
// Para llamadas HTTP
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface AccesoModel {
  _id?: string;
  usuario?: string;
  // Campos genéricos — ajustar según el backend si hay más campos
  fecha?: Date;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Acceso {
  // Endpoint base para el servicio de acceso
  private apiUrl = 'https://backend-registroformulario.onrender.com/api-backend-prueba/acceso';
  private http = inject(HttpClient);

  /** Listar todos los accesos */
  listarAccesos(): Observable<AccesoModel[]> {
    return this.http.get<AccesoModel[]>(`${this.apiUrl}/obtener`);
  }

  /** Obtener un acceso por su id (si existe esa ruta en el backend) */
  obtenerAccesoPorId(id: string): Observable<AccesoModel> {
    return this.http.get<AccesoModel>(`${this.apiUrl}/${id}`);
  }

  /** Crear un nuevo registro de acceso */
  crearAcceso(data: Partial<AccesoModel>): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  /** Actualizar datos de un acceso por id */
  actualizarAcceso(id: string, data: Partial<AccesoModel>): Observable<any> {
    // Algunos backends pueden exponer diferentes rutas para actualizar:
    // - PUT /editar/:id
    // - PUT /:id
    // - PATCH /:id
    // Hacemos un intento por orden y si recibimos 404 probamos la siguiente variante.
    const attemptEditar = () => this.http.put(`${this.apiUrl}/editar/${id}`, data);
    const attemptById = () => this.http.put(`${this.apiUrl}/${id}`, data);
    const attemptPatch = () => this.http.patch(`${this.apiUrl}/${id}`, data);

    return attemptEditar().pipe(
      catchError((err: any) => {
        // Si es 404, intentar la siguiente forma
        if (err?.status === 404) {
          return attemptById().pipe(
            catchError((err2: any) => {
              if (err2?.status === 404) {
                // último recurso: PATCH
                return attemptPatch();
              }
              return throwError(() => err2);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  /** Iniciar sesión (login) */
  login(correo: string, password: string): Observable<any> {
    const payload = { correo, password };
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  /** Eliminar acceso por id */
  eliminarAcceso(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
