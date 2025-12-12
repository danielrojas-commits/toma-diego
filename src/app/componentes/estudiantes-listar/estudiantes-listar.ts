import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Estudiante, EstudianteModel } from '../../servicios/estudiante';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RutUtils } from '../../servicios/rut.utils';

@Component({
  selector: 'app-estudiantes-listar',
  imports: [CommonModule, RouterModule, FormsModule],
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
  terminoBusqueda: string = '';
  criterioBusqueda: 'rut' | 'nombreApellido' | 'correo' = 'rut';

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

    setTimeout(() => {
      this.mensaje = '';
      this.mensajeTipo = '';
    }, 4000);
  }

  get estudiantesFiltrados(): EstudianteModel[] {
    if (!this.terminoBusqueda) {
      return this.estudiantes;
    }
    const term = this.terminoBusqueda.toLowerCase();
    return this.estudiantes.filter(est => {
      switch (this.criterioBusqueda) {
        case 'rut':
          return RutUtils.clean(est.rut).includes(RutUtils.clean(term));
        case 'nombreApellido':
          const nombreCompleto = `${est.nombre} ${est.apellido}`.toLowerCase();
          return nombreCompleto.includes(term);
        case 'correo':
          return est.correo.toLowerCase().includes(term);
        default:
          return false;
      }
    });
  }

  formatRutOnBlur(): void {
    if (this.criterioBusqueda === 'rut' && this.terminoBusqueda) {
      this.terminoBusqueda = RutUtils.format(this.terminoBusqueda);
    }
  }

  sanitizeRutInput(event: Event): void {
    if (this.criterioBusqueda === 'rut') {
      this.terminoBusqueda = RutUtils.handleInput(event);
    } else {
      this.terminoBusqueda = (event.target as HTMLInputElement).value;
    }
  }

  onCriterioChange(): void {
    this.terminoBusqueda = '';
  }

  goBack() { try { this.location.back(); } catch (e) { console.warn('goBack failed', e); } }

}
