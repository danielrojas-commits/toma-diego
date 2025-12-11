import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { EstablecimientoListarBicicletaComponent } from './establecimiento-listar-bicicleta.component';

describe('EstablecimientoListarBicicletaComponent', () => {
  let component: EstablecimientoListarBicicletaComponent;
  let fixture: ComponentFixture<EstablecimientoListarBicicletaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstablecimientoListarBicicletaComponent, HttpClientTestingModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablecimientoListarBicicletaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load establishment info on init', () => {
    fixture.detectChanges();
    
    const req = httpMock.expectOne(request => 
      request.url.includes('/establecimiento/')
    );
    expect(req.request.method).toBe('GET');
    req.flush({ nombre: 'Colegio A', estudiantes: [] });
  });

  it('should load bicycles for selected date', () => {
    component.selectedDate = '2025-12-04';
    component.cargarBicicletas();

    const req = httpMock.expectOne(request =>
      request.url.includes('/bicicleta/establecimiento/') && request.url.includes('/fecha/')
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, modelo: 'Mountain' }]);
    
    expect(component.bicicletas.length).toBeGreaterThan(0);
  });

  it('should show error when no date is selected', () => {
    component.selectedDate = '';
    component.cargarBicicletas();

    expect(component.error).toBe('Por favor selecciona una fecha');
  });
});
