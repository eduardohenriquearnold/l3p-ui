<template>

<div>

  <form>
  <div class="form-group col-md-12">
    Click bellow to download ".zip" file containing whole database. 
  
  </div>
  <div class="form-group col-md-12">
    <button  class="btn btn-primary" v-on:click='downloading = true' :disabled='downloading == true'>Download</button> 
  </div>

  <div class="form-group col-md-12" v-show="downloading">
    Your download will start soon...<img  src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
  </div>
    
  </form>
</div>
</template>

<script>
import { tagsService, measurementsService } from '../_services';
import JSZip from 'jszip'
import saveAs from 'file-saver'
export default {
  name:'Download',
  data: function ()
  {
    return {
      types: [],
      constraints: [],
      result: [],
      finishedLoading: true,
      downloading: false,
      currentType: -1,
      currentScenario: 0,
      type: [],
      scenarioType: [],
      zip: [],
    }
  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags('UI-Type').then(res => {this.types = res})
    tagsService.getSpecificConstraint('Datapoint','UI-Type-ScenarioType').then(res => {this.constraints = res})
  },

  methods: {
    
    downloadNext: function(){
      
      if (this.types[this.currentType] == 'Datapoint') {
        this.currentScenario = this.currentScenario + 1
        if(this.currentScenario >= this.constraints.length)
        {
          this.currentScenario = 0
          this.currentType = this.currentType + 1
        }
      }
      else{
        this.currentType = this.currentType + 1
        
      }

      if (this.currentType >= this.types.length){
          this.currentType = -1
          this.currrentScenario = 0
          var filename = 'L3Pilot_all_measurements.zip'
          this.zip.generateAsync({type:"blob"})
          .then(function (blob) {
              saveAs(blob, filename)
              
          }).then(res =>{this.downloading = false})

      }
      else{
        this.getResult()
      }
    },
    getResult: function(){
      this.type = this.types[this.currentType]
      if(this.type == 'Datapoint'){
        this.scenarioType = this.constraints[this.currentScenario].element2
      }else{
        this.scenarioType = ''
      }
      this.result = []
      this.finishedLoading = false 
      measurementsService.getMeasurements({type:this.type, scenarioType:this.scenarioType})
        .then(promiseArray => promiseArray.forEach((prom, idx, arr) => {
          prom.then(res => this.result.push(...res)).then(res => {if (!arr[idx+1]) this.finishedLoading = true})
        }))
      
      



    },
    toCSV: function(){
      const { Parser } = require('json2csv');
      var fields = Object.keys(this.result[0])
      const json2csvParser = new Parser({ fields });
      var csv = json2csvParser.parse(this.result);

      return csv


    },
    downloadCSV: function(){
      var data, filename, link;
      var csv = this.toCSV();
      if (csv == null) return;
      if (this.type == 'Datapoint')
      {
        filename = 'L3Pilot_all_measurements_' + this.type + '_' + this.scenarioType + '.csv';
      }else{
        filename = 'L3Pilot_all_measurements_' + this.type + '.csv';
      }
      this.zip.file(filename, csv)
    }
    
  },
  watch: {
    finishedLoading: function(val){
      
      if(val == true && this.downloading == true){
        if (this.result.length !== 0)
        {
          this.downloadCSV()
          
        }
        this.downloadNext()
      }
    },
    downloading: function(val){
      
      if(val == true){
        this.zip = new JSZip()
        this.downloadNext()
      }
    },
  },
}

</script>
