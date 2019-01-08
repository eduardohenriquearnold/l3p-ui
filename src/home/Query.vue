<template>
<div>
  <form @submit.prevent="handleSubmit">

      <div class="form-group col-md-4">
      <label>Query on</label>
      <select v-model="query" class="custom-select">
        <option value="measurements">Measurements</option>
        <option value="trips">Trips</option>
        <option value="drivers">Drivers</option>
      </select>
    </div>

    <div class="form-row col-md-12">
      <div class="form-group col-md-4" v-if="measurements || trips">
        <label>Trip ID</label>
        <input v-model="tripID" type="text" class="form-control here">
      </div>

      <div class="form-group col-md-4" v-if="measurements || trips || drivers">
        <label>Driver ID</label>
        <input v-model="driverID" type="text" class="form-control here">
      </div>
    </div>

    <div class="form-row col-md-12" v-if="measurements || trips">
        <div class="form-group col-md-4" >
            <label>Feature</label>
            <select v-model="feature" class="custom-select">
              <option v-for="f in features">{{ f.id }}</option>
            </select>
        </div>

        <div class="form-group col-md-4" v-if="featureOrder>0">
          <label>Base Feature 1</label>
          <select v-model="baseFeature1" class="custom-select">
            <option v-for="f in firstOrderFeatures">{{ f.id }}</option>
          </select>
        </div>

        <div class="form-group col-md-4" v-if="featureOrder>1">
          <label>Base Feature 2</label>
          <select v-model="baseFeature2" class="custom-select">
            <option v-for="f in firstOrderFeatures">{{ f.id }}</option>
          </select>
        </div>
    </div>

    <div class="form-group col-md-12" v-if="measurements">
      <label class="checkbox-inline">Tags: </label>
        <div v-for="t in tags" class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" v-bind:id="t" v-bind:value="t" v-model="selectedTags">
        <label class="form-check-label" v-bind:for="t">{{ t }}</label>
        </div>
    </div>

    <div class="form-row col-md-12 align-items-end" v-if="measurements || drivers">
      <div class="form-group col-md-3">
        <label class="form-label-lg">Driver properties</label>
      </div>

      <div class="form-group col-md-3" >
        <label  class="col-form-label">Typology</label>
          <select v-model="driverTypology" class="custom-select">
            <option ></option>
            <option v-for="t in driverTypologies">{{ t }}</option>
          </select>
      </div>

      <div class="form-group col-md-3">
        <label>Mileage</label>
        <div class="input-group">
          <input v-model="driverMileageMin" type="text" class="form-control here" placeholder="min">
          <span class="input-group-btn" style="width:0px;"></span>
          <input v-model="driverMileageMax" type="text" class="form-control here" placeholder="max">
        </div>
      </div>

      <div class="form-group col-md-3">
        <label>Years</label>
        <div class="input-group">
          <input v-model="driverYearsMin" type="text" class="form-control here" placeholder="min">
          <span class="input-group-btn" style="width:0px;"></span>
          <input v-model="driverYearsMax" type="text" class="form-control here" placeholder="max">
        </div>
      </div>

    </div>

    <div class="form-group col-md-6" v-if="false">
      <div class="form-check">
      <input class="form-check-input" type="checkbox" id="ownership" v-model="ownership">
      <label class="form-check-label" for="ownership">Ownership</label>
      </div>
    </div>

    <div class="form-group col-md-12">
      <button type="submit" class="btn btn-primary">Submit</button>
    </div>

    {{ result }}

  </form>
</div>
</template>

<script>
import { featuresService, tagsService, driversService, measurementsService } from '../_services';

export default {
  name:'Query',
  data: function ()
  {
    return {
      query: '',
      tripID: '',
      driverID: '',
      features: [],
      feature: '',
      baseFeature1: '',
      baseFeature2: '',
      tags: [],
      selectedTags: [],
      driverTypologies: [],
      driverTypology: '',
      driverMileageMin: '',
      driverMileageMax: '',
      driverYearsMin: '',
      driverYearsMax: '',
      ownership: false,
      result: ""
    }
  },
  computed: {
    featureOrder : function(){
      var feat = this.features.filter(f => f.id === this.feature)
      //return feat.length
      if (feat.length>0)
      {
        return feat[0].order
      }
      else {
        return 0
      }
    },
    firstOrderFeatures: function() {
      return this.features.filter(f => f.order === 0)
    },
    measurements: function(){
      return this.query === 'measurements'
    },
    drivers: function(){
      return this.query === 'drivers'
    },
    trips: function(){
      return this.query === 'trips'
    }

  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags().then(tags => {this.tags = tags})
    driversService.getTypologies().then(typologies => {this.driverTypologies = typologies})
    featuresService.getFeatures().then(features => {this.features = features})
  },
  methods: {
    handleSubmit: function(){
      if (this.drivers)
        driversService.getDriver({id:this.driverID, typology:this.driverTypology, mileageMin:this.driverMileageMin, mileageMax:this.driverMileageMax, yearsMin:this.driverYearsMin, yearsMax:this.driverYearsMax}).then(res => {this.result = res})

      if (this.measurements)
        measurementsService.getMeasurements({tripID:this.tripID, driverID:this.driverID, feature:this.feature, baseFeature1:this.baseFeature1, baseFeature2:this.baseFeature2, tags:this.selectedTags, driverTypology:this.driverTypology, driverMileageMin:this.driverMileageMin, driverMileageMax:this.driverMileageMax, driverYearsMin:this.driverYearsMin, driverYearsMax:this.driverYearsMax}).then(res => {this.result = res})
    }
  }


}
</script>
