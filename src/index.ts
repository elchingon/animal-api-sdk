import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalSDKService, AnimalSdkConfigService } from './animal-sdk.service';
import { AnimalSdkConfig } from './animal-sdk.models';
// import { SampleComponent } from './sample.component';
// import { SampleDirective } from './sample.directive';
// import { SamplePipe } from './sample.pipe';
// import { SampleService } from './sample.service';

// export * from './sample.component';
// export * from './sample.directive';
// export * from './sample.pipe';
// export * from './sample.service';

export * from './animal-sdk.models';
export * from './animal-sdk.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    // SampleComponent,
    // SampleDirective,
    // SamplePipe
  ],
  exports: [
    // SampleComponent,
    // SampleDirective,
    // SamplePipe
  ]
})
export class AnimalSDKModule {
  static forRoot(config: AnimalSdkConfig): ModuleWithProviders {
    return {
      ngModule: AnimalSDKModule,
      providers: [
        AnimalSDKService,
        {
          provide: AnimalSdkConfigService,
          useValue: config
        }]
      // providers: [SampleService]
    };
  }
}
