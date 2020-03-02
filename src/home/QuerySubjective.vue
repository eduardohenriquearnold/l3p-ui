<template>
<div>
  <form @submit.prevent="handleSubmit">

    <div class="form-row col-md-10 offset-sm-1">
        <div class="form-group col-md-3" >
            <label>Query Type</label>
            <select v-model="type" class="custom-select" >
              <option v-for="t in types">{{ t }}</option>
            </select>
        </div>
    </div>

    <div class="form-group col-md-12 ">
     <button type="submit" class="btn btn-primary">Submit</button>
      <ExportCSV :result="result" :selectedTags="selectedTags" :loading="loading"></ExportCSV>
    </div>

    <img v-show="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
    <div class="form-group col-md-6" v-show="loading">
    <b-progress :value="progressPercent" :max="progressMax" animated></b-progress>
    </div> 


    <!-- Results Table and pagination -->
    <b-table responsive striped hover :fields="resultFields" :items="result" :per-page="10" :current-page="currentPage" id="resultTable">
    </b-table>
    <b-pagination v-model="currentPage" :total-rows="result.length" :per-page="10" aria-controls="resultTable" v-if="result.length>0"></b-pagination>

    {{result.length}} results retrieved
  </form>
</div>
</template>

<script>
import { tagsService, measurementsService } from '../_services';
import ExportCSV from './Export_csv.vue'

export default {
  name:'QuerySubjective',
  components: {ExportCSV},
  data: function ()
  {
    return {
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
      result: [],
      currentPage: 1,
      loading: false,
      progressPercent: 0,
      progressMax: 1
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
      if (this.result.length>0)
      {
        var keys = Object.keys(this.result[0])
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
    tagsService.getTags(['Subjective-data','UI-Type']).then(res => {this.types = res})
    tagsService.getTags('UI-Condition').then(res => {this.conditions = res})
    tagsService.getTags('UI-RoadType').then(res => {this.roadTypes = res})
    tagsService.getTags('UI-DriverType').then(res => {this.driverTypes = res})
    tagsService.getConstraints('UI-Type-ScenarioType').then(res => {this.constraints = res})
  },
  methods: {
    handleSubmit: function(){
      this.result = []
      this.loading = true 
      this.progressPercent = 0
      measurementsService.getMeasurements({type:this.type, condition:this.condition, roadType:this.roadType, driverType:this.driverType, scenarioType:this.scenarioType})
        .then(promiseArray => promiseArray.forEach((prom, idx, arr) => {
          this.progressMax = arr.length
          prom.then(res => {this.result.push(...res); this.progressPercent += 1})
              .then(res => {if (!arr[idx+1]) this.loading = false})
        }))
   },
    toSciNotation: function(value){
      var value_array = value.split().map(x => x.split(',').map(function(str_value, index) {
        var number_value = Number(str_value)
        if (number_value % 1 === 0)
          return number_value
        else
          return number_value.toExponential(4)
      }).join(', '))
      
      return value_array
   }
  },
  watch: {
    allInputData: function(){
      this.result = []
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
