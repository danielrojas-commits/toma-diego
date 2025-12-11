import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {

  private auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    try {
      this.auth.logout();
    } catch (e) {
      console.warn('Error during logout', e);
    }
    try {
      this.router.navigate(['/login-acceso']);
    } catch (e) {
      console.warn('Navigation to /login-acceso failed', e);
    }
  }

}
