<template>
<div>
    <button type="button" class="btn btn-primary" v-on:click="downloadCSV()" :disabled="submitted == false || totalResults == 0">Export</button>
    <img v-show="loading" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
    <div  v-show="loading">
        <b-progress :value="progressPercent" :max="progressMax" animated></b-progress>
    </div>
</div> 
</template>

<script>

export default{
    name: 'ExportCSV',
    props: ['selectedTags', 'submitted', 'totalResults', 'type', 'condition', 'roadType', 'driverType', 'scenarioType'],
    data: function ()
    {
        return {
        result: [],
        loading: false,
        progressPercent: 0,
        progressMax: 1
        }
    },
    methods: {
        toCSV: function(){
        const { Parser } = require('json2csv');
        var fields = Object.keys(this.result[0])
        const json2csvParser = new Parser({ fields });
        var csv = json2csvParser.parse(this.result);
        if (this.selectedTags.length>0)
        {
            var init = "Active Tags:, " + this.selectedTags.toString() + "\n"
            csv = init + csv
        }
        return csv


    },
    downloadCSV: function(){
        this.result = []
        this.loading = true 
        this.progressPercent = 0
        measurementsService.getMeasurements({type:this.type, condition:this.condition, roadType:this.roadType, driverType:this.driverType, scenarioType:this.scenarioType})
            .then(promiseArray => promiseArray.forEach((prom, idx, arr) => {
            this.progressMax = arr.length
            prom.then(res => {this.result.push(...res);this.progressPercent += 1})
                .then(res => {if (!arr[idx+1]) this.loading = false})
            })).then(function(){
                var data, filename, link;
                var csv = this.toCSV();
                if (csv == null) return;
                filename = 'export.csv';
                if (!csv.match(/^data:text\/csv/i)) {
                    csv = 'data:text/csv;charset=utf-8,' + csv;
                }
                data = encodeURI(csv);
                link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
    
    
    
    }
    }
}
</script>