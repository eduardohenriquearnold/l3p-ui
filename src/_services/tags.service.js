import axios from 'axios';

export const tagsService = {
    getTags
};

function getTags()
{
    return ['ADF_ON', 'ADF_OFF', 'AUTOMATIC']
}
