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
  // Correction: Utiliser les noms de rôles exacts de votre backend
  role: 'client' | 'cuisinier' | 'livreur' | 'admin'; 
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
  // ⭐ AJOUT DE LA FONCTION DE MISE À JOUR LOCALE
  updateUserContext: (data: Partial<User>) => void;
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
  logout: async () => {},
  updateUserContext: () => {} // Initialisation
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

  // ⭐ NOUVELLE FONCTION: Mettre à jour l'objet utilisateur dans le contexte et AsyncStorage
  const updateUserContext = (data: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const newUser = { ...prevUser, ...data };
      
      // Mise à jour dans le stockage persistant
      AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    });
  };

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
        logout,
        // ⭐ EXPOSITION DE LA NOUVELLE FONCTION
        updateUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};