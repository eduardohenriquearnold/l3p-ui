<template>
    <div>
        <navbar/>
        <div class="jumbotron">
          <div class="col-sm-6 offset-sm-3">
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
