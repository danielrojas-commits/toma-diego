import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bicicletas',
  imports: [CommonModule, RouterModule],
  templateUrl: './bicicletas.html',
  styleUrl: './bicicletas.css',
})
export class Bicicletas {

  private location = inject(Location);

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
}
