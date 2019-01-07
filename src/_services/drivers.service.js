import config from 'config';
import axios from 'axios';

export const driversService = {
    getTypologies
};

function getTypologies()
{
  return axios.get(`${config.apiUrl}/things?distinct="metadata.type"`)
  .then(res => {
     var types = res.data
     return types
   })
  .catch(err => {
    console.log(err)
  })
}
