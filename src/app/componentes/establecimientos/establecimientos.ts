import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-establecimientos',
  imports: [CommonModule, RouterModule],
  templateUrl: './establecimientos.html',
  styleUrl: './establecimientos.css',
})
export class Establecimientos {

  private location = inject(Location);

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
}
