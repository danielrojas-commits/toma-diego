import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Establecimiento, EstablecimientoModel } from '../../servicios/establecimiento';

@Component({
  selector: 'app-qr-establecimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './qr-establecimiento.component.html',
  styleUrl: './qr-establecimiento.component.css'
})
export class QrEstablecimientoComponent {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private establecimientoService = inject(Establecimiento);

  // QR generator state
  qrNumbers = Array.from({ length: 9 }, (_, i) => i + 1);
  // prefix will be the first letter of selected establishment name
  qrPrefix = 'A';
  establecimientos: EstablecimientoModel[] = [];
  selectedEstablecimiento: EstablecimientoModel | null = null;

  // numeric selection: starting number and quantity (1..3)
  startNumber = 1;
  quantity = 1; // how many sequential numbers to generate (1..3)

  qrIdentificadores: string[] = [];
  qrIdentificador = '';
  qrImageUrls: string[] = [];
  targetUrls: string[] = [];

  generarQR() {
    const identificador = this.qrIdentificador || (this.selectedEstablecimiento?.['identificador'] ?? this.selectedEstablecimiento?.nombre ?? 'Campus-Lincoyan');
    const base = window.location.origin;
    const path = '/bicicleta-estudiante-crear';

    // clear previous
    this.qrImageUrls = [];
    this.targetUrls = [];

    for (let i = 0; i < this.quantity; i++) {
      const num = this.startNumber + i;
      const estacionamiento = `${this.qrPrefix}${num}`;
      const url = `${base}${path}?estacionamiento=${encodeURIComponent(estacionamiento)}&identificador=${encodeURIComponent(identificador)}`;
      this.targetUrls.push(url);
      this.qrImageUrls.push(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`);
    }
  }

  copiarUrl(index?: number) {
    const toCopy = typeof index === 'number' ? this.targetUrls[index] : this.targetUrls.join('\n');
    if (!toCopy) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(toCopy);
    } else {
      const t = document.createElement('textarea');
      t.value = toCopy;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
  }

  ngOnInit(): void {
    // load establecimientos for selection
    this.establecimientoService.listarEstablecimientos().subscribe({
      next: (list) => {
        this.establecimientos = list || [];
        this.qrIdentificadores = this.establecimientos.map(e => (e['identificador'] ?? e.nombre ?? '').toString());
        // check query param
        const id = this.route.snapshot.queryParamMap.get('identificador');
        if (id) {
          const found = this.establecimientos.find(e => (e['identificador'] ?? e.nombre ?? '').toString().toLowerCase() === id.toLowerCase());
          if (found) this.selectEstablecimiento(found);
        }
      },
      error: () => {
        // ignore — keep defaults
      }
    });
  }

  selectEstablecimiento(est: EstablecimientoModel) {
    this.selectedEstablecimiento = est;
    const nombre = (est.nombre ?? est['identificador'] ?? '').toString();
    this.qrPrefix = (nombre.trim().charAt(0) || 'A').toUpperCase();
    this.qrIdentificador = (est['identificador'] ?? est.nombre ?? '').toString();
  }

  goBack() {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
}
