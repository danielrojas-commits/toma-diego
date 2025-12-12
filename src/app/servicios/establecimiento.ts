import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
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
  // Fallback local conocido para evitar 404s repetidos y resolver identificadores QR
  private readonly FALLBACK_ESTABLECIMIENTOS: EstablecimientoModel[] = [
    { _id: '690d03b8394c53154066b6e0', nombre: 'Campus Lincoyan' },
    { _id: '6917e8696768360d94dbd74a', nombre: 'Campus Puntanorte' },
    { _id: '69290d0937e2c40ae2d3ddfe', nombre: 'Campus Chinchorro' }
  ];

  
    listarEstablecimientos(): Observable<EstablecimientoModel[]> {
      // Algunos backends exponen la lista bajo distintas rutas (/obtener, /listar, o en la raíz)
      const candidates = [
        `${this.apiUrl}/obtener`,
        `${this.apiUrl}/listar`,
        `${this.apiUrl}`
      ];

      const tryIndex = (i: number): Observable<EstablecimientoModel[]> => {
        if (i >= candidates.length) {
            // Si ninguna ruta funciona, devolver lista fallback para que la UI pueda seguir funcionando
            return of(this.FALLBACK_ESTABLECIMIENTOS.slice());
        }
        return this.http.get<EstablecimientoModel[]>(candidates[i]).pipe(
          catchError((err: any) => {
            // Si es 404, intentamos la siguiente candidate; si no, propagamos el error
            if (err?.status === 404) {
              return tryIndex(i + 1);
            }
            // En caso de otros errores (timeout, CORS, 500), devolvemos fallback también
            return of(this.FALLBACK_ESTABLECIMIENTOS.slice());
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
        // Devolver desde fallback si no encontramos ruta
        const found = this.FALLBACK_ESTABLECIMIENTOS.find(e => e._id === id);
        if (found) return of(found);
        return throwError(() => new Error('No se encontró una ruta válida para obtener establecimiento por id'));
      }
      return this.http.get<EstablecimientoModel>(candidates[i]).pipe(
        catchError((err: any) => {
          if (err?.status === 404) {
            return tryIndex(i + 1);
          }
          // Si error distinto, intentar devolver fallback si existe
          const found = this.FALLBACK_ESTABLECIMIENTOS.find(e => e._id === id);
          if (found) return of(found);
          return throwError(() => err);
        })
      );
    };

    return tryIndex(0);
  }

  obtenerEstablecimientoPorIdentificador(identificador: string): Observable<EstablecimientoModel> {
    // Intentamos varias rutas posibles que pueden exponer búsqueda por identificador
    const candidates = [
      `${this.apiUrl}/obtener-por-identificador/${identificador}`,
      `${this.apiUrl}/identificador/${identificador}`,
      `${this.apiUrl}/obtener?identificador=${identificador}`,
      `${this.apiUrl}?identificador=${identificador}`
    ];

    const tryIndex = (i: number): Observable<EstablecimientoModel> => {
      if (i >= candidates.length) {
        // fallback: intentar buscar en la lista local por _id o por nombre/identificador
        const foundByIdent = this.FALLBACK_ESTABLECIMIENTOS.find(e => {
          if (!e) return false;
          // comparar contra identificador y nombre en minúsculas
          const nombre = (e['identificador'] ?? e.nombre ?? '').toString().toLowerCase();
          return nombre === identificador.toLowerCase();
        });
        if (foundByIdent) return of(foundByIdent);
        return throwError(() => new Error('No se encontró una ruta válida para obtener establecimiento por identificador'));
      }
      return this.http.get<EstablecimientoModel>(candidates[i]).pipe(
        catchError((err: any) => {
          if (err?.status === 404) {
            return tryIndex(i + 1);
          }
          const foundByIdent = this.FALLBACK_ESTABLECIMIENTOS.find(e => {
            const nombre = (e['identificador'] ?? e.nombre ?? '').toString().toLowerCase();
            return nombre === identificador.toLowerCase();
          });
          if (foundByIdent) return of(foundByIdent);
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
