import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';

@Component({
  selector: 'app-bicicleta-crear',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './bicicleta-crear.html',
  styleUrl: './bicicleta-crear.css'
})
export class BicicletaCrear {

  // Inyección de servicios
  private estudianteService = inject(Estudiante);
  private bicicletaService = inject(Bicicleta);
  private location = inject(Location);

  // Variables de control
  mensaje: { text: string; type: 'success' | 'error' | 'warning' } | null = null;
  estudianteEncontrado: EstudianteModel | null = null;
  bicicletasDelEstudiante: BicicletaModel[] = [];
  pasoActual: 'buscar' | 'registrarEstudiante' | 'registrarBicicleta' | 'opciones' | 'exito' = 'buscar';
  bicicletaDeExito: BicicletaModel | null = null; // Para guardar los datos de la bici en el paso de éxito
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
    identificador: new FormControl<string>('')
  });

  // QR generator state
  qrNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  qrSelection = 'A1';
  qrIdentificadores = ['Campus-Lincoyan', 'Campus-Chinchorro', 'Campus-PuntaNorte'];
  qrIdentificador = this.qrIdentificadores[0];
  qrImageUrl: string | null = null;
  targetUrl: string | null = null;

  // ======================
  //  FLUJO PRINCIPAL
  // ======================

  buscarEstudiante() {
    const rut = this.rutForm.value.rut?.trim();
    if (!rut) return;

    this.estudianteService.buscarPorRut(rut).subscribe({
      next: (estudiante) => {
        this.estudianteEncontrado = estudiante;
        this.mensaje = { text: `Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`, type: 'success' };
        this.obtenerBicicletasDeEstudiante(estudiante.rut);
      },
      error: () => {
        this.estudianteEncontrado = null;
        this.mensaje = { text: 'Estudiante no encontrado. Debes registrarlo.', type: 'warning' };
        this.estudianteForm.patchValue({ rut });
        this.pasoActual = 'registrarEstudiante';
      }
    });
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }

  registrarEstudiante() {
    if (this.estudianteForm.invalid) {
      this.mensaje = { text: 'Completa todos los campos para registrar estudiante.', type: 'error' };
      return;
    }

    const nuevoEstudiante = this.estudianteForm.value as EstudianteModel;
    this.estudianteService.crearEstudiante(nuevoEstudiante).subscribe({
      next: (est) => {
        this.mensaje = { text: 'Estudiante registrado correctamente. Verificando...', type: 'success' };
        // Inmediatamente después de crear, buscamos de nuevo para confirmar que existe
        // y para obtener el objeto completo desde el backend.
        this.buscarEstudiantePorRut(est.rut);
      },
      error: () => (this.mensaje = { text: 'Error al registrar estudiante.', type: 'error' })
    });
  }

  obtenerBicicletasDeEstudiante(rut: string) {
    this.bicicletaService.getBicicletaPorEstudianteRut(rut).subscribe({
      next: (bicis) => {
        this.bicicletasDelEstudiante = bicis;
        if (bicis.length > 0) {
          this.mensaje = { text: 'El estudiante ya tiene bicicletas registradas.', type: 'warning' };
          this.pasoActual = 'opciones';
        } else {
          this.pasoActual = 'registrarBicicleta';
        }
      },
      error: () => {
        this.bicicletasDelEstudiante = [];
        this.pasoActual = 'registrarBicicleta';
      }
    });
  }

  /**
   * Helper para buscar un estudiante por RUT y manejar los siguientes pasos.
   * Reutiliza la lógica de `buscarEstudiante` pero se puede llamar directamente.
   */
  private buscarEstudiantePorRut(rut: string) {
    this.estudianteService.buscarPorRut(rut).subscribe({
      next: (estudiante) => {
        this.estudianteEncontrado = estudiante;
        this.mensaje = { text: `Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`, type: 'success' };
        this.obtenerBicicletasDeEstudiante(estudiante.rut);
      },
      error: () => {
        this.mensaje = { text: 'Error inesperado: No se pudo encontrar al estudiante recién registrado.', type: 'error' };
        this.reiniciarFlujo();
      }
    });
  }
  // ======================
  //  SELECCIONAR BICICLETA EXISTENTE
  // ======================

  seleccionarBicicleta(bici: BicicletaModel) {
    this.bicicletaSeleccionada = bici;

    // Mostrar mensaje con contexto
    this.mensaje = { text: `Bicicleta seleccionada: ${bici.marca} - ${bici.color}. Ahora puedes cambiar el estacionamiento.`, type: 'success' };

    // Ofrecer directamente la opción de modificar estacionamiento
    this.pasoActual = 'registrarBicicleta';

    // Precargamos los datos de la bici, dejando el campo estacionamiento vacío para que el alumno lo cambie
    this.bicicletaForm.patchValue({
      marca: bici.marca,
      modelo: bici.modelo,
      color: bici.color,
      estacionamiento: ''
    });
  }
  
  // ======================
  //  OPCIONES AL ENCONTRAR BICICLETAS
  // ======================

  registrarNuevaBicicleta() {
    this.bicicletaSeleccionada = null;
    this.bicicletaForm.reset();
    this.pasoActual = 'registrarBicicleta';
  }

  // ======================
  //  REGISTRO DE BICICLETA
  // ======================

  registrarBicicleta() {
    if (!this.estudianteEncontrado) {
      this.mensaje = { text: 'Primero debe existir un estudiante válido.', type: 'warning' };
      return;
    }
    if (this.bicicletaForm.invalid) {
      this.mensaje = { text: 'Completa todos los campos requeridos.', type: 'error' };
      return;
    }

    const formValues = this.bicicletaForm.getRawValue();
    const oldId = this.bicicletaSeleccionada?._id ?? (this.bicicletaSeleccionada as any)?.id;

    if (this.bicicletaSeleccionada && oldId) {
      // --- Flujo de Actualización (Crear nuevo y borrar antiguo) ---
      const payload = {
        rut: this.estudianteEncontrado.rut,
        marca: this.bicicletaSeleccionada.marca,
        modelo: this.bicicletaSeleccionada.modelo,
        color: this.bicicletaSeleccionada.color,
        estacionamiento: formValues.estacionamiento ?? '',
        identificador: formValues.identificador ?? ''
      };

      this.bicicletaService.registrarBicicleta(payload).pipe(
        switchMap(createdBike => {
          console.debug('[BicicletaCrear] Creación exitosa, procediendo a eliminar el anterior:', oldId);
          // Pasamos la bicicleta creada al siguiente paso en la cadena
          return this.bicicletaService.eliminarBicicleta(oldId).pipe(
            // Si la eliminación tiene éxito, devolvemos la bicicleta que se creó
            switchMap(() => [createdBike]) 
          );
        })
      ).subscribe({
        next: (createdBike) => {
          // Muestra la pantalla de éxito en lugar de abrir una nueva pestaña
          this.mostrarExito(createdBike, 'updated');
        },
        error: (err) => {
          console.error('Error en el flujo de actualización de bicicleta', err);
          this.mensaje = { text: `Error al actualizar el estacionamiento (status: ${err?.status ?? '??'})`, type: 'error' };
        }
      });
    } else {
      // --- Flujo de Creación ---
      const bicicleta = {
        ...formValues,
        rut: this.estudianteEncontrado.rut,
        marca: formValues.marca ?? '',
        color: formValues.color ?? '',
        modelo: formValues.modelo ?? '',
        estacionamiento: formValues.estacionamiento ?? ''
      };

      this.bicicletaService.registrarBicicleta(bicicleta).subscribe({
        next: (newBike) => {
          // Muestra la pantalla de éxito en lugar de abrir una nueva pestaña
          this.mostrarExito(newBike, 'created');
        },
        error: (err) => {
          console.error('Error registrar bicicleta', err);
          this.mensaje = { text: `Error al registrar bicicleta (status: ${err?.status ?? '??'})`, type: 'error' };
        }
      });
    }
  }

  // ======================
  // QR Generation
  // ======================

  generarQR() {
    const estacionamiento = this.qrSelection || 'A1';
    const identificador = this.qrIdentificador || 'Campus-Lincoyan';
    // Construimos la URL de destino dentro de la app
    const base = window.location.origin;
    const path = '/bicicleta-estudiante-crear';
    const url = `${base}${path}?estacionamiento=${encodeURIComponent(estacionamiento)}&identificador=${encodeURIComponent(identificador)}`;
    this.targetUrl = url;
    // use external API to create QR image
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  }

  copiarUrl() {
    if (!this.targetUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.targetUrl);
    } else {
      const t = document.createElement('textarea');
      t.value = this.targetUrl;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
  }

  reiniciarFlujo() {
    this.bicicletaForm.reset();
    this.rutForm.reset();
    this.estudianteEncontrado = null;
    this.bicicletasDelEstudiante = [];
    this.bicicletaDeExito = null;
    this.mensaje = null;
    this.pasoActual = 'buscar';
  }

  /** Muestra la pantalla de éxito con los datos de la bicicleta procesada. */
  private mostrarExito(payload: any, action: 'created' | 'updated') {
    // Normalizar la respuesta del backend para extraer el objeto bicicleta real
    this.bicicletaDeExito = this.normalizeBikeResponse(payload);
    this.mensaje = {
      text: action === 'created'
        ? 'Bicicleta registrada correctamente.'
        : 'Estacionamiento actualizado correctamente.',
      type: 'success'
    };
    this.pasoActual = 'exito';
    // Si no tenemos información del propietario, intentar obtenerla por rut presente en la bici
    try {
      const rutFromBike = (this.bicicletaDeExito as any)?.rut || (payload && payload.rut);
      if (!this.estudianteEncontrado && rutFromBike) {
        this.estudianteService.buscarPorRut(rutFromBike).subscribe({
          next: (est) => { this.estudianteEncontrado = est; },
          error: () => { /* silencioso */ }
        });
      }
    } catch (e) {}
  }

  private normalizeBikeResponse(payload: any): BicicletaModel {
    if (!payload) return {} as BicicletaModel;
    let obj = payload;
    // Unwrap capas comunes
    if (payload.data) obj = payload.data;
    else if (payload.bike) obj = payload.bike;
    else if (payload.bicicleta) obj = payload.bicicleta;
    else if (payload.result) obj = payload.result;
    else if (payload.created) obj = payload.created;

    const normalized: any = {};
    normalized._id = obj._id || obj.id || obj.insertedId || obj._key || obj.uid || null;
    normalized.marca = obj.marca || obj.brand || '';
    normalized.modelo = obj.modelo || obj.model || '';
    normalized.color = obj.color || obj.colour || '';
    normalized.estacionamiento = obj.estacionamiento || obj.location || obj.slot || '';
    normalized.identificador = obj.identificador || obj.identify || obj.ident || '';
    normalized.rut = obj.rut || obj.ownerRut || obj.estudianteRut || '';
    normalized.createdAt = obj.createdAt || obj.fechaRegistro || obj.created_at || null;
    normalized.updatedAt = obj.updatedAt || obj.updated_at || null;
    return normalized as BicicletaModel;
  }

}
