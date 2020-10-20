<template>
<div>
  <form @submit.prevent>

    <div class="form-row col-md-10 offset-sm-1">
        <div class="form-group col-md-3" >
            <label>Query Type</label>
            <select v-model="type" class="custom-select" >
              <option v-for="t in types">{{ t }}</option>
            </select>
        </div>
    </div>

    <div class="form-group col-md-12 ">
      <b-button squared variant="primary" v-on:click="handleSubmit()">Submit</b-button>
      <b-button squared variant="primary" v-on:click="handleExport()" :disabled="totalResults == 0">Export</b-button>
      <b-button v-show="submitted" squared disabled variant="success">{{totalResults}} results</b-button>
    </div>

    <img v-show="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
    <div class="form-group col-md-6" v-show="loading && progressPercent > 0">
      <b-progress :value="progressPercent" :max="progressMax" animated></b-progress>
    </div> 

    <!-- Results Table and pagination -->
    <b-table responsive striped hover  :fields="resultFields" :items="resultProvider" :per-page="10" :busy="loading" :current-page="currentPage" id="resultTable" v-if="submitted">
    </b-table>
    <b-pagination v-model="currentPage" :limit="10" :total-rows="totalResults" :per-page="10" aria-controls="resultTable" v-if="submitted && totalResults>0"></b-pagination>
  </form>
  <b-alert v-if="error" show variant="danger">{{error}}</b-alert>
</div>
</template>

<script>
import { tagsService, measurementsService } from '../_services';

export default {
  name:'QuerySubjective',
  
  data: function ()
  {
    return {
      submitted: false,
      loading: false,
      currentResults: [],
      type : '',
      types: [],
      condition: '',
      conditions: [],
      roadType: '',
      roadTypes: [],
      scenarioType: '',
      constraints: [],
      driverType: '',
      driverTypes: [],
      currentPage: 1,
      totalResults: 0,
      result: [],
      resultCSV: "",
      progressPercent: 0,
      progressMax: 1,
      error: '',
    }
  },
  computed: {
   selectedTags: function(){
      return [this.condition, this.roadType, this.scenarioType].filter(r=> r!='')
    },
    allInputData: function(){
      return this.type,this.selectedTags,this.driverType,Date.now()
    },
    scenarioTypes : function(){
      return this.constraints.filter(c => c.element1 === this.type).map(c => c.element2)
    },
    resultFields: function(){
      if (this.submitted == true && this.totalResults>0 && this.currentResults.length>0)
      {
        var keys = Object.keys(this.currentResults[0])
        var fields = []
        //Give label to keys having special characters (otherwise they automatic labelling remove them)
        keys.forEach(k => {
          var format = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/
          if (format.test(k))
            fields.push({key:k, label:k.replace(/_/g, " "), formatter:'toSciNotation'})
          else
            fields.push({key:k, formatter:'toSciNotation'})
        })
        return fields
      }
    }
  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags(['UI-Type','Subjective-data']).then(res => {this.types = res})
  },
  methods: {
    resultProvider: function(ctx){
      this.loading = true
      return measurementsService.getMeasurements({type:this.type, condition:this.condition, roadType:this.roadType, driverType:this.driverType, scenarioType:this.scenarioType, pageNumber:ctx.currentPage, limitRecords:ctx.perPage})
        .then(result => {this.totalResults = result[1]; const items = result[0][0]; return items || []})
        .then(items => {this.currentResults=items; this.loading = false; return items})
        .catch(err => {this.error = err; this.loading = false;})
    },

    handleSubmit: function(){
      this.submitted = true
      this.currentPage = 1
    },

    handleExport: function(){
      this.resultCSV = ""
      this.loading = true 
      var feature = (this.type=='Datapoint') ? this.scenarioType : this.type 
      measurementsService.getMeasurementsCSV({type:this.type, condition:this.condition, roadType:this.roadType, driverType:this.driverType, scenarioType:this.scenarioType})
          .then(promiseArray => {Promise.all(promiseArray).then(resultsArray=>{
            
            if(resultsArray.length != 0)
            {
              measurementsService.getFeatureDimensions(feature).then(res=>
              {
                var featureDimensions = res.join(',') + ",\n"
                this.resultCSV = featureDimensions + resultsArray.join('')
                this.loading = false
                this.DownloadCSV()
                
              }
              )
            }
            else{
              this.resultCSV = ""
              this.loading = false
            }
            
            
          }
          )
          })

    },

    DownloadCSV: function(){
      var data, filename, link;
      if (this.selectedTags.length>0)
      {
          var init = "Active Tags:," + this.selectedTags.toString() + "\n"
          this.resultCSV = init + this.resultCSV
      }
      var feature = (this.type=='Datapoint') ? this.scenarioType : this.type 
      filename = 'Queried_export_of_'+ feature +'.csv';
      if (!this.resultCSV.match(/^data:text\/csv/i)) {
          this.resultCSV = 'data:text/csv;charset=utf-8,' + this.resultCSV;
      }
      data = encodeURI(this.resultCSV);
      link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    toSciNotation: function(value){
      var value_array = value.split().map(x => x.split(',').map(function(str_value, index) {
        if (str_value == 'null' || str_value === '')
          return ''
        var number_value = Number(str_value)
        if (number_value%1 === 0)
          return number_value
        else if (Math.abs(number_value)>= 0.001)
          return Number.parseFloat(number_value).toFixed(3)
        else
          return number_value.toExponential(3)
      }).join(', ')).toString()
      
      return value_array
   }

  },
  watch: {
    allInputData: function(){
      this.submitted = false
      this.result = []
      this.totalResults = 0
      this.error = ''
    },
    type : function(){
      this.condition = ''
      this.roadType = ''
      this.scenarioType = (this.scenarioTypes.length>0) ? this.scenarioTypes[0] : ''
    },
 }
}
</script>

<style>
.table td{
  min-width: 100px; 
}
</style>
