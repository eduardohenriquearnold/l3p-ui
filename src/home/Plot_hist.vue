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
      measurement.values.forEach(bin => {
        bin = bin.value
        //TODO: shouldn't width be specified by (end-start)?
        //ws.push(bin[1]-bin[0])
        ws.push(0.5)
        ys.push(bin[2])
        xs.push(bin[3])
      })

      traces.push({
           y: ys,
           x: xs,
           width: ws,
           name: measurement._id,
           type: 'bar',
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
              showticklabels: true,
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
