import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// === Thème Simulé ===
const MODERN_COLORS = {
  tint: '#FF7043',       // Orange Chaud (Couleur active)
  inactive: '#757575',   // Gris neutre (Couleur inactive)
  background: '#FFFFFF', // Fond de la barre
};
const getThemeColors = () => MODERN_COLORS;
// ===================================

export default function TabLayout() {
  const colors = getThemeColors();

  // Valeurs recommandées (sans utiliser useSafeAreaInsets directement dans Tabs.Screen)
  const TAB_BAR_HEIGHT = 80; // Augmenté de 68 à 80
  const PADDING_BOTTOM = Platform.OS === 'android' ? 14 : 35; // Augmenté pour l'espace de geste

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          // NOUVELLE HAUTEUR
          height: TAB_BAR_HEIGHT, 
          // NOUVEAU PADDING : éloigne l'étiquette et l'icône du bas.
          paddingBottom: PADDING_BOTTOM,
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          // Réajustement de la marge inférieure pour compenser le grand padding
          marginBottom: 0, 
        },
      }}
    >
      {/* 1. EXPLORER / ACCUEIL */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "compass" : "compass-outline"} color={color} />
          ),
        }}
      />

      {/* 2. PANIER */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "cart" : "cart-outline"} color={color} />
          ),
        }}
      />

      {/* 3. COMMANDES */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "receipt" : "receipt-outline"} color={color} />
          ),
        }}
      />

      {/* 4. FAVORIS (optionnel) */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "heart" : "heart-outline"} color={color} />
          ),
        }}
      />

      {/* 5. PROFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "person-circle" : "person-circle-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}