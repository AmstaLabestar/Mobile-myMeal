import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import api from '../api/api';

// ---------- TYPES ---------- //

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  role: 'client' | 'cooker' | 'admin' | 'deliveryPerson';
}

interface SignupData {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
  adresse?: string;
  role?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, motDePasse: string) => Promise<any>;
  signup: (data: SignupData) => Promise<any>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ---------- CONTEXTE ---------- //

const AuthContext = createContext<AuthContextData>({
  user: null,
  isLoading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

// ---------- PROVIDER ---------- //

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur chargement stockage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // ---------- SIGNUP ---------- //

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);

      const { user, accessToken, refreshToken } = response.data.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      setUser(user);

      return response.data;
    } catch (error: any) {
      console.log("Signup error :", error.response?.data || error.message);
      throw error.response?.data || error;
    }
  };

  // ---------- LOGIN ---------- //

  const login = async (identifier: string, motDePasse: string) => {
    try {
      const response = await api.post('/auth/login', { identifier, motDePasse });

      const { user, accessToken, refreshToken } = response.data.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      setUser(user);

      return response.data;
    } catch (error: any) {
      console.log("Login error:", error.response?.data || error.message);
      throw error.response?.data || error;
    }
  };

  // ---------- LOGOUT ---------- //

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error: any) {
      console.log("Logout backend error:", error.message);
    } finally {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      setUser(null);

      router.replace('./(auth)/login'); // sécurise le flux
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};






// _____________________________________________________________________________________________________________

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// import api from '../api/api';

// // ---------- TYPES ---------- //

// interface User {
//   _id: string;
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   adresse?: string;
//   role: 'client' | 'cooker' | 'admin' | 'deliveryPerson';
// }

// interface SignupData {
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   motDePasse: string;
//   adresse?: string;
//   role?: string;
// }

// interface AuthContextData {
//   user: User | null;
//   isLoading: boolean;
//   loading: boolean;                     // 👈 AJOUT ICI
//   login: (identifier: string, motDePasse: string) => Promise<any>;
//   signup: (data: SignupData) => Promise<any>;
//   logout: () => Promise<void>;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// // ---------- CONTEXTE ---------- //

// const AuthContext = createContext<AuthContextData>({
//   user: null,
//   isLoading: true,
//   loading: false,
//   login: async () => ({}),
//   signup: async () => ({}),
//   logout: async () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// // ---------- PROVIDER ---------- //

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loading, setLoading] = useState(false);   // 👈

//   // Chargement initial
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem('user');
//         const accessToken = await AsyncStorage.getItem('accessToken');

//         if (storedUser && accessToken) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (error) {
//         console.error("Erreur chargement stockage:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   // ---------- SIGNUP ---------- //

//   const signup = async (data: SignupData) => {
//     try {
//       setLoading(true);  // 👈

//       const response = await api.post('/auth/signup', data);

//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       setUser(user);

//       // Navigation automatique
//       router.replace('/(tabs)');  // 👈

//       return response.data;
//     } catch (error: any) {
//       console.log("Signup error :", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- LOGIN ---------- //

//   const login = async (identifier: string, motDePasse: string) => {
//     try {
//       setLoading(true);  // 👈

//       const response = await api.post('/auth/login', { identifier, motDePasse });

//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       setUser(user);

//       // Navigation automatique
//       router.replace('/(tabs)');   // 👈

//       return response.data;
//     } catch (error: any) {
//       console.log("Login error:", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- LOGOUT ---------- //

//   const logout = async () => {
//     try {
//       const refreshToken = await AsyncStorage.getItem('refreshToken');
//       if (refreshToken) {
//         await api.post('/auth/logout', { refreshToken });
//       }
//     } catch (error: any) {
//       console.log("Logout backend error:", error.message);
//     } finally {
//       await AsyncStorage.removeItem('user');
//       await AsyncStorage.removeItem('accessToken');
//       await AsyncStorage.removeItem('refreshToken');

//       setUser(null);

//       router.replace('/(auth)/login');  // 👈 FIX
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         loading,   // 👈 AJOUT DANS PROVIDER
//         login,
//         signup,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };




// ==================================================================================================

// AuthContext.tsx

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// import api from '../api/api'; // Assurez-vous que le chemin vers votre api.ts est correct

// // ---------- TYPES ---------- //

// interface User {
//   _id: string;
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   adresse?: string;
//   role: 'client' | 'cooker' | 'admin' | 'deliveryPerson';
// }

// interface SignupData {
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   motDePasse: string;
//   adresse?: string;
//   role?: string;
// }

// interface AuthContextData {
//   user: User | null;
//   isLoading: boolean; // Chargement initial (vérification du jeton)
//   loading: boolean;                    // Chargement des actions (login/signup)
//   login: (identifier: string, motDePasse: string) => Promise<any>;
//   signup: (data: SignupData) => Promise<any>;
//   logout: () => Promise<void>;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// // ---------- CONTEXTE ---------- //

// const AuthContext = createContext<AuthContextData>({
//   user: null,
//   isLoading: true,
//   loading: false, // Valeur initiale pour 'loading'
//   login: async () => ({}),
//   signup: async () => ({}),
//   logout: async () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// // ---------- PROVIDER ---------- //

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loading, setLoading] = useState(false); // État de chargement pour les mutations

//   /**
//    * 🔄 Chargement initial (Vérifie le jeton dans AsyncStorage)
//    */
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem('user');
//         const accessToken = await AsyncStorage.getItem('accessToken');

//         if (storedUser && accessToken) {
//           // Si un utilisateur et un jeton existent, chargez l'utilisateur
//           setUser(JSON.parse(storedUser));
//           // NOTE: L'intercepteur Axios se charge de valider/rafraîchir le jeton
//         } else {
//             // Si pas de jeton, rediriger vers l'écran d'authentification
//             router.replace('/(auth)/login');
//         }
//       } catch (error) {
//         console.error("Erreur chargement stockage:", error);
//         // En cas d'erreur de chargement, déconnecter et aller à l'écran de connexion
//         await AsyncStorage.clear();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   /**
//    * 📝 Inscription
//    */
//   const signup = async (data: SignupData) => {
//     try {
//       setLoading(true);

//       // 1. Appel API
//       const response = await api.post('/auth/signup', data);

//       // 2. Extraction et stockage des jetons/utilisateur
//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       // 3. Mise à jour de l'état local
//       setUser(user);

//       // 4. Navigation
//       router.replace('/(tabs)'); 

//       return response.data;
//     } catch (error: any) {
//       console.log("Signup error :", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * 🔑 Connexion
//    */
//   const login = async (identifier: string, motDePasse: string) => {
//     try {
//       setLoading(true);

//       // 1. Appel API
//       const response = await api.post('/auth/login', { identifier, motDePasse });

//       // 2. Extraction et stockage des jetons/utilisateur
//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       // 3. Mise à jour de l'état local
//       setUser(user);

//       // 4. Navigation
//       router.replace('/(tabs)'); 

//       return response.data;
//     } catch (error: any) {
//       console.log("Login error:", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * 🚪 Déconnexion
//    */
//   const logout = async () => {
//     try {
//       // 1. Informer le backend de la déconnexion
//       const refreshToken = await AsyncStorage.getItem('refreshToken');
//       if (refreshToken) {
//         await api.post('/auth/logout', { refreshToken });
//       }
//     } catch (error: any) {
//       // On ignore l'erreur backend ici car le but principal est de vider le stockage local
//       console.log("Logout backend error (ignored):", error.message);
//     } finally {
//       // 2. Nettoyage du stockage local
//       await AsyncStorage.removeItem('user');
//       await AsyncStorage.removeItem('accessToken');
//       await AsyncStorage.removeItem('refreshToken');

//       // 3. Mise à jour de l'état local
//       setUser(null);

//       // 4. Navigation vers l'écran de connexion
//       router.replace('/(auth)/login'); 
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         loading,   // Exportation de l'état de chargement des actions
//         login,
//         signup,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };








// _____________________________________________________________________________________________________________

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router';
// import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// import api, { authEvents } from '../api/api';

// // ---------- TYPES ---------- //

// interface User {
//   _id: string;
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   adresse?: string;
//   role: 'client' | 'cooker' | 'admin' | 'deliveryPerson';
// }

// interface SignupData {
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   motDePasse: string;
//   adresse?: string;
//   role?: string;
// }

// interface AuthContextData {
//   user: User | null;
//   isLoading: boolean;
//   loading: boolean;
//   login: (identifier: string, motDePasse: string) => Promise<any>;
//   signup: (data: SignupData) => Promise<any>;
//   logout: () => Promise<void>;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// // ---------- CONTEXTE ---------- //

// const AuthContext = createContext<AuthContextData>({
//   user: null,
//   isLoading: true,
//   loading: false,
//   login: async () => ({}),
//   signup: async () => ({}),
//   logout: async () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// // ---------- PROVIDER ---------- //

// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loading, setLoading] = useState(false);

//   /**
//    * 🔄 Chargement initial (Vérifie le jeton dans AsyncStorage)
//    */
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem('user');
//         const accessToken = await AsyncStorage.getItem('accessToken');

//         if (storedUser && accessToken) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (error) {
//         console.error("Erreur chargement stockage:", error);
//         await AsyncStorage.clear();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   /**
//    * 🔐 Écouter les événements de déconnexion (ex: refresh token échoué)
//    */
//   useEffect(() => {
//     const handleLogout = () => {
//       console.log("Logout triggered by auth event");
//       setUser(null);
//       router.replace('/(auth)/login');
//     };

//     authEvents.on('logout', handleLogout);

//     return () => {
//       authEvents.off('logout', handleLogout);
//     };
//   }, []);

//   /**
//    * 📝 Inscription
//    */
//   const signup = async (data: SignupData) => {
//     try {
//       setLoading(true);

//       const response = await api.post('/auth/signup', data);
//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       setUser(user);

//       // Navigation gérée par le layout selon le state user
//       return response.data;
//     } catch (error: any) {
//       console.log("Signup error:", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * 🔑 Connexion
//    */
//   const login = async (identifier: string, motDePasse: string) => {
//     try {
//       setLoading(true);

//       const response = await api.post('/auth/login', { identifier, motDePasse });
//       const { user, accessToken, refreshToken } = response.data.data;

//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);

//       setUser(user);

//       // Navigation gérée par le layout selon le state user
//       return response.data;
//     } catch (error: any) {
//       console.log("Login error:", error.response?.data || error.message);
//       throw error.response?.data || error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * 🚪 Déconnexion
//    */
//   const logout = async () => {
//     try {
//       const refreshToken = await AsyncStorage.getItem('refreshToken');
//       if (refreshToken) {
//         await api.post('/auth/logout', { refreshToken });
//       }
//     } catch (error: any) {
//       console.log("Logout backend error (ignored):", error.message);
//     } finally {
//       await AsyncStorage.removeItem('user');
//       await AsyncStorage.removeItem('accessToken');
//       await AsyncStorage.removeItem('refreshToken');

//       setUser(null);
//       router.replace('/(auth)/login');
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         loading,
//         login,
//         signup,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };