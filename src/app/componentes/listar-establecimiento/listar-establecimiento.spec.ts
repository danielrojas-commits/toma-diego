import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarEstablecimiento } from './listar-establecimiento';

describe('ListarEstablecimiento', () => {
  let component: ListarEstablecimiento;
  let fixture: ComponentFixture<ListarEstablecimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarEstablecimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarEstablecimiento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
