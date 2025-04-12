import axios from 'axios';
import { getDefaultStore } from 'jotai';
import { identityAtom } from '../state'; // Assuming identityAtom holds the token info

// Create a new Axios instance
const apiClient = axios.create({
  // You can add base URL or other default settings here
  // baseURL: 'https://your-api.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const store = getDefaultStore();
    const identity = store.get(identityAtom);

    // Check if we have a token and it's not expired (basic check)
    if (identity && identity.AccessToken && identity.ExpiresIn > Date.now()) {
      config.headers.Authorization = `${identity.TokenType || 'Bearer'} ${identity.AccessToken}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// You can also add response interceptors here if needed
// apiClient.interceptors.response.use(...)

export default apiClient;
