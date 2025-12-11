import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Establecimiento, EstablecimientoModel } from '../../servicios/establecimiento';
import { FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-registrar-establecimiento',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registrar-establecimiento.html',
  styleUrl: './registrar-establecimiento.css'
})
export class RegistrarEstablecimiento {
  private establecimientoService = inject(Establecimiento);
  private location = inject(Location);
  mensaje = '';
  loading = false;

  establecimientoForm = new FormGroup({
    // identificador reañadido y obligatorio
    identificador: new FormControl<string>('', Validators.required),
    nombre: new FormControl<string>('', Validators.required),
    direccion: new FormControl<string>('', Validators.required),
    capacidad: new FormControl<number | string>('', [Validators.required, Validators.pattern(/^\d+$/)])
  });

  crearEstablecimiento() {
    if (this.establecimientoForm.invalid) {
      this.mensaje = '❌ Por favor completa los campos obligatorios';
      return;
    }

    const establecimiento: Partial<EstablecimientoModel> = {
      identificador: this.establecimientoForm.get('identificador')!.value || '',
      nombre: this.establecimientoForm.get('nombre')!.value || '',
      direccion: this.establecimientoForm.get('direccion')!.value || '',
      capacidad: parseInt(this.establecimientoForm.get('capacidad')!.value as string, 10)
    };

    this.loading = true;
    console.log('Payload a enviar:', establecimiento);

    // Comprobar duplicados por nombre + dirección antes de crear
    this.establecimientoService.listarEstablecimientos().pipe(
      take(1),
      switchMap((lista) => {
        const nombreLower = (establecimiento.nombre || '').toString().toLowerCase();
        const direccionLower = (establecimiento.direccion || '').toString().toLowerCase();
        const encontrado = (lista || []).some(e => {
          return (e.nombre || '').toString().toLowerCase() === nombreLower
            && (e.direccion || '').toString().toLowerCase() === direccionLower;
        });

        if (encontrado) {
          this.mensaje = '⚠️ Establecimiento ya registrado.';
          this.loading = false;
          return of(null);
        }

        return this.establecimientoService.crearEstablecimiento(establecimiento);
      })
    ).subscribe({
      next: (res) => {
        if (res === null) return; // ya existía
        this.mensaje = '✅ Establecimiento creado correctamente';
        this.establecimientoForm.reset();
        this.loading = false;
        console.log('Establecimiento creado:', res);
      },
      error: (err) => {
        console.error('Error al crear establecimiento:', err);
        console.log('Error body:', err?.error);
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al crear establecimiento (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
        this.loading = false;
      }
    });
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }
}
