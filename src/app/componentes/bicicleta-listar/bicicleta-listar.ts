import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bicicleta-listar',
  imports: [CommonModule, RouterModule],
  templateUrl: './bicicleta-listar.html',
  styleUrl: './bicicleta-listar.css'
})
export class BicicletaListar {

  private bicicletaService = inject(Bicicleta);
  private location = inject(Location);

  bicicletas: BicicletaModel[] = [];
  mensaje = '';
  cargando = false;

  ngOnInit() {
    this.obtenerBicicletas();
  }

  /** Cargar todas las bicicletas desde el backend */
  obtenerBicicletas() {
    this.cargando = true;
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
  
}
