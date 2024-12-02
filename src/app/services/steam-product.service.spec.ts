import { TestBed } from '@angular/core/testing';

import { SteamProductService } from './steam-product.service';

describe('SteamProductService', () => {
  let service: SteamProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
