import config from 'config';
import axios from 'axios';

export const tagsService = {
    getTags
};

function getTags()
{
  return axios.get(`${config.apiUrl}/tags?filter={"tags.tagIDs":"measurementTag"}`)
  .then(res => {
     var tags = res.data.docs.map(it => it._id)
     tags.sort()
     return tags
   })
  .catch(err => {
    console.log(err)
  })
}
