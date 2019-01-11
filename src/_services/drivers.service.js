import config from 'config';
import axios from 'axios';

export const driversService = {
    getTypologies, getDriver
};

function getTypologies()
{
  return axios.get(`${config.apiUrl}/things?distinct="metadata.type"`)
  .then(res => {
     var types = res.data.data
     return types
   })
  .catch(err => {
    console.log(err)
  })
}

function getDriver({id='', typology='', mileageMin='', mileageMax='', yearsMin='', yearsMax=''})
{
  let query = [{"tags":"driver"}]

  if (id != '')
    query.push({"_id":id})
  if (typology != '')
    query.push({"metadata.type":typology})
  if (mileageMin != '')
    query.push({"metadata.mileage" : {"$gte" : mileageMin}})
  if (mileageMax != '')
    query.push({"metadata.mileage" : {"$lte" : mileageMax}})
  if (yearsMin != '')
    query.push({"metadata.years" : {"$gte" : yearsMin}})
  if (yearsMax != '')
    query.push({"metadata.years" : {"$lte" : yearsMax}})

  query = JSON.stringify(query)

  return axios.get(`${config.apiUrl}/things?filter={"$and":${query}}`)
  .then(res => {return res.data.docs})
  .catch(err => {
    console.log(err)
  })

}
