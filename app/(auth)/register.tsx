
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

interface SignupData {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
  adresse?: string;
  role: 'client' | 'cuisinier' | 'livreur' | 'admin'; // Ajout des rôles valides
}

const initialFormState: SignupData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  adresse: '',
  role: 'client', // Client par défaut
};

type Field = {
  key: keyof SignupData;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  icon: keyof typeof Feather.glyphMap;
};

// Réorganisation pour un meilleur flux utilisateur
const fields: Field[] = [
  { key: 'nom', placeholder: 'Nom', icon: 'tag' },
  { key: 'prenom', placeholder: 'Prénom', icon: 'tag' },
  { key: 'email', placeholder: 'Email (optionnel)', keyboardType: 'email-address', icon: 'mail' },
  { key: 'telephone', placeholder: 'Téléphone (optionnel)', keyboardType: 'phone-pad', icon: 'phone' },
  { key: 'motDePasse', placeholder: 'Mot de passe', secureTextEntry: true, icon: 'lock' },
  { key: 'adresse', placeholder: 'Adresse (optionnel)', icon: 'map-pin' },
];

const ROLES: { value: SignupData['role']; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { value: 'client', label: 'Client', icon: 'shopping-bag' },
    { value: 'cuisinier', label: 'Cuisinier', icon: 'award' }, // Rôle spécifique
];


export default function RegisterScreen() {
  const { signup } = useAuth();
  const [form, setForm] = useState<SignupData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: keyof SignupData, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const handleSignup = async () => {
    setError('');

    if (!form.nom || !form.prenom || !form.motDePasse || (!form.email && !form.telephone)) {
      setError("Veuillez remplir les champs obligatoires (Nom, Prénom, Mot de passe, Email OU Téléphone).");
      return;
    }

    setLoading(true);
    try {
      const dataToSend: SignupData = {
        ...form,
        email: form.email || undefined,
        telephone: form.telephone || undefined,
        adresse: form.adresse || undefined,
      };

      await signup(dataToSend);
      router.replace('/(tabs)');
    } catch (e: any) {
      const errorMessage = e.message || e.status === 'error' ? e.message : "Erreur d'inscription. Veuillez vérifier vos informations.";
      Alert.alert("Échec de l'inscription", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Créez votre compte</Text>
        <Text style={styles.subtitle}>Rejoignez notre communauté</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Champs de saisie */}
        {fields.map((field) => (
          <View key={field.key} style={styles.inputContainer}>
            <Feather name={field.icon} size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              secureTextEntry={field.secureTextEntry && !showPassword}
              keyboardType={field.keyboardType}
              value={form[field.key] || ''}
              onChangeText={(v) => handleChange(field.key, v)}
              autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              placeholderTextColor="#999"
            />
            {field.key === 'motDePasse' && (
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#777" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Sélecteur de Rôle */}
        <Text style={styles.roleTitle}>Quel est votre rôle ?</Text>
        <View style={styles.roleSelector}>
          {ROLES.map(({ value, label, icon }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.roleCard,
                form.role === value && styles.roleCardActive,
              ]}
              onPress={() => handleChange('role', value)}
            >
              <Feather name={icon} size={24} color={form.role === value ? '#fff' : '#007AFF'} />
              <Text style={[styles.roleLabel, form.role === value && styles.roleLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


        {/* Bouton d'inscription */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {"S'inscrire"}
              </Text>
          )}
        </TouchableOpacity>

        {/* Lien vers Connexion */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.linkText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  container: { paddingHorizontal: 30, backgroundColor: '#F5F7FA' }, 
  title: { fontSize: 32, fontWeight: '800', marginBottom: 5, textAlign: 'center', color: '#1A1A1A' },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 30, textAlign: 'center', color: '#777' },

  // Style pour l'input avec icône
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Coins plus arrondis
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Bordure subtile
  },
  icon: {
    paddingLeft: 15,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },

  // Bouton
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12, 
    marginTop: 30,
    minHeight: 55,
    justifyContent: 'center',
    shadowColor: '#007AFF', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  
  // Rôles
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  roleLabelActive: {
    color: '#fff',
  },

  // Liens
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#555',
    marginRight: 5,
  },
  linkText: { 
    color: '#007AFF', 
    fontWeight: '700', 
    fontSize: 16 
  },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
});