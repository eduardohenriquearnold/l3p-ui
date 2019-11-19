<template>
    <div>
        <navbar/>
        <div class="jumbotron lightbg">
          <div class="col-sm-12">
              <router-view></router-view>
          </div>
        </div>
    </div>
</template>

<script>
import navbar from './Navbar.vue'

export default {
    computed: {
        user () {
            return this.$store.state.authentication.user;
        }
    },
    components:
    {
      navbar
    },
    name: 'Dash'

};
</script>

<style>
.lightbg {
  background-color: rgb(244, 245, 247);
}

body{
  color: #172b4d;
}
</style>
