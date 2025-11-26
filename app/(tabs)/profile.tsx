import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle // Importez ViewStyle pour le typage des fonctions de style
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";

// === COULEURS MODERNES ===
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

interface MenuOption {
  icon: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

// ===============================================
// 🛠️ FONCTION DE STYLE CORRIGÉE (HORS StyleSheet.create)
// ===============================================

// Cette fonction génère l'objet de style 'infoRow' de manière dynamique.
// C'est la correction des erreurs de type (2349, 2769).
const getInfoRowStyle = (isLocation: boolean | undefined): ViewStyle => ({
    flexDirection: "row",
    alignItems: isLocation ? "flex-start" : "center",
    paddingVertical: 15,
});


// Composant pour une ligne d'information
const InfoRow = ({ icon, label, value, placeholder, isLocation }: { icon: string, label: string, value: string | undefined, placeholder: string, isLocation?: boolean }) => (
    // ⭐ APPLICATION DE LA CORRECTION ICI
    <View style={getInfoRowStyle(isLocation)}>
        <Ionicons
            name={icon as any}
            size={20}
            color={COLORS.secondary} 
            style={{ marginRight: 12 }}
        />
        <View style={staticStyles.infoContent}>
            <Text style={staticStyles.infoLabel}>{label}</Text>
            <Text style={staticStyles.infoValue}>
                {value || placeholder}
            </Text>
        </View>
    </View>
);

// Composant pour une option de menu
const MenuOptionItem = ({ option, isLast }: { option: MenuOption, isLast: boolean }) => (
    <TouchableOpacity
        style={[
            staticStyles.menuOption,
            isLast && { borderBottomWidth: 0 },
            option.isDanger && { backgroundColor: '#FFECEC' } 
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
                staticStyles.menuLabel,
                option.isDanger && staticStyles.menuLabelDanger,
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
);

// === COMPOSANT PRINCIPAL ===
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
  
  const formatRole = (role: string | undefined): string => {
    if (!role) return "Invité";
    switch (role) {
      case "client":
        return "Client Fidèle";
      case "cuisinier":
        return "Cuisinier Partenaire";
      case "livreur":
        return "Livreur Express";
      case "admin":
        return "Administrateur Système";
      default:
        return role;
    }
  };

  const securityOptions: MenuOption[] = [
    {
      icon: "person-circle-outline", 
      label: "Modifier le profil",
      onPress: () => router.push('/profile/EditProfileScreen'), 
    },
    {
      icon: "lock-closed-outline",
      label: "Changer le mot de passe",
      onPress: () => router.push('/profile/ChangePasswordScreen'),
    },
  ];

  const appOptions: MenuOption[] = [
    {
      icon: "settings-outline",
      label: "Paramètres de l'application",
      onPress: () => Alert.alert("Info", "Vers les paramètres"),
    },
    {
      icon: "help-circle-outline",
      label: "Aide & Support",
      onPress: () => Alert.alert("Info", "Vers l'aide et le support"),
    },
  ];

  const dangerOptions: MenuOption[] = [
    {
        icon: "log-out-outline",
        label: "Déconnexion",
        onPress: handleLogout,
        isDanger: true,
    },
  ];

  // ===============================================
  // MENU SPÉCIFIQUE AUX RÔLES DE GESTION
  // ===============================================
  const managementOptions: MenuOption[] = [
    {
        icon: "restaurant-outline",
        label: "Tableau de Bord Cuisinier",
        onPress: () => router.push('/cooker/CookerDashboardScreen'),
    },
    {
        icon: "people-circle-outline",
        label: "Gestion des Utilisateurs",
        onPress: () => Alert.alert("Admin", "Navigation vers la gestion des utilisateurs."),
    },
    {
        icon: "map-outline",
        label: "Mes Livraisons Actives",
        onPress: () => Alert.alert("Livraison", "Navigation vers la liste des livraisons."),
    },
  ];

  const isClient = user?.role === 'client';
  const isCooker = user?.role === 'cuisinier';
  const isAdmin = user?.role === 'admin';
  const isDeliveryPerson = user?.role === 'livreur';
  const isManagementRole = isCooker || isAdmin || isDeliveryPerson;


  return (
    <ScrollView 
        style={staticStyles.container} 
        contentContainerStyle={staticStyles.scrollContent}
    >
      {/* HEADER PROFIL (Commun) */}
      <View style={staticStyles.header}>
        <View style={staticStyles.avatarContainer}>
          <Ionicons name="person-circle" size={90} color={COLORS.primary} />
        </View>

        <Text style={staticStyles.userName}>
          {user?.prenom} {user?.nom}
        </Text>
        <View style={staticStyles.roleTag}>
            <Feather name="shield" size={14} color={COLORS.card} style={{ marginRight: 5 }} />
            <Text style={staticStyles.roleTagText}>
                {formatRole(user?.role)}
            </Text>
        </View>
      </View>

      {/* INFO CARD (Commun) */}
      <View style={staticStyles.sectionContainer}>
        <Text style={staticStyles.sectionTitle}>Mes Coordonnées</Text>
        <View style={staticStyles.infoCard}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email} placeholder="Non fourni" />
          <View style={staticStyles.divider} />
          <InfoRow icon="call-outline" label="Téléphone" value={user?.telephone} placeholder="Non fourni" />
          <View style={staticStyles.divider} />
          {/* L'appel à InfoRow utilise maintenant la fonction de style corrigée */}
          <InfoRow icon="location-outline" label="Adresse de livraison" value={user?.adresse} placeholder="Non fourni" isLocation={true}/>
        </View>
      </View>
      
      {/* SECTION 1 : LOGIQUE SPÉCIFIQUE AU RÔLE */}
      
      {/* Affiché uniquement pour les Clients */}
      {isClient && (
          <View style={staticStyles.sectionContainer}>
              <Text style={staticStyles.sectionTitle}>Vos Commandes</Text>
              <View style={staticStyles.menuContainer}>
                  <MenuOptionItem 
                    option={{ icon: "receipt-outline", label: "Voir mon historique de commandes", onPress: () => Alert.alert("Commandes", "Navigation vers l'historique") }}
                    isLast={false}
                  />
                  <MenuOptionItem 
                    option={{ icon: "star-outline", label: "Mes avis et évaluations", onPress: () => Alert.alert("Avis", "Navigation vers les avis") }}
                    isLast={true}
                  />
              </View>
          </View>
      )}

      {/* Affiché pour les Cuisiniers, Livreurs et Admins */}
      {isManagementRole && (
        <View style={staticStyles.sectionContainer}>
          <Text style={staticStyles.sectionTitle}>Espace de Gestion</Text>
          <View style={staticStyles.menuContainer}>
            {isCooker && <MenuOptionItem option={managementOptions[0]} isLast={false} />}
            {isAdmin && <MenuOptionItem option={managementOptions[1]} isLast={false} />}
            {isDeliveryPerson && <MenuOptionItem option={managementOptions[2]} isLast={!isAdmin && !isCooker} />}
          </View>
        </View>
      )}

      {/* SECTION 2 : CONFIGURATION DU COMPTE (Commun) */}
      
      <View style={staticStyles.sectionContainer}>
        <Text style={staticStyles.sectionTitle}>Compte & Sécurité</Text>
        <View style={staticStyles.menuContainer}>
            {securityOptions.map((option, index) => (
                <MenuOptionItem 
                    key={`sec-${index}`}
                    option={option}
                    isLast={index === securityOptions.length - 1}
                />
            ))}
        </View>
      </View>

      <View style={staticStyles.sectionContainer}>
        <Text style={staticStyles.sectionTitle}>Général</Text>
        <View style={staticStyles.menuContainer}>
            {appOptions.map((option, index) => (
                <MenuOptionItem 
                    key={`app-${index}`}
                    option={option}
                    isLast={index === appOptions.length - 1}
                />
            ))}
        </View>
      </View>

      <View style={staticStyles.sectionContainer}>
        <View style={staticStyles.menuContainer}>
            {dangerOptions.map((option, index) => (
                <MenuOptionItem 
                    key={`danger-${index}`}
                    option={option}
                    isLast={true}
                />
            ))}
        </View>
      </View>

      {/* FOOTER */}
      <View style={staticStyles.footer}>
        <Text style={staticStyles.versionText}>MealApp v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// ===============================================
// DÉFINITION DES STYLES STATIQUES
// ===============================================

// Tous les styles qui ne sont pas des fonctions sont définis ici.
const staticStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? 30 : 0,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarContainer: {
        marginBottom: 10,
    },
    userName: {
        fontSize: 26,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 8,
    },
    roleTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    roleTagText: {
        fontSize: 14,
        color: COLORS.card,
        fontWeight: "600",
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.subtitle,
        marginBottom: 10,
    },
    infoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.subtitle,
        fontWeight: "600",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: -15,
    },
    menuContainer: {
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: COLORS.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuLabel: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: "600",
    },
    menuLabelDanger: {
        color: COLORS.danger,
        fontWeight: "700",
    },
    footer: {
        alignItems: "center",
        paddingVertical: 20,
        marginTop: 20,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.placeholderText,
    },
});