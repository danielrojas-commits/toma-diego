import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudianteCrear } from './estudiante-crear';

describe('EstudianteCrear', () => {
  let component: EstudianteCrear;
  let fixture: ComponentFixture<EstudianteCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudianteCrear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudianteCrear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
