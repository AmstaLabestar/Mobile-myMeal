import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // ⬅️ IMPORTANT : axios brut sans intercepteurs
import { router } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import api, { BASE_URL } from '../api/api';

// ---------- TYPES ---------- //

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
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
  updateUserContext: () => {}
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

  // ---------- UPDATE USER LOCAL ---------- //

  const updateUserContext = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      AsyncStorage.setItem('user', JSON.stringify(updated));
      return updated;
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
        // axios brut → pas d’intercepteur → évite les boucles de refresh
        await axios.post(`${BASE_URL}/auth/logout`, { refreshToken });
      }
    } catch (error: any) {
      console.log("Erreur logout backend:", error.response?.data || error.message);
    } finally {
      // Suppression locale
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      setUser(null);

      router.replace('/(auth)/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateUserContext }}
    >
      {children}
    </AuthContext.Provider>
  );
};
