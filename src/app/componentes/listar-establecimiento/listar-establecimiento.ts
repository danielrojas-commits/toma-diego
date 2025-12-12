import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Establecimiento, EstablecimientoModel } from '../../servicios/establecimiento';

@Component({
  selector: 'app-listar-establecimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './listar-establecimiento.html',
  styleUrls: ['./listar-establecimiento.css']
})
export class ListarEstablecimiento implements OnInit {

  private establecimientoService = inject(Establecimiento);
  private location = inject(Location);

  establecimientos: EstablecimientoModel[] = [];
  loading = false;
  mensaje = '';
  rawError: any = null;

  
  searchForm = new FormGroup({
    id: new FormControl<string>('', Validators.required)
  });

  foundEstablishment: any = null;

  // edición
  editingId: string | null = null;
  editForm = new FormGroup({
    identificador: new FormControl<string>('', Validators.nullValidator),
    nombre: new FormControl<string>('', Validators.required),
    direccion: new FormControl<string>('', Validators.required),
    capacidad: new FormControl<number | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.cargarEstablecimientos();
  }

  cargarEstablecimientos() {
    this.loading = true;
    this.mensaje = '';
    this.establecimientoService.listarEstablecimientos().subscribe({
      next: (lista) => {
        this.establecimientos = lista || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar establecimientos', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al cargar establecimientos (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  recargar() {
    this.cargarEstablecimientos();
  }

  buscarPorId() {
    const identificador = this.searchForm.value.id?.trim();
    if (!identificador) {
      this.mensaje = '⚠️ Ingresa un identificador válido.';
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.foundEstablishment = null;
    this.establecimientoService.obtenerEstablecimientoPorIdentificador(identificador).subscribe({
      next: (res) => {
        this.foundEstablishment = res ?? null;
        this.loading = false;
        if (!this.foundEstablishment) {
          this.mensaje = '⚠️ No se encontró un establecimiento con ese identificador.';
        }
      },
      error: (err) => {
        console.error('Error buscar establecimiento por identificador', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al buscar establecimiento (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  limpiarBusqueda() {
    this.searchForm.reset();
    this.foundEstablishment = null;
    this.rawError = null;
    this.mensaje = '';

    this.cargarEstablecimientos();
  }

  // Inicia la edición de un establecimiento (puede venir de la lista o del resultado encontrado)
  startEdit(est: any) {
    const id = est?._id ?? est?.['identificador'] ?? null;
    if (!id) {
      this.mensaje = '⚠️ No se pudo determinar el id del establecimiento para editar.';
      return;
    }
    this.editingId = id;
    this.editForm.setValue({
      identificador: est ? (est['identificador'] ?? '') : '',
      nombre: est?.nombre ?? '',
      direccion: est?.direccion ?? '',
      capacidad: est?.capacidad ?? null
    });
    this.mensaje = '';
    this.rawError = null;
  }

  cancelarEdicion() {
    this.editingId = null;
    this.editForm.reset();
    this.mensaje = '';
  }

  guardarEdicion() {
    if (!this.editingId) {
      this.mensaje = '⚠️ No hay un establecimiento seleccionado para editar.';
      return;
    }
    if (this.editForm.invalid) {
      this.mensaje = '⚠️ Completa los campos requeridos antes de guardar.';
      return;
    }

    const payload: any = {
      identificador: this.editForm.value.identificador,
      nombre: this.editForm.value.nombre,
      direccion: this.editForm.value.direccion,
      capacidad: this.editForm.value.capacidad
    };

    this.loading = true;
    this.establecimientoService.actualizarEstablecimiento(this.editingId, payload).subscribe({
      next: (res) => {
        this.mensaje = '✅ Establecimiento actualizado correctamente.';
        this.loading = false;
        // actualizar lista en memoria para reflejar cambios sin recarga
        this.establecimientos = this.establecimientos.map(e => {
          const id = e._id ?? e['identificador'];
          if (id === this.editingId) {
            return {...e, ...payload};
          }
          return e;
        });
        // si el foundEstablishment era el que editamos, actualizarlo
        if (this.foundEstablishment) {
          const fid = this.foundEstablishment._id ?? this.foundEstablishment['identificador'];
          if (fid === this.editingId) {
            this.foundEstablishment = {...this.foundEstablishment, ...payload};
          }
        }
        this.cancelarEdicion();
      },
      error: (err) => {
        console.error('Error actualizando establecimiento', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al actualizar establecimiento (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  goBack() {
    try { this.location.back(); } catch (e) { console.warn('goBack failed', e); }
  }

}
