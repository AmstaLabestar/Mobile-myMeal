import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#007AFF",
  secondary: "#FF6347",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#1F2937",
  placeholderText: "#9CA3AF",
  border: "#E5E7EB",
  danger: "#DC2626",
};

interface MenuOption {
  icon: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          onPress: () => logout(),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const menuOptions: MenuOption[] = [
    {
      icon: "person-outline",
      label: "Modifier le profil",
      onPress: () => Alert.alert("Info", "Fonctionnalité à venir"),
    },
    {
      icon: "settings-outline",
      label: "Paramètres",
      onPress: () => Alert.alert("Info", "Fonctionnalité à venir"),
    },
    {
      icon: "help-circle-outline",
      label: "Aide & Support",
      onPress: () => Alert.alert("Info", "Fonctionnalité à venir"),
    },
    {
      icon: "log-out-outline",
      label: "Déconnexion",
      onPress: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER PROFIL */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.userName}>
          {user?.prenom} {user?.nom}
        </Text>
        <Text style={styles.userRole}>
          {user?.role === "client"
            ? "Client"
            : user?.role === "cooker"
            ? "Cuisinier"
            : user?.role}
        </Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={COLORS.primary}
            style={{ marginRight: 12 }}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {user?.email || "Non fourni"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons
            name="call-outline"
            size={20}
            color={COLORS.primary}
            style={{ marginRight: 12 }}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>
              {user?.telephone || "Non fourni"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={20}
            color={COLORS.primary}
            style={{ marginRight: 12 }}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Adresse</Text>
            <Text style={styles.infoValue}>
              {user?.adresse || "Non fourni"}
            </Text>
          </View>
        </View>
      </View>

      {/* MENU OPTIONS */}
      <View style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuOption,
              option.isDanger && styles.menuOptionDanger,
            ]}
            onPress={option.onPress}
          >
            <Ionicons
              name={option.icon as any}
              size={22}
              color={option.isDanger ? COLORS.danger : COLORS.primary}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[
                styles.menuLabel,
                option.isDanger && styles.menuLabelDanger,
              ]}
            >
              {option.label}
            </Text>
            <View style={{ flex: 1 }} />
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={option.isDanger ? COLORS.danger : COLORS.placeholderText}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* VERSION */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>MealApp v1.0.0</Text>
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
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.placeholderText,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.placeholderText,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  menuContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuOptionDanger: {
    borderBottomColor: COLORS.border,
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
  },
  menuLabelDanger: {
    color: COLORS.danger,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.placeholderText,
  },
});