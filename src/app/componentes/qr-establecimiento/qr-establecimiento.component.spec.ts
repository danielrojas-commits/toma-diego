import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrEstablecimientoComponent } from './qr-establecimiento.component';

describe('QrEstablecimientoComponent', () => {
  let component: QrEstablecimientoComponent;
  let fixture: ComponentFixture<QrEstablecimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrEstablecimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrEstablecimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
