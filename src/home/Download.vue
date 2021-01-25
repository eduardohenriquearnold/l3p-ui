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
      types: [], // types of queries
      constraints: [], //constraints of queries
      result: '', // get measurements result
      featureDimensions: [], // get measurement feature dimensions
  
      downloading: false,
      measurementsReady: false,
      countReady: false,
      
      measurementsCountArr: [],
      typePointer: 0,
      currentType: 0,
      currentScenario: 0,
      type: '', // selected type for measurement query
      scenarioType: '', //selected scenario type for measurement query
      zip:[],
    }
  },
  created: function(){
    tagsService.getTags('UI-Type').then(res => {
      this.types = res
      /* Debugging logs
      console.log('all types:')
      console.log(JSON.stringify(this.types))
      */
      })
    tagsService.getSpecificConstraint('Datapoint','UI-Type-ScenarioType').then(res => {
      this.constraints = res
      /* Debugging logs
      console.log('all constraints:')
      console.log(JSON.stringify(this.constraints))
      */
      })
    
  },
  computed:{
    totalMeasurements: function(){
      return this.measurementsCountArr.reduce((a,b)=> a+b, 0)
    },
    progressPercent: function(){
      let downloadedMeasurementsArr = this.measurementsCountArr.slice(1, this.typePointer)
      let downloadedMeasurements = downloadedMeasurementsArr.reduce((a,b) => a+b,0)

      return Math.floor(this.progressMax * (downloadedMeasurements) / this.totalMeasurements)
    },
    downloadText: function(){
      return 'Downloading ' + this.type + 's ...'
    }
  },

  methods: {
    handleDownload: function(){
      this.downloading = true
      this.getResultCount()
    },
    downloadNext: function(){
      
      this.incrementTypePointer()
      // If all files are downloaded
      let filename = 'L3Pilot_all_measurements.zip'
      if (this.currentType >= this.types.length){
          this.zip.generateAsync({type:"blob"})
          .then(function (blob) {
              saveAs(blob, filename)
              
          }).then(res =>{
            this.resetFlags()
            })
      }
      else{
        this.measurementsReady = false
        this.getResult()
      }
    },
    
    getResultCount: function(){
      var countPromises = []
      this.types.forEach(type=>{
        if (type == 'Datapoint'){
          this.constraints.forEach(scenarioType =>{
            var scenarioType = scenarioType.element2
            countPromises.push(measurementsService.getMeasurementsCount({type:type, scenarioType:scenarioType}))
          })
        }else{
          var scenarioType = ''
          countPromises.push(measurementsService.getMeasurementsCount({type:type, scenarioType:scenarioType}))
        }
      })
      
      Promise.all(countPromises)
        .then(res => {
          this.measurementsCountArr = res
          this.countReady = true
          })
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
      this.measurementsReady = false
      
      
      var feature = (this.type=='Datapoint') ? this.scenarioType : this.type  
      /* Debugging logs
      console.log('query on:')
      console.log(this.type)
      console.log(this.scenarioType)
      */
      measurementsService.getMeasurementsPipe({type:this.type, scenarioType:this.scenarioType, onProgress:this.onProgress})
      .then(resultsArray=>{
        if(resultsArray.length != 0)
        {
          measurementsService.getFeatureDimensions(feature).then(res=>
          {
            this.featureDimensions = res.join(',') + "\n"
            this.result = this.featureDimensions + resultsArray
            this.measurementsReady = true
          }
          )
        }
        else{
          this.result = ''
          this.measurementsReady = true
        }
        
      }
      )
      
      
      
        
    },

   
    
    addToZip: function(){
      
      if (this.type == 'Datapoint')
        var currentFilename = 'L3Pilot_all_measurements_Datapoint_' + this.scenarioType + '.csv'
      else
        var currentFilename = 'L3Pilot_all_measurements_' + this.type + '.csv'
      
      if (this.result.length !== 0)
      {
        this.result = this.result.replace(/\[/g,"\"").replace(/\]/g,"\"")
        this.zip.file(currentFilename, this.result)
      }
      this.downloadNext()
      
      
    },

    resetFlags: function(){
      // Reset everything
      this.currentType = 0 
      this.currentScenario = 0 
      this.downloading = false
      this.countReady = false
      this.measurementsReady = false
      this.measurementsCountArr = []
      this.zip = []
      this.type = ''
      this.scenarioType = ''
      this.result = ''
      this.featureDimensions = []
      this.typePointer = 0

    },

    incrementTypePointer: function(){
      this.typePointer = this.typePointer + 1
      if (this.type == 'Datapoint' && this.currentScenario < this.constraints.length-1) {
        this.currentScenario = this.currentScenario + 1
      }
      else{
        this.currentScenario = 0
        this.currentType = this.currentType + 1
      }
    }
    
  },


  watch: {
    measurementsReady: function(val){
      // When data is loaded from server start download
      if(val == true && this.downloading == true){
        this.addToZip() 
      }
    },
    countReady: function(val){
      if (val == true){
        this.zip = new JSZip()
        this.getResult()
      }
    },

  },
}

</script>
