import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEstablecimiento } from './registrar-establecimiento';

describe('RegistrarEstablecimiento', () => {
  let component: RegistrarEstablecimiento;
  let fixture: ComponentFixture<RegistrarEstablecimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarEstablecimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarEstablecimiento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
