import axios from 'axios';

export const featuresService = {
    getFeatures
};

function getFeatures()
{
    return [{id:'Acceleration', order:0}, {id:'Speed', order:0}, {id:'Stat', order:1}, {id:'Corr', order:2}]
}
