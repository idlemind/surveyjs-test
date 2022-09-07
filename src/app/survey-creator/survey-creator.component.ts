import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ICreatorOptions } from 'survey-creator-core';
import { SurveyCreator } from 'survey-creator-knockout';
import { FunctionFactory } from 'survey-core';

// Import survey definition
declare var require: any;
var surveyJSON: any = require('../../assets/surveyJSON.json');

var instance: any = {};

@Component({
  selector: 'app-survey-creator',
  templateUrl: './survey-creator.component.html',
  styleUrls: ['./survey-creator.component.scss']
})
export class SurveyCreatorComponent implements OnInit {

  // Hashtable for countries information
  countriesInformation: any = {};

  // The list of listeners
  isReadyCallbackList: any = [];

  constructor(private http: HttpClient ) {
    instance = this;
  }

  ngOnInit(): void {
    const creatorOptions: ICreatorOptions = {
      //showLogicTab: true,
      isAutoSave: false
    };

    // Register the functions
    FunctionFactory.Instance.register("getCountryOfficialName", this.getCountryOfficialName, true);
    FunctionFactory.Instance.register("getCountryRegion", this.getCountryRegion, true);
    FunctionFactory.Instance.register("isCountryExist", this.isCountryExist, true);

    const creator = new SurveyCreator(creatorOptions);
    creator.text= JSON.parse(surveyJSON);
    creator.survey.showProgressBar = "on";
    creator.survey.progressBarType = "buttons";

    creator.render("surveyCreator");
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
