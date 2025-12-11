import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarPorRut } from './buscar-por-rut';

describe('BuscarPorRut', () => {
  let component: BuscarPorRut;
  let fixture: ComponentFixture<BuscarPorRut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarPorRut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarPorRut);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
