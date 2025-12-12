import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import { Establecimiento, EstablecimientoModel } from './establecimiento';
import { RutUtils } from './rut.utils';

@Injectable({ providedIn: 'root' })
export class BicicletaFlowService {
  private readonly LOCAL_IDENTIFICADOR_MAP: Record<string, string> = {
    'campus lincoyan': '690d03b8394c53154066b6e0',
    'campus puntanorte': '6917e8696768360d94dbd74a',
    'campus chinchorro': '69290d0937e2c40ae2d3ddfe',
    'lincoyan': '690d03b8394c53154066b6e0',
    'puntanorte': '6917e8696768360d94dbd74a',
    'chinchorro': '69290d0937e2c40ae2d3ddfe'
  };

  cleanRut(raw: string): string {
    return RutUtils.clean(raw);
  }

  formatRut(raw: string): string {
    return RutUtils.format(raw);
  }

  /**
   * Resolve an identificador value coming from a QR into a display name and an id (if possible).
   * Uses the provided `establecimientoService` to query remote data and falls back to a local map.
   */
  resolveIdentificador(id: string, establecimientoService: Establecimiento): Observable<{ name: string | null; id: string | null }> {
    if (!id) return of({ name: null, id: null });

    // If it's already an ObjectId-like string, try to fetch by id
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      return (establecimientoService as any).obtenerEstablecimientoPorId(id).pipe(
        map((est: EstablecimientoModel | null) => ({ name: est?.nombre ?? id, id: est?._id ?? id })),
        catchError(() => of({ name: id, id }))
      );
    }

    // Otherwise list establecimientos and try to match by normalized names
    return (establecimientoService as any).listarEstablecimientos().pipe(
      map((list: EstablecimientoModel[]) => {
        const normalize = (s?: string) => {
          if (!s) return '';
          // Use NFD + unicode range for diacritics which is broadly supported
          return s
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[-_]+/g, ' ')
            .replace(/[^a-z0-9 ]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };
        const target = normalize(id);

        let found = list.find(e => {
          const n = normalize((e as any)?.nombre);
          return n === target;
        });
        if (!found) {
          found = list.find(e => {
            const n = normalize((e as any)?.nombre);
            return n.includes(target) || target.includes(n);
          });
        }

        if (!found) {
          const localId = this.LOCAL_IDENTIFICADOR_MAP[target] || this.LOCAL_IDENTIFICADOR_MAP[id?.toLowerCase?.() ?? ''];
          if (localId) found = { _id: localId, nombre: id } as EstablecimientoModel;
        }

        if (found && (found as any)._id) return { name: (found as any).nombre ?? (found as any)._id, id: (found as any)._id };
        return { name: id, id: '' };
      }),
      catchError(() => of({ name: id, id: '' }))
    );
  }

  applyQrLockToControl(ctrl: AbstractControl | null | undefined, qrEstacionamiento: string | null | undefined) {
    if (!ctrl) return;
    if (qrEstacionamiento) {
      ctrl.patchValue(qrEstacionamiento, { emitEvent: false });
      ctrl.disable({ emitEvent: false, onlySelf: true });
    } else {
      ctrl.enable({ emitEvent: false, onlySelf: true });
    }
  }
}
