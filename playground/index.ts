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
    animalSdk.pages.getAllPublished().then(res => {
      res.items.forEach(basicPage => {
        animalSdk.pages.get(basicPage.id);
      });
    });

    animalSdk.menuItems.getAll();

    animalSdk.questions.getAllAnswered();

    animalSdk.months.current().then(monthNumber => {
      animalSdk.months.get(monthNumber);
    });

    // animalSdk.postQuestion({ name: 'Nicholas Mata', email: 'nicholas@matadesigns.net', text: 'What is a giraffe' });

    animalSdk.months.getAllOrdered().then(months => {
      months.items.forEach(basicMonth => {
        animalSdk.months.get(basicMonth.number);
      });
    });

    animalSdk.menuItems.getAll().then(menuItems => {
      menuItems.items.forEach(menuItem => {
        animalSdk.menuItems.get(menuItem.id);
      });
    });

    animalSdk.animals.current().then(animal => {
      console.log('Current Animal:', animal);
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
