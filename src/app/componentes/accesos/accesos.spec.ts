import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accesos } from './accesos';

describe('Accesos', () => {
  let component: Accesos;
  let fixture: ComponentFixture<Accesos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accesos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accesos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
