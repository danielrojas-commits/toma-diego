import { Injectable, inject  } from '@angular/core';
//Nuevo agregado
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface BicicletaModel {
  _id?: string;
  marca: string;
  modelo: string;
  color: string;
  estacionamiento: string;
  identificador?: string;
  establecimiento?: string;
  fechaRegistro?: Date;
  rut?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class Bicicleta {
  
  private apiUrl = 'https://backend-registroformulario.onrender.com/api-backend-prueba/bicicleta'; //Esta es la ruta del backend y /estudiante es el servicio disponible especialmente para estudiante. Ver documentación
  private http = inject(HttpClient);

  getBicicletaPorEstudianteRut(rut:string): Observable<BicicletaModel[]> {
    return this.http.get<BicicletaModel[]>(`${this.apiUrl}/estudiante/${rut}`);
  }

  /** 🔹 Registrar una nueva bicicleta (por RUT de estudiante) */
  registrarBicicleta(data: {
    rut: string;
    marca: string;
    modelo?: string;
    color: string;
    estacionamiento: string;
  }): Observable<any> {
    const primaryUrl = `${this.apiUrl}/registrar`;
    console.debug('[Bicicleta.service] registrarBicicleta primary', primaryUrl, data);
    // Generar variantes de body intentando distintas combinaciones de nombres de campo
    const generateVariants = (base: any): any[] => {
      const out: any[] = [];
      const estacionamiento = base.estacionamiento;
      const estacionamientoNumMatch = ('' + estacionamiento).match(/^A(\d+)$/i);
      const estacionamientoNum = estacionamientoNumMatch ? String(Number(estacionamientoNumMatch[1])) : null;

      // formas de campo para el estudiante
      const studentKeys = [
        { k: 'rut', wrap: false },
        { k: 'rut_estudiante', wrap: false },
        { k: 'estudianteRut', wrap: false },
        { k: 'estudianteId', wrap: false },
        { k: 'estudiante_id', wrap: false },
        { k: 'ownerRut', wrap: false },
        { k: 'owner_id', wrap: false },
        { k: 'estudiante', wrap: true } // objeto { estudiante: { rut: ... } }
      ];

      // formas de campo para identificador/establecimiento
      const identKeys = [
        (id: any) => ({ identificador: id }),
        (id: any) => ({ identificadorId: id }),
        (id: any) => ({ establecimiento: id }),
        (id: any) => ({ establecimientoId: id })
      ];

      // base candidate
      const baseCandidate = { ...base };
      // remove undefined fields
      Object.keys(baseCandidate).forEach(k => baseCandidate[k] === undefined && delete baseCandidate[k]);

      for (const sk of studentKeys) {
        let studentForms: any[] = [];
        if (sk.wrap) {
          studentForms.push({ estudiante: { rut: base.rut } });
        } else {
          const obj: any = {};
          obj[sk.k] = base.rut;
          studentForms.push(obj);
        }

        for (const sf of studentForms) {
          // identificador forms: if base has identificador, try both name and id
          const identVals = [] as any[];
          if ((base as any).identificador) identVals.push((base as any).identificador);
          if ((base as any).identificadorId) identVals.push((base as any).identificadorId);
          if (identVals.length === 0) identVals.push(undefined);

          for (const identVal of identVals) {
            const identForms = identVal === undefined ? [() => ({})] : identKeys.map(fn => (id: any) => fn(id));
            const identFns = identVal === undefined ? [() => ({})] : identForms.map((f: any) => ( () => f(identVal) ));

            for (const identFn of identFns) {
              // build candidate
              const candidate: any = { ...baseCandidate };
              // remove original rut to avoid duplication
              delete candidate.rut;
              Object.assign(candidate, sf);
              Object.assign(candidate, identFn());
              // estacionamiento variants
              out.push({ ...candidate });
              if (estacionamientoNum) out.push({ ...candidate, estacionamiento: estacionamientoNum, estacionamientoNumero: Number(estacionamientoNum) });
              // with fechaRegistro
              out.push({ ...candidate, fechaRegistro: new Date().toISOString() });
            }
          }
        }
      }

      // Ensure uniqueness by JSON key
      const uniq: any[] = [];
      const seen = new Set<string>();
      for (const o of out) {
        const key = JSON.stringify(o);
        if (!seen.has(key)) { seen.add(key); uniq.push(o); }
      }
      return uniq;
    };

    const variants: Array<any> = generateVariants(data);

    const tryVariant = (i: number): Observable<any> => {
      if (i >= variants.length) {
        // Ninguna variante funcionó en /registrar -> intentar POST a la raíz
        console.warn('[Bicicleta.service] todas las variantes en /registrar fallaron, intentando POST a la raíz');
        return this.http.post(`${this.apiUrl}`, data).pipe(
          catchError((e: any) => {
            console.error('[Bicicleta.service] registrar fallback failed', e, e?.error);
            return throwError(() => e);
          })
        );
      }
      const body = variants[i];
      console.debug('[Bicicleta.service] intentando POST /registrar con variante', i, body);
      return this.http.post(primaryUrl, body).pipe(
        catchError((err: any) => {
          console.warn('[Bicicleta.service] variante /registrar falló', i, err?.status);
          // Log del detalle para facilitar diagnóstico
          console.error('[Bicicleta.service] detalle error servidor:', err?.error ?? err);

          // Si recibe 400/422, seguir probando variantes porque puede faltar campo concreto
          if (err?.status === 400 || err?.status === 422) {
            return tryVariant(i + 1);
          }

          // Si endpoint no existe, intentar POST a la raíz
          if (err?.status === 404) {
            console.warn('[Bicicleta.service] /registrar no existe (404), intentando POST a la raíz');
            return this.http.post(`${this.apiUrl}`, data).pipe(
              catchError((e: any) => {
                console.error('[Bicicleta.service] registrar fallback failed', e, e?.error);
                return throwError(() => e);
              })
            );
          }
          return throwError(() => err);
        })
      );
    };

    return tryVariant(0);
  }

  

  listarBicicletas(): Observable<BicicletaModel[]> {
    return this.http.get<BicicletaModel[]>(`${this.apiUrl}/listar`);
  }

 
  actualizarBicicleta(id: string, data: Partial<BicicletaModel>): Observable<any> {
    const candidatesInfo: Array<{ method: string; url: string; includeIdInBody?: boolean }> = [
      { method: 'PUT', url: `${this.apiUrl}/editar/${id}` },
      { method: 'PUT', url: `${this.apiUrl}/${id}` },
      { method: 'PATCH', url: `${this.apiUrl}/${id}` },
      { method: 'PATCH', url: `${this.apiUrl}/editar/${id}` },
      { method: 'PUT', url: `${this.apiUrl}/actualizar/${id}` },
      { method: 'POST', url: `${this.apiUrl}/editar`, includeIdInBody: true },
      { method: 'POST', url: `${this.apiUrl}/actualizar`, includeIdInBody: true },
      { method: 'POST', url: `${this.apiUrl}/update`, includeIdInBody: true },
      { method: 'POST', url: `${this.apiUrl}`, includeIdInBody: true }
    ];
    
    const bodyVariants: Array<any> = [];
    const baseBody = infoBody(data, false);
    bodyVariants.push(baseBody);

   
    const estacionamientoVal = (data as any)?.estacionamiento;
    if (typeof estacionamientoVal === 'string') {
      const m = estacionamientoVal.match(/^A(\d+)$/i);
      if (m) {
        const num = m[1];
    
        bodyVariants.push(infoBody({ ...data, estacionamiento: num }, false));
      
        bodyVariants.push(infoBody({ ...data, estacionamiento: num, estacionamientoNumero: Number(num) }, false));
      }
    }

  
    function infoBody(payload: any, includeIdInBodyFlag: boolean) {
      return includeIdInBodyFlag ? { ...payload, id } : payload;
    }

    const tryIndex = (i: number): Observable<any> => {
      if (i >= candidatesInfo.length) {
        return throwError(() => new Error('No se encontró una ruta válida para actualizar bicicleta'));
      }

      const info = candidatesInfo[i];

      // Intentar cada variante de body en este endpoint antes de pasar al siguiente
      const tryBodyVariant = (j: number): Observable<any> => {
        if (j >= bodyVariants.length) {
          // Ninguna variante funcionó en este endpoint -> probar siguiente endpoint
          return tryIndex(i + 1);
        }
        const rawBody = bodyVariants[j];
        const body = info.includeIdInBody ? { ...rawBody, id } : rawBody;
        console.debug(`[Bicicleta.service] Intentando actualización (${info.method}) ${info.url}`, body);
        return this.http.request(info.method, info.url, { body }).pipe(
          catchError((err: any) => {
            console.warn(`[Bicicleta.service] Falló candidate (${info.method}) ${info.url} con variante ${j}:`, err?.status);
            // Si endpoint no existe o método no permitido, saltar inmediatamente al siguiente endpoint
            if (err?.status === 404 || err?.status === 405) {
              return tryIndex(i + 1);
            }
            // Si error 500, intentar siguiente variante de body en el mismo endpoint
            if (err?.status === 500) {
              return tryBodyVariant(j + 1);
            }
            return throwError(() => err);
          })
        );
      };

      return tryBodyVariant(0);
    };

    return tryIndex(0);
  }

  /**  Eliminar bicicleta por ID */

  eliminarBicicleta(id: string): Observable<any> {
    const primary = `${this.apiUrl}/${id}`;
    const fallback = `${this.apiUrl}/eliminar/${id}`;
    console.debug('[Bicicleta.service] eliminarBicicleta primary', primary);
    return this.http.delete(primary).pipe(
      catchError((err: any) => {
        console.warn('[Bicicleta.service] eliminar primary failed', err?.status, 'trying fallback delete');
        return this.http.delete(fallback).pipe(
          catchError((e: any) => {
            console.error('[Bicicleta.service] eliminar fallback failed', e);
            return throwError(() => e);
          })
        );
      })
    );
  }

  
  actualizarEnRaiz(id: string, data: Partial<BicicletaModel>): Observable<any> {
    const body = { ...data, id };
    console.debug('[Bicicleta.service] actualizarEnRaiz POST', this.apiUrl, body);
    return this.http.post(`${this.apiUrl}`, body);
  }

}
