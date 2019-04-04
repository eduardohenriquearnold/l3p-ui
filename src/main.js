import Vue from 'vue';

import { store } from './_store';
import { router } from './_helpers';
import App from './app/App';

//Import bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

//Start app
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
