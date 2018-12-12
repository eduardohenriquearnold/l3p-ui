<template>
    <div>
        <h1>Hi {{user}}!</h1>
        <p>You're logged in to L3 Pilot Data Visualisation!</p>

        <p>
            <router-link to="/login">Logout</router-link>
        </p>
    </div>
</template>

<script>
export default {
    computed: {
        user () {
            return this.$store.state.authentication.user;
        }
    }
};
</script>
