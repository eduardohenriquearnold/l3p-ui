<template>
  <vue-plotly :data="data" :layout="layout" :options="options"/>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly'

export default{
  name: 'PlotBox',
  components: {VuePlotly},
  props: ['result'],
  data: function()
  {
    var traces = []

    this.result.forEach(function(measurement, idx){
      let [avg, std, min, max, med, n_samples] = measurement.values[0].value
      let q1 = min+2*std
      let q3 = max-2*std
      //TODO get q1,q3 from API.
      //TODO find a way of displaying avg correctly 
      traces.push({
           y: [min, q1, q1, med, q3, q3, max],
           name: measurement._id,
           type: 'box',
           boxmean: true,
         })

    })

    return {
          data: traces,
          layout: {
            autosize: true,
            boxmode: 'group',
            hovermode: 'closest',
            margin: {
              r: 80,
              l: 20
            },
            showlegend: true,
            width: 840,
            xaxis: {
              autorange: true,
              showticklabels: false,
              type: 'category'
            },
            yaxis: {
              autorange: true,
              title: '',
              type: 'linear'
            }
          },
          options: {}
        }
  }
}
</script>
