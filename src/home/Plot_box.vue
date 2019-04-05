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

    this.result.forEach(function(m, idx){
      let q1 = m.min+2*m.stdev
      let q3 = m.max-2*m.stdev
      //TODO get q1,q3 from API.
      //TODO find a way of displaying avg correctly 
      traces.push({
           y: [m.min, q1, q1, m.med, q3, q3, m.max],
           name: m.measurement_ID,
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
