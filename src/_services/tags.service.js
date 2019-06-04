import config from 'config';
import axios from 'axios';

export const tagsService = {
    getTags
};

function getTags(tagType)
{
  var query = `${config.apiUrl}/tags?filter={"tags.tagIDs":"${tagType}"}`
  
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
