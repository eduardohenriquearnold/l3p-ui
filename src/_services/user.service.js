import config from 'config';
import { authHeader } from '../_helpers';
import axios from 'axios';

export const userService = {
    login,
    logout
};

function login(username, password) {
    return axios.post(`${config.apiUrl}/login`, {"username" : username, "password":password })
        .then(response => {
            const token = response.data.token;

            // login successful if there's a jwt token in the response
            if (token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user-token', token);
                //Set axios Authorization header
                axios.defaults.headers.common['Authorization'] = token
            }

            return token;
        })
        .catch(error => {
          logout();
          return Promise.reject(error.response.data.message)
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user-token');
}
