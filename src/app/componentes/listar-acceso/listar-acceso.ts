
import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Acceso, AccesoModel } from '../../servicios/acceso';

@Component({
  selector: 'app-listar-acceso',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './listar-acceso.html',
  styleUrl: './listar-acceso.css'
})
export class ListarAcceso implements OnInit {

  private accesoService = inject(Acceso);
  private location = inject(Location);

  accesos: AccesoModel[] = [];
  loading = false;
  mensaje = '';
  // respuesta cruda del servidor para depuración
  rawError: any = null;
  // Formulario de búsqueda por id
  searchForm = new FormGroup({
    id: new FormControl<string>('', Validators.required)
  });

  // Resultado de búsqueda individual
  foundUser: any = null;
  // Edición
  editMode = false;
  editForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    correo: new FormControl<string>('', [Validators.required, Validators.email])
  });

  ngOnInit(): void {
    this.cargarAccesos();
  }

  cargarAccesos() {
    this.loading = true;
    this.mensaje = '';
    this.accesoService.listarAccesos().subscribe({
      next: (lista) => {
        this.accesos = lista || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar accesos', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al cargar accesos (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  buscarPorId() {
    const id = this.searchForm.value.id?.trim();
    if (!id) {
      this.mensaje = '⚠️ Ingresa un id válido.';
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.foundUser = null;
    this.accesoService.obtenerAccesoPorId(id).subscribe({
      next: (res) => {
        this.foundUser = res ?? null;
        this.loading = false;
        if (!this.foundUser) {
          this.mensaje = '⚠️ No se encontró un usuario con ese id.';
        }
      },
      error: (err) => {
        console.error('Error buscar id', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al buscar usuario (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  limpiarBusqueda() {
    this.searchForm.reset();
    this.foundUser = null;
    this.rawError = null;
    this.mensaje = '';
    // opcional: recargar lista completa
    this.cargarAccesos();
  }

  startEdit() {
    if (!this.foundUser) return;
    this.editMode = true;
    this.editForm.patchValue({
      nombre: this.foundUser['nombre'] ?? '',
      apellido: this.foundUser['apellido'] ?? '',
      correo: this.foundUser['correo'] ?? ''
    });
  }

  cancelarEdicion() {
    this.editMode = false;
    this.editForm.reset();
  }

  guardarEdicion() {
    if (!this.foundUser) return;
    if (this.editForm.invalid) {
      this.mensaje = '❌ Completa los campos antes de guardar.';
      return;
    }

    const id = this.foundUser['_id'] ?? this.foundUser['id'];
    if (!id) {
      this.mensaje = '❌ ID de usuario inválido.';
      return;
    }

    const payload: any = {
      nombre: this.editForm.value.nombre,
      apellido: this.editForm.value.apellido,
      correo: this.editForm.value.correo
    };

    this.loading = true;
    this.accesoService.actualizarAcceso(id, payload).subscribe({
      next: (res) => {
        // El backend puede devolver el usuario actualizado en res.user o en res
        const updated = res?.user ?? res ?? { ...this.foundUser, ...payload };
        this.foundUser = updated;

        // Actualizar en la lista si existe
        const idx = this.accesos.findIndex(a => (a['_id'] ?? a['id']) === (updated['_id'] ?? updated['id']));
        if (idx >= 0) {
          this.accesos[idx] = updated;
        }

        this.mensaje = '✅ Usuario actualizado correctamente.';
        this.editMode = false;
        this.editForm.reset();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error actualizar usuario', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al actualizar (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  /** Eliminar el usuario actualmente mostrado en foundUser */
  eliminarUsuarioEncontrado() {
    if (!this.foundUser) return;
    const id = this.foundUser['_id'] ?? this.foundUser['id'];
    if (!id) {
      this.mensaje = '❌ ID de usuario inválido.';
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    this.loading = true;
    this.accesoService.eliminarAcceso(id).subscribe({
      next: (res) => {
        // Actualizar la lista local removiendo el usuario
        this.accesos = this.accesos.filter(a => (a['_id'] ?? a['id']) !== id);
        this.mensaje = '✅ Usuario eliminado correctamente.';
        this.foundUser = null;
        this.rawError = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error eliminar usuario', err);
        this.rawError = err;
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al eliminar (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }

}
