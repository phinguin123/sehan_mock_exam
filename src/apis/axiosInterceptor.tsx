import api from './api';
import axios from 'axios';

// Request Interceptor: Automatically add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  function (response) {
    console.log('normal response', response);
    return response;
  },
  async function (error) {
    console.log('instance response error');

    const originalConfig = error.config; // 기존에 수행하려고 했던 작업
    const message = error.response?.data?.message; // error msg from backend
    const status = error.response?.status;

    if (status == 401) {
      if (message == 'Token has expired') {
        console.log('refreshing token...');
        try {
          // Wait for the token to be refreshed
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/auth/token/reissue`,
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );
          console.log('Token refreshed successfully');

          const newAccessToken = response.data.access_token;
          const newRefreshToken = response.data.refresh_token;

          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Retry the original request and await its response
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

          try {
            // Retry the original request here
            return await api.request(originalConfig);
          } catch (retryError) {
            // Handle errors during the retry but do NOT alert the user
            console.error('Error during retried request:', retryError);
            return Promise.reject(retryError); // You can choose whether to reject or return the response as needed
          }
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
      } else if (message == 'Invalid username or password') {
        alert('Invalid username or password');
      } else {
        console.log('error 401 with msg', message);
      }
    } else if (status == 404) {
      if (message == 'No current class found.') {
        alert('There is no class!');
      } else {
        console.log('error 401 with msg', message);
      }
    } else if (status == 400 || status == 409) {
      console.log(message);
      // console.log(msg)
    } else if (status == 422) {
      // when access token expires
      console.log('error 422 should redirect to login page');
      window.location.href = '/login';
      console.log('finished moving to login with status 422');
    } else if (status == 500) {
      if (message) {
        console.log('not alerting but just console logging error:', message);
      } else {
        alert('500 error occurred. Contact admin!!');
      }
      // redirect currently difficult... might lead to problem so temporarily comment out
      // window.location.href = '/500';
    }

    return Promise.reject(error);
  }
);

export default api;
