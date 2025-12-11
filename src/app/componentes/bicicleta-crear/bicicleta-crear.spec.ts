import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BicicletaCrear } from './bicicleta-crear';

describe('BicicletaCrear', () => {
  let component: BicicletaCrear;
  let fixture: ComponentFixture<BicicletaCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BicicletaCrear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BicicletaCrear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
