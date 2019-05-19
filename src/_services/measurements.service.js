import config from 'config';
import axios from 'axios';
import moment from 'moment'

export const measurementsService = {
    getMeasurements
};

function getFeatureDimensions(feature)
{
  var query = `${config.apiUrl}/features/${feature}`
  return axios.get(query).then(res => {
    return res.data.dimensions
  })
  .catch(err => {
    console.log(err)  
  })
}

function formatDate(value){
      if (value)
        return moment(String(value)).format('DD/MM/YYYY hh:mm')
  }

function processRaw(res, featureDimensions){
    //Joint promise for both results and feat dimensions
    var Results = Promise.all([res, featureDimensions])

    //Keep only relevant fields for results
    return Results.then(resall => {
      var res = resall[0]
      var featdims = resall[1]
      var filtered = []

      res.forEach(m => {
        var data = {
          'trip_ID': m.thing,
          'measurement_ID': m._id,
          'start_date': formatDate(m.startDate),
          'end_date': formatDate(m.endDate),
        }

        for (let [index, dim] of featdims.entries())
          data[dim.name] = m.values[0].value[index][0]

        filtered.push(data)
      })

      return filtered
    })
    .catch(err => {console.log(err)})
}

function getMeasurements({tripID='', driverID='', feature='', pi='', tags=[], driverTypology='', driverMileageMin='', driverMileageMax='', driverYearsMin='', driverYearsMax=''})
{
  let query = []

  //Measurements related
  if (tripID!='')
    query.push({'thing':tripID})
  if (feature!='')
    query.push({'feature':feature})
  if (pi!='')
      query.push({'baseFeatures': pi})
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
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}}, { "$match":{ "$and": ${query}}}]`
    }
    else {
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}} ]`
    }

  console.log(req)

    //Get all result pages (API pagination)
    function makeReq(page=1, measurements=[])
    {
      return axios.get(req+`&page=${page}`)
      .then(res => {
        let data = res.data
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

    //Get feature dimensions (feature service)
    if (pi != '')
      var featureDimensions = getFeatureDimensions(pi)
    else
      var featureDimensions = getFeatureDimensions(feature)
    featureDimensions.then(res => {console.log(res)})

    return processRaw(makeReq(), featureDimensions)
}
