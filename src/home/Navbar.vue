<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <a class="navbar-brand" href="#">L3 Pilot Data</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/query">Queries</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/delete">Delete</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/download">Download</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/login">Logout</router-link></li>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name:'navbar'

}
</script>

<style>
.navbar-dark {
  background-color:#174a6d;
}
</style>
