import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Establecimiento } from '../../servicios/establecimiento';

@Component({
  selector: 'app-bicicleta-exito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bicicleta-exito.html',
  styleUrls: ['./bicicleta-exito.css']
})
export class BicicletaExito {
  params: any = {};
  identificadorNombre: string | null = null;
  private establecimientoService = inject(Establecimiento);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  constructor() {
    this.route.queryParamMap.subscribe(q => {
      const m: any = {};
      q.keys.forEach(k => m[k] = q.get(k));
      this.params = m;

      // Si tenemos identificador y es un ObjectId, intentamos resolver el nombre
      const ident = m.identificador;
      if (ident) {
        if (/^[a-fA-F0-9]{24}$/.test(ident)) {
          this.establecimientoService.obtenerEstablecimientoPorId(ident).subscribe({
            next: (est) => {
              this.identificadorNombre = est?.nombre ?? ident;
            },
            error: () => {
              // No se pudo resolver, mostrar el id tal cual
              this.identificadorNombre = ident;
            }
          });
        } else {
          // Si viene como nombre legible (p.ej. Campus-Lincoyan), mostrarlo directamente
          this.identificadorNombre = ident;
        }
      }
    });
  }

  goBack(): void {
    try {
      this.location.back();
    } catch (e) {
      console.warn('goBack failed', e);
    }
  }
  }

