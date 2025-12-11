import { Injectable, inject  } from '@angular/core';
//Nuevo agregado
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//Interface sirve como un modelo para dar formato a una variable 
export interface EstudianteModel {
  _id?: string;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
}
//FIN Nuevo agregado

@Injectable({
  providedIn: 'root'
})
export class Estudiante {
  private apiUrl = 'https://backend-registroformulario.onrender.com/api-backend-prueba/estudiante'; //Esta es la ruta del backend y /estudiante es el servicio disponible especialmente para estudiante. Ver documentación
  private http = inject(HttpClient);

  //Acción que se conecta con el backend en la nuve para enviar los datos del estudiante a crear. La ruta esta en apiUrl
  getEstudiantes(): Observable<EstudianteModel[]> {
    return this.http.get<EstudianteModel[]>(`${this.apiUrl}/listar`);
  }

  //Acción que se conecta con el backend en la nuve para solicitar todos los estudiantes registrados. La ruta esta en apiUrl
  crearEstudiante(estudiante: EstudianteModel): Observable<EstudianteModel> {
    return this.http.post<EstudianteModel>(`${this.apiUrl}/crear`, estudiante);
  }

  eliminarEstudiante(rut: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eliminar/${rut}`);
  }

  buscarPorRut(rut: string): Observable<EstudianteModel> {
    return this.http.get<EstudianteModel>(`${this.apiUrl}/buscar/${rut}`);
  }

  //Con estos dos métodos, estamos conectandonos con el API (backend) en la nube para crear y obtener estudiante
  //Revisar la documentación: https://github.com/cayocft/DOC_backend_sistema_bicicleta.git
}


