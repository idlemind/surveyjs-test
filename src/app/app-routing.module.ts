import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SurveyCreatorComponent } from './survey-creator/survey-creator.component';
import { SurveyLibraryComponent } from './survey-library/survey-library.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'creator',
    component: SurveyCreatorComponent
  },
  {
    path: 'library',
    component: SurveyLibraryComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
