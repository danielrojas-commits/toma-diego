import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Establecimientos } from './establecimientos';

describe('Establecimientos', () => {
  let component: Establecimientos;
  let fixture: ComponentFixture<Establecimientos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Establecimientos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Establecimientos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
