import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAcceso } from './listar-acceso';

describe('ListarAcceso', () => {
  let component: ListarAcceso;
  let fixture: ComponentFixture<ListarAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAcceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
