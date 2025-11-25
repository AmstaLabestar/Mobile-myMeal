import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

// Interface pour les données du formulaire
interface ProfileUpdateData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export default function EditProfileScreen() {
  const { user, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialisation des états du formulaire avec les données actuelles de l'utilisateur
  const [formData, setFormData] = useState<ProfileUpdateData>({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
  });

  const handleChange = (key: keyof ProfileUpdateData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  // 🚀 LOGIQUE DE SAUVEGARDE DU PROFIL
  const handleSaveProfile = async () => {
    if (!user?._id) {
      Alert.alert("Erreur", "ID utilisateur manquant pour la mise à jour.");
      return;
    }
    setLoading(true);

    // Préparer les données pour l'API (filtrer pour n'envoyer que ce qui a changé)
    const updates = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse,
    };

    try {
      // 1. Appel au endpoint updateUser du backend
      const response = await api.put(`/users/${user._id}`, updates);

      // 2. Mise à jour du contexte local (important pour rafraîchir ProfileScreen)
      // L'objet user de la réponse contient les nouvelles données.
      const updatedUser = response.data.data.user;
      updateUserContext(updatedUser);

      Alert.alert("Succès", "Votre profil a été mis à jour avec succès !");
      router.back(); // Retour à l'écran de profil
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de la mise à jour du profil.";
      Alert.alert("Erreur de mise à jour", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Composant d'entrée stylisé pour cet écran
  const LabeledInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', isRequired = false }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {isRequired && <Text style={{ color: COLORS.danger }}> *</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholderText}
        keyboardType={keyboardType}
        editable={!loading}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modifier mon Profil</Text>
        <Text style={styles.headerSubtitle}>
          Mettez à jour vos informations personnelles et de contact.
        </Text>
      </View>

      <View style={styles.formContainer}>
        {/* Nom et Prénom */}
        <LabeledInput
          label="Prénom"
          value={formData.prenom}
          onChangeText={(text: string) => handleChange("prenom", text)}
          placeholder="Votre prénom"
          isRequired={true}
        />
        <LabeledInput
          label="Nom"
          value={formData.nom}
          onChangeText={(text: string) => handleChange("nom", text)}
          placeholder="Votre nom de famille"
          isRequired={true}
        />

        {/* Coordonnées */}
        <LabeledInput
          label="Email"
          value={formData.email}
          onChangeText={(text: string) => handleChange("email", text)}
          placeholder="exemple@domaine.com"
          keyboardType="email-address"
          isRequired={true}
        />
        <LabeledInput
          label="Téléphone (8 chiffres)"
          value={formData.telephone}
          onChangeText={(text: string) => handleChange("telephone", text)}
          placeholder="ex: 60123456"
          keyboardType="numeric"
          isRequired={true}
        />

        {/* Adresse */}
        <LabeledInput
          label="Adresse (Rue, Ville, Code Postal)"
          value={formData.adresse}
          onChangeText={(text: string) => handleChange("adresse", text)}
          placeholder="Ex: 10 Rue de la Liberté, Ouagadougou"
        />

        {/* Bouton de Sauvegarde */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.card} />
          ) : (
            <Text style={styles.saveButtonText}>
              Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Lien vers le changement de mot de passe */}
      <TouchableOpacity 
        style={styles.passwordLink}
        onPress={() => router.push('./ChangePasswordScreen')}

        disabled={loading}
      >
        <Ionicons name="lock-closed-outline" size={18} color={COLORS.secondary} style={{ marginRight: 8 }} />
        <Text style={styles.passwordLinkText}>Changer le mot de passe</Text>
      </TouchableOpacity>
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
  passwordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#E3F2FD', // Fond bleu très clair pour se démarquer
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 20,
  },
  passwordLinkText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  }
});