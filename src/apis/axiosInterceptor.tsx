import api from './api';
import axios from 'axios';

api.interceptors.response.use(
  function (response) {
    console.log('normal response', response);
    return response;
  },
  async function (error) {
    console.log('instance response error');

    const originalConfig = error.config; // 기존에 수행하려고 했던 작업
    const msg = error.response?.data?.msg; // error msg from backend
    const status = error.response?.status;

    if (status == 401) {
      if (msg == 'Token has expired') {
        console.log('refreshing token...');
        try {
          // Wait for the token to be refreshed
          await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/token/reissue`,
            { withCredentials: true }
          );
          console.log('Token refreshed successfully');

          // Retry the original request and await its response
          return await api.request(originalConfig);
        } catch (refreshError) {
          if (axios.isAxiosError(refreshError) && refreshError.response) {
            if (refreshError.response?.status === 401) {
              alert('Refresh token expired. Redirecting to login...');
              window.location.href = '/login';
            } else {
              alert('An error occurred during token refresh: ' + refreshError);
            }
            return Promise.reject(refreshError);
          }
        }
      } else if (msg == 'Invalid username or password') {
        alert('Invalid username or password');
      } else {
        console.log('error 401 with msg', msg);
      }
    } else if (status == 404) {
      if (msg == 'No current class found.') {
        alert('There is no class!');
      } else {
        console.log('error 401 with msg', msg);
      }
    } else if (status == 400 || status == 409) {
      console.log(msg);
      // console.log(msg)
    } else if (status == 422) {
      console.log('error 422 should redirect to login page');
      window.location.href = '/login';
      console.log('finished moving to login with status 422');
    }

    return Promise.reject(error);
  }
);

export default api;
