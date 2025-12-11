import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accesos',
  imports: [CommonModule, RouterModule],
  templateUrl: './accesos.html',
  styleUrl: './accesos.css',
})
export class Accesos {

  private location = inject(Location);

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
}
