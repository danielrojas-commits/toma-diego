import { Component, inject  } from '@angular/core';
import { Location } from '@angular/common';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { FormControl, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RutUtils } from '../../servicios/rut.utils';

@Component({
  selector: 'app-estudiante-crear',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './estudiante-crear.html',
  styleUrl: './estudiante-crear.css'
})
export class EstudianteCrear {
  private estudianteService = inject(Estudiante);
  private location = inject(Location);
  mensaje = '';
  estudianteForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    rut: new FormControl<string>(''),
    correo: new FormControl<string>('', [Validators.required, Validators.email])
  });
  crearEstudiante() {
    if (this.estudianteForm.invalid) {
      this.mensaje = '❌ Por favor completa los campos obligatorios';
      return;
    }
    const estudiante: EstudianteModel = {
      nombre: this.estudianteForm.get('nombre')!.value || '',
      apellido: this.estudianteForm.get('apellido')!.value || '',
      rut: this.estudianteForm.get('rut')!.value || '',
      correo: this.estudianteForm.get('correo')!.value || ''
    };
    this.estudianteService.crearEstudiante(estudiante).subscribe({
      next: () => {
        this.mensaje = '✅ Estudiante creado correctamente';
        this.estudianteForm.reset();
      },
      error: () => (this.mensaje = '❌ Error al crear estudiante')
    });
  }

  goBack() {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }

  formatRutIfNeeded(): void {
    const raw = (this.estudianteForm.get('rut')?.value || '').toString();
    const formatted = RutUtils.format(raw);
    
    if (formatted) {
      this.estudianteForm.get('rut')?.setValue(formatted, { emitEvent: false });
    }
  }

  sanitizeRutInput(): void {
    const raw = (this.estudianteForm.get('rut')?.value || '').toString();
    const cleaned = RutUtils.clean(raw);
    
    if (cleaned !== raw) {
      this.estudianteForm.get('rut')?.setValue(cleaned, { emitEvent: false });
    }

    if (cleaned.length === 9 || cleaned.length === 10) {
      const formatted = RutUtils.format(cleaned);
      this.estudianteForm.get('rut')?.setValue(formatted, { emitEvent: false });
    }
  }
}
