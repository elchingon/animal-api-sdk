import { TestBed, inject } from '@angular/core/testing';

import { AnimalSdkService } from './animal-sdk.service';

describe('AnimalSdkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimalSdkService]
    });
  });

  it('should be created', inject([AnimalSdkService], (service: AnimalSdkService) => {
    expect(service).toBeTruthy();
  }));
});
