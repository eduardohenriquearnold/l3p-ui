import axios from 'axios';

export const driversService = {
    getTypologies
};

function getTypologies()
{
    return ['Beginner', 'Advanced', 'Professional']
}
