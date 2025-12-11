import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarBicicletasPorRut } from './buscar-bicicletas-por-rut';

describe('BuscarBicicletasPorRut', () => {
  let component: BuscarBicicletasPorRut;
  let fixture: ComponentFixture<BuscarBicicletasPorRut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarBicicletasPorRut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarBicicletasPorRut);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
