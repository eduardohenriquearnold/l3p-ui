<template>
    <div>
        <navbar/>

        <div class="col-sm-6 offset-sm-3">
        <h1>Welcome!</h1>
        <p>You're logged in to L3 Pilot Data Visualisation!</p>
        <p>
            <router-link to="/login">Logout</router-link>
        </p>
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
    }
};
</script>
