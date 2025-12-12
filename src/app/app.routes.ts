import { Routes } from '@angular/router';
import { EstudianteCrear } from './componentes/estudiante-crear/estudiante-crear';
import { EstudiantesListar } from './componentes/estudiantes-listar/estudiantes-listar';
import { Estudiantes } from './componentes/estudiantes/estudiantes';
import { BuscarPorRut } from './componentes/buscar-por-rut/buscar-por-rut';
import { BuscarBicicletasPorRut } from './componentes/buscar-bicicletas-por-rut/buscar-bicicletas-por-rut';
import { Inicio } from './componentes/inicio/inicio';
import { AuthGuard } from './guards/auth.guard';
import { BicicletaListar } from './componentes/bicicleta-listar/bicicleta-listar';
import { Bicicletas } from './componentes/bicicletas/bicicletas';
import { BicicletaCrear } from './componentes/bicicleta-crear/bicicleta-crear';
import { BicicletaEstudianteCrear } from './componentes/bicicleta-estudiante-crear/bicicleta-estudiante-crear';
import { CrearAcceso } from './componentes/crear-acceso/crear-acceso';
import { Accesos } from './componentes/accesos/accesos';
import { LoginAcceso } from './componentes/login-acceso/login-acceso';
import { ListarAcceso } from './componentes/listar-acceso/listar-acceso';
import { RegistrarEstablecimiento } from './componentes/registrar-establecimiento/registrar-establecimiento';
import { ListarEstablecimiento } from './componentes/listar-establecimiento/listar-establecimiento';
import { Establecimientos } from './componentes/establecimientos/establecimientos';
import { QrEstablecimientoComponent } from './componentes/qr-establecimiento/qr-establecimiento.component';
import { BicicletaExito } from './componentes/bicicleta-exito/bicicleta-exito';
import { EstablecimientoListarBicicletaComponent } from './componentes/establecimiento-listar-bicicleta/establecimiento-listar-bicicleta.component';

export const routes: Routes = [
    {
        path: "",
        component: LoginAcceso
    },
    {
        path: "inicio",
        component: Inicio,
        canActivate: [AuthGuard]
    },
    {
        path: "crear-acceso",
        component: CrearAcceso
    },
    {
        path: "login-acceso",
        component: LoginAcceso
    },
    {
        path: "listar-acceso",
        component: ListarAcceso
    },
    {
        path: "accesos",
        component: Accesos
    },
    {
        path: "estudiante-crear",
        component: EstudianteCrear
    },
    {
        path: "estudiante-listar",
        component: EstudiantesListar
    },
    {
        path: "estudiantes",
        component: Estudiantes
    },
    {
        path: "buscar-por-rut",
        component: BuscarPorRut
    },
    {
        path: "buscar-bicicleta-por-rut",
        component: BuscarBicicletasPorRut
    },
    {
        path: "bicicleta-listar",
        component: BicicletaListar
    },
    {
        path: "bicicletas",
        component: Bicicletas
    },
    {
        path: "bicicleta-crear",
        component: BicicletaCrear
    },
    {
        path: "bicicleta-estudiante-crear",
        component: BicicletaEstudianteCrear
    },
    {
        path: "bicicleta-exito",
        component: BicicletaExito
    },
    {
        path: "registrar-establecimiento",
        component: RegistrarEstablecimiento
    }
    ,
    {
        path: "listar-establecimiento",
        component: ListarEstablecimiento
    },
    {
        path: "establecimientos",
        component: Establecimientos
    },
    {
        path: "qr-establecimiento",
        component: QrEstablecimientoComponent
    },
    {
        path: 'establecimiento-listar-bicicleta',
        component: EstablecimientoListarBicicletaComponent
    }
];
