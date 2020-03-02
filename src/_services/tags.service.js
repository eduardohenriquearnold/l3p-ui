import config from 'config';
import axios from 'axios';

export const tagsService = {
    getTags, getConstraints, getSpecificConstraint
};

//Allows a single string as tagType ("UI-RoadType") or a list of tags ([ "measurement","UI-RoadType"])
function getTags(tagType)
{
  var tagType = JSON.stringify(tagType)
  var query = `${config.apiUrl}/tags?filter={"tags": ${tagType}}`
  console.log(query)
  
  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(it => it._id)
      results.push(...curResults)

      if (page >= res.data.totalPages)
      {
        results.sort()
        return results
      }

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  return makeReq()
}

function getConstraints(tagType)
{
  var query = `${config.apiUrl}/constraints?filter=[{"tags":"${tagType}"}]`

  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(f => {return {element1: f.element1, element2: f.element2}})
      results.push(...curResults)

      if (page >= res.data.totalPages)
        return results

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  return makeReq()
}
//The performance of this function is only tested for Datapoints
function getSpecificConstraint(queryType, tagType)
{
  var query = `${config.apiUrl}/constraints?filter=[{"element1":"${queryType}","tags":"${tagType}"}]`

  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(f => {return {element1: f.element1, element2: f.element2}})
      results.push(...curResults)

      if (page >= res.data.totalPages)
        return results

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  return makeReq()
}
