<template>
<div>
  <form @submit.prevent="handleSubmit">

    <div class="form-row col-md-12">
        <div class="form-group col-md-4" >
            <label>Type</label>
            <select v-model="feature" class="custom-select" >
              <option v-for="f in highOrderFeatures">{{ f.id }}</option>
            </select>
        </div>
    </div>

    <div class="form-row col-md-12"> 
        <div class="form-group col-md-4" >
            <label>Condition</label>
            <select v-model="condition" class="custom-select" >
              <option v-for="c in conditions">{{ c }}</option>
            </select>
        </div>

        <div class="form-group col-md-4" >
            <label>Road Type</label>
            <select v-model="roadType" class="custom-select" >
              <option v-for="r in roadTypes">{{ r }}</option>
            </select>
        </div>

        <div class="form-group col-md-4" v-if="constrainedScenarioTypes.length>0 && constrainedFeatures.length==0" >
            <label>Scenario Type</label>
            <select v-model="scenarioType" class="custom-select" >
              <option v-for="s in constrainedScenarioTypes">{{ s }}</option>
            </select>
        </div>

         <div class="form-group col-md-4" v-if="constrainedFeatures.length>0">
          <label>Scenario Type</label>
          <select v-model="pi" class="custom-select">
            <option v-for="f in constrainedFeatures">{{ f }}</option>
          </select>
        </div>  
    </div>

    <div class="form-row col-md-12 align-items-end"> 
      <div class="form-group col-md-3">
        <label class="form-label-lg">Metadata</label>
      </div>

      <div class="form-group col-md-3" >
        <label  class="col-form-label">Driver Type</label>
          <select v-model="driverTypology" class="custom-select">
            <option ></option>
            <option v-for="t in driverTypologies">{{ t }}</option>
          </select>
      </div>
    </div>

    <div class="form-group col-md-12">
      <button type="submit" class="btn btn-primary">Submit</button>
      <ExportCSV :result="result" :selectedTags="selectedTags" :loading="loading"></ExportCSV>
    </div>

    <img v-show="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />

    <!-- Results Table and pagination -->
    <b-table responsive striped hover :fields="resultFields" :items="result" :per-page="10" :current-page="currentPage" id="resultTable"></b-table>
    <b-pagination v-model="currentPage" :total-rows="result.length" :per-page="10" aria-controls="resultTable" v-if="result.length>0"></b-pagination>

    {{result.length}} results retrieved
  </form>
</div>
</template>

<script>
import { featuresService, tagsService, driversService, measurementsService } from '../_services';
import ExportCSV from './Export_csv.vue'

export default {
  name:'Query',
  components: {ExportCSV},
  data: function ()
  {
    return {
      features: [],
      featureRules: [],
      feature: '',
      pi: '',
      condition: '',
      conditions: [],
      roadType: '',
      roadTypes: [],
      scenarioType: '',
      scenarioTypes: [],
      tagRules: [],
      driverTypologies: [],
      driverTypology: '',
      result: [],
      currentPage: 1,
      loading: false
    }
  },
  computed: {
    featureOrder : function(){
      var feat = this.features.filter(f => f.id === this.feature)
      if (feat.length>0)
        return feat[0].order
      else
        return 0
    },
    firstOrderFeatures: function() {
      return this.features.filter(f => f.order === 0)
    },
    highOrderFeatures: function() {
      return this.features.filter(f => f.order > 0)
    },
    constrainedFeatures: function() {
      return this.featureRules.filter(r => r.element1 === this.feature).map(r => r.element2)
    },
    constrainedScenarioTypes: function() {
      return this.tagRules.filter(r => r.element1 === this.feature).filter(r => this.scenarioTypes.includes(r.element2)).map(r => r.element2)
    },
    selectedTags: function(){
      return [this.condition, this.roadType, this.scenarioType].filter(r=> r!='')
    },
    allInputData: function(){
      return this.feature,this.pi,this.selectedTags,this.driverTypology,Date.now()
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
            fields.push({key:k, label:k})
          else
            fields.push({key:k})
        })
        return fields
      }
    }
  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags('conditionTag').then(res => {this.conditions = res})
    tagsService.getTags('roadTypeTag').then(res => {this.roadTypes = res})
    tagsService.getTags('scenarioTag').then(res => {this.scenarioTypes = res})
    featuresService.getConstrainedTags().then(rules => {this.tagRules = rules})
    driversService.getTypologies().then(typologies => {this.driverTypologies = typologies})
    featuresService.getFeatures().then(features => {this.features = features})
    featuresService.getConstrainedFeatures().then(rules => {this.featureRules = rules})
  },
  methods: {
    handleSubmit: function(){
      this.result = []
      this.loading = true 
      measurementsService.getMeasurements({feature:this.feature, pi:this.pi, tags:this.selectedTags, driverTypology:this.driverTypology}).then(res => {this.result = res; this.loading = false;})
   }
  },
  watch: {
    allInputData: function(){
      this.result = []
    },
    feature: function(){
      this.pi= ''
      this.condition = ''
      this.roadType = ''
      this.scenarioType = ''
    },
 }
}
</script>
