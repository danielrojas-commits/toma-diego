import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bicicleta, BicicletaModel } from '../../servicios/bicicleta';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buscar-bicicletas-por-rut',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buscar-bicicletas-por-rut.html',
  styleUrl: './buscar-bicicletas-por-rut.css'
})
export class BuscarBicicletasPorRut {


  private bicicletaService = inject(Bicicleta);
  private location = inject(Location);
  rut = '';
  bicicletas: BicicletaModel[] = [];
  cargando = false;
  mensaje = '';
  mensajeTipo: 'success' | 'danger' | '' = '';

  buscarBicicletas(): void {
    if (!this.rut.trim()) {
      this.mensaje = 'Por favor, ingresa un RUT válido.';
      this.mensajeTipo = 'danger';
      this.bicicletas = [];
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.bicicletas = [];

    this.bicicletaService.getBicicletaPorEstudianteRut(this.rut).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.bicicletas = data;
          this.mensaje = `Se encontraron ${data.length} bicicleta(s) asociadas.`;
          this.mensajeTipo = 'success';
        } else {
          this.mensaje = 'No se encontraron bicicletas para este RUT.';
          this.mensajeTipo = 'danger';
        }
        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'Error al buscar las bicicletas.';
        this.mensajeTipo = 'danger';
        this.cargando = false;
      },
    });
  }

  limpiar(): void {
    this.rut = '';
    this.bicicletas = [];
    this.mensaje = '';
    this.mensajeTipo = '';
  }

  goBack(): void {
    try { this.location.back(); } catch (e) { console.warn('goBack failed', e); }
  }

}
