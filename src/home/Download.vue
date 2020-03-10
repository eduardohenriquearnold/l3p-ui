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
    {{downloadText}}
  </div>

  <div class="form-group col-md-6" v-show="downloading">
  <b-progress :value="progressPercent" :max="progressMax" animated></b-progress>
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
      progressMax: 100,
      types: [],
      constraints: [],
      result: '',
      featureDimensions: [],
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
  computed:{
    progressPercent: function(){
      
      return Math.floor(this.progressMax * (this.currentType+1) / this.types.length)
    },
    downloadText: function(){
      return 'Downloading ' + this.type + 's ...'
    }
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
            this.result = ''
            this.featureDimensions = []
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
      
      this.result = ''
      this.featureDimensions = []
      this.finishedLoading = false
      
      var feature = (this.type=='Datapoint') ? this.scenarioType : this.type
      measurementsService.getFeatureDimensionsCSV(feature).then(res=>{
        this.featureDimensions = res.join(', ') + "\n"
        //console.log(res)
        measurementsService.getMeasurementsCSV({type:this.type, scenarioType:this.scenarioType})
        .then(promiseArray => {Promise.all(promiseArray).then(resultsArray=>{
          //console.log('done');
          this.finishedLoading = true
          this.result = this.featureDimensions + resultsArray.join()
          //console.log(this.result)
        }
        )
       })
      })
      
        
    },

   
    
    downloadCSV: function(){
      
      if (this.type == 'Datapoint')
        this.currentFilename = 'L3Pilot_all_measurements_Datapoint_' + this.scenarioType + '.xls'
      else
        this.currentFilename = 'L3Pilot_all_measurements_' + this.type + '.xls'
      
      if (this.result.length !== 0)
      {
        this.result = this.result.replace(/\[/g,"\"").replace(/\]/g,"\"")
        this.zip.file(this.currentFilename, this.result)
      }
      this.downloadNext()
      
      
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
