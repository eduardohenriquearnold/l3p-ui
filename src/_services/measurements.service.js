import config from 'config';
import axios from 'axios';

export const measurementsService = {
    getMeasurements,deleteThing
};

//Get List of names of dimensions of a given feature
function getFeatureDimensions(feature)
{
  var query = `${config.apiUrl}/features/${feature}`
  return axios.get(query).then(res => {
    var dimensions = res.data.items.map(d => d.name)
    return dimensions 
  })
  .catch(err => {
    console.log(err)  
  })
}

function processRaw(res, featureDimensions){
    //Joint promise for both results and feat dimensions
    var Results = Promise.all([res, featureDimensions])

    //Keep only relevant fields for results
    return Results.then(allresults => {
      let [res, featdims] = allresults
      var filtered = []

      res.forEach(m => {
        var data = {}

        for (let [index, dimName] of featdims.entries())
          data[dimName] = m.samples[0].values[index].join(',')

        filtered.push(data)
      })

      return filtered
    })
    .catch(err => {console.log(err)})
}

function getMeasurements({type='', condition='', roadType='', driverType='', scenarioType=''})
{
  var feature = (type=='Datapoint') ? scenarioType : type
  var tags = [condition, roadType,driverType]

  //If not Trip_PI or Datapoint, tags should contain the ScenarioType (specification)
  if (!['Trip_PI','Datapoint'].includes(type))
    tags.push(scenarioType)

  //Remove empty tags
  tags = tags.filter(t => t!='')
  tags = JSON.stringify(tags)
    
  var req = `${config.apiUrl}/measurements?filter={"feature": "${feature}", "tags": {"$all": ${tags} }}`

  //Get all result pages (API pagination)
  function makeReq(page=1, measurements=[])
  {
    return axios.get(req+`&page=${page}`)
    .then(res => {
      let data = res.data
      var curMeasurements = data.docs
      measurements.push(...curMeasurements)

      if (page >= data.totalPages)
        return measurements

      return makeReq(page+1, measurements)
     })
    .catch(err => {
      console.log(err)
    })
  }

  var featureDimensions = getFeatureDimensions(feature)

  var results = processRaw(makeReq(), featureDimensions)
  return results 
}

function deleteThing({thing='', feature=''}){
  var query = `${config.apiUrl}/measurements?filter={`
  
  if (feature == ''){
    query = query + `"thing": "${thing}"}`
  }else{
    query = query + `"$and":[{"thing": "${thing}"}, {"feature":"${feature}"}]}`
  }
  return axios.delete(query)
}
