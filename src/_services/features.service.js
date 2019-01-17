import config from 'config';
import axios from 'axios';

export const featuresService = {
    getFeatures
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
