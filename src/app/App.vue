<template>
 <router-view></router-view>
</template>

<script>
export default {
    name: 'app',
    computed: {
        alert () {
            return this.$store.state.alert
        }
    },
    watch:{
        $route (to, from){
            // clear alert on location change
            this.$store.dispatch('alert/clear');
        }
    }
};
</script>
