<template>
<div>
  <form>

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

    <div class="form-row col-md-12">
        <div class="form-group col-md-4" v-if="measurements">
            <label>Feature</label>
            <select v-model="feature" class="custom-select">
              <option v-for="f in features">{{ f.id }}</option>
            </select>
        </div>

        <div class="form-group col-md-4" v-if="measurements && featureOrder>0">
          <label>Base Feature 1</label>
          <select v-model="baseFeature1" class="custom-select">
            <option v-for="f in firstOrderFeatures">{{ f.id }}</option>
          </select>
        </div>

        <div class="form-group col-md-4" v-if="measurements && featureOrder>1">
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

    <div class="form-group col-md-6" v-if="drivers || trips">
      <div class="form-check">
      <input class="form-check-input" type="checkbox" id="ownership" v-model="ownership">
      <label class="form-check-label" for="ownership">Ownership</label>
      </div>
    </div>

    <div class="form-group col-md-12">
      <button type="submit" class="btn btn-primary">Submit</button>
    </div>

  </form>
</div>
</template>

<script>
import { featuresService, tagsService, driversService } from '../_services';

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
      ownership: false
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
  }


}
</script>
