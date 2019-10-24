import config from 'config';
import axios from 'axios';

export const tagsService = {
    getTags, getConstraints
};

function getTags(tagType)
{
  var query = `${config.apiUrl}/tags?filter={"tags":"${tagType}"}`
  
  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs.map(it => it._id)
      results.push(...curResults)

      if (page >= res.data.pages)
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
