import config from 'config';
import axios from 'axios';

export const featuresService = {
    getFeatures, getConstrainedFeatures, getConstrainedTags, deleteThing
};

function getFeatures()
{
  var query = `${config.apiUrl}/features`

  function makeReq(page=1, results=[])
  {
    return axios.get(query+`?page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(f => {return {id:f._id, order:f.order}})
      results.push(...curResults)

      if (page >= res.data.pages)
        return results

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  return makeReq()
}

function getConstrained(type1,type2)
{
  var query = `${config.apiUrl}/constraints?filter=[{"type1":"${type1}", "type2":"${type2}", "relationship":"dependency"}]`

  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(f => {return {element1: f.element1, element2: f.element2}})
      results.push(...curResults)

      if (page >= res.data.pages)
        return results

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  return makeReq()
}

function getConstrainedFeatures(){
  return getConstrained("Feature","Feature")
}

function getConstrainedTags(){
  return getConstrained("Feature", "Tag")
}

function deleteThing({thing='', feature=''}){
  var query = `${config.apiUrl}/measurements?filter={`
  
  if (feature == ''){
    query = query + `"thing": "${thing}"}`
  }else{
    query = query + `"$and":[{"thing": "${thing}"}, {"feature":"${feature}"}]}`
  }
  console.log(query)
  return axios.delete(query)
  


}
