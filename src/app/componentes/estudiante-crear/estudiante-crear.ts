import { Component, inject  } from '@angular/core';
import { Location } from '@angular/common';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { FormControl, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estudiante-crear',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './estudiante-crear.html',
  styleUrl: './estudiante-crear.css'
})
export class EstudianteCrear {
  //Instanciamos el servicio para utilizarlo
  private estudianteService = inject(Estudiante);
  private location = inject(Location);
  // FIN Instanciamos el servicio
  mensaje = '';
  //creamos formulario reactivo
  estudianteForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.required),
    apellido: new FormControl<string>('', Validators.required),
    rut: new FormControl<string>(''),
    correo: new FormControl<string>('', [Validators.required, Validators.email])
  });
  //Fin formulario reactivo
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

  /**
   * Si el RUT ingresado contiene sólo números, calcula el dígito verificador
   * y formatea el RUT siguiendo la norma chilena: 21.234.234-4
   */
  formatRutIfNeeded(): void {
    const raw = (this.estudianteForm.get('rut')?.value || '').toString().trim();
    if (!raw) return;

    // Keep only digits
    let digits = raw.replace(/\D/g, '');
    if (!digits) return;

    // If more than 10 digits, trim to 10
    if (digits.length > 10) digits = digits.substr(0, 10);

    // If user provided 9 or 10 digits, treat the last digit as provided DV
    if (digits.length === 9 || digits.length === 10) {
      const dvProvided = digits.charAt(digits.length - 1).toUpperCase();
      const main = digits.substr(0, digits.length - 1);
      const formatted = this.formatRutString(main, dvProvided);
      this.estudianteForm.get('rut')?.setValue(formatted, { emitEvent: false });
      return;
    }

    // If 1..9 digits -> compute DV and format
    const dv = this.computeRutDV(digits);
    const formatted = this.formatRutString(digits, dv);
    this.estudianteForm.get('rut')?.setValue(formatted, { emitEvent: false });
  }

  /** Sanitize input as user types: remove non-digits and limit to 10 characters */
  sanitizeRutInput(): void {
    const raw = (this.estudianteForm.get('rut')?.value || '').toString();
    const onlyDigits = raw.replace(/\D/g, '');
    const trimmed = onlyDigits.substr(0, 10);
    if (trimmed !== raw) {
      // set value without emitting to avoid loops
      this.estudianteForm.get('rut')?.setValue(trimmed, { emitEvent: false });
    }

    // If the user has already entered 9 or 10 digits while typing, format immediately
    if (trimmed.length === 9 || trimmed.length === 10) {
      const dvProvided = trimmed.charAt(trimmed.length - 1).toUpperCase();
      const main = trimmed.substr(0, trimmed.length - 1);
      const formatted = this.formatRutString(main, dvProvided);
      this.estudianteForm.get('rut')?.setValue(formatted, { emitEvent: false });
    }
  }

  private computeRutDV(digits: string): string {
    // Algoritmo módulo 11
    let sum = 0;
    let multiplier = 2;
    for (let i = digits.length - 1; i >= 0; i--) {
      sum += parseInt(digits.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const mod = 11 - (sum % 11);
    if (mod === 11) return '0';
    if (mod === 10) return 'K';
    return String(mod);
  }

  private formatRutString(digits: string, dv: string): string {
    // Insert dots every three digits from the right
    let reversed = digits.split('').reverse().join('');
    const parts: string[] = [];
    for (let i = 0; i < reversed.length; i += 3) {
      parts.push(reversed.substr(i, 3));
    }
    const joined = parts.map(p => p.split('').reverse().join('')).reverse().join('.');
    return `${joined}-${dv}`;
  }

}
