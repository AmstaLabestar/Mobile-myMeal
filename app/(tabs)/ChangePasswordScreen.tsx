import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../src/api/api";
import { useAuth } from "../../src/context/AuthContext";

// Couleurs (Les mêmes que ProfileScreen.tsx pour la cohérence)
const COLORS = {
  primary: "#FF7043", // Orange Chaud
  secondary: "#1E88E5", // Bleu
  background: "#F7F8F9",
  card: "#FFFFFF",
  text: "#212121",
  subtitle: "#757575",
  placeholderText: "#A0A0A0",
  border: "#E0E0E0",
  danger: "#EF5350",
};

export default function ChangePasswordScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");

  // Validation de base pour le frontend
  const validateForm = () => {
    if (!ancienMotDePasse || !nouveauMotDePasse || !confirmerMotDePasse) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return false;
    }
    if (nouveauMotDePasse.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return false;
    }
    if (nouveauMotDePasse !== confirmerMotDePasse) {
      Alert.alert("Erreur", "Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return false;
    }
    if (ancienMotDePasse === nouveauMotDePasse) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit être différent de l'ancien.");
      return false;
    }
    return true;
  };

  // 🚀 LOGIQUE DE CHANGEMENT DE MOT DE PASSE
  const handleChangePassword = async () => {
    if (!validateForm() || !user?._id) {
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ancienMotDePasse,
        nouveauMotDePasse,
      };

      // 1. Appel au endpoint changePassword du backend
      await api.put(`/users/change-password/${user._id}`, payload); 
      
      // 2. Succès
      Alert.alert(
        "Succès",
        "Votre mot de passe a été changé avec succès. Vous devez vous reconnecter.",
        [{ text: "OK", onPress: () => logout() }] // Déconnexion forcée par sécurité
      );
      
      // 3. Réinitialiser les champs
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmerMotDePasse('');
      
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors du changement de mot de passe. Veuillez réessayer.";
      
      // Gérer l'erreur "Ancien mot de passe incorrect" (401)
      if (error.response?.status === 401) {
          Alert.alert("Échec de la mise à jour", "L'ancien mot de passe est incorrect.");
      } else {
          Alert.alert("Erreur de mise à jour", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Composant d'entrée stylisé
  const LabeledSecureInput = ({ label, value, onChangeText, placeholder }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        <Text style={{ color: COLORS.danger }}> *</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholderText}
        secureTextEntry={true}
        editable={!loading}
      />
    </View>
  );


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={36} color={COLORS.primary} style={{ marginBottom: 10 }}/>
        <Text style={styles.headerTitle}>Changer votre Mot de Passe</Text>
        <Text style={styles.headerSubtitle}>
          Pour des raisons de sécurité, veuillez confirmer votre ancien mot de passe.
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Ancien Mot de Passe */}
        <LabeledSecureInput
          label="Ancien Mot de Passe"
          value={ancienMotDePasse}
          onChangeText={setAncienMotDePasse}
          placeholder="Entrez votre mot de passe actuel"
        />

        {/* Nouveau Mot de Passe */}
        <LabeledSecureInput
          label="Nouveau Mot de Passe (min. 6 caractères)"
          value={nouveauMotDePasse}
          onChangeText={setNouveauMotDePasse}
          placeholder="Créez un nouveau mot de passe"
        />

        {/* Confirmation du Nouveau Mot de Passe */}
        <LabeledSecureInput
          label="Confirmer le Nouveau Mot de Passe"
          value={confirmerMotDePasse}
          onChangeText={setConfirmerMotDePasse}
          placeholder="Confirmez le nouveau mot de passe"
        />

        {/* Bouton de Sauvegarde */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.card} />
          ) : (
            <Text style={styles.saveButtonText}>
              Confirmer le changement
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: "700",
  },
});