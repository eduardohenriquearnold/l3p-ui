import config from 'config';
import axios from 'axios';

export const measurementsService = {
    getMeasurements
};

function getMeasurements({tripID='', driverID='', feature='', baseFeature1='', baseFeature2='', tags=[], driverTypology='', driverMileageMin='', driverMileageMax='', driverYearsMin='', driverYearsMax=''})
{
  let query = []

  //Measurements related
  if (tripID!='')
    query.push({'thing':tripID})
  if (feature!='')
    query.push({'feature':feature})
  if (baseFeature1!='')
    if(baseFeature2!='')
      query.push({'baseFeatures': {"$size":2, "$all":[baseFeature1, baseFeature2]}})
    else
      query.push({'baseFeatures': {"$size":1, "$all":[baseFeature1]}})
  if (tags.length>0)
    query.push({'tags': {"$size":tags.length, "$all":tags}})

  //Driver related
  if (driverID!='')
    query.push({"thing_docs._id":driverID})
  if (driverTypology!='')
    query.push({"thing_docs.metadata.type":driverTypology})
  if (driverMileageMin != '')
    query.push({"thing_docs.metadata.mileage" : {"$gte" : driverMileageMin}})
  if (driverMileageMax != '')
    query.push({"thing_docs.metadata.mileage" : {"$lte" : driverMileageMax}})
  if (driverYearsMin != '')
    query.push({"thing_docs.metadata.years" : {"$gte" : driverYearsMin}})
  if (driverYearsMax != '')
    query.push({"thing_docs.metadata.years" : {"$lte" : driverYearsMax}})

  query = JSON.stringify(query)
  let req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}}, { "$match":{ "$and": ${query}}} ]`
  console.log(req)

  return axios.get(req)
  .then(res => {
     var measurements = res.data
     return measurements
   })
  .catch(err => {
    console.log(err)
  })
}
