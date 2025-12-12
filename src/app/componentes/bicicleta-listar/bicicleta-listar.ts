import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bicicleta-listar',
  imports: [CommonModule, RouterModule, FormsModule, DatePipe],
  templateUrl: './bicicleta-listar.html',
  styleUrl: './bicicleta-listar.css'
})
export class BicicletaListar implements OnInit {

  private bicicletaService = inject(Bicicleta);
  private location = inject(Location);

  bicicletas: BicicletaModel[] = [];
  mensaje = '';
  cargando = false;
  terminoBusqueda: string = '';
  criterioBusqueda: 'marca' | 'estacionamiento' = 'marca';

  ngOnInit() {
    this.obtenerBicicletas();
  }

  /** Cargar todas las bicicletas desde el backend */
  obtenerBicicletas() {
    this.cargando = true;
    this.mensaje = '';

    this.bicicletaService.listarBicicletas().subscribe({
      next: (data) => {
        this.bicicletas = data;
        this.cargando = false;
        if (data.length === 0) {
          this.mensaje = '⚠️ No hay bicicletas registradas';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = '❌ Error al obtener bicicletas';
        console.error(err);
      }
    });
  }

  /** Eliminar bicicleta */
  eliminar(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar esta bicicleta?')) return;

    this.bicicletaService.eliminarBicicleta(id).subscribe({
      next: () => {
        this.mensaje = '✅ Bicicleta eliminada correctamente';
        this.obtenerBicicletas();
      },
      error: () => (this.mensaje = '❌ Error al eliminar bicicleta')
    });
  }
  
  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }
  
  get bicicletasFiltradas(): BicicletaModel[] {
    if (!this.terminoBusqueda.trim()) {
      return this.bicicletas;
    }
    const term = this.terminoBusqueda.toLowerCase();
    return this.bicicletas.filter(bici => {
      switch (this.criterioBusqueda) {
        case 'marca':
          return bici.marca.toLowerCase().includes(term);
        case 'estacionamiento':
          return bici.estacionamiento.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }

  onCriterioChange(): void {
    this.terminoBusqueda = '';
  }
}
