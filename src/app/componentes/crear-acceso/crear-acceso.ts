import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Acceso } from '../../servicios/acceso';

@Component({
  selector: 'app-crear-acceso',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear-acceso.html',
  styleUrl: './crear-acceso.css'
})
export class CrearAcceso {

  private accesoService = inject(Acceso);
  private location = inject(Location);

  mensaje = '';

  accesoForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    correo: new FormControl<string>('', [Validators.required, Validators.email]),
    rut: new FormControl<string>('', Validators.required),
    contraseña: new FormControl<string>('', [Validators.required, Validators.minLength(6)])
  });

  enviar() {
    if (this.accesoForm.invalid) {
      this.mensaje = ' Completa correctamente todos los campos.';
      return;
    }

    // Mapear la contraseña a una clave sin caracteres especiales
    // Muchos backends esperan 'password' o 'contrasena' en vez de 'contraseña'
    const payload = {
      nombre: this.accesoForm.value.nombre,
      apellido: this.accesoForm.value.apellido,
      correo: this.accesoForm.value.correo,
      rut: this.accesoForm.value.rut,
      // Enviar 'password' para maximizar compatibilidad con el backend
      password: this.accesoForm.value.contraseña
    };

    this.accesoService.crearAcceso(payload).subscribe({
      next: () => {
        this.mensaje = '✅ Acceso creado correctamente.';
        this.accesoForm.reset();
      },
      error: (err) => {
        // Mostrar detalle en consola para depuración
        console.error('Error crear acceso', err);

        // Construir mensaje para la UI con la información útil que tengamos
        const status = err?.status ?? 'desconocido';
        // err.error puede ser texto o un objeto con mensaje
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al crear acceso (status: ${status})${serverMsg ? ": " + serverMsg : ''}`;
      }
    });
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }

}
