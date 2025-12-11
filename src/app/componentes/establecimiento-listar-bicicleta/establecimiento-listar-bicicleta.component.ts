import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Bicicleta } from '../../servicios/bicicleta';
import { Estudiante } from '../../servicios/estudiante';

@Component({
  selector: 'app-establecimiento-listar-bicicleta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './establecimiento-listar-bicicleta.component.html',
  styleUrls: ['./establecimiento-listar-bicicleta.component.css']
})
export class EstablecimientoListarBicicletaComponent implements OnInit {
  establecimientoId = '690d03b8394c53154066b6e0';
  selectedDate: string = '';
  bicicletas: any[] = [];
  // Lista normalizada para mostrar (ownerNombre, ownerApellido, ownerRut, ownerCorreo, fechaCreacion, fechaActualizacion)
  // Nueva propiedad para búsqueda por RUT
  rutSearch: string = '';
  // Identificadores disponibles
  identificadores: string[] = ['campus lincoyan', 'campus puntanorte', 'campus chinchorro'];
  selectedIdentificador: string = '';
  // Fecha desde / hasta para filtrar rango
  dateFrom: string = '';
  dateTo: string = '';
  // Fecha para búsqueda directa asociada al selector de identificador
  identificadorDate: string = '';
  // Mapas para asociar ids de establecimiento a identificadores (y viceversa)
  establecimientoIdToIdentificador: Record<string, string> = {
    '690d03b8394c53154066b6e0': 'campus lincoyan',
    '6917e8696768360d94dbd74a': 'campus puntanorte',
    '69290d0937e2c40ae2d3ddfe': 'campus chinchorro'
  };
  identificadorToEstablecimientoId: Record<string, string> = {
    'campus lincoyan': '690d03b8394c53154066b6e0',
    'campus puntanorte': '6917e8696768360d94dbd74a',
    'campus chinchorro': '69290d0937e2c40ae2d3ddfe'
  };
  // Resultado filtrado (se usa la misma lista `bicicletas` para mostrar)
  establecimiento: any = null;
  estudiantes: any[] = [];
  loading = false;
  error: string = '';
  showBicicletas = false;
  // Mostrar opciones inmediatamente al cargar el componente
  // (antes estaban ocultas y se mostraban al pulsar el botón)
  showOnInit = true;
  today: string = new Date().toISOString().split('T')[0];

  private location = inject(Location);

  private bicicletaService = inject(Bicicleta);
  private estudianteService = inject(Estudiante);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEstablecimientoInfo();
    if (this.showOnInit) this.showBicicletas = true;
  }

  loadEstablecimientoInfo(): void {
    this.http.get(`https://backend-registroformulario.onrender.com/api-backend-prueba/establecimiento/${this.establecimientoId}`)
      .subscribe({
        next: (data: any) => {
          this.establecimiento = data;
          this.estudiantes = data.estudiantes || [];
          // Asociar identificador conocido al establecimiento cargado
          const knownIdent = this.establecimientoIdToIdentificador[this.establecimientoId];
          if (knownIdent) {
            // Sólo asignar si no viene ya definido
            if (!this.establecimiento.identificador) {
              this.establecimiento.identificador = knownIdent;
            }
            // Asegurar que esté disponible en la lista de identificadores
            if (!this.identificadores.includes(knownIdent)) {
              this.identificadores = [knownIdent, ...this.identificadores];
            }
          }
        },
        error: (err) => {
          console.error('loadEstablecimientoInfo error', err);
          // Si el backend no encuentra el establecimiento, usar nuestro mapeo local como fallback
          if (err && err.status === 404) {
            const fallbackIdent = this.establecimientoIdToIdentificador[this.establecimientoId] || null;
            this.establecimiento = {
              _id: this.establecimientoId,
              identificador: fallbackIdent,
              estudiantes: []
            };
            this.estudiantes = [];
            this.error = `Establecimiento no encontrado en backend; usando identificador local${fallbackIdent ? ': ' + fallbackIdent : ''}.`;
            return;
          }
          this.error = 'Error loading establishment information';
          console.error(err);
        }
      });
  }

  cargarBicicletas(): void {
    if (!this.selectedDate) {
      this.error = 'Por favor selecciona una fecha';
      return;
    }

    this.loading = true;
    this.error = '';
    this.bicicletas = [];

    const formattedDate = this.formatDate(this.selectedDate);
    const apiUrl = `https://backend-registroformulario.onrender.com/api-backend-prueba/bicicleta/establecimiento/${this.establecimientoId}/fecha/${formattedDate}`;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        const raw = Array.isArray(data) ? data : data.data || [];
        this.bicicletas = this.normalizeBicicletas(raw);
        this.loading = false;

        if (this.bicicletas.length === 0) {
          this.error = 'No hay información de bicicletas para la fecha seleccionada';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar las bicicletas. Por favor intenta de nuevo.';
        console.error(err);
      }
    });
  }

  /** Buscar bicicletas por RUT del estudiante */
  buscarPorRut(): void {
    if (!this.rutSearch || this.rutSearch.trim() === '') {
      this.error = 'Por favor ingresa un RUT para buscar';
      return;
    }
    this.loading = true;
    this.error = '';
    this.bicicletas = [];
    this.bicicletaService.getBicicletaPorEstudianteRut(this.rutSearch.trim()).subscribe({
      next: (data: any) => {
        const raw = Array.isArray(data) ? data : data.data || [];

        // Para cada bicicleta, intentar obtener datos completos del estudiante por su RUT
        const observables = raw.map((b: any) => {
          const rut = (b.estudiante && b.estudiante.rut) || b.rut || this.rutSearch.trim();
          if (!rut) return of(null);
          return this.estudianteService.buscarPorRut(rut).pipe(
            catchError((_) => of(null))
          );
        });

        // Forzar tipo concreto: array de Observable<any>
        const requests: Observable<any>[] = observables as Observable<any>[];

        if (requests.length === 0) {
          this.bicicletas = this.normalizeBicicletas(raw);
          this.loading = false;
          this.showBicicletas = true;
          if (this.bicicletas.length === 0) this.error = 'No se encontraron bicicletas para el RUT proporcionado';
          return;
        }
        // Usar la sobrecarga de subscribe con funciones para evitar conflictos de tipos
        forkJoin<any[]>(requests).subscribe(
          (estudiantes: any[]) => {
            // fusionar datos obtenidos en cada bicicleta
            const merged = raw.map((b: any, idx: number) => {
              const est = estudiantes && estudiantes[idx] ? estudiantes[idx] : (b.estudiante || null);
              if (est) b.estudiante = { ...b.estudiante, ...est };
              return b;
            });
            this.bicicletas = this.normalizeBicicletas(merged);
            this.loading = false;
            this.showBicicletas = true;
            if (this.bicicletas.length === 0) this.error = 'No se encontraron bicicletas para el RUT proporcionado';
          },
          (e: any) => {
            console.error('Error al obtener estudiantes para las bicicletas', e);
            // aunque falle la obtención de estudiantes, normalizar y mostrar las bicicletas crudas
            this.bicicletas = this.normalizeBicicletas(raw);
            this.loading = false;
            this.showBicicletas = true;
            if (this.bicicletas.length === 0) this.error = 'No se encontraron bicicletas para el RUT proporcionado';
          }
        );
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error al buscar bicicletas por RUT';
      }
    });
  }

  /** Filtrar bicicletas por identificador (campus) */
  filtrarPorIdentificador(): void {
    if (!this.selectedIdentificador) {
      this.error = 'Selecciona un identificador';
      return;
    }
    this.loading = true;
    this.error = '';
    this.bicicletas = [];

    // Obtener todas las bicicletas y filtrar localmente por campo 'identificador' o por 'establecimiento'
    this.bicicletaService.listarBicicletas().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data.data || [];
        const key = this.selectedIdentificador.toLowerCase();
        const possibleEstabId = this.identificadorToEstablecimientoId[this.selectedIdentificador];
        const filtered = list.filter((b: any) => {
          const ident = (b.identificador || '').toString().toLowerCase();
          const est = (b.establecimiento || '').toString().toLowerCase();
          // Coincidencia por nombre de identificador o por campo establecimiento
          if ((ident && ident.includes(key)) || (est && est.includes(key))) return true;
          // Si existe una asociación identificador->establecimientoId, buscar coincidencias por ese id
          if (possibleEstabId) {
            const idStr = possibleEstabId.toString().toLowerCase();
            // Buscar en campos comunes y en toda la representación del objeto como respaldo
            if ((b._id && b._id.toString().toLowerCase().includes(idStr))
              || (b.establecimientoId && b.establecimientoId.toString().toLowerCase().includes(idStr))
              || JSON.stringify(b).toLowerCase().includes(idStr)) {
              return true;
            }
          }
          return false;
        });
        this.bicicletas = this.normalizeBicicletas(filtered);
        this.loading = false;
        this.showBicicletas = true;
        if (this.bicicletas.length === 0) {
          this.error = 'No se encontraron bicicletas para el identificador seleccionado';
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error al filtrar bicicletas por identificador';
      }
    });
  }

  /** Filtrar por identificador y una única fecha seleccionada */
  filtrarPorIdentificadorYFecha(): void {
    if (!this.selectedIdentificador) {
      this.error = 'Selecciona un identificador';
      return;
    }
    const dateToUse = this.identificadorDate || this.selectedDate;
    if (!dateToUse) {
      this.error = 'Selecciona una fecha (en el selector superior o en este control)';
      return;
    }

    this.loading = true;
    this.error = '';
    this.bicicletas = [];

    const possibleEstabId = this.identificadorToEstablecimientoId[this.selectedIdentificador];

    // Si tenemos el id del establecimiento, pedir directamente al endpoint por establecimiento+fecha
    if (possibleEstabId) {
      const apiUrl = `https://backend-registroformulario.onrender.com/api-backend-prueba/bicicleta/establecimiento/${possibleEstabId}/fecha/${dateToUse}`;
      this.http.get(apiUrl).subscribe({
        next: (data: any) => {
          const raw = Array.isArray(data) ? data : data.data || [];
          this.bicicletas = this.normalizeBicicletas(raw);
          this.loading = false;
          this.showBicicletas = true;
            if (this.bicicletas.length === 0) {
              this.error = 'No se encontraron bicicletas para el identificador y fecha seleccionados';
            }
        },
        error: (err) => {
          console.error('Error al obtener bicicletas por establecimiento+fecha', err);
          this.loading = false;
          this.error = 'Error al obtener bicicletas para la combinación seleccionada';
        }
      });
      return;
    }

    // Si no hay mapping a id, obtener todas y filtrar localmente por identificador y fecha
    this.bicicletaService.listarBicicletas().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data.data || [];

        function ymd(d: Date) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }

        const target = dateToUse;

        const filtered = list.filter((b: any) => {
          const ident = (b.identificador || '').toString().toLowerCase();
          const est = (b.establecimiento || '').toString().toLowerCase();
          const key = this.selectedIdentificador.toLowerCase();

          // comprobar coincidencia de identificador
          if (!((ident && ident.includes(key)) || (est && est.includes(key)))) return false;

          // comprobar fecha (campo fechaRegistro/createdAt/fecha)
          const registro = b.fechaRegistro || b.fecha || b.createdAt || b.created_at;
          if (!registro) return false;
          const registroYmd = ymd(new Date(registro));
          return registroYmd === target;
        });

        this.bicicletas = this.normalizeBicicletas(filtered);
        this.loading = false;
        this.showBicicletas = true;
        if (this.bicicletas.length === 0) {
          this.error = 'No se encontraron bicicletas para el identificador y fecha seleccionados';
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error al filtrar bicicletas por identificador y fecha';
      }
    });
  }

  /** Filtrar por identificador y rango de fechas (inclusive) */
  filtrarPorIdentificadorYRango(): void {
    if (!this.selectedIdentificador) {
      this.error = 'Selecciona un identificador';
      return;
    }
    if (!this.dateFrom || !this.dateTo) {
      this.error = 'Selecciona un rango de fechas (desde y hasta)';
      return;
    }

    const from = new Date(this.dateFrom);
    const to = new Date(this.dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
      this.error = 'Rango de fechas inválido';
      return;
    }

    this.loading = true;
    this.error = '';
    this.bicicletas = [];

    const possibleEstabId = this.identificadorToEstablecimientoId[this.selectedIdentificador];

    this.bicicletaService.listarBicicletas().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : data.data || [];
        function ymd(d: Date) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }

        const fromYmd = ymd(from);
        const toYmd = ymd(to);

        const filtered = list.filter((b: any) => {
          // Filtrar por identificador/establecimiento como antes
          const ident = (b.identificador || '').toString().toLowerCase();
          const est = (b.establecimiento || '').toString().toLowerCase();
          const key = this.selectedIdentificador.toLowerCase();

          let matchesIdent = false;
          if ((ident && ident.includes(key)) || (est && est.includes(key))) matchesIdent = true;

          if (!matchesIdent && possibleEstabId) {
            const idStr = possibleEstabId.toString().toLowerCase();
            if ((b._id && b._id.toString().toLowerCase().includes(idStr))
              || (b.establecimientoId && b.establecimientoId.toString().toLowerCase().includes(idStr))
              || JSON.stringify(b).toLowerCase().includes(idStr)) {
              matchesIdent = true;
            }
          }

          if (!matchesIdent) return false;

          // Filtrar por rango de fecha usando campo fechaRegistro (comparación por fecha YYYY-MM-DD)
          const registro = b.fechaRegistro || b.fecha || b.createdAt || b.created_at;
          if (!registro) return false;
          const registroDate = new Date(registro);
          if (isNaN(registroDate.getTime())) return false;

          const registroYmd = ymd(registroDate);
          // Comparación inclusiva: incluye la fecha 'to'
          return registroYmd >= fromYmd && registroYmd <= toYmd;
        });

        this.bicicletas = this.normalizeBicicletas(filtered);
        this.loading = false;
        this.showBicicletas = true;
        if (this.bicicletas.length === 0) {
          this.error = 'No se encontraron bicicletas para el identificador y rango seleccionado';
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error al filtrar bicicletas por identificador y rango de fechas';
      }
    });
  }

  formatDate(dateString: string): string {
    return dateString;
  }

  toggleBicicletas(): void {
    this.showBicicletas = !this.showBicicletas;
  }

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }

  /** Set selectedDate to today and load bikes */
  setToday(): void {
    this.selectedDate = this.today;
    this.cargarBicicletas();
  }

  /** Set selectedDate to yesterday and load bikes */
  setYesterday(): void {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    this.selectedDate = d.toISOString().split('T')[0];
    this.cargarBicicletas();
  }

  /** Normaliza los objetos de bicicleta para tener campos consistentes en la vista */
  private normalizeBicicletas(list: any[]): any[] {
    return (list || []).map((b: any) => {
      const estudiante = b.estudiante || {};
      const ownerNombre = (estudiante && (estudiante.nombre || estudiante.nombreCompleto)) || b.nombre || b.dueno || b.propietario || '';
      const ownerApellido = (estudiante && (estudiante.apellido)) || b.apellido || '';
      const ownerRut = (estudiante && estudiante.rut) || b.rut || '';
      const ownerCorreo = (estudiante && estudiante.correo) || b.correo || '';

      const fechaCreacion = b.fechaRegistro || b.createdAt || b.created_at || b.fecha || null;
      const fechaActualizacion = b.updatedAt || b.updated_at || null;

      return {
        ...b,
        ownerNombre,
        ownerApellido,
        ownerRut,
        ownerCorreo,
        fechaCreacion,
        fechaActualizacion
      };
    });
  }
}
