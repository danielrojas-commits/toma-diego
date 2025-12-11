import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAcceso } from './crear-acceso';

describe('CrearAcceso', () => {
  let component: CrearAcceso;
  let fixture: ComponentFixture<CrearAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAcceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
