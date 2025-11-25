// app/_layout.tsx
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { router, Stack, useRootNavigationState, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

/**
 * Composant NavigationRouter
 * Gère la navigation basée sur l'état d'authentification
 */
function NavigationRouter() {
  const { user, isLoading } = useAuth();
  const segments = useSegments(); // Permet de lire le segment d'URL actuel
  const navigationState = useRootNavigationState();

  // Détermine si l'utilisateur est sur une route du groupe auth
  const isAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    // 1. Attendre que la navigation soit prête
    if (!navigationState?.key) return;

    // 2. Ne rien faire pendant le chargement initial
    if (isLoading) return;

    // Cas A: Utilisateur connecté
    if (user) {
      if (isAuthGroup) {
        // Rediriger vers l'écran principal
        router.replace('/');
      }
    } else {
      // Cas B: Utilisateur non connecté
      if (!isAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading, navigationState?.key, isAuthGroup]);

  // Écran de chargement initial
  if (isLoading || !navigationState?.key) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F9F9F9',
        }}
      >
        <ActivityIndicator size="large" color="#FF7043" />
        <Text style={{ marginTop: 10, color: '#757575' }}>
          Chargement de l&apos;application...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Groupe Auth */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Groupe Tabs / Application */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Ajoutez d'autres routes de niveau supérieur si nécessaire */}
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
