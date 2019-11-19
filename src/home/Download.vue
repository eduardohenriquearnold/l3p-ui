<template>

<div>

  <form @submit.prevent="handleDownload">
  <div class="form-group col-md-12">
    Click bellow to download ".zip" file containing whole database. 
  
  </div>
  <div class="form-group col-md-12">
    <button  class="btn btn-primary" type="submit" :disabled='downloading == true'>Download</button> 
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
import Excel from 'exceljs'
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
      excelReady: true,
      currentType: -1,
      currentScenario: -1,
      type: '',
      scenarioType: '',
      workbook: [],
      worksheets: [],
      currentFilename : "",
      zip:[],
    }
  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags('UI-Type').then(res => {this.types = res})
    tagsService.getSpecificConstraint('Datapoint','UI-Type-ScenarioType').then(res => {this.constraints = res})
    
  },
  

  methods: {
    handleDownload: function(){
      this.downloading = true
    },
    downloadNext: function(){
      if (this.type == 'Datapoint' && this.currentScenario < this.constraints.length-1) {
        this.currentScenario = this.currentScenario + 1
      }
      else{
        this.currentScenario = 0
        this.currentType = this.currentType + 1
      }
      
      // If all files are downloaded
      if (this.currentType >= this.types.length){
          this.currentType = -1 // it is the default reset value
          this.currrentScenario = -1 // it is the default reset value
          var filename = 'L3Pilot_all_measurements.zip'
          this.zip.generateAsync({type:"blob"})
          .then(function (blob) {
              saveAs(blob, filename)
              
          }).then(res =>{
            // Reset everything
            this.downloading = false
            this.zip = []
            this.workbook = []
            this.worksheets = []
            this.currentType = -1
            this.currentScenario = -1
            this.type = ''
            this.scenarioType = ''
            this.result = []
            this.currentFilename = ''
            })

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
      this.currentFilename = 'L3Pilot_all_measurements_' + this.type + '.xls'
      if (this.type == 'Datapoint')
      {
        this.worksheets.push(this.workbook.addWorksheet(this.scenarioType))
        if (this.result.length !== 0)
        {
          
          const fields = Object.keys(this.result[0])
          var columns = new Array(fields.length)
          for (var i=0; i<fields.length; i++)
          {
            columns[i] = {'header': fields[i], 'key': fields[i]}
          }
          this.worksheets[this.worksheets.length-1].columns = columns
          this.worksheets[this.worksheets.length-1].columns.forEach(
            column => {
            column.width = column.header.length < 12 ? 12 : column.header.length
            })
          this.worksheets[this.worksheets.length-1].addRows(this.result)
            
        }
        if (this.worksheets.length == this.constraints.length){
          this.excelReady = false
          this.workbook.xlsx.writeBuffer().then(data => {
            var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
            this.zip.file(this.currentFilename, blob, {binary: true})
            this.excelReady = true
          })
          
        }
        else{
          this.downloadNext()
        }  
      }
      else
      {
        if (this.result.length !== 0)
        {
          const csv = this.toCSV();
          this.zip.file(this.currentFilename, csv)
        }
        this.downloadNext()
      }
      
    }
    
  },


  watch: {
    finishedLoading: function(val){
      // When data is loaded from server start download
      if(val == true && this.downloading == true){
        this.downloadCSV() 
      }
    },
    downloading: function(val){
      // Start download if downloading become true
      
      if(val == true){
        
        this.zip = new JSZip()
        this.workbook = new Excel.Workbook()
        this.currentType = 0
        this.currentScenario = 0
        this.getResult()
      }
    },
    excelReady: function(val){ 
      if(val == true){
        this.downloadNext()
      }
    },

  },
}

</script>
