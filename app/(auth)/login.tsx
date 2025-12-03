
import { Feather } from '@expo/vector-icons'; // Assurez-vous d'avoir @expo/vector-icons installé
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Pour afficher/masquer le mot de passe

  // ... (handleLogin reste inchangé)
  const handleLogin = async () => {
    if (loading) return; 
    if (!identifier || !motDePasse) {
      Alert.alert("Erreur", "Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await login(identifier, motDePasse);
      router.replace('/(tabs)');
    } catch (e: any) {
      const errorMessage = e.message || e.status === 'error' ? e.message : 'Identifiants incorrects.';
      Alert.alert("Erreur de connexion", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur myMeal !</Text>
      <Text style={styles.subtitle}>Connectez-vous et pour profiter de nos services </Text>

      {/* Input Identifiant */}
      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email ou Téléphone"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address" // Fonctionne aussi pour le téléphone si l'utilisateur change d'avis
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      {/* Input Mot de passe */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          value={motDePasse}
          onChangeText={setMotDePasse}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* Lien Mot de passe oublié */}
      <TouchableOpacity 
        style={styles.forgotPassword} 
        onPress={() => Alert.alert('Fonctionnalité', 'Redirection vers la page Mot de passe oublié...')} // À implémenter
      >
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {/* Bouton de connexion */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      {/* Lien vers Inscription */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ?</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
          <Text style={styles.linkText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#F5F7FA' }, // Fond plus doux
  title: { fontSize: 32, fontWeight: '800', marginBottom: 5, textAlign: 'center', color: '#1A1A1A' },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 40, textAlign: 'center', color: '#777' },
  
  // Style pour l'input avec icône
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Coins plus arrondis
    marginBottom: 20,
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
    borderRadius: 12, // Coins arrondis du bouton
    marginTop: 20,
    minHeight: 55,
    justifyContent: 'center',
    shadowColor: '#007AFF', // Ombre pour l'effet "pop"
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  
  // Liens
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
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
});