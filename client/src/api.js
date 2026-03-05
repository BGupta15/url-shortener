import axios from 'axios'; //axios was to make http requests

const api = axios.create({baseURL: 'http://localhost:3000'});

api.interceptors.request.use((config) => { //inceptors runs everytime before a request is sent any time you do api.get/post/put()
    const token = localStorage.getItem('token'); //jwt token stored after login
    if(token) 
        config.headers.Authorization = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api; //now everywhere i can use api with token attached automatically

//user logs in backend sends jWT frontent stores it in local storage, for every future use inceptor grabs the token and adds it to the header and backend verifies it - if it is valid then request is allowed

//locastorage is browser's built in storage