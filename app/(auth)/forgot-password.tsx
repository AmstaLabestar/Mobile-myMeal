import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../src/api/api";

const COLORS = {
  primary: "#007AFF",
  background: "#F0F4F8",
  card: "#FFFFFF",
  text: "#1F2937",
  placeholderText: "#9CA3AF",
  border: "#E5E7EB",
  link: "#007AFF",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    if (!email) {
      setError("Veuillez entrer votre email.");
      return;
    }

    setLoading(true);
    try {
      // Adapte l'endpoint selon ton API
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      Alert.alert(
        "Succès",
        "Un email de réinitialisation a été envoyé à votre adresse."
      );
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Erreur lors de la réinitialisation.";
      setError(errorMessage);
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* BACK BUTTON */}
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.backButton} disabled={loading}>
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.backText}>Retour</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.header}>
              <Text style={styles.title}>Mot de passe oublié</Text>
              <Text style={styles.subtitle}>
                Entrez votre email pour recevoir un lien de réinitialisation
              </Text>
            </View>

            <View style={styles.formContainer}>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successBox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={40}
                    color="#10B981"
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.successText}>Email envoyé !</Text>
                  <Text style={styles.successSubtext}>
                    Vérifiez votre boîte de réception pour les instructions.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Votre Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={COLORS.placeholderText}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="votre.email@example.com"
                        placeholderTextColor={COLORS.placeholderText}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        Envoyer le lien
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 5,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.placeholderText,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formContainer: {},
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 20,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  successText: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },
  successSubtext: {
    color: "#059669",
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
  },
});