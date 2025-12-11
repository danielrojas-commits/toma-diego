import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante'; // ajusta la ruta según tu estructura
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-estudiantes-listar',
  imports: [CommonModule, RouterModule],
  templateUrl: './estudiantes-listar.html',
  styleUrl: './estudiantes-listar.css'
})
export class EstudiantesListar {

  private estudianteService = inject(Estudiante);
  private location = inject(Location);

  estudiantes: EstudianteModel[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  mensajeTipo: 'success' | 'danger' | '' = '';

  ngOnInit(): void {
    this.obtenerEstudiantes();
  }

  obtenerEstudiantes(): void {
    this.cargando = true;
    this.estudianteService.getEstudiantes().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener estudiantes:', err);
        this.error = 'No se pudieron cargar los estudiantes.';
        this.cargando = false;
      },
    });
  }

  confirmarEliminar(estudiante: EstudianteModel): void {
    const confirmar = confirm(`¿Deseas eliminar a ${estudiante.nombre} ${estudiante.apellido}?`);
    if (confirmar) {
      this.eliminarEstudiante(estudiante.rut);
    }
  }

  eliminarEstudiante(rut: string): void {
    this.estudianteService.eliminarEstudiante(rut).subscribe({
      next: (resp) => {
        this.mensaje = resp.message || 'Estudiante eliminado correctamente.';
        this.mensajeTipo = 'success';
        this.estudiantes = this.estudiantes.filter(e => e.rut !== rut);
      },
      error: () => {
        this.mensaje = 'Error al eliminar el estudiante.';
        this.mensajeTipo = 'danger';
      },
    });

    // Oculta la alerta después de 4 segundos
    setTimeout(() => {
      this.mensaje = '';
      this.mensajeTipo = '';
    }, 4000);
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }

}
