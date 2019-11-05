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
              <option value="" >All</option>
              <option v-for="f in features">{{ f }}</option>
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
import { tagsService, measurementsService } from '../_services';

export default {
  name:'Delete',
  data: function ()
  {
    return {
      thing:'',
      features: [],
      feature: '',
      deleteStr:'',
      successFlag: true,
      noTripFlag: false,
      userNotAllowedFlag: false,
    }
  },
  computed: {
    messageBoxClass: function(){
      return {
        'alert': true,
        'alert-success': this.successFlag,
        'alert-danger': this.noTripFlag,
        'alert-warning': this.userNotAllowedFlag,
      }
    },
    allInputData: function(){
      return this.feature, this.thing, Date.now()
    }
  },
  created: function(){
    //Load dynamic data from services
    tagsService.getTags('UI-Type').then(res => {this.features = res})
  },
  methods: {
    handleSubmit: function(){
       measurementsService.deleteThing({thing:this.thing, feature:this.feature}).then(response => {
       console.log(response)
       this.deleteStr = response.data.message
       this.successFlag = true 
       this.noTripFlag = false
       this.userNotAllowedFlag = false
    }).catch(err => {
      console.log(err.response.data)
      this.deleteStr = err.response.data.message
      this.successFlag = false
      if (err.response.data.status == 403)
        this.userNotAllowedFlag = true
      else
        this.noTripFlag = true
  })
   }
  },
  watch: {
    allInputData: function(){
      this.deleteStr = ''
    }
  }
}

</script>
