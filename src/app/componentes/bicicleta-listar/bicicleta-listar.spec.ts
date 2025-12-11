import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BicicletaListar } from './bicicleta-listar';

describe('BicicletaListar', () => {
  let component: BicicletaListar;
  let fixture: ComponentFixture<BicicletaListar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BicicletaListar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BicicletaListar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
