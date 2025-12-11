import { TestBed } from '@angular/core/testing';

import { Establecimiento } from './establecimiento';

describe('Establecimiento', () => {
  let service: Establecimiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Establecimiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
