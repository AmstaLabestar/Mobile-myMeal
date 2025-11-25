import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

interface SignupData {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
  adresse?: string;
  role?: string;
}

const initialFormState: SignupData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  adresse: '',
  role: 'client',
};

type Field = {
  key: keyof SignupData;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
};

const fields: Field[] = [
  { key: 'nom', placeholder: 'Nom' },
  { key: 'prenom', placeholder: 'Prénom' },
  { key: 'email', placeholder: 'Email (optionnel)', keyboardType: 'email-address' },
  { key: 'telephone', placeholder: 'Téléphone (optionnel)', keyboardType: 'phone-pad' },
  { key: 'motDePasse', placeholder: 'Mot de passe', secureTextEntry: true },
  { key: 'adresse', placeholder: 'Adresse (optionnel)' },
];

export default function RegisterScreen() {
  const { signup } = useAuth();
  const [form, setForm] = useState<SignupData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: keyof SignupData, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const handleSignup = async () => {
    setError('');

    if (!form.nom || !form.prenom || !form.motDePasse || (!form.email && !form.telephone)) {
      setError("Veuillez remplir votre nom, prénom, mot de passe et fournir un email ou un téléphone.");
      return;
    }

    setLoading(true);
    try {
      const dataToSend: SignupData = {
        nom: form.nom,
        prenom: form.prenom,
        motDePasse: form.motDePasse,
        email: form.email || undefined,
        telephone: form.telephone || undefined,
        adresse: form.adresse || undefined,
        role: form.role,
      };

      await signup(dataToSend);

      // Après inscription réussie, navigation gérée dans AuthContext ou layout
       router.replace('/');
    } catch (e: any) {
      const errorMessage =
        e.message || e.status === 'error'
          ? e.message
          : "Erreur d'inscription. Veuillez vérifier vos informations.";

      Alert.alert("Échec de l'inscription", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {fields.map((field) => (
        <TextInput
          key={field.key}
          style={styles.input}
          placeholder={field.placeholder}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
          value={form[field.key] || ''}
          onChangeText={(v) => handleChange(field.key, v)}
          autoCapitalize={field.key === 'email' ? 'none' : 'words'}
        />
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>S&apos;inscrire</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 30, textAlign: 'center' },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15 },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 15 },
});
