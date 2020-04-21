import config from 'config';
import axios from 'axios';

export const measurementsService = {
    getMeasurements, deleteThing, getMeasurementsCSV, getFeatureDimensionsCSV
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

//Get List of names of dimensions of a given feature
function getFeatureDimensionsCSV(type='', scenarioType='')
{
  var feature = (type=='Datapoint') ? scenarioType : type
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
          data[dimName] = String(m.samples[0].values[index])  
        filtered.push(data)
      })

      return filtered
    })
    .catch(err => {console.log(err)})
}

//Returns array of promisses for each page of results
function getMeasurements({type='', condition='', roadType='', driverType='', scenarioType='', pageNumber=-1, limitRecords = 10})
{
  var feature = (type=='Datapoint') ? scenarioType : type
  var tags = [condition, roadType,driverType]

  //If not Trip_PI or Datapoint, tags should contain the ScenarioType (specification)
  if (!['Trip_PI','Datapoint'].includes(type))
    tags.push(scenarioType)

  //Remove empty tags
  tags = tags.filter(t => t!='')
    
  if (tags.length > 0)
  {
    tags = JSON.stringify(tags)
    tags = `, "tags": {"$all" : ${tags}}`
  }
  else
    tags = ''
  
  
  var req = `${config.apiUrl}/measurements?filter={"feature": "${feature}" ${tags}}`

  //Get dimensions name (column headers)
  var featureDimensions = getFeatureDimensions(feature)

  //Get results with pagination
  function getPage(page)
  {
    var curResults = axios.get(req+`&limit=${limitRecords}&page=${page}`)
    .then(res => res.data.docs)
    .then(raw => processRaw(raw, featureDimensions))
    .catch(err => {console.log(err)})

    return curResults
  }

  //Get number of pages and request all of them in parallell
  // requesting only one record and first page to get number of pages and docs
  var results = axios.get(req+`&limit=1&page=1`)
    .then(res => [res.data.totalPages, res.data.totalDocs])
    .then(tArray => {
      let [tPages, tDoc] = tArray
      var results = []
      // -1 means all pages
      if (pageNumber==-1)
      {
        for (var p=1; p<=tPages; p++)
          results.push(getPage(p))
      }
      else
      {  
        results.push(getPage(pageNumber))
        // If only one page is asked, results will contain total number of results (Docs)
        results = [results, tDoc]  
      }
      return results
    })
    .catch(err => {console.log(err)})

  return results
}



function getMeasurementsCSV({type='', condition='', roadType='', driverType='', scenarioType=''})
{
  var feature = (type=='Datapoint') ? scenarioType : type
  var tags = [condition, roadType,driverType]
  var limitRecords = 100 //Max num of records per API call
  //If not Trip_PI or Datapoint, tags should contain the ScenarioType (specification)
  if (!['Trip_PI','Datapoint'].includes(type))
    tags.push(scenarioType)

  //Remove empty tags
  tags = tags.filter(t => t!='')
    
  if (tags.length > 0)
  {
    tags = JSON.stringify(tags)
    tags = `, "tags": {"$all" : ${tags}}`
  }
  else
    tags = ''
  
  var req = `${config.apiUrl}/measurements?filter={"feature": "${feature}" ${tags}}&limit=${limitRecords}`

  //Get dimensions name (column headers)
  var featureDimensions = getFeatureDimensions(feature)

  //Get results with pagination
  function getPage(page)
  {
    var curResults = axios.get(req+`&page=${page}`,{
      headers:{
        'Accept': 'text/csv'
      }
    }).then(res =>res.data)
      .catch(err => {console.log(err)})
    return curResults
  }

  //Get number of pages and request all of them in parallell
  var countReq = `${config.apiUrl}/measurements/count?filter={"feature": "${feature}" ${tags}}`
  var results = axios.get(countReq)
    .then(res => Number(res.data.size))
    .then(resultsCount => {
      //console.log(countReq)
      //console.log(resultsCount)
      return Math.ceil(resultsCount/limitRecords)})
    .then(tPages =>{
      var results = []
      for (var p=1; p<=tPages; p++)
      {
        results.push(getPage(p))
      }
      return results
    })
    .catch(err => {console.log(err)})
  

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
