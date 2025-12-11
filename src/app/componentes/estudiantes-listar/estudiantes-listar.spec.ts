import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiantesListar } from './estudiantes-listar';

describe('EstudiantesListar', () => {
  let component: EstudiantesListar;
  let fixture: ComponentFixture<EstudiantesListar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiantesListar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudiantesListar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
