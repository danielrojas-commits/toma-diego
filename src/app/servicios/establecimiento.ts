import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface EstablecimientoModel {
  _id?: string;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Establecimiento {
  private apiUrl = 'https://backend-registroformulario.onrender.com/api-backend-prueba/establecimiento';
  private http = inject(HttpClient);

  
    listarEstablecimientos(): Observable<EstablecimientoModel[]> {
      // Algunos backends exponen la lista bajo distintas rutas (/obtener, /listar, o en la raíz)
      const candidates = [
        `${this.apiUrl}/obtener`,
        `${this.apiUrl}/listar`,
        `${this.apiUrl}`
      ];

      const tryIndex = (i: number): Observable<EstablecimientoModel[]> => {
        if (i >= candidates.length) {
          return throwError(() => new Error('No se encontró una ruta válida para listar establecimientos'));
        }
        return this.http.get<EstablecimientoModel[]>(candidates[i]).pipe(
          catchError((err: any) => {
            // Si es 404, intentamos la siguiente candidate; si no, propagamos el error
            if (err?.status === 404) {
              return tryIndex(i + 1);
            }
            return throwError(() => err);
          })
        );
      };

      return tryIndex(0);
    }

 
  obtenerEstablecimientoPorId(id: string): Observable<EstablecimientoModel> {
    // Algunos backends exponen la búsqueda por id en rutas distintas.
    const candidates = [
      `${this.apiUrl}/${id}`,
      `${this.apiUrl}/obtener/${id}`,
      `${this.apiUrl}/buscar/${id}`,
      `${this.apiUrl}/obtener?id=${id}`,
      `${this.apiUrl}?id=${id}`
    ];

    const tryIndex = (i: number): Observable<EstablecimientoModel> => {
      if (i >= candidates.length) {
        return throwError(() => new Error('No se encontró una ruta válida para obtener establecimiento por id'));
      }
      return this.http.get<EstablecimientoModel>(candidates[i]).pipe(
        catchError((err: any) => {
          if (err?.status === 404) {
            return tryIndex(i + 1);
          }
          return throwError(() => err);
        })
      );
    };

    return tryIndex(0);
  }

  
  crearEstablecimiento(data: Partial<EstablecimientoModel>): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  
  actualizarEstablecimiento(id: string, data: Partial<EstablecimientoModel>): Observable<any> {
    // Intentar varias rutas y métodos para adaptarnos a distintas implementaciones del backend.
    const candidates: Array<() => Observable<any>> = [
      () => this.http.put(`${this.apiUrl}/editar/${id}`, data),
      () => this.http.put(`${this.apiUrl}/${id}`, data),
      () => this.http.patch(`${this.apiUrl}/${id}`, data),
      () => this.http.patch(`${this.apiUrl}/editar/${id}`, data),
      () => this.http.put(`${this.apiUrl}/actualizar/${id}`, data),
      () => this.http.post(`${this.apiUrl}/editar`, {...data, id}),
      () => this.http.post(`${this.apiUrl}/actualizar`, {...data, id}),
      () => this.http.post(`${this.apiUrl}/update`, {...data, id}),
      // último recurso: POST a la raíz con id en body
      () => this.http.post(`${this.apiUrl}`, {...data, id})
    ];

    const tryIndex = (i: number): Observable<any> => {
      if (i >= candidates.length) {
        return throwError(() => new Error('No se encontró una ruta válida para actualizar establecimiento'));
      }
      return candidates[i]().pipe(
        catchError((err: any) => {
          // Si es 404 o 405 (método no permitido) probamos la siguiente candidate
          if (err?.status === 404 || err?.status === 405) {
            return tryIndex(i + 1);
          }
          return throwError(() => err);
        })
      );
    };

    return tryIndex(0);
  }

 
  eliminarEstablecimiento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
