import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginAcceso } from './login-acceso';

describe('LoginAcceso', () => {
  let component: LoginAcceso;
  let fixture: ComponentFixture<LoginAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginAcceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
