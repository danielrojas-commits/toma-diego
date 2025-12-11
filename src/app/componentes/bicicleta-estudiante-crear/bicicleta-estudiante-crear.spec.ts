import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BicicletaEstudianteCrear } from './bicicleta-estudiante-crear';

describe('BicicletaEstudianteCrear', () => {
  let component: BicicletaEstudianteCrear;
  let fixture: ComponentFixture<BicicletaEstudianteCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BicicletaEstudianteCrear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BicicletaEstudianteCrear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
