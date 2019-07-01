<template>
<div>
  <form @submit.prevent="handleSubmit">

    <div class="form-row col-md-12">
        <div class="form-group col-md-4" >
            <label>Trip ID</label>
            <input v-model="thing" class="form-control" placeholder="Enter the trip id">
            </input>
        </div>
    </div>

    <div class="form-row col-md-12"> 
        <div class="form-group col-md-4" >
            <label>Type</label>
            <select v-model="feature" class="custom-select" >
              <option ></option>
              <option v-for="f in highOrderFeatures">{{ f.id }}</option>
            </select>
        </div> 
    </div>


    <div class="form-group col-md-12">
      <button type="submit" class="btn btn-primary" :disabled="thing.length == 0">Delete</button>
    </div>

    <div id="messageBox" v-if="deleteStr.length > 0" v-bind:class="messageBoxClass" role="alert" >
    {{deleteStr}}
    </div>
  </form>
</div>
</template>

<script>
import { featuresService, measurementsService } from '../_services';

export default {
  name:'Delete',
  data: function ()
  {
    return {
      thing:'',
      features: [],
      feature: '',
      deleteStr:''
    }
  },
  computed: {
    messageBoxClass: function(){
      return {
        'alert': true,
        'alert-success': true,
        'alert-danger': false
      }
    },
    featureOrder : function(){
      var feat = this.features.filter(f => f.id === this.feature)
      if (feat.length>0)
        return feat[0].order
      else
        return 0
    },
    highOrderFeatures: function() {
      return this.features.filter(f => f.order > 0)
    },
    allInputData: function(){
      return this.feature, this.thing, Date.now()
    }
  },
  created: function(){
    //Load dynamic data from services
    featuresService.getFeatures().then(features => {this.features = features})
  },
  methods: {
    handleSubmit: function(){
      featuresService.deleteThing({thing:this.thing, feature:this.feature}).then(response => {
       console.log(response)
       this.deleteStr = response.data.message 
    })
      //measurementsService.getMeasurements({feature:this.feature, pi:this.pi, tags:this.selectedTags, driverTypology:this.driverTypology}).then(res => {this.result = res; this.loading = false;})
   }
  },
  watch: {
    allInputData: function(){
      this.deleteStr = ''
    }
  }
}

</script>
