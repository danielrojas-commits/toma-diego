import { TestBed } from '@angular/core/testing';

import { Bicicleta } from './bicicleta';

describe('Bicicleta', () => {
  let service: Bicicleta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bicicleta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
