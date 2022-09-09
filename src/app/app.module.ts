import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SurveyLibraryComponent } from './survey-library/survey-library.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { SurveyAngularModule } from "survey-angular-ui";
import { SurveyCreatorComponent } from './survey-creator/survey-creator.component';

@NgModule({
  declarations: [
    AppComponent,
    SurveyLibraryComponent,
    HomeComponent,
    SurveyCreatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SurveyAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
