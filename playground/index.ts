/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AnimalSDKModule, AnimalSdkConfig, AnimalSDKService } from 'animal-sdk';


@Component({
  selector: 'app-component',
  template: ``
})
class AppComponent {
  constructor(public animalSdk: AnimalSDKService) {
    animalSdk.didLogin = this.loggedIn.bind(this);
  }

  private loggedIn() {
    console.log('Logged In');
    this.animalSdk.getPages(1, 20).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }
}

const sdkConfig: AnimalSdkConfig = {
  domain: 'http://localhost:3000/',
  credientals: {
    clientId: 'fe37790c248842058dcb0ceda63c75b295f27b0cfa21cbdf8b08620d0f28ea52',
    clientSecret: '53165961bb10003ef9e0cbedeb2403b4c64cea764f56d931a0579983d452a3cc'
  }
};

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [BrowserModule, AnimalSDKModule.forRoot(sdkConfig)]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
