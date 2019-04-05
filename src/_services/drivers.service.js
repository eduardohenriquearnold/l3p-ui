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
  query = `${config.apiUrl}/things?filter={"$and":${query}}`

  function makeReq(page=1, results=[])
  {
    return axios.get(query+`&page=${page}`)
    .then(res => {
      var curResults = res.data.docs
      results.push(...curResults)

      if (page >= res.data.pages)
        return results

      return makeReq(page+1, results)
     })
    .catch(err => {
      console.log(err)
    })
  }

  //Select data to present
  return makeReq().then(res => {
    var filtered = []
    res.forEach(driver => filtered.push({'driver_ID':driver._id,
                                         'type': driver.metadata.type,
                                         'mileage':driver.metadata.mileage,
                                         'years':driver.metadata.years}))
    return filtered
  })
}
