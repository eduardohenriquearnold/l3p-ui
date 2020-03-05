<template>
  <div>
  <b-navbar toggleable="sm" type="dark">
    <b-navbar-nav>
      <b-navbar-brand href="#">L3 Pilot Data</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-nav-item to="/">Home</b-nav-item>
      <b-nav-item to="/queryVehicular">Vehicular Query</b-nav-item>
      <b-nav-item to="/querySubjective">Subjective Query</b-nav-item>
      <!-- <b-nav-item-dropdown text="Query" right> -->
          <!-- <b-dropdown-item to="/queryVehicular">Vehicular</b-dropdown-item> -->
          <!-- <b-dropdown-item to="/querySubjective">Subjective</b-dropdown-item> -->
      <!-- </b-nav-item-dropdown> -->
      <b-nav-item to="/delete">Delete</b-nav-item>
      <b-nav-item to="/download">Download</b-nav-item>
      <b-nav-item to="/login">Logout</b-nav-item>
    </b-navbar-nav>
  </b-navbar>
  </div>
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
