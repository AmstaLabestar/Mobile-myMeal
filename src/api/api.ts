import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.178:5000/api/v1';

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

        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const newAccessToken = refreshResponse.data.data.accessToken;

        await AsyncStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError);

        await AsyncStorage.clear();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;




// ==================================================================================

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { EventEmitter } from 'eventemitter3';

// const BASE_URL = 'http://192.168.11.157:5000/api/v1';

// // Créer un event emitter global pour les erreurs auth
// export const authEvents = new EventEmitter();

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' }
// });

// // ---------- REQUEST INTERCEPTOR ---------- //

// api.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ---------- RESPONSE INTERCEPTOR ---------- //

// let refreshAttempts = 0;
// const MAX_REFRESH_ATTEMPTS = 3;

// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     // Vérifier si c'est une erreur 401 et qu'on n'a pas déjà réessayé
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Ne pas faire de refresh pour les endpoints d'auth
//       const isAuthEndpoint = 
//         originalRequest.url.includes('/auth/login') ||
//         originalRequest.url.includes('/auth/signup') ||
//         originalRequest.url.includes('/auth/refresh');

//       if (isAuthEndpoint) {
//         return Promise.reject(error);
//       }

//       // Vérifier le nombre de tentatives
//       if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
//         refreshAttempts = 0;
//         await AsyncStorage.clear();
//         authEvents.emit('logout'); // Émettre l'événement de déconnexion
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;
//       refreshAttempts++;

//       try {
//         const refreshToken = await AsyncStorage.getItem('refreshToken');
//         if (!refreshToken) {
//           throw new Error("No refresh token stored");
//         }

//         // Appel direct avec axios pour éviter les intercepteurs
//         const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
//           refreshToken
//         });

//         const newAccessToken = refreshResponse.data.data.accessToken;

//         // Stocker le nouveau token
//         await AsyncStorage.setItem('accessToken', newAccessToken);

//         // Mettre à jour le header de la requête originale
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         // Réinitialiser le compteur de tentatives
//         refreshAttempts = 0;

//         // Relancer la requête originale
//         return api(originalRequest);

//       } catch (refreshError) {
//         console.log("Refresh token failed:", refreshError);

//         // Nettoyer le stockage
//         await AsyncStorage.clear();
//         refreshAttempts = 0;

//         // Émettre l'événement de déconnexion
//         authEvents.emit('logout');

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;