<template>
  <vue-plotly :data="data" :layout="layout" :options="options"/>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly'

export default{
  name: 'PlotHist',
  components: {VuePlotly},
  props: ['result'],
  data: function()
  {
    var traces = []

    this.result.forEach(function(measurement, idx){

      var ys=[]
      var xs=[]
      var ws=[]
      measurement.hist.forEach(bin => {
        ws.push(bin.binEnd - bin.binStart)     //width of the plot (bin size)
        ys.push(bin.count)                     //frequency or sample count
        xs.push(0.5*(bin.binEnd+bin.binStart)) //mid value of bin
      })

      traces.push({
           y: ys,
           x: xs,
           width: ws,
           name: measurement.measurement_ID,
           type: 'bar',
         })

    })

    return {
          data: traces,
          layout: {
            overmode: 'closest',
            barmode: 'relative',
            margin: {
              r: 80,
              l: 20
            },
            showlegend: true,
            width: 840,
            xaxis: {
              showticklabels: true,
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
