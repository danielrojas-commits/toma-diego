import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estudiantes',
  imports: [CommonModule, RouterModule],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css',
})
export class Estudiantes {

  private location = inject(Location);

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
}
