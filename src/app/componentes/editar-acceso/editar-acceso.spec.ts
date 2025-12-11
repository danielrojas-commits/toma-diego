import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAcceso } from './editar-acceso';

describe('EditarAcceso', () => {
  let component: EditarAcceso;
  let fixture: ComponentFixture<EditarAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarAcceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
