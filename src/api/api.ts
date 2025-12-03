import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

//   l'IP de la machine 
export const BASE_URL = 'http://192.168.1.211:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ---------- REQUEST INTERCEPTOR ---------- //

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- RESPONSE INTERCEPTOR ---------- //

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Token expiré → refresh logique
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token stored");

        // On utilise axios (sans l'intercepteur) pour ne pas créer une boucle infinie de refresh
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const newAccessToken = refreshResponse.data.data.accessToken;

        await AsyncStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError);

        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;