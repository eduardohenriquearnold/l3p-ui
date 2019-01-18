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
            <select v-model="feature" class="custom-select" @change="changeFeature()">
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

    <!-- Results Section -->
    <div v-if="result.length>0">

      <!-- Drivers table -->
      <table class="table" v-if="drivers">
          <thead class="thead-dark">
            <tr>
              <th scope="col">Driver ID</th>
              <th scope="col">Type</th>
              <th scope="col">Mileage</th>
              <th scope="col">Years</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="driver in result">
              <th scope="row">{{ driver._id }}</th>
              <td>{{ driver.metadata.type }}</td>
              <td>{{ driver.metadata.mileage }}</td>
              <td>{{ driver.metadata.years }}</td>
            </tr>
          </tbody>
      </table>

      <!-- Trips table -->
      <table class="table" v-if="trips">
          <thead class="thead-dark">
            <tr>
              <th scope="col">Trip ID</th>
              <th scope="col">Measurement ID</th>
              <th scope="col">Driver ID</th>
              <th scope="col">Start Date</th>
              <th scope="col">End Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in result">
              <th scope="row">{{ trip.thing }}</th>
              <td>{{ trip._id }}</td>
              <td>{{ trip.thing_docs[0]._id }}</td>
              <td>{{ trip.startDate | formatDate }}</td>
              <td>{{ trip.endDate | formatDate }}</td>
            </tr>
          </tbody>
      </table>

      <!-- Measurmeents table -->
      <table class="table" v-if="measurements">
          <thead class="thead-dark">
            <tr>
              <th scope="col">Trip ID</th>
              <th scope="col">Measurement ID</th>
              <th scope="col">Driver ID</th>
              <th scope="col">Start Date</th>
              <th scope="col">End Date</th>
              <th scope="col">Device</th>
              <!-- Stat specific Fields -->
              <th scope="col" v-if="feature==='Stat'">Avg</th>
              <th scope="col" v-if="feature==='Stat'">Stdev</th>
              <th scope="col" v-if="feature==='Stat'">Min</th>
              <th scope="col" v-if="feature==='Stat'">Max</th>
              <th scope="col" v-if="feature==='Stat'">Med</th>
              <th scope="col" v-if="feature==='Stat'">Samples</th>
              <!-- Corr specific Fields -->
              <th scope="col" v-if="feature==='Correlation'">Correlation Value</th>
              <th scope="col" v-if="feature==='Correlation'">P-Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in result">
              <th scope="row">{{ trip.thing }}</th>
              <td>{{ trip._id }}</td>
              <td>{{ trip.thing_docs[0]._id }}</td>
              <td>{{ trip.startDate | formatDate }}</td>
              <td>{{ trip.endDate | formatDate }}</td>
              <td>{{ trip.device }}</td>
              <!-- Stat specific Fields -->
              <td v-if="feature==='Stat'">{{ trip.values[0].value[0] }}</td>
              <td v-if="feature==='Stat'">{{ trip.values[0].value[1] }}</td>
              <td v-if="feature==='Stat'">{{ trip.values[0].value[2] }}</td>
              <td v-if="feature==='Stat'">{{ trip.values[0].value[3] }}</td>
              <td v-if="feature==='Stat'">{{ trip.values[0].value[4] }}</td>
              <td v-if="feature==='Stat'">{{ trip.values[0].value[5] }}</td>
              <!-- Corr specific Fields -->
              <td v-if="feature==='Correlation'">{{ trip.values[0].value[0] }}</td>
              <td v-if="feature==='Correlation'">{{ trip.values[0].value[1] }}</td>
            </tr>
          </tbody>
      </table>
    </div>

    <!-- Results plots -->
    <div v-if="result.length>0 && measurements">
      <PlotBox :result="result" v-if="feature==='Stat'" />
      <PlotHist :result="result" v-if="feature==='Histogram'" />
    </div>

    {{result.length}} results retrieved

  </form>
</div>
</template>

<script>
import moment from 'moment'
import { featuresService, tagsService, driversService, measurementsService } from '../_services';
import PlotBox from './Plot_box.vue'
import PlotHist from './Plot_hist.vue'

export default {
  name:'Query',
  components: {PlotBox, PlotHist},
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
      result: []
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
    measurements: function(){
      return this.query === 'measurements'
    },
    drivers: function(){
      return this.query === 'drivers'
    },
    trips: function(){
      return this.query === 'trips'
    },
    allInputData: function(){
      return this.query,this.tripID,this.driverID,this.feature,this.baseFeature1,this.baseFeature2,this.selectedTags,this.driverTypology,this.driverMileageMin,this.driverMileageMax,this.driverYearsMin,this.driverYearsMax, Date.now()
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
      this.result = []

      if (this.drivers)
        driversService.getDriver({id:this.driverID, typology:this.driverTypology, mileageMin:this.driverMileageMin, mileageMax:this.driverMileageMax, yearsMin:this.driverYearsMin, yearsMax:this.driverYearsMax}).then(res => {this.result = res})

      if (this.measurements)
        measurementsService.getMeasurements({tripID:this.tripID, driverID:this.driverID, feature:this.feature, baseFeature1:this.baseFeature1, baseFeature2:this.baseFeature2, tags:this.selectedTags, driverTypology:this.driverTypology, driverMileageMin:this.driverMileageMin, driverMileageMax:this.driverMileageMax, driverYearsMin:this.driverYearsMin, driverYearsMax:this.driverYearsMax}).then(res => {this.result = res})

      if (this.trips)
        measurementsService.getMeasurements({tripID:this.tripID, driverID:this.driverID, feature:this.feature, baseFeature1:this.baseFeature1, baseFeature2:this.baseFeature2})
        .then(res => {
          let ids = res.map(m => m.thing)
          let uniqueTrips = res.filter((v, i, a) => ids.indexOf(v.thing) === i);
          this.result = uniqueTrips
        })
    },
    changeFeature: function()
    {
      this.baseFeature1 = ''
      this.baseFeature2 = ''
    }
  },
  filters: {
    formatDate: function(value){
        if (value)
          return moment(String(value)).format('DD/MM/YYYY hh:mm')
    }
  },
  watch: {
    allInputData: function(){
      this.result = []
    }
  }


}
</script>
