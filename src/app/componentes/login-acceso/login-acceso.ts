

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Acceso } from '../../servicios/acceso';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-acceso',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login-acceso.html',
  styleUrl: './login-acceso.css'
})
export class LoginAcceso {

  private accesoService = inject(Acceso);
  private authService = inject(AuthService);
  private router = inject(Router);

  mensaje = '';

  loginForm = new FormGroup({
    correo: new FormControl<string>('', [Validators.required, Validators.email]),
    contraseña: new FormControl<string>('', [Validators.required, Validators.minLength(6)])
  });

  // Datos del usuario autenticado (si el backend los devuelve)
  userInfo: any = null;
  // Respuesta cruda del servidor (para depuración)
  rawResponse: any = null;

  enviar() {
    if (this.loginForm.invalid) {
      this.mensaje = '❌ Completa correctamente todos los campos.';
      return;
    }

    const correo = this.loginForm.value.correo as string;
    const password = this.loginForm.value.contraseña as string;

    // Llamar al servicio de acceso — mapa a 'password'
    this.accesoService.login(correo, password).subscribe({
      next: (res) => {
        // Aquí podrías guardar token, redirigir, etc.
        this.mensaje = '✅ Sesión iniciada correctamente.';
        console.log('Login OK', res);

        // Si el backend devuelve un token, lo guardamos (opcional)
        const token = res?.token ?? null;
        this.authService.loginWithToken(token);


  // Guardar la respuesta cruda para depuración
  this.rawResponse = res;

  // Intentar extraer datos de usuario de forma heurística
  // Algunos backends devuelven { user: { ... }, token: '...' }
  // otros { data: { user: ... } } o incluso el objeto user directamente.
  this.userInfo = res?.user ?? res?.data?.user ?? res?.data ?? res?.usuario ?? res ?? null;

              // Limpiar el formulario
              this.loginForm.reset();

              // Navegar a la pantalla principal (protegida)
              try {
                this.router.navigate(['/inicio']);
              } catch (e) {
                console.warn('No se pudo navegar a /inicio', e);
              }
      },
      error: (err) => {
        console.error('Error login', err);
        const status = err?.status ?? 'desconocido';
        const serverMsg = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : null);
        this.mensaje = `❌ Error al iniciar sesión (status: ${status})${serverMsg ? ': ' + serverMsg : ''}`;
      }
    });
  }

}
