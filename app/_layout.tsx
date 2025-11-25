import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { router, Stack, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * Composant NavigationRouter
 * Gère la navigation basée sur l'état d'authentification
 */
function NavigationRouter() {
  const { user, isLoading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    if (isLoading) {
      return;
    }

    if (user) {
      // ✅ Utilisateur authentifié → Aller aux tabs
      router.replace('/');
    } else {
      // ❌ Pas d'utilisateur → Aller au login
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, navigationState?.key]);

  // Écran de chargement
  if (isLoading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

/**
 * Root Layout - Point d'entrée principal
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationRouter />
    </AuthProvider>
  );
}





