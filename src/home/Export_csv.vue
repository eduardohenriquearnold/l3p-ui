<template>
<button type="button" class="btn btn-primary" v-on:click="downloadCSV()" :disabled="result.length == 0 || loading == true">Export</button>
</template>

<script>

export default{
    name: 'ExportCSV',
    props: ['result', 'selectedTags', 'loading'],

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
        }
    }
}
</script>