import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';
import { Establecimiento, EstablecimientoModel } from '../../servicios/establecimiento';
import { RutUtils } from '../../servicios/rut.utils';

@Component({
  selector: 'app-bicicleta-estudiante-crear',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './bicicleta-estudiante-crear.html',
  styleUrl: './bicicleta-estudiante-crear.css'
})
export class BicicletaEstudianteCrear {

  // Inyección de servicios
  private estudianteService = inject(Estudiante);
  private bicicletaService = inject(Bicicleta);
  private establecimientoService = inject(Establecimiento);

  // Variables de control
  mensaje = '';
  estudianteEncontrado: EstudianteModel | null = null;
  bicicletasDelEstudiante: BicicletaModel[] = [];
  pasoActual: 'buscar' | 'registrarEstudiante' | 'registrarBicicleta' | 'opciones' = 'buscar';
  bicicletaSeleccionada: BicicletaModel | null = null;

  // Formulario para buscar estudiante
  rutForm = new FormGroup({
    rut: new FormControl<string>('', Validators.required)
  });

  // Formulario para registrar estudiante
  estudianteForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    rut: new FormControl<string>('', Validators.required),
    correo: new FormControl<string>('', [Validators.required, Validators.email])
  });

  // Formulario para registrar bicicleta
  bicicletaForm = new FormGroup({
    marca: new FormControl<string>('', Validators.required),
    modelo: new FormControl<string>(''),
    color: new FormControl<string>('', Validators.required),
    estacionamiento: new FormControl<string>('', Validators.required),
    // `identificador` mostrará el nombre legible (p.ej. 'Campus-Lincoyan')
    identificador: new FormControl<string>(''),
    // `identificadorId` guardará el _id real que requiere el backend (oculto)
    identificadorId: new FormControl<string>('')
  });

  // Datos obtenidos desde QR (query params)
  qrIdentificador: string | null = null;
  qrEstacionamiento: string | null = null;
  // Si resolvemos el identificador (nombre -> _id), guardamos el nombre para mostrar
  identificadorNombreResuelto: string | null = null;

  // Normaliza cadenas para comparación (quita tildes, signos, minusculas)
  private normalizeString(s: string | null | undefined): string {
    if (!s) return '';
    const withNoAccents = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return withNoAccents
      .toLowerCase()
      .replace(/[-_]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Mapa local de identificadores conocido (nombre normalizado -> _id)
  private readonly LOCAL_IDENTIFICADOR_MAP: Record<string, string> = {
    'campus lincoyan': '690d03b8394c53154066b6e0',
    'campus puntanorte': '6917e8696768360d94dbd74a',
    'campus chinchorro': '69290d0937e2c40ae2d3ddfe',
    // variantes comunes
    'lincoyan': '690d03b8394c53154066b6e0',
    'puntanorte': '6917e8696768360d94dbd74a',
    'chinchorro': '69290d0937e2c40ae2d3ddfe'
  };

  private route = inject(ActivatedRoute);

  // Leemos los query params (si el usuario llegó por un QR con estacionamiento/identificador)
  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.qrEstacionamiento = params.get('estacionamiento');
      this.qrIdentificador = params.get('identificador');
      // Si hay identificador/estacionamiento desde el QR, resolvemos e intentamos aplicar
      if (this.qrIdentificador) {
        this.resolveQrIdentificadorAndApply();
      } else {
        // Si sólo hubo estacionamiento, aplicar lock
        this.applyQrLock();
      }
    });
  }

  // ======================
  //  FLUJO PRINCIPAL
  // ======================

  buscarEstudiante() {
    const rut = this.rutForm.value.rut?.trim();
    if (!rut) return;
    // Cuando se introduce un RUT, si hay datos desde el QR, autocompletamos el formulario de bicicleta
    this.applyQrToBicicletaForm();

    this.estudianteService.buscarPorRut(rut).subscribe({
      next: (estudiante) => {
        this.estudianteEncontrado = estudiante;
        this.mensaje = `✅ Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`;
        this.obtenerBicicletasDeEstudiante(estudiante.rut);
      },
      error: () => {
        this.mensaje = '⚠️ Estudiante no encontrado. Debes registrarlo.';
        this.estudianteEncontrado = null;
        this.estudianteForm.patchValue({ rut });
        this.pasoActual = 'registrarEstudiante';
      }
    });
  }

  registrarEstudiante() {
    if (this.estudianteForm.invalid) {
      this.mensaje = '❌ Completa todos los campos para registrar estudiante.';
      return;
    }

    const nuevoEstudiante = this.estudianteForm.value as EstudianteModel;
    this.estudianteService.crearEstudiante(nuevoEstudiante).subscribe({
      next: (est) => {
        this.estudianteEncontrado = est;
        this.mensaje = '✅ Estudiante registrado correctamente.';
        this.pasoActual = 'registrarBicicleta';
        // Aplicar valores desde QR al mostrar el formulario de bicicleta
        this.applyQrToBicicletaForm();
      },
      error: () => (this.mensaje = '❌ Error al registrar estudiante.')
    });
  }

  obtenerBicicletasDeEstudiante(rut: string) {
    this.bicicletaService.getBicicletaPorEstudianteRut(rut).subscribe({
      next: (bicis) => {
        this.bicicletasDelEstudiante = bicis;
        if (bicis.length > 0) {
          this.mensaje = '⚠️ El estudiante ya tiene bicicletas registradas.';
          this.pasoActual = 'opciones';
          // aplicar valores del QR también cuando ya existen bicicletas
          this.applyQrToBicicletaForm();
        } else {
          this.pasoActual = 'registrarBicicleta';
          // Aplicar valores desde QR al mostrar el formulario de bicicleta
          this.applyQrToBicicletaForm();
        }
      },
      error: () => {
        this.bicicletasDelEstudiante = [];
        this.pasoActual = 'registrarBicicleta';
        this.applyQrToBicicletaForm();
      }
    });
  }

  // ======================
  //  SELECCIONAR BICICLETA EXISTENTE
  // ======================

  seleccionarBicicleta(bici: BicicletaModel) {
    this.bicicletaSeleccionada = bici;

    // Mostrar mensaje con contexto
    this.mensaje = `✅ Bicicleta seleccionada: ${bici.marca} - ${bici.color}. 
    Puedes registrar otra o cambiar el estacionamiento.`;

    // Ofrecer directamente la opción de modificar estacionamiento
    this.pasoActual = 'registrarBicicleta';

    // Precargamos los datos de la bici, dejando el campo estacionamiento vacío para que el alumno lo cambie
    const estacionamientoDesdeQr = this.qrEstacionamiento ?? '';
    this.bicicletaForm.patchValue({
      marca: bici.marca,
      modelo: bici.modelo,
      color: bici.color,
      estacionamiento: estacionamientoDesdeQr
    });
    // Aplicar lock/otros efectos del QR
    this.applyQrLock();
  }
  
  // ======================
  //  OPCIONES AL ENCONTRAR BICICLETAS
  // ======================

  registrarNuevaBicicleta() {
    this.bicicletaSeleccionada = null;
    this.bicicletaForm.reset();
    this.pasoActual = 'registrarBicicleta';
    // Reaplicar valores desde QR tras reset
    this.applyQrToBicicletaForm();
  }

  private applyQrToBicicletaForm() {
    // Para garantizar que identificador sea un ObjectId válido para el backend,
    // primero resolvemos qrIdentificador (si existe) y luego patch-eamos el formulario.
    if (this.qrIdentificador) {
      this.resolveQrIdentificadorAndApply();
    } else {
      const patch: any = {};
      if (this.qrEstacionamiento) patch.estacionamiento = this.qrEstacionamiento;
      if (Object.keys(patch).length > 0) {
        this.bicicletaForm.patchValue(patch);
        this.applyQrLock();
      }
    }
  }

  private resolveQrIdentificadorAndApply() {
    const id = this.qrIdentificador ?? '';
    // Si ya es un ObjectId (24 hex chars), usamos tal cual
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      // Intentamos obtener el nombre del establecimiento por id
      this.establecimientoService.obtenerEstablecimientoPorId(id).subscribe({
        next: (est) => {
          const name = est?.nombre ?? id;
          this.identificadorNombreResuelto = est?.nombre ?? null;
          this.bicicletaForm.patchValue({ identificador: name, identificadorId: id });
        },
        error: () => {
          // No se pudo obtener el establecimiento: dejamos el id visible y guardado
          this.bicicletaForm.patchValue({ identificador: id, identificadorId: id });
        }
      });
      return;
    }

    // Si viene como nombre (ej. 'campus-Lincoyan'), intentamos buscar el establecimiento
    this.establecimientoService.listarEstablecimientos().subscribe({
      next: (list) => {
        const targetNorm = this.normalizeString(id);
        let found = list.find(e => this.normalizeString(e.nombre) === targetNorm);
        if (!found) {
          // intentar coincidencias más flexibles
          found = list.find(e => this.normalizeString(e.nombre).includes(targetNorm) || targetNorm.includes(this.normalizeString(e.nombre)));
        }
        // Si no encontramos en la lista remota, intentar el mapa local conocido
        if (!found) {
          const localId = this.LOCAL_IDENTIFICADOR_MAP[targetNorm] || this.LOCAL_IDENTIFICADOR_MAP[id?.toLowerCase?.() ?? ''];
          if (localId) {
            found = { _id: localId, nombre: id } as EstablecimientoModel;
          }
        }
        if (found && found._id) {
          // Guardamos el nombre para mostrar y usamos el _id en el formulario
          this.identificadorNombreResuelto = found.nombre ?? null;
          this.bicicletaForm.patchValue({ identificador: found.nombre ?? found._id, identificadorId: found._id });
        } else {
          // No encontramos la coincidencia: dejamos el valor original (pero será inválido para el backend)
          console.warn('QR identificador no coincide con ningún establecimiento (nombre -> id)', id);
          this.bicicletaForm.patchValue({ identificador: id, identificadorId: '' });
        }
        // Aplicar estacionamiento y lock si corresponde
        if (this.qrEstacionamiento) {
          this.bicicletaForm.patchValue({ estacionamiento: this.qrEstacionamiento });
        }
        this.applyQrLock();
      },
      error: (err) => {
        console.error('Error al listar establecimientos para resolver identificador QR', err);
        // Fallback: aplicar lo que tengamos
        this.bicicletaForm.patchValue({ identificador: id, identificadorId: '' });
        if (this.qrEstacionamiento) this.bicicletaForm.patchValue({ estacionamiento: this.qrEstacionamiento });
        this.applyQrLock();
      }
    });
  }

  private applyQrLock() {
    const ctrl = this.bicicletaForm.get('estacionamiento');
    if (this.qrEstacionamiento) {
      // Patch value (in case not yet applied) and disable the control so user cannot modify
      ctrl?.patchValue(this.qrEstacionamiento);
      ctrl?.disable({ emitEvent: false, onlySelf: true });
    } else {
      // No QR estacionamiento: ensure enabled
      ctrl?.enable({ emitEvent: false, onlySelf: true });
    }
  }

  cambiarEstacionamiento(bici: BicicletaModel) {
    this.bicicletaSeleccionada = bici;
    this.bicicletaForm.patchValue({
      marca: bici.marca,
      modelo: bici.modelo,
      color: bici.color,
      estacionamiento: ''
    });
    this.mensaje = `🔄 Cambia el estacionamiento para la bicicleta ${bici.marca} (${bici.color})`;
    this.pasoActual = 'registrarBicicleta';
  }

  // ======================
  //  REGISTRO DE BICICLETA
  // ======================

  registrarBicicleta() {
    if (!this.estudianteEncontrado) {
      this.mensaje = '⚠️ Primero debe existir un estudiante válido.';
      return;
    }
    if (this.bicicletaForm.invalid) {
      this.mensaje = '❌ Completa todos los campos requeridos.';
      return;
    }

    // Usamos getRawValue() para incluir controles deshabilitados (ej. estacionamiento bloqueado por QR)
    const formValues = this.bicicletaForm.getRawValue();

    if (this.bicicletaSeleccionada && (this.bicicletaSeleccionada._id || (this.bicicletaSeleccionada as any).id)) {
      // Actualizar bicicleta existente
      const id = this.bicicletaSeleccionada._id ?? (this.bicicletaSeleccionada as any).id;
      // En actualizaciones, para crear el nuevo registro incluimos los campos mínimos que el backend suele requerir
      const payload: any = {
        rut: this.estudianteEncontrado.rut,
        marca: formValues.marca ?? this.bicicletaSeleccionada?.marca,
        modelo: formValues.modelo ?? this.bicicletaSeleccionada?.modelo,
        color: formValues.color ?? this.bicicletaSeleccionada?.color,
        estacionamiento: formValues.estacionamiento,
        // Usamos el nombre del identificador que está en el campo 'identificador' del formulario
        identificador: formValues.identificador
      };

      // Nuevo flujo: crear un registro nuevo con los datos actuales y eliminar el registro anterior.
      const createNewThenDelete = (payloadToSend: any, oldId: string) => {
        console.debug('[BicicletaEstudianteCrear] Creando nuevo registro con payload:', payloadToSend);
        this.bicicletaService.registrarBicicleta(payloadToSend).subscribe({
          next: (created: any) => {
            console.debug('[BicicletaEstudianteCrear] Creación exitosa, id creado:', created?._id ?? created?.id ?? created);
            // Al crear correctamente, intentamos eliminar el anterior
            console.debug('[BicicletaEstudianteCrear] Intentando eliminar registro anterior id:', oldId);
            this.bicicletaService.eliminarBicicleta(oldId).subscribe({
              next: () => {
                console.debug('[BicicletaEstudianteCrear] Eliminación exitosa del id anterior:', oldId);
                this.mensaje = '✅ Estacionamiento actualizado (registro nuevo creado y anterior eliminado).';
                const createdObj = created && (created._id || created.id) ? created : { ...payloadToSend, _id: created?._id ?? created?.id };
                this.openSuccessTab(createdObj, 'updated');
                this.reiniciarFlujo();
              },
              error: (delErr) => {
                console.error('Error eliminando registro anterior, pero creación OK', delErr);
                this.mensaje = '⚠️ Registro nuevo creado, pero no se pudo eliminar el registro anterior (revisa logs).';
                this.reiniciarFlujo();
              }
            });
          },
          error: (createErr) => {
            console.error('Error creando nuevo registro de bicicleta', createErr);
            this.mensaje = `❌ No fue posible crear el nuevo registro (status: ${createErr?.status ?? '??'}).`;
          }
        });
      };

      // Llamamos directamente al flujo de crear y eliminar, ya que el payload es simple.
      createNewThenDelete(payload, id);
    } else {
      const bicicletaPayload: any = {
        rut: this.estudianteEncontrado.rut,
        marca: formValues.marca,
        modelo: formValues.modelo,
        color: formValues.color,
        estacionamiento: formValues.estacionamiento,
        // Usamos el nombre del identificador que está en el campo 'identificador' del formulario
        identificador: formValues.identificador
      };
      this.bicicletaService.registrarBicicleta(bicicletaPayload).subscribe({
        next: () => {
          this.mensaje = '✅ Bicicleta registrada correctamente.';
          this.reiniciarFlujo();
        },
        error: (err) => {
          console.error('Error registrar bicicleta', err);
          this.mensaje = `❌ Error al registrar bicicleta (status: ${err?.status ?? '??'})`;
        }
      });
    }
  }

  reiniciarFlujo() {
    this.bicicletaForm.reset();
    this.rutForm.reset();
    this.estudianteEncontrado = null;
    this.bicicletasDelEstudiante = [];
    this.pasoActual = 'buscar';
  }

  // Abre una nueva pestaña mostrando los datos de la bicicleta creada/actualizada
  private openSuccessTab(payload: any, action: 'created' | 'updated' = 'created') {
    const params = new URLSearchParams();
    params.set('action', action);
    if (payload._id) params.set('id', payload._id);
    if (payload.id) params.set('id', payload.id);
    if (payload.rut) params.set('rut', payload.rut);
    if (payload.marca) params.set('marca', payload.marca);
    if (payload.modelo) params.set('modelo', payload.modelo ?? '');
    if (payload.color) params.set('color', payload.color);
    if (payload.estacionamiento) params.set('estacionamiento', payload.estacionamiento);
    if (payload.identificador) params.set('identificador', payload.identificador);
    const url = `${window.location.origin}/bicicleta-exito?${params.toString()}`;
    window.open(url, '_blank');
  }

  // ------------------ RUT helpers (sanitizar y formatear) ------------------
  /** Sanitize input for the rutForm (buscar) */
  sanitizeRutInputRutForm(): void {
    const control = this.rutForm.get('rut');
    if (!control) return;
    const raw = (control.value || '').toString();
    const cleaned = RutUtils.clean(raw);
    
    if (cleaned !== raw) {
      control.setValue(cleaned, { emitEvent: false });
    }

    if (cleaned.length === 9 || cleaned.length === 10) {
      const formatted = RutUtils.format(cleaned);
      control.setValue(formatted, { emitEvent: false });
    }
  }

  /** Format rut for rutForm on blur */
  formatRutIfNeededRutForm(): void {
    const control = this.rutForm.get('rut');
    if (!control) return;
    const raw = (control.value || '').toString();
    const formatted = RutUtils.format(raw);
    if (formatted) {
      control.setValue(formatted, { emitEvent: false });
    }
  }

  /** Sanitize input for the estudianteForm.rut */
  sanitizeRutInputEstudiante(): void {
    const control = this.estudianteForm.get('rut');
    if (!control) return;
    const raw = (control.value || '').toString();
    const cleaned = RutUtils.clean(raw);
    
    if (cleaned !== raw) {
      control.setValue(cleaned, { emitEvent: false });
    }

    if (cleaned.length === 9 || cleaned.length === 10) {
      const formatted = RutUtils.format(cleaned);
      control.setValue(formatted, { emitEvent: false });
    }
  }

  /** Format rut for estudianteForm on blur */
  formatRutIfNeededEstudiante(): void {
    const control = this.estudianteForm.get('rut');
    if (!control) return;
    const raw = (control.value || '').toString();
    const formatted = RutUtils.format(raw);
    if (formatted) {
      control.setValue(formatted, { emitEvent: false });
    }
  }
}
