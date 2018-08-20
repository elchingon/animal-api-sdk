import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalSdkComponent } from './animal-sdk.component';

describe('AnimalSdkComponent', () => {
  let component: AnimalSdkComponent;
  let fixture: ComponentFixture<AnimalSdkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimalSdkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalSdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
