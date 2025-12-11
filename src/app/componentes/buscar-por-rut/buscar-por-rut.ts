import { Component, inject } from '@angular/core';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-buscar-por-rut',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buscar-por-rut.html',
  styleUrl: './buscar-por-rut.css'
})
export class BuscarPorRut {

  private estudianteService = inject(Estudiante);
  private location = inject(Location);
  rut = '';
  estudiante: EstudianteModel | null = null;
  cargando = false;
  mensaje = '';
  mensajeTipo: 'success' | 'danger' | '' = '';

  buscarEstudiante(): void {
    if (!this.rut.trim()) {
      this.mensaje = 'Por favor, ingresa un RUT válido.';
      this.mensajeTipo = 'danger';
      this.estudiante = null;
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.estudiante = null;

    this.estudianteService.buscarPorRut(this.rut).subscribe({
      next: (data) => {
        this.estudiante = data;
        console.log(data)
        this.mensaje = 'Estudiante encontrado con éxito.';
        this.mensajeTipo = 'success';
        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'No se encontró ningún estudiante con ese RUT.';
        this.mensajeTipo = 'danger';
        this.cargando = false;
      },
    });
  }

  limpiar(): void {
    this.rut = '';
    this.estudiante = null;
    this.mensaje = '';
    this.mensajeTipo = '';
  }

  goBack(): void {
    this.location.back();
  }

}
