import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Model, StylesManager, FunctionFactory } from "survey-core";


// Import survey definition
declare var require: any;
var surveyJSON: any = require('../../assets/surveyJSON.json');

var instance: any = {};

import "survey-core/defaultV2.css";
StylesManager.applyTheme("defaultV2");


@Component({
  selector: 'app-survey-library',
  templateUrl: './survey-library.component.html',
  styleUrls: ['./survey-library.component.scss']
})
export class SurveyLibraryComponent implements OnInit {
  @Input() model!: Model;

  // Hashtable for countries information
  countriesInformation: any = {};

  // The list of listeners
  isReadyCallbackList: any = [];

  constructor(private http: HttpClient ) {
    instance = this;
  }

  ngOnInit(): void {
    FunctionFactory.Instance.register("getCountryOfficialName", this.getCountryOfficialName, true);
    FunctionFactory.Instance.register("getCountryRegion", this.getCountryRegion, true);
    FunctionFactory.Instance.register("isCountryExist", this.isCountryExist, true);

    this.model = new Model(surveyJSON);
  }

  // All functions from https://surveyjs.io/form-library/examples/questiontype-expression-async/angular#content-js
  setValueAndnotifyListeners(country: any, res: any) {
    instance.countriesInformation[country] = res;
    for (var i = 0; i < instance.isReadyCallbackList.length; i++) {
      instance.isReadyCallbackList[i](res);
    }
    instance.isReadyCallbackList = [];
  }

  getCountryInfoAjax(survey: any, country: any, isReadyCallback: any) {
    if (! country) {
      isReadyCallback({isFound: false});
      return null;
    }
    var countryInfo = instance.countriesInformation[country];
    if (!! countryInfo && (countryInfo.status == "processing")) {
      instance.isReadyCallbackList.push(isReadyCallback);
      return null;
    }
    if (!! countryInfo && countryInfo.status == "completed") {
      isReadyCallback(countryInfo);
      return countryInfo;
    }
    instance.countriesInformation[country] = {
      status: "processing"
    };
    instance.isReadyCallbackList.push(isReadyCallback);
    survey.setVariable("country_request_processing", true);
    instance.getData(country).subscribe({
      next: async (data : any) => {
          if(data) {
              survey.setVariable("country_request_processing", false);
              if (! data || data.length < 1) {
                  instance.setValueAndnotifyListeners(country, {
                  status: "completed",
                  isFound: false
                });
                return;
              }
              var countryValue = data[0];
              instance.setValueAndnotifyListeners(country, {
                status: "completed",
                isFound: true,
                officialName: countryValue.officialName,
                region: countryValue.region
              });
          }
      },
      error: (err: any) => {
          survey.setVariable("country_request_processing", false);
          instance.setValueAndnotifyListeners(country, {
            status: "completed",
            isFound: false
          });
      },
      complete: () => {

      },
    })
    return null;
  }

  getCountryInfo(context: any, params: any, property: any) {
    if (params.length < 1) {
      context.returnResult(null);
    }
    var isReady = function (countryInfo : any): any {
      context.returnResult(countryInfo[property]);
    }
    return instance.getCountryInfoAjax(context.survey, params[0], isReady);
  }

  getCountryOfficialName(params: any) {
    return instance.getCountryInfo(this, params, "officialName");
  }

  getCountryRegion(params: any) {
    return instance.getCountryInfo(this, params, "region");
  }

  isCountryExist(params: any) {
    return instance.getCountryInfo(this, params, "isFound");
  }

  getData(country: string) {
    return instance.http.get('https://surveyjs.io/api/CountriesExample?name=' + country); 
  }

}
