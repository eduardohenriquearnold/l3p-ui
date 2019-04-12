import config from 'config';
import axios from 'axios';
import moment from 'moment'

const JSON5 = require('json5')

export const measurementsService = {
    getMeasurements
};

function formatDate(value){
      if (value)
        return moment(String(value)).format('DD/MM/YYYY hh:mm')
  }

function processRaw(res){
    //Keep only relevant fields for results
    return res.then(res => {
      var filtered = []

      res.forEach(m => {
        var data = {
          'trip_ID': m.thing,
          'measurement_ID': m._id,
          'start_date': formatDate(m.startDate),
          'end_date': formatDate(m.endDate),
        }

        if (m.feature == 'Stat'){
          data.avg     = m.values[0].value[0]
          data.stdev   = m.values[0].value[1]
          data.min     = m.values[0].value[2]
          data.max     = m.values[0].value[3]
          data.med     = m.values[0].value[4]
          data.samples = m.values[0].value[5]
        }

        if (m.feature == 'Correlation'){
          data.correlation_value = m.values[0].value[0]
          data.P_value           = m.values[0].value[1]
        }

        if (m.feature == 'Single value PI'){
          data.PI = m.values[0].value[0]
        }

        if (m.feature == 'Histogram'){
          data.hist = m.values
        }

        filtered.push(data)
      })

      return filtered
    })
}

function getMeasurements({tripID='', driverID='', feature='', baseFeature1='', baseFeature2='', tags=[], driverTypology='', driverMileageMin='', driverMileageMax='', driverYearsMin='', driverYearsMax=''})
{
  let query = []

  //Measurements related
  if (tripID!='')
    query.push({'thing':tripID})
  if (feature!='')
    query.push({'feature':feature})
  if (baseFeature1!='')
    if(baseFeature2!='')
      query.push({'baseFeatures': {"$size":2, "$all":[baseFeature1, baseFeature2]}})
    else
      query.push({'baseFeatures': {"$size":1, "$all":[baseFeature1]}})
  if (tags.length>0)
    query.push({'tags': {"$size":tags.length, "$all":tags}})

  //Driver related
  if (driverID!='')
    query.push({"thing_docs._id":driverID})
  if (driverTypology!='')
    query.push({"thing_docs.metadata.type":driverTypology})
  if (driverMileageMin != '')
    query.push({"thing_docs.metadata.mileage" : {"$gte" : driverMileageMin}})
  if (driverMileageMax != '')
    query.push({"thing_docs.metadata.mileage" : {"$lte" : driverMileageMax}})
  if (driverYearsMin != '')
    query.push({"thing_docs.metadata.years" : {"$gte" : driverYearsMin}})
  if (driverYearsMax != '')
    query.push({"thing_docs.metadata.years" : {"$lte" : driverYearsMax}})

  if (query.length>0)  {
      query = JSON.stringify(query)
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}}, { "$match":{ "$and": ${query}}} ]`
    }
    else {
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}} ]`
    }

    //Get all result pages (API pagination)
    function makeReq(page=1, measurements=[])
    {
      return axios.get(req+`&page=${page}`)
      .then(res => {
        let data = JSON5.parse(res.data)
        var curMeasurements = data.data
        measurements.push(...curMeasurements)

        if (page >= data.totalPages)
          return measurements

        return makeReq(page+1, measurements)
       })
      .catch(err => {
        console.log(err)
      })
    }

    return processRaw(makeReq())
}
