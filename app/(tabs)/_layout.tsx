import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// === Thème Simulé ===
const MODERN_COLORS = {
  tint: '#FF7043',       // Orange Chaud (Couleur active)
  inactive: '#757575',   // Gris neutre (Couleur inactive)
  background: '#FFFFFF', // Fond de la barre
};
const getThemeColors = () => MODERN_COLORS;
// ===================================

export default function TabLayout() {
  const colors = getThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: false,
        tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            elevation: 5, 
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 5,
            paddingVertical: Platform.OS === 'ios' ? 0 : 5,
            height: Platform.OS === 'ios' ? 90 : 60,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
        }
      }}>

      {/* 1. EXPLORER / ACCUEIL (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
                size={24} 
                name={focused ? "compass" : "compass-outline"} 
                color={color} 
            />
          ),
        }}
      />
      
      {/* 2. PANIER (cart.tsx) - Remplace l'ancien "meals" */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
                size={24} 
                name={focused ? "cart" : "cart-outline"} 
                color={color} 
            />
          ),
        }}
      />

      {/* 3. COMMANDES (orders.tsx) - Nouveau Tab pour le suivi */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
                size={24} 
                name={focused ? "receipt" : "receipt-outline"} 
                color={color} 
            />
          ),
        }}
      />
      
      {/* 4. PROFIL (profile.tsx) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
                size={24} 
                name={focused ? "person-circle" : "person-circle-outline"} 
                color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}