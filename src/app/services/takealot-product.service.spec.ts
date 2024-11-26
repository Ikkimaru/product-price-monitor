import { TestBed } from '@angular/core/testing';

import { TakealotProductService } from './takealot-product.service';

describe('TakealotProductService', () => {
  let service: TakealotProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TakealotProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
