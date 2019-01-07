import config from 'config';
import axios from 'axios';

export const featuresService = {
    getFeatures
};

function getFeatures()
{
  return axios.get(`${config.apiUrl}/features`)
  .then(res => {
     var features = res.data.docs.map(f => {return {id:f._id, order:f.order}})
     return features
   })
  .catch(err => {
    console.log(err)
  })
}
